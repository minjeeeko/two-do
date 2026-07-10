# DOMO — Supabase backend

SQL to create the real database behind the app. The migrations create the
tables, Row Level Security, helper RPCs, storage buckets, and realtime for the
current chore-based (할 일) model.

## Files (apply in order)

| File | What it creates |
|---|---|
| `migrations/0001_schema.sql` | extensions, enums, tables, triggers, RLS helper functions, auto-profile-on-signup |
| `migrations/0002_policies.sql` | Row Level Security policies for every table |
| `migrations/0003_rpc.sql` | `create_couple`, `generate_invite`, `accept_invite`, `disconnect_couple` |
| `migrations/0004_storage.sql` | `avatars` (public) + `letters` (private) storage buckets & policies |
| `migrations/0005_realtime.sql` | adds collaborative tables to the realtime publication |

## Tables

`profiles` · `couples` · `couple_members` · `couple_invites` · `chore_categories` ·
`chores` · `chore_reactions` · `chore_comments` · `house_messages` · `letters` ·
`notifications` · `access_log`

Security model: every couple owns its rows, and RLS lets a signed-in user touch
a row only when they belong to that couple (`is_couple_member(couple_id)`).
Profiles are visible to yourself and your partner only.

## Apply it

### Option A — Supabase CLI (recommended)

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push          # runs everything in supabase/migrations in order
```

### Option B — SQL editor

Open the Supabase dashboard → SQL Editor and paste each file's contents in
order (0001 → 0005), running one at a time.

## Wire up the client

1. `npm i @supabase/supabase-js`
2. Copy `.env.example` → `.env.local` and fill in the URL + anon key
   (Project Settings → API).
3. Create the client:

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

### Typical flows

```ts
// after sign-up / sign-in, a profiles row already exists (trigger).
await supabase.from('profiles').update({ nickname: '민지', color_tag: 'grape' }).eq('id', uid)

// create the couple, then share the code
const { data: coupleId } = await supabase.rpc('create_couple', { p_name: '우리 집' })
const { data: code }     = await supabase.rpc('generate_invite', { p_couple_id: coupleId })

// partner joins with the code
const { data: joinedCoupleId } = await supabase.rpc('accept_invite', { p_code: 'ABC123' })

// add a 할 일
await supabase.from('chores').insert({
  couple_id: coupleId, owner_type: 'together', title: '같이 장보기',
  category: '장보기', chore_date: '2026-07-10', created_by: uid,
})

// send a 손편지: upload the drawing, then insert the row
const path = `${coupleId}/${crypto.randomUUID()}.png`
await supabase.storage.from('letters').upload(path, pngBlob, { contentType: 'image/png' })
await supabase.from('letters').insert({ couple_id: coupleId, user_id: uid, image_path: path })
```

## Regenerate the TypeScript types

`src/lib/database.types.ts` is hand-written to match this schema. To regenerate
from the live database instead:

```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```

## Notes

- The app currently runs on a local zustand store (offline demo). These
  migrations are the backend to migrate onto; the store actions map 1:1 to the
  tables above.
- Images (avatars / 손편지) move from data-URLs in the store to Storage buckets:
  `avatars/<user_id>/…` and `letters/<couple_id>/…` (paths matter — the storage
  policies key off the first folder segment).
- Legacy mission/checkin/points/badge types in `src/types.ts` are unused by the
  current UI and intentionally have no tables here.
