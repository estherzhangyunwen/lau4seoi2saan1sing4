# CUHK Roommate Finder (MVP)

This repository now contains a working MVP for a roommate-finding app where only verified CUHK users can publish listings.

## What this MVP includes

- Email-domain verification gate (`@link.cuhk.edu.hk` and `@cuhk.edu.hk`)
- Verification-code flow (dev mode returns the code in API response)
- Session-based login state after verification
- Post creation locked to verified users only
- Public listing feed of roommate posts
- Basic validation and unit tests

## Stack

- Node.js + Express
- `express-session` for session handling
- Simple JSON file storage at `data/posts.json`
- Vanilla HTML/CSS/JS frontend in `public/`

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API summary

- `POST /api/verification/request` `{ email }`
- `POST /api/verification/confirm` `{ email, code }`
- `GET /api/auth/status`
- `GET /api/posts`
- `POST /api/posts` (verified users only)

## Important production notes

The current verification checks CUHK email domain and uses a local code flow for MVP development. For real deployment, integrate:

1. Real email delivery (SendGrid, SES, etc.)
2. Anti-abuse controls (rate limits, CAPTCHA, attempt limits)
3. Student-status re-validation policy (semesterly refresh, alumni handling)
4. Moderation/reporting workflow
