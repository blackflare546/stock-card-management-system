import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import StockItemsList from "@/components/stock-items-list"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">STOCK CARD MANAGEMENT SYSTEM</h1>
        <Link href="/stock-card/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Stock Card
          </Button>
        </Link>
      </div>

      <StockItemsList />
    </main>
  )
}
