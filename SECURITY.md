# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in this project, please send an email to the project maintainer with:

- **Type of vulnerability** (e.g., XSS, CSRF, SQL Injection, etc.)
- **Location** (file path, line number, affected component)
- **Steps to reproduce** the vulnerability
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

We will respond within 48 hours and work with you to address the issue.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Measures Implemented

### Authentication & Authorization

#### JWT Tokens
- ✅ Secure JWT secret (minimum 32 characters)
- ✅ Token expiration (7 days for access, 30 days for refresh)
- ✅ Refresh token rotation
- ✅ Token revocation on logout
- ✅ Secure token storage (HTTP-only cookies recommended)

#### Password Security
- ✅ bcrypt hashing (salt rounds: 10)
- ✅ Minimum password requirements (8 characters, complexity)
- ✅ Password validation on input
- ✅ No password storage in logs
- ✅ Password reset via secure token

#### Two-Factor Authentication
- ✅ TOTP-based 2FA
- ✅ QR code generation for authenticator apps
- ✅ Backup codes for account recovery
- ✅ Rate limiting on 2FA attempts

#### OAuth Security
- ✅ State parameter validation (CSRF protection)
- ✅ Secure callback URL validation
- ✅ Token exchange over HTTPS
- ✅ Minimal scope requests

### API Security

#### Input Validation
- ✅ DTO validation with class-validator
- ✅ Request payload size limits
- ✅ File upload restrictions (type, size)
- ✅ Sanitization of user inputs
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (output encoding)

#### Rate Limiting
- ✅ Authentication endpoints: 5 requests/15 minutes
- ✅ API endpoints: 100 requests/15 minutes
- ✅ WebSocket connections: 10 connections/minute
- ✅ File uploads: 10 uploads/hour

#### CORS Configuration
- ✅ Whitelist approved origins
- ✅ Credentials support enabled
- ✅ Specific HTTP methods allowed
- ✅ Appropriate headers configuration

### Database Security

#### PostgreSQL
- ✅ No hardcoded credentials
- ✅ Environment-based configuration
- ✅ Connection pooling limits
- ✅ Prepared statements (via Prisma)
- ✅ No root database user in production
- ✅ Regular backups

#### Redis
- ✅ Password authentication required
- ✅ No external exposure (internal network only)
- ✅ Persistence enabled
- ✅ Connection encryption (TLS in production)

### Infrastructure Security

#### Docker & Containers
- ✅ Non-root user in containers
- ✅ Minimal base images (Alpine)
- ✅ No secrets in Dockerfiles
- ✅ Multi-stage builds
- ✅ Pinned image versions
- ✅ Regular image updates
- ✅ Healthchecks configured

#### Network Security
- ✅ Internal Docker network for services
- ✅ No database ports exposed to host
- ✅ Only reverse proxy exposes port 80/443
- ✅ TLS/SSL in production
- ✅ Security headers (Helmet.js)

#### Kubernetes (Production)
- ✅ Network policies
- ✅ RBAC configuration
- ✅ Pod security policies
- ✅ Secret management (Sealed Secrets)
- ✅ Resource limits
- ✅ Namespace isolation

### Application Security

#### End-to-End Encryption (E2EE)
- ✅ Client-side encryption for messages
- ✅ Key exchange protocol
- ✅ Forward secrecy
- ✅ Encrypted message storage

#### File Security
- ✅ File type validation
- ✅ File size limits (10MB default)
- ✅ Virus scanning (recommended in production)
- ✅ Secure file storage (MinIO with access control)
- ✅ Temporary file cleanup

#### Session Management
- ✅ Secure session storage (Redis)
- ✅ Session timeout
- ✅ Logout clears all sessions
- ✅ Concurrent session limits

### Monitoring & Logging

#### Security Logging
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ Unusual activity detection
- ✅ No sensitive data in logs
- ✅ Log rotation and retention

#### Dependency Management
- ✅ Automated dependency scanning (Dependabot)
- ✅ Regular dependency updates
- ✅ Known vulnerability alerts
- ✅ Security advisory monitoring

### CI/CD Security

#### GitHub Actions
- ✅ CodeQL security analysis
- ✅ Dependency vulnerability scanning
- ✅ Secret scanning
- ✅ No secrets in workflow files
- ✅ Minimal permission scopes

## Security Best Practices for Contributors

### Code Security

