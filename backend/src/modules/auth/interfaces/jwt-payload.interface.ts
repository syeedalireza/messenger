/**
 * @fileoverview JWT Payload interface
 * @description Defines the structure of JWT token payload
 */

export interface JwtPayload {
  /** User ID (subject) */
  sub: string;
  /** Issued at timestamp (optional, auto-added by JWT) */
  iat?: number;
  /** Expiration timestamp (optional, auto-added by JWT) */
  exp?: number;
}
