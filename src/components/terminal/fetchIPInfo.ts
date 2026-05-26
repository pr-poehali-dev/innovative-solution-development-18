export const fetchIPInfo = async (retries = 1): Promise<string> => {
  const isLikelyBlocked =
    navigator.doNotTrack === "1" ||
    (window as unknown as { chrome?: { runtime?: { onConnect?: unknown } } }).chrome?.runtime?.onConnect ||
    (navigator.userAgent.includes("Firefox") && navigator.userAgent.includes("Private"))

  if (isLikelyBlocked) {
    return "IP_СКРЫТ | ЛОКАЦИЯ_ЗАШИФРОВАНА | СЕТЬ_ЗАЩИЩЕНА"
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
        cache: "no-cache",
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return `${data.ip} | ${data.city}, ${data.region} | Провайдер: ${data.org}`
    } catch {
      if (attempt === retries) {
        return "IP_СКРЫТ | ЛОКАЦИЯ_ЗАШИФРОВАНА | СЕТЬ_ЗАЩИЩЕНА"
      }
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  return "IP_СКРЫТ | ЛОКАЦИЯ_ЗАШИФРОВАНА | СЕТЬ_ЗАЩИЩЕНА"
}
