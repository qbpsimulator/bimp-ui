import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Монгол хэлний орчуулга импортлоно
import translationMN from './locales/mn/translation.json';

const resources = {
  mn: {
    translation: translationMN
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'mn', // default хэл: монгол
    fallbackLng: 'mn',

    interpolation: {
      escapeValue: false // React аль хэдийнэ хамгаалдаг тул false
    }
  });

export default i18n;
