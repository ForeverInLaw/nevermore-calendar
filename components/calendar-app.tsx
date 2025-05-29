"use client"

import { useState, useEffect } from "react"
import { ResponsiveCalendarGrid } from "./responsive-calendar-grid"
import { EventModal } from "./event-modal"
import { TelegramSettings } from "./telegram-settings"
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthProvider, useAuth } from "./auth-provider"
import { AuthModal } from "./auth-modal"
import { EventsService } from "@/lib/events-service"
import { MobileHeader } from "./mobile-header"
import { DesktopHeader } from "./desktop-header"
import { MobileCalendarNavigation } from "./mobile-calendar-navigation"

export interface Event {
  id: string
  title: string
  description?: string
  date: Date
  startTime: string
  endTime: string
  reminder?: number
  color: string
  location?: string
}

export function CalendarApp() {
  return (
    <AuthProvider>
      <CalendarAppContent />
    </AuthProvider>
  )
}

function CalendarAppContent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, loading: authLoading, signOut } = useAuth()
  const { toast } = useToast()

  // Load events from database when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadEvents()
    } else if (!authLoading) {
      setIsLoading(false)
      setEvents([])
    }
  }, [user, authLoading])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const userEvents = await EventsService.getEvents()
      setEvents(userEvents)
    } catch (error) {
      console.error("Error loading events:", error)
      toast({
        title: "Error loading events",
        description: "Failed to load your events from the database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = (date?: Date) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    setSelectedDate(date || new Date())
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    setSelectedEvent(event)
    setSelectedDate(null)
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (eventData: Omit<Event, "id">) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      if (selectedEvent) {
        const updatedEvent = await EventsService.updateEvent(selectedEvent.id, eventData)
        setEvents((prev) => prev.map((event) => (event.id === selectedEvent.id ? updatedEvent : event)))
        toast({
          title: "Event updated",
          description: "Your event has been successfully updated.",
        })
      } else {
        const newEvent = await EventsService.createEvent(eventData)
        setEvents((prev) => [...prev, newEvent])
        toast({
          title: "Event created",
          description: "Your event has been successfully created.",
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving event:", error)
      toast({
        title: "Error saving event",
        description: "Failed to save your event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      await EventsService.deleteEvent(eventId)
      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setIsModalOpen(false)
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error deleting event",
        description: "Failed to delete your event. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        {/* Mobile Header */}
        <MobileHeader
          onCreateEvent={() => handleCreateEvent()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Desktop Header */}
        <DesktopHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onCreateEvent={() => handleCreateEvent()}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Mobile Calendar Navigation */}
        <MobileCalendarNavigation currentDate={currentDate} onDateChange={setCurrentDate} />

        {/* Main Content */}
        <div className="px-2 pb-4 md:px-4 md:pb-6">
          {/* Sign in prompt for non-authenticated users */}
          {!user && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border mx-2 md:mx-0">
              <p className="text-center text-sm text-muted-foreground">
                <Button variant="link" onClick={() => setIsAuthModalOpen(true)} className="p-0 h-auto text-sm">
                  Sign in
                </Button>{" "}
                to save your events and sync across devices
              </p>
            </div>
          )}

          {/* Calendar Grid */}
          <ResponsiveCalendarGrid
            currentDate={currentDate}
            events={events}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
          />
        </div>

        {/* Modals */}
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={selectedEvent}
          selectedDate={selectedDate}
        />

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
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
    </ThemeProvider>
  )
}
