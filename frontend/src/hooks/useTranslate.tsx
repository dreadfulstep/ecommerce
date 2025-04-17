"use client"

import { useState, useEffect, useContext, createContext, useRef, useCallback } from "react";
import { Translations } from "@/types";
import { getCookie, setCookie } from "cookies-next";
import { loadTranslation } from "@/utils/translate";
import LoadingLanguage from "@/components/misc/LoadingLanguage";

export const TranslationContext = createContext<{
  t: (key: string) => string;
  language: string;
  debugMode: boolean;
  setLanguage: (lang: string) => void;
  setDebugMode: (debug: boolean) => void;
  isLoading: boolean;
  missingKeys: string[];
}>({
  t: (key: string) => key,
  language: "en-GB",
  debugMode: false,
  isLoading: false,
  setLanguage: () => {},
  setDebugMode: () => {},
  missingKeys: [],
});

export const useTranslate = () => useContext(TranslationContext);

export const TranslationProvider = ({ 
  children, 
  devMode,
  initialLanguage = "en-GB",
  initialTranslations = {}
}: { 
  children: React.ReactNode, 
  devMode: boolean,
  initialLanguage?: string,
  initialTranslations?: Translations 
}) => {
  const [language, setLanguageState] = useState(initialLanguage);
  const [debugMode, setDebugModeState] = useState(false);
  const [translations, setTranslations] = useState<Translations>(initialTranslations);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const missingKeysRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const updateMissingKeys = () => {
      if (missingKeysRef.current.size > 0) {
        setMissingKeys(Array.from(missingKeysRef.current));
      }
    };
    
    const interval = setInterval(updateMissingKeys, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchTranslations = useCallback(async (lang: string) => {
    try {
      const translation = await loadTranslation(lang);
      setTranslations(translation);
      missingKeysRef.current.clear();
      setMissingKeys([]);
      return translation;
    } catch (err) {
      console.error("Error loading translations:", err);
      return {};
    }
  }, []);
  
  useEffect(() => {
    const initialize = async () => {
      if (Object.keys(initialTranslations).length === 0) {
        const languageFromCookie = (await getCookie("language")) || "en-GB";
        const debugModeFromCookie = (await getCookie("debug-mode"));
        const isDebugMode = debugModeFromCookie === "true";
        
        setLanguageState(languageFromCookie);
        setDebugModeState(isDebugMode);
        fetchTranslations(languageFromCookie).finally(() => {
          setIsInitialized(true);
        });
      } else {
        const debugModeFromCookie = (await getCookie("debug-mode"));
        const isDebugMode = debugModeFromCookie === "true";
        setDebugModeState(isDebugMode);
        setIsInitialized(true);
      }
    };
    
    initialize();
  }, [fetchTranslations, initialTranslations]);
  
  const setLanguage = useCallback(async (lang: string) => {
    setIsLoading(true);
    setLanguageState(lang);
    setCookie("language", lang, { path: "/" });
    await fetchTranslations(lang);
    setIsLoading(false);
  }, [fetchTranslations]);
  
  const setDebugMode = useCallback(async (debug: boolean) => {
    setIsLoading(true);
    setDebugModeState(debug);
    setCookie("debug-mode", debug ? "true" : "false", { path: "/" });
    await fetchTranslations(language);
    setIsLoading(false);
  }, [fetchTranslations, language]);
  
  const t = useCallback((key: string): string => {
    const translation = key.split(".").reduce((o, i) => {
      if (o && typeof o === "object" && i in o) {
        return o[i] as Translations | string;
      }
      return key;
    }, translations as Translations | string) as string;
    
    if (translation === key && devMode) {
      missingKeysRef.current.add(key);
      if (debugMode) {
        console.log("Missing text key:", key);
      }
    }
    
    return translation;
  }, [translations, debugMode, devMode]);
  
  return (
    <TranslationContext.Provider value={{ 
      t, 
      language, 
      debugMode,
      setLanguage,
      setDebugMode, 
      isLoading,
      missingKeys,
    }}>
      {isLoading && <LoadingLanguage language={language} />}
      {(isInitialized || Object.keys(translations).length > 0) && children}
    </TranslationContext.Provider>
  );
};