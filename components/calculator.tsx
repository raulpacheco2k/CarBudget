"use client"

import {useEffect, useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {v4 as uuidv4} from 'uuid';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {CalculatorIcon as CalcIcon, HelpCircle, Minus, Plus} from "lucide-react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {useI18n} from "@/lib/i18n/context"
import {CurrencySelector} from "./currency-selector"

type ExpenseField = {
    id: string
    name: string
    type: "percent" | "fixed"
    value: string
}

export function Calculator() {
    const {t, formatCurrency, currency, formatNumber, getNumberFormat} = useI18n()
    const [entry, setEntry] = useState("62207")
    const [rate, setRate] = useState("2.8")
    const [term, setTerm] = useState("48")
    const [limit, setLimit] = useState("27993")
    const [fields, setFields] = useState<ExpenseField[]>([])
    const [results, setResults] = useState({maxPrice: "", monthly: ""})

    const expenseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
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
                    {id: uuidv4(), name: "IPVA", type: "percent", value: "2"},
                    {id: uuidv4(), name: "Seguro", type: "percent", value: "3"},
                    {id: uuidv4(), name: "Mecânica", type: "percent", value: "3"},
                    {id: uuidv4(), name: "Licenciamento", type: "fixed", value: "149.37"},
                    {id: uuidv4(), name: "Gasolina", type: "fixed", value: "4184.60"},
                    {id: uuidv4(), name: "Aditivo", type: "fixed", value: "270"},
                    {id: uuidv4(), name: "Lavagem", type: "fixed", value: "1080"},
                    {id: uuidv4(), name: "Estacionamento", type: "fixed", value: "251"},
                    {id: uuidv4(), name: "Pedagio", type: "fixed", value: "49"},
                ])
            }
        } else {
            // Adicionar campos iniciais se não houver dados salvos
            setFields([
                {id: uuidv4(), name: "IPVA", type: "percent", value: "2"},
                {id: uuidv4(), name: "Seguro", type: "percent", value: "3"},
                {id: uuidv4(), name: "Mecânica", type: "percent", value: "3"},
                {id: uuidv4(), name: "Licenciamento", type: "fixed", value: "149.37"},
                {id: uuidv4(), name: "Gasolina", type: "fixed", value: "4184.60"},
                {id: uuidv4(), name: "Aditivo", type: "fixed", value: "270"},
                {id: uuidv4(), name: "Lavagem", type: "fixed", value: "1080"},
                {id: uuidv4(), name: "Estacionamento", type: "fixed", value: "251"},
                {id: uuidv4(), name: "Pedagio", type: "fixed", value: "49"},
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

    const scrollToNewExpense = (expenseId: string) => {
        const container = scrollContainerRef.current
        const expenseElement = expenseRefs.current[expenseId]
        const inputElement = inputRefs.current[expenseId]

        if (container && expenseElement) {
            const containerRect = container.getBoundingClientRect()
            const expenseRect = expenseElement.getBoundingClientRect()

            const relativeTop = expenseRect.top - containerRect.top + container.scrollTop

            const scrollPosition = relativeTop - container.clientHeight / 2 + expenseElement.offsetHeight / 2

            container.scrollTo({
                top: Math.max(0, scrollPosition),
                behavior: "smooth",
            })

            setTimeout(() => {
                if (inputElement) {
                    inputElement.focus()
                }
            }, 300)
        }
    }

    const addField = () => {
        const newId = uuidv4()
        const newField = {id: newId, name: "", type: "percent" as const, value: ""}
        setFields([...fields, newField])

        setTimeout(() => {
            scrollToNewExpense(newId)
        }, 100)
    }

    const removeField = (id: string) => {
        setFields(fields.filter((field) => field.id !== id))
        delete expenseRefs.current[id]
        delete inputRefs.current[id]
    }

    const updateField = (id: string, field: Partial<ExpenseField>) => {
        setFields(fields.map((f) => (f.id === id ? {...f, ...field} : f)))
    }

    const clearAllFields = () => {
        setFields([])
        expenseRefs.current = {}
        inputRefs.current = {}
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

        setResults({maxPrice, monthly})
    }

    return (
        <div id="calculator" className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-gray-200">
                <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                    <CardTitle className="flex items-center text-2xl">
                        <CalcIcon className="mr-2 h-6 w-6"/>
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
                            <CurrencySelector/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                {t("calculator.financingData")}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="h-4 w-4 text-gray-400 ml-2"/>
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
                                                    <HelpCircle className="h-4 w-4 text-gray-400"/>
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
                                                    <HelpCircle className="h-4 w-4 text-gray-400"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{t("calculator.monthlyRateTooltip")}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Input id="rate" type="number" step="0.01" value={rate}
                                           onChange={(e) => setRate(e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="term" className="mr-2">
                                            {t("calculator.term")}
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle className="h-4 w-4 text-gray-400"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{t("calculator.termTooltip")}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Input id="term" type="number" value={term}
                                           onChange={(e) => setTerm(e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="limit" className="mr-2">
                                            {t("calculator.annualLimit")} ({currency.symbol})
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle className="h-4 w-4 text-gray-400"/>
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

                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium flex items-center">
                                    {t("calculator.additionalExpenses")}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-4 w-4 text-gray-400 ml-2"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{t("calculator.additionalExpensesTooltip")}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </h3>
                            </div>

                            {/* Container scrollável para as despesas */}
                            <div className="flex-1 min-h-0">
                                {fields.length > 0 ? (
                                    <div
                                        ref={scrollContainerRef}
                                        className="max-h-80 overflow-y-auto pr-2 space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50 scroll-smooth"
                                    >
                                        {fields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                ref={(el) => (expenseRefs.current[field.id] = el)}
                                                className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:border-teal-300"
                                            >
                                                <div className="flex items-start gap-2 mb-2">
                                                    <div className="flex-1">
                                                        <Input
                                                            ref={(el) => (inputRefs.current[field.id] = el)}
                                                            placeholder={t("calculator.expenseName")}
                                                            value={field.name}
                                                            onChange={(e) => updateField(field.id, {name: e.target.value})}
                                                            className="text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"/>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeField(field.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-8 w-8">
                                                        <Minus className="h-3 w-3"/>
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Select
                                                        value={field.type}
                                                        onValueChange={(value) =>
                                                            updateField(field.id, {
                                                                type: value as "percent" | "fixed",
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="text-sm h-8">
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem
                                                                value="percent">{t("calculator.percent")}</SelectItem>
                                                            <SelectItem
                                                                value="fixed">{t("calculator.fixed")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Input
                                                        placeholder={t("calculator.expenseValue")}
                                                        type="number"
                                                        step="0.01"
                                                        value={field.value}
                                                        onChange={(e) => updateField(field.id, {value: e.target.value})}
                                                        className="text-sm h-8"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                        <p className="text-gray-500 text-sm text-center">{t("calculator.additionalExpensesTooltip")}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addField}
                                    className={`w-full ${fields.length > 0 ? 'sm:w-1/2' : ''} hover:bg-teal-50 hover:border-teal-300`}>
                                    <Plus className="h-4 w-4 mr-1"/> {t("calculator.addExpense")}
                                </Button>
                                {fields.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllFields}
                                        className="w-full sm:w-1/2 text-red-500 hover:bg-red-50 hover:border-red-300">
                                        <Plus className="h-4 w-4 mr-1"/> {t("calculator.removeAllExpenses")}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {results.maxPrice && (
                        <div
                            className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                            <h3 className="text-lg font-medium mb-3 text-teal-800 flex items-center">
                                <CalcIcon className="h-5 w-5 mr-2"/>
                                {t("calculator.results")}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">{t("calculator.maxPrice")}</p>
                                    <p className="text-2xl font-bold text-teal-700">
                                        {currency.symbol} {formatNumber(Number.parseFloat(results.maxPrice))}
                                    </p>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">{t("calculator.monthlyPayment")}</p>
                                    <p className="text-2xl font-bold text-teal-700">
                                        {currency.symbol} {formatNumber(Number.parseFloat(results.monthly))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t bg-gray-50 py-4">
                    <Button onClick={calculate} size="lg" className="bg-teal-600 hover:bg-teal-700">
                        <CalcIcon className="mr-2 h-5 w-5"/>
                        {t("common.calculate")}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
