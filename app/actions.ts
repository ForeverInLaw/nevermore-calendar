"use server"

interface EventNotificationData {
  title: string
  date: string
  startTime: string
  reminderMinutes: number
  chatId?: string
  description?: string
  location?: string
}

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(chatId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured")
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send Telegram message: ${error}`)
  }

  return response.json()
}

// Функция для отправки уведомления о событии
export async function sendEventNotification(eventData: EventNotificationData) {
  try {
    if (!eventData.chatId) {
      console.log("No Telegram chat ID provided, skipping notification")
      return { success: false, message: "No chat ID provided" }
    }

    const eventDateTime = new Date(`${eventData.date}T${eventData.startTime}`)
    const reminderTime = new Date(eventDateTime.getTime() - eventData.reminderMinutes * 60 * 1000)

    const message = `
🔔 <b>Event Reminder</b>

📅 <b>${eventData.title}</b>

🗓 <b>Date:</b> ${new Date(eventData.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
⏰ <b>Time:</b> ${eventData.startTime}
${eventData.location ? `📍 <b>Location:</b> ${eventData.location}` : ""}
${eventData.description ? `📝 <b>Description:</b> ${eventData.description}` : ""}

⏱ <i>Reminder sent ${eventData.reminderMinutes} minutes before the event</i>
    `.trim()

    await sendTelegramMessage(eventData.chatId, message)

    console.log("Telegram notification sent successfully:", {
      eventTitle: eventData.title,
      eventTime: eventDateTime.toISOString(),
      reminderTime: reminderTime.toISOString(),
      chatId: eventData.chatId,
    })

    return { success: true, message: "Telegram notification sent successfully" }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error)
    throw new Error("Failed to send Telegram notification")
  }
}

// Функция для отправки подтверждения создания события
export async function sendEventCreationConfirmation(eventData: EventNotificationData) {
  try {
    if (!eventData.chatId) {
      console.log("No Telegram chat ID provided, skipping confirmation")
      return { success: false, message: "No chat ID provided" }
    }

    const message = `
✅ <b>Event Created Successfully!</b>

📅 <b>${eventData.title}</b>

🗓 <b>Date:</b> ${new Date(eventData.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
⏰ <b>Time:</b> ${eventData.startTime}
${eventData.location ? `📍 <b>Location:</b> ${eventData.location}` : ""}
${eventData.description ? `📝 <b>Description:</b> ${eventData.description}` : ""}

${eventData.reminderMinutes > 0 ? `🔔 <i>You will receive a reminder ${eventData.reminderMinutes} minutes before the event</i>` : ""}
    `.trim()

    await sendTelegramMessage(eventData.chatId, message)

    console.log("Telegram confirmation sent successfully:", eventData.title)

    return { success: true, message: "Telegram confirmation sent" }
  } catch (error) {
    console.error("Failed to send Telegram confirmation:", error)
    throw new Error("Failed to send Telegram confirmation")
  }
}

// Функция для получения информации о боте
export async function getBotInfo() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured")
    }

    const url = `https://api.telegram.org/bot${botToken}/getMe`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Failed to get bot info")
    }

    const data = await response.json()
    return { success: true, bot: data.result }
  } catch (error) {
    console.error("Failed to get bot info:", error)
    return { success: false, error: error.message }
  }
}

// Функция для проверки cron job напоминаний
export async function scheduleEventReminders() {
  try {
    console.log("Checking for events that need Telegram reminders...")

    // В реальном приложении здесь была бы проверка базы данных
    // на события, которым нужно отправить напоминания через Telegram

    return { success: true }
  } catch (error) {
    console.error("Failed to schedule Telegram reminders:", error)
    throw new Error("Failed to schedule Telegram reminders")
  }
}
