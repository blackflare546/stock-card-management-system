"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

interface ItemHeader {
  entityName: string;
  fundCluster: string;
  item: string;
  stockNo: string;
  description: string;
  unitOfMeasurement: string;
  reorderPoint: string;
}

interface ItemTransaction {
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
}

export default function StockCardForm({ id }: { id?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [itemHeader, setItemHeader] = useState<ItemHeader>({
    entityName: "",
    fundCluster: "",
    item: "",
    stockNo: "",
    description: "",
    unitOfMeasurement: "",
    reorderPoint: "",
  });

  const [transactions, setTransactions] = useState<ItemTransaction[]>([]);

  const [newTransaction, setNewTransaction] = useState<
    Omit<ItemTransaction, "id">
  >({
    date: format(new Date(), "yyyy-MM-dd"),
    month: "January",
    year: new Date().getFullYear().toString(),
    reference: "",
    receiptQty: 0,
    issueQty: 0,
    issueOffice: "",
    balanceQty: 0,
    daysToConsume: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load stock card and transactions if editing
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: stockCard, error } = await supabase
        .from("stock_cards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load stock card.",
          variant: "destructive",
        });
        return;
      }

      if (stockCard) {
        setItemHeader({
          entityName: stockCard.entity_name,
          fundCluster: stockCard.fund_cluster,
          item: stockCard.item,
          stockNo: stockCard.stock_no,
          description: stockCard.description,
          unitOfMeasurement: stockCard.unit_of_measurement,
          reorderPoint: stockCard.reorder_point,
        });

        const { data: stockTransactions, error: transactionsError } =
          await supabase
            .from("stock_transactions")
            .select("*")
            .eq("stock_card_id", id);

        if (transactionsError) {
          console.error(transactionsError);
          return;
        }

        if (stockTransactions) {
          setTransactions(
            stockTransactions.map((t) => ({
              id: t.id,
              date: t.date,
              reference: t.reference,
              receiptQty: t.receipt_qty,
              issueQty: t.issue_qty,
              issueOffice: t.issue_office,
              balanceQty: t.balance_qty,
              daysToConsume: t.days_to_consume,
              month: t.month,
              year: t.year,
            }))
          );
        }
      }
    };

    fetchData();
  }, [id]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItemHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransactionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({
      ...prev,
      [name]:
        name === "receiptQty" ||
        name === "issueQty" ||
        name === "balanceQty" ||
        name === "daysToConsume"
          ? Number(value)
          : value,
    }));
  };

  const addTransaction = () => {
    const transaction: ItemTransaction = {
      id: uuidv4(),
      ...newTransaction,
    };

    setTransactions([...transactions, transaction]);

    setNewTransaction({
      date: newTransaction.date,
      reference: "",
      receiptQty: 0,
      issueQty: 0,
      issueOffice: "",
      balanceQty: 0,
      daysToConsume: 0,
      year: "",
      month: "",
    });

    toast({
      title: "Transaction added",
      description: "The transaction has been added to the stock card.",
    });
  };

  const removeTransaction = (id: string) => {
    const updatedTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(updatedTransactions);

    toast({
      title: "Transaction removed",
      description: "The transaction has been removed.",
    });
  };

  const saveStockCard = async () => {
    if (!itemHeader.item) {
      toast({
        title: "Missing information",
        description: "Please fill in required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let stockCardId = id ?? uuidv4();

      if (!id) {
        const { error: insertError } = await supabase
          .from("stock_cards")
          .insert({
            id: stockCardId,
            entity_name: itemHeader.entityName,
            fund_cluster: itemHeader.fundCluster,
            item: itemHeader.item,
            stock_no: itemHeader.stockNo,
            description: itemHeader.description,
            unit_of_measurement: itemHeader.unitOfMeasurement,
            reorder_point: itemHeader.reorderPoint,
          });

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("stock_cards")
          .update({
            entity_name: itemHeader.entityName,
            fund_cluster: itemHeader.fundCluster,
            item: itemHeader.item,
            stock_no: itemHeader.stockNo,
            description: itemHeader.description,
            unit_of_measurement: itemHeader.unitOfMeasurement,
            reorder_point: itemHeader.reorderPoint,
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // Delete old transactions
        await supabase
          .from("stock_transactions")
          .delete()
          .eq("stock_card_id", id);
      }

      const transactionData = transactions.map((t) => ({
        id: t.id,
        stock_card_id: stockCardId,
        date: t.date,
        month: t.month,
        year: t.year,
        reference: t.reference,
        receipt_qty: t.receiptQty,
        issue_qty: t.issueQty,
        issue_office: t.issueOffice,
        balance_qty: t.balanceQty,
        days_to_consume: t.daysToConsume,
      }));

      if (transactionData.length > 0) {
        const { error: insertTransactionsError } = await supabase
          .from("stock_transactions")
          .insert(transactionData);

        if (insertTransactionsError) throw insertTransactionsError;
      }

      toast({
        title: isEditMode ? "Stock card updated" : "Stock card created",
        description: `${itemHeader.item} has been saved.`,
      });

      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was a problem saving the stock card.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
              <Input
                id="entityName"
                name="entityName"
                value={itemHeader.entityName}
                onChange={handleHeaderChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundCluster">Fund Cluster:</Label>
              <Input
                id="fundCluster"
                name="fundCluster"
                value={itemHeader.fundCluster}
                onChange={handleHeaderChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item">
                  Item:<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="item"
                  name="item"
                  value={itemHeader.item}
                  onChange={handleHeaderChange}
                  required
                />
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
                <Input
                  id="stockNo"
                  name="stockNo"
                  value={itemHeader.stockNo}
                  onChange={handleHeaderChange}
                />
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
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[1200px]">
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
                  <TableHead className="text-center">
                    No. of Days to Consume
                  </TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.month}</TableCell>
                    <TableCell>{transaction.year}</TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                    <TableCell className="text-center">
                      {transaction.receiptQty}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.issueQty}
                    </TableCell>
                    <TableCell>{transaction.issueOffice}</TableCell>
                    <TableCell className="text-center">
                      {transaction.balanceQty}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.daysToConsume}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Input
                      type="date"
                      name="date"
                      value={newTransaction.date}
                      onChange={handleTransactionChange}
                      className="w-40"
                    />
                  </TableCell>

                  {/* Month Dropdown */}
                  <TableCell>
                    <select
                      name="month"
                      value={newTransaction.month}
                      onChange={handleTransactionChange}
                      className="border rounded px-2 py-2 w-40"
                    >
                      {[
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
                      ].map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </TableCell>

                  {/* Year Input */}
                  <TableCell>
                    <Input
                      name="year"
                      value={newTransaction.year}
                      onChange={handleTransactionChange}
                      placeholder="Year"
                      className="w-32"
                    />
                  </TableCell>

                  {/* Reference */}
                  <TableCell>
                    <Input
                      name="reference"
                      value={newTransaction.reference}
                      onChange={handleTransactionChange}
                      placeholder="Reference"
                      className="w-40"
                    />
                  </TableCell>

                  {/* Receipt Qty */}
                  <TableCell>
                    <Input
                      name="receiptQty"
                      value={newTransaction.receiptQty}
                      onChange={handleTransactionChange}
                      min="0"
                      className="w-28"
                    />
                  </TableCell>

                  {/* Issue Qty */}
                  <TableCell>
                    <Input
                      name="issueQty"
                      value={newTransaction.issueQty}
                      onChange={handleTransactionChange}
                      min="0"
                      className="w-28"
                    />
                  </TableCell>

                  {/* Office */}
                  <TableCell>
                    <Input
                      name="issueOffice"
                      value={newTransaction.issueOffice}
                      onChange={handleTransactionChange}
                      placeholder="Office"
                      className="w-40"
                    />
                  </TableCell>

                  {/* Balance Qty */}
                  <TableCell>
                    <Input
                      type="number"
                      name="balanceQty"
                      value={newTransaction.balanceQty}
                      onChange={handleTransactionChange}
                      min="0"
                      className="w-28"
                    />
                  </TableCell>

                  {/* Days to Consume */}
                  <TableCell>
                    <Input
                      type="number"
                      name="daysToConsume"
                      value={newTransaction.daysToConsume}
                      onChange={handleTransactionChange}
                      min="0"
                      className="w-32"
                    />
                  </TableCell>

                  {/* Add Button */}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={addTransaction}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveStockCard} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving
                ? "Saving..."
                : isEditMode
                ? "Update Stock Card"
                : "Save Stock Card"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
