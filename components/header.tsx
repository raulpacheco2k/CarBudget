"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart2, Menu, X } from "lucide-react"
import { useState } from "react"
import { LanguageSelector } from "./language-selector"
import { useI18n } from "@/lib/i18n/context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BarChart2 className="h-6 w-6 text-teal-600" />
          <span className="text-xl font-bold">CarBudget</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="#" className="text-sm font-medium hover:text-teal-600 transition-colors">
            {t("common.home")}
          </Link>
          <Link href="#features" className="text-sm font-medium hover:text-teal-600 transition-colors">
            {t("common.advantages")}
          </Link>
          <Button
            variant="default"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            {t("common.calculator")}
          </Button>
          <LanguageSelector />
        </nav>

        <div className="flex items-center md:hidden">
          <LanguageSelector />
          <button className="ml-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden container mx-auto px-4 py-4 bg-white border-t">
          <nav className="flex flex-col space-y-4">
            <Link href="#" className="text-sm font-medium hover:text-teal-600 transition-colors">
              {t("common.home")}
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-teal-600 transition-colors">
              {t("common.advantages")}
            </Link>
            <Button
              variant="default"
              className="bg-teal-600 hover:bg-teal-700 w-full"
              onClick={() => {
                document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" })
                setIsMenuOpen(false)
              }}
            >
              {t("common.calculator")}
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
