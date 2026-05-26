interface TerminalBSODProps {
  countdown: number
  showRestartButton: boolean
  onRestart: () => void
}

export function TerminalBSOD({ countdown, showRestartButton, onRestart }: TerminalBSODProps) {
  return (
    <div className="fixed inset-0 bg-blue-600 text-white font-mono flex flex-col justify-center items-start z-50 overflow-auto">
      <div className="w-full p-4 md:p-8 space-y-2 md:space-y-4">
        <div className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">:(</div>

        <div className="text-base md:text-xl mb-1 md:mb-2">
          Активация импульса вызвала сбой и требуется перезагрузка.
        </div>
        <div className="text-sm md:text-lg mb-2 md:mb-4">
          Мы собираем информацию об ошибке, после чего система перезагрузится.
        </div>

        <div className="text-xs md:text-sm space-y-1 md:space-y-2 max-w-full">
          <div className="text-white space-y-1">
            <div>Паника ядра - синхронизация невозможна: Критическое исключение</div>
            <div className="hidden md:block">CPU: 0 PID: 1 Comm: swapper/0 Без патчей 6.1.0-impulse #1</div>
            <div className="hidden md:block">Оборудование: IMPULSE Терминал/IMPULSE, BIOS v2.0 01/01/2025</div>
          </div>

          <div className="text-blue-200 space-y-1 mt-2 md:mt-4 hidden md:block">
            <div>Стек вызовов:</div>
            <div className="ml-4 space-y-1">
              <div>? __die+0x20/0x70</div>
              <div>? die+0x33/0x40</div>
              <div>? impulse_terminal_init+0x42/0x80</div>
              <div>? exc_invalid_state+0x4c/0x60</div>
              <div>? impulse_terminal_init+0x42/0x80</div>
              <div>? kernel_init+0x1a/0x130</div>
            </div>
          </div>

          <div className="text-blue-300 space-y-1 mt-2 md:mt-4 hidden md:block">
            <div>RIP: 0010:impulse_terminal_init+0x42/0x80</div>
            <div>Code: 48 89 df e8 0b fe ff ff 85 c0 78 73 48 c7 c7 a0 e4 82 82 e8 0f 0b 48</div>
            <div>RSP: 0000:ffffc90000013e28 EFLAGS: 00010246</div>
            <div>RBP: ffffc90000013e40 DATA: 0000000000000000 R09: c0000000ffffdfff</div>
          </div>

          <div className="text-blue-400 space-y-1 mt-2 md:mt-4 hidden md:block">
            <div>Подключённые модули: impulse_core impulse_terminal matrix_rain</div>
            <div>---[ конец паники ядра - синхронизация невозможна: Критическое исключение ]---</div>
          </div>

          <div className="mt-4 md:mt-6 space-y-2">
            <p className="text-sm md:text-base">Если вы обратитесь в поддержку, сообщите эту информацию:</p>
            <p className="bg-blue-700 p-2 rounded text-xs md:text-sm">Код остановки: CRITICAL_PROCESS_DIED</p>
            <p className="bg-blue-700 p-2 rounded text-xs md:text-sm">Источник сбоя: impulse.sys</p>

            <div className="mt-4 p-3 bg-blue-800 rounded border border-blue-500 mb-20 md:mb-8">
              <div className="text-yellow-300 font-bold text-sm md:text-base">Восстановление из резервных копий...</div>
              {!showRestartButton ? (
                <>
                  <div className="text-green-400 mt-1 text-sm md:text-base">
                    Перезагрузка через: {countdown} сек.
                  </div>
                  <div className="w-full bg-blue-900 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, ((7 - countdown) / 7) * 100)}%` }}
                    ></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-green-400 mt-1 text-sm md:text-base">Восстановление завершено!</div>
                  <div className="w-full bg-blue-900 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-green-400 h-2 rounded-full w-full"></div>
                  </div>
                  <button
                    onClick={onRestart}
                    className="mt-4 px-4 md:px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors duration-200 border-2 border-green-400 text-sm md:text-base"
                  >
                    Войти в терминал
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-2 left-2 md:bottom-4 md:left-8 text-xs text-gray-300 space-y-1 max-w-[calc(100vw-1rem)] md:max-w-none">
        <div className="text-green-400">Нажмите Ctrl+Alt+Del для перезагрузки (шутка)</div>
        <div className="text-cyan-400">Или попробуйте выключить и включить снова...</div>
      </div>
    </div>
  )
}
