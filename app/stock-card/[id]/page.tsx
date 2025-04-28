"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import StockCardView from "@/components/stock-card-view"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function StockCardPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    const fetchParams = async () => {
      // Using React.use() to unwrap params
      const resolvedParams = await params
      setId(resolvedParams.id)
    }

    fetchParams()
  }, [params])

  const handleBack = () => {
    router.push("/")
  }

  if (!id) {
    return <div>Loading...</div> // or any loading indicator you prefer
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8 gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Stock Card Details</h1>
        <div className="ml-auto">
          <Link href={`/stock-card/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Stock Card
            </Button>
          </Link>
        </div>
      </div>

      <StockCardView id={id} />
    </main>
  )
}
