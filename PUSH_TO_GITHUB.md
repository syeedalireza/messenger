# راهنمای Push به GitHub

## مرحله 1: Authentication Setup

برای push کردن به GitHub، نیاز به authentication دارید.

### گزینه A: استفاده از GitHub CLI (ساده‌ترین)

```bash
# نصب GitHub CLI (اگر نصب نیست)
# از https://cli.github.com دانلود کنید

# Login
gh auth login
# انتخاب: GitHub.com → HTTPS → Yes → Login with a web browser

# سپس push کنید
cd C:\development\Messenger-clean
git push -u origin main
```

### گزینه B: استفاده از Personal Access Token (توصیه می‌شود)

1. **ایجاد Token:**
   - برو به: https://github.com/settings/tokens
   - "Generate new token" → "Generate new token (classic)"
   - نام: "Messenger Project"
   - Scopes: انتخاب `repo` (همه)
   - Generate token
   - **Token را کپی کن** (فقط یکبار نمایش داده می‌شود!)

2. **استفاده از Token:**
   ```bash
   cd C:\development\Messenger-clean
   
   # هنگام push، به جای password از token استفاده کن
   git push -u origin main
   
   # Username: syeedalireza
   # Password: <paste your token here>
   ```

3. **ذخیره Token (اختیاری):**
   ```bash
   git config --global credential.helper manager-core
   # Token را یکبار وارد کنید، بعد ذخیره می‌شود
   ```

### گزینه C: استفاده از SSH (برای حرفه‌ای‌ها)

```bash
# 1. ایجاد SSH key (اگر ندارید)
ssh-keygen -t ed25519 -C "dev@messenger.local"
# Enter را بزنید برای default location
# Password اختیاری است

# 2. کپی کردن public key
cat ~/.ssh/id_ed25519.pub

# 3. اضافه کردن به GitHub
# برو به: https://github.com/settings/keys
# "New SSH key" → Paste کن → Add

# 4. تغییر remote به SSH
cd C:\development\Messenger-clean
git remote set-url origin git@github.com:syeedalireza/messenger.git

# 5. Push
git push -u origin main
```

---

## مرحله 2: Push و ایجاد Branch‌های حرفه‌ای

بعد از setup authentication، من اسکریپتی آماده کردم که:
- ✅ Main branch را push می‌کند
- ✅ چندین feature branch ایجاد می‌کند
- ✅ برای هر branch commit‌های معنادار می‌زند
- ✅ همه را به GitHub push می‌کند

**فقط بگو تا اسکریپت را اجرا کنم!**

---

## نکات مهم:

1. **هرگز Token را commit نکن!**
2. **Token را در جای امنی نگه دار**
3. **اگر Token را گم کردی، یکی جدید بساز**

---

**آماده‌ای که authentication را setup کنی؟**
من منتظرم تا بگویی، سپس branch‌های حرفه‌ای را ایجاد می‌کنم.
