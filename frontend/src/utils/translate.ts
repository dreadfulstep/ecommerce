import { Translations } from "@/types";

async function calculateTranslationCompletion(languageCode: string, enGBTranslations: Translations): Promise<number> {
  try {
    const selectedLanguageTranslations = await import(`@/translations/${languageCode}.json`).catch(() => ({}));

    let totalKeys = 0;
    let translatedKeys = 0;

    const compareTranslations = (source: Record<string, unknown>, target: Record<string, unknown>) => {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          if (typeof source[key] === "object" && source[key] !== null && typeof target[key] === "object" && target[key] !== null) {
            compareTranslations(source[key] as Record<string, unknown>, target[key] as Record<string, unknown>);
          } else {
            totalKeys++;
            if (target[key] !== "" && target[key] !== null && target[key] !== undefined) {
              translatedKeys++;
            }
          }
        }
      }
    };

    compareTranslations(enGBTranslations, selectedLanguageTranslations);

    if (totalKeys === 0) return 0;
    return (translatedKeys / totalKeys) * 100;
  } catch (error) {
    console.error(`Error calculating completion for ${languageCode}:`, error);
    return 0;
  }
}

export async function getAllLanguagePercentages(): Promise<Array<{ code: string; name: string; percentage: number }>> {
  try {
    const languagesData = await import("@/data/languages.json");
    const languages = languagesData.languages;
    
    const enGBTranslations = await import(`@/translations/en-GB.json`).catch(() => ({}));

    const results = await Promise.all(
      languages.map(async (lang) => {
        const percentage = await calculateTranslationCompletion(lang.code, enGBTranslations);
        return {
          code: lang.code,
          name: lang.name,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      })
    );

    return results;
  } catch (error) {
    console.error("Error getting language percentages:", error);
    return [];
  }
}

export async function loadTranslation(
  language: string
): Promise<Translations> {
  try {
    let selectedLanguageTranslations: Translations = {};
    let fallbackLanguageTranslations: Translations = {};

    try {
      selectedLanguageTranslations = await import(`@/translations/${language}.json`);
    } catch{}

    try {
      fallbackLanguageTranslations = await import(`@/translations/en-GB.json`);
    } catch{}

    const mergeTranslations = (selected: Translations, fallback: Translations): Translations => {
      const result: Translations = { ...fallback };
    
      Object.keys(selected).forEach((key) => {
        if (
          typeof selected[key] === "object" &&
          selected[key] !== null &&
          typeof fallback[key] === "object" &&
          fallback[key] !== null
        ) {
          result[key] = mergeTranslations(selected[key] as Translations, fallback[key] as Translations);
        } else {
          result[key] = selected[key] !== "" ? selected[key] : fallback[key];
        }
      });
    
      return result;
    };    

    return mergeTranslations(selectedLanguageTranslations, fallbackLanguageTranslations);
  } catch (error) {
    console.error("Error loading translations:", error);
    return {} as Translations;
  }
}

export const getLanguageName = (langCode: string) => {
  const languageNames = new Intl.DisplayNames(['en'], {
    type: 'language'
  });

  const lang = languageNames.of(langCode) || langCode.split('-')[0];

  return lang;
};

export async function getPreferredLanguageFromHeader(acceptLanguage: string): Promise<string> {
  if (!acceptLanguage) return "en-GB";
  
  const languages = acceptLanguage.split(',')
    .map(lang => {
      const [code, quality] = lang.split(';q=');
      return {
        code: code.trim(),
        quality: quality ? parseFloat(quality) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);
  
  const languagesData = await import("@/data/languages.json");
  const supportedLanguages = languagesData.languages.map(lang => lang.code);
  
  for (const lang of languages) {
    if (supportedLanguages.includes(lang.code)) {
      return lang.code;
    }
    
    const langBase = lang.code.split('-')[0];
    const match = supportedLanguages.find(supported => 
      supported.startsWith(langBase + '-')
    );
    
    if (match) {
      return match;
    }
  }

  return "en-GB";
}