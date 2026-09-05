import { useEffect, useCallback } from 'react'

export function useKeyboardShortcuts(shortcuts = {}) {
  const handleKeyDown = useCallback((event) => {
    const target = event.target
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
    
    if (isInput && event.key !== 'Escape') {
      return
    }

    const key = event.key.toLowerCase()
    const ctrl = event.ctrlKey || event.metaKey
    const shift = event.shiftKey
    const alt = event.altKey

    const combo = [
      ctrl && 'ctrl',
      shift && 'shift',
      alt && 'alt',
      key,
    ].filter(Boolean).join('+')

    if (shortcuts[combo]) {
      event.preventDefault()
      shortcuts[combo]()
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const DEFAULT_SHORTCUTS = {
  'd': 'setPeriodDaily',
  'm': 'setPeriodMonthly',
  'a': 'setPeriodAnnual',
  'n': 'newSeller',
  'escape': 'closeModal',
  'ctrl+s': 'save',
  'ctrl+enter': 'submit',
  '?': 'showHelp',
}