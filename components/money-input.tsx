"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "./ui/input"
import { useI18n } from "@/lib/i18n/context"

interface MoneyInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  className?: string
}

function parseLocalizedNumber(display: string, decimal: string): string {
  let s = display.trim().replace(/\s/g, "").replace(/[^\d.,-]/g, "")
  if (!s) return ""
  const isNeg = s.startsWith("-")
  s = s.replace(/-/g, "")

  if (decimal === ",") {
    if (s.includes(",")) {
      const parts = s.split(",")
      const dec = parts.pop() ?? ""
      const intPart = parts.join("").replace(/\./g, "")
      s = intPart + "." + dec
    } else {
      if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
        s = s.replace(/\./g, "")
      } else {
        const dotCount = (s.match(/\./g) || []).length
        if (dotCount > 1) {
          const parts = s.split(".")
          const dec = parts.pop() ?? ""
          s = parts.join("") + "." + dec
        }
      }
    }
  } else {
    if (s.includes(".")) {
      const parts = s.split(".")
      const dec = parts.pop() ?? ""
      const intPart = parts.join("").replace(/,/g, "")
      s = intPart + "." + dec
    } else {
      if (/^\d{1,3}(,\d{3})+$/.test(s)) {
        s = s.replace(/,/g, "")
      } else if (s.includes(",")) {
        const parts = s.split(",")
        const dec = parts.pop() ?? ""
        const intPart = parts.join("")
        s = intPart + "." + dec
      }
    }
  }

  const dotParts = s.split(".")
  if (dotParts.length > 2) {
    const dec = dotParts.pop() ?? ""
    s = dotParts.join("") + "." + dec
  }
  if (isNeg) s = "-" + s
  if (/^-?\d*\.?\d*$/.test(s)) return s
  return s
}

function addThousands(intPart: string, thousands: string): string {
  if (!intPart || intPart === "-") return intPart
  const isNeg = intPart.startsWith("-")
  const digits = isNeg ? intPart.slice(1) : intPart
  if (!digits) return intPart
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, thousands)
  return isNeg ? "-" + grouped : grouped
}

export function MoneyInput({ value, onChange, id, placeholder, className }: MoneyInputProps) {
  const { formatNumber, getNumberFormat, language } = useI18n()
  const [display, setDisplay] = useState("")
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingCursor = useRef<number | null>(null)

  const formatFull = (inv: string): string => {
    if (inv === "" || inv === "-" || inv === "." || inv === "-.") return inv === "" ? "" : inv.replace(".", getNumberFormat().decimal)
    const num = Number.parseFloat(inv)
    if (isNaN(num)) return ""
    return formatNumber(num)
  }

  const formatPartial = (inv: string, decimal: string, thousands: string): string => {
    if (inv === "") return ""
    if (inv === "-") return "-"
    if (inv === "." || inv === "-.") return (inv.startsWith("-") ? "-" : "") + decimal
    const hasDecimal = inv.includes(".")
    const [rawInt = "", rawDec = ""] = inv.split(".")
    const intFormatted = addThousands(rawInt === "" || rawInt === "-" ? rawInt : rawInt, thousands)
    if (!hasDecimal) return intFormatted
    return intFormatted + decimal + rawDec.slice(0, 2)
  }

  useEffect(() => {
    const { decimal, thousands } = getNumberFormat()
    if (focused) {
      setDisplay(formatPartial(value, decimal, thousands))
    } else {
      setDisplay(formatFull(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, language])

  useEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      const pos = pendingCursor.current
      pendingCursor.current = null
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(pos, pos)
      })
    }
  }, [display])

  const computeNewCursor = (newDisplay: string, digitsBefore: number, hasSepBefore: boolean, decimal: string): number => {
    if (newDisplay === "") return 0
    let seen = 0
    let pos = newDisplay.length
    for (let i = 0; i < newDisplay.length; i++) {
      if (/\d/.test(newDisplay[i])) {
        seen++
        if (seen === digitsBefore) {
          pos = i + 1
          break
        }
      }
    }
    if (digitsBefore === 0) {
      pos = newDisplay.startsWith("-") ? 1 : 0
      if (hasSepBefore && newDisplay.slice(pos, pos + 1) === decimal) pos += 1
      return Math.min(pos, newDisplay.length)
    }
    if (seen < digitsBefore) return newDisplay.length
    if (hasSepBefore && newDisplay.slice(pos, pos + 1) === decimal) pos += 1
    return Math.min(pos, newDisplay.length)
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={display}
      onFocus={() => {
        setFocused(true)
        // Não remove a máscara: mantém o valor formatado visível
      }}
      onBlur={() => {
        setFocused(false)
        setDisplay(formatFull(value))
      }}
      onChange={(e) => {
        const raw = e.target.value
        const cursor = e.target.selectionStart ?? raw.length
        const digitsBefore = (raw.slice(0, cursor).match(/\d/g) || []).length
        const hasSepBefore = /[.,]/.test(raw.slice(0, cursor))
        const { decimal, thousands } = getNumberFormat()
        const invariant = parseLocalizedNumber(raw, decimal)
        onChange(invariant)
        const partial = formatPartial(invariant, decimal, thousands)
        // Se o usuário apagou tudo, respeita vazio
        const nextDisplay = raw === "" ? "" : partial
        setDisplay(nextDisplay)
        pendingCursor.current = computeNewCursor(nextDisplay, digitsBefore, hasSepBefore, decimal)
      }}
    />
  )
}
