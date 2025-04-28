"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mock data - in a real app, this would come from a database
const mockItems = [
  {
    id: "1",
    entityName: "Department of Education",
    fundCluster: "General Fund",
    item: "Ballpoint Pen",
    stockNo: "S-001",
    description: "Blue ballpoint pen, medium point",
    unitOfMeasurement: "piece",
    reorderPoint: "50",
    currentBalance: 120,
    lastUpdated: "2025-04-25",
  },
  {
    id: "2",
    entityName: "Department of Education",
    fundCluster: "General Fund",
    item: "A4 Paper",
    stockNo: "S-002",
    description: "A4 size copy paper, 80gsm",
    unitOfMeasurement: "ream",
    reorderPoint: "20",
    currentBalance: 15,
    lastUpdated: "2025-04-26",
  },
  {
    id: "3",
    entityName: "Department of Health",
    fundCluster: "Special Fund",
    item: "Face Mask",
    stockNo: "S-003",
    description: "Disposable 3-ply face mask",
    unitOfMeasurement: "box",
    reorderPoint: "10",
    currentBalance: 25,
    lastUpdated: "2025-04-27",
  },
  {
    id: "4",
    entityName: "Department of Health",
    fundCluster: "Special Fund",
    item: "Hand Sanitizer",
    stockNo: "S-004",
    description: "70% alcohol hand sanitizer, 500ml",
    unitOfMeasurement: "bottle",
    reorderPoint: "15",
    currentBalance: 8,
    lastUpdated: "2025-04-28",
  },
]

export default function StockItemsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Filter items based on search term
  const filteredItems = mockItems.filter(
    (item) =>
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stockNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entityName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const confirmDelete = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    try {
      // In a real app, this would delete from the database
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const itemName = mockItems.find((item) => item.id === itemToDelete)?.item || "Item"

      toast({
        title: "Item deleted",
        description: `${itemName} has been successfully removed.`,
      })

      setDeleteDialogOpen(false)
      setItemToDelete(null)

      // In a real app, you would refresh the data here
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem deleting the item. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items by name, stock number, or description..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Stock No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-center">Current Balance</TableHead>
                  <TableHead className="text-center">Last Updated</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.stockNo}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.unitOfMeasurement}</TableCell>
                      <TableCell className="text-center">{item.currentBalance}</TableCell>
                      <TableCell className="text-center">{item.lastUpdated}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/stock-card/${item.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/stock-card/${item.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No items found. Try a different search term or add a new stock card.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the stock card and all its transaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
