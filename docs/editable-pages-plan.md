# Editable pages: design and implementation plan

Date: 2026-09-07. Author: a research and design pass over the worktree
`.claude/worktrees/perf-plan`.

Inputs: a codebase reconnaissance report, a technology options report with
measured bundle sizes, and `docs/performance-plan.md`. Every claim about the
code in this plan was checked against the source file named beside it.

## 1. Goal and non-goals

### Goal

Selected pages become editable in the browser. A visitor with the right access
presses an edit control, writes markdown in an overlay, drops image files into
the text, and saves. The saved document lives in Supabase and appears at once
for every reader of that page. A scheduled job writes the document and its
images back into the repository, so the next static build serves the same
content as plain HTML. The static build stays the first paint on every page,
and the entry chunk stays under the 40,000 byte gzip budget that
`scripts/check-asset-sizes.sh` enforces.

### Non-goals

This feature does not replace the repository as the source of truth. It does
not add a server, because Supabase is the only backend. It does not give
character by character collaboration, live cursors or offline merge, because a
version column answers the real traffic of a personal site. It does not
reproduce the build output exactly in the browser: syntax colour and responsive
image variants come from the next static build, not from the preview. It does
not edit frontmatter, because frontmatter drives build behaviour and code
execution. It does not open editing on pages that contain Vue components or set
`hydra: true`.

## 2. Decisions with reasons

### 2.1 Access model and the frontmatter key

Decision: add one frontmatter key named `editable` with three values.

| Value     | Meaning                                         | Who may write                  |
| --------- | ----------------------------------------------- | ------------------------------ |
| absent    | The page is not editable. No request runs.      | nobody                         |
| `owner`   | The default opt-in value.                       | the signed in site owner       |
| `invited` | Named editors, listed per base path.            | the owner and invited accounts |
| `public`  | Anonymous editing with attribution and history. | anybody                        |

A second key named `editableImages` with the value `false` turns off image
upload on an editable page.

Reason: the key follows the existing frontmatter pattern. `vite.config.ts`
lines 104 to 114 read the whole frontmatter with `gray-matter` in `extendRoute`
and put it on `route.meta.frontmatter`, and `src/App.vue` line 42 passes it to
`WrapperPost`. That component reads `frontmatter.plum` and `frontmatter.hydra`
the same way, so `frontmatter.editable` needs no new plumbing.

The absent key means "not editable", not "owner". The technology options report
recommends "absent means owner". This plan differs on purpose: an absent key
must cost zero bytes and zero requests on the 37 pages that will never be
edited. An opt-in key matches `DrawablePen`, which does nothing until a page
passes `:cloudStorage="true"`.

The frontmatter is not the authority for access control, because the browser can
send any value. The sync script writes the current `editable` value of every
page into the `public.editable_pages` table, and the RLS policies read that
table.

Rejected alternatives:

- A shared secret or invite link per page: the link leaks, and a rotation
  invalidates every link at once.
- A separate configuration file such as `.pages.yml`, in the style of Pages CMS:
  it splits page metadata into two places, and the repository already keeps page
  metadata in frontmatter.
- Public editing everywhere, in the style of the drawing board: one stroke is
  independent and deletable, but one document write replaces the whole text.

### 2.2 Rendering edited markdown in the browser

Decision: build a second markdown-it instance in the editor chunk, in
`src/lib/markdown-browser.ts`, with the installed plugin versions and the same
options as the build, minus Shiki and minus the responsive image rule.

| Build rule (`vite.config.ts` lines 128 to 171)                                      | In the browser                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `markdownItOptions: { quotes: '""\'\'' }`                                           | replicated                                        |
| `@shikijs/markdown-it`, two vitesse themes                                          | dropped, see below                                |
| `responsiveImages` (`scripts/markdown-images.ts`)                                   | replaced by a browser image rule                  |
| `markdown-it-anchor` with `scripts/slugify.ts` and `linkInsideHeader`               | replicated, the same `slugify` module is imported |
| `markdown-it-link-attributes`, matcher `^https?://`                                 | replicated                                        |
| `markdown-it-table-of-contents`, levels 1 to 4                                      | replicated                                        |
| the table wrapper rule for `table_open` and `table_close`                           | replicated                                        |
| `wrapperClasses`: `prose m-auto` unless the source holds `@layout-full-width`       | replicated in the overlay markup                  |
| the markdown-it `html` option (the build keeps the plugin default, which is `true`) | set to `false`, see section 8                     |

Shiki is dropped in the browser. The measured cost of Shiki with the JavaScript
regex engine, two vitesse themes and the languages the pages use is 121,928
bytes gzip, which is more than twice the whole markdown stack. A code fence
renders as a plain `<pre><code class="language-x">` block. The block keeps its
layout, because `src/styles/prose.css` lines 432 to 456 style `pre`
independently of the token colours, and the next static build adds the colour.

The responsive image rule cannot run in the browser. `scripts/markdown-images.ts`
reads the file from disk with `image-size` and emits `?w=660;990;1320&as=srcset`
query strings that `vite-imagetools` resolves at build time. The browser rule
emits a plain `<img>` with the Storage URL, the `width` and `height` recorded at
upload, `loading="lazy"` and `decoding="async"`. The layout is stable, because
`width` and `height` reserve the aspect ratio, as the build rule does.

The visual difference between the live view and the built view is therefore
limited to code colour and image format. Both differences disappear at the next
build.

Rejected alternatives:

- `marked` at 12,995 bytes gzip and `micromark` at 14,568 bytes gzip: cheaper,
  but the HTML differs from the build in attribute order, anchor markup and
  table markup, so the live view and the built view would never agree.
- A Supabase Edge Function that renders with the exact build code: zero client
  bytes, but 50 to 250 ms per render, duplicated copies of `slugify.ts`,
  `markdown-images.ts` and `shiki-classes.ts` that drift, and a rendered HTML
  string that the client must still sanitize.
- Shiki in a third lazy chunk after the preview goes idle: possible later, and
  it costs 121,928 bytes gzip (measured) for colour alone.

### 2.3 Sanitization

Decision: two layers. In the browser, construct markdown-it with `html: false`,
then run DOMPurify 3.4.15 over the result before `v-html`. In the sync script,
escape `<` and `{{` in the document body before writing the file.

Reason: `html: false` escapes every raw HTML block and every inline tag, so no
`<script>`, no `<img onerror>` and no `<iframe>` reaches the DOM. DOMPurify
costs 11,118 bytes gzip (measured) and catches HTML that arrives from Supabase,
written by a client this code does not control. The sync step is separate,
because a markdown file in `pages/` becomes a Vue Single File Component
template, so `{{ ... }}` in the file is code that runs in the CI runner and in
every browser.

Rejected alternatives:

- `sanitize-html` at 56,186 bytes gzip: five times the size, built for Node, and
  it pulls in `postcss` and `htmlparser2`.
- No sanitizer, trusting `html: false` alone: it does not cover HTML that
  another client wrote into the `body_html` column.

### 2.4 Editor for text

Decision: a `<textarea>` with a live preview beside it, and no editor library.

Reason: the cost is zero bytes, and the stored file is exactly what the person
typed, which is the only way the round trip through git stays readable. The
preview, not the textarea, is the main drop target for images.

Rejected alternatives:

