import type React from "react"

interface TerminalOutputProps {
  terminalLines: string[]
  isInteractive: boolean
  isExitSequenceActive: boolean
  userInput: string
  showInputCursor: boolean
  inputRef: React.RefObject<HTMLInputElement>
  onUserInputChange: (value: string) => void
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  displayText: string
  showCursor: boolean
}

function getLineClassName(line: string): string {
  if (!line) return "text-muted-foreground"

  if (line.includes("whitespace-pre")) return ""

  if (
    line.includes("ВТОРЖЕНИЕ_ОБНАРУЖЕНО") ||
    line.includes("ЦЕЛЬ_ЗАХВАЧЕНА") ||
    line.includes("[ТРЕВОГА]") ||
    line.includes("АВАРИЙНЫЙ") ||
    line.includes("ВНИМАНИЕ:") ||
    line.includes("КРИТИЧЕСКАЯ ОШИБКА") ||
    line.includes("СБОЙ СИСТЕМЫ") ||
    line.includes("СКОМПРОМЕТИРОВАНО")
  ) {
    return "text-red-400 font-bold"
  }

  if (line.startsWith("$")) return "text-green-400"
  if (line.startsWith("root@impulse")) return "text-green-400 font-bold"

  if (
    line.includes("[ДОСТУП ЗАПРЕЩЁН]") ||
    line.includes("Внимание:") ||
    line.includes("Уязвимости") ||
    line.includes("Ошибка сегментации") ||
    line.includes("Переполнение стека")
  ) {
    return "text-red-400 font-bold"
  }

  if (
    line.includes("браузер=") ||
    line.includes("платформа=") ||
    line.includes("разрешение=") ||
    line.includes("глубина_цвета=") ||
    line.includes("часовой_пояс=") ||
    line.includes("сетевая_трассировка:") ||
    line.includes("отпечаток:") ||
    line.includes("@codeimpulse") ||
    line.includes("github.com/codeimpulse")
  ) {
    return "text-green-400"
  }

  if (
    line.includes("АНАЛИЗ_ЗАВЕРШЁН") ||
    line.includes("ЗАПИСЬ_СЕССИИ") ||
    line.includes("[ИНФО]") ||
    line.includes("Прогресс:") ||
    line.includes("успешно") ||
    line.includes("завершено") ||
    line.includes("предоставлен") ||
    line.includes("100%") ||
    line.includes("Удаление")
  ) {
    return "text-yellow-400"
  }

  return "text-muted-foreground"
}

export function TerminalOutput({
  terminalLines,
  isInteractive,
  isExitSequenceActive,
  userInput,
  showInputCursor,
  inputRef,
  onUserInputChange,
  onInputKeyDown,
  displayText,
  showCursor,
}: TerminalOutputProps) {
  return (
    <section className="flex flex-col justify-start items-center relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg shadow-2xl mb-8 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="ml-4 text-xs text-muted-foreground font-mono">терминал://codeimpulse.dev</span>
            </div>

            <div className="p-8 font-mono">
              <div className="text-left space-y-1">
                {terminalLines.map((line, index) => (
                  <p
                    key={index}
                    className={getLineClassName(line)}
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                ))}

                {isInteractive && !isExitSequenceActive && (
                  <div className="flex items-center mt-2">
                    <span className="text-green-400 font-bold">root@impulse:~#</span>
                    <div className="relative flex-1 ml-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => onUserInputChange(e.target.value)}
                        onKeyDown={onInputKeyDown}
                        className="bg-transparent border-none outline-none text-muted-foreground font-mono w-full"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Введите 'помощь' для списка команд..."
                      />
                      <span
                        className={`absolute left-0 top-0 ${showInputCursor ? "opacity-100 text-green-400 font-bold text-lg" : "opacity-0"} transition-opacity duration-100 pointer-events-none`}
                        style={{ left: userInput.length > 0 ? `${userInput.length * 0.6}em` : "0" }}
                      >
                        _
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
