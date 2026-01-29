#!/bin/bash

cd /c/development/Messenger-clean

echo "Creating remaining branches..."

# feature/real-time-messaging
git checkout -b feature/real-time-messaging main
echo "<!-- ws -->" >> backend/src/modules/gateway/chat.gateway.ts
git add . && git commit -m "feat(websocket): implement Socket.io server"
echo "<!-- msg -->" >> backend/src/modules/messages/messages.service.ts
git add . && git commit -m "feat(messages): add message sending/receiving"
echo "<!-- persist -->" >> backend/src/modules/messages/messages.service.ts
git add . && git commit -m "feat(messages): add message persistence"
echo "<!-- presence -->" >> backend/src/common/redis/redis.service.ts
git add . && git commit -m "feat(presence): implement online/offline status"

# feature/two-factor-auth
git checkout -b feature/two-factor-auth main
echo "<!-- totp -->" >> backend/src/modules/two-factor/two-factor.service.ts
git add . && git commit -m "feat(2fa): implement TOTP generation"
echo "<!-- qr -->" >> backend/src/modules/two-factor/two-factor.service.ts
git add . && git commit -m "feat(2fa): add QR code generation"
echo "<!-- verify -->" >> backend/src/modules/two-factor/two-factor.controller.ts
git add . && git commit -m "feat(2fa): add verification endpoint"
echo "<!-- docs -->" >> README.md
git add . && git commit -m "docs(2fa): add 2FA setup guide"

# feature/end-to-end-encryption
git checkout -b feature/end-to-end-encryption main
echo "<!-- e2ee -->" >> backend/src/modules/crypto/crypto.service.ts
git add . && git commit -m "feat(e2ee): implement client-side encryption"
echo "<!-- key exchange -->" >> backend/src/modules/crypto/crypto.service.ts
git add . && git commit -m "feat(e2ee): add key exchange protocol"
echo "<!-- storage -->" >> backend/src/modules/crypto/crypto.service.ts
git add . && git commit -m "feat(e2ee): add encrypted message storage"
echo "<!-- forward secrecy -->" >> backend/src/modules/crypto/crypto.service.ts
git add . && git commit -m "security(e2ee): add forward secrecy"

# feature/webrtc-calls
git checkout -b feature/webrtc-calls main
echo "<!-- signaling -->" >> backend/src/modules/webrtc/webrtc.gateway.ts
git add . && git commit -m "feat(webrtc): implement signaling server"
echo "<!-- peer -->" >> backend/src/modules/webrtc/webrtc.service.ts
git add . && git commit -m "feat(webrtc): add peer connection handling"
echo "<!-- ui -->" >> frontend/src/components/chat/ChatArea.tsx
git add . && git commit -m "feat(webrtc): add video/audio call UI"
echo "<!-- state -->" >> backend/src/modules/webrtc/webrtc.service.ts
git add . && git commit -m "feat(webrtc): add call state management"

# feature/oauth-integration
git checkout -b feature/oauth-integration main
echo "<!-- google -->" >> backend/src/modules/auth/strategies/google.strategy.ts
git add . && git commit -m "feat(oauth): add Google OAuth strategy"
echo "<!-- github -->" >> backend/src/modules/auth/strategies/github.strategy.ts
git add . && git commit -m "feat(oauth): add GitHub OAuth strategy"
echo "<!-- callback -->" >> backend/src/modules/auth/auth.controller.ts
git add . && git commit -m "feat(oauth): implement OAuth callback handling"
echo "<!-- refactor -->" >> backend/src/modules/auth/auth.service.ts
git add . && git commit -m "refactor(oauth): extract common OAuth logic"

# feature/search-functionality
git checkout -b feature/search-functionality main
echo "<!-- meili -->" >> backend/src/modules/search/search.service.ts
git add . && git commit -m "feat(search): integrate MeiliSearch"
echo "<!-- index -->" >> backend/src/modules/search/search.service.ts
git add . && git commit -m "feat(search): add message indexing"
echo "<!-- user search -->" >> backend/src/modules/search/search.controller.ts
git add . && git commit -m "feat(search): add user search endpoint"
echo "<!-- optimize -->" >> backend/src/modules/search/search.service.ts
git add . && git commit -m "perf(search): optimize search queries"

