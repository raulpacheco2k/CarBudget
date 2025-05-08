"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DollarSign } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export function CurrencySelector() {
  const { t, currency, setCurrency } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span>{currency.symbol}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setCurrency("BRL")}>{t("currencies.BRL")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("USD")}>{t("currencies.USD")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("EUR")}>{t("currencies.EUR")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency("ARS")}>{t("currencies.ARS")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
