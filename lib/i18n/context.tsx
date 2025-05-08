"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { translations, type Language } from "./translations"

type CurrencyCode = "BRL" | "USD" | "EUR" | "ARS"

interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
}

const currencies: Record<CurrencyCode, CurrencyInfo> = {
  BRL: { code: "BRL", symbol: "R$", name: "Real" },
  USD: { code: "USD", symbol: "US$", name: "Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  ARS: { code: "ARS", symbol: "$", name: "Peso" },
}

// Mapeamento de idioma para moeda padrão
const languageToCurrency: Record<Language, CurrencyCode> = {
  pt: "BRL",
  en: "USD",
  es: "ARS",
  fr: "EUR",
  de: "EUR",
}

// Configurações de formatação por idioma
const formatConfig: Record<Language, { decimal: string; thousands: string }> = {
  pt: { decimal: ",", thousands: "." },
  en: { decimal: ".", thousands: "," },
  es: { decimal: ",", thousands: "." },
  fr: { decimal: ",", thousands: "." },
  de: { decimal: ",", thousands: "." },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  currency: CurrencyInfo
  setCurrency: (currency: CurrencyCode) => void
  formatCurrency: (value: number) => string
  formatNumber: (value: number, decimals?: number) => string
  getNumberFormat: () => { decimal: string; thousands: string }
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt")
  const [currency, setCurrencyState] = useState<CurrencyInfo>(currencies.BRL)

  useEffect(() => {
    // Load language and currency from localStorage if available
    const savedLanguage = localStorage.getItem("carBudgetLanguage") as Language
    const savedCurrency = localStorage.getItem("carBudgetCurrency") as CurrencyCode

    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage)
      // Se não houver moeda salva, definir a moeda padrão para o idioma
      if (!savedCurrency) {
        setCurrencyState(currencies[languageToCurrency[savedLanguage]])
      }
    }

    if (savedCurrency && currencies[savedCurrency]) {
      setCurrencyState(currencies[savedCurrency])
    }
  }, [])

  const setCurrency = (currencyCode: CurrencyCode) => {
    setCurrencyState(currencies[currencyCode])
    localStorage.setItem("carBudgetCurrency", currencyCode)
  }

  const saveLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("carBudgetLanguage", lang)

    // Atualizar a moeda automaticamente com base no idioma
    setCurrency(languageToCurrency[lang])
  }

  const t = (key: string) => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        return key // Return the key if translation is not found
      }
    }
    return value
  }

  const getNumberFormat = () => {
    return formatConfig[language]
  }

  // Função para formatar números de acordo com o idioma
  const formatNumber = (value: number, decimals = 2) => {
    const config = formatConfig[language]

    // Formatar o número com o número correto de casas decimais
    const fixed = value.toFixed(decimals)

    // Separar parte inteira e decimal
    const parts = fixed.split(".")

    // Adicionar separador de milhar na parte inteira
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands)

    // Juntar parte inteira e decimal com o separador decimal correto
    if (parts.length > 1) {
      return `${integerPart}${config.decimal}${parts[1]}`
    }

    return integerPart
  }

  const formatCurrency = (value: number) => {
    return `${currency.symbol} ${formatNumber(value)}`
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage: saveLanguage,
        t,
        currency,
        setCurrency,
        formatCurrency,
        formatNumber,
        getNumberFormat,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
