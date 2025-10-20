import React, { createContext, useState, useEffect, ReactNode } from 'react';
// Fix: Corrected the import name from 'translations' to match the actual export from the translations file.
// The error was that 'translations' was not exported, but the file was actually exporting 'allTranslations'. I have now renamed the export to 'translations'.
import { translations, Language } from '../translations';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('brevet-easy-language') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    localStorage.setItem('brevet-easy-language', lang);
    setLanguage(lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let translation = translations[language]?.[key] || translations['fr']?.[key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }
    return translation;
  };

  return (
    <LocalizationContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};
