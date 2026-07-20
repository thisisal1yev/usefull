export type UiLang = 'uz' | 'en'

export type MessageKey =
  | 'welcome'
  | 'ask_level'
  | 'ask_goal'
  | 'ask_availability'
  | 'done'
  | 'invalid_choice'

const messages: Record<UiLang, Record<MessageKey, string>> = {
  uz: {
    welcome: "Assalomu alaykum! usfull botiga xush kelibsiz.\nTilni tanlang / Choose your language:",
    ask_level: 'Ingliz tili darajangiz qanday?',
    ask_goal: 'Maqsadingiz nima?',
    ask_availability: 'Qachon mashq qilishga vaqtingiz bor?',
    done: "Profil tayyor! Endi suhbat sherigini topishingiz mumkin. Tez orada: savollar banki va o'qituvchilar.",
    invalid_choice: 'Iltimos, tugmalardan birini tanlang.',
  },
  en: {
    welcome: 'Welcome to usfull!\nTilni tanlang / Choose your language:',
    ask_level: 'What is your English level?',
    ask_goal: 'What is your goal?',
    ask_availability: 'When are you available to practice?',
    done: 'Profile complete! You can now find a speaking partner. Coming soon: question bank and teachers.',
    invalid_choice: 'Please choose one of the buttons.',
  },
}

export function t(lang: UiLang, key: MessageKey): string {
  return messages[lang][key]
}
