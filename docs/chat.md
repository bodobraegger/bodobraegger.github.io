# Site chat

A small chat in the corner of every page, on Supabase, replacing the Chatango
embed. This document is the specification. Five work packages at the end build
it in parallel; the contracts between them are fixed here.

## What the Chatango widget does today

Observed on the live site on 2026-09-14.

- A fixed bar, 280 by 21 pixels, at the bottom right. Margins 1.75rem at the
  sides and `calc(1.75rem - 2px)` at the bottom. Transparent background, so the
  site's dashed border and blur show (`iframe[src*='chatango']` in
  `src/styles/main.css`).
- Left of the bar: a small arrow. Middle: a ticker that cycles the latest
  messages as `name: text`. Right: the number of people online.
- Desktop: the arrow swaps the ticker for a one-line message input in the same
  bar. There is no taller box.
- Phone: the whole bar is a link to `brbrbrbrbrbrb.chatango.com` in a new tab.
- The script loads on the first pointer, key, scroll or touch event, or when
  the page is idle 10 seconds after load (`src/lib/chat-widget.ts`).
- `html.pens-open` hides it while the touch pen toolbar is open. The translator
  page hides it under 768px. The pen toolbar is drawn to the same 21px height
  and the same margins, so the two line up in the corner.

## What the new chat does

Same place, same bar, same loading. Two differences: the bar opens into a box
on every device, and nothing leaves the page.

### Collapsed bar

- Same size, place and margins as today. A `<button>` with `aria-expanded`.
- Left: an arrow glyph pointing up (the box opens upward). Middle: the ticker.
  Right: the online count.
- The ticker is one line of the newest 10 messages as `name: body`, joined
  by `·`, that scrolls through the bar by a CSS animation at about 6
  characters per second and loops without a seam. Reduced motion stops it.
- Clicking or tapping anywhere on the bar opens the box.

### Expanded box

The bar stays where it is and becomes the bottom row of a box that grows
upward from it. The box is the same width as the bar on desktop, 280px. On
phones it spans the viewport minus the 1.75rem margins. It is at most 50vh
tall and at least 200px.

Top to bottom:

1. The message list. While older messages exist, its first line is a muted
   `↑ earlier messages` link that loads 50 more above and keeps the scroll
   position.
2. The list itself. `role="log"`, `aria-live="polite"`. Each message is one
   block: `name` in `--fg-deep`, then the body. Messages from this browser's
   user id carry class `mine`. Time on hover (`title`), not in the flow.
   Scrolled to the bottom on open and on every new message while the reader is
   at the bottom; a reader who scrolled up is not moved.
3. The bottom row, 21px, the bar itself: the arrow now points down and closes
   the box; the ticker's place holds the input; the online count stays right.

The input is a single-line `<input>`. Enter sends. Empty and whitespace-only
input does nothing. Body limit 500 characters, enforced by `maxlength` and by
the database. While a send is in flight the input is disabled.

### Name

No accounts, and no question before the first message. A browser that has not
chosen a name sends as its auto name: two dictionary words picked by a hash
of its user id (`mossy otter`), so the same browser keeps the same name
without storing anything. The name is sent with every message.

After the first send from a browser without a chosen name, a one-line offer
appears directly above the bottom row: `sent as mossy otter · ` followed by a
name input, placeholder `set a name`, limit 24 characters. Enter stores the
name under localStorage key `chat-name`, calls `setChatName`, and the offer
goes away. The rename applies to every message this user id has sent, the one
just sent included: the database function renames the rows, the widget renames
them in its list at once, and the UPDATE events rename them for everyone else.
Escape or an empty Enter dismisses the offer for this page view; it returns
after the next send while no name is chosen.

Clicking your own name in the list brings the same name input back, prefilled,
for changing a chosen name.

### Loading and mounting

- `src/lib/chat-widget.ts` keeps `loadChatWidgetOnInteraction()` and the same
  trigger events and 10 second idle fallback. Instead of injecting a script it
  sets the exported `chatWanted` ref to `true`.
