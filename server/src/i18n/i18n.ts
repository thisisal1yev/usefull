export type UiLang = 'uz' | 'en'

export type MessageKey =
  | 'welcome'
  | 'ask_level'
  | 'ask_goal'
  | 'ask_availability'
  | 'done'
  | 'invalid_choice'
  | 'open_app'
  | 'match_request_received'
  | 'match_accepted'
  | 'teacher_ask_bio'
  | 'teacher_ask_experience'
  | 'teacher_ask_certificates'
  | 'teacher_bio_too_short'
  | 'teacher_submitted'
  | 'teacher_already_pending'
  | 'teacher_already_approved'
  | 'teacher_approved'
  | 'teacher_rejected'
  | 'admin_new_teacher'
  | 'booking_confirmed'
  | 'booking_new_for_teacher'
  | 'booking_cancelled'
  | 'reminder'
  | 'upgrade_intro'
  | 'payment_success_premium'
  | 'payment_success_gold'
  | 'plan_expired'
  | 'admin_new_gold'
  | 'coach_assigned_learner'
  | 'coach_assigned_coach'

const messages: Record<UiLang, Record<MessageKey, string>> = {
  uz: {
    welcome: "Assalomu alaykum! usfull botiga xush kelibsiz.\nTilni tanlang / Choose your language:",
    ask_level: 'Ingliz tili darajangiz qanday?',
    ask_goal: 'Maqsadingiz nima?',
    ask_availability: 'Qachon mashq qilishga vaqtingiz bor?',
    done: "Profil tayyor! Endi suhbat sherigini topishingiz mumkin. Tez orada: savollar banki va o'qituvchilar.",
    invalid_choice: 'Iltimos, tugmalardan birini tanlang.',
    open_app: 'Ilovani ochish 📲',
    match_request_received: "🤝 {name} siz bilan speaking mashq qilmoqchi! Ilovada so'rovni ko'ring.",
    match_accepted: "🎉 {name} so'rovingizni qabul qildi! Yozing: {contact}",
    teacher_ask_bio: "O'qituvchi sifatida o'zingiz haqingizda yozing (kamida 10 belgi):",
    teacher_ask_experience: "Tajribangiz (yillar, natijalar)? O'tkazish uchun «-» yuboring.",
    teacher_ask_certificates: "Sertifikat havolasi (IELTS, CELTA...)? O'tkazish uchun «-» yuboring.",
    teacher_bio_too_short: "Juda qisqa. Kamida 10 belgi yozing.",
    teacher_submitted: "Arizangiz yuborildi! Admin ko'rib chiqqach xabar beramiz. ✅",
    teacher_already_pending: "Arizangiz ko'rib chiqilmoqda. ⏳",
    teacher_already_approved: "Siz allaqachon tasdiqlangan o'qituvchisiz! 🎉",
    teacher_approved: "Tabriklaymiz! O'qituvchi arizangiz tasdiqlandi. Endi ilovada dars slotlarini qo'shishingiz mumkin. 🎉",
    teacher_rejected: "Afsuski, o'qituvchi arizangiz rad etildi.",
    admin_new_teacher: "🆕 Yangi o'qituvchi arizasi: {name}. Admin panelda ko'ring.",
    booking_confirmed: "✅ Dars band qilindi: {name} bilan {time} da. Video-qo'ng'iroq Telegramda bo'ladi.",
    booking_new_for_teacher: "📚 Yangi dars: {name} {time} da darsingizni band qildi.",
    booking_cancelled: "❌ {time} dagi dars bekor qilindi ({name}).",
    reminder: "⏰ Eslatma: {time} da {name} bilan darsingiz bor.",
    upgrade_intro: "Tarifni tanlang:\n⭐ Premium — haftasiga 3 ta bepul dars\n👑 Gold — Premium + shaxsiy murabbiy",
    payment_success_premium: "✅ Premium faollashtirildi! Amal qilish muddati: {until}. Endi haftasiga 3 ta dars band qilishingiz mumkin.",
    payment_success_gold: "👑 Gold faollashtirildi! Amal qilish muddati: {until}. Tez orada admin sizga shaxsiy murabbiy biriktiradi.",
    plan_expired: "Tarifingiz muddati tugadi — Free tarifga qaytdingiz. Yangilash: /premium",
    admin_new_gold: "👑 Yangi Gold obunachi: {name}. Murabbiy biriktiring (Admin panel).",
    coach_assigned_learner: "👑 Sizga shaxsiy murabbiy biriktirildi: {name}. Yozing: {contact}",
    coach_assigned_coach: "Sizga yangi o'quvchi biriktirildi: {name}. Yozing: {contact}",
  },
  en: {
    welcome: 'Welcome to usfull!\nTilni tanlang / Choose your language:',
    ask_level: 'What is your English level?',
    ask_goal: 'What is your goal?',
    ask_availability: 'When are you available to practice?',
    done: 'Profile complete! You can now find a speaking partner. Coming soon: question bank and teachers.',
    invalid_choice: 'Please choose one of the buttons.',
    open_app: 'Open the app 📲',
    match_request_received: '🤝 {name} wants to practice speaking with you! Check the request in the app.',
    match_accepted: '🎉 {name} accepted your request! Say hi: {contact}',
    teacher_ask_bio: 'Tell us about yourself as a teacher (at least 10 characters):',
    teacher_ask_experience: 'Your experience (years, results)? Send "-" to skip.',
    teacher_ask_certificates: 'Certificate link (IELTS, CELTA...)? Send "-" to skip.',
    teacher_bio_too_short: 'Too short. Please write at least 10 characters.',
    teacher_submitted: 'Application submitted! We will notify you after admin review. ✅',
    teacher_already_pending: 'Your application is under review. ⏳',
    teacher_already_approved: 'You are already an approved teacher! 🎉',
    teacher_approved: 'Congratulations! Your teacher application is approved. You can now add lesson slots in the app. 🎉',
    teacher_rejected: 'Unfortunately, your teacher application was rejected.',
    admin_new_teacher: '🆕 New teacher application: {name}. Review it in the admin panel.',
    booking_confirmed: '✅ Lesson booked: with {name} at {time}. The video call happens in Telegram.',
    booking_new_for_teacher: '📚 New lesson: {name} booked your slot at {time}.',
    booking_cancelled: '❌ The lesson at {time} was cancelled ({name}).',
    reminder: '⏰ Reminder: you have a lesson with {name} at {time}.',
    upgrade_intro: "Choose your plan:\n⭐ Premium — 3 free lessons per week\n👑 Gold — Premium + a personal coach",
    payment_success_premium: "✅ Premium activated! Valid until {until}. You can now book 3 lessons per week.",
    payment_success_gold: "👑 Gold activated! Valid until {until}. An admin will assign your personal coach soon.",
    plan_expired: "Your plan has expired — you are back on Free. Renew: /premium",
    admin_new_gold: "👑 New Gold subscriber: {name}. Assign a coach (Admin panel).",
    coach_assigned_learner: "👑 Your personal coach is assigned: {name}. Say hi: {contact}",
    coach_assigned_coach: "A new student is assigned to you: {name}. Say hi: {contact}",
  },
}

export function t(lang: UiLang, key: MessageKey): string {
  return messages[lang][key]
}

export function tf(lang: UiLang, key: MessageKey, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (text, [k, v]) => text.replaceAll(`{${k}}`, v),
    t(lang, key),
  )
}
