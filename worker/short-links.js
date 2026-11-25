const PATH_PREFIX = '/l/'
const RESOLVE_PATH = '/rest/v1/rpc/resolve_short_link'
const STATUS_FOUND = 302
const STATUS_UNAVAILABLE = 503

async function resolveTarget(slug, env) {
  const response = await fetch(`${env.SUPABASE_URL}${RESOLVE_PATH}`, {
    body: JSON.stringify({ link_slug: slug }),
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_ANON_KEY,
    },
    method: 'POST',
  })
  if (!response.ok)
    throw new Error(`resolve_short_link failed with HTTP ${response.status}`)
  return response.json()
}

export default {
  async fetch(request, env) {
    const slug = new URL(request.url).pathname.slice(PATH_PREFIX.length).replace(/\/$/, '')

    try {
      const target = await resolveTarget(slug, env)
      // An unknown slug gets the 404 page of the site.
      if (!target)
        return fetch(request)
      return new Response(null, {
        headers: { 'Cache-Control': 'no-store', 'Location': target },
        status: STATUS_FOUND,
      })
    }
    catch (error) {
      console.error(error)
      return new Response('Short links are unavailable right now.', { status: STATUS_UNAVAILABLE })
    }
  },
}
