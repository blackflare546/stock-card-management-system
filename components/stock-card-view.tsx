"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { parse, getMonth, getYear } from "date-fns";
import { PreviewModal } from "./preview-modal";
import { supabase } from "@/lib/supabaseClient"; // adjust path as needed

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
];

type Transaction = {
  id: string;
  date: string;
  month: string;
  year: string;
  reference: string;
  receiptQty: number;
  issueQty: number;
  issueOffice: string;
  balanceQty: number;
  daysToConsume: number;
};

type StockItem = {
  id: string;
  entityName: string;
  fundCluster: string;
  item: string;
  stockNo: string;
  description: string;
  unitOfMeasurement: string;
  reorderPoint: string;
  currentBalance: number;
  lastUpdated: string;
  transactions: Transaction[];
};

export default function StockCardView({ id }: { id: string }) {
  const [item, setItem] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchStockCard = async () => {
      setLoading(true);

      // 1) fetch the stock_card row
      const { data: card, error: cardError } = await supabase
        .from("stock_cards")
        .select("*")
        .eq("id", id)
        .single();

      if (cardError || !card) {
        console.error("Error fetching stock_card:", cardError?.message);
        setItem(null);
        setLoading(false);
        return;
      }

      // 2) fetch related transactions
      const { data: txs, error: txError } = await supabase
        .from("stock_transactions")
        .select("*")
        .eq("stock_card_id", id)
        .order("date", { ascending: true });

      if (txError) {
        console.error("Error fetching transactions:", txError.message);
      }

      const mappedTxs: Transaction[] = (txs || []).map((t) => ({
        id: t.id,
        date: t.date,
        month: t.month,
        year: t.year,
        reference: t.reference,
        receiptQty: t.receipt_qty,
        issueQty: t.issue_qty,
        issueOffice: t.issue_office,
        balanceQty: t.balance_qty,
        daysToConsume: t.days_to_consume,
      }));

      // derive currentBalance & lastUpdated
      let currentBalance = 0;
      let lastUpdated = card.created_at.slice(0, 10); // default to created date
      if (mappedTxs.length > 0) {
        const lastTx = mappedTxs[mappedTxs.length - 1];
        currentBalance = lastTx.balanceQty;
        lastUpdated = lastTx.date;
      }

      setItem({
        id: card.id,
        entityName: card.entity_name,
        fundCluster: card.fund_cluster,
        item: card.item,
        stockNo: card.stock_no,
        description: card.description,
        unitOfMeasurement: card.unit_of_measurement,
        reorderPoint: card.reorder_point,
        currentBalance,
        lastUpdated,
        transactions: mappedTxs,
      });

      setLoading(false);
    };

    fetchStockCard();
  }, [id]);

  // collect unique years for filter dropdown
  const years = useMemo(() => {
    if (!item) return [];
    const ys = new Set(
      item.transactions.map((tx) =>
        getYear(parse(tx.date, "yyyy-MM-dd", new Date())).toString()
      )
    );
    return Array.from(ys).sort((a, b) => b.localeCompare(a));
  }, [item]);

  // apply month/year filters
  const filteredTransactions = useMemo(() => {
    if (!item) return [];
    return item.transactions.filter((tx) => {
      const date = parse(tx.date, "yyyy-MM-dd", new Date());
      const mon = (getMonth(date) + 1).toString();
      const yr = getYear(date).toString();
      const okMonth = selectedMonth === "all" || mon === selectedMonth;
      const okYear = selectedYear === "all" || yr === selectedYear;
      return okMonth && okYear;
    });
  }, [item, selectedMonth, selectedYear]);

  const clearFilters = () => {
    setSelectedMonth("all");
    setSelectedYear("all");
  };
  const isFilterActive = selectedMonth !== "all" || selectedYear !== "all";

  if (loading) return <div className="text-center py-8">Loading…</div>;
  if (!item)
    return <div className="text-center py-8">Stock card not found</div>;

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
                <p className="text-sm text-muted-foreground">
                  Unit of Measurement:
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Current Balance:
                </p>
                <p className="font-medium">{item.currentBalance}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated:</p>
                <p className="font-medium">{item.lastUpdated}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {monthNames.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {m}
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
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isFilterActive && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearFilters}
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-center">Receipt Qty.</TableHead>
                  <TableHead className="text-center">Issue Qty.</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead className="text-center">Balance Qty.</TableHead>
                  <TableHead className="text-center">Days to Consume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>{tx.month}</TableCell>
                        <TableCell>{tx.year}</TableCell>
                        <TableCell>{tx.reference}</TableCell>
                        <TableCell className="text-center">
                          {tx.receiptQty}
                        </TableCell>
                        <TableCell className="text-center">
                          {tx.issueQty}
                        </TableCell>
                        <TableCell>{tx.issueOffice}</TableCell>
                        <TableCell className="text-center">
                          {tx.balanceQty}
                        </TableCell>
                        <TableCell className="text-center">
                          {tx.daysToConsume}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isPreviewOpen && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          stockCardData={item}
          filteredTransactions={filteredTransactions}
        />
      )}
    </div>
  );
}
