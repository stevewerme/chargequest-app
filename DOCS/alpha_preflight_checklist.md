# ChargeQuest Alpha Preflight Checklist (10-user closed test)

This document lists the minimal, practical steps to prepare a stable 10-user alpha.

## 1) Distribution & Build
- [ ] Increment version and build numbers (iOS/Android)
- [ ] EAS build profiles verified (dev, preview)
- [ ] TestFlight internal testing enabled (iOS)
- [ ] Basic release notes (what to test, known limits)

## 2) Crash & Telemetry
- [ ] Add crash reporting (e.g., Sentry) – DSN via env, minimal setup
- [ ] Add lightweight analytics (screen opens, claim success/failure, treasure collected)
- [ ] Verify logs redact PII (location not sent in analytics)

## 3) Permissions & Privacy
- [ ] iOS Info.plist strings verified for foreground location
- [ ] If background location is enabled, confirm copy and behavior
- [ ] In-app privacy note explaining GPS usage and frequency
- [ ] Confirm Supabase RLS active for all user tables

## 4) Cloud Sync Validation
- [ ] Claim a station → verify record in Supabase
- [ ] Renew a claim → verify expiry updates in Supabase
- [ ] Observe real-time subscription delivering updates
- [ ] Logout → unsubscribe cleanup confirmed (no duplicate channels)

## 5) Offline & Caching
- [ ] Launch app offline → station cache renders; no crash
- [ ] Reconnect → next load respects cache age & location threshold
- [ ] Date deserialization verified after app restart

## 6) Map & Location UX
- [ ] Sticky follow works by default; pan breaks follow; reset re-locks
- [ ] No jitter when stationary; adaptive GPS intervals observed (10s/30s)
- [ ] Success toast not obstructing header; appears below

## 7) Claim & Treasure Flow
- [ ] Tap-to-claim awards XP and spawns treasure where expected
- [ ] Treasure collection grants correct XP per rarity
- [ ] Weekly reset log messages visible; missing spawns are backfilled
- [ ] Rarity distribution logs sum to 1000 exactly

## 8) Device Matrix Smoke Test
- [ ] iPhone small + large (e.g., SE + Pro Max)
- [ ] 1 Android device if available (Map, GPS, claim)
- [ ] Test in city and lower-density area (observe rural multiplier logs)

## 9) Support & QA
- [ ] In-app “Report a bug” link (mailto or simple form)
- [ ] Version/build visible somewhere (settings/profile)
- [ ] 10-minute QA script prepared (first-launch → claim → collect → reset → logout)

## 10) Go/No-Go
- [ ] No crashes in 30–60 min session
- [ ] Acceptable battery usage with adaptive GPS
- [ ] Claims, treasures, and sync operate reliably

Notes
- Keep Dev tools behind gesture (already implemented)
- Monitor console logs for: cache hits, GPS mode, distribution totals
- After alpha, plan Phase: instrumentation and beta ramp
