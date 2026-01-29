# Git Branch Workflow

This document describes the branching strategy used in the Messenger project.

## Branch Structure

We follow a **Git Flow** workflow with the following branch types:

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Protected branch, no direct commits
- **Deployment**: Automatically deployed to production
- **Merges from**: `release/*` and `hotfix/*` branches only
- **Tagged**: Each merge creates a version tag (e.g., `v1.0.0`)

#### `develop`
- **Purpose**: Integration branch for ongoing development
- **Merges from**: `feature/*`, `release/*`, and `hotfix/*` branches
- **Deployment**: Continuously deployed to development environment

#### `staging`
- **Purpose**: Pre-production testing environment
- **Merges from**: `develop` branch
- **Deployment**: Staging server for QA and UAT testing

### Supporting Branches

#### Feature Branches (`feature/*`)
- **Naming**: `feature/feature-name`
- **Branch from**: `develop`
- **Merge into**: `develop`
- **Lifetime**: Temporary, deleted after merge
- **Examples**:
  - `feature/authentication-2fa`
  - `feature/webrtc-calls`
  - `feature/search-engine`
  - `feature/user-blocking`

#### Release Branches (`release/*`)
- **Naming**: `release/vX.Y.Z`
- **Branch from**: `develop`
- **Merge into**: `main` and `develop`
- **Purpose**: Prepare for production release
- **Activities**:
  - Version bumping
  - Final testing
  - Bug fixes
  - Documentation updates
  - Changelog preparation

#### Hotfix Branches (`hotfix/*`)
- **Naming**: `hotfix/issue-description`
- **Branch from**: `main`
- **Merge into**: `main` and `develop`
- **Purpose**: Emergency fixes for production
- **Example**: `hotfix/critical-security-patch`

#### Infrastructure Branches
- **`ops/docker-k8s`**: Docker and Kubernetes configurations
- **`infra/kubernetes-helm`**: Helm charts and K8s manifests
- **`ci/github-actions`**: CI/CD pipeline configurations

#### Documentation Branches
- **`docs/*`**: Documentation improvements
- **Example**: `docs/comprehensive-documentation`

## Workflow Examples

### Feature Development
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Develop and commit
git add .
git commit -m "feat: implement new feature"

# 3. Push and create pull request
git push -u origin feature/new-feature
# Create PR to develop branch

# 4. After merge, delete feature branch
git branch -d feature/new-feature
```

### Release Process
```bash
# 1. Create release branch
git checkout develop
git checkout -b release/v1.1.0

# 2. Prepare release (version bump, changelog, etc.)
git commit -am "chore: prepare release v1.1.0"

# 3. Merge to main
git checkout main
git merge --no-ff release/v1.1.0
git tag -a v1.1.0 -m "Release version 1.1.0"

# 4. Merge back to develop
git checkout develop
git merge --no-ff release/v1.1.0

# 5. Push everything
git push origin main develop --tags
```

### Hotfix Process
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/security-patch

# 2. Fix the issue
git commit -am "fix: critical security vulnerability"

# 3. Merge to main and tag
git checkout main
git merge --no-ff hotfix/security-patch
git tag -a v1.0.1 -m "Hotfix: security patch"

# 4. Merge to develop
git checkout develop
git merge --no-ff hotfix/security-patch

# 5. Push everything
git push origin main develop --tags
```

## Branch Protection Rules

### `main` Branch
- ✅ Require pull request reviews (minimum 1)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

### `develop` Branch
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ⚠️ Allow force pushes by administrators only

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes

### Examples
```
feat(auth): add two-factor authentication support
fix(chat): resolve message ordering issue in group chats
docs(api): update authentication endpoints documentation
perf(database): add indexes to improve query performance
ci(actions): add automated deployment workflow
```

## Pull Request Process

1. **Create Feature Branch**: Branch from `develop`
2. **Develop**: Make commits following conventions
3. **Test**: Ensure all tests pass locally
4. **Push**: Push to remote repository
5. **Create PR**: Open pull request to `develop`
6. **Review**: Address code review comments
7. **CI/CD**: Ensure all checks pass
8. **Merge**: Squash and merge to `develop`
9. **Cleanup**: Delete feature branch

## Version Numbering

We use [Semantic Versioning](https://semver.org/):

**MAJOR.MINOR.PATCH** (e.g., 1.2.3)

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Examples
- `1.0.0`: Initial release
- `1.1.0`: New feature added
- `1.1.1`: Bug fix
- `2.0.0`: Breaking change

## Current Active Branches

### Production
- `main` - Production code (v1.0.0)

### Development
- `develop` - Active development
- `staging` - Pre-production testing

### Features (Completed & Merged)
- ✅ `feature/backend-setup`
- ✅ `feature/frontend-init`
- ✅ `feature/auth-module`
- ✅ `feature/chat-core`
- ✅ `feature/media-storage`
- ✅ `feature/search-engine`
- ✅ `feature/webrtc-calls`
- ✅ `feature/database-optimization`
- ✅ `feature/user-blocking`
- ✅ `feature/authentication-2fa`
- ✅ `feature/oauth-social-login`
- ✅ `feature/encryption-e2ee`
- ✅ `feature/ui-modernization`
- ✅ `feature/advanced-modules`
- ✅ `feature/security-authentication`

### Infrastructure
- `ops/docker-k8s` - Container orchestration
- `infra/kubernetes-helm` - Helm charts
- `ci/github-actions` - CI/CD pipelines

### Documentation
- `docs/comprehensive-documentation` - Project documentation

---

**Note**: This workflow ensures code quality, proper testing, and safe deployments 
while maintaining a clean and organized repository history.
