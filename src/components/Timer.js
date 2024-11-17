import { useState, useEffect } from 'react'

function Timer({ initialTime, isActive, onTimeUp, color }) {
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

  // Reset timer when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  return (
    <div className={`timer ${color} ${!isActive ? 'inactive' : ''}`}>
      <div className={timeLeft <= 30 ? 'time warning' : 'time'}>
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
    </div>
  )
}

export default Timer 