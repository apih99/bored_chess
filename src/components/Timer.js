import { useState, useEffect } from 'react'

function Timer({ initialTime, increment = 0, isActive, onTimeUp, color }) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  
  useEffect(() => {
    let interval
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            onTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, onTimeUp])

  // Add time increment when turn ends
  useEffect(() => {
    if (!isActive && increment > 0) {
      setTimeLeft(prev => prev + increment)
    }
  }, [isActive, increment])

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`timer ${color} ${!isActive ? 'inactive' : ''}`}>
      <div className={timeLeft <= 30 ? 'time warning' : 'time'}>
        {formatTime(timeLeft)}
      </div>
      {increment > 0 && (
        <div className="increment">+{increment}s</div>
      )}
    </div>
  )
}

export default Timer 