import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import AuthPage from "./pages/Auth"
import MinerPage from "./pages/Miner"

interface User {
  email: string
  token: string
}

const App = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("ptc_token")
    const email = localStorage.getItem("ptc_email")
    if (token && email) {
      setUser({ token, email })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("ptc_token")
    localStorage.removeItem("ptc_email")
    setUser(null)
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {user ? (
        <MinerPage email={user.email} token={user.token} onLogout={handleLogout} />
      ) : (
        <AuthPage onAuth={setUser} />
      )}
    </TooltipProvider>
  )
}

export default App
