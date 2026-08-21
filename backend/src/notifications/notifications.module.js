const { Module } = require('@nestjs/common');

class NotificationsModule {}

Module({})(NotificationsModule);

module.exports = { NotificationsModule };