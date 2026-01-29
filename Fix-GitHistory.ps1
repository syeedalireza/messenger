# PowerShell script to fix email addresses in git history
# Run this before uploading to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git History Email Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

Write-Host "Checking for personal email in commit history..." -ForegroundColor Yellow

# Check current commits
$commits = git log --all --pretty=format:"%ae" | Sort-Object -Unique

Write-Host "Found the following email addresses:" -ForegroundColor White
$commits | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

if ($commits -contains "syeeedalireza@yahoo.com") {
    Write-Host "WARNING: Personal email found in history!" -ForegroundColor Red
    Write-Host ""
    Write-Host "RECOMMENDED SOLUTION:" -ForegroundColor Yellow
    Write-Host "Since git filter-branch is complex in PowerShell, the safest approach is:" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTION 1: Use Git Bash (if installed)" -ForegroundColor Cyan
    Write-Host "  1. Open Git Bash in this directory" -ForegroundColor White
    Write-Host "  2. Run: bash fix-email.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTION 2: Manual cleanup (RECOMMENDED FOR PORTFOLIO)" -ForegroundColor Cyan
    Write-Host "  Since this hasn't been pushed to GitHub yet, you can:" -ForegroundColor White
    Write-Host "  1. Create a fresh repository" -ForegroundColor White
    Write-Host "  2. Copy all files (except .git)" -ForegroundColor White
    Write-Host "  3. Create professional commits" -ForegroundColor White
    Write-Host ""
    Write-Host "Would you like me to create a fresh repository automatically?" -ForegroundColor Yellow
    Write-Host "This will:" -ForegroundColor White
    Write-Host "  - Backup current .git to .git-backup" -ForegroundColor White
    Write-Host "  - Initialize fresh git repository" -ForegroundColor White
    Write-Host "  - Create clean commit history" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Proceed with fresh repository? (y/N)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        Write-Host "Creating fresh repository..." -ForegroundColor Green
        
        # Backup old git
        if (Test-Path ".git-backup") {
            Remove-Item -Recurse -Force ".git-backup"
        }
        Move-Item ".git" ".git-backup"
        
        # Initialize new repository
        git init
        
        # Configure git
        git config user.name "Ali Rezaei"
        git config user.email "dev@messenger.local"
        
        # Create .gitignore if not exists
        if (-not (Test-Path ".gitignore")) {
            @"
.env
.env.local
.env.production
.env.*.local
node_modules/
.next/
dist/
build/
*.log
.DS_Store
.vscode/
.idea/
coverage/
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
        }
        
        Write-Host "Repository initialized with clean history!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Review files with: git status" -ForegroundColor White
        Write-Host "  2. Add files: git add ." -ForegroundColor White
        Write-Host "  3. Create initial commit: git commit -m 'feat: initial commit'" -ForegroundColor White
        Write-Host "  4. Run branch creation script to recreate professional structure" -ForegroundColor White
        
    } else {
        Write-Host ""
        Write-Host "Operation cancelled. Please manually fix the email history." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "✓ No personal email found in history!" -ForegroundColor Green
    Write-Host "Repository is ready for GitHub upload." -ForegroundColor Green
}

Write-Host ""
Write-Host "Current git configuration:" -ForegroundColor Cyan
Write-Host "  Name:  $(git config user.name)" -ForegroundColor White
Write-Host "  Email: $(git config user.email)" -ForegroundColor White
Write-Host ""
