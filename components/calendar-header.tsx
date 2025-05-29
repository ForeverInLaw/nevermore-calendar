"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  onCreateEvent: () => void
}

export function CalendarHeader({ currentDate, onDateChange, onCreateEvent }: CalendarHeaderProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right")

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

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
    <div className="flex items-center justify-between mb-4 md:mb-8 animate-in fade-in-0 duration-500 px-2 md:px-0">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative overflow-hidden">
          <h1
            className={`text-xl md:text-3xl font-bold text-foreground transition-transform duration-300 ease-out ${
              isAnimating
                ? animationDirection === "right"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("prev")}
            disabled={isAnimating}
            className="h-8 w-8 md:h-9 md:w-9 hover:scale-105 transition-transform duration-200"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("next")}
            disabled={isAnimating}
            className="h-8 w-8 md:h-9 md:w-9 hover:scale-105 transition-transform duration-200"
          >
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={goToToday}
          disabled={isAnimating}
          className="text-xs md:text-sm px-2 md:px-4 hover:scale-105 transition-transform duration-200"
        >
          Today
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          className="bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg text-xs md:text-sm px-2 md:px-4"
          onClick={onCreateEvent}
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">New Event</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </div>
  )
}
