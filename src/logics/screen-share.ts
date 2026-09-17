let screenStream: MediaStream | null = null
let screenRequest: Promise<MediaStream> | null = null
let originalGetDisplayMedia: MediaDevices['getDisplayMedia'] | null = null
let stillFrameUrl: string | undefined
const screenWatchers = new Set<(stream: MediaStream) => void>()

/**
 * A browser never remembers a screen choice: getDisplayMedia opens the picker on
 * every call, and every sketch on a page calls it again on every restart. This
 * holds the first stream and hands it back, so the reader picks a screen once a
 * visit and every hydra instance reads the same one, the code blocks and the
 * background alike.
 *
 * Returns the function that puts the browser's own method back and ends the
 * share.
 */
export function shareOneScreen(fallbackImageUrl?: string) {
  stillFrameUrl = fallbackImageUrl

  if (!originalGetDisplayMedia && navigator.mediaDevices?.getDisplayMedia) {
    originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices)

    navigator.mediaDevices.getDisplayMedia = (options) => {
      if (screenStream?.active)
        return Promise.resolve(screenStream)

      // Two sketches starting a moment apart both arrive before the first
      // picker closes, so they share the one request rather than opening a
      // second picker.
      if (!screenRequest) {
        screenRequest = originalGetDisplayMedia!(options)
          .then((stream) => {
            // The reader can end the share from the browser's own bar. Then the
            // picker has to open again for the next sketch.
            stream.getTracks().forEach(track => track.addEventListener('ended', () => {
              if (screenStream === stream)
                screenStream = null
            }))
            return stream
          })
          // A reader who says no still gets a picture: a still from the page
          // stands in for the screen, so the sketch has something to fold
          // instead of reading black.
          .catch(async (error) => {
            const stillFrame = fallbackImageUrl ? await streamFromImage(fallbackImageUrl) : null
            if (!stillFrame)
              throw error
            return stillFrame
          })
          .then((stream) => {
            screenStream = stream
            screenWatchers.forEach(watcher => watcher(stream))
            return stream
          })
          .finally(() => {
            screenRequest = null
          })
      }
      return screenRequest
    }
  }

  return stopSharingScreen
}

/**
 * Calls back with the screen the reader chose, at once if they have chosen one
 * already and again when they choose one later, and with a still of the page
 * while there is none. It never opens the picker itself, so a caller that runs
 * without a gesture, the page background for one, asks the reader for nothing.
 *
 * Returns the function that stops the calls.
 */
export function followSharedScreen(callback: (stream: MediaStream) => void) {
  screenWatchers.add(callback)

  if (screenStream?.active) {
    callback(screenStream)
  }
  else if (stillFrameUrl) {
    void streamFromImage(stillFrameUrl).then((stream) => {
      // The reader can pick a screen while the still is still being painted.
      if (stream && !screenStream?.active)
        callback(stream)
    })
  }

  return () => screenWatchers.delete(callback)
}

/** Paints the image on a canvas and captures that, so it reads as a video source. */
async function streamFromImage(url: string) {
  try {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = url
    await image.decode()

    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.getContext('2d')!.drawImage(image, 0, 0)
    return canvas.captureStream(1)
  }
  catch {
    return null
  }
}

function stopSharingScreen() {
  if (originalGetDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia
    originalGetDisplayMedia = null
  }
  // Leaving the page ends the share, so the browser stops saying this tab reads
  // the screen.
  screenStream?.getTracks().forEach(track => track.stop())
  screenStream = null
  screenRequest = null
  stillFrameUrl = undefined
  screenWatchers.clear()
}
