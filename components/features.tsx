"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Calculator, DollarSign, PiggyBank, Shield, Zap } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export function Features() {
  const { t } = useI18n()

  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.title")}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("features.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <Calculator className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>{t("features.realisticBudget.title")}</CardTitle>
              <CardDescription>{t("features.realisticBudget.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("features.realisticBudget.description")}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <PiggyBank className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>{t("features.financialHealth.title")}</CardTitle>
              <CardDescription>{t("features.financialHealth.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("features.financialHealth.description")}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <BarChart2 className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>{t("features.smartSimulations.title")}</CardTitle>
              <CardDescription>{t("features.smartSimulations.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("features.smartSimulations.description")}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <Shield className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>{t("features.debtProtection.title")}</CardTitle>
              <CardDescription>{t("features.debtProtection.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("features.debtProtection.description")}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <DollarSign className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>{t("features.negotiationPower.title")}</CardTitle>
              <CardDescription>{t("features.negotiationPower.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("features.negotiationPower.description")}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <Zap className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>{t("features.consciousDecisions.title")}</CardTitle>
              <CardDescription>{t("features.consciousDecisions.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t("features.consciousDecisions.description")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
