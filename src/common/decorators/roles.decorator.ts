import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Sets required roles for a route. Used with RolesGuard.
 * @param roles - List of allowed user roles
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
