"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Save, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ItemHeader {
  entityName: string
  fundCluster: string
  item: string
  stockNo: string
  description: string
  unitOfMeasurement: string
  reorderPoint: string
}

interface ItemTransaction {
  id: string
  date: string
  reference: string
  receiptQty: number
  issueQty: number
  issueOffice: string
  balanceQty: number
  daysToConsume: number
}

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
    transactions: [
      {
        id: "t1",
        date: "2025-04-10",
        reference: "PO-2025-001",
        receiptQty: 200,
        issueQty: 0,
        issueOffice: "",
        balanceQty: 200,
        daysToConsume: 0,
      },
      {
        id: "t2",
        date: "2025-04-15",
        reference: "REQ-2025-001",
        receiptQty: 0,
        issueQty: 50,
        issueOffice: "Admin Office",
        balanceQty: 150,
        daysToConsume: 30,
      },
      {
        id: "t3",
        date: "2025-04-20",
        reference: "REQ-2025-002",
        receiptQty: 0,
        issueQty: 30,
        issueOffice: "HR Department",
        balanceQty: 120,
        daysToConsume: 20,
      },
    ],
  },
  // Other mock items...
]

export default function StockCardForm({ id }: { id?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditMode = !!id

  const [itemHeader, setItemHeader] = useState<ItemHeader>({
    entityName: "",
    fundCluster: "",
    item: "",
    stockNo: "",
    description: "",
    unitOfMeasurement: "",
    reorderPoint: "",
  })

  const [transactions, setTransactions] = useState<ItemTransaction[]>([])
  const [newTransaction, setNewTransaction] = useState<Omit<ItemTransaction, "id">>({
    date: format(new Date(), "yyyy-MM-dd"),
    reference: "",
    receiptQty: 0,
    issueQty: 0,
    issueOffice: "",
    balanceQty: 0,
    daysToConsume: 0,
  })

  const [isSaving, setIsSaving] = useState(false)

  // Load data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const item = mockItems.find((item) => item.id === id)
      if (item) {
        setItemHeader({
          entityName: item.entityName,
          fundCluster: item.fundCluster,
          item: item.item,
          stockNo: item.stockNo,
          description: item.description,
          unitOfMeasurement: item.unitOfMeasurement,
          reorderPoint: item.reorderPoint,
        })
        setTransactions(item.transactions)
      }
    }
  }, [id, isEditMode])

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setItemHeader((prev) => ({ ...prev, [name]: value }))
  }

  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTransaction((prev) => ({
      ...prev,
      [name]: name === "date" ? value : name === "reference" || name === "issueOffice" ? value : Number(value),
    }))
  }

  const addTransaction = () => {
    const transaction: ItemTransaction = {
      id: Date.now().toString(),
      ...newTransaction,
    }

    setTransactions([...transactions, transaction])

    // Reset form except for date
    setNewTransaction({
      date: newTransaction.date,
      reference: "",
      receiptQty: 0,
      issueQty: 0,
      issueOffice: "",
      balanceQty: 0,
      daysToConsume: 0,
    })

    toast({
      title: "Transaction added",
      description: "The transaction has been added to the stock card.",
    })
  }

  const removeTransaction = (id: string) => {
    // Remove the transaction with the given ID
    const updatedTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(updatedTransactions)

    toast({
      title: "Transaction removed",
      description: "The transaction has been removed from the stock card.",
    })
  }

  const saveStockCard = async () => {
    // Validate required fields
    if (!itemHeader.item) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // In a real application, this would save to a database
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Saving stock card:", { itemHeader, transactions })

      toast({
        title: isEditMode ? "Stock card updated" : "Stock card created",
        description: isEditMode
          ? `${itemHeader.item} has been successfully updated.`
          : `${itemHeader.item} has been successfully added to your inventory.`,
      })

      // Always navigate back to the home page after saving
      setTimeout(() => {
        router.push("/")
      }, 500)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving the stock card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">STOCK CARD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="entityName">Entity Name:</Label>
              <Input id="entityName" name="entityName" value={itemHeader.entityName} onChange={handleHeaderChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundCluster">Fund Cluster:</Label>
              <Input id="fundCluster" name="fundCluster" value={itemHeader.fundCluster} onChange={handleHeaderChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item">
                  Item:<span className="text-red-500">*</span>
                </Label>
                <Input id="item" name="item" value={itemHeader.item} onChange={handleHeaderChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description:</Label>
                <Input
                  id="description"
                  name="description"
                  value={itemHeader.description}
                  onChange={handleHeaderChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitOfMeasurement">Unit of Measurement:</Label>
                <Input
                  id="unitOfMeasurement"
                  name="unitOfMeasurement"
                  value={itemHeader.unitOfMeasurement}
                  onChange={handleHeaderChange}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stockNo">Stock No.:</Label>
                <Input id="stockNo" name="stockNo" value={itemHeader.stockNo} onChange={handleHeaderChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderPoint">Re-order Point:</Label>
                <Input
                  id="reorderPoint"
                  name="reorderPoint"
                  value={itemHeader.reorderPoint}
                  onChange={handleHeaderChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-center">Receipt Qty.</TableHead>
                  <TableHead className="text-center">Issue Qty.</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead className="text-center">Balance Qty.</TableHead>
                  <TableHead className="text-center">No. of Days to Consume</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                    <TableCell className="text-center">{transaction.receiptQty}</TableCell>
                    <TableCell className="text-center">{transaction.issueQty}</TableCell>
                    <TableCell>{transaction.issueOffice}</TableCell>
                    <TableCell className="text-center">{transaction.balanceQty}</TableCell>
                    <TableCell className="text-center">{transaction.daysToConsume}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => removeTransaction(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Input type="date" name="date" value={newTransaction.date} onChange={handleTransactionChange} />
                  </TableCell>
                  <TableCell>
                    <Input
                      name="reference"
                      value={newTransaction.reference}
                      onChange={handleTransactionChange}
                      placeholder="Reference"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="receiptQty"
                      value={newTransaction.receiptQty}
                      onChange={handleTransactionChange}
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="issueQty"
                      value={newTransaction.issueQty}
                      onChange={handleTransactionChange}
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      name="issueOffice"
                      value={newTransaction.issueOffice}
                      onChange={handleTransactionChange}
                      placeholder="Office"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="balanceQty"
                      value={newTransaction.balanceQty}
                      onChange={handleTransactionChange}
                      min="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="daysToConsume"
                      value={newTransaction.daysToConsume}
                      onChange={handleTransactionChange}
                      min="0"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={addTransaction}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveStockCard} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : isEditMode ? "Update Stock Card" : "Save Stock Card"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
