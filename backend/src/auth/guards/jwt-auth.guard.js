const { Injectable, UnauthorizedException } = require('@nestjs/common');

class JwtAuthGuard {
  constructor(authService) {
    this.authService = authService;
  }

  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      request.user = this.authService.validateAccessToken(token);
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

Injectable()(JwtAuthGuard);

module.exports = { JwtAuthGuard };