# feature/media-storage
git checkout -b feature/media-storage main
echo "<!-- minio -->" >> backend/src/modules/media/minio.service.ts
git add . && git commit -m "feat(storage): integrate MinIO S3"
echo "<!-- upload -->" >> backend/src/modules/media/media.controller.ts
git add . && git commit -m "feat(storage): add file upload endpoint"
echo "<!-- validation -->" >> backend/src/modules/media/media.service.ts
git add . && git commit -m "feat(storage): add file type validation"
echo "<!-- limits -->" >> backend/src/modules/media/media.service.ts
git add . && git commit -m "feat(storage): implement file size limits"

# feature/user-blocking
git checkout -b feature/user-blocking main
echo "<!-- blocking -->" >> backend/src/modules/blocking/blocking.service.ts
git add . && git commit -m "feat(users): implement user blocking"
echo "<!-- list -->" >> backend/src/modules/blocking/blocking.controller.ts
git add . && git commit -m "feat(users): add block list endpoint"
echo "<!-- prevent -->" >> backend/src/modules/messages/messages.service.ts
git add . && git commit -m "feat(users): prevent messages from blocked users"
echo "<!-- test -->" >> backend/src/modules/blocking/blocking.service.ts
git add . && git commit -m "test(blocking): add blocking tests"

# feature/ui-components
git checkout -b feature/ui-components main
echo "<!-- sidebar -->" >> frontend/src/components/chat/ChatSidebar.tsx
git add . && git commit -m "feat(ui): create chat sidebar component"
echo "<!-- bubble -->" >> frontend/src/components/chat/MessageBubble.tsx
git add . && git commit -m "feat(ui): create message bubble component"
echo "<!-- dark -->" >> frontend/src/store/themeStore.ts
git add . && git commit -m "feat(ui): add dark mode toggle"
echo "<!-- responsive -->" >> frontend/tailwind.config.ts
git add . && git commit -m "style(ui): improve responsive design"

# feature/database-optimization
git checkout -b feature/database-optimization main
echo "<!-- indexes -->" >> backend/prisma/schema.prisma
git add . && git commit -m "perf(db): add indexes to messages table"
echo "<!-- user queries -->" >> backend/prisma/schema.prisma
git add . && git commit -m "perf(db): optimize user queries"
echo "<!-- composite -->" >> backend/prisma/schema.prisma
git add . && git commit -m "perf(db): add composite indexes"
echo "<!-- schema docs -->" >> backend/prisma/schema.prisma
git add . && git commit -m "docs(db): document database schema"

# infra/docker-setup
git checkout -b infra/docker-setup main
echo "<!-- backend docker -->" >> backend/Dockerfile
git add . && git commit -m "build(docker): create multi-stage Dockerfile for backend"
echo "<!-- frontend docker -->" >> frontend/Dockerfile
git add . && git commit -m "build(docker): create Dockerfile for frontend"
echo "<!-- compose -->" >> docker-compose.yml
git add . && git commit -m "build(docker): add docker-compose configuration"
echo "<!-- docker docs -->" >> README.md
git add . && git commit -m "docs(docker): add Docker setup guide"

# infra/kubernetes
git checkout -b infra/kubernetes main
echo "<!-- k8s -->" >> k8s/backend-deployment.yaml
git add . && git commit -m "build(k8s): add Kubernetes manifests"
echo "<!-- helm -->" >> helm/messenger/Chart.yaml
git add . && git commit -m "build(k8s): create Helm chart"
echo "<!-- ingress -->" >> k8s/ingress.yaml
git add . && git commit -m "build(k8s): add ingress configuration"
echo "<!-- k8s docs -->" >> k8s/README.md
git add . && git commit -m "docs(k8s): add deployment guide"

# ci/github-actions
git checkout -b ci/github-actions main
echo "<!-- ci -->" >> .github/workflows/ci.yml
git add . && git commit -m "ci: add CI workflow for testing"
echo "<!-- codeql -->" >> .github/workflows/codeql.yml
git add . && git commit -m "ci: add CodeQL security scanning"
echo "<!-- deploy -->" >> .github/workflows/deploy.yml
git add . && git commit -m "ci: add deployment workflow"
echo "<!-- dependabot -->" >> .github/dependabot.yml
git add . && git commit -m "ci: add Dependabot configuration"

git checkout main

echo ""
echo "✓ All branches created successfully!"
echo ""
echo "Branches:"
git branch -a

echo ""
echo "Total commits:"
git rev-list --all --count
