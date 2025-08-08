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

## 11) Analytics Backend & Lovable Dashboard

Backend (Supabase)
- [ ] Create table `events` with minimal PII
  - `id uuid default gen_random_uuid() primary key`
  - `user_id uuid null` (when signed-in)
  - `device_id text not null` (hashed stable ID)
  - `session_id text not null`
  - `app_version text not null`
  - `platform text not null` (ios/android)
  - `type text not null` (e.g., app_open, claim_started, claim_succeeded, treasure_spawned, treasure_collected, error)
  - `payload jsonb not null default '{}'::jsonb` (no precise GPS; optional rarity, station_id)
  - `created_at timestamptz default now()`
- [ ] Indexes: `created_at`, `type`, `(type, created_at)`
- [ ] RLS: disable direct client writes; prefer Edge Function for inserts
- [ ] Edge Function POST `/events`
  - Validates `type`, prunes payload keys, rate-limits per `device_id`
  - Writes batch or single events to `events`
  - Auth: shared bearer token via header (stored as env/secret on clients)
- [ ] Edge Function GET `/metrics/*`
  - `/metrics/summary?range=24h|7d` → totals: app_open, claims started/succeeded, success rate, treasures by rarity
  - `/metrics/timeseries?event=claim_succeeded&interval=hour&range=24h`
  - `/events?type=error&limit=100` (debug only, guarded)
  - Auth: dashboard token (not service key) via header
- [ ] Data retention policy: keep 60 days; scheduled job to prune
- [ ] Privacy: no precise location; if needed, only coarse geohash (5+) or omit entirely

App instrumentation
- [ ] Add minimal event poster with retry + backoff
  - `app_open` (on launch)
  - `claim_started`, `claim_succeeded` (include station_id, but no coordinates)
  - `treasure_spawned` (rarity), `treasure_collected` (rarity)
  - `error` (category + code only)
- [ ] Include `app_version`, `platform`, `session_id`, `device_id (hashed)`
- [ ] Configure `EVENTS_API_URL` and `EVENTS_API_TOKEN` via env

Lovable dashboard
- [ ] Build simple web UI in Lovable consuming `/metrics/*`
- [ ] Views: Summary KPIs, Time series (claims, actives), Rarity distribution, Error feed
- [ ] Filters: Date range, Platform, App version
- [ ] Protect with dashboard token; store secrets in Lovable project settings

QA for analytics
- [ ] Verify events appear in `events` within seconds
- [ ] Check rate limiting works (spam protection)
- [ ] Confirm dashboard renders KPIs and time series correctly

Notes
- Keep Dev tools behind gesture (already implemented)
- Monitor console logs for: cache hits, GPS mode, distribution totals
- After alpha, plan Phase: instrumentation and beta ramp
