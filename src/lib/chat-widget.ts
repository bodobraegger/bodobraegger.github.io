const CHATANGO_SCRIPT_URL = '//st.chatango.com/js/gz/emb.js'
const CHATANGO_SCRIPT_ID = 'cid0027770408674072725'
const CHATANGO_CONFIG = '{"handle":"brbrbrbrbrbrb","arch":"js","styles":{"a":"FFF","b":0,"c":"777","d":"777","e":"000","f":0,"g":"777","i":0,"j":"777","k":"777","l":"777","m":"777","n":"777","o":50,"p":"10","q":"777","r":0,"t":1,"v":0,"usricon":0.88,"pos":"br","cv":1,"cvfnt":"BradfordMonoLL, monospace, sans-serif","cvbg":"CC7770","cvbga":0,"cvfg":"777","cvw":280,"cvh": 21,"sba":0,"surl":0,"ticker":1,"fwtickm":0,"useonm": 1}}'

const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
const FALLBACK_DELAY_MS = 10_000

let loaded = false

function injectChatWidget() {
  if (loaded)
    return
  loaded = true
  const script = document.createElement('script')
  script.id = CHATANGO_SCRIPT_ID
  script.setAttribute('data-cfasync', 'false')
  script.src = CHATANGO_SCRIPT_URL
  script.title = 'Chatango chat widget'
  script.text = CHATANGO_CONFIG
  document.head.appendChild(script)
}

/**
 * Loads the third-party chat widget on the first user interaction, or after a
 * fallback delay once the browser is idle, so it never competes with the
 * page's own load and hydration.
 */
export function loadChatWidgetOnInteraction() {
  const controller = new AbortController()
  const start = () => {
    controller.abort()
    injectChatWidget()
  }
  for (const eventName of INTERACTION_EVENTS)
    window.addEventListener(eventName, start, { once: true, passive: true, signal: controller.signal })

  setTimeout(() => {
    if ('requestIdleCallback' in window)
      requestIdleCallback(start)
    else
      start()
  }, FALLBACK_DELAY_MS)
}
