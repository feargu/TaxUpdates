# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

---

# TaxUpdates project context

This is a hobby iOS app being built solo by the user on Windows. May graduate to a business venture if it gets traction.

## What it is (v1 scope, tightened 2026-05-28)
A mobile app for **UK tax practitioners** that combines:
- Practical **calculators** (UK Income Tax, UK CGT)
- **IR35 decision tree** with PDF output (the most distinctive feature)
- A lightweight **UK regulatory updates feed** (gov.uk Content API + HMRC announcements, daily-polled)
- **UK deadline reminders** (self-assessment, PAYE, VAT, corporation tax filing dates)

## What it isn't (v1)
- Not US-focused. US Federal Income Tax dropped from v1 — UK only at launch. (Possibly v2 once UK ships)
- No scenario save + compare in v1 (deferred — would be a v1.1 addition based on user feedback)
- No home-screen widget in v1 (forces switch from Expo Go to custom dev build — too costly for v1; v1.1)
- No citation engine in v1 (deferred — add per-calculator gradually post-launch)
- No UK Corporation Tax calculator in v1 (smaller audience than Income Tax — defer)
- Not EU-focused
- Not an accounting standards tool (no IFRS / FASB)
- Not a research / advisory product — it's a monitoring + utility tool, never a consulting funnel
- Not a continuous-LLM product — running cost would kill it for a hobby project. LLM only on-demand if added later.
- Not multi-user (single-user only for now, architected to scale)

## Strategic positioning
Differentiates from Big 4 mobile apps (BDO Germany, Deloitte Germany — the trigger competitors) which are content-heavy lead-gen funnels for their consulting business. An independent app has the opposite incentive: be useful first, never redirect.

## Build setup
- **Develop on Windows** in VS Code (user has no Mac, strongly prefers this workflow)
- **Expo + React Native + expo-router + TypeScript**
- Test on physical iPhone via **Expo Go** during dev
- For production builds: **EAS Build** (Expo's cloud Mac service) — no local Mac required, ever
- Cost: ~$0/mo pre-publish; $99/yr Apple Developer + ~$20/mo EAS once actively building

## Critical SDK constraint
- **Project is locked to Expo SDK 54** (`expo: ~54.0.33`)
- App Store Expo Go only supports SDK 54 (SDK 55 awaiting Apple approval; SDK 56 is beta)
- DO NOT casually upgrade SDK — verify Expo Go App Store status first
- When we add the home-screen widget, will need to switch from Expo Go to a custom dev build via EAS (Expo Go doesn't support widgets)

## Windows tooling gotchas
- PowerShell execution policy was blocking `npx.ps1` — already fixed with `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Expo dev server spawns multiple `node.exe` processes; `Ctrl+C` doesn't always kill them — use `Stop-Process -Id <PID> -Force` on the lingering ones
- PowerShell working-directory persistence is unreliable across tool calls in this harness — always use absolute paths

## Current state (2026-05-28)
- Phase 0 complete: dev environment + Hello World on iPhone via Expo Go
- Phase 1 complete: 5-tab shell (Calculators / Tools / Updates / Deadlines / Settings) with placeholder content
- **Next up:** UK Income Tax calculator on the Calculators tab — the first real feature with logic

## v1 MVP feature list (UK-only, ~22–28 paired hours / 4–7 sessions)
1. ✅ Tab shell with 5 sections
2. ⬜ UK Income Tax calculator (rUK only — Scottish bands deferred)
3. ⬜ UK Deadlines list (no widget)
4. ⬜ IR35 decision tree with PDF output
5. ⬜ Updates tab (GitHub Actions cron → JSON → in-app feed, gov.uk only)
6. ⬜ UK CGT calculator
7. ⬜ App icon, splash screen, polish, TestFlight via EAS

## Deferred to v1.1+ (build only after v1 ships)
- Home-screen widget (requires switch from Expo Go to EAS dev build)
- Scenario save + A/B compare
- Citation engine
- UK Corporation Tax
- US Federal Income Tax (and US scope generally)
- Scottish income tax bands
- Multi-user / accounts

## How to behave in this codebase
- **Citations and "informational, not advice" framing are non-negotiable** — this is regulatory content
- Prefer **offline-capable** features (calculators, decision trees, cached data)
- Prefer **Expo Go–compatible** libraries until we move to dev builds (no native modules outside the Expo SDK)
- Build in **vertical slices** — the user wants something they can play with on their phone ASAP after each session
- Don't introduce abstractions speculatively; the calculator pattern can be extracted later when we have 2+
- The user is **on Windows, develops in VS Code, runs Expo on physical iPhone via Expo Go**. Any advice assuming a Mac workflow will be wrong.
