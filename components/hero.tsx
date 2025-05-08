"use client"

import {Button} from "@/components/ui/button"
import {ChevronRight} from "lucide-react"
import {useI18n} from "@/lib/i18n/context"

export function Hero() {
    const {t} = useI18n()

    return (
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-black opacity-50"
                    style={{
                        backgroundImage: "url('/car-sales.webp?height=800&width=1600')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(12px)"
                    }}
                ></div>
            </div>

            <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("hero.title")}</h1>
                    <p className="text-lg md:text-xl mb-8 text-gray-200">{t("hero.subtitle")}</p>
                    <div>
                        <Button
                            size="lg"
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => {
                                document.getElementById("plan")?.scrollIntoView({behavior: "smooth"})
                            }}
                        >
                            {t("common.simulateNow")}
                            <ChevronRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
