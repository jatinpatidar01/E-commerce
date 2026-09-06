const { Injectable, UnauthorizedException } = require('@nestjs/common');
const { AuthService } = require('../auth.service');

function extractToken(request) {
  const authHeader = request.headers?.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  if (request.cookies?.access_token) {
    return request.cookies.access_token;
  }

  if (request.headers?.cookie) {
    const cookies = request.headers.cookie.split(';');
    for (const cookie of cookies) {
      const [key, ...rest] = cookie.trim().split('=');
      if (key === 'access_token') {
        return decodeURIComponent(rest.join('='));
      }
    }
  }

  return null;
}

class JwtAuthGuard {
  constructor(authService) {
    this.authService = authService;
  }

  canActivate(context) {
    const request = context.switchToHttp().getRequest();

    // console.log('JWT GUARD RUNNING');

    const token = extractToken(request);

    console.log('TOKEN EXISTS:', !!token);

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const decoded = this.authService.validateAccessToken(token);

      // console.log('DECODED TOKEN:', decoded);

      request.user = {
        id:
          Number(decoded.sub) ||
          (decoded.sub !== undefined
            ? decoded.sub
            : Number(decoded.id) || decoded.id),
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      // console.log('REQUEST USER:', request.user);

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

Reflect.defineMetadata('design:paramtypes', [AuthService], JwtAuthGuard);
Injectable()(JwtAuthGuard);

module.exports = { JwtAuthGuard };
