# RepostFlow — TikTok Repost Cleaner

A personal web application project for organizing and tracking TikTok repost removal.

## Project goal

Build a secure, responsive dashboard that can:
- Connect to TikTok through **official OAuth login**, once developer credentials and required approvals are available.
- Help track reposts and removal progress.
- Offer a user-assisted manual removal workflow.
- Support automated removal **only if TikTok documents and authorizes the required API functionality**.

> **Status:** Project initialized. No website, TikTok connection, or automatic repost deletion is implemented yet.

## Planned development

1. Check the official TikTok developer documentation and document what is technically permitted.
2. Build a Next.js + TypeScript + Tailwind CSS website.
3. Add a clearly labeled demo mode that works without TikTok credentials.
4. Integrate TikTok Login Kit for Web with secure OAuth handling.
5. Create an accessible Arabic/English dashboard and manual repost-removal assistant.
6. Add automated tests, security checks, and local setup documentation.

## Security principles

- Never collect or store a TikTok password.
- Never commit access tokens, client secrets, or other credentials.
- Never use private or undocumented TikTok APIs to bypass platform restrictions.
- Never claim a repost was removed without verified confirmation.
- Never delete original videos.

## Repository

Codex will implement the application here and update this README with accurate installation and running instructions after the code and tests exist.

