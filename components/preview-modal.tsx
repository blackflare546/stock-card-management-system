"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockCardData: {
    id: string;
    entityName: string;
    fundCluster: string;
    item: string;
    stockNo: string;
    description: string;
    unitOfMeasurement: string;
    reorderPoint: string;
    transactions: {
      id: string;
      date: string;
      reference: string;
      receiptQty: number;
      issueQty: number;
      issueOffice: string;
      balanceQty: number;
      daysToConsume: number;
    }[];
  };
}

export function PreviewModal({
  isOpen,
  onClose,
  stockCardData,
}: PreviewModalProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF...",
      });

      const element = document.getElementById("preview-stock-card");
      if (!element) {
        throw new Error("Preview element not found");
      }

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = "190mm";
      clone.style.height = "277mm";
      clone.style.padding = "10mm";
      clone.style.boxSizing = "border-box";
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.fontFamily = "'Times New Roman', Times, serif";

      document.body.appendChild(clone);

      try {
        const canvas = await html2canvas(clone, {
          scale: 3, // higher = sharper
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          backgroundColor: "#ffffff", // ensure white bg
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save(`stock-card-${stockCardData.item}.pdf`);

        toast({
          title: "PDF Downloaded",
          description: "Your stock card has been downloaded successfully.",
        });
      } finally {
        document.body.removeChild(clone);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description:
          "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getEmptyRowsCount = () => {
    const minRows = 25; // Ensure enough rows to make table extend properly
    const currentRows = stockCardData.transactions.length;
    return Math.max(0, minRows - currentRows);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Stock Card Preview</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Stock Card Preview */}
        <div
          id="preview-stock-card"
          className="bg-white p-4 border rounded mx-auto"
          style={{
            width: "190mm",
            height: "277mm",
            padding: "10mm",
            boxSizing: "border-box",
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="text-right italic text-[12px]">Appendix 58</div>

          <div className="text-center font-bold my-2 text-lg ">STOCK CARD</div>

          <div className="flex justify-between text-[12px] mb-2 mt-5">
            <div>
              <span className="font-bold">Entity Name:</span>{" "}
              <u> {stockCardData.entityName} </u>
            </div>
            <div>
              <span className="font-bold">Fund Cluster:</span>{" "}
              <u> {stockCardData.fundCluster} </u>
            </div>
          </div>

          <table className="w-full text-[12px] border-collapse">
            <tbody>
              <tr>
                <td className="border border-black p-2 w-1/2">
                  <span className="font-bold">Item :</span> {stockCardData.item}
                </td>
                <td className="border border-black p-2 w-1/2">
                  <span className="font-bold">Stock No. :</span>{" "}
                  {stockCardData.stockNo}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2">
                  <span className="font-bold">Description :</span>{" "}
                  {stockCardData.description}
                </td>
                <td className="border border-black p-2">
                  <span className="font-bold">Re-order Point :</span>{" "}
                  {stockCardData.reorderPoint}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2">
                  <span className="font-bold">Unit of Measurement :</span>{" "}
                  {stockCardData.unitOfMeasurement}
                </td>
                <td className="border border-black p-2"></td>
              </tr>
            </tbody>
          </table>

          {/* Transaction Table */}
          <div className="flex-1 flex flex-col">
            <table className="w-full text-[12px] border border-black text-center">
              <thead>
                <tr>
                  <th className="border border-black p-1" rowSpan={2}>
                    Date
                  </th>
                  <th className="border border-black p-1" rowSpan={2}>
                    Reference
                  </th>
                  <th className="border border-black p-1 italic">Receipt</th>
                  <th className="border border-black p-1 italic" colSpan={2}>
                    Issue
                  </th>
                  <th className="border border-black p-1 italic">Balance</th>
                  <th className="border border-black p-1" rowSpan={2}>
                    Days to Consume
                  </th>
                </tr>
                <tr>
                  <th className="border border-black p-1">Qty.</th>
                  <th className="border border-black p-1">Qty.</th>
                  <th className="border border-black p-1">Office</th>
                  <th className="border border-black p-1">Qty.</th>
                </tr>
              </thead>
              <tbody>
                {stockCardData.transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="border border-black p-1 text-center align-middle">
                      {t.date}
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      {t.reference}
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      {t.receiptQty}
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      {t.issueQty}
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      {t.issueOffice}
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      {t.balanceQty}
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      {t.daysToConsume}
                    </td>
                  </tr>
                ))}

                {/* Empty rows */}
                {Array.from({ length: getEmptyRowsCount() }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border border-black p-1 text-center align-middle">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      &nbsp;
                    </td>
                    <td className="border border-black p-1 text-center align-middle">
                      &nbsp;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button size="sm" onClick={handleDownloadPDF} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
