"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Printer, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  stockCardData: {
    id: string
    entityName: string
    fundCluster: string
    item: string
    stockNo: string
    description: string
    unitOfMeasurement: string
    reorderPoint: string
    transactions: {
      id: string
      date: string
      reference: string
      receiptQty: number
      issueQty: number
      issueOffice: string
      balanceQty: number
      daysToConsume: number
    }[]
  }
}

export function PreviewModal({ isOpen, onClose, stockCardData }: PreviewModalProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your popup blocker settings.",
        variant: "destructive",
      })
      return
    }

    // Get the HTML content
    const printContent = document.getElementById("preview-stock-card")
    if (!printContent) return

    // Write to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stock Card - ${stockCardData.item}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .appendix {
              text-align: right;
              margin-bottom: 20px;
              font-size: 12px;
            }
            .title {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin: 30px 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .header-item {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              font-weight: bold;
            }
            .center {
              text-align: center;
            }
            .italic {
              font-style: italic;
            }
            .col-group {
              text-align: center;
            }
            .col-header {
              border-bottom: none;
            }
            .subcol-header {
              border-top: none;
            }
            @media print {
              @page {
                size: landscape;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF...",
      })

      const element = document.getElementById("preview-stock-card")
      if (!element) {
        throw new Error("Preview element not found")
      }

      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement
      clone.style.width = "1000px" // Set a fixed width for better PDF quality
      clone.style.padding = "20px"

      // Temporarily append to the document but hide it
      clone.style.position = "absolute"
      clone.style.left = "-9999px"
      document.body.appendChild(clone)

      try {
        // Generate canvas from the element
        const canvas = await html2canvas(clone, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          allowTaint: true,
        })

        // Create PDF
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        })

        const imgWidth = 277 // A4 landscape width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight)
        pdf.save(`stock-card-${stockCardData.item}.pdf`)

        toast({
          title: "PDF Downloaded",
          description: "Your stock card has been downloaded successfully.",
        })
      } finally {
        // Clean up
        document.body.removeChild(clone)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadExcel = () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()

      // Create header data
      const headerData = [
        ["STOCK CARD"],
        [""],
        [`Entity Name: ${stockCardData.entityName}`, `Fund Cluster: ${stockCardData.fundCluster}`],
        [""],
        [`Item: ${stockCardData.item}`, `Stock No.: ${stockCardData.stockNo}`],
        [`Description: ${stockCardData.description}`, `Re-order Point: ${stockCardData.reorderPoint}`],
        [`Unit of Measurement: ${stockCardData.unitOfMeasurement}`],
        [""],
        ["Date", "Reference", "Receipt Qty.", "Issue Qty.", "Office", "Balance Qty.", "No. of Days to Consume"],
      ]

      // Add transaction data
      const transactionData = stockCardData.transactions.map((t) => [
        t.date,
        t.reference,
        t.receiptQty,
        t.issueQty,
        t.issueOffice,
        t.balanceQty,
        t.daysToConsume,
      ])

      // Combine all data
      const allData = [...headerData, ...transactionData]

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(allData)

      // Set column widths
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 15 }, // Reference
        { wch: 12 }, // Receipt Qty
        { wch: 12 }, // Issue Qty
        { wch: 20 }, // Office
        { wch: 12 }, // Balance Qty
        { wch: 20 }, // Days to Consume
      ]
      ws["!cols"] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Stock Card")

      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `stock-card-${stockCardData.id}.xlsx`)

      toast({
        title: "Excel Downloaded",
        description: "Your stock card has been downloaded as an Excel file.",
      })
    } catch (error) {
      console.error("Error generating Excel:", error)
      toast({
        title: "Error",
        description: "There was a problem generating the Excel file. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Stock Card Preview</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} disabled={isGenerating}>
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? "Generating..." : "PDF"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div id="preview-stock-card" className="bg-white p-4 border rounded">
          <div className="text-right text-sm">Appendix 58</div>

          <div className="text-center font-bold text-2xl my-8">STOCK CARD</div>

          <div className="flex justify-between mb-6">
            <div>
              <span className="font-bold">Entity Name:</span> {stockCardData.entityName}
            </div>
            <div>
              <span className="font-bold">Fund Cluster:</span> {stockCardData.fundCluster}
            </div>
          </div>

          <table className="w-full border-collapse mb-0">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-1/2">
                  <span className="font-bold">Item :</span> {stockCardData.item}
                </td>
                <td className="border border-black p-2 w-1/2">
                  <span className="font-bold">Stock No. :</span> {stockCardData.stockNo}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2">
                  <span className="font-bold">Description :</span> {stockCardData.description}
                </td>
                <td className="border border-black p-2">
                  <span className="font-bold">Re-order Point :</span> {stockCardData.reorderPoint}
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="border border-black p-2">
                  <span className="font-bold">Unit of Measurement :</span> {stockCardData.unitOfMeasurement}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse mt-0">
            <thead>
              <tr>
                <th className="border border-black p-2 text-center" rowSpan={2}>
                  Date
                </th>
                <th className="border border-black p-2 text-center" rowSpan={2}>
                  Reference
                </th>
                <th className="border border-black p-2 text-center col-header">
                  <span className="italic">Receipt</span>
                </th>
                <th className="border border-black p-2 text-center col-header" colSpan={2}>
                  <span className="italic">Issue</span>
                </th>
                <th className="border border-black p-2 text-center col-header">
                  <span className="italic">Balance</span>
                </th>
                <th className="border border-black p-2 text-center" rowSpan={2}>
                  No. of Days to Consume
                </th>
              </tr>
              <tr>
                <th className="border border-black p-2 text-center subcol-header">Qty.</th>
                <th className="border border-black p-2 text-center subcol-header">Qty.</th>
                <th className="border border-black p-2 text-center subcol-header">Office</th>
                <th className="border border-black p-2 text-center subcol-header">Qty.</th>
              </tr>
            </thead>
            <tbody>
              {stockCardData.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="border border-black p-2 text-center">{transaction.date}</td>
                  <td className="border border-black p-2 text-center">{transaction.reference}</td>
                  <td className="border border-black p-2 text-center">{transaction.receiptQty}</td>
                  <td className="border border-black p-2 text-center">{transaction.issueQty}</td>
                  <td className="border border-black p-2">{transaction.issueOffice}</td>
                  <td className="border border-black p-2 text-center">{transaction.balanceQty}</td>
                  <td className="border border-black p-2 text-center">{transaction.daysToConsume}</td>
                </tr>
              ))}
              {/* Add empty rows to match the template */}
              {Array.from({ length: Math.max(0, 10 - stockCardData.transactions.length) }).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                  <td className="border border-black p-2">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
