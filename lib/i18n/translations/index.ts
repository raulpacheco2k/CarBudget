import { pt } from "./pt"
import { en } from "./en"
import { es } from "./es"
import { fr } from "./fr"
import { de } from "./de"

export const translations = {
  pt,
  en,
  es,
  fr,
  de,
}

export type Language = keyof typeof translations
