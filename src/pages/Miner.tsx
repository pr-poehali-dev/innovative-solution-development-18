import { useState, useEffect, useRef, useCallback } from "react"
import { CodeRain } from "@/components/CodeRain"
import func2url from "../../backend/func2url.json"

const PTC_PER_CLICK = 0.00000000000001
const BOOST_COST_RUB = 1000
const BOOST_PERCENT = 1

interface MinerProps {
  email: string
  token: string
  onLogout: () => void
}

interface FloatLabel {
  id: number
  x: number
  y: number
  value: string
}

export default function MinerPage({ email, token, onLogout }: MinerProps) {
  const [clicks, setClicks] = useState(0)
  const [boostLevel, setBoostLevel] = useState(0)
  const [floats, setFloats] = useState<FloatLabel[]>([])
  const [pressing, setPressing] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const floatId = useRef(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const urls = func2url as Record<string, string>

  const ptcPerClick = PTC_PER_CLICK * (1 + (BOOST_PERCENT / 100) * boostLevel)
  const totalPTC = clicks * ptcPerClick

  const formatPTC = (v: number) => v.toFixed(17).replace(/0+$/, "").replace(/\.$/, "")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(urls["miner-data"] ?? "/api/miner/data", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json() as { clicks?: number; boost_level?: number }
        setClicks(data.clicks ?? 0)
        setBoostLevel(data.boost_level ?? 0)
      } catch {
        const saved = localStorage.getItem("ptc_clicks")
        if (saved) setClicks(parseInt(saved))
      }
      setLoaded(true)
    }
    load()
  }, [token, urls])

  const saveToServer = useCallback(async (c: number, b: number) => {
    setSaving(true)
    try {
      await fetch(urls["miner-save"] ?? "/api/miner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clicks: c, boost_level: b }),
      })
    } catch {
      localStorage.setItem("ptc_clicks", String(c))
    } finally {
      setSaving(false)
    }
  }, [token, urls])

  const handleCoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newClicks = clicks + 1
    setClicks(newClicks)
    setPressing(true)
    setTimeout(() => setPressing(false), 150)

    const id = ++floatId.current
    setFloats(prev => [...prev, { id, x, y, value: `+${formatPTC(ptcPerClick)} PTC` }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 1000)

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveToServer(newClicks, boostLevel), 2000)
  }

  const handleBoostBuy = () => {
    setShowBoostModal(false)
    const newBoost = boostLevel + 1
    setBoostLevel(newBoost)
    saveToServer(clicks, newBoost)
  }

  if (!loaded) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <CodeRain />
        <p className="relative z-10 text-green-400 font-mono animate-pulse">
          &gt; ЗАГРУЗКА ДАННЫХ МАЙНЕРА...
        </p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      <CodeRain />

      {/* Шапка */}
      <header className="relative z-10 border-b border-green-500/20 bg-black/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between font-mono text-xs">
        <span className="text-green-400">root@miner-ptc:~$</span>
        <div className="flex items-center gap-4">
          <span className="text-green-600 hidden sm:inline">{email}</span>
          {saving && <span className="text-yellow-500 animate-pulse">СОХРАНЕНИЕ...</span>}
          <button
            onClick={onLogout}
            className="text-red-500/70 hover:text-red-400 border border-red-500/30 hover:border-red-400 px-2 py-1 rounded-sm transition-colors"
          >
            [ВЫХОД]
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 gap-6">

        {/* Статистика */}
        <div className="w-full max-w-sm border border-green-500/30 bg-black/80 backdrop-blur rounded-sm p-4 font-mono">
          <div className="flex justify-between text-xs text-green-600 mb-1">
            <span>&gt; БАЛАНС:</span>
            <span className="text-green-400 font-bold">{formatPTC(totalPTC)} PTC</span>
          </div>
          <div className="flex justify-between text-xs text-green-600 mb-1">
            <span>&gt; КЛИКОВ:</span>
            <span className="text-green-400">{clicks.toLocaleString("ru-RU")}</span>
          </div>
          <div className="flex justify-between text-xs text-green-600 mb-1">
            <span>&gt; ЗА КЛИК:</span>
            <span className="text-yellow-400">{formatPTC(ptcPerClick)} PTC</span>
          </div>
          <div className="flex justify-between text-xs text-green-600">
            <span>&gt; БУСТ:</span>
            <span className={boostLevel > 0 ? "text-yellow-400" : "text-green-600"}>
              {boostLevel > 0 ? `+${boostLevel * BOOST_PERCENT}% (x${boostLevel})` : "НЕТ"}
            </span>
          </div>
        </div>

        {/* Монета */}
        <div className="relative">
          <button
            onClick={handleCoinClick}
            className={`relative w-48 h-48 rounded-full border-4 border-yellow-500/60 bg-gradient-to-br from-yellow-900/40 to-yellow-600/20 flex items-center justify-center cursor-pointer select-none transition-all duration-100 hover:border-yellow-400/80 hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] active:scale-95 ${
              pressing ? "scale-95 shadow-[0_0_60px_rgba(234,179,8,0.5)]" : "shadow-[0_0_20px_rgba(234,179,8,0.15)]"
            }`}
          >
            <span className="text-7xl select-none pointer-events-none">₿</span>

            {floats.map(f => (
              <span
                key={f.id}
                className="absolute text-xs font-mono text-green-400 pointer-events-none animate-bounce"
                style={{
                  left: f.x,
                  top: f.y,
                  transform: "translate(-50%, -100%)",
                  animation: "floatUp 1s ease-out forwards",
                }}
              >
                {f.value}
              </span>
            ))}
          </button>

          <p className="text-center text-green-600 text-xs font-mono mt-3">
            ТАП ДЛЯ ДОБЫЧИ PTC
          </p>
        </div>

        {/* Кнопка буст */}
        <button
          onClick={() => setShowBoostModal(true)}
          className="border border-yellow-500/40 bg-yellow-500/5 text-yellow-400 font-mono text-sm px-8 py-3 rounded-sm hover:bg-yellow-500/10 hover:border-yellow-400/60 transition-all tracking-widest"
        >
          ⚡ БУСТ +{BOOST_PERCENT}% [{BOOST_COST_RUB} ₽]
        </button>
      </main>

      {/* Модал покупки буста */}
      {showBoostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="border border-yellow-500/40 bg-black/95 rounded-sm p-6 w-full max-w-sm font-mono">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-bold">ПОКУПКА БУСТА</span>
            </div>
            <div className="space-y-2 text-xs text-green-600 mb-5">
              <div className="flex justify-between">
                <span>Текущий буст:</span>
                <span className="text-green-400">{boostLevel * BOOST_PERCENT}%</span>
              </div>
              <div className="flex justify-between">
                <span>После покупки:</span>
                <span className="text-yellow-400">+{(boostLevel + 1) * BOOST_PERCENT}%</span>
              </div>
              <div className="flex justify-between border-t border-green-500/20 pt-2">
                <span>Стоимость:</span>
                <span className="text-white font-bold">{BOOST_COST_RUB} ₽</span>
              </div>
            </div>
            <p className="text-green-600 text-xs mb-5 border border-green-500/20 bg-green-500/5 p-3 rounded-sm">
              После нажатия «ОПЛАТИТЬ» свяжитесь с администратором для активации.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBoostModal(false)}
                className="flex-1 py-2 border border-green-500/30 text-green-600 hover:text-green-400 text-xs rounded-sm transition-colors"
              >
                [ОТМЕНА]
              </button>
              <button
                onClick={handleBoostBuy}
                className="flex-1 py-2 border border-yellow-500/50 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs rounded-sm transition-colors"
              >
                [ОПЛАТИТЬ]
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translate(-50%, -100%); }
          100% { opacity: 0; transform: translate(-50%, -220%); }
        }
      `}</style>
    </div>
  )
}