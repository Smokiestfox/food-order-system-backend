import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Parameter decorator that extracts the current authenticated user from the request.
 * Optionally accepts a property name to return a specific field from the user object.
 *
 * @example
 * // Get entire user object
 * @CurrentUser() user: User
 *
 * @example
 * // Get specific field
 * @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? (user as Record<string, unknown>)[data] : user;
  },
);
