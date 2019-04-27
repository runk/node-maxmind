import utils from '../utils';

export const decodeString = (db: Buffer, offset: number, size: number) => {
  // @ts-ignore
  return db.utf8Slice(offset, offset + size);

  // A little slower:
  // return db.toString('utf8', offset, offset + size);
};

export const decodeBytes = (
  db: Buffer,
  offset: number,
  size: number
): Buffer => {
  return db.slice(offset, offset + size);
};

export const decodeBoolean = (size: number) => {
  return size !== 0;
};

export const decodeDouble = (db: Buffer, offset: number) => {
  return db.readDoubleBE(offset, true);
};

export const decodeFloat = (db: Buffer, offset: number) => {
  return db.readFloatBE(offset, true);
};

export const decodeInt32 = (db: Buffer, offset: number, size: number) => {
  if (size === 0) {
    return 0;
  }
  return db.readInt32BE(offset, true);
};

export const decodeUint = (db: Buffer, offset: number, size: number) => {
  switch (size) {
    case 0:
      return 0;
    case 1:
      return db[offset];
    case 2:
      return utils.concat2(db[offset + 0], db[offset + 1]);
    case 3:
      return utils.concat3(db[offset + 0], db[offset + 1], db[offset + 2]);
    case 4:
      return utils.concat4(
        db[offset + 0],
        db[offset + 1],
        db[offset + 2],
        db[offset + 3]
      );
      case 8:
      return decodeBigUint(db, offset, size);
    case 16:
      return decodeBigUint(db, offset, size);
  }
  return 0;
};

export const decodeBigUint = (db: Buffer, offset: number, size: number) => {
  const buffer = Buffer.alloc(size);
  db.copy(buffer, 0, offset, offset + size);

  let integer = BigInt(0);

  const numberOfLongs = size / 4;
  for (let i = 0; i < numberOfLongs; i++) {
    integer =
      integer * BigInt(4294967296) + BigInt(buffer.readUInt32BE(i << 2, true));
  }

  return integer.toString();
};
