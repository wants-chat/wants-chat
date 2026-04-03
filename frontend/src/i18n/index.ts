import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ptBR from './locales/pt-BR.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import ru from './locales/ru.json';
import it from './locales/it.json';
import hi from './locales/hi.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import vi from './locales/vi.json';
import nl from './locales/nl.json';
import uk from './locales/uk.json';

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', dir: 'ltr' },
];

const resources = {
  en: { translation: en },
  ja: { translation: ja },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  'pt-BR': { translation: ptBR },
  zh: { translation: zh },
  ko: { translation: ko },
  ar: { translation: ar },
  ru: { translation: ru },
  it: { translation: it },
  hi: { translation: hi },
  tr: { translation: tr },
  id: { translation: id },
  vi: { translation: vi },
  nl: { translation: nl },
  uk: { translation: uk },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
