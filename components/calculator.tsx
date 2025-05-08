"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, CalculatorIcon as CalcIcon, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/lib/i18n/context"
import { CurrencySelector } from "./currency-selector"

type ExpenseField = {
  id: string
  name: string
  type: "percent" | "fixed"
  value: string
}

export function Calculator() {
  const { t, formatCurrency, currency, formatNumber, getNumberFormat } = useI18n()
  const [entry, setEntry] = useState("62207")
  const [rate, setRate] = useState("2.4")
  const [term, setTerm] = useState("48")
  const [limit, setLimit] = useState("27993")
  const [fields, setFields] = useState<ExpenseField[]>([])
  const [results, setResults] = useState({ maxPrice: "", monthly: "" })

  // Referência para controlar se é a primeira renderização
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Carregar dados do localStorage, se existirem
    const savedData = localStorage.getItem("carBudgetData")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        if (parsedData.entry) setEntry(parsedData.entry)
        if (parsedData.rate) setRate(parsedData.rate)
        if (parsedData.term) setTerm(parsedData.term)
        if (parsedData.limit) setLimit(parsedData.limit)
        if (parsedData.fields && Array.isArray(parsedData.fields)) setFields(parsedData.fields)
      } catch (error) {
        console.error("Erro ao carregar dados salvos:", error)
        // Adicionar campos iniciais caso haja erro
        setFields([
          { id: uuidv4(), name: "IPVA", type: "percent", value: "2" },
          { id: uuidv4(), name: "Seguro", type: "percent", value: "3" },
          { id: uuidv4(), name: "Mecânica", type: "percent", value: "3" },
          { id: uuidv4(), name: "Licenciamento", type: "fixed", value: "149.37" },
          { id: uuidv4(), name: "Gasolina", type: "fixed", value: "4184.60" },
          { id: uuidv4(), name: "Aditivo", type: "fixed", value: "270" },
          { id: uuidv4(), name: "Lavagem", type: "fixed", value: "1080" },
          { id: uuidv4(), name: "Estacionamento", type: "fixed", value: "251" },
          { id: uuidv4(), name: "Pedagio", type: "fixed", value: "49" },
        ])
      }
    } else {
      // Adicionar campos iniciais se não houver dados salvos
      setFields([
        { id: uuidv4(), name: "IPVA", type: "percent", value: "2" },
        { id: uuidv4(), name: "Seguro", type: "percent", value: "3" },
        { id: uuidv4(), name: "Mecânica", type: "percent", value: "3" },
        { id: uuidv4(), name: "Licenciamento", type: "fixed", value: "149.37" },
        { id: uuidv4(), name: "Gasolina", type: "fixed", value: "4184.60" },
        { id: uuidv4(), name: "Aditivo", type: "fixed", value: "270" },
        { id: uuidv4(), name: "Lavagem", type: "fixed", value: "1080" },
        { id: uuidv4(), name: "Estacionamento", type: "fixed", value: "251" },
        { id: uuidv4(), name: "Pedagio", type: "fixed", value: "49" },
      ])
    }
  }, [])

  useEffect(() => {
    // Salvar dados no localStorage quando mudarem
    const dataToSave = {
      entry,
      rate,
      term,
      limit,
      fields,
    }
    localStorage.setItem("carBudgetData", JSON.stringify(dataToSave))
  }, [entry, rate, term, limit, fields])

  const addField = () => {
    setFields([...fields, { id: uuidv4(), name: "", type: "percent", value: "" }])
  }

  const removeField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id))
  }

  const updateField = (id: string, field: Partial<ExpenseField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...field } : f)))
  }

  // Função PMT
  function pmt(rate: number, n: number, pv: number) {
    const r = rate / 100
    return (r * pv) / (1 - Math.pow(1 + r, -n))
  }

  // Função para formatar o valor para exibição
  const formatDisplayValue = (value: string): string => {
    if (!value) return ""
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return value
    return formatNumber(numValue)
  }

  const calculate = () => {
    const entryValue = Number.parseFloat(entry)
    const rateValue = Number.parseFloat(rate) / 100
    const termValue = Number.parseInt(term)
    const limitValue = Number.parseFloat(limit)

    let sumPercent = 0
    let sumFixed = 0

    fields.forEach((field) => {
      const val = Number.parseFloat(field.value)
      if (!field.name || isNaN(val)) return
      if (field.type === "percent") {
        // Converter percentual (ex: 2%) para decimal (0.02)
        sumPercent += val / 100
      } else {
        sumFixed += val
      }
    })

    // Busca binária para preço máximo
    let low = entryValue,
      high = 1e6,
      mid
    for (let i = 0; i < 100; i++) {
      mid = (low + high) / 2
      const financed = mid - entryValue
      const monthly = pmt(rateValue * 100, termValue, financed)
      const annualCost = monthly * 12 + mid * sumPercent + sumFixed
      if (annualCost > limitValue) high = mid
      else low = mid
      if (high - low < 0.01) break
    }

    const maxPrice = ((low + high) / 2).toFixed(2)
    const financed = Number.parseFloat(maxPrice) - entryValue
    const monthly = pmt(rateValue * 100, termValue, financed).toFixed(2)

    setResults({ maxPrice, monthly })
  }

  return (
    <div id="calculator" className="max-w-4xl mx-auto">
      <Card className="shadow-xl border-gray-200">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <CardTitle className="flex items-center text-2xl">
            <CalcIcon className="mr-2 h-6 w-6" />
            {t("calculator.title")}
          </CardTitle>
          <CardDescription className="text-gray-100">{t("calculator.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="currency" className="text-sm">
                {t("calculator.currency")}:
              </Label>
              <CurrencySelector />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                {t("calculator.financingData")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{t("calculator.financingDataTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="entry" className="mr-2">
                      {t("calculator.downPayment")} ({currency.symbol})
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("calculator.downPaymentTooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="entry"
                    type="number"
                    step="0.01"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="rate" className="mr-2">
                      {t("calculator.monthlyRate")}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("calculator.monthlyRateTooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input id="rate" type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="term" className="mr-2">
                      {t("calculator.term")}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("calculator.termTooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input id="term" type="number" value={term} onChange={(e) => setTerm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="limit" className="mr-2">
                      {t("calculator.annualLimit")} ({currency.symbol})
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("calculator.annualLimitTooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                {t("calculator.additionalExpenses")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{t("calculator.additionalExpensesTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder={t("calculator.expenseName")}
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      className="flex-1"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateField(field.id, {
                          type: value as "percent" | "fixed",
                        })
                      }
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">{t("calculator.percent")}</SelectItem>
                        <SelectItem value="fixed">{t("calculator.fixed")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={t("calculator.expenseValue")}
                      type="number"
                      step="0.01"
                      value={field.value}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      className="w-[100px]"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(field.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addField} className="mt-3">
                <Plus className="h-4 w-4 mr-1" /> {t("calculator.addExpense")}
              </Button>
            </div>
          </div>

          {results.maxPrice && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-2 text-gray-900">{t("calculator.results")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <p className="text-sm text-gray-500">{t("calculator.maxPrice")}</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {currency.symbol} {formatNumber(Number.parseFloat(results.maxPrice))}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <p className="text-sm text-gray-500">{t("calculator.monthlyPayment")}</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {currency.symbol} {formatNumber(Number.parseFloat(results.monthly))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t bg-gray-50 py-4">
          <Button onClick={calculate} size="lg" className="bg-teal-600 hover:bg-teal-700">
            <CalcIcon className="mr-2 h-5 w-5" />
            {t("common.calculate")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