- CodeMirror 6 with `minimalSetup` and `@codemirror/lang-markdown`: 175,837
  bytes gzip measured, because `lang-markdown` statically imports `lang-html`,
  which pulls in `lang-javascript` and `lang-css`.
- CodeMirror 6 with `EditorView` and `EditorState` only: 64,635 bytes gzip
  measured. This is the upgrade path if typing comfort becomes a complaint.
- Milkdown Crepe at 458,245 bytes gzip, or Tiptap at about 150,000 bytes gzip:
  native image dragging, but the document round trips through a ProseMirror
  schema, so `[[toc]]`, the `@layout-full-width` marker and HTML blocks are
  rewritten or dropped without warning.
- `contenteditable` with Turndown at 4,108 bytes gzip: browser specific HTML,
  aggressive normalization, and a diff that rewrites the whole file.

### 2.5 Editor for drag and drop images

Decision: the rendered preview carries the drop behaviour. Each image in the
preview gets `draggable="true"` and a `data-md-line` attribute that records the
source line of the image token. A drop reads the target line through
`document.elementFromPoint`, then rewrites the markdown source by line, then
renders again. Section 5 gives the exact behaviour.

Reason: markdown-it gives `token.map` for every block token, so the mapping from
a preview element to a source line is a few lines of code. The whole handler is
about 200 lines (estimate) and it needs no library.

Rejected alternative: a ProseMirror document model, where moving a node is built
in. Section 2.4 lists the price.

### 2.6 Image upload and resizing

Decision: resize in the browser with `createImageBitmap` and `OffscreenCanvas`,
encode WebP at quality 0.82 and a maximum width of 1320 pixels, then upload to a
public Supabase Storage bucket named `page-images`, at the object path
`<page-slug>/<user-id>/<uuid>.webp`.

Reason: Supabase image transformations are a Pro plan feature and are not
available on the Free plan, so the browser must produce the final bytes.
`createImageBitmap` applies the EXIF orientation when it receives
`{ imageOrientation: 'from-image' }`. The target width 1320 equals
`IMAGE_FALLBACK_WIDTH` in `scripts/markdown-images.ts` line 11, so the live
image has the same width as the largest variant the build generates later.

Rejected alternatives:

- `browser-image-compression` at 19,619 bytes gzip: it buys EXIF handling and a
  worker path that `createImageBitmap` already provides.
- `@jsquash/avif` at 1,128,053 bytes gzip of WebAssembly: no browser encodes
  AVIF from a canvas, and this is the price of adding one.
- A private bucket with signed URLs: the URL expires, which breaks the live view
  in an open tab, and the images reach a public static site anyway.

### 2.7 Concurrency

Decision: an integer `version` column, a conditional update through PostgREST
(`PATCH /rest/v1/page_documents?page_path=eq.<path>&version=eq.<v>`), and a
client side broadcast on the Realtime channel `page:<page_path>` after a
successful save.

Reason: the cost is zero new bytes, and the pattern matches the existing
broadcast channel `drawing:${effectiveCloudStorageId}:strokes` in
`src/components/DrawablePen.vue` line 680. An empty response array means another
editor saved first, and the second editor then sees a conflict banner.

Rejected alternatives:

- Yjs with a broadcast provider: 19,273 bytes gzip measured for `yjs` alone,
  plus a provider to write and to maintain. It earns that size when two people
  type in the same paragraph in the same minute, which will not happen here.
- `postgres_changes` instead of broadcast: it sends the whole row through the
  replication path and evaluates RLS for every subscriber and message.

### 2.8 Sync back to the repository

Decision: a Postgres trigger calls a Supabase Database Webhook, the webhook
posts a `repository_dispatch` event to GitHub, and a workflow runs
`scripts/sync-documents.ts` with the service role key. The script writes
`pages/**/*.md`, downloads the images into `src/assets/images/`, commits and
pushes. The existing deploy workflow then runs on that push. A daily cron run is
the fallback for a dropped webhook. Section 7 gives the detail.

Rejected alternatives:

- A commit from the browser through the GitHub API: a token in the browser is a
  token given away, and that token can rewrite the site and therefore run code
  on it.
- A Supabase Edge Function that commits: the token stays on the server, but the
  function has a 150 second wall clock and about 256 MB of memory, and it must
  reproduce the image download in Deno. A page with twenty images is close to
  that limit.
- A manual pull by the owner: correct and safe, but the live document and the
  built page then differ for as long as the owner is busy.

### 2.9 What the database stores

Decision: store both `body_md` and `body_html`. The markdown is the truth for
the sync step. The HTML is a render cache, so the reader path needs DOMPurify
only, and never loads markdown-it.

Reason: a reader who arrives at a page with a newer live document pays 11,118
bytes gzip instead of about 63,000 bytes gzip. The HTML is untrusted in both
cases, so the sanitizer runs either way.

Rejected alternative: store the markdown only, and render it in the reader. That
removes one column and one source of drift, and it costs every reader the whole
markdown stack.

## 3. Data model

New file: `src/db/supabase-documents-schema.sql`. It follows the style of
`src/db/supabase-schema-v2.sql`: uppercase keywords, `IF NOT EXISTS`, an
explicit `DROP POLICY IF EXISTS` before every `CREATE POLICY`, and comments that
say why.

