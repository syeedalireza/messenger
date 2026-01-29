# Contributing to Messenger

First off, thank you for considering contributing to Messenger! This is a portfolio project that demonstrates professional development practices and modern full-stack architecture.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to professional software development standards. Please be respectful, constructive, and collaborative.

## Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **Docker**: v24.x or higher (with Docker Compose)
- **Git**: v2.x or higher
- **pnpm**: v8.x or higher (recommended) or npm

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Messenger
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env with your local settings
   ```

4. **Start development environment**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d
   
   # Or run services individually
   # Backend: cd backend && npm run start:dev
   # Frontend: cd frontend && npm run dev
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

## Development Workflow

We follow **Git Flow** methodology:

### Branch Types

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`staging`**: Pre-production testing
- **`feature/*`**: New features
- **`hotfix/*`**: Emergency production fixes
- **`release/*`**: Release preparation

### Creating a Feature

```bash
# 1. Update develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... code, test, commit ...

# 4. Push and create PR
git push -u origin feature/your-feature-name
# Then create Pull Request on GitHub
```

See [BRANCH_WORKFLOW.md](.github/BRANCH_WORKFLOW.md) for detailed workflow.

## Coding Standards

### TypeScript

- **Strict mode**: Always use strict TypeScript
- **Types**: Avoid `any`, prefer proper typing
- **Interfaces**: Use interfaces for object shapes
- **Enums**: Use enums for fixed sets of values

### Backend (NestJS)

```typescript
// ✅ Good
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }
}

// ❌ Bad
export class UserService {
  async findById(id: any) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

### Frontend (React/Next.js)

```typescript
// ✅ Good
interface MessageProps {
  content: string;
  sender: User;
  timestamp: Date;
  onReply?: () => void;
}

export const Message: React.FC<MessageProps> = ({
  content,
  sender,
  timestamp,
  onReply,
}) => {
  return (
    <div className="message">
      {/* Component JSX */}
    </div>
  );
};

// ❌ Bad
export const Message = (props: any) => {
  return <div>{props.content}</div>;
};
```

### Code Style

- **Formatting**: Use Prettier (configured in project)
- **Linting**: ESLint must pass without errors
- **Naming**:
  - Variables/Functions: `camelCase`
  - Classes/Components: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.ts` or `PascalCase.tsx` for components

### Clean Code Principles

1. **Single Responsibility**: One function/class does one thing
2. **DRY**: Don't Repeat Yourself
3. **KISS**: Keep It Simple, Stupid
4. **Meaningful Names**: Self-documenting code
5. **Small Functions**: Aim for < 20 lines
6. **Comments**: Only when necessary, prefer clear code

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvement
- **test**: Adding/updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes

### Examples

```
feat(auth): implement two-factor authentication

Add TOTP-based 2FA with QR code generation and verification.
Includes backend validation and frontend UI components.

Closes #123

---

fix(chat): resolve message duplication in real-time updates

Messages were appearing twice due to Socket.io event handler
being registered multiple times. Added cleanup in useEffect.

---

docs(readme): update installation instructions

---

perf(database): add composite index on messages table

Improves query performance for message retrieval by 60%.
```

### Commit Best Practices

- ✅ Atomic commits (one logical change per commit)
- ✅ Descriptive messages
- ✅ Present tense ("add feature" not "added feature")
- ✅ Lowercase subject line
- ✅ Subject line ≤ 50 characters
- ✅ Body wrapped at 72 characters
- ❌ No "WIP" or "fix" commits in PR
- ❌ No merge commits (use rebase)

## Pull Request Process

### Before Creating PR

1. **Update your branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git rebase develop
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   ```

3. **Lint code**
   ```bash
   npm run lint
   npm run format
   ```

4. **Build locally**
   ```bash
   npm run build
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Tested locally with Docker
- [ ] All tests passing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] Environment variables documented

## Screenshots (if applicable)

## Related Issues
Closes #issue_number
```

### Review Process

1. **Automated Checks**: CI/CD must pass
2. **Code Review**: At least 1 approval required
3. **Testing**: QA verification if needed
4. **Merge**: Squash and merge to keep history clean

## Testing Requirements

### Unit Tests

- **Coverage**: Aim for >80% code coverage
- **Framework**: Jest
- **Location**: `*.spec.ts` files next to source

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should find user by ID', async () => {
    const user = await service.findById('test-id');
    expect(user).toBeDefined();
    expect(user.id).toBe('test-id');
  });
});
```

### Integration Tests

- **E2E Tests**: Use Playwright or Cypress
- **API Tests**: Test API endpoints
- **Socket Tests**: Test WebSocket events

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Documentation

### Code Documentation

```typescript
/**
 * Creates a new user account with email verification
 * 
 * @param createUserDto - User registration data
 * @returns Created user object without password
 * @throws ConflictException if email already exists
 * @throws BadRequestException if validation fails
 */
async createUser(createUserDto: CreateUserDto): Promise<User> {
  // Implementation
}
```

### API Documentation

- All endpoints must have Swagger/OpenAPI decorators
- Include request/response examples
- Document all possible error codes

### README Updates

- Keep README.md current with new features
- Update installation steps if dependencies change
- Document new environment variables

## Project Structure

```
Messenger/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── common/       # Shared code
│   │   └── main.ts       # Entry point
│   ├── test/             # E2E tests
│   └── prisma/           # Database schema
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── store/        # State management
├── docker-compose.yml    # Local development
├── k8s/                  # Kubernetes manifests
├── helm/                 # Helm charts
└── .github/              # CI/CD workflows
```

## Architecture Guidelines

### Backend Architecture

- **Modular Design**: Each feature in its own module
- **Dependency Injection**: Use NestJS DI container
- **DTOs**: Validate all inputs with class-validator
- **Services**: Business logic goes in services
- **Controllers**: Thin controllers, delegate to services
- **Guards**: Authentication/Authorization
- **Interceptors**: Logging, transformation
- **Pipes**: Validation, transformation

### Frontend Architecture

- **Component Structure**: Atomic design principles
- **State Management**: Zustand for global state
- **Server Components**: Use Next.js 14 App Router
- **Client Components**: Only when needed
- **Hooks**: Custom hooks for reusable logic
- **API Calls**: Centralized in `lib/api.ts`
- **Types**: Share types with backend when possible

## Security Guidelines

### Backend Security

- ✅ Validate all inputs
- ✅ Sanitize user data
- ✅ Use parameterized queries (Prisma)
- ✅ Hash passwords with bcrypt
- ✅ Use HTTPS in production
- ✅ Rate limiting on auth endpoints
- ✅ CORS configuration
- ❌ Never log sensitive data
- ❌ No secrets in code
- ❌ No SQL string concatenation

### Frontend Security

- ✅ Sanitize user-generated content
- ✅ Use Content Security Policy
- ✅ Secure token storage
- ✅ HTTPS only
- ✅ Input validation
- ❌ No secrets in client code
- ❌ No sensitive data in localStorage

## Performance Guidelines

- **Database**: Use indexes, avoid N+1 queries
- **Caching**: Use Redis for frequently accessed data
- **Images**: Optimize and lazy load
- **Code Splitting**: Dynamic imports for large components
- **Bundle Size**: Monitor and optimize
- **API**: Implement pagination
- **WebSocket**: Debounce frequent events

## Questions?

If you have questions:
1. Check existing documentation
2. Search closed issues
3. Open a new discussion
4. Contact maintainers

---

Thank you for contributing to making this project better! 🚀
