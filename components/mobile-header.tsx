"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Plus, Settings, LogOut, User } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "./auth-provider"

interface MobileHeaderProps {
  onCreateEvent: () => void
  onOpenSettings: () => void
  onOpenAuth: () => void
}

export function MobileHeader({ onCreateEvent, onOpenSettings, onOpenAuth }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 bg-background border-b border-border md:hidden">
      {/* Left side - Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Calendar Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-6">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="justify-start gap-3"
                  onClick={() => {
                    onCreateEvent()
                    setIsMenuOpen(false)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3"
                  onClick={() => {
                    onOpenSettings()
                    setIsMenuOpen(false)
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>

                <Button variant="outline" className="justify-start gap-3" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="justify-start gap-3"
                  onClick={() => {
                    onOpenAuth()
                    setIsMenuOpen(false)
                  }}
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3"
                  onClick={() => {
                    onCreateEvent()
                    setIsMenuOpen(false)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>
              </>
            )}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Center - App Title */}
      <h1 className="text-lg font-bold text-foreground">Calendar</h1>

      {/* Right side - Quick Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onCreateEvent} className="h-9 w-9">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
