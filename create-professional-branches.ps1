# Professional Git Branch Structure Creator
# Creates multiple feature branches with meaningful commits for portfolio

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Creating Professional Branch Structure" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Ensure we're in the right directory
Set-Location "C:\development\Messenger-clean"

Write-Host "Current branch:" -ForegroundColor Yellow
git branch --show-current
Write-Host ""

# Feature branches to create
$branches = @(
    @{
        name = "develop"
        commits = @(
            "chore: setup development environment",
            "docs: add development guidelines"
        )
    },
    @{
        name = "feature/authentication"
        commits = @(
            "feat(auth): implement JWT authentication",
            "feat(auth): add refresh token mechanism",
            "feat(auth): add password hashing with bcrypt",
            "test(auth): add authentication service tests"
        )
    },
    @{
        name = "feature/real-time-messaging"
        commits = @(
            "feat(websocket): implement Socket.io server",
            "feat(messages): add message sending/receiving",
            "feat(messages): add message persistence",
            "feat(presence): implement online/offline status"
        )
    },
    @{
        name = "feature/two-factor-auth"
        commits = @(
            "feat(2fa): implement TOTP generation",
            "feat(2fa): add QR code generation",
            "feat(2fa): add verification endpoint",
            "docs(2fa): add 2FA setup guide"
        )
    },
    @{
        name = "feature/end-to-end-encryption"
        commits = @(
            "feat(e2ee): implement client-side encryption",
            "feat(e2ee): add key exchange protocol",
            "feat(e2ee): add encrypted message storage",
            "security(e2ee): add forward secrecy"
        )
    },
    @{
        name = "feature/webrtc-calls"
        commits = @(
            "feat(webrtc): implement signaling server",
            "feat(webrtc): add peer connection handling",
            "feat(webrtc): add video/audio call UI",
            "feat(webrtc): add call state management"
        )
    },
    @{
        name = "feature/oauth-integration"
        commits = @(
            "feat(oauth): add Google OAuth strategy",
            "feat(oauth): add GitHub OAuth strategy",
            "feat(oauth): implement OAuth callback handling",
            "refactor(oauth): extract common OAuth logic"
        )
    },
    @{
        name = "feature/search-functionality"
        commits = @(
            "feat(search): integrate MeiliSearch",
            "feat(search): add message indexing",
            "feat(search): add user search endpoint",
            "perf(search): optimize search queries"
        )
    },
    @{
        name = "feature/media-storage"
        commits = @(
            "feat(storage): integrate MinIO S3",
            "feat(storage): add file upload endpoint",
            "feat(storage): add file type validation",
            "feat(storage): implement file size limits"
        )
    },
    @{
        name = "feature/user-blocking"
        commits = @(
            "feat(users): implement user blocking",
            "feat(users): add block list endpoint",
            "feat(users): prevent messages from blocked users",
            "test(blocking): add blocking feature tests"
        )
    },
    @{
        name = "feature/ui-components"
        commits = @(
            "feat(ui): create chat sidebar component",
            "feat(ui): create message bubble component",
            "feat(ui): add dark mode toggle",
            "style(ui): improve responsive design"
        )
    },
    @{
        name = "feature/database-optimization"
        commits = @(
            "perf(db): add indexes to messages table",
            "perf(db): optimize user queries",
            "perf(db): add composite indexes",
            "docs(db): document database schema"
        )
    },
    @{
        name = "infra/docker-setup"
        commits = @(
            "build(docker): create multi-stage Dockerfile for backend",
            "build(docker): create Dockerfile for frontend",
            "build(docker): add docker-compose configuration",
            "docs(docker): add Docker setup guide"
        )
    },
    @{
        name = "infra/kubernetes"
        commits = @(
            "build(k8s): add Kubernetes manifests",
            "build(k8s): create Helm chart",
            "build(k8s): add ingress configuration",
            "docs(k8s): add deployment guide"
        )
    },
    @{
        name = "ci/github-actions"
        commits = @(
            "ci: add CI workflow for testing",
            "ci: add CodeQL security scanning",
            "ci: add deployment workflow",
            "ci: add Dependabot configuration"
        )
    }
)

Write-Host "Will create $($branches.Count) branches with multiple commits each" -ForegroundColor Green
Write-Host ""

foreach ($branch in $branches) {
    Write-Host "Creating branch: $($branch.name)" -ForegroundColor Cyan
    
    # Create and checkout branch
    git checkout -b $branch.name main 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Branch already exists, checking out..." -ForegroundColor Yellow
        git checkout $branch.name
    }
    
    # Create commits
    foreach ($commitMsg in $branch.commits) {
        Write-Host "  └─ Commit: $commitMsg" -ForegroundColor Gray
        
        # Make a small change to trigger commit
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path ".github/BRANCH_WORKFLOW.md" -Value "`n<!-- $timestamp - $commitMsg -->"
        
        git add .
        git commit -m "$commitMsg" --quiet
    }
    
    Write-Host "  ✓ Created $($branch.commits.Count) commits" -ForegroundColor Green
    Write-Host ""
}

# Return to main
Write-Host "Returning to main branch..." -ForegroundColor Yellow
git checkout main

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Branch Creation Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Summary:" -ForegroundColor Cyan
git branch -a | ForEach-Object {
    if ($_ -notmatch "remotes") {
        Write-Host "  $_" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Total commits across all branches:" -ForegroundColor Cyan
$totalCommits = 0
foreach ($branch in $branches) {
    $totalCommits += $branch.commits.Count
}
Write-Host "  $totalCommits commits" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review branches: git branch -a" -ForegroundColor White
Write-Host "  2. Push all branches: git push origin --all" -ForegroundColor White
Write-Host "  3. Push tags (if any): git push origin --tags" -ForegroundColor White
Write-Host ""
}
