import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(undefined);

export const translations = {
     // frequently used words
     add: {
          uz: "Qo'shish",
          cy: "Қўшиш",
          en: "Add",
          ru: "Добавить"
     },
     delate: {
          uz: "O‘chirish",
          cy: "Ўчириш",
          en: "Delete",
          ru: "Удалить"
     },
     clear: {
          uz: "Tozalash",
          cy: "Тозалаш",
          en: "Cleaning",
          ru: "Очистка"
     },
     edit: {
          uz: "Tahrirlash",
          cy: "Таҳрирлаш",
          en: "Edit",
          ru: "Редактировать"
     },
     select: {
          uz: "Tanlash",
          cy: "Танлаш",
          en: "Selection",
          ru: "Выбор"
     },
     date: {
      uz: "Sana",
      cy: "Сана",
      en: "Date",
      ru: "Дата"
     },
     selectDate: {
      uz: "Sana tanlash",
      cy: "Сана танлаш",
      en: "Select date",
      ru: "Выберите дату"
     },


     // login page
     login_page_title: {
          uz: "Login sahifasi",
          cy: "Логин саҳифаси",
          en: "Login page",
          ru: "Страница входа"
     },


     // home page
     home_page_title: {
          uz: "Bosh sahifa",
          cy: "Бош саҳифа",
          en: "Homepage",
          ru: "Главная страница"
     }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'uz' || saved === 'cy' || saved === 'en' || saved === 'ru') {
      return saved;
    }
    return 'uz';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
