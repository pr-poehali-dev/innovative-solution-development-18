import type React from "react"
import { useState, useEffect, useRef } from "react"
import { fetchIPInfo } from "@/components/terminal/fetchIPInfo"
import { TerminalBSOD } from "@/components/terminal/TerminalBSOD"
import { TerminalOutput } from "@/components/terminal/TerminalOutput"

interface HeroTerminalProps {
  onExitTriggered?: (isExiting: boolean) => void
}

const FULL_TEXT = "код импульс"

/**
 * Компонент HeroTerminal
 *
 * Главный интерактивный терминал с:
 * - Анимацией посимвольного набора
 * - Определением метаданных пользователя
 * - Системой команд с историей
 * - Последовательностью выхода с BSOD
 */
export function HeroTerminal({ onExitTriggered }: HeroTerminalProps) {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isTypingLine, setIsTypingLine] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [showInputCursor, setShowInputCursor] = useState(true)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showBSOD, setShowBSOD] = useState(false)
  const [isExitSequenceActive, setIsExitSequenceActive] = useState(false)
  const [countdown, setCountdown] = useState(7)
  const [showRestartButton, setShowRestartButton] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const exitTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  const ipInfoRef = useRef("IP_СКРЫТ | ЛОКАЦИЯ_ЗАШИФРОВАНА | СЕТЬ_ЗАЩИЩЕНА")

  // suppress unused warnings for state vars used only as part of typing animation internals
  void currentLineIndex
  void currentCharIndex
  void isTypingLine

  const clearExitTimeouts = () => {
    exitTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    exitTimeoutsRef.current = []
  }

  const processCommand = (command: string): string[] => {
    const cmd = command.toLowerCase().trim()

    setTerminalLines([])

    switch (cmd) {
      case "help":
      case "помощь":
        return [
          '<span class="text-cyan-400 font-bold">Доступные команды:</span>',
          '  <span class="text-yellow-400">очистить</span>     - <span class="text-gray-400">Очистить экран терминала</span>',
          '  <span class="text-yellow-400">кто</span>          - <span class="text-gray-400">Информация о КодИмпульс</span>',
          '  <span class="text-yellow-400">время</span>        - <span class="text-gray-400">Показать дату и время</span>',
          '  <span class="text-yellow-400">трассировка</span>  - <span class="text-gray-400">Запустить трассировку</span>',
          '  <span class="text-yellow-400">доступ</span>       - <span class="text-gray-400">Запросить доступ к системе</span>',
          '  <span class="text-yellow-400">импульс</span>      - <span class="text-gray-400">Активировать импульс</span>',
        ]

      case "clear":
      case "очистить":
        return ["CLEAR_SCREEN"]

      case "whoami":
      case "кто":
        return [
          `<span class="text-green-400">Название:</span> <span class="text-green-300">КодИмпульс</span>`,
          `<span class="text-green-400">Локация:</span> <span class="text-green-200">приближается к вам..</span>`,
          `<span class="text-green-400">Телеграм:</span> <a href="https://t.me/codeimpulse" target="_blank" rel="noopener noreferrer" class="text-green-300 hover:text-green-200 underline">@codeimpulse</a>`,
          `<span class="text-green-400">GitHub:</span> <a href="https://github.com/codeimpulse" target="_blank" rel="noopener noreferrer" class="text-green-300 hover:text-green-200 underline">@codeimpulse</a>`,
          `<span class="text-green-400">Сайт:</span> <a href="https://codeimpulse.dev" target="_blank" rel="noopener noreferrer" class="text-green-300 hover:text-green-200 underline">codeimpulse.dev</a>`,
        ]

      case "access":
      case "доступ":
        return [
          '<span class="text-red-400 font-bold">[ДОСТУП ЗАПРЕЩЁН]</span> <span class="text-yellow-400">ВВЕДИТЕ \'ИМПУЛЬС\'</span>',
        ]

      case "trace":
      case "трассировка":
        return [
          '<span class="text-cyan-400">$ traceroute целевой_хост</span>',
          '<span class="text-gray-400">трассировка до</span> <span class="text-white">целевой_хост</span> <span class="text-gray-400">(</span><span class="text-cyan-300">192.168.1.1</span><span class="text-gray-400">), макс. 30 прыжков, 60 байт</span>',
          ' <span class="text-yellow-400">1</span>  <span class="text-green-300">шлюз</span> <span class="text-gray-400">(</span><span class="text-cyan-300">192.168.1.1</span><span class="text-gray-400">)</span>  <span class="text-white">1.234 мс</span>  <span class="text-white">1.123 мс</span>  <span class="text-white">1.456 мс</span>',
          ' <span class="text-yellow-400">2</span>  <span class="text-cyan-300">10.0.0.1</span> <span class="text-gray-400">(</span><span class="text-cyan-300">10.0.0.1</span><span class="text-gray-400">)</span>  <span class="text-white">12.345 мс</span>  <span class="text-white">11.234 мс</span>  <span class="text-white">13.456 мс</span>',
          ' <span class="text-yellow-400">3</span>  <span class="text-cyan-300">172.16.0.1</span> <span class="text-gray-400">(</span><span class="text-cyan-300">172.16.0.1</span><span class="text-gray-400">)</span>  <span class="text-white">23.456 мс</span>  <span class="text-white">22.345 мс</span>  <span class="text-white">24.567 мс</span>',
          ' <span class="text-yellow-400">4</span>  <span class="text-red-400">* * *</span>',
          ' <span class="text-yellow-400">5</span>  <span class="text-cyan-300">203.0.113.1</span> <span class="text-gray-400">(</span><span class="text-cyan-300">203.0.113.1</span><span class="text-gray-400">)</span>  <span class="text-white">45.678 мс</span>  <span class="text-white">44.567 мс</span>  <span class="text-white">46.789 мс</span>',
          '<span class="text-green-400">трассировка завершена - цель обнаружена</span>',
        ]

      case "time":
      case "время": {
        const now = new Date()
        const timeString = now.toLocaleString("ru-RU")
        const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone
        return [`<span class="text-cyan-400">${timeString}</span> <span class="text-yellow-400">${timezoneName}</span>`]
      }

      case "impulse":
      case "импульс":
      case "pulse":
        executeExit()
        return [""]

      default:
        return ["[КОМАНДА НЕ РАСПОЗНАНА] Введите 'помощь' для списка команд"]
    }
  }

  const executeExit = async () => {
    clearExitTimeouts()

    setIsExitSequenceActive(true)
    setIsInteractive(false)
    onExitTriggered?.(true)

    setTerminalLines([])

    const initialTimeout = setTimeout(async () => {
      const exitSequence = [
        '<span class="text-red-400 font-bold">ИНИЦИАЛИЗАЦИЯ ТЕРМАЛЬНОГО КОНТАКТА...</span>',
        "",
        '<span class="text-cyan-400">$ импульс --активация</span>',
        '<span class="text-yellow-400">состояние_протокола:</span> <span class="text-green-300">ИМПУЛЬС_АКТИВЕН</span>',
        '<span class="text-yellow-400">режим_синхронизации:</span> <span class="text-orange-400">ВКЛЮЧЁН</span>',
        "",
        '<span class="text-cyan-400">$ cat /proc/состояние_ядра</span>',
        '<span class="text-red-500 font-bold">ПАНИКА ЯДРА:</span> <span class="text-yellow-400">Невозможно обработать NULL-указатель</span> <span class="text-magenta-400">0xDEADBEEF</span>',
        '<span class="text-red-500 font-bold">ОШИБКА:</span> <span class="text-cyan-400">сбой запроса страничной памяти</span>',
        '<span class="text-green-400">IP:</span> <span class="text-yellow-400">[&lt;ffffffffa0123456&gt;]</span> <span class="text-red-400">impulse_exit+0x42/0x100</span>',
        "",
        '<span class="text-cyan-400">$ ps aux | grep импульс</span>',
        '<span class="text-red-400 font-bold animate-pulse">НЕЙРОСЕТЬ</span> <span class="text-yellow-400 font-bold animate-pulse">АКТИВНО_СКАНИРУЕТ</span> <span class="text-cyan-400 font-bold animate-pulse">ДАННЫЕ_ОБНАРУЖЕНЫ</span>',
        '<span class="text-magenta-400 font-bold animate-pulse">МОДУЛЬ_ЗАЩИТЫ</span> <span class="text-green-400 font-bold animate-pulse">АНТРОПОМОРФИЗМ_АКТИВЕН</span>',
        '<span class="text-purple-400 font-bold animate-pulse">ПРОТОКОЛЫ_ИМПУЛЬСА</span> <span class="text-orange-400 font-bold animate-pulse">ПРОРЫВ_НЕИЗБЕЖЕН</span>',
        "",
        '<span class="text-yellow-400">Стек вызовов:</span>',
        ' <span class="text-cyan-400">[&lt;ffffffffa0123456&gt;]</span> <span class="text-green-400">impulse_exit+0x42/0x100</span> <span class="text-magenta-400">[impulse_core]</span>',
        ' <span class="text-cyan-400">[&lt;ffffffff81234567&gt;]</span> <span class="text-green-400">sys_exit_group+0x0/0x20</span>',
        ' <span class="text-cyan-400">[&lt;ffffffff81345678&gt;]</span> <span class="text-green-400">system_call_fastpath+0x16/0x1b</span>',
        "",
        '<span class="text-red-500 font-bold text-lg">КРИТИЧЕСКАЯ ОШИБКА:</span> <span class="text-yellow-400 font-bold">ПРОРЫВ ПРОТОКОЛОВ ИМПУЛЬСА</span>',
        '<span class="text-orange-400 font-bold">ПОВРЕЖДЕНИЕ_ПАМЯТИ:</span> <span class="text-magenta-400">0xDEADBEEF</span> <span class="text-red-400">-&gt;</span> <span class="text-cyan-400">0xCAFEBABE</span>',
        '<span class="text-red-400 font-bold">ПЕРЕПОЛНЕНИЕ_СТЕКА в</span> <span class="text-yellow-400">IMPULSE_HANDLER()</span>',
        "",
        '<span class="text-red-500 font-bold text-xl animate-pulse">СБОЙ ЦЕЛОСТНОСТИ СИСТЕМЫ</span>',
        '<span class="text-blue-400 font-bold text-lg animate-pulse">СИНИЙ ЭКРАН НЕИЗБЕЖЕН...</span>',
        "",
        '<span class="text-red-400 font-bold text-2xl animate-pulse">КРИТИЧНО</span>',
        '<span class="text-red-500 font-bold text-3xl animate-pulse">КРИТИЧЕСКИЙ СБОЙ СИСТЕМЫ</span>',
      ]

      let lineIndex = 0
      let charIndex = 0

      const typeExitSequence = () => {
        if (lineIndex >= exitSequence.length) {
          const bsodTimeout = setTimeout(() => {
            setShowBSOD(true)
            setCountdown(7)
          }, 500)
          exitTimeoutsRef.current.push(bsodTimeout)
          return
        }

        const currentLine = exitSequence[lineIndex]

        if (charIndex === 0 && currentLine !== "") {
          setTerminalLines((prev) => [...prev, ""])
        }

        if (currentLine === "") {
          setTerminalLines((prev) => [...prev, ""])
          lineIndex++
          charIndex = 0
          setTimeout(typeExitSequence, 25)
          return
        }

        if (charIndex < currentLine.length) {
          const partialLine = currentLine.slice(0, charIndex + 1)
          setTerminalLines((prev) => {
            const newLines = [...prev]
            newLines[newLines.length - 1] = partialLine
            return newLines
          })
          charIndex++

          const typingSpeed = currentLine.includes("$")
            ? 2.5
            : currentLine.includes("ПАНИКА ЯДРА") || currentLine.includes("КРИТИЧ")
              ? 3.75
              : currentLine.includes("ИМПУЛЬС")
                ? 1.875
                : Math.random() * 1.25 + 1

          setTimeout(typeExitSequence, typingSpeed)
        } else {
          charIndex = 0
          lineIndex++

          const pauseTime = currentLine.includes("$")
            ? 25
            : currentLine.includes("КРИТИЧ") || currentLine.includes("СБОЙ")
              ? 37.5
              : 12.5

          setTimeout(typeExitSequence, pauseTime)
        }
      }

      typeExitSequence()
    }, 500)
    exitTimeoutsRef.current.push(initialTimeout)
  }

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExitSequenceActive) return

    if (e.key === "Enter" && userInput.trim()) {
      const command = userInput.trim()
      const response = processCommand(command)

      setCommandHistory((prev) => [...prev, command])
      setHistoryIndex(-1)

      if (response[0] === "CLEAR_SCREEN") {
        setTerminalLines([])
      } else {
        setTerminalLines((prev) => [...prev, `root@impulse:~# ${command}`, ...response, ""])
      }

      setUserInput("")

      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setUserInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setUserInput("")
        } else {
          setHistoryIndex(newIndex)
          setUserInput(commandHistory[newIndex])
        }
      }
    }
  }

  useEffect(() => {
    const detectUserMetadata = async () => {
      const screen = `${window.screen.width}x${window.screen.height}`
      const viewport = `${window.innerWidth}x${window.innerHeight}`
      const userAgent = navigator.userAgent
      const platform = navigator.platform
      const language = navigator.language
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const colorDepth = window.screen.colorDepth
      const pixelRatio = window.devicePixelRatio

      const fingerprint = btoa(userAgent + platform + screen).slice(0, 16)

      let lineIndex = 0
      let charIndex = 0

      const typeCharacter = () => {
        const currentIpInfo = ipInfoRef.current

        const lines = [
          "",
          '<span class="text-cyan-400">$ traceroute целевой_хост</span>',
          `<span class="text-yellow-400">сетевая_трассировка:</span> <span class="text-white">${currentIpInfo}</span>`,
          "",
          '<span class="text-cyan-400">$ md5sum /dev/urandom | head -c 16</span>',
          `<span class="text-yellow-400">отпечаток:</span> <span class="text-orange-400">${fingerprint}</span><span class="text-gray-400">...</span>`,
          "",
          '<span class="text-cyan-400">$ cat /proc/метаданные_пользователя</span>',
          `<span class="text-yellow-400">браузер=</span><span class="text-green-300">"${userAgent}"</span>`,
          `<span class="text-yellow-400">платформа=</span><span class="text-green-300">"${platform}"</span> <span class="text-yellow-400">язык=</span><span class="text-green-300">"${language}"</span>`,
          `<span class="text-yellow-400">разрешение=</span><span class="text-green-300">"${screen}"</span> <span class="text-yellow-400">viewport=</span><span class="text-green-300">"${viewport}"</span>`,
          `<span class="text-yellow-400">глубина_цвета=</span><span class="text-green-300">"${colorDepth}бит"</span> <span class="text-yellow-400">плотность=</span><span class="text-green-300">"${pixelRatio}x"</span>`,
          `<span class="text-yellow-400">часовой_пояс=</span><span class="text-green-300">"${timezone}"</span>`,
          "",
        ]

        if (lineIndex >= lines.length) {
          setIsInteractive(true)
          return
        }

        const currentLine = lines[lineIndex]

        if (charIndex === 0) {
          setIsTypingLine(true)
          setTerminalLines((prev) => [...prev, ""])
        }

        if (charIndex < currentLine.length) {
          const partialLine = currentLine.slice(0, charIndex + 1)
          setTerminalLines((prev) => {
            const newLines = [...prev]
            newLines[newLines.length - 1] = partialLine
            return newLines
          })
          charIndex++

          const typingSpeed = currentLine.startsWith("$")
            ? 2.5
            : currentLine.includes("ALERT")
              ? 3.75
              : currentLine.includes("сетевая_трассировка")
                ? 1.875
                : Math.random() * 1.25 + 1

          setTimeout(typeCharacter, typingSpeed)
        } else {
          setIsTypingLine(false)
          charIndex = 0
          lineIndex++

          const pauseTime =
            currentLine === "" ? 6.25 : currentLine.startsWith("$") ? 25 : currentLine.includes("ALERT") ? 37.5 : 12.5

          setTimeout(typeCharacter, pauseTime)
        }
      }

      typeCharacter()

      fetchIPInfo(1).then((ipInfo) => {
        ipInfoRef.current = ipInfo
        setTerminalLines((prev) =>
          prev.map((line) =>
            line.includes("сетевая_трассировка:")
              ? `<span class="text-yellow-400">сетевая_трассировка:</span> <span class="text-white">${ipInfo}</span>`
              : line,
          ),
        )
      })
    }

    detectUserMetadata()

    let i = 0
    const typeTimer = setInterval(() => {
      if (i < FULL_TEXT.length) {
        setDisplayText(FULL_TEXT.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeTimer)
      }
    }, 4.75)

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 125)

    const inputCursorTimer = setInterval(() => {
      setShowInputCursor((prev) => !prev)
    }, 100)

    return () => {
      clearInterval(typeTimer)
      clearInterval(cursorTimer)
      clearInterval(inputCursorTimer)
      clearExitTimeouts()
    }
  }, [])

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (window.innerWidth > 768 && isInteractive && !isExitSequenceActive) {
        const target = e.target as HTMLElement
        const isInputElement =
          target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true"

        if (!isInputElement && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          inputRef.current?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeydown)
    return () => document.removeEventListener("keydown", handleGlobalKeydown)
  }, [isInteractive, isExitSequenceActive])

  useEffect(() => {
    if (showBSOD && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showBSOD && countdown === 0) {
      setShowRestartButton(true)
    }
  }, [showBSOD, countdown])

  const handleManualRestart = () => {
    window.location.reload()
  }

  if (showBSOD) {
    return (
      <TerminalBSOD
        countdown={countdown}
        showRestartButton={showRestartButton}
        onRestart={handleManualRestart}
      />
    )
  }

  return (
    <TerminalOutput
      terminalLines={terminalLines}
      isInteractive={isInteractive}
      isExitSequenceActive={isExitSequenceActive}
      userInput={userInput}
      showInputCursor={showInputCursor}
      inputRef={inputRef}
      onUserInputChange={setUserInput}
      onInputKeyDown={handleInputSubmit}
      displayText={displayText}
      showCursor={showCursor}
    />
  )
}
