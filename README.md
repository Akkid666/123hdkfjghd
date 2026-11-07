# Private File Share for Vercel

A small password-protected file-sharing site. Uploads require deliberate selection in the browser. Files are stored in a **private Vercel Blob store** and downloads pass through an authenticated API route; raw Blob URLs are never shown.

## Included

- `/` — sign-in and private file list/downloads
- `/upload.html` — password-protected manual upload page
- `/api/auth/login` and `/api/auth/logout` — signed, HttpOnly session cookie
- `/api/upload` — receives selected files (maximum 2 per form, 4 MB each)
- `/api/files` — lists files only after authentication
- `/api/download` — streams private files only after authentication

## Deploy

1. Create a Vercel project by importing this folder/repository.
2. In Vercel Storage, create a **Blob store with access set to Private** and connect it to this project. Vercel should add `BLOB_READ_WRITE_TOKEN`.
3. In Project → Settings → Environment Variables, add:
   - `APP_PASSWORD`: a long, unique password you do not use elsewhere.
   - `SESSION_SECRET`: a random secret of at least 32 characters.
4. Deploy or redeploy after adding the variables.

Example way to generate a session secret locally with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Do not put `APP_PASSWORD`, `SESSION_SECRET`, or `BLOB_READ_WRITE_TOKEN` in frontend JavaScript, HTML, GitHub, or chat messages.

## Notes

- The Blob store must be **Private**, not Public. Private storage is a Vercel Blob feature; see https://vercel.com/docs/vercel-blob/private-storage.
- This starter intentionally supports manual file selection only. It does not collect files from a computer automatically.
- Keep uploads small. The example limits each file to 4 MB and each upload request to one file.
- This is a simple personal tool, not a full enterprise account system. Use a strong password and keep your Vercel account protected with multi-factor authentication.
