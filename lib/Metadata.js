'use strict';

module.exports = Metadata;

function Metadata(metadata) {
    this.binaryFormatMajorVersion = metadata.binary_format_major_version;
    this.binaryFormatMinorVersion = metadata.binary_format_minor_version;
    this.buildEpoch               = new Date(metadata.build_epoch*1000);
    this.databaseType             = metadata.database_type;
    this.languages                = metadata.languages;
    this.description              = metadata.description;
    this.ipVersion                = metadata.ip_version;
    this.nodeCount                = metadata.node_count;
    this.recordSize               = metadata.record_size;
    this.nodeByteSize             = this.recordSize / 4;
    this.searchTreeSize           = this.nodeCount * this.nodeByteSize;
}

Metadata.prototype.getBinaryFormatMajorVersion = function getBinaryFormatMajorVersion() {
    return this.binaryFormatMajorVersion;
};

Metadata.prototype.getBinaryFormatMinorVersion = function getBinaryFormatMinorVersion() {
    return this.binaryFormatMinorVersion;
};

Metadata.prototype.getBuildEpoch = function getBuildEpoch() {
    return this.buildEpoch;
};

Metadata.prototype.getDatabaseType = function getDatabaseType() {
    return this.databaseType;
};

Metadata.prototype.getLanguages = function getLanguages() {
    return this.languages;
};

Metadata.prototype.getDescription = function getDescription() {
    return this.description;
};

Metadata.prototype.getIpVersion = function getIpVersion() {
    return this.ipVersion;
};

Metadata.prototype.getNodeCount = function getNodeCount() {
    return this.nodeCount;
};

Metadata.prototype.getRecordSize = function getRecordSize() {
    return this.recordSize;
};

Metadata.prototype.getNodeByteSize = function getNodeByteSize() {
    return this.nodeByteSize;
};

Metadata.prototype.getSearchTreeSize = function getSearchTreeSize() {
    return this.searchTreeSize;
};