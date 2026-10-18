"use client"

import {useEffect, useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {v4 as uuidv4} from 'uuid';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {
    CalculatorIcon as CalcIcon,
    HelpCircle,
    Minus,
    PieChart,
    Plus,
    Receipt,
    Wallet,
} from "lucide-react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis} from "recharts"
import {useI18n} from "@/lib/i18n/context"
import {MoneyInput} from "./money-input"

type ExpenseField = {
    id: string
    name: string
    type: "percent" | "fixed"
    period: "annual" | "monthly"
    value: string
}

type BreakdownItem = {
    key: string
    name: string
    monthly: number
}

// Paleta para as despesas no gráfico (a parcela usa o teal-600 fixo)
const chartColors = [
    "#14b8a6",
    "#0891b2",
    "#6366f1",
    "#8b5cf6",
    "#d946ef",
    "#f43f5e",
    "#f59e0b",
    "#84cc16",
    "#10b981",
    "#0ea5e9",
]

export function Calculator() {
    const {t, formatCurrency, currency, formatNumber, getNumberFormat} = useI18n()
    const [entry, setEntry] = useState("62207")
    const [rate, setRate] = useState("2.8")
    const [term, setTerm] = useState("48")
    const [limit, setLimit] = useState("27993")
    const [fields, setFields] = useState<ExpenseField[]>([])
    const [income, setIncome] = useState("")
    const [results, setResults] = useState({
        maxPrice: "",
        monthly: "",
        cashMaxPrice: "",
        cashUnlimited: false,
        monthlyDuring: "",
        monthlyAfter: "",
        termUsed: 0,
        totalPaid: "",
        totalInterest: "",
        interestPercent: 0,
        breakdown: [] as BreakdownItem[],
    })

    const expenseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const hasLoaded = useRef(false)

    const getDefaultFields = (): ExpenseField[] => [
        {id: uuidv4(), name: "IPVA", type: "percent", period: "annual", value: "2"},
        {id: uuidv4(), name: "Seguro", type: "percent", period: "annual", value: "3"},
        {id: uuidv4(), name: "Mecânica", type: "percent", period: "annual", value: "3"},
        {id: uuidv4(), name: "Licenciamento", type: "fixed", period: "annual", value: "149.37"},
        {id: uuidv4(), name: "Gasolina", type: "fixed", period: "annual", value: "4184.60"},
        {id: uuidv4(), name: "Aditivo", type: "fixed", period: "annual", value: "270"},
        {id: uuidv4(), name: "Lavagem", type: "fixed", period: "annual", value: "1080"},
        {id: uuidv4(), name: "Estacionamento", type: "fixed", period: "annual", value: "251"},
        {id: uuidv4(), name: "Pedagio", type: "fixed", period: "annual", value: "49"},
    ]

    const restoreDefaults = () => {
        setFields(getDefaultFields())
    }

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
                if (parsedData.income) setIncome(parsedData.income)
                if (parsedData.fields && Array.isArray(parsedData.fields) && parsedData.fields.length > 0) {
                    // Normalizar campos salvos: período padrão "annual" (compatibilidade com dados antigos)
                    setFields(
                        parsedData.fields.map((field: ExpenseField) => ({
                            ...field,
                            period: field.period === "monthly" ? ("monthly" as const) : ("annual" as const),
                        }))
                    )
                } else if (!parsedData.fields || !Array.isArray(parsedData.fields)) {
                    // Formato inválido: restaura padrão
                    setFields(getDefaultFields())
                }
                // Se fields for array vazio, respeita a escolha do usuário (lista vazia)
                // e não sobrescreve com padrão — o botão "Restaurar padrão" recupera se preciso
            } catch (error) {
                console.error("Erro ao carregar dados salvos:", error)
                // Adicionar campos iniciais caso haja erro
                setFields(getDefaultFields())
            }
        } else {
            // Adicionar campos iniciais se não houver dados salvos
            setFields(getDefaultFields())
        }
        hasLoaded.current = true
    }, [])

    useEffect(() => {
        // Não salvar antes de carregar (evita sobrescrever o localStorage com [] no mount)
        if (!hasLoaded.current) return
        const dataToSave = {
            entry,
            rate,
            term,
            limit,
            income,
            fields,
        }
        localStorage.setItem("carBudgetData", JSON.stringify(dataToSave))
    }, [entry, rate, term, limit, income, fields])

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
        const newField = {id: newId, name: "", type: "percent" as const, period: "annual" as const, value: ""}
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

    // Interpola variáveis em textos traduzidos (ex.: "{term}")
    const interpolate = (template: string, values: Record<string, string | number>): string =>
        template.replace(/\{(\w+)\}/g, (_, key) => (key in values ? String(values[key]) : ""))

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
            // Converter para valor anual: custos mensais são multiplicados por 12
            const periodFactor = field.period === "monthly" ? 12 : 1
            if (field.type === "percent") {
                // Converter percentual (ex: 2%) para decimal (0.02)
                sumPercent += (val / 100) * periodFactor
            } else {
                sumFixed += val * periodFactor
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

        // Preço máximo à vista (parcela zero): monthly = 0 => P * sumPercent + sumFixed <= limit
        // Logo P = (limit - sumFixed) / sumPercent. Cálculo automático para evitar
        // que o usuário precise aumentar a entrada manualmente até zerar a parcela.
        let cashMaxPrice = ""
        let cashUnlimited = false
        if (sumPercent > 0) {
            const cashValue = (limitValue - sumFixed) / sumPercent
            cashMaxPrice = Math.max(0, cashValue).toFixed(2)
        } else {
            // Sem despesas percentuais: o preço à vista não impacta o custo anual
            if (sumFixed <= limitValue) {
                cashUnlimited = true
            } else {
                cashMaxPrice = "0.00"
            }
        }

        // Gasto mensal total: enquanto paga o financiamento (parcela + despesas do carro)
        // e depois de quitar (apenas as despesas do carro)
        const maxPriceValue = Number.parseFloat(maxPrice)
        const monthlyValue = Number.parseFloat(monthly)
        const annualExpenses = maxPriceValue * sumPercent + sumFixed
        const monthlyExpenses = annualExpenses / 12
        const monthlyDuring = (monthlyValue + monthlyExpenses).toFixed(2)
        const monthlyAfter = monthlyExpenses.toFixed(2)

        // Custos do financiamento: total pago e total de juros
        const totalPaid = (entryValue + monthlyValue * termValue).toFixed(2)
        const totalInterest = Math.max(0, entryValue + monthlyValue * termValue - maxPriceValue).toFixed(2)
        const interestPercent = maxPriceValue > 0 ? (Number.parseFloat(totalInterest) / maxPriceValue) * 100 : 0

        // Composição do gasto mensal por despesa (mesmo critério do cálculo: nome e valor válidos)
        const breakdown: BreakdownItem[] = fields
            .map((field, index) => {
                const val = Number.parseFloat(field.value)
                if (!field.name || isNaN(val)) return null
                // Anualizar o valor e depois dividir por 12 para obter o gasto mensal
                const periodFactor = field.period === "monthly" ? 12 : 1
                const monthly =
                    field.type === "percent" ? (maxPriceValue * val * periodFactor) / 100 / 12 : (val * periodFactor) / 12
                return {key: `item${index}`, name: field.name, monthly}
            })
            .filter((item): item is BreakdownItem => item !== null)

        setResults({
            maxPrice,
            monthly,
            cashMaxPrice,
            cashUnlimited,
            monthlyDuring,
            monthlyAfter,
            termUsed: termValue,
            totalPaid,
            totalInterest,
            interestPercent,
            breakdown,
        })
    }

    // Renda mensal (opcional): % da renda comprometida com o carro
    const incomeValue = Number.parseFloat(income)
    const hasIncome = !isNaN(incomeValue) && incomeValue > 0 && !!results.monthlyDuring
    const totalDuring = Number.parseFloat(results.monthlyDuring) || 0
    const totalAfter = Number.parseFloat(results.monthlyAfter) || 0
    const incomeDuringPercent = hasIncome ? (totalDuring / incomeValue) * 100 : 0
    const incomeAfterPercent = hasIncome ? (totalAfter / incomeValue) * 100 : 0

    // Faixas de saúde financeira: até 15% saudável, até 20% atenção, acima disso comprometido
    const getIncomeHealth = (percent: number) => {
        if (percent <= 15) {
            return {
                label: "calculator.incomeHealthy",
                desc: "calculator.incomeHealthyDesc",
                className: "bg-green-100 text-green-800 border-green-200",
            }
        }
        if (percent <= 20) {
            return {
                label: "calculator.incomeWarning",
                desc: "calculator.incomeWarningDesc",
                className: "bg-amber-100 text-amber-800 border-amber-200",
            }
        }
        return {
            label: "calculator.incomeCritical",
            desc: "calculator.incomeCriticalDesc",
            className: "bg-red-100 text-red-800 border-red-200",
        }
    }

    const formatPercent = (value: number) => `${formatNumber(value, 1)}%`

    const IncomeBadge = ({percent}: {percent: number}) => {
        const health = getIncomeHealth(percent)
        return (
            <span
                title={t(health.desc)}
                className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${health.className}`}>
                {t(health.label)}
            </span>
        )
    }

    // Dados e configuração do gráfico "durante vs. depois"
    const chartConfig: ChartConfig = {
        installment: {label: t("calculator.installmentRow"), color: "#0d9488"},
        ...Object.fromEntries(
            results.breakdown.map((item, index) => [
                item.key,
                {label: item.name, color: chartColors[index % chartColors.length]},
            ])
        ),
    }

    const chartData = [
        {
            period: t("calculator.chartDuring"),
            installment: Number.parseFloat(results.monthly) || 0,
            ...Object.fromEntries(results.breakdown.map((item) => [item.key, item.monthly])),
        },
        {
            period: t("calculator.chartAfter"),
            installment: 0,
            ...Object.fromEntries(results.breakdown.map((item) => [item.key, item.monthly])),
        },
    ]

    // Linha do tooltip: indicador colorido + nome da despesa + valor formatado
    const renderTooltipRow = (value: number, name: string, item: {color?: string}) => {
        if (!value) return null
        return (
            <div className="flex w-full items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{backgroundColor: item.color || "#0d9488"}}
                    />
                    {(chartConfig[name]?.label as string) ?? name}
                </span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatCurrency(value)}
                </span>
            </div>
        )
    }

    // Rótulo com o total no topo de cada barra
    const renderBarTotal = (props: any) => {
        const {viewBox, index} = props as {viewBox?: {x: number; y: number; width: number}; index?: number}
        const total = index === 0 ? totalDuring : totalAfter
        if (!viewBox || !(total > 0)) return null
        return (
            <text
                x={viewBox.x + viewBox.width / 2}
                y={viewBox.y - 8}
                textAnchor="middle"
                className="fill-teal-800 text-[11px] font-semibold">
                {formatCurrency(total)}
            </text>
        )
    }

    // A série mais alta recebe os cantos arredondados e o rótulo de total
    const topSeriesKey = results.breakdown.length > 0 ? results.breakdown[results.breakdown.length - 1].key : "installment"

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
                                    <MoneyInput
                                        id="entry"
                                        value={entry}
                                        onChange={setEntry}
                                        placeholder={formatNumber(0)}
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
                                    <MoneyInput
                                        id="limit"
                                        value={limit}
                                        onChange={setLimit}
                                        placeholder={formatNumber(0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="income" className="mr-2">
                                            {t("calculator.income")} ({currency.symbol})
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle className="h-4 w-4 text-gray-400"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{t("calculator.incomeTooltip")}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <MoneyInput
                                        id="income"
                                        value={income}
                                        onChange={setIncome}
                                        placeholder={formatNumber(0)}
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
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <Select
                                                        value={field.type}
                                                        onValueChange={(value) =>
                                                            updateField(field.id, {
                                                                type: value as "percent" | "fixed",
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="text-sm h-8"
                                                                       aria-label={t("calculator.expenseType")}>
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem
                                                                value="percent">{t("calculator.percent")}</SelectItem>
                                                            <SelectItem
                                                                value="fixed">{t("calculator.fixed")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Select
                                                        value={field.period}
                                                        onValueChange={(value) =>
                                                            updateField(field.id, {
                                                                period: value as "annual" | "monthly",
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="text-sm h-8"
                                                                       aria-label={t("calculator.expensePeriod")}>
                                                            <SelectValue/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem
                                                                value="annual">{t("calculator.annual")}</SelectItem>
                                                            <SelectItem
                                                                value="monthly">{t("calculator.monthly")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {field.type === "fixed" ? (
                                                    <MoneyInput
                                                        value={field.value}
                                                        onChange={(v) => updateField(field.id, {value: v})}
                                                        placeholder={t("calculator.expenseValue")}
                                                        className="text-sm h-8"
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder={t("calculator.expenseValue")}
                                                        type="number"
                                                        step="0.01"
                                                        value={field.value}
                                                        onChange={(e) => updateField(field.id, {value: e.target.value})}
                                                        className="text-sm h-8"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center justify-center gap-3 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4">
                                        <p className="text-gray-500 text-sm text-center">{t("calculator.additionalExpensesTooltip")}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={restoreDefaults}
                                            className="hover:bg-teal-50 hover:border-teal-300">
                                            {t("calculator.restoreDefaults")}
                                        </Button>
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

                    <div className="mt-6 flex justify-center">
                        <Button onClick={calculate} size="lg" className="bg-teal-600 hover:bg-teal-700">
                            <CalcIcon className="mr-2 h-5 w-5"/>
                            {t("common.calculate")}
                        </Button>
                    </div>

                    {results.maxPrice && (
                        <div
                            className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                            <h3 className="text-lg font-medium mb-3 text-teal-800 flex items-center">
                                <CalcIcon className="h-5 w-5 mr-2"/>
                                {t("calculator.results")}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">{t("calculator.maxPrice")}</p>
                                    <p className="text-2xl font-bold text-teal-700">
                                        {currency.symbol} {formatNumber(Number.parseFloat(results.maxPrice))}
                                    </p>
                                    {results.maxPrice && Number.parseFloat(results.maxPrice) > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEntry(results.maxPrice)}
                                            className="mt-2 text-teal-700 hover:bg-teal-50 hover:border-teal-300">
                                            {t("calculator.useAsDownPayment")}
                                        </Button>
                                    )}
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                    <p className="text-sm text-gray-600 mb-1">{t("calculator.monthlyPayment")}</p>
                                    <p className="text-2xl font-bold text-teal-700">
                                        {currency.symbol} {formatNumber(Number.parseFloat(results.monthly))}
                                    </p>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                    <div className="flex items-center">
                                        <p className="text-sm text-gray-600 mb-1 mr-1">{t("calculator.cashMaxPrice")}</p>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 mb-1"/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">{t("calculator.cashMaxPriceTooltip")}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <p className="text-2xl font-bold text-teal-700">
                                        {results.cashUnlimited
                                            ? t("calculator.unlimited")
                                            : `${currency.symbol} ${formatNumber(Number.parseFloat(results.cashMaxPrice))}`}
                                    </p>
                                    {!results.cashUnlimited && results.cashMaxPrice && Number.parseFloat(results.cashMaxPrice) > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEntry(results.cashMaxPrice)}
                                            className="mt-2 text-teal-700 hover:bg-teal-50 hover:border-teal-300">
                                            {t("calculator.useAsDownPayment")}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-teal-200">
                                <h4 className="text-sm font-medium text-teal-800 mb-3 flex items-center">
                                    <Wallet className="h-4 w-4 mr-2"/>
                                    {t("calculator.monthlyTotalSpending")}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                        <div className="flex items-center">
                                            <p className="text-sm text-gray-600 mb-1 mr-1">{t("calculator.monthlyTotalDuring")}</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 mb-1"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{t("calculator.monthlyTotalDuringTooltip")}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-2xl font-bold text-teal-700">
                                            {currency.symbol} {formatNumber(Number.parseFloat(results.monthlyDuring))}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {interpolate(t("calculator.monthlyTotalDuringDesc"), {term: results.termUsed})}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                        <div className="flex items-center">
                                            <p className="text-sm text-gray-600 mb-1 mr-1">{t("calculator.monthlyTotalAfter")}</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 mb-1"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{t("calculator.monthlyTotalAfterTooltip")}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-2xl font-bold text-teal-700">
                                            {currency.symbol} {formatNumber(Number.parseFloat(results.monthlyAfter))}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {interpolate(t("calculator.monthlyTotalAfterDesc"), {month: results.termUsed + 1})}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Custos do financiamento */}
                            <div className="mt-4 pt-4 border-t border-teal-200">
                                <h4 className="text-sm font-medium text-teal-800 mb-3 flex items-center">
                                    <Receipt className="h-4 w-4 mr-2"/>
                                    {t("calculator.financingCosts")}
                                </h4>
                                <div className={`grid grid-cols-1 gap-4 ${hasIncome ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                                    <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                        <div className="flex items-center">
                                            <p className="text-sm text-gray-600 mb-1 mr-1">{t("calculator.totalPaid")}</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 mb-1"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{t("calculator.totalPaidTooltip")}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-2xl font-bold text-teal-700">
                                            {currency.symbol} {formatNumber(Number.parseFloat(results.totalPaid))}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                        <div className="flex items-center">
                                            <p className="text-sm text-gray-600 mb-1 mr-1">{t("calculator.totalInterest")}</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 mb-1"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">{t("calculator.totalInterestTooltip")}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <p className="text-2xl font-bold text-teal-700">
                                            {currency.symbol} {formatNumber(Number.parseFloat(results.totalInterest))}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {interpolate(t("calculator.interestShareDesc"), {percent: formatPercent(results.interestPercent)})}
                                        </p>
                                    </div>
                                    {hasIncome && (
                                        <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                            <div className="flex items-center">
                                                <p className="text-sm text-gray-600 mb-1 mr-1">{t("calculator.incomeShareTitle")}</p>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <HelpCircle className="h-3.5 w-3.5 text-gray-400 mb-1"/>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">{t("calculator.incomeShareTooltip")}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="mt-1 space-y-2">
                                                <div>
                                                    <p className="text-xs text-gray-500">{t("calculator.monthlyTotalDuring")}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xl font-bold text-teal-700">{formatPercent(incomeDuringPercent)}</p>
                                                        <IncomeBadge percent={incomeDuringPercent}/>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">{t("calculator.monthlyTotalAfter")}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xl font-bold text-teal-700">{formatPercent(incomeAfterPercent)}</p>
                                                        <IncomeBadge percent={incomeAfterPercent}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Composição do gasto mensal */}
                            <div className="mt-4 pt-4 border-t border-teal-200">
                                <h4 className="text-sm font-medium text-teal-800 mb-3 flex items-center">
                                    <PieChart className="h-4 w-4 mr-2"/>
                                    {t("calculator.monthlyBreakdown")}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-4 w-4 text-gray-400 ml-2"/>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{t("calculator.monthlyBreakdownTooltip")}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm">
                                        <ChartContainer config={chartConfig} className="h-[280px] w-full aspect-auto">
                                            <BarChart data={chartData} margin={{left: 4, right: 8, top: 24, bottom: 4}} barSize={64}>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.6}/>
                                                <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8}/>
                                                <YAxis tickLine={false} axisLine={false} width={48}
                                                       tickFormatter={(value) => formatNumber(value, 0)}/>
                                                <ChartTooltip
                                                    cursor={{fill: "rgba(13, 148, 136, 0.08)"}}
                                                    content={
                                                        <ChartTooltipContent
                                                            formatter={(value: any, name: any, item: any) =>
                                                                renderTooltipRow(Number(value), String(name), item)
                                                            }
                                                        />
                                                    }
                                                />
                                                <Bar dataKey="installment" stackId="a" fill="var(--color-installment)"
                                                     radius={topSeriesKey === "installment" ? [4, 4, 0, 0] : undefined}>
                                                    {topSeriesKey === "installment" && <LabelList content={renderBarTotal}/>}
                                                </Bar>
                                                {results.breakdown.map((item) => (
                                                    <Bar key={item.key} dataKey={item.key} stackId="a"
                                                         fill={`var(--color-${item.key})`}
                                                         radius={item.key === topSeriesKey ? [4, 4, 0, 0] : undefined}>
                                                        {item.key === topSeriesKey && <LabelList content={renderBarTotal}/>}
                                                    </Bar>
                                                ))}
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                    <div className="p-4 bg-white rounded-lg border border-teal-200 shadow-sm overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{t("calculator.expenseColumn")}</TableHead>
                                                    <TableHead className="text-right">
                                                        {t("calculator.monthlyColumn")} ({currency.symbol})
                                                    </TableHead>
                                                    <TableHead className="text-right">{t("calculator.shareColumn")}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Number.parseFloat(results.monthly) > 0 && (
                                                    <TableRow>
                                                        <TableCell className="font-medium">
                                                            <span className="inline-flex items-center gap-2">
                                                                <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{backgroundColor: "#0d9488"}}/>
                                                                {t("calculator.installmentRow")}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatNumber(Number.parseFloat(results.monthly))}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatPercent(totalDuring > 0 ? (Number.parseFloat(results.monthly) / totalDuring) * 100 : 0)}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {results.breakdown.map((item, index) => (
                                                    <TableRow key={item.key}>
                                                        <TableCell className="font-medium">
                                                            <span className="inline-flex items-center gap-2">
                                                                <span
                                                                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                                    style={{backgroundColor: chartColors[index % chartColors.length]}}/>
                                                                {item.name}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">{formatNumber(item.monthly)}</TableCell>
                                                        <TableCell className="text-right">
                                                            {formatPercent(totalDuring > 0 ? (item.monthly / totalDuring) * 100 : 0)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell className="font-semibold">{t("calculator.totalRow")}</TableCell>
                                                    <TableCell className="text-right font-semibold">{formatNumber(totalDuring)}</TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {totalDuring > 0 ? formatPercent(100) : "—"}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
