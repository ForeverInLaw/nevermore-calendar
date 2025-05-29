"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Clock, MapPin } from "lucide-react"
import type { Event } from "./calendar-app"

interface EventsPopoverProps {
  events: Event[]
  onEditEvent: (event: Event) => void
  remainingCount: number
}

export function EventsPopover({ events, onEditEvent, remainingCount }: EventsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="text-xs text-muted-foreground hover:text-foreground p-1 h-auto font-normal hover:bg-muted/50 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          +{remainingCount} more
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 animate-in fade-in-0 zoom-in-95 duration-200" align="start" side="bottom">
        <div className="p-3 border-b border-border">
          <h4 className="font-medium text-sm">All Events</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="p-3 hover:bg-muted/50 cursor-pointer transition-colors duration-200 border-b border-border last:border-b-0"
              onClick={() => {
                onEditEvent(event)
                setIsOpen(false)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: event.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{event.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