- `App.vue` renders `<ChatWidget>` inside `<ClientOnly>` when `chatWanted` is
  true. `ChatWidget` is a `defineAsyncComponent`, so its chunk and the Supabase
  client load only then.
- On mount the widget calls `getSupabase()`. Without configuration (no env) it
  renders nothing. With it: fetch the newest 20 messages for the ticker, then
  subscribe. Opening the box fetches the newest 50 if fewer are loaded.

### Live updates and presence

One realtime channel named `chat`, opened once per page:

- `postgres_changes` INSERT on `public.chat_messages` appends the message.
- `postgres_changes` UPDATE replaces the message with that id (a rename).
- `postgres_changes` DELETE removes the message with that id from the list.
- Presence, keyed by the browser's user id (`getUserId()` from
  `src/lib/page-views.ts`), tracking `{}`. The online count is the number of
  presence keys. The same person in two tabs counts once.

### Hiding

- `html.pens-open .chat-widget { display: none }` replaces the iframe rule.
- The translator page's mobile rule hides `.chat-widget` where it hid `iframe`.
- `@media print` hides it.

### New message from someone else

A short bleep (an 80ms oscillator tone at low gain, no sound file) and the
panel border turns red for one second. Own messages stay quiet.

### Images

Dropping an image file on the box sends it: the file is shrunk to at most
320px a side, reduced to black and white with an ordered Bayer dither, and
encoded as PNG in the browser (`src/lib/dither.ts`), which also drops its
metadata. The PNG is uploaded to the public bucket `chat-images` under
`chat/<uuid>.png` (`src/db/chat-images.sql`: 64 KB cap, PNG only), then the
message is posted with the path in its `image` column and whatever text the
input held. The list shows the image under the body, inverted in dark mode
like the rest of the ink; the ticker shows `[image]`. No picker button, no
preview, no paste, one image per message.

### Your own messages, for 15 minutes

A message of this browser's user id younger than 15 minutes shows two muted
links after its body: `edit` puts the text in the bottom input (Enter saves,
Escape cancels), `delete` removes it at once, no confirm. Both go through
`edit_chat_message` and `delete_chat_message` (`src/db/chat-edit.sql`), which
check the user id and the window on the server; the links are the client's
view of the same rule. A deleted message's image stays in the bucket.

### Not done on purpose

- No unread badge, no emoji picker, no links parsed in bodies. Bodies render
  as text.
- No moderator badge on the site. Deleting is an admin page action.
- No profanity or spam filter beyond the rate limit below.

## Data

One table, two functions. File: `src/db/chat-schema.sql`, run once in the
Supabase SQL editor. It is idempotent (`IF NOT EXISTS`, `DROP POLICY IF
EXISTS`), like the other schema files.

```sql
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 24),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chat_messages_created_idx ON public.chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_user_created_idx ON public.chat_messages (user_id, created_at DESC);
```

Access:

- `SELECT`: everyone.
- `INSERT`: nobody directly. `REVOKE INSERT ON public.chat_messages FROM anon,
authenticated`. The only way in is the function below.
- `UPDATE`: nobody directly. Only `set_chat_name` below.
- `DELETE`: `authenticated` only (your Supabase login, as for strokes).

Function `post_chat_message(name TEXT, body TEXT) RETURNS public.chat_messages`,
`SECURITY DEFINER`, `search_path = public`:

- Reads the user id from the request header, as the stroke policies do:
  `current_setting('request.headers', true)::json->>'x-user-id'`. Raises if
  missing.
- Trims `name` and `body`. Raises on empty or over the limits.
- Rate limit: raises `rate_limited` if this user id has a message newer than
  2 seconds. Also raises if the user id has more than 30 messages in the last
  10 minutes.
- Inserts and returns the row.

Function `set_chat_name(name TEXT) RETURNS INTEGER`, `SECURITY DEFINER`,
`search_path = public`:

