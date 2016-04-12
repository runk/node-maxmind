'use strict';

var IPAddress = require('./IPAddress');

module.exports = IPParser;

function IPParser(ip) {
    if (ip.indexOf(':') !== -1) {
        return IPParser.parseIPv6(ip);
    } else {
        return IPParser.parseIPv4(ip);
    }
}

IPParser.parseIPv4 = function parseIPv4(ip) {
    return ipv4Buffer(IPAddress.parseIPv4(ip));
};

IPParser.parseIPv6 = function parseIPv6(ip) {
    return ipv6Buffer(IPAddress.parseIPv6(ip));
};

function ipv4Buffer(groups) {
    var arr = new Buffer(4);
    arr.fill(0);
    groups.forEach(function part(nr, i) {
        arr[i] = parseInt(nr);
    });
    return arr;
}

function ipv6Buffer(groups) {
    var arr = new Buffer(16);
    arr.fill(0);
    groups.forEach(function part(hex, i) {
        if (hex == "") return;
        if (hex.length < 4) {
            hex = repeat('0', 4 - hex.length) + hex;
        }
        arr.write(hex, i * 2, 'hex');
    });
    return arr;
}

function repeat(c, l) {
    var str = "", i = 0;
    while (i++ < l)str += c;
    return str;
}
