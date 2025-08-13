// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[] | string>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const roles = Array.isArray(requiredRoles) ? requiredRoles : requiredRoles ? [requiredRoles] : [];
    if (roles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.rol || typeof user.rol !== 'string') return false;

    const role = user.rol.toLowerCase().trim();
    return roles.some(r => typeof r === 'string' && role === r.toLowerCase().trim());
  }
}