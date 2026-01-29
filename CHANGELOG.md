# Changelog

All notable changes to the Messenger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-29

### Added
- **Real-time Messaging**: Implemented WebSocket-based real-time chat using Socket.io
- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA for enhanced security
- **OAuth Social Login**: Integration with Google and GitHub OAuth providers
- **End-to-End Encryption (E2EE)**: Client-side encryption for message privacy
- **User Presence System**: Real-time online/offline status using Redis
- **Media Storage**: MinIO S3-compatible object storage for file uploads
- **Full-Text Search**: MeiliSearch integration for fast message and user search
- **User Management**: Block/unblock users, user profiles, and settings
- **WebRTC Video/Audio Calls**: Peer-to-peer voice and video calling with signaling server
- **Modern UI**: Responsive Telegram-like interface with dark mode support
- **Component Library**: Integration with Shadcn/ui for consistent design system

### Infrastructure
- **Containerization**: Complete Docker and Docker Compose setup
- **Kubernetes Deployment**: Production-ready K8s manifests and Helm charts
- **CI/CD Pipelines**: GitHub Actions workflows for automated testing and deployment
- **Database Optimization**: PostgreSQL indexes and query optimization
- **Security Scanning**: CodeQL analysis and dependency scanning
- **Monitoring Ready**: Structured logging and health check endpoints

### Technical Stack
- **Backend**: NestJS with TypeScript, Prisma ORM, Socket.io
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Zustand
- **Database**: PostgreSQL 16
- **Cache & Presence**: Redis 7.2
- **Search**: MeiliSearch
- **Storage**: MinIO
- **Deployment**: Docker, Kubernetes, Helm

### Security
- Passwords hashed with bcrypt
- JWT tokens with secure expiration
- Redis password protection
- Database credentials via environment variables
- Input validation and sanitization
- Rate limiting on authentication endpoints
- CORS configuration
- Secure WebSocket connections

### Documentation
- Comprehensive README with setup instructions
- API documentation with Swagger/OpenAPI
- Git workflow and contribution guidelines
- Kubernetes deployment guides
- Architecture diagrams and system design docs

---

## [Unreleased]

### Planned Features
- Group chat functionality
- Message reactions and threading
- Read receipts
- Typing indicators
- Message pinning
- File sharing with preview
- Mobile application (React Native)
- Push notifications
- Message translation
- Admin dashboard

---

**Note**: This is a portfolio project demonstrating full-stack development capabilities, 
real-time communication, DevOps practices, and modern web technologies.