```sql
-- Supabase setup for editable pages
-- Companion to supabase-schema-v2.sql (strokes) and supabase-views-schema.sql
-- Compatible with Supabase (PostgreSQL 15+)

-- ============================================================
-- Step 1: the authority for access, written by the sync job
-- ============================================================
-- The browser can send any frontmatter value, so the RLS policies read this
-- table instead. scripts/sync-documents.ts rewrites it on every run.
CREATE TABLE IF NOT EXISTS public.editable_pages (
  base_path    TEXT PRIMARY KEY, -- route path without the language suffix
  access       TEXT NOT NULL DEFAULT 'owner'
               CHECK (access IN ('owner', 'invited', 'public')),
  allow_images BOOLEAN NOT NULL DEFAULT true,
  hydra        BOOLEAN NOT NULL DEFAULT false, -- the page evaluates code blocks
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Step 2: one document per page, one row per language
-- ============================================================
-- Translations share a base path but not a text, so the key is the full path.
-- splitLanguageSuffix() in src/logics/languages.ts derives base_path from it.
CREATE TABLE IF NOT EXISTS public.page_documents (
  page_path     TEXT PRIMARY KEY,
  base_path     TEXT NOT NULL REFERENCES public.editable_pages(base_path) ON DELETE CASCADE,
  lang          TEXT NOT NULL DEFAULT 'en',
  body_md       TEXT NOT NULL,
  body_html     TEXT NOT NULL, -- render cache for readers, sanitized again on use
  images        JSONB NOT NULL DEFAULT '{}'::jsonb, -- storage path to {width, height, alt}
  version       INTEGER NOT NULL DEFAULT 1,
  built_version INTEGER NOT NULL DEFAULT 0, -- the version the last build wrote
  updated_by    TEXT NOT NULL, -- x-user-id header, or the auth uid of an editor
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Step 3: every save is kept, in the style of immutable strokes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_document_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path  TEXT NOT NULL,
  version    INTEGER NOT NULL,
  body_md    TEXT NOT NULL,
  images     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_path, version)
);

-- ============================================================
-- Step 4: identities
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_owners (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.page_editors (
  base_path  TEXT NOT NULL REFERENCES public.editable_pages(base_path) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (base_path, user_id)
);

CREATE OR REPLACE FUNCTION public.is_site_owner()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.site_owners WHERE user_id = auth.uid());
$$;

-- ============================================================
-- Step 5: indexes
-- ============================================================
-- The version check reads by primary key, so it needs no extra index.
CREATE INDEX IF NOT EXISTS page_documents_base_path_idx
  ON public.page_documents(base_path);
-- The sync job asks for the documents the last build did not write.
CREATE INDEX IF NOT EXISTS page_documents_pending_idx
  ON public.page_documents(updated_at DESC) WHERE version > built_version;
CREATE INDEX IF NOT EXISTS page_document_history_page_idx
  ON public.page_document_history(page_path, version DESC);
CREATE INDEX IF NOT EXISTS page_document_history_author_idx
  ON public.page_document_history(updated_by, created_at DESC);

-- ============================================================
-- Step 6: one trigger holds the rules a policy cannot express
-- ============================================================
-- A WITH CHECK clause sees the new row only, so it cannot compare the new
-- version with the old one. The trigger does that, writes the history row and
-- applies the size and rate limits.
CREATE OR REPLACE FUNCTION public.enforce_document_update()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  writes_last_minute INTEGER;
  is_sync_job BOOLEAN := (auth.role() = 'service_role');
BEGIN
  IF NEW.page_path <> OLD.page_path OR NEW.base_path <> OLD.base_path THEN
    RAISE EXCEPTION 'page_path and base_path are immutable';
  END IF;

  IF NEW.built_version <> OLD.built_version
     AND NOT is_sync_job AND NOT public.is_site_owner() THEN
    RAISE EXCEPTION 'only the sync job sets built_version';
  END IF;

  IF NEW.body_md IS DISTINCT FROM OLD.body_md THEN
    IF NEW.version <> OLD.version + 1 THEN
      RAISE EXCEPTION 'version must increase by exactly one';
    END IF;
    IF length(NEW.body_md) > 200000 THEN
      RAISE EXCEPTION 'document is larger than 200000 characters';
    END IF;

    SELECT COUNT(*) INTO writes_last_minute
    FROM public.page_document_history
    WHERE updated_by = NEW.updated_by
      AND created_at > NOW() - INTERVAL '1 minute';
    IF writes_last_minute >= 10 THEN
      RAISE EXCEPTION 'too many saves in one minute, wait and try again';
    END IF;

    NEW.updated_at := NOW();
    INSERT INTO public.page_document_history (page_path, version, body_md, images, updated_by)
    VALUES (NEW.page_path, NEW.version, NEW.body_md, NEW.images, NEW.updated_by);
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS page_documents_enforce_update ON public.page_documents;
CREATE TRIGGER page_documents_enforce_update
  BEFORE UPDATE ON public.page_documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_document_update();

-- ============================================================
-- Step 7: realtime
-- ============================================================
-- The client broadcasts after a successful save, in the style of
-- DrawablePen.vue, so this table needs no replication and no publication entry.

-- ============================================================
-- Step 8: row level security
-- ============================================================
ALTER TABLE public.editable_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_document_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of editable pages" ON public.editable_pages;
CREATE POLICY "Allow public read of editable pages" ON public.editable_pages
  FOR SELECT USING (true);
-- No insert, update or delete policy: only the service role writes this table.

DROP POLICY IF EXISTS "Allow public read of documents" ON public.page_documents;
CREATE POLICY "Allow public read of documents" ON public.page_documents
  FOR SELECT USING (true);

-- No insert policy: the sync job creates the row for every editable page.

DROP POLICY IF EXISTS "Owner may update any document" ON public.page_documents;
CREATE POLICY "Owner may update any document" ON public.page_documents
  FOR UPDATE TO authenticated
  USING (public.is_site_owner())
  WITH CHECK (public.is_site_owner());

DROP POLICY IF EXISTS "Invited editors may update their pages" ON public.page_documents;
CREATE POLICY "Invited editors may update their pages" ON public.page_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.page_editors e
      JOIN public.editable_pages p ON p.base_path = e.base_path
      WHERE e.base_path = page_documents.base_path
        AND e.user_id = auth.uid()
        AND p.access IN ('invited', 'public')
        AND p.hydra = false
    )
  )
  WITH CHECK (updated_by = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone may update a public document" ON public.page_documents;
CREATE POLICY "Anyone may update a public document" ON public.page_documents
  FOR UPDATE TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.editable_pages p
      WHERE p.base_path = page_documents.base_path
        AND p.access = 'public'
        AND p.hydra = false
    )
  )
  WITH CHECK (
    -- x-user-id is attribution, not authentication. See section 8.3.
    updated_by = current_setting('request.headers', true)::json->>'x-user-id'
  );

DROP POLICY IF EXISTS "Allow public read of history" ON public.page_document_history;
CREATE POLICY "Allow public read of history" ON public.page_document_history
  FOR SELECT USING (true);
-- No write policy: only the SECURITY DEFINER trigger inserts here.

DROP POLICY IF EXISTS "Editors may read their invitations" ON public.page_editors;
CREATE POLICY "Editors may read their invitations" ON public.page_editors
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_site_owner());

DROP POLICY IF EXISTS "Owner reads the owner table" ON public.site_owners;
CREATE POLICY "Owner reads the owner table" ON public.site_owners
  FOR SELECT TO authenticated USING (user_id = auth.uid());
```

### 3.1 Storage bucket and policies

```sql
-- 5 MB is the backstop for a client that skips the browser side resize.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('page-images', 'page-images', true, 5242880,
        ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Page images are readable" ON storage.objects;
CREATE POLICY "Page images are readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'page-images');

-- The object path is <page-slug>/<user-id>/<uuid>.webp, where page-slug is the
-- base path without the leading slash and with every slash replaced by "_".
DROP POLICY IF EXISTS "Editors may upload page images" ON storage.objects;
CREATE POLICY "Editors may upload page images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'page-images'
    AND (storage.foldername(name))[2] = current_setting('request.headers', true)::json->>'x-user-id'
    AND EXISTS (
      SELECT 1 FROM public.editable_pages p
      WHERE replace(ltrim(p.base_path, '/'), '/', '_') = (storage.foldername(name))[1]
        AND p.allow_images
        AND (p.access = 'public' OR auth.uid() IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Owner may delete page images" ON storage.objects;
CREATE POLICY "Owner may delete page images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'page-images' AND public.is_site_owner());
```

The user folder in the path gives the owner a cheap way to delete every image
that one person uploaded. There is no update policy and no anonymous delete
policy, so an uploaded object cannot be replaced by a different file at the same
URL.

## 4. Client architecture

### 4.1 Modules to add or to change

