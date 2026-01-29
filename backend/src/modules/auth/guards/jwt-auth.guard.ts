/**
 * @fileoverview JWT Auth Guard
 * @description Guard for protecting routes with JWT authentication
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Check if route can be activated
   * @param context - Execution context
   * @returns Boolean indicating if route can be activated
   */
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed (e.g., check for public routes)
    return super.canActivate(context);
  }
}
