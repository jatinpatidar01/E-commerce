const {
  Body,
  BadRequestException,
  Controller,
  Post,
  Res,
} = require('@nestjs/common');

const { AuthService } = require('./auth.service');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  // =========================
  // REGISTER
  // =========================
  register(body) {
    const { name, email, password } = body;

    if (!name || !email || !password) {
      throw new BadRequestException(
        'Name, email and password are required',
      );
    }

    return this.authService.register(body);
  }

  // =========================
  // LOGIN
  // =========================
  login(body) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException(
        'Email and password are required',
      );
    }

    return this.authService.login(body);
  }

  // =========================
  // REFRESH TOKEN
  // =========================
  refresh(body) {
    const { refreshToken } = body;

    if (!refreshToken) {
      throw new BadRequestException(
        'Refresh token is required',
      );
    }

    return this.authService.refresh(refreshToken);
  }

  // =========================
  // LOGOUT
  // =========================
  logout(res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return {
      message: 'Logout successful',
    };
  }
}

// =========================
// CONTROLLER DECORATOR
// =========================

Controller('auth')(AuthController);

// =========================
// POST /auth/register
// =========================

Post('register')(
  AuthController.prototype,
  'register',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'register',
  ),
);

Body()(
  AuthController.prototype,
  'register',
  0,
);

// =========================
// POST /auth/login
// =========================

Post('login')(
  AuthController.prototype,
  'login',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'login',
  ),
);

Body()(
  AuthController.prototype,
  'login',
  0,
);

// =========================
// POST /auth/refresh
// =========================

Post('refresh')(
  AuthController.prototype,
  'refresh',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'refresh',
  ),
);

Body()(
  AuthController.prototype,
  'refresh',
  0,
);

// =========================
// POST /auth/logout
// =========================

Post('logout')(
  AuthController.prototype,
  'logout',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'logout',
  ),
);

Res()(
  AuthController.prototype,
  'logout',
  0,
);

// =========================
// DEPENDENCY INJECTION
// =========================

Reflect.defineMetadata(
  'design:paramtypes',
  [AuthService],
  AuthController,
);

module.exports = {
  AuthController,
};