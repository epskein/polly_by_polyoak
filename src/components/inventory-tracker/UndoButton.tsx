"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button/Button"

type UndoButtonProps = {
  onUndo: () => void
}

export default function UndoButton({ onUndo }: UndoButtonProps) {
  const [timeLeft, setTimeLeft] = useState(10)

  useEffect(() => {
    // Reset timer to 10 seconds when component mounts or key changes
    setTimeLeft(10)

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [])

  if (timeLeft === 0) return null

  return (
    <Button onClick={onUndo} className="mb-4">
      Undo ({timeLeft}s)
    </Button>
  )
}

