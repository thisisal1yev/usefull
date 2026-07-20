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
