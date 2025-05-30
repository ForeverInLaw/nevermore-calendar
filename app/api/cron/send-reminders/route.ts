import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET() {
  try {
    console.log("🔄 Cron job started: checking for events needing reminders...")

    const now = new Date()
    console.log(`Current time: ${now.toISOString()}`)

    // Получаем события, которым нужно отправить напоминание
    const { data: events, error } = await supabaseServer
      .from("events")
      .select(`
        *,
        users!inner(telegram_chat_id, reminder_notifications_enabled)
      `)
      .eq("reminder_sent", false)
      .eq("users.reminder_notifications_enabled", true)
      .not("users.telegram_chat_id", "is", null)
      .gte("event_date", now.toISOString().split("T")[0])

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    console.log(`Found ${events?.length || 0} events in database`)

    // Фильтруем события по времени напоминания
    const eventsToRemind = (events || []).filter((event) => {
      const eventDateTime = new Date(`${event.event_date}T${event.start_time}`)
      const reminderTime = new Date(eventDateTime.getTime() - event.reminder_minutes * 60 * 1000)

      console.log(`Event: ${event.title}`)
      console.log(`Event time: ${eventDateTime.toISOString()}`)
      console.log(`Reminder time: ${reminderTime.toISOString()}`)
      console.log(`Should remind: ${reminderTime <= now && now < eventDateTime}`)

      return reminderTime <= now && now < eventDateTime
    })

    console.log(`📋 Found ${eventsToRemind.length} events needing reminders`)

    if (eventsToRemind.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No events need reminders at this time",
        count: 0,
        currentTime: now.toISOString(),
      })
    }

    let successCount = 0
    let errorCount = 0

    // Отправляем напоминания
    for (const event of eventsToRemind) {
      try {
        const telegramChatId = event.users.telegram_chat_id

        if (!telegramChatId) {
          console.log(`⚠️ Skipping event ${event.id}: no Telegram chat ID`)
          continue
        }

        // Отправляем напоминание в Telegram
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: `🔔 Event Reminder\n\n📅 ${event.title}\n\n🗓 Date: ${new Date(event.event_date).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}\n⏰ Time: ${event.start_time}\n\n⏱ Reminder sent ${event.reminder_minutes} minutes before the event${event.description ? `\n\n📝 ${event.description}` : ""}${event.location ? `\n📍 ${event.location}` : ""}`,
              parse_mode: "HTML",
            }),
          },
        )

        if (telegramResponse.ok) {
          // Помечаем напоминание как отправленное
          const { error: updateError } = await supabaseServer
            .from("events")
            .update({ reminder_sent: true })
            .eq("id", event.id)

          if (!updateError) {
            console.log(`✅ Reminder sent for event: ${event.title}`)
            successCount++
          } else {
            console.log(`⚠️ Reminder sent but failed to mark as sent: ${event.title}`)
            errorCount++
          }
        } else {
          const errorText = await telegramResponse.text()
          console.error(`❌ Failed to send Telegram reminder for event ${event.id}:`, errorText)
          errorCount++
        }
      } catch (error) {
        console.error(`❌ Error processing event ${event.id}:`, error)
        errorCount++
      }
    }

    console.log(`✅ Cron job completed: ${successCount} reminders sent, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: `Processed ${eventsToRemind.length} events`,
      successCount,
      errorCount,
      currentTime: now.toISOString(),
      events: eventsToRemind.map((e) => ({ id: e.id, title: e.title })),
    })
  } catch (error) {
    console.error("❌ Cron job error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