- Reads the user id from the same header. Raises if missing.
- Trims `name`. Raises on empty or over 24 characters.
- `UPDATE public.chat_messages SET name = ... WHERE user_id = ...` and returns
  the number of rows renamed.

Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages`
in the same guarded `DO` block the strokes file uses. Default replica identity
is enough: an UPDATE event carries the whole new row and a DELETE event carries
the primary key.

## Client contract

These two files exist on `main` before the work starts. Workers build against
them and do not change their exported names or signatures.

`src/types/chat.ts`:

```ts
export interface ChatMessage {
  id: string
  userId: string
  name: string
  body: string
  createdAt: string
}
```

`src/lib/chat.ts` (Worker B fills in the bodies):

```ts
export const CHAT_NAME_STORAGE_KEY = 'chat-name'
export const CHAT_NAME_MAX_LENGTH = 24
export const CHAT_BODY_MAX_LENGTH = 500
export const CHAT_PAGE_SIZE = 50
export const CHAT_TICKER_SIZE = 20

/** The chosen name from localStorage, or the auto name: two words picked by the user id. */
export function getChatName(): string
/** True once a name was chosen in this browser. */
export function hasChosenChatName(): boolean
/** Stores the name and renames every message of this user id through set_chat_name. */
export function setChatName(name: string): Promise<void>

/** Newest `limit` messages, oldest first. `before` pages backwards from a createdAt. */
export function fetchMessages(limit: number, before?: string): Promise<ChatMessage[]>

/** Sends through post_chat_message. Rejects with the database error message. */
export function postMessage(name: string, body: string): Promise<ChatMessage>

export interface ChatSubscription { unsubscribe: () => void }
export function subscribeChat(handlers: {
  onInsert: (message: ChatMessage) => void
  onUpdate: (message: ChatMessage) => void
  onDelete: (id: string) => void
  onPresence: (onlineCount: number) => void
}): Promise<ChatSubscription | null>
```

`subscribeChat` resolves to `null` when Supabase is not configured. Everything
goes through `getSupabase()` from `src/lib/supabase.ts`; the client already
sends `x-user-id`.

## Style

Reuse what the pen toolbar already has. The chat widget is the sibling of
`.pen-toolbar` in `src/components/PenToolbar.vue`: same fixed corner, same
21px rows, same `1px dashed var(--fg)` border, same `backdrop-filter: blur(2px)`,
`font-mono`, `font-size: 0.85rem`. Solid border on hover, as the iframe rule
does today. `z-index: 1000`, one below the pen toolbar. Colours only from the
tokens in `src/styles/main.css` (`--fg`, `--fg-deep`, `--fg-muted`, `--c-bg`,
`--c-border`). No new colours, no shadows, no transforms on click.

## Admin

`pages/admin/chat.md` mounts `ChatAdmin.vue`, built like `StrokeAdmin.vue`:
sign in with the Supabase login, newest 200 messages in a table (time, name,
user id, body), checkbox per row, `delete (n)` button, confirm, undo of the last
delete by re-insert is not offered (insert is closed; deleted is deleted). The
sign-in form and auth state move into `src/composables/useSupabaseAuth.ts` and
`StrokeAdmin.vue` uses it too.

## Work packages

Each runs in its own worktree on a branch from `main` and commits with
`--no-verify`. A package only touches the files it owns. The merge order is
A, B, C, D, E; the integrator runs the build and a browser check after.

| Package           | Owner branch  | Files                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A: schema         | `chat/schema` | `src/db/chat-schema.sql`                                                                                                                                                                                                                                                                                |
| B: transport      | `chat/lib`    | `src/lib/chat.ts` (fill in the stub)                                                                                                                                                                                                                                                                    |
| C: widget         | `chat/widget` | `src/components/ChatWidget.vue`                                                                                                                                                                                                                                                                         |
| D: mount and hide | `chat/mount`  | `src/lib/chat-widget.ts`, `src/App.vue`, `src/styles/main.css`, `src/components/BidiTranslator.vue` (the one mobile rule), `src/components/PenToolbar.vue` (two comments only), `index.html` (remove the dns-prefetch), `pages/notes/2026-04-08_arte_digital_portfolio_talk.md` (the Chatango sentence) |
| E: admin          | `chat/admin`  | `src/components/ChatAdmin.vue`, `pages/admin/chat.md`, `src/composables/useSupabaseAuth.ts`, `src/components/StrokeAdmin.vue`                                                                                                                                                                           |
