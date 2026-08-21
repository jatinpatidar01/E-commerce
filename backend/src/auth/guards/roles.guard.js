const { Injectable, ForbiddenException } = require('@nestjs/common');

class RolesGuard {
	canActivate(context) {
		const request = context.switchToHttp().getRequest();
		const requiredRoles = Reflect.getMetadata('roles', context.getHandler()) || [];

		if (!requiredRoles.length) {
			return true;
		}

		const userRole = request.user?.role;

		if (!userRole || !requiredRoles.includes(userRole)) {
			throw new ForbiddenException('Insufficient role');
		}

		return true;
	}
}

Injectable()(RolesGuard);

module.exports = { RolesGuard };