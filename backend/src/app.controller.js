const { Controller, Get } = require('@nestjs/common');

class AppController {
  healthCheck() {
    return {
      status: 'ok',
      service: 'backend',
      message: 'Auth service is running',
    };
  }
}

Controller()(AppController);
Get()(AppController.prototype, 'healthCheck', Object.getOwnPropertyDescriptor(AppController.prototype, 'healthCheck'));

module.exports = { AppController };