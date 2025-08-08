## ChargeQuest Analytics Backend (Alpha)

Environment variables (copy into `.env.local`)

```
EXPO_PUBLIC_EVENTS_API_URL=https://sakweromcxocuaaaamqc.supabase.co/functions/v1
EXPO_PUBLIC_EVENTS_API_TOKEN=<copy-from-supabase-secret EVENTS_INGEST_TOKEN>
```

Supabase secrets (Project Settings → Secrets)
- EVENTS_INGEST_TOKEN: strong random token
- DASHBOARD_TOKEN: strong random token

Endpoints (headers)
- POST `${EXPO_PUBLIC_EVENTS_API_URL}/events`
  - `Authorization: Bearer <SUPABASE_ANON_KEY>` (required by platform)
  - `x-events-token: <EVENTS_INGEST_TOKEN>` (your secret)
- GET `.../metrics/summary?range=24h|7d`
  - `Authorization: Bearer <SUPABASE_ANON_KEY>` (required by platform)
  - `x-dashboard-token: <DASHBOARD_TOKEN>` (your secret)
- GET `.../metrics/timeseries?event=claim_succeeded&interval=hour&range=24h`
  - same headers as summary
- GET `.../metrics/events?type=error&limit=100`
  - same headers as summary

Client events instrumented
- app_open, claim_started, claim_succeeded, treasure_spawned, treasure_collected, error

Notes
- Payloads are pruned of precise location fields server-side.
- If env tokens are missing, client logs events to console only.

Verification (cURL)

- Ingest test (should create a row in `public.events`)

```bash
curl -X POST "https://sakweromcxocuaaaamqc.supabase.co/functions/v1/events" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "x-events-token: <EVENTS_INGEST_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type":"app_open",
    "device_id":"dev_test",
    "session_id":"sess_test",
    "app_version":"0.1.0",
    "platform":"ios",
    "payload":{}
  }'
```

Expected: `201 { "success": true }`
- If `401 Unauthorized`: the `x-events-token` doesn’t match `EVENTS_INGEST_TOKEN`
- If `Invalid JWT`: the `Authorization` bearer is not the project anon key

- Metrics summary test (used by Lovable dashboard)

```bash
curl "https://sakweromcxocuaaaamqc.supabase.co/functions/v1/metrics/summary?range=24h" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "x-dashboard-token: <DASHBOARD_TOKEN>"
```

Expected: JSON with counts and successRate
- If `401 Unauthorized`: the `x-dashboard-token` doesn’t match `DASHBOARD_TOKEN`

