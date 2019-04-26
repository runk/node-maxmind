const concat2 = (a: number, b: number): number => {
  return (a << 8) | b;
};

const concat3 = (a: number, b: number, c: number): number => {
  return (a << 16) | (b << 8) | c;
};

const concat4 = (a: number, b: number, c: number, d: number): number => {
  return (a << 24) | (b << 16) | (c << 8) | d;
};

const legacyErrorMessage = `Maxmind v2 module has changed API.\n\
Upgrade instructions can be found here: \
https://github.com/runk/node-maxmind/wiki/Migration-guide\n\
If you want to use legacy libary then explicitly install maxmind@1`;

export default {
  concat2,
  concat3,
  concat4,
  legacyErrorMessage,
};
