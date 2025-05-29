"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MobileCalendarNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function MobileCalendarNavigation({ currentDate, onDateChange }: MobileCalendarNavigationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right")

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const navigateMonth = (direction: "prev" | "next") => {
    if (isAnimating) return

    setIsAnimating(true)
    setAnimationDirection(direction === "prev" ? "left" : "right")

    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }

    setTimeout(() => {
      onDateChange(newDate)
      setTimeout(() => setIsAnimating(false), 50)
    }, 150)
  }

  const goToToday = () => {
    if (isAnimating) return
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center justify-between p-3 bg-background border-b border-border md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigateMonth("prev")}
        disabled={isAnimating}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <div className="relative overflow-hidden">
          <h2
            className={`text-lg font-semibold transition-transform duration-300 ease-out ${
              isAnimating
                ? animationDirection === "right"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={goToToday} disabled={isAnimating} className="text-xs px-2 h-6">
          Today
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigateMonth("next")}
        disabled={isAnimating}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
