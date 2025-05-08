"use client"

import { Calculator } from "@/components/calculator"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { useI18n } from "@/lib/i18n/context"

export default function Home() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <div id="plan" className="container mx-auto px-4 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{t("page.planTitle")}</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">{t("page.planSubtitle")}</p>
        <Calculator />
      </div>
      <Features />
      <Footer />
    </div>
  )
}
