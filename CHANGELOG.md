# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Initial project scaffold with layered architecture (bounded contexts, dependency-cruiser enforcement)
- ApiTokenStrategy authentication
- `check_auth` and `list_my_courses` MCP tools

### Added (Plan 2)

- `MfaStrategy` interface with 4 adapters: `NoMfaStrategy`, `TotpMfaStrategy` (RFC 6238 via otplib, with algorithm allowlist hardening), `ManualPromptMfaStrategy`, `DuoPushMfaStrategy` (polling with timeout).
- 4 new authentication strategies: `SessionCookieStrategy`, `HeadlessPasswordStrategy` (with MFA fan-out), `OAuthStrategy` (Authorization Code + PKCE + refresh token rotation + CSRF state verification), `BrowserAuthStrategy` (Playwright, lazy-loaded).
- 3 new credential stores: `KeychainCredentialStore` (keytar, lazy-loaded), `EncryptedFileCredentialStore` (AES-256-GCM, pinned scrypt params N=2^15/r=8/p=1, atomic writes, 0600 perms), `CompositeCredentialStore` (routes env:/keychain:/file: by scheme).
- `FileSessionCache` with `proper-lockfile` and atomic writes for cross-process safety.
- `AuthStrategyResolver` + `ConfigBackedStrategyResolver` with auto-detect and fallback chain; `EnsureAuthenticated` now orchestrates the chain.
- `FallbackChainExhaustedError` domain error.
- Extended `SecretResolver` to resolve `keychain:<service>/<key>` and `file:<path>` refs via the credential store.
- Extended config schema (Zod v4) with per-strategy config blocks and MFA config, cross-field validation via `superRefine`.
- Optional peer dependencies: `otplib`, `keytar`. New runtime dependency: `proper-lockfile`.
- Composition root wires all strategies based on profile config.
