const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

export interface Weather {
  /** The place as the geocoder names it, which is not always as it was asked. */
  place: string
  celsius: number
  /** One word for the sky, from the WMO code the forecast returns. */
  sky: string
}

/**
 * WMO weather codes, grouped down to the words this site uses. A code the table
 * does not name is a kind of weather too rare here to be worth a word of its
 * own, and reads as the sky being unnamed.
 */
const SKY_WORDS: Array<[number[], string]> = [
  [[0, 1], 'clear'],
  [[2], 'part cloud'],
  [[3], 'overcast'],
  [[45, 48], 'fog'],
  [[51, 53, 55, 56, 57], 'drizzle'],
  [[61, 63, 65, 66, 67], 'rain'],
  [[71, 73, 75, 77, 85, 86], 'snow'],
  [[80, 81, 82], 'showers'],
  [[95, 96, 99], 'thunder'],
]

function skyWord(code: number) {
  return SKY_WORDS.find(([codes]) => codes.includes(code))?.[1] ?? 'sky'
}

// A place is asked for once per visit. The home page and the footer both read
// the same two places, so the answers are held here rather than fetched twice.
const pending = new Map<string, Promise<Weather | null>>()

interface Located {
  name: string
  latitude: number
  longitude: number
}

// A town does not move, so the browser keeps what the geocoder found for it,
// and a later visit asks only for the forecast. Storage can be blocked, and
// then each visit asks the geocoder again.
const LOCATED_KEY = 'weather-located'

function locatedTowns(): Record<string, Located> {
  try {
    return JSON.parse(localStorage.getItem(LOCATED_KEY) ?? '{}')
  }
  catch {
    return {}
  }
}

function keepLocated(town: string, located: Located) {
  try {
    localStorage.setItem(LOCATED_KEY, JSON.stringify({ ...locatedTowns(), [town]: located }))
  }
  catch {}
}

async function locate(town: string): Promise<Located | undefined> {
  const kept = locatedTowns()[town]
  if (kept)
    return kept
  const geocoded = await fetch(`${GEOCODE_URL}?name=${encodeURIComponent(town)}&count=1&language=en&format=json`)
    .then(response => response.json())
  const found = geocoded?.results?.[0]
  if (!found)
    return undefined
  const located = { name: found.name, latitude: found.latitude, longitude: found.longitude }
  keepLocated(town, located)
  return located
}

/**
 * The town the reader is most likely in, taken from the timezone of their
 * browser. It costs no permission prompt and no address lookup, and it is right
 * to the nearest large town, which is as close as a line of weather needs.
 */
export function readerPlace() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return timezone?.split('/').pop()?.replace(/_/g, ' ') ?? ''
}

async function lookUp(place: string): Promise<Weather | null> {
  // A place is written for a reader, "Rio de Janeiro, Brasil", and the geocoder
  // wants the town alone.
  const town = place.split(',')[0].trim()
  if (!town)
    return null

  const found = await locate(town)
  if (!found)
    return null

  const forecast = await fetch(`${FORECAST_URL}?latitude=${found.latitude}&longitude=${found.longitude}&current=temperature_2m,weather_code`)
    .then(response => response.json())
  const current = forecast?.current
  if (!current)
    return null

  return {
    place: found.name,
    celsius: Math.round(current.temperature_2m),
    sky: skyWord(current.weather_code),
  }
}

/**
 * The weather where a place is now, or nothing at all. The caller shows the
 * line once it arrives, so a service that is slow, blocked or down costs the
 * page nothing but a line that never appears.
 */
export function weatherAt(place: string) {
  let request = pending.get(place)
  if (!request) {
    request = lookUp(place).catch(() => null)
    pending.set(place, request)
  }
  return request
}
