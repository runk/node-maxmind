import utils from '../utils';

type NodeReader = (offset: number) => number;

export interface Walker {
  left: NodeReader;
  right: NodeReader;
}

const readNodeRight24 = (db: Buffer): NodeReader => (offset: number): number =>
  utils.concat3(db[offset + 3], db[offset + 4], db[offset + 5]);

const readNodeLeft24 = (db: Buffer): NodeReader => (offset: number): number =>
  utils.concat3(db[offset], db[offset + 1], db[offset + 2]);

const readNodeLeft28 = (db: Buffer): NodeReader => (offset: number): number =>
  utils.concat4(
    db[offset + 3] >> 4,
    db[offset],
    db[offset + 1],
    db[offset + 2]
  );

const readNodeRight28 = (db: Buffer): NodeReader => (offset: number): number =>
  utils.concat4(
    db[offset + 3] & 0x0f,
    db[offset + 4],
    db[offset + 5],
    db[offset + 6]
  );

const readNodeLeft32 = (db: Buffer): NodeReader => (offset: number): number =>
  db.readUInt32BE(offset, true);

const readNodeRight32 = (db: Buffer): NodeReader => (offset: number): number =>
  db.readUInt32BE(offset + 4, true);

export default (db: Buffer, recordSize: number): Walker => {
  switch (recordSize) {
    case 24:
      return { left: readNodeLeft24(db), right: readNodeRight24(db) };
    case 28:
      return { left: readNodeLeft28(db), right: readNodeRight28(db) };
    case 32:
      return { left: readNodeLeft32(db), right: readNodeRight32(db) };
  }
  throw new Error('Unsupported record size');
};
