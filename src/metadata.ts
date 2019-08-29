import assert from 'assert';
import Decoder from './decoder';
import utils from './utils';

const METADATA_START_MARKER = Buffer.from(
  'ABCDEF4D61784D696E642E636F6D',
  'hex'
);

export interface Metadata {
  readonly binaryFormatMajorVersion: number;
  readonly binaryFormatMinorVersion: number;
  readonly buildEpoch: Date;
  readonly databaseType: string;
  readonly languages: string[];
  readonly description: any;
  readonly ipVersion: number;
  readonly nodeCount: number;
  readonly recordSize: number;
  readonly nodeByteSize: number;
  readonly searchTreeSize: number;
  readonly treeDepth: number;
}

export const parseMetadata = (db: Buffer): Metadata => {
  const offset = findStart(db);
  const decoder = new Decoder(db, offset);
  const metadata = decoder.decode(offset).value;

  if (!metadata) {
    throw new Error(
      isLegacyFormat(db)
        ? utils.legacyErrorMessage
        : 'Cannot parse binary database'
    );
  }

  assert(
    [24, 28, 32].indexOf(metadata.record_size) > -1,
    'Unsupported record size'
  );

  return {
    binaryFormatMajorVersion: metadata.binary_format_major_version,
    binaryFormatMinorVersion: metadata.binary_format_minor_version,
    buildEpoch: new Date(metadata.build_epoch * 1000),
    databaseType: metadata.database_type,
    description: metadata.description,
    ipVersion: metadata.ip_version,
    languages: metadata.languages,
    nodeByteSize: metadata.record_size / 4,
    nodeCount: metadata.node_count,
    recordSize: metadata.record_size,
    searchTreeSize: (metadata.node_count * metadata.record_size) / 4,
    // Depth depends on the IP version, it's 32 for IPv4 and 128 for IPv6.
    treeDepth: Math.pow(2, metadata.ip_version + 1),
  };
};

const findStart = (db: Buffer): number => {
  let found = 0;
  let fsize = db.length - 1;
  const mlen = METADATA_START_MARKER.length - 1;

  while (found <= mlen && fsize-- > 0) {
    found += db[fsize] === METADATA_START_MARKER[mlen - found] ? 1 : -found;
  }
  return fsize + found;
};

export const isLegacyFormat = (db: Buffer): boolean => {
  const structureInfoMaxSize = 20;

  for (let i = 0; i < structureInfoMaxSize; i++) {
    const delim = db.slice(db.length - 3 - i, db.length - i);

    // Look for [0xff, 0xff, 0xff] metadata delimiter
    if (delim[0] === 255 && delim[1] === 255 && delim[2] === 255) {
      return true;
    }
  }

  return false;
};
