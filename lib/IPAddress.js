'use strict';

var ipaddr = require('ip-address');

exports.parseIPv4 = function parseIPv4(ip) {
    var v4Address = new ipaddr.Address4(ip);
    if (!v4Address.isValid()) {
        throw new Error("Invalid IPv4 address " + ip);
    }
    return v4Address.parsedAddress;
};

exports.parseIPv6 = function parseIPv6(ip) {
    var v6Address = new ipaddr.Address6(ip);
    if (!v6Address.isValid()) {
        throw new Error("Invalid IPv6 address " + ip);
    }
    return v6Address.parsedAddress;
};
