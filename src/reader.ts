import { OpenOpts } from '.';
import Decoder from './decoder';
import ipUtil from './ip';
import { Metadata, parseMetadata } from './metadata';
import { Response } from './reader/response';
import walker, { Walker } from './reader/walker';

const DATA_SECTION_SEPARATOR_SIZE = 16;

export default class Reader<T extends Response> {
  public metadata: Metadata;
  private decoder: Decoder;
  private db: Buffer;
  private ipv4StartBit: number;
  private ipv4StartNodeNumber: number;
  private walker: Walker;

  constructor(db: Buffer, opts?: OpenOpts) {
    opts = opts || {};

    this.db = db;
    this.metadata = parseMetadata(this.db);
    this.decoder = new Decoder(
      this.db,
      this.metadata.searchTreeSize + DATA_SECTION_SEPARATOR_SIZE,
      opts
    );
    this.walker = walker(this.db, this.metadata.recordSize);
    [this.ipv4StartBit, this.ipv4StartNodeNumber] = this.ipv4Start();
  }

  public load(db: Buffer, opts: object) {
    this.db = db;
    this.metadata = parseMetadata(this.db);
    this.decoder = new Decoder(
      this.db,
      this.metadata.searchTreeSize + DATA_SECTION_SEPARATOR_SIZE,
      opts
    );
    this.walker = walker(this.db, this.metadata.recordSize);
    [this.ipv4StartBit, this.ipv4StartNodeNumber] = this.ipv4Start();
  }

  public get(ipAddress: string): T | null {
    const pointer = this.findAddressInTree(ipAddress);
    return pointer ? this.resolveDataPointer(pointer) : null;
  }

  public findAddressInTree(ipAddress: string): number | null {
    const rawAddress = ipUtil.parse(ipAddress);
    const nodeCount = this.metadata.nodeCount;

    // Binary search tree consists of certain (`nodeCount`) number of nodes. Tree
    // depth depends on the ip version, it's 32 for IPv4 and 128 for IPv6. Each
    // tree node has the same fixed length and usually 6-8 bytes. It consists
    // of two records, left and right:
    // |         node        |
    // | 0x000000 | 0x000000 |
    let bit;
    let nodeNumber = 0;
    let offset;

    let ipStartBit = 0;
    // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
    // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
    // Which means they're padded with zeros.
    if (rawAddress.length === 4) {
      ipStartBit = this.ipv4StartBit;
      nodeNumber = this.ipv4StartNodeNumber;
    }

    // Record value can point to one of three things:
    // 1. Another node in the tree (most common case)
    // 2. Data section address with relevant information (less common case)
    // 3. Point to the value of `nodeCount`, which means IP address is unknown
    for (let i = ipStartBit; i < this.metadata.treeDepth && nodeNumber < nodeCount; i++) {
      bit = ipUtil.bitAt(rawAddress, i - ipStartBit);
      offset = nodeNumber * this.metadata.nodeByteSize;

      nodeNumber = bit ? this.walker.right(offset) : this.walker.left(offset);
    }

    if (nodeNumber > nodeCount) {
      return nodeNumber;
    }
    return null;
  }

  public resolveDataPointer(pointer: number): any {
    // In order to determine where in the file this offset really points to, we also
    // need to know where the data section starts. This can be calculated by
    // determining the size of the search tree in bytes and then adding an additional
    // 16 bytes for the data section separator.
    // So the final formula to determine the offset in the file is:
    //     $offset_in_file = ( $record_value - $node_count )
    //                       + $search_tree_size_in_bytes
    const resolved =
      pointer - this.metadata.nodeCount + this.metadata.searchTreeSize;
    return this.decoder.decodeFast(resolved).value;
  }

  private ipv4Start(): [number, number] {
    if (this.metadata.ipVersion === 4) {
      return [0, 0];
    }

    const nodeCount = this.metadata.nodeCount;

    let pointer = 0;
    let i = 0;

    for (; i < 96 && pointer < nodeCount; i++) {
      const offset = pointer * this.metadata.nodeByteSize;
      pointer = this.walker.left(offset);
    }
    return [i, pointer];
  }

}
