# Dependabot Management Guide

## ❌ غیرفعال کردن Dependabot

### روش 1: از طریق تنظیمات GitHub (پیشنهادی)

1. برو به: `https://github.com/syeedalireza/messenger/settings/security_analysis`
2. در بخش **Dependabot**:
   - غیرفعال کن: ❌ **Dependabot alerts**
   - غیرفعال کن: ❌ **Dependabot security updates**
   - غیرفعال کن: ❌ **Dependabot version updates**

### روش 2: با فایل تنظیمات (کنترل دقیق)

فایل `.github/dependabot.yml` ایجاد شده که تنظیمات زیر را دارد:
- `open-pull-requests-limit: 0` - هیچ PR خودکاری ایجاد نمی‌شود
- `interval: monthly` - بررسی فقط ماهانه

## 🧹 پاک کردن Issue/PR های موجود Dependabot

### بستن Issue های Dependabot

```bash
# List all Dependabot issues
gh issue list --author "app/dependabot"

# Close all Dependabot issues
gh issue list --author "app/dependabot" --json number --jq '.[].number' | \
  xargs -I {} gh issue close {}
```

### بستن PR های Dependabot

```bash
# List all Dependabot PRs
gh pr list --author "app/dependabot"

# Close all Dependabot PRs
gh pr list --author "app/dependabot" --json number --jq '.[].number' | \
  xargs -I {} gh pr close {}
```

### از طریق GitHub Web Interface

1. برو به Issues/Pull Requests
2. فیلتر کن با: `is:open author:app/dependabot`
3. هر کدام را manually ببند با دکمه "Close"

## ⚙️ تنظیمات پیشرفته Dependabot

اگر می‌خواهید Dependabot را نگه دارید ولی کنترل بیشتری داشته باشید:

```yaml
# .github/dependabot.yml

version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "monthly"
    open-pull-requests-limit: 0  # غیرفعال کردن PR های خودکار
    reviewers:
      - "syeedalireza"  # فقط شما reviewer باشید
    assignees:
      - "syeedalireza"  # فقط به شما assign شود
    labels:
      - "dependencies"
      - "backend"
    commit-message:
      prefix: "chore(deps)"  # Commit message prefix
```

## 🚫 جلوگیری از Dependabot در آینده

### گزینه 1: حذف کامل فایل

```bash
# Remove dependabot config completely
rm .github/dependabot.yml
git commit -m "config: remove Dependabot configuration"
git push
```

### گزینه 2: نگه‌داری با limit صفر

فایل فعلی `.github/dependabot.yml` با `open-pull-requests-limit: 0` باعث می‌شود:
- ✅ Dependabot فعال باشد (برای security alerts)
- ❌ هیچ PR خودکاری ساخته نشود
- ✅ فقط alert می‌دهد، PR نمی‌سازد

## 📋 وضعیت فعلی پروژه شما

طبق چیزی که در GitHub می‌بینم:
- Repository: `https://github.com/syeedalireza/messenger`
- شما در حال حاضر **19 commit** دارید
- زبان اصلی: **TypeScript 97.5%**
- ساختار فایل‌ها به درستی آپلود شده ✅

## ✅ توصیه نهایی

برای یک portfolio پروژه تمیز:

1. **غیرفعال کن Dependabot** از Settings
2. **ببند همه Issue/PR های موجود** Dependabot
3. **Push کن** فایل `.github/dependabot.yml` که ساختم
4. **در آینده** فقط شما Issue و PR ایجاد کنید

## 🎯 نکته مهم

برای نشان دادن فعالیت در GitHub:
- خودتان Issue ایجاد کنید برای feature های آینده
- خودتان PR ایجاد کنید و merge کنید
- این کار نشان می‌دهد شما project را به صورت active مدیریت می‌کنید

### مثال Issue که خودتان بسازید:

**Title**: "Add PWA Support for Offline Messaging"
```markdown
## Description
Implement Progressive Web App features for better mobile experience

## Tasks
- [ ] Setup service worker
- [ ] Add app manifest
- [ ] Implement offline support with IndexedDB
- [ ] Add install prompt

## Expected Benefits
- Better mobile UX
- Offline message queue
- App-like experience
```

---

**این کار باعث می‌شود repository شما کاملاً تحت کنترل شما باشد!** ✅
