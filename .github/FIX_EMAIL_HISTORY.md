# Fix Email History Before GitHub Upload

## Problem
Personal email address was used in some commits. This needs to be cleaned before uploading to GitHub.

## Solution Options

### Option 1: Use git filter-branch (Simple but creates new commits)

```bash
# This will rewrite ALL commits to use the new email
git filter-branch --env-filter '
OLD_EMAIL="syeeedalireza@yahoo.com"
CORRECT_NAME="Ali Rezaei"
CORRECT_EMAIL="dev@messenger.local"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

### Option 2: Use git filter-repo (Recommended - Faster and Safer)

First, install git-filter-repo:
```bash
pip install git-filter-repo
```

Then run:
```bash
git filter-repo --email-callback '
    return email.replace(
        b"syeeedalireza@yahoo.com",
        b"dev@messenger.local"
    )
'
```

### Option 3: Create New Repository (Safest for Portfolio)

If you want a completely clean history:

1. **Rename current repository**
   ```bash
   cd ..
   mv Messenger Messenger-backup
   ```

2. **Create fresh repository**
   ```bash
   git init Messenger
   cd Messenger
   ```

3. **Copy all files (except .git)**
   ```bash
   robocopy ..\Messenger-backup . /E /XD .git
   ```

4. **Set correct git config**
   ```bash
   git config user.name "Ali Rezaei"
   git config user.email "dev@messenger.local"
   ```

5. **Create initial commit**
   ```bash
   git add .
   git commit -m "feat: initial commit - full-featured messenger application"
   ```

6. **Create professional branch structure**
   ```bash
   # This will be done by a script
   ```

## After Fixing

1. **Verify the fix**
   ```bash
   # Check all commits
   git log --all --pretty=format:"%an %ae" | sort -u
   
   # Should only show: Ali Rezaei dev@messenger.local
   ```

2. **Force push to remote (if already pushed)**
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

## Prevention

To prevent this in the future:

```bash
# Set repository-specific config
git config user.name "Ali Rezaei"
git config user.email "dev@messenger.local"

# Or set global config for all projects
git config --global user.name "Your Portfolio Name"
git config --global user.email "portfolio@example.local"
```

## Privacy Note

- ✅ Use generic emails for public repositories
- ✅ Examples: `dev@project.local`, `portfolio@example.com`
- ❌ Never use personal emails in public repos
- ❌ Never commit passwords, API keys, or secrets
