export interface LanguageDefinition {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  { code: 'EN-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'JA', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'KO', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ZH', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'AR', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'HE', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

/** Simple mock translators — prefix text with language code */
export const MOCK_TRANSLATIONS: Record<string, (text: string) => string> = {
  'FR': (t) => `[FR] ${t}`,
  'DE': (t) => `[DE] ${t}`,
  'ES': (t) => `[ES] ${t}`,
  'IT': (t) => `[IT] ${t}`,
  'PT': (t) => `[PT] ${t}`,
  'NL': (t) => `[NL] ${t}`,
  'PL': (t) => `[PL] ${t}`,
  'JA': (t) => `[JA] ${t}`,
  'KO': (t) => `[KO] ${t}`,
  'ZH': (t) => `[ZH] ${t}`,
  'AR': (t) => `[AR] ${t}`,
  'HE': (t) => `[HE] ${t}`,
  'RU': (t) => `[RU] ${t}`,
  'EN-US': (t) => t,
};
