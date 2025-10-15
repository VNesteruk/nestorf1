// Live Stream Player using HLS.js
;(() => {
  console.log("[v0] Initializing live stream player...")

  const video = document.getElementById("liveVideo")

  // HLS stream URL - замініть на вашу URL
  const streamUrl = "http://myserver.com/hls/stream.m3u8"

  // Перевірка підтримки HLS
  const Hls = window.Hls // Declare the Hls variable before using it
  if (Hls.isSupported()) {
    console.log("[v0] HLS.js is supported, initializing...")

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
    })

    // Завантаження потоку
    hls.loadSource(streamUrl)
    hls.attachMedia(video)

    // Обробка подій
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("[v0] Stream manifest parsed, ready to play")

      // Автоматичне відтворення (muted для дозволу autoplay в браузерах)
      video.play().catch((err) => {
        console.log("[v0] Autoplay prevented:", err)
        // Якщо autoplay заблоковано, користувач має натиснути play вручну
      })
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("[v0] HLS error:", data)

      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log("[v0] Network error, trying to recover...")
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("[v0] Media error, trying to recover...")
            hls.recoverMediaError()
            break
          default:
            console.error("[v0] Fatal error, cannot recover")
            hls.destroy()
            showErrorMessage()
            break
        }
      }
    })
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    // Нативна підтримка HLS (Safari)
    console.log("[v0] Native HLS support detected")
    video.src = streamUrl

    video.addEventListener("loadedmetadata", () => {
      console.log("[v0] Stream loaded, ready to play")
      video.play().catch((err) => {
        console.log("[v0] Autoplay prevented:", err)
      })
    })

    video.addEventListener("error", () => {
      console.error("[v0] Video error:", video.error)
      showErrorMessage()
    })
  } else {
    console.error("[v0] HLS is not supported in this browser")
    showErrorMessage()
  }

  // Функція відображення помилки
  function showErrorMessage() {
    const container = document.querySelector(".video-container")
    const errorDiv = document.createElement("div")
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      text-align: center;
      padding: 2rem;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      z-index: 20;
    `
    errorDiv.innerHTML = `
      <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">Stream Unavailable</h3>
      <p style="color: #a0a0b0; font-size: 0.9rem;">Unable to load the live stream. Please check the stream URL or try again later.</p>
    `
    container.appendChild(errorDiv)
  }

  // Додаткові налаштування відео
  video.volume = 0 // Muted за замовчуванням
  video.setAttribute("playsinline", "") // Для мобільних пристроїв
})()
