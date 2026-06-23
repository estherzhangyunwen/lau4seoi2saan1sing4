# CUHK Roommate Board

A local-first prototype for verified current CUHK students to find roommates,
publish housing needs, and browse student-only listings.

## What is included

- CUHK Link email gate for students using `@link.cuhk.edu.hk`.
- Current-student declaration and 10-digit student ID validation before posting.
- Roommate post composer with area, room type, budget, move-in date, lifestyle
  tags, roommate preference, description, and contact method.
- Search, area filter, max-budget filter, saved listings, and own-post deletion.
- Local browser persistence for the verified session, posts, and saved listings.

> This is an MVP prototype. Before production launch, verification should be
> backed by a CUHK email one-time code, university SSO, or an approved student
> records integration.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```
