const { Module } = require('@nestjs/common');

class AdminModule {}

Module({})(AdminModule);

module.exports = { AdminModule };