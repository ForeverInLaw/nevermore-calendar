"use client"

import { useState, useEffect } from "react"
import { CalendarHeader } from "./calendar-header"
import { CalendarGrid } from "./calendar-grid"
import { EventModal } from "./event-modal"
import { TelegramSettings } from "./telegram-settings"
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Settings, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface Event {
  id: string
  title: string
  description?: string
  date: Date
  startTime: string
  endTime: string
  reminder?: number // minutes before event
  color: string
  location?: string
}

export function CalendarApp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { toast } = useToast()

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem("calendar-events")
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        date: new Date(event.date),
      }))
      setEvents(parsedEvents)
    }
  }, [])

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem("calendar-events", JSON.stringify(events))
  }, [events])

  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date || new Date())
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (eventData: Omit<Event, "id">) => {
    if (selectedEvent) {
      // Edit existing event
      setEvents((prev) =>
        prev.map((event) => (event.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : event)),
      )
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated.",
      })
    } else {
      // Create new event
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString(),
      }
      setEvents((prev) => [...prev, newEvent])
      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      })
    }
    setIsModalOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId))
    setIsModalOpen(false)
    toast({
      title: "Event deleted",
      description: "Your event has been successfully deleted.",
    })
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300 safe-area-inset">
        <div className="container mx-auto p-2 md:p-4 max-w-7xl">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <CalendarHeader
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onCreateEvent={() => handleCreateEvent()}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="ml-4 hover:scale-105 transition-transform duration-200"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <CalendarGrid
            currentDate={currentDate}
            events={events}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
          />

          <EventModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            event={selectedEvent}
            selectedDate={selectedDate}
          />

          {/* Settings Modal */}
          {isSettingsOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <TelegramSettings />
                </div>
              </div>
            </div>
          )}
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
