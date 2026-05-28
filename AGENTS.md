# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

---

# TaxUpdates project context

This is a hobby iOS app being built solo by the user on Windows. May graduate to a business venture if it gets traction.

## What it is
A mobile app for **UK and US tax practitioners** that combines:
- Practical **calculators** (UK Income Tax, UK CGT, UK Corporation Tax, US Federal Income Tax)
- **Decision-tree tools** (IR35 status the headline one)
- **Scenario save + A/B compare** with stale-state detection when rates change
- A lightweight **regulatory updates feed** (gov.uk Content API + IRS bulletins, daily-polled)
- **Deadline reminders** with a home screen widget
- **Citation engine** — every calculation links to HMRC manual / IRC section / IRS pub

## What it isn't
- Not EU-focused (UK + US only at launch)
- Not an accounting standards tool (no IFRS / FASB for v1)
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

## MVP feature list (6–10 week solo target)
1. ✅ Tab shell with 5 sections
2. ⬜ UK Income Tax calculator
3. ⬜ Deadlines list + home screen widget
4. ⬜ Scenario save + compare
5. ⬜ UK CGT calculator
6. ⬜ US Federal Income Tax calculator
7. ⬜ IR35 decision tree with PDF output
8. ⬜ Updates tab (GitHub Actions cron → JSON → in-app feed)
9. ⬜ UK Corporation Tax calculator
10. ⬜ Citation engine on every calculator
11. ⬜ App icon, splash screen, polish, TestFlight via EAS

## How to behave in this codebase
- **Citations and "informational, not advice" framing are non-negotiable** — this is regulatory content
- Prefer **offline-capable** features (calculators, decision trees, cached data)
- Prefer **Expo Go–compatible** libraries until we move to dev builds (no native modules outside the Expo SDK)
- Build in **vertical slices** — the user wants something they can play with on their phone ASAP after each session
- Don't introduce abstractions speculatively; the calculator pattern can be extracted later when we have 2+
- The user is **on Windows, develops in VS Code, runs Expo on physical iPhone via Expo Go**. Any advice assuming a Mac workflow will be wrong.