| Path                                                    | Responsibility                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/page-views.ts` (change)                        | Export the existing `buildHeaders` and `getSupabaseConfig` helpers, so the document code reuses them. No behaviour change and no new bytes.                                                                                                                                                                                                 |
| `src/lib/documents.ts` (new)                            | Plain fetch helpers over PostgREST, in the style of `page-views.ts`. `fetchNewerVersion(pagePath, builtVersion)` runs on page load. `fetchDocument`, `saveDocument` and `fetchHistory` run in the lazy chunks. Every failure returns `null`, so a broken read never blocks rendering.                                                       |
| `src/logics/live-document.ts` (new)                     | A module level `ref` that says whether a live document replaced the static article, plus the page slug helper that uses `splitLanguageSuffix`. It is the only new import that `WrapperPost.vue` takes.                                                                                                                                      |
| `src/components/EditablePage.vue` (new)                 | Mounted once in `App.vue` beside `WrapperPost`. It reads `route.meta.frontmatter.editable` and `route.meta.frontmatter.builtVersion`. It does nothing when the key is absent. Otherwise it runs one version check through `whenIdle`, renders the edit control, and loads the reader chunk or the editor chunk with `defineAsyncComponent`. |
| `src/components/LiveDocument.vue` (new, reader chunk)   | It fetches `body_html`, sanitizes it with DOMPurify, renders it in its own `<article class="prose m-auto">`, and subscribes to the `page:<page_path>` broadcast channel. It never writes into the DOM that Vue owns.                                                                                                                        |
| `src/components/MarkdownEditor.vue` (new, editor chunk) | The overlay: a textarea, a live preview, the save and cancel controls, the conflict banner, and the drop behaviour of section 5.                                                                                                                                                                                                            |
| `src/lib/markdown-browser.ts` (new, editor chunk)       | It builds the markdown-it instance of section 2.2, including the browser image rule and the `data-md-line` attributes.                                                                                                                                                                                                                      |
| `src/lib/image-upload.ts` (new, editor chunk)           | It resizes a `File` to a WebP blob at most 1320 pixels wide, uploads it through `getSupabase()` Storage, and returns the public URL with the pixel size.                                                                                                                                                                                    |
| `src/composables/useSupabaseAuth.ts` (new)              | The sign in, sign out and session restore code that `StrokeAdmin.vue` lines 541 to 613 already holds, extracted so the admin page and the editor use one implementation.                                                                                                                                                                    |
| `src/components/DocumentAdmin.vue` (new)                | Moderation: list the documents, read the history, restore a version, delete an uploaded image. It follows `StrokeAdmin.vue`, including the gate on `user.value`.                                                                                                                                                                            |
| `pages/admin/documents.md` (new)                        | It mounts `DocumentAdmin`, in the style of `pages/admin/strokes.md`.                                                                                                                                                                                                                                                                        |
| `scripts/sync-documents.ts` (new)                       | The Node script that writes documents and images back into the repository. Section 7.                                                                                                                                                                                                                                                       |
| `scripts/check-editable-pages.ts` (new)                 | A build time guard. It fails the build when a page with an `editable` key also sets `hydra: true`, or holds a Vue component tag, or holds `{{`.                                                                                                                                                                                             |
| `src/components/WrapperPost.vue` (change)               | It hides the static `<article>` with a class while the live document shows. One import and one class binding.                                                                                                                                                                                                                               |
| `src/App.vue` (change)                                  | It renders `<EditablePage />` next to `<WrapperPost>`, so the editor never sits inside the slot that must stay static content. See the comment at `App.vue` lines 39 to 41.                                                                                                                                                                 |

### 4.2 What runs on an opted-in page before edit mode

1. `EditablePage.vue` reads `route.meta.frontmatter.editable`. When the key is
   absent it renders nothing and sends no request. That is the case on 37 of the
   current pages.
2. When the key is present, `whenIdle` (`src/logics/idle.ts`) schedules one
   plain fetch, so the request never competes with hydration:
   `GET {VITE_SUPABASE_URL}/rest/v1/page_documents?select=version&page_path=eq.<path>&version=gt.<builtVersion>`.
   The headers are the four that `buildHeaders` already builds. The origin
   already has a `preconnect` link, added by the `preconnectSupabase` plugin in
   `vite.config.ts` lines 53 to 66.
3. An empty array is the normal answer. Nothing else loads.
4. A non-empty array loads the reader chunk.
5. The edit control renders for every visitor on a `public` page, and after a
   sign in on an `owner` or `invited` page. A press loads the editor chunk.

### 4.3 Chunk boundaries

| Chunk                       | Contents                                                                                                                  | Loads when                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `app-*.js` (entry)          | `EditablePage.vue`, `live-document.ts`, the version check in `documents.ts`, the `builtVersion` values in the route table | always, on every page                                |
| `reader-*.js`               | `LiveDocument.vue`, DOMPurify                                                                                             | a newer live document exists, or a broadcast arrives |
| `editor-*.js`               | `MarkdownEditor.vue`, `markdown-browser.ts`, `image-upload.ts`, markdown-it and its plugins                               | the visitor presses the edit control                 |
| the existing Supabase chunk | `@supabase/supabase-js`, loaded by `getSupabase()`                                                                        | a save, an upload, a sign in or a channel subscribe  |

Name the two new chunks in the `manualChunks` function in `vite.config.ts` lines
219 to 222, beside the existing `vue-vendor` rule, so
`scripts/check-asset-sizes.sh` finds them under a stable file name.

### 4.4 Bundle size estimate per chunk

Sizes marked "measured" come from the technology options report, which bundled
each package with esbuild and ran `gzip -9`. Sizes marked "estimate" are
arithmetic.

| Chunk  | Item                                                                                                   |                             Bytes gzip | Source                                               |
| ------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------: | ---------------------------------------------------- |
| entry  | `EditablePage.vue`, the version check, `live-document.ts`                                              |                              about 900 | estimate                                             |
| entry  | `builtVersion` in the route meta, per editable page                                                    |                               about 20 | estimate                                             |
| entry  | new total                                                                                              | about 30,450 against the 40,000 budget | estimate                                             |
| reader | DOMPurify 3.4.15                                                                                       |                                 11,118 | measured                                             |
| reader | the swap in code and the channel subscribe                                                             |                              about 800 | estimate                                             |
| reader | new bytes                                                                                              |                           about 11,900 | estimate                                             |
| editor | markdown-it 14.2.0, the installed version                                                              |                                 45,671 | bundlephobia                                         |
| editor | `markdown-it-anchor` 8.6.7, `markdown-it-link-attributes` 4.0.1, `markdown-it-table-of-contents` 0.6.0 |                            about 4,100 | estimate, from the measured 10.0.0 and 4.0.1 figures |
| editor | `diacritics` 1.3.0, required by `scripts/slugify.ts`                                                   |                                  2,502 | bundlephobia                                         |
| editor | the editor component, drop handling, line mapping, resize and upload                                   |                            about 4,500 | estimate                                             |
| editor | new bytes on top of the reader chunk                                                                   |                           about 56,800 | estimate                                             |
| all    | transferred on the first press of the edit control, with the Supabase chunk cold                       |                          about 120,500 | estimate                                             |

The technology options report measured the markdown stack against markdown-it
15.0.1 and `markdown-it-anchor` 10.0.0, at 54,753 bytes gzip. This repository
has markdown-it 14.2.0 and `markdown-it-anchor` 8.6.7 in `package.json`. Use the
installed versions, so the build and the browser parse with one copy of the
parser. The four markdown packages and `diacritics` are `devDependencies` today.
Move them to `dependencies`, because `src/` will import them.

The entry chunk is 29,531 bytes gzip today, measured from `dist/assets`, and
`docs/performance-plan.md` section 9 records the same number as 30 KB. The
budget is 40,000 bytes. This feature adds about 920 bytes to it.

## 5. Drag and drop specification

### 5.1 Dropping a file onto the preview

1. The preview element has `dragover` and `drop` listeners. `dragover` calls
   `preventDefault` and draws a horizontal insertion line at the nearest block
   boundary, found with `document.elementFromPoint`.
2. On `drop`, the editor reads `event.dataTransfer.files` and takes the images in
   order.
3. For each file the editor inserts a placeholder line `![uploading](#)` at the
   target line, so the position is visible at once.
4. `src/lib/image-upload.ts` resizes the file, uploads it, and returns the public
   URL with the pixel size.
5. The editor replaces the placeholder line with
   `![<file name without extension>](<public URL>)`, records the size in the
   `images` map, and renders the preview again.
6. Nothing is saved until the person presses save. A save writes `body_md`,
   `body_html`, `images` and the new version in one request.

### 5.2 Dropping a file onto the textarea

The textarea accepts the same drop. The insertion point is the caret position
that the browser reports for the drop, and the placeholder goes on its own line,
with a blank line before it and after it. The rest of the sequence is the same.

### 5.3 Dragging an existing image to a new position

1. Every `<img>` in the preview has `draggable="true"` and a `data-md-line`
   attribute, set by the browser image rule from the markdown-it `token.map`.
2. `dragstart` puts the source line number into
   `event.dataTransfer.setData('text/x-md-line', line)`.
3. `dragover` shows the same insertion line as in section 5.1.
4. `drop` removes the source line from the markdown, then inserts it at the
   target line, then renders again. When the target line is after the source
   line, the editor subtracts one from the target index, because the removal
   moved the following lines up.
5. The move is one step in the editor undo history, so Ctrl+Z restores the
   previous text. This matches the keyboard behaviour of `DrawablePen.vue` lines
   418 to 444.

### 5.4 Keyboard alternative

The editor has an "add image" button that opens a normal file input. It inserts
at the caret. Every image in the preview also carries two buttons, "move up" and
"move down", which move the image line past the previous or the next block. The
buttons call the same code as the drop handler, so the two paths cannot differ.
Every drop target has an `aria-label`, and the insertion line has
`role="presentation"`.

### 5.5 Mobile behaviour

Touch devices do not fire HTML drag and drop events reliably, so the editor does
not depend on them. On a pointer device without hover, the editor hides the
insertion line and shows the "add image" button and the move buttons instead.
The preview and the textarea stack vertically below the `sm` breakpoint, and a
segmented control switches between "write" and "preview".

### 5.6 Failure cases

| Case                                                | Behaviour                                                                                                                                                                                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A file larger than 5 MB before the resize           | The editor resizes first, so the uploaded blob is normally far smaller. When the resized blob is still larger than 5 MB, the editor removes the placeholder and shows "This image is too large. Try an image under 5 MB."        |
| A wrong file type                                   | Types outside `image/webp`, `image/jpeg`, `image/png` and `image/avif` are ignored. The editor shows "Only image files can be dropped here."                                                                                     |
| `createImageBitmap` fails on a broken file          | The editor removes the placeholder and shows "This file is not a readable image."                                                                                                                                                |
| `OffscreenCanvas` is missing                        | The editor falls back to a normal `<canvas>` and `canvas.toBlob`. When `image/webp` is not supported, it encodes `image/jpeg` at quality 0.85.                                                                                   |
| The upload fails, or Storage returns an error       | The editor removes the placeholder, keeps the rest of the text, and shows "The upload failed. Your text is safe. Try again."                                                                                                     |
| The browser is offline                              | The editor keeps working, because the text is local. Save and upload show "You are offline. The text stays in this browser until you save." The draft is kept in `localStorage` under the key `page-document-draft:<page_path>`. |
| Image upload is off through `editableImages: false` | The drop handler is not installed, and the "add image" button is not rendered.                                                                                                                                                   |

## 6. Live sync and conflicts

### 6.1 The save sequence

1. The editor holds `version`, the value it read when it opened the document.
2. It renders `body_html` from the current text, and sanitizes it.
3. It sends one conditional update:

   ```
   PATCH {VITE_SUPABASE_URL}/rest/v1/page_documents?page_path=eq.<path>&version=eq.<version>
   Prefer: return=representation
   { "body_md": "...", "body_html": "...", "images": {...},
     "version": <version + 1>, "updated_by": "<user id>" }
   ```

4. A response array with one row means the save succeeded. The editor takes the
   new version from the response, clears the local draft, and only then updates
   its own state. That is the "backend first, then local state" order that
   `DrawablePen.vue` uses in `saveStrokeToSupabase` and in `undo`.
5. The editor broadcasts on the channel `page:<page_path>`, with
   `broadcast: { self: false }`, the event `document_saved`, and the payload
   `{ version, body_html, updated_by }`. This follows the channel setup in
   `DrawablePen.vue` line 680.
6. An empty response array means the version check failed. Go to section 6.3.

### 6.2 What a second reader or editor sees

A reader on the same page has the reader chunk loaded only when the live
document is already newer than the built one. To catch a save that happens while
the reader looks at a current page, `EditablePage.vue` subscribes to the channel
when the frontmatter says `public` or `invited`, and loads the reader chunk on
the first `document_saved` event. On an `owner` page it does not subscribe,
because the owner is the only writer.

A second editor with the overlay open receives `document_saved` and shows a
banner: "Somebody else saved version N. Your text is unchanged." The banner has
one control, "compare", which opens the other version beside the current text.
The editor never overwrites the open text on its own.

### 6.3 Conflict

1. The empty response array tells the editor that the stored version moved on.
2. The editor fetches the document again and shows the conflict banner: "This
   page changed while you were writing. Your text is kept."
3. The banner offers two controls: "keep mine", which sends the save again with
   the fetched version number, and "take theirs", which replaces the text after
   a confirmation.
4. Nothing is lost either way, because every save is in
   `page_document_history`, and the local text stays in `localStorage` until a
   save succeeds.

## 7. Sync back to the repository

### 7.1 The script

`scripts/sync-documents.ts` runs with `esno`, the runner the other scripts use.
It needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment.

1. Read every row where `version > built_version`.
2. For each row, resolve the page file from `page_path`: `/notes/foo` becomes
   `pages/notes/foo.md`, and `/notes/foo.pt` becomes `pages/notes/foo.pt.md`.
   Fail the run when the file is missing.
3. Read the file with `gray-matter`. Refuse the row when the frontmatter has no
   `editable` key, or sets `hydra: true`, or when the file is not the file that
   the `base_path` derivation expects. The database is not the authority for
   what the repository allows.
4. Sanitize `body_md`: escape every `<` and every `{{`, because
   `unplugin-vue-markdown` compiles the file into a Vue template. Reject the row
   when it still holds a `<script` or a `<style` block, and record the
   rejection.
5. Download every image of the `images` map from the public bucket. Write it to
   `src/assets/images/<section>/<name>.webp`, where `<section>` is the first path
   segment of the page. That is the layout the pages already use, for example
   `../../src/assets/images/projects/2026-09-05-canvas-screenshot-1.png`.
6. Run the resize and compression logic of `scripts/img-compress.ts` on every
   written file, so an image that reaches the repository obeys the rules that an
   image committed by hand obeys. The 300,000 byte image budget in
   `scripts/check-asset-sizes.sh` applies to the built variants, so this step
   keeps the deploy job green.
7. Rewrite every Storage URL in the markdown to the relative path of the written
   file, for example `../../src/assets/images/notes/abc123.webp`. The relative
   form is what `scripts/markdown-images.ts` requires: its `LOCAL_SOURCE_PATTERN`
   is `/^\.{1,2}\//` and its `RASTER_PATTERN` accepts `png`, `jpg`, `jpeg`,
   `webp` and `avif`. After the rewrite, the existing build rule generates the
   `<picture>` element with the AVIF and WebP srcsets.
8. Write the frontmatter back with the new key `builtVersion: <version>`, and
   write the body below it.
9. Update the database in the same run:
   `PATCH /rest/v1/page_documents?page_path=eq.<path>&version=eq.<version>` with
   `{ "built_version": <version> }`. The `version=eq.<version>` guard stops the
   run from marking a save that arrived during the run as built.
10. Rewrite `public.editable_pages` from the frontmatter of every page, so the
    RLS authority matches the repository.
11. Commit with the message `chore(content): sync live page edits` and push.
12. Print a table of the pages written and the rows rejected.

### 7.2 The workflow

New file `.github/workflows/sync-documents.yml`.

```yaml
name: sync-documents

on:
  repository_dispatch:
    types: [sync-edits]
  schedule:
    - cron: '17 4 * * *'
  workflow_dispatch:

concurrency:
  group: sync-documents
  cancel-in-progress: true

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    env:
      SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: '26'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm sync-documents
      - name: Commit and push
        run: |
          git config user.name "bbo.do sync"
          git config user.email "sync@bbo.do"
          git add pages src/assets/images
          git diff --staged --quiet || git commit -m "chore(content): sync live page edits"
          git push
```

The push to `main` starts the existing `build-and-deploy` workflow, which runs
`pnpm build` and `pnpm check-sizes` as it does today.

### 7.3 Secrets

| Secret                                        | Where it lives                                        | Scope                                                                                                               |
| --------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`                   | a GitHub Actions secret                               | It bypasses RLS. It must never reach the browser or a `VITE_` variable.                                             |
| the GitHub token for `repository_dispatch`    | Supabase Vault                                        | a fine grained personal access token for this repository only, with `Contents: read and write` and `Metadata: read` |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | GitHub Actions secrets, present in `deploy.yml` today | public values                                                                                                       |

### 7.4 The dispatch trigger

A second SQL file, `src/db/supabase-documents-sync.sql`, adds an `AFTER UPDATE`
trigger that calls `net.http_post` through `pg_net`, at most once per minute per
page. A small table `public.sync_dispatch_log` holds the last dispatch time per
page path and provides that limit. The limit belongs in Postgres, not in the
workflow, because a burst of saves would otherwise spend Actions minutes.

### 7.5 How the built page knows its baked version

The sync script writes `builtVersion: <n>` into the frontmatter of the page
file. `extendRoute` in `vite.config.ts` puts the whole frontmatter on
`route.meta.frontmatter`, so `EditablePage.vue` reads
`route.meta.frontmatter.builtVersion ?? 0` with no extra work. The version check
asks only for rows with `version=gt.<builtVersion>`, so the normal answer is an
empty array and nothing more loads. The live document wins whenever
`version > builtVersion`.

### 7.6 Storage cleanup

The sync script does not delete Storage objects. A reader with an open tab still
points at them. `DocumentAdmin.vue` gets a manual control, "delete unused
images", which lists the objects that no current document references and that
are older than 30 days.

## 8. Security

### 8.1 The `hydra` frontmatter is the largest risk

`src/components/WrapperPost.vue` loads two remote scripts when
`frontmatter.hydra` is true, then finds every `pre:has(.language-javascript)`
block and calls `eval(codeEl.textContent)` on focus, at line 183. Ten pages set
`hydra`. On such a page, anybody who can write a `javascript` code fence runs
JavaScript on the origin `bbo.do`. A sanitizer does not help, because the text
inside a code block is not dangerous by itself. The `eval` is the danger.

Three rules follow.

1. A page must never set both `editable` and `hydra: true`.
   `scripts/check-editable-pages.ts` fails the build on that pair, the
   `editable_pages` table carries a `hydra` column, and both public update
   policies test `p.hydra = false`.
2. The editor preview never evaluates a code block. The preview renders a plain
   `<pre><code>`, and `LiveDocument.vue` renders into its own element, outside
   the `<article>` that the hydra code queries.
3. The correct long term fix is to run the hydra code in an iframe with
   `sandbox="allow-scripts"` and without `allow-same-origin`. That removes the
   whole class of problem. It is outside this feature, and it is the condition
   for ever combining `editable: public` with `hydra: true`.

### 8.2 Markdown becomes a Vue template

`unplugin-vue-markdown` sets the markdown-it option `html` to true by default,
and `vite.config.ts` does not override it. The rendered HTML then goes to
`@vitejs/plugin-vue` as a Single File Component template. So `{{ ... }}` in a
page file is JavaScript that runs in the CI runner during the build and in every
visitor's browser. The sync step is a code write, not a content write.

The defences, in order:

1. The browser markdown-it instance uses `html: false`, so raw HTML in the
   editor is escaped and visible as text. An author sees at once that HTML is
   not allowed.
2. DOMPurify runs over the HTML before `v-html`, with `ALLOWED_URI_REGEXP`
   limited to `https:`, `mailto:` and relative paths, and with `style`, `on*`
   and `srcdoc` forbidden.
3. `scripts/sync-documents.ts` escapes `<` and `{{` before it writes the file,
   and rejects a document that still holds a `<script` or `<style` block.
4. `scripts/check-editable-pages.ts` fails the build when a page with an
   `editable` key holds a Vue component tag or `{{`. This also protects the
   reader: a live document is plain HTML, so a page that depends on
   `<DrawablePen>` must not be served from a live document.

### 8.3 The `x-user-id` header is attribution, not authentication

`getUserId()` in `src/lib/page-views.ts` lines 8 to 30 generates a random
identifier and keeps it in `localStorage`. Anybody can send any value with
`curl`. The `public` update policy uses it to record who wrote a version, and
the Storage policy uses it to group uploads for cleanup. No access decision may
depend on it. Real access control uses Supabase Auth, as `StrokeAdmin.vue` gates
its delete controls on `user.value`.

### 8.4 Abuse and limits

| Control            | Value                                               | Where                           |
| ------------------ | --------------------------------------------------- | ------------------------------- |
| document size      | 200,000 characters                                  | the update trigger              |
| save rate          | 10 saves per minute per `updated_by`                | the update trigger              |
| version discipline | exactly one increment per body change               | the update trigger              |
| upload size        | 5 MB per object                                     | the bucket `file_size_limit`    |
| upload type        | four image types                                    | the bucket `allowed_mime_types` |
| upload target      | only a page in `editable_pages` with `allow_images` | the Storage insert policy       |
| free plan storage  | 1 GB total, 5 GB egress per month                   | the Supabase Free plan          |
| history            | every version is kept                               | `page_document_history`         |

`public` access stays off until the owner asks for it on a named page. The
recommended first step is `owner`, and the second step is `invited`.

### 8.5 Moderation

Add `DocumentAdmin.vue` and `pages/admin/documents.md` beside the existing
`StrokeAdmin.vue` and `pages/admin/strokes.md`. It reuses
`useSupabaseAuth.ts`, and it lists the documents with their version, author and
time. The owner can read any version from the history, restore one (which writes
a new version, so the history stays append only), delete an uploaded image, and
set `access` back to `owner` for a page under attack. A separate `DocumentAdmin`
is better than an extension of `StrokeAdmin`, because the two data models share
nothing but the auth code.

Note the weakness that the drawing admin already has: the admin page is gated by
the user interface, not by a route guard. The RLS policies are the real gate,
and they require an authenticated owner for every write.

## 9. Performance budget

### 9.1 Before edit mode

| Page kind                                                    | Extra bytes gzip                              |                                           Extra requests |
| ------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------: |
| a page without the `editable` key, 37 pages today            | 0                                             |                                                        0 |
| a page with the key, live version equal to the built version | about 920 in the entry chunk                  |                                                        1 |
| a page with the key, live version newer                      | about 920 plus the reader chunk, about 11,900 | 2, plus the Supabase chunk when a subscription is needed |

The entry chunk is 29,531 bytes gzip today, measured from `dist/assets`, against
the 40,000 byte budget in `scripts/check-asset-sizes.sh`. After this feature it
is about 30,450 bytes gzip (estimate). The headroom falls from 10,469 bytes to
about 9,550 bytes.

The single request is scheduled with `whenIdle`, so it does not compete with
hydration, and the Supabase origin already has a `preconnect` link.

### 9.2 In edit mode

The first press of the edit control transfers the editor chunk (about 56,800
bytes gzip, estimate), the reader chunk (about 11,900 bytes gzip, estimate) and,
when it is not already cached, the Supabase client chunk (51,805 bytes gzip,
measured). The total is about 120,500 bytes gzip (estimate). Only a person who
decided to edit pays it.

### 9.3 The CI size check

Extend `scripts/check-asset-sizes.sh` with two budgets and one loop, and keep
the existing entry loop and image loop unchanged:

```sh
entry_gzip_budget=40000
reader_gzip_budget=15000
editor_gzip_budget=75000
image_budget=300000

check_chunk() { # pattern, budget, label
  for f in "$dir"/$1; do
    [ -f "$f" ] || continue
    gz=$(gzip -9c "$f" | wc -c)
    if [ "$gz" -gt "$2" ]; then
      echo "FAIL $3 $(basename "$f") is $gz bytes gzip, budget $2"
      failed=1
    else
      echo "ok   $3 $(basename "$f") is $gz bytes gzip"
    fi
  done
}
```

Call it for `app-*.js`, for `reader-*.js` and for `editor-*.js`. The chunk names
come from the `manualChunks` function in `vite.config.ts`. The budgets leave room
for growth, and they fail on an accidental static import of markdown-it into the
entry chunk, which is the regression that matters.

## 10. Implementation phases

Every commit is atomic, and every title is at most 50 characters. "Delegate:
yes" marks a commit that a separate agent can do alone, because it touches files
that no other open commit touches, and its verification is local.

### M1: read-only live documents

| #   | Commit                                           | Files                                                                                                             | Verification                                                                                                                                                         | Delegate |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | `feat(db): add editable page document tables`    | `src/db/supabase-documents-schema.sql`                                                                            | Run the script in the Supabase SQL editor. Insert one row as the service role. Read it as `anon`. Confirm that an anonymous update is refused.                       | yes      |
| 2   | `refactor(lib): export postgrest header helpers` | `src/lib/page-views.ts`                                                                                           | `pnpm build`, then `pnpm check-sizes`. The entry chunk size does not change.                                                                                         | yes      |
| 3   | `feat(lib): read live document version by fetch` | `src/lib/documents.ts`                                                                                            | In `pnpm dev`, call `fetchNewerVersion('/notes/test', 0)` from the console. It returns the version, and it returns `null` when the environment variables are absent. | yes      |
| 4   | `feat(build): reject unsafe editable pages`      | `scripts/check-editable-pages.ts`, `package.json`, `.github/workflows/deploy.yml`                                 | Add `editable: owner` to a page that sets `hydra: true`. The build fails. Remove the key. The build passes.                                                          | yes      |
| 5   | `feat(app): mount the editable page controller`  | `src/components/EditablePage.vue`, `src/App.vue`, `src/logics/live-document.ts`, `src/components/WrapperPost.vue` | `pnpm build && pnpm check-sizes`. The entry chunk stays under 40,000 bytes gzip. A page without the key sends no request, checked in the network panel.              | no       |
| 6   | `feat(live): render a newer live document`       | `src/components/LiveDocument.vue`, `src/lib/documents.ts`                                                         | Set `version` to 2 in the database for a test page. Reload. The live text replaces the static text. The chunk is named `reader-*.js`.                                | no       |
| 7   | `chore(ci): budget the reader and editor chunks` | `scripts/check-asset-sizes.sh`, `vite.config.ts`                                                                  | `pnpm build && pnpm check-sizes` prints one line per chunk and exits with 0.                                                                                         | yes      |

### M2: owner editing with a textarea editor

| #   | Commit                                           | Files                                                                  | Verification                                                                                                  | Delegate |
| --- | ------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| 8   | `refactor(auth): extract the supabase auth code` | `src/composables/useSupabaseAuth.ts`, `src/components/StrokeAdmin.vue` | Sign in and out on `/admin/strokes`. The behaviour is unchanged.                                              | yes      |
| 9   | `feat(editor): render markdown in the browser`   | `src/lib/markdown-browser.ts`                                          | Render three sample pages. Compare with the built HTML. Only the code colour and the image markup differ.     | yes      |
| 10  | `feat(editor): add the markdown editor overlay`  | `src/components/MarkdownEditor.vue`, `src/components/EditablePage.vue` | Press edit on a test page. The overlay opens. The preview matches the page. The chunk is named `editor-*.js`. | no       |
| 11  | `feat(editor): save with a version check`        | `src/lib/documents.ts`, `src/components/MarkdownEditor.vue`            | Save. The row version increases by one. A second save with a stale version returns an empty array.            | no       |
| 12  | `feat(editor): show a conflict banner on save`   | `src/components/MarkdownEditor.vue`                                    | Change the row in the SQL editor while the overlay is open. Save. The banner appears and the text is kept.    | no       |
| 13  | `feat(editor): broadcast a saved document`       | `src/components/MarkdownEditor.vue`, `src/components/LiveDocument.vue` | Open two browsers. Save in one. The other shows the new text without a reload.                                | no       |
| 14  | `feat(editor): keep a local draft while offline` | `src/components/MarkdownEditor.vue`                                    | Go offline. Type. Reload. The draft is restored.                                                              | yes      |

### M3: image upload and drag and drop placement

| #   | Commit                                            | Files                                                              | Verification                                                                                                              | Delegate |
| --- | ------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| 15  | `feat(db): add the page images storage bucket`    | `src/db/supabase-documents-schema.sql`                             | Upload one object as `anon` to an allowed path. Confirm that a path outside the rule is refused.                          | yes      |
| 16  | `feat(images): resize and upload dropped images`  | `src/lib/image-upload.ts`                                          | Upload a 4000 pixel wide PNG. The stored object is WebP, 1320 pixels wide, and far under 5 MB.                            | yes      |
| 17  | `feat(editor): insert an image at the drop point` | `src/components/MarkdownEditor.vue`, `src/lib/markdown-browser.ts` | Drop a file between two paragraphs. The markdown line lands there. The preview shows the image with a width and a height. | no       |
| 18  | `feat(editor): move an image by dragging it`      | `src/components/MarkdownEditor.vue`                                | Drag an image two paragraphs down. The source line moves. Ctrl+Z restores it.                                             | no       |
| 19  | `feat(editor): add a keyboard path for images`    | `src/components/MarkdownEditor.vue`                                | Add an image with the file input. Move it with the buttons. The result equals the drag result.                            | yes      |
| 20  | `feat(editor): handle upload failures`            | `src/components/MarkdownEditor.vue`, `src/lib/image-upload.ts`     | Drop a text file, a 40 MB image, and a valid image while offline. Each shows its message and keeps the text.              | yes      |

### M4: invited or public editing with moderation

| #   | Commit                                           | Files                                                                     | Verification                                                                                  | Delegate |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- |
| 21  | `feat(db): add invited and public edit policies` | `src/db/supabase-documents-schema.sql`                                    | Update a `public` page as `anon`. Confirm that the same update on an `owner` page is refused. | yes      |
| 22  | `feat(editor): sign in editors by magic link`    | `src/composables/useSupabaseAuth.ts`, `src/components/MarkdownEditor.vue` | Invite one address. Sign in with the link. Save. Confirm that a different account is refused. | no       |
| 23  | `feat(admin): add the document admin page`       | `src/components/DocumentAdmin.vue`, `pages/admin/documents.md`            | Open `/admin/documents`. Sign in. The list shows the documents and their versions.            | yes      |
| 24  | `feat(admin): restore an older document version` | `src/components/DocumentAdmin.vue`                                        | Restore version 2 of a page at version 5. The row becomes version 6 with the old text.        | yes      |
| 25  | `feat(admin): delete unused uploaded images`     | `src/components/DocumentAdmin.vue`                                        | Upload an image, remove it from the text, save, then delete the object from the admin page.   | yes      |

### M5: sync back to the repository

| #   | Commit                                            | Files                                       | Verification                                                                                                                  | Delegate |
| --- | ------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| 26  | `feat(scripts): write live documents into pages`  | `scripts/sync-documents.ts`, `package.json` | Run the script locally against a test row. The page file gains the new text and the `builtVersion` key.                       | yes      |
| 27  | `feat(scripts): download and rewrite images`      | `scripts/sync-documents.ts`                 | Run it for a document with two uploaded images. The files land in `src/assets/images/`, and the markdown uses relative paths. | yes      |
| 28  | `feat(scripts): escape vue syntax before writing` | `scripts/sync-documents.ts`                 | A document with `{{ 1 + 1 }}` and a `<script>` block is written escaped, and the built page shows the literal text.           | yes      |
| 29  | `feat(scripts): sync the editable pages table`    | `scripts/sync-documents.ts`                 | Change a frontmatter value from `owner` to `invited`. Run the script. The table row changes.                                  | yes      |
| 30  | `ci: add the sync documents workflow`             | `.github/workflows/sync-documents.yml`      | Start it with `workflow_dispatch`. It commits and pushes, and the deploy workflow runs.                                       | no       |
| 31  | `feat(db): dispatch a sync after a save`          | `src/db/supabase-documents-sync.sql`        | Save a document. One dispatch arrives. Save five times in one minute. Still one dispatch.                                     | no       |
| 32  | `docs: describe the editable page workflow`       | `docs/editable-pages.md`                    | Read it and follow it from a clean checkout.                                                                                  | yes      |

## 11. Open questions for the owner

| #   | Question                                                                                        | Recommended answer                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Which page becomes the first editable page?                                                     | A new page, for example `pages/notes/scratch.md`, with `editable: owner`. It has no pens and no `hydra`, so M1 and M2 can be tested without risk.                               |
| 2   | Do translations get separate documents?                                                         | Yes. One document per `page_path`, and one access rule per `base_path`. The texts differ, so a shared document would be wrong, and the access rule should not be written twice. |
| 3   | When a live document is newer, does the page replace the text, or only show a notice?           | Replace it, after `whenIdle`, and show a small "edited live" mark with the time. A notice alone leaves the visitor reading the old text.                                        |
| 4   | Do we ever want `editable: public`?                                                             | Not until the hydra `eval` runs in a sandboxed iframe. Start with `owner`, then `invited`.                                                                                      |
| 5   | How does the owner sign in: with a password, as `StrokeAdmin` does today, or with a magic link? | Keep the password path for the owner, because the code exists and works, and add the magic link for invited editors only.                                                       |
| 6   | Can an editable page hold Vue components such as `DrawablePen`?                                 | No. A live document is plain HTML, so the component would disappear while the live document shows. The build guard enforces this.                                               |
| 7   | Does the sync job push to `main`, or open a pull request?                                       | Push to `main` for an owner edit. Open a pull request for a document written by an anonymous or invited editor, so a human reads it before it becomes code.                     |
| 8   | How long is the document history kept?                                                          | Forever, for now. It is text, and the free plan database holds 500 MB. Review this when one page passes a thousand versions.                                                    |

## 12. Risks

| Risk                                                                                                        | Mitigation                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A visitor writes code into an editable page, and the sync job turns it into a Vue template that runs in CI. | The sync script escapes `<` and `{{`, and rejects `<script` and `<style` blocks. The build guard fails on a component tag in an editable page. An anonymous edit goes through a pull request.        |
| An editable page also sets `hydra: true`, so a code fence becomes an `eval`.                                | Three checks: the build guard, the `hydra` column in `editable_pages`, and the `p.hydra = false` test in both public update policies.                                                                |
| The editor chunk reaches the entry chunk through one static import.                                         | `scripts/check-asset-sizes.sh` fails at 40,000 bytes gzip, and the new per chunk budgets name the cause in the log line.                                                                             |
| The live view and the built view differ, and the owner reads that as a fault.                               | Document the two known differences, code colour and image format, and show an "edited live, not yet built" mark on a page whose version is ahead of `builtVersion`.                                  |
| A burst of saves spends GitHub Actions minutes.                                                             | The dispatch trigger allows one call per minute per page, and the workflow uses `concurrency` with `cancel-in-progress`.                                                                             |
| The sync job overwrites a save that arrived while it ran.                                                   | The job never writes the document. It only sets `built_version`, guarded by `version=eq.<version>`, so a newer save keeps `version > built_version` and the page keeps preferring the live document. |
| An anonymous editor floods a page with saves or uploads.                                                    | The trigger allows ten saves per minute per author, the bucket limits the size and the type, and the owner can set `access` back to `owner` from the admin page.                                     |
| Supabase Storage fills up, or the egress passes the free limit.                                             | Images are resized to 1320 pixels wide WebP before the upload, the sync job moves them into the repository, and the admin page can delete unused objects.                                            |
| Two people edit at once and one loses work.                                                                 | Every save is in `page_document_history`, the local text stays in `localStorage` until a save succeeds, and the conflict banner never overwrites the open text.                                      |
| `route.meta.frontmatter` grows with `builtVersion` on many pages, and the entry chunk grows with it.        | The key is one number per editable page, about 20 bytes gzip each (estimate), and the CI budget catches the day it matters.                                                                          |
| The markdown package versions in the browser drift from the build versions.                                 | The browser imports the installed versions from `package.json`, and `scripts/slugify.ts` is imported, not copied, so one change updates both paths.                                                  |
