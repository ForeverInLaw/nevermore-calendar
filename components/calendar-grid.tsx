"use client"

import type { Event } from "./calendar-app"
import { cn } from "@/lib/utils"
import { EventsPopover } from "./events-popover"

interface CalendarGridProps {
  currentDate: Date
  events: Event[]
  onCreateEvent: (date: Date) => void
  onEditEvent: (event: Event) => void
}

export function CalendarGrid({ currentDate, events, onCreateEvent, onEditEvent }: CalendarGridProps) {
  const today = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const mobileDays = ["S", "M", "T", "W", "T", "F", "S"]
  const calendarDays = []

  // Helper function to create a date without timezone issues
  const createLocalDate = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day, 12, 0, 0, 0) // Set to noon to avoid timezone issues
    return date
  }

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonth = currentDate.getMonth() - 1
    const prevYear = prevMonth < 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()
    const adjustedPrevMonth = prevMonth < 0 ? 11 : prevMonth
    const daysInPrevMonth = new Date(prevYear, adjustedPrevMonth + 1, 0).getDate()
    const day = daysInPrevMonth - (firstDayOfWeek - i - 1)

    const prevMonthDay = createLocalDate(prevYear, adjustedPrevMonth, day)
    calendarDays.push({ date: prevMonthDay, isCurrentMonth: false })
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = createLocalDate(currentDate.getFullYear(), currentDate.getMonth(), day)
    calendarDays.push({ date, isCurrentMonth: true })
  }

  // Add days from next month to fill the grid
  const remainingCells = 42 - calendarDays.length
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = currentDate.getMonth() + 1
    const nextYear = nextMonth > 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()
    const adjustedNextMonth = nextMonth > 11 ? 0 : nextMonth

    const nextMonthDay = createLocalDate(nextYear, adjustedNextMonth, day)
    calendarDays.push({ date: nextMonthDay, isCurrentMonth: false })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDateStr = event.date.toDateString()
      const targetDateStr = date.toDateString()
      return eventDateStr === targetDateStr
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const handleDateClick = (calendarDay: { date: Date; isCurrentMonth: boolean }) => {
    // Create a clean date object for the clicked day
    const clickedDate = createLocalDate(
      calendarDay.date.getFullYear(),
      calendarDay.date.getMonth(),
      calendarDay.date.getDate(),
    )

    // Debug information
    console.log("Clicked calendar day:", {
      displayedDay: calendarDay.date.getDate(),
      displayedMonth: calendarDay.date.getMonth(),
      displayedYear: calendarDay.date.getFullYear(),
      createdDate: clickedDate,
      createdDateString: clickedDate.toDateString(),
      isCurrentMonth: calendarDay.isCurrentMonth,
    })

    onCreateEvent(clickedDate)
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-in fade-in-0 duration-700 dark:md3-elevation-2 mx-2 md:mx-0">
      {/* Days of week header */}
      <div className="grid grid-cols-7 bg-muted/50">
        {days.map((day, index) => (
          <div
            key={day}
            className="p-2 md:p-4 text-center text-xs md:text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{mobileDays[index]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((calendarDay, index) => {
          const dayEvents = getEventsForDate(calendarDay.date)
          const visibleEvents = dayEvents.slice(0, 2)
          const remainingCount = dayEvents.length - visibleEvents.length

          return (
            <div
              key={`${calendarDay.date.getFullYear()}-${calendarDay.date.getMonth()}-${calendarDay.date.getDate()}`}
              className={cn(
                "min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-border last:border-r-0 cursor-pointer transition-all duration-200 hover:bg-muted/30 group active:scale-95",
                !calendarDay.isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isToday(calendarDay.date) && "bg-primary/10 border-primary/20",
              )}
              onClick={() => handleDateClick(calendarDay)}
            >
              <div
                className={cn(
                  "text-xs md:text-sm font-medium mb-1 md:mb-2 transition-colors duration-200",
                  isToday(calendarDay.date) && "text-primary font-bold",
                )}
                title={`${calendarDay.date.toDateString()} (Day: ${calendarDay.date.getDate()})`}
              >
                {calendarDay.date.getDate()}
              </div>

              <div className="space-y-0.5 md:space-y-1">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-[10px] md:text-xs p-0.5 md:p-1 rounded-md cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm",
                      "animate-in slide-in-from-left-2 duration-300",
                    )}
                    style={{ backgroundColor: event.color + "20", color: event.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditEvent(event)
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="opacity-75 hidden md:block">{event.startTime}</div>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <EventsPopover events={dayEvents} onEditEvent={onEditEvent} remainingCount={remainingCount} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
