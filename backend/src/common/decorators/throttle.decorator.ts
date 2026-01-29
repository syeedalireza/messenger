/**
 * @fileoverview Custom throttle decorators
 * @description Provides custom rate limiting decorators for specific endpoints
 */

import { SetMetadata } from '@nestjs/common';

export const THROTTLE_LIMIT = 'throttle_limit';
export const THROTTLE_TTL = 'throttle_ttl';

/**
 * Custom throttle decorator for sensitive endpoints
 * @param limit - Maximum number of requests
 * @param ttl - Time window in milliseconds
 */
export const Throttle = (limit: number, ttl: number) => {
  return SetMetadata(THROTTLE_LIMIT, { limit, ttl });
};

/**
 * Strict throttle for auth endpoints (5 requests per minute)
 */
export const StrictThrottle = () => Throttle(5, 60000);

/**
 * Moderate throttle for API endpoints (30 requests per minute)
 */
export const ModerateThrottle = () => Throttle(30, 60000);
