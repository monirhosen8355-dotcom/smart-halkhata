import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "./AuthContext";
import en from "../locales/en";
import bn from "../locales/bn";

const LanguageContext = createContext();

const DICTIONARIES = {
  English: en,
  "বাংলা": bn,
};

export function LanguageProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [language, setLanguageState] = useState("English");

  useEffect(() => {
    if (!user) return;
    loadLanguage();
  }, [user]);

  const loadLanguage = async () => {
    try {
      const ref = doc(db, "shops", user.uid, "settings", "preferences");
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().language) {
        setLanguageState(snap.data().language);
      }
    } catch (error) {
      console.error("Failed to load language:", error);
    }
  };

  const changeLanguage = async (nextLanguage) => {
    setLanguageState(nextLanguage);

    if (!user) return;
    try {
      const ref = doc(db, "shops", user.uid, "settings", "preferences");
      await setDoc(ref, { language: nextLanguage }, { merge: true });
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  const t = (key) => {
    const dict = DICTIONARIES[language] || DICTIONARIES.English;
    return dict[key] || DICTIONARIES.English[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}