"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Eye, X } from "lucide-react"
import { parse, getMonth, getYear } from "date-fns"
import { PreviewModal } from "./preview-modal"

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
        date: "2024-01-10",
        reference: "PO-2024-001",
        receiptQty: 200,
        issueQty: 0,
        issueOffice: "",
        balanceQty: 200,
        daysToConsume: 0,
      },
      {
        id: "t2",
        date: "2024-02-15",
        reference: "REQ-2024-001",
        receiptQty: 0,
        issueQty: 50,
        issueOffice: "Admin Office",
        balanceQty: 150,
        daysToConsume: 30,
      },
      {
        id: "t3",
        date: "2024-03-20",
        reference: "REQ-2024-002",
        receiptQty: 0,
        issueQty: 30,
        issueOffice: "HR Department",
        balanceQty: 120,
        daysToConsume: 20,
      },
      {
        id: "t4",
        date: "2025-01-05",
        reference: "REQ-2025-001",
        receiptQty: 0,
        issueQty: 15,
        issueOffice: "Finance Department",
        balanceQty: 105,
        daysToConsume: 15,
      },
      {
        id: "t5",
        date: "2025-04-25",
        reference: "PO-2025-001",
        receiptQty: 100,
        issueQty: 0,
        issueOffice: "",
        balanceQty: 205,
        daysToConsume: 0,
      },
    ],
  },
  // Other mock items...
]

// Month names for the dropdown
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function StockCardView({ id }: { id: string }) {
  // Find the item with the matching ID
  const item = mockItems.find((item) => item.id === id)
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const years = useMemo(() => {
    const uniqueYears = new Set<string>()

    mockItems.forEach((item) => {
      if (item) {
        item.transactions.forEach((transaction) => {
          const date = parse(transaction.date, "yyyy-MM-dd", new Date())
          const year = getYear(date).toString()
          uniqueYears.add(year)
        })
      }
    })

    return Array.from(uniqueYears).sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)
  }, [])

  // Filter transactions by selected month and year
  const filteredTransactions = useMemo(() => {
    if (!item) return []
    return item.transactions.filter((transaction) => {
      const date = parse(transaction.date, "yyyy-MM-dd", new Date())
      const transactionMonth = (getMonth(date) + 1).toString() // +1 because getMonth is 0-indexed
      const transactionYear = getYear(date).toString()

      const monthMatches = selectedMonth === "all" || transactionMonth === selectedMonth
      const yearMatches = selectedYear === "all" || transactionYear === selectedYear

      return monthMatches && yearMatches
    })
  }, [item, selectedMonth, selectedYear])

  // Clear all filters
  const clearFilters = () => {
    setSelectedMonth("all")
    setSelectedYear("all")
  }

  // Check if any filter is active
  const isFilterActive = selectedMonth !== "all" || selectedYear !== "all"

  if (!item) {
    return <div className="text-center py-8">Stock card not found</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">STOCK CARD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Entity Name:</p>
              <p className="font-medium">{item.entityName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fund Cluster:</p>
              <p className="font-medium">{item.fundCluster}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Item:</p>
                <p className="font-medium">{item.item}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description:</p>
                <p className="font-medium">{item.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit of Measurement:</p>
                <p className="font-medium">{item.unitOfMeasurement}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Stock No.:</p>
                <p className="font-medium">{item.stockNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Re-order Point:</p>
                <p className="font-medium">{item.reorderPoint}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance:</p>
                <p className="font-medium">{item.currentBalance}</p>
              </div>
            </div>
          </div>

          {/* Add the preview button */}
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthNames.map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isFilterActive && (
              <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell className="text-center">{transaction.receiptQty}</TableCell>
                      <TableCell className="text-center">{transaction.issueQty}</TableCell>
                      <TableCell>{transaction.issueOffice}</TableCell>
                      <TableCell className="text-center">{transaction.balanceQty}</TableCell>
                      <TableCell className="text-center">{transaction.daysToConsume}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No transactions found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} stockCardData={item} />
      )}
    </div>
  )
}
