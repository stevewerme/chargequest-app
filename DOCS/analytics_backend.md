## ChargeQuest Analytics Backend (Alpha)

Environment variables (copy into `.env.local`)

```
EXPO_PUBLIC_EVENTS_API_URL=https://sakweromcxocuaaaamqc.supabase.co/functions/v1
EXPO_PUBLIC_EVENTS_API_TOKEN=<copy-from-supabase-secret EVENTS_INGEST_TOKEN>
```

Supabase secrets (Project Settings → Secrets)
- EVENTS_INGEST_TOKEN: strong random token
- DASHBOARD_TOKEN: strong random token

Endpoints
- POST `${EXPO_PUBLIC_EVENTS_API_URL}/events` (Bearer `EXPO_PUBLIC_EVENTS_API_TOKEN`)
- GET `.../metrics/summary?range=24h|7d` (Bearer `DASHBOARD_TOKEN`)
- GET `.../metrics/timeseries?event=claim_succeeded&interval=hour&range=24h` (Bearer `DASHBOARD_TOKEN`)
- GET `.../metrics/events?type=error&limit=100` (Bearer `DASHBOARD_TOKEN`)

Client events instrumented
- app_open, claim_started, claim_succeeded, treasure_spawned, treasure_collected, error

Notes
- Payloads are pruned of precise location fields server-side.
- If env tokens are missing, client logs events to console only.

