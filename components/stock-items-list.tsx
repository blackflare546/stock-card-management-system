"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; // 👈 add this

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StockItem {
  id: string;
  entity_name: string;
  fund_cluster: string;
  item: string;
  stock_no: string;
  description: string;
  unit_of_measurement: string;
  reorder_point: number;
  current_balance: number;
  last_updated?: string;
  updated_at?: string;
}

export default function StockItemsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock_cards")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error(error);
        toast({
          title: "Error fetching items",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    fetchItems();
  }, [supabase, toast]);

  const filteredItems = items.filter(
    (item) =>
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stock_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entity_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from("stock_cards")
        .delete()
        .eq("id", itemToDelete);

      if (error) {
        throw error;
      }

      const deletedItem = items.find((item) => item.id === itemToDelete);

      toast({
        title: "Item deleted",
        description: `${
          deletedItem?.item || "Item"
        } has been successfully removed.`,
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);

      // Refresh list
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete));
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error.message ||
          "There was a problem deleting the item. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading items...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.stock_no}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.unit_of_measurement}</TableCell>
                      <TableCell className="text-center">
                        {item.current_balance}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/stock-card/${item.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/stock-card/${item.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No items found. Try a different search term or add a new
                      stock card.
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
              This action cannot be undone. This will permanently delete the
              stock card and all its transaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
