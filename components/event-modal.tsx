"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Bell, Trash2, Save, MessageCircle } from "lucide-react"
import type { Event } from "./calendar-app"
import { sendEventNotification, sendEventCreationConfirmation } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<Event, "id">) => void
  onDelete: (eventId: string) => void
  event?: Event | null
  selectedDate?: Date | null
}

const eventColors = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
]

const reminderOptions = [
  { value: 0, label: "At time of event" },
  { value: 5, label: "5 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
]

export function EventModal({ isOpen, onClose, onSave, onDelete, event, selectedDate }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    reminder: 15,
    color: eventColors[0],
    sendNotifications: true,
  })
  const [telegramSettings, setTelegramSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Загружаем настройки Telegram
    const savedTelegramSettings = localStorage.getItem("telegram-settings")
    if (savedTelegramSettings) {
      setTelegramSettings(JSON.parse(savedTelegramSettings))
    }

    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        date: event.date.toISOString().split("T")[0],
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || "",
        reminder: event.reminder || 15,
        color: event.color,
        sendNotifications: true,
      })
    } else if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date: selectedDate.toISOString().split("T")[0],
        title: "",
        description: "",
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        reminder: 15,
        color: eventColors[0],
        sendNotifications: true,
      }))
    }
  }, [event, selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        reminder: formData.reminder,
        color: formData.color,
      }

      onSave(eventData)

      // Отправляем Telegram уведомления если включены
      if (formData.sendNotifications && telegramSettings?.chatId && telegramSettings?.enableCreationConfirmations) {
        try {
          // Отправляем подтверждение создания события
          await sendEventCreationConfirmation({
            title: formData.title,
            date: formData.date,
            startTime: formData.startTime,
            reminderMinutes: formData.reminder,
            chatId: telegramSettings.chatId,
            description: formData.description,
            location: formData.location,
          })

          // Планируем напоминание если установлено
          if (formData.reminder > 0 && telegramSettings?.enableReminders) {
            await sendEventNotification({
              title: formData.title,
              date: formData.date,
              startTime: formData.startTime,
              reminderMinutes: formData.reminder,
              chatId: telegramSettings.chatId,
              description: formData.description,
              location: formData.location,
            })
          }

          toast({
            title: event ? "Event updated" : "Event created",
            description: "Telegram notifications have been sent successfully.",
          })
        } catch (error) {
          console.error("Failed to send Telegram notifications:", error)
          toast({
            title: event ? "Event updated" : "Event created",
            description: "Event saved but Telegram notifications could not be sent.",
            variant: "destructive",
          })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    if (event) {
      onDelete(event.id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300 dark:md3-elevation-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            {event ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">
              Event Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
              className="transition-all duration-200 focus:scale-[1.02] text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter event description (optional)"
              className="transition-all duration-200 focus:scale-[1.02] text-base resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
                className="transition-all duration-200 focus:scale-[1.02] text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Add location"
                  className="pl-10 transition-all duration-200 focus:scale-[1.02] text-base"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm">
                Start Time
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                  required
                  className="pl-10 transition-all duration-200 focus:scale-[1.02] text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm">
                End Time
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                  required
                  className="pl-10 transition-all duration-200 focus:scale-[1.02] text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Reminder</Label>
            <Select
              value={formData.reminder.toString()}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, reminder: Number.parseInt(value) }))}
            >
              <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                <Bell className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reminderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendNotifications"
              checked={formData.sendNotifications}
              onChange={(e) => setFormData((prev) => ({ ...prev, sendNotifications: e.target.checked }))}
              className="rounded border-border"
            />
            <Label htmlFor="sendNotifications" className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Send Telegram notifications
            </Label>
          </div>

          {telegramSettings?.chatId && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              📱 Notifications will be sent to Telegram Chat ID: {telegramSettings.chatId}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {eventColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
                    formData.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row md:justify-between pt-4 gap-3">
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="hover:scale-105 active:scale-95 transition-transform duration-200 w-full md:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-2 w-full md:w-auto md:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="hover:scale-105 active:scale-95 transition-transform duration-200 flex-1 md:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="hover:scale-105 active:scale-95 transition-transform duration-200 flex-1 md:flex-none"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
