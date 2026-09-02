import { useState, useEffect, useRef } from 'react'

export function OvertakeAlert({ alerts = [] }) {
  const [visibleAlerts, setVisibleAlerts] = useState([])
  const processedIds = useRef(new Set())

  useEffect(() => {
    alerts.forEach((alert) => {
      if (!processedIds.current.has(alert.id)) {
        processedIds.current.add(alert.id)
        setVisibleAlerts((prev) => [...prev, { ...alert, exiting: false }])

        setTimeout(() => {
          setVisibleAlerts((prev) =>
            prev.map((a) => (a.id === alert.id ? { ...a, exiting: true } : a))
          )
          setTimeout(() => {
            setVisibleAlerts((prev) => prev.filter((a) => a.id !== alert.id))
            processedIds.current.delete(alert.id)
          }, 500)
        }, 7000)
      }
    })
  }, [alerts])

  const displayed = visibleAlerts.slice(-3)

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      {displayed.map((alert) => (
        <div
          key={alert.id}
          className={`
            bg-slate-900/95 backdrop-blur-sm rounded-xl border border-[#E8A33D]/50
            px-4 py-3 shadow-[0_0_20px_rgba(232,163,61,0.3)] max-w-sm
            transition-all duration-500 ease-out
            ${alert.exiting ? 'opacity-0 translate-x-24' : 'opacity-100 translate-x-0'}
          `}
        >
          <p className="text-white font-medium text-sm">{alert.text}</p>
        </div>
      ))}
    </div>
  )
}
