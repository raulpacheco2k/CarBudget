"use client"

import Link from "next/link"
import { BarChart2, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BarChart2 className="h-6 w-6 text-teal-500" />
              <span className="text-xl font-bold text-white">CarBudget</span>
            </div>
            <p className="mb-4">{t("footer.helpText")}</p>
            {/*<div className="flex space-x-4">*/}
            {/*  <Link href="#" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Facebook className="h-5 w-5" />*/}
            {/*  </Link>*/}
            {/*  <Link href="#" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Instagram className="h-5 w-5" />*/}
            {/*  </Link>*/}
            {/*  <Link href="#" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Twitter className="h-5 w-5" />*/}
            {/*  </Link>*/}
            {/*  <Link href="#" className="text-gray-400 hover:text-white transition-colors">*/}
            {/*    <Youtube className="h-5 w-5" />*/}
            {/*  </Link>*/}
            {/*</div>*/}
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  {t("common.home")}
                </Link>
              </li>
              <li>
                <Link href="#calculator" className="hover:text-white transition-colors">
                  {t("common.calculator")}
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  {t("common.advantages")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3">
              <p>Me envie um feedback sobre a calculadora pelo e-mail abaixo</p>
              {/*<li className="flex items-start">*/}
              {/*  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-teal-500" />*/}
              {/*  <span>*/}
              {/*    Av. Paulista, 1000*/}
              {/*    <br />*/}
              {/*    São Paulo, SP*/}
              {/*  </span>*/}
              {/*</li>*/}
              {/*<li className="flex items-center">*/}
              {/*  <Phone className="h-5 w-5 mr-2 text-teal-500" />*/}
              {/*  <span>(11) 3456-7890</span>*/}
              {/*</li>*/}
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-teal-500" />
                <span>contato@raulpacheco.com.br</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm">
          <p>
            © {new Date().getFullYear()} CarBudget. {t("footer.allRightsReserved")}.
            <br className="md:hidden" />
            <span className="md:ml-2">
              {t("footer.createdWith")}{" "}
              <Link
                href="https://github.com/raulpacheco2k"
                target="_blank"
                className="text-teal-400 hover:text-teal-300 transition-colors"
              >
                raulpacheco2k
              </Link>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
