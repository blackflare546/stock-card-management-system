"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import StockCardForm from "@/components/stock-card-form"
import { useRouter } from "next/navigation"

export default function NewStockCardPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/")
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8 gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">New Stock Card</h1>
      </div>

      <StockCardForm />
    </main>
  )
}
