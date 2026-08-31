const {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} = require('@nestjs/common');

const { AuthService } = require('./auth.service');
const { JwtAuthGuard } = require('./guards/jwt-auth.guard');

const isProduction = process.env.NODE_ENV === 'production';
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  ...(maxAge ? { maxAge } : {}),
});

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  // =========================

  // POST /auth/otp & GET /auth/otp
  // =========================

  getOtp(query, body) {
    // console.log("get otp function ")
    const email = query?.email || body?.email;

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.authService.getOtp({ email });
  }

 


  // =========================
  // REGISTER
  // POST /auth/register
  // =========================

  register(body) {
    const { name, email, password, role, otp } = body || {};

    if (!name || !email || !password || !role) {
      throw new BadRequestException(
        'Name, email, password and role are required',
      );
    }

    if (!otp) {
      throw new BadRequestException('OTP verification code is required');
    }

    return this.authService.register(body);
  }

  // =========================
  // LOGIN
  // POST /auth/login
  // =========================

  async login(body, res) {
    const { email, password } = body || {};

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const result = await this.authService.login(body);

    if (res && typeof res.cookie === 'function') {
      try {
        // Access Token Cookie (15 mins)
        res.cookie(
          'access_token',
          result.accessToken,
          getCookieOptions(15 * 60 * 1000),
        );

        // Refresh Token Cookie (7 days)
        res.cookie(
          'refresh_token',
          result.refreshToken,
          getCookieOptions(7 * 24 * 60 * 60 * 1000),
        );
      } catch (cookieErr) {
        console.error('Error setting cookies:', cookieErr);
      }
    }

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: result.tokenType,
      user: result.user,
    };
  }

  // =========================
  // REFRESH TOKEN
  // POST /auth/refresh
  // =========================

  async refresh(req, res, body) {
    const refreshToken =
      req?.cookies?.refresh_token ||
      body?.refreshToken ||
      req?.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const result = await this.authService.refresh(refreshToken);

    if (res && typeof res.cookie === 'function') {
      try {
        res.cookie(
          'access_token',
          result.accessToken,
          getCookieOptions(15 * 60 * 1000),
        );
        res.cookie(
          'refresh_token',
          result.refreshToken,
          getCookieOptions(7 * 24 * 60 * 60 * 1000),
        );
      } catch (cookieErr) {
        console.error('Error setting refresh cookies:', cookieErr);
      }
    }

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: result.tokenType,
      user: result.user,
    };
  }

  // =========================
  // GET CURRENT USER
  // GET /auth/me
  // =========================

  getMe(req) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return {
      user,
    };
  }

  // =========================
  // LOGOUT
  // POST /auth/logout
  // =========================

  logout(res) {
    if (res && typeof res.clearCookie === 'function') {
      try {
        res.clearCookie('access_token', getCookieOptions());
        res.clearCookie('refresh_token', getCookieOptions());
      } catch (e) {
        console.error('Error clearing cookies:', e);
      }
    }

    return {
      message: 'Logout successful',
    };
  }
}

// =========================
// CONTROLLER DECORATOR
// =========================

Controller('auth')(AuthController);

// POST /auth/otp
Post('otp')(
  AuthController.prototype,
  'getOtp',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'getOtp'),
);
Query()(AuthController.prototype, 'getOtp', 0);
Body()(AuthController.prototype, 'getOtp', 1);

// POST /auth/register
Post('register')(
  AuthController.prototype,
  'register',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'register'),
);
Body()(AuthController.prototype, 'register', 0);

// POST /auth/login
Post('login')(
  AuthController.prototype,
  'login',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'login'),
);
Body()(AuthController.prototype, 'login', 0);
Res({ passthrough: true })(AuthController.prototype, 'login', 1);

// POST /auth/refresh
Post('refresh')(
  AuthController.prototype,
  'refresh',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'refresh'),
);
Req()(AuthController.prototype, 'refresh', 0);
Res({ passthrough: true })(AuthController.prototype, 'refresh', 1);
Body()(AuthController.prototype, 'refresh', 2);

// GET /auth/me
Get('me')(
  AuthController.prototype,
  'getMe',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'getMe'),
);
UseGuards(JwtAuthGuard)(
  AuthController.prototype,
  'getMe',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'getMe'),
);
Req()(AuthController.prototype, 'getMe', 0);

// POST /auth/logout
Post('logout')(
  AuthController.prototype,
  'logout',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'logout'),
);
Res({ passthrough: true })(AuthController.prototype, 'logout', 0);

Reflect.defineMetadata('design:paramtypes', [AuthService], AuthController);

module.exports = {
  AuthController,
};
