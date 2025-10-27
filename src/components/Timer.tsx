import React from 'react'

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = React.useState<number>(initialSeconds)
  const [running, setRunning] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds(s => Math.max(0, s-1)), 1000)
    return () => clearInterval(id)
  }, [running])

  const reset = () => setSeconds(initialSeconds)
  const toggle = () => setRunning(r => !r)

  return { seconds, running, toggle, reset, setSeconds }
}

export function Timer({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds/60)).padStart(2,'0')
  const ss = String(seconds%60).padStart(2,'0')
  return <span className={seconds<=60 ? 'text-red-400 font-semibold' : ''}>{mm}:{ss}</span>
}
