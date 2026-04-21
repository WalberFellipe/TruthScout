import { I18N, SUPPORTED_LANGS } from "@/i18n/translations.js";

export { I18N, SUPPORTED_LANGS };

/**
 * @param {keyof typeof I18N} lang
 */
export function getMessages(lang) {
  return I18N[lang] ?? I18N["EN-US"];
}
