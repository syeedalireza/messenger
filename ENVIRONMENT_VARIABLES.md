# Environment Variables Guide

Complete guide to configuring the Messenger application.

## 📋 Quick Start

1. Copy `.env.example` to `.env`
2. Update all `CHANGE_ME` values
3. Generate secure secrets (see below)

## 🔐 Generating Secure Secrets

```bash
# Generate JWT secrets (32+ characters recommended)
openssl rand -base64 32

# Generate passwords
openssl rand -base64 24
```

## 📝 Environment Variables

### Application Settings

```env
NODE_ENV=development              # Environment: development | production | test
APP_NAME=Messenger                # Application name
BACKEND_PORT=3001                 # Backend server port
FRONTEND_URL=http://localhost     # Frontend URL (for OAuth callbacks)
```

### Database Configuration

```env
# PostgreSQL Connection
POSTGRES_HOST=postgres            # Database host
POSTGRES_PORT=5432                # Database port
POSTGRES_USER=messenger_user      # Database username
POSTGRES_PASSWORD=CHANGE_ME       # Database password (use strong password!)
POSTGRES_DB=messenger_db          # Database name

# Full connection string (auto-generated from above in docker-compose)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
```

**Production Tips:**
- Use strong, randomly generated passwords
- Never commit production passwords to version control
- Use managed database services in production (AWS RDS, GCP Cloud SQL)

### Redis Configuration

```env
REDIS_HOST=redis                  # Redis host
REDIS_PORT=6379                   # Redis port
REDIS_PASSWORD=CHANGE_ME          # Redis password (required!)
```

**Usage:**
- User presence (online/offline status)
- Caching frequently accessed data
- Session management

### JWT Authentication

```env
# Access Token
JWT_SECRET=CHANGE_ME_MIN_32_CHARS            # Secret for access tokens
JWT_EXPIRES_IN=7d                            # Access token expiry

# Refresh Token
JWT_REFRESH_SECRET=CHANGE_ME_MIN_32_CHARS   # Secret for refresh tokens
JWT_REFRESH_EXPIRES_IN=30d                   # Refresh token expiry
```

**Security:**
- Use different secrets for access and refresh tokens
- Minimum 32 characters
- Use cryptographically random values
- Rotate secrets periodically in production

### OAuth Configuration

#### Google OAuth

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost/api/auth/google/callback
```

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs
4. Copy Client ID and Secret

#### GitHub OAuth

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost/api/auth/github/callback
```

**Setup:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Set Authorization callback URL
4. Copy Client ID and Secret

### MinIO Object Storage

```env
MINIO_ENDPOINT=minio              # MinIO server endpoint
MINIO_PORT=9000                   # MinIO API port
MINIO_ROOT_USER=minioadmin        # MinIO root username
MINIO_ROOT_PASSWORD=CHANGE_ME     # MinIO root password
MINIO_ACCESS_KEY=CHANGE_ME        # Access key for application
MINIO_SECRET_KEY=CHANGE_ME        # Secret key for application
MINIO_BUCKET=messenger-files      # Bucket name
MINIO_USE_SSL=false               # Use SSL (true in production)
```

**Production:**
- Use AWS S3, Google Cloud Storage, or MinIO cluster
- Enable SSL/TLS
- Configure bucket policies
- Setup CDN (CloudFront, CloudFlare)

### MeiliSearch

```env
MEILISEARCH_HOST=http://meilisearch:7700  # MeiliSearch server URL
MEILISEARCH_MASTER_KEY=CHANGE_ME          # Master key (required!)
```

**Security:**
- Always set a master key in production
- Use API keys for client access
- Minimum 16 characters for master key

### File Upload

```env
MAX_FILE_SIZE=52428800            # Max file size in bytes (50MB default)
UPLOAD_DIR=./uploads              # Local upload directory (not used with MinIO)
```

**Recommended Limits:**
- Images: 10MB
- Videos: 50MB
- Documents: 25MB
- Adjust based on your needs and infrastructure

### Frontend Configuration

```env
# Public environment variables (exposed to browser)
NEXT_PUBLIC_API_URL=http://localhost/api      # Backend API URL
NEXT_PUBLIC_WS_URL=ws://localhost             # WebSocket URL
NEXT_PUBLIC_APP_NAME=Messenger                 # App name
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourapp.com
```

## 🐳 Docker Compose Environment

### Development

```env
NODE_ENV=development
```

Services accessible at:
- Frontend: http://localhost
- Backend API: http://localhost/api
- Swagger Docs: http://localhost/docs

### Production

```env
NODE_ENV=production
```

Additional considerations:
- Use production-grade database (managed service)
- Enable SSL/TLS
- Configure proper CORS origins
- Use secrets management (Vault, AWS Secrets Manager)

## ☸️ Kubernetes Environment

### ConfigMap Variables

Non-sensitive configuration stored in `k8s/configmap.yaml`:
- Application settings
- Service endpoints (internal)
- Feature flags

### Secret Variables

Sensitive data stored in `k8s/secrets.yaml`:
- Database passwords
- API keys
- JWT secrets
- OAuth credentials

**Production:**
```bash
# Use sealed-secrets or external secret manager
kubectl create secret generic messenger-secrets \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  -n messenger
```

## 🔒 Security Best Practices

### 1. Never Commit Secrets

```bash
# Add to .gitignore
.env
.env.local
.env.production
k8s/secrets.yaml  # If contains real values
```

### 2. Use Different Secrets per Environment

- Development: Simple, can be committed to .env.example
- Staging: Production-like but separate
- Production: Maximum security, rotated regularly

### 3. Rotate Secrets Regularly

- JWT secrets: Every 90 days
- Database passwords: Every 90 days
- API keys: As needed or on breach

### 4. Principle of Least Privilege

- Use read-only database users where possible
- Limit OAuth scopes to minimum required
- Use separate credentials per service

### 5. Monitor Access

- Log authentication attempts
- Alert on failed logins
- Monitor for unusual API usage

## 📦 Environment Variable Checklist

### Minimum Required (Local Development)

- [ ] `DATABASE_URL` or individual `POSTGRES_*` vars
- [ ] `REDIS_PASSWORD`
- [ ] `JWT_SECRET`
- [ ] `JWT_REFRESH_SECRET`

### Recommended (All Environments)

- [ ] `MINIO_ROOT_PASSWORD`
- [ ] `MINIO_ACCESS_KEY`
- [ ] `MINIO_SECRET_KEY`
- [ ] `MEILISEARCH_MASTER_KEY`

### Optional (Feature-dependent)

- [ ] OAuth credentials (if using social login)
- [ ] Email SMTP settings (if using email notifications)
- [ ] Monitoring endpoints (Prometheus, Grafana)

## 🚨 Common Issues

### Database Connection Failed

```
Error: Environment variable not found: DATABASE_URL
```

**Solution:** Ensure `DATABASE_URL` is set or all `POSTGRES_*` variables are configured.

### Redis Authentication Failed

```
Error: NOAUTH Authentication required
```

**Solution:** Set `REDIS_PASSWORD` environment variable.

### JWT Token Invalid

```
Error: invalid signature
```

**Solution:** Ensure `JWT_SECRET` matches between services and hasn't changed.

### OAuth Redirect Mismatch

```
Error: redirect_uri_mismatch
```

**Solution:** Update OAuth callback URL in provider settings to match your environment.

## 📚 Additional Resources

- [12-Factor App Methodology](https://12factor.net/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)

---

**Last Updated**: January 2026  
**Version**: 1.0.0
