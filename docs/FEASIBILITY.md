# TikTok feasibility for RepostFlow

**Checked:** 21 October 2026. This document records only capabilities described by TikTok's public documentation. Product behavior and approval requirements can change; re-check the linked pages before enabling a real integration.

## Sources

- [TikTok for Developers](https://developers.tiktok.com/)
- [Login Kit for Web](https://developers.tiktok.com/docs/en/login-kit-web)
- [Scopes overview](https://developers.tiktok.com/docs/en/scopes-overview)
- [Add a Sandbox](https://developers.tiktok.com/docs/en/add-a-sandbox)
- [App review guidelines](https://developers.tiktok.com/docs/en/app-review-guidelines)
- [TikTok Support: Repost](https://support.tiktok.com/en/using-tiktok/exploring-videos/repost)

## Findings

### Repost listing

The public developer documentation and scopes list do not document a product/API endpoint or scope that returns the authenticated user's **reposted videos**. TikTok's support article describes repost as an in-app feature; that article is not an API contract. The documented video-list capability must not be interpreted as a repost list: a list of videos published by an account is different from videos that account reposted.

**Decision:** `canListReposts` is false for the real provider. Repost counts and completion totals shown by RepostFlow must come from the user's manually maintained list unless a later TikTok document explicitly provides an authorized repost-list capability.

### Removing a repost

The public developer documentation linked above does not document an authorized endpoint, scope, or operation for removing a user's repost. The support article explains how a person can use TikTok's own product controls, but it does not grant third-party automation permission.

**Decision:** `canRemoveReposts` is false for the real provider. RepostFlow must not call private endpoints, replay app traffic, scrape pages, extract cookies, bypass CAPTCHA, or automate the TikTok UI.

### Bulk removal

No public TikTok developer document in the sources above describes bulk repost removal. Because no individual removal operation is documented, a bulk operation cannot be inferred from any documented video publishing or listing API.

**Decision:** `canBatchRemove` is false. There is no real-provider “Delete all” action, and no claim of an accurate remaining-repost count.

### OAuth scopes and Login Kit

Login Kit for Web is the documented authorization mechanism. The scopes overview is authoritative for scope names and user consent. RepostFlow requests only scopes that are both listed by TikTok and needed by an implemented feature. There is currently no documented repost-list or repost-remove scope, so the app must not invent one or ask for an unrelated scope as a substitute. The app's account connection can therefore authenticate a user without implying repost-management permission; available profile fields and any additional scopes remain subject to TikTok's current documentation and app approval.

Tokens and client secrets stay server-side. OAuth `state`, redirect URI validation, token expiry handling, and error handling are implementation requirements; they do not create access to undocumented repost operations.

### Sandbox

TikTok's [Sandbox documentation](https://developers.tiktok.com/docs/en/add-a-sandbox) defines the test environment and its target-user/configuration rules. Sandbox availability does not add undocumented production APIs or bypass scope/app-review requirements. RepostFlow may use Sandbox to test the documented Login Kit flow and other capabilities that the current Sandbox documentation explicitly exposes. It must not represent a Sandbox login as proof that repost listing or removal works.

### Review and personal use

The [App review guidelines](https://developers.tiktok.com/docs/en/app-review-guidelines) and each product's documentation govern whether an app can use a capability in production. “Personal use” is not treated here as an automatic exemption from product eligibility, redirect-URI rules, scope consent, review, rate limits, or TikTok terms. A developer account and client credentials alone do not guarantee approval. If TikTok declines a product or scope, RepostFlow keeps that capability disabled and continues to offer the manual workflow.

## What is implemented

- Demo mode uses fictional local data and is clearly labeled.
- The real provider exposes no repost list/removal/bulk capabilities until TikTok publishes and approves the required functionality.
- The manual assistant stores URLs and user-confirmed statuses, opens the official TikTok URL, and explains that the user must use TikTok's own **Remove repost** control.
- Activity history records the user's confirmation; it never asserts that TikTok verified a deletion.
- Original videos are outside this workflow and must never be deleted.

## Reassessment rule

Before enabling any real destructive capability, require a current TikTok developer document that names the operation, endpoint, required scope, authorization/approval requirements, response semantics, and Sandbox behavior. Update this file and the provider implementation together, test with a single explicitly selected item, and preserve a manual fallback.