1. **Never commit secrets**
   ```bash
   # ❌ Bad
   const apiKey = "sk_live_1234567890";
   
   # ✅ Good
   const apiKey = process.env.API_KEY;
   ```

2. **Validate all inputs**
   ```typescript
   // ❌ Bad
   async createUser(data: any) {
     return this.db.user.create({ data });
   }
   
   // ✅ Good
   async createUser(createUserDto: CreateUserDto) {
     // DTO validated by class-validator
     return this.db.user.create({ data: createUserDto });
   }
   ```

3. **Use parameterized queries**
   ```typescript
   // ❌ Bad (SQL Injection risk)
   const query = `SELECT * FROM users WHERE email = '${email}'`;
   
   // ✅ Good (Prisma handles this)
   const user = await prisma.user.findUnique({
     where: { email },
   });
   ```

4. **Sanitize output**
   ```typescript
   // Frontend
   import DOMPurify from 'dompurify';
   
   const sanitized = DOMPurify.sanitize(userInput);
   ```

5. **Secure authentication**
   ```typescript
   // ✅ Hash passwords
   import * as bcrypt from 'bcrypt';
   
   const hashedPassword = await bcrypt.hash(password, 10);
   
   // ✅ Compare securely
   const isValid = await bcrypt.compare(password, hashedPassword);
   ```

### Environment Security

1. **Use `.env` for secrets (never commit)**
   ```bash
   # .env (gitignored)
   DATABASE_URL=postgresql://user:pass@localhost:5432/db
   JWT_SECRET=your-super-secret-key-min-32-chars
   ```

2. **Provide `.env.example` template**
   ```bash
   # .env.example (safe to commit)
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   JWT_SECRET=your_jwt_secret_here
   ```

3. **Validate environment variables on startup**
   ```typescript
   if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
     throw new Error('JWT_SECRET must be at least 32 characters');
   }
   ```

### Deployment Security

1. **Use strong secrets in production**
   ```bash
   # Generate strong secrets
   openssl rand -base64 32
   ```

2. **Enable HTTPS/TLS**
   - Use Let's Encrypt for free SSL certificates
   - Force HTTPS redirects
   - HSTS headers

3. **Configure security headers**
   ```typescript
   import helmet from 'helmet';
   app.use(helmet());
   ```

4. **Implement rate limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });
   ```

## Security Checklist for PRs

Before submitting a PR, verify:

- [ ] No secrets or credentials in code
- [ ] All user inputs validated
- [ ] Authentication/authorization checks in place
- [ ] SQL injection prevention (using ORM)
- [ ] XSS prevention (sanitized output)
- [ ] CSRF protection where needed
- [ ] Rate limiting on sensitive endpoints
- [ ] Error messages don't leak sensitive info
- [ ] No sensitive data in logs
- [ ] Dependencies up to date
- [ ] Security tests added

## Known Security Considerations

### Development Environment

⚠️ **Warning**: Default development credentials are weak and must be changed in production.

Default development values (`.env.example`):
- Database passwords: placeholder values
- JWT secrets: development-only secrets
- Redis passwords: simple development passwords

**Never use these in production!**

### Production Recommendations

For production deployments:

1. **Generate strong secrets**
   ```bash
   # JWT secrets (minimum 32 characters)
   openssl rand -base64 32
   
   # Database passwords (minimum 16 characters)
   openssl rand -base64 24
   ```

2. **Use secret management**
   - Kubernetes Secrets (with Sealed Secrets)
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault

3. **Enable monitoring**
   - Set up intrusion detection
   - Monitor failed login attempts
   - Alert on suspicious activity
   - Regular security audits

4. **Regular updates**
   - Keep dependencies updated
   - Apply security patches promptly
   - Monitor security advisories

5. **Backup strategy**
   - Regular encrypted backups
   - Test backup restoration
   - Secure backup storage

## Security Tools Used

- **CodeQL**: Static code analysis
- **Dependabot**: Dependency vulnerability scanning
- **ESLint**: Code quality and security linting
- **Helmet.js**: Security headers
- **class-validator**: Input validation
- **bcrypt**: Password hashing
- **Prisma**: SQL injection prevention

## Compliance

This project follows security best practices from:
- OWASP Top 10
- CWE Top 25
- NIST Cybersecurity Framework

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**Remember**: Security is an ongoing process, not a one-time task. Stay vigilant!
