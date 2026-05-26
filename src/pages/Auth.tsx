import { useState } from "react"
import { CodeRain } from "@/components/CodeRain"
import func2url from "../../backend/func2url.json"

interface AuthProps {
  onAuth: (user: { email: string; token: string }) => void
}

export default function AuthPage({ onAuth }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [lines, setLines] = useState<string[]>([
    '> МАЙНЕР PTC v1.0 — система авторизации',
    '> Введите данные для доступа к терминалу...',
  ])

  const addLine = (line: string) => {
    setLines(prev => [...prev.slice(-10), line])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    addLine(`> ${mode === "login" ? "АВТОРИЗАЦИЯ" : "РЕГИСТРАЦИЯ"}... ${email}`)

    try {
      const urls = func2url as Record<string, string>
      const url = mode === "login"
        ? (urls["auth-login"] ?? "/api/auth/login")
        : (urls["auth-register"] ?? "/api/auth/register")
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json() as { token?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Ошибка сервера")

      addLine(`> ДОСТУП ПРЕДОСТАВЛЕН — загрузка майнера...`)
      localStorage.setItem("ptc_token", data.token ?? "")
      localStorage.setItem("ptc_email", email)
      setTimeout(() => onAuth({ email, token: data.token ?? "" }), 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка"
      setError(msg)
      addLine(`> [ОШИБКА] ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <CodeRain />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-4 font-mono text-xs text-green-500/70 space-y-1 min-h-[52px]">
          {lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>

        <div className="border border-green-500/40 bg-black/90 backdrop-blur rounded-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-green-500/20 bg-green-500/5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-green-400/60 text-xs font-mono">
              root@miner-ptc:~$ {mode === "login" ? "login" : "register"}
            </span>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">₿</div>
              <h1 className="text-green-400 font-mono font-bold text-xl tracking-widest">МАЙНЕР PTC</h1>
              <p className="text-green-600 text-xs font-mono mt-1">Добывай. Накапливай. Богатей.</p>
            </div>

            <div className="flex border border-green-500/30 rounded-sm mb-5 overflow-hidden">
              <button
                onClick={() => { setMode("login"); setError("") }}
                className={`flex-1 py-2 text-xs font-mono transition-colors ${
                  mode === "login"
                    ? "bg-green-500/20 text-green-400"
                    : "text-green-600 hover:text-green-400"
                }`}
              >
                [ВХОД]
              </button>
              <button
                onClick={() => { setMode("register"); setError("") }}
                className={`flex-1 py-2 text-xs font-mono transition-colors border-l border-green-500/30 ${
                  mode === "register"
                    ? "bg-green-500/20 text-green-400"
                    : "text-green-600 hover:text-green-400"
                }`}
              >
                [РЕГИСТРАЦИЯ]
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-green-500/80 text-xs font-mono mb-1">&gt; EMAIL:</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  className="w-full bg-black border border-green-500/30 text-green-400 font-mono text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-green-400 placeholder:text-green-900"
                />
              </div>
              <div>
                <label className="block text-green-500/80 text-xs font-mono mb-1">&gt; ПАРОЛЬ:</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-green-500/30 text-green-400 font-mono text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-green-400 placeholder:text-green-900"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs font-mono border border-red-500/30 bg-red-500/5 px-3 py-2 rounded-sm">
                  [ERR] {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-500/10 border border-green-500/50 text-green-400 font-mono text-sm rounded-sm hover:bg-green-500/20 hover:border-green-400 transition-all disabled:opacity-50 tracking-widest"
              >
                {loading ? "ИНИЦИАЛИЗАЦИЯ..." : mode === "login" ? ">> ВОЙТИ <<" : ">> СОЗДАТЬ АККАУНТ <<"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-green-900 text-xs font-mono mt-4">
          МАЙНЕР PTC © 2026 | За каждый клик — 0.00000000000001 PTC
        </p>
      </div>
    </div>
  )
}