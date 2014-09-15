assert = require('assert');

// function magic(buf, recLec)  {
//   x0 = x1 = 0;

//   // return {
//   //   x0: buf.readInt32LE(0, true),
//   //   x1: buf.readInt32LE(recLec, true)
//   // }

//   // return {
//   //   x0: buf.readInt32LE(0, true),
//   //   x1: buf.readInt32LE(recLec, true)
//   // }

//   for (var j = 0; j < recLec; j++) {
//     y = buf[0 * recLec + j];
//     console.log('0 j, y', j, '0x'+y.toString(16))
//     x0 += (y << (j * 8));

//     y = buf[1 * recLec + j];
//     console.log('1 j, y', j, '0x'+y.toString(16))
//     x1 += (y << (j * 8));
//   }
//   return {x0: x0, x1: x1}
// }


function magic(buf, recLec)  {
  x0 = x1 = 0;

  x0b = new Buffer([0, 0, 0, 0])
  x1b = new Buffer([0, 0, 0, 0])

  for (var j = 0; j < recLec; j++) {
    x0b.writeUInt8(buf[0 * recLec + j], j)
    x1b.writeUInt8(buf[1 * recLec + j], j)
  }

  return {
    x0: x0b.readInt32LE(0),
    x1: x1b.readInt32LE(0)
  }
  // console.log(x0b)
  // return {
  //   x0: buf.readInt32LE(0, true),
  //   x1: buf.readInt32LE(recLec, true)
  // }

  // return {
  //   x0: buf.readInt32LE(0, true),
  //   x1: buf.readInt32LE(recLec, true)
  // }

  for (var j = 0; j < recLec; j++) {
    y = buf[0 * recLec + j];
    console.log('0 j, y', j, '0x'+y.toString(16))
    x0 += (y << (j * 8));

    y = buf[1 * recLec + j];
    console.log('1 j, y', j, '0x'+y.toString(16))
    x1 += (y << (j * 8));
  }
  return {x0: x0, x1: x1}
}



describe('utils', function() {

  it('should return proper result', function() {
    var b = new Buffer([0xbf, 0x9e, 0x2b, 0x94, 0x9f, 0x2b])
    assert.deepEqual(magic(b, 3), {x0: 2858687, x1: 2858900});

    b = new Buffer([0x2, 0x0, 0x0, 0x3, 0x0, 0x0])
    assert.deepEqual(magic(b, 3), {x0: 2, x1: 3});

    b = new Buffer([0xbf, 0x9e, 0x2b, 0x1, 0x94, 0x9f, 0x2b, 0x2])
    assert.deepEqual(magic(b, 4), {x0: 19635903, x1: 36413332});

    b = new Buffer([0x2, 0x0, 0x0, 0x0, 0x3, 0x0, 0x0, 0x0])
    assert.deepEqual(magic(b, 4), {x0: 2, x1: 3});
  })

});
