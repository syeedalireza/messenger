# ایجاد Repository تمیز برای GitHub

## گزینه 1: Squash همه commit ها (توصیه می‌شود برای portfolio)

این روش تمام تاریخچه را به یک commit initial تبدیل می‌کند:

```bash
# 1. Backup فعلی
cd c:\development
Move-Item Messenger Messenger-backup

# 2. ایجاد repository جدید
git clone Messenger-backup Messenger
cd Messenger

# 3. حذف remote
git remote remove origin

# 4. ایجاد orphan branch
git checkout --orphan latest_branch

# 5. Add همه فایل‌ها
git add -A

# 6. Commit اولیه
git commit -m "feat: full-featured real-time messenger application

Complete implementation of a production-ready messenger with:

## Features
- Real-time messaging with Socket.io WebSockets
- End-to-end encryption (E2EE)
- WebRTC video/audio calls with signaling server
- Two-factor authentication (2FA) with TOTP
- OAuth social login (Google, GitHub)
- User blocking and management
- Full-text search with MeiliSearch
- Media storage with MinIO (S3-compatible)
- User presence system with Redis

## Tech Stack
- Backend: NestJS, TypeScript, Prisma ORM, Socket.io
- Frontend: Next.js 14, React, Tailwind CSS, Zustand
- Database: PostgreSQL 16 with optimized indexes
- Cache & Presence: Redis 7.2
- Search: MeiliSearch
- Storage: MinIO
- Infrastructure: Docker, Kubernetes, Helm
- CI/CD: GitHub Actions

## Infrastructure
- Docker Compose for local development
- Kubernetes manifests for production
- Helm charts for easy deployment
- Multi-stage Dockerfiles
- GitHub Actions CI/CD pipelines
- CodeQL security scanning
- Dependabot for dependency management

## Security
- bcrypt password hashing
- JWT with refresh tokens
- Redis password protection
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers (Helmet.js)

## Documentation
- Comprehensive README
- API documentation (Swagger)
- Architecture diagrams
- Deployment guides
- Contributing guidelines
- Security policy

## Development
Author: Alireza
Email: dev@messenger.local
Date: 2026-01-29"

# 7. حذف branch قدیمی
git branch -D main

# 8. تغییر نام branch
git branch -m main

# 9. تنظیم git config
git config user.name "Alireza"
git config user.email "dev@messenger.local"

# 10. بررسی
git log --pretty=format:"%an <%ae> - %s"
```

## گزینه 2: حفظ ساختار branch ها (اگر می‌خواهید multiple branches نمایش دهید)

```bash
# در Messenger-backup:
cd c:\development\Messenger-backup

# لیست تمام branch ها
$branches = git branch --format="%(refname:short)"

# برای هر branch، یک initial commit بسازید
foreach ($branch in $branches) {
    git checkout $branch
    git checkout --orphan temp_$branch
    git add -A
    git commit -m "feat($branch): initial implementation"
    git branch -D $branch
    git branch -m $branch
}

# بازگشت به main
git checkout main
```

---

**توصیه من:**
از **گزینه 1** استفاده کنید چون:
1. تمیز و حرفه‌ای است
2. هیچ اطلاعات شخصی ندارد
3. یک commit message جامع و impressive دارد
4. برای portfolio عالی است
