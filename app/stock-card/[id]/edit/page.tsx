"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StockCardForm from "@/components/stock-card-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditStockCardPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [referrer, setReferrer] = useState<string>("/");
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      // Unwrap params using React.use()
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };

    fetchParams();
  }, [params]);

  useEffect(() => {
    if (id) {
      // Get the referrer from the document if available
      if (document.referrer) {
        const url = new URL(document.referrer);
        const path = url.pathname;

        // Check if the referrer is from our app
        if (path) {
          // If the referrer is the home page or the details page, use that
          if (path === "/" || path === `/stock-card/${id}`) {
            setReferrer(path);
          }
        }
      }
    }
  }, [id]);

  const handleBack = () => {
    router.push(referrer);
  };

  if (!id) {
    return <div>Loading...</div>; // or any loading indicator you prefer
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8 gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Stock Card</h1>
      </div>

      <StockCardForm id={id} />
    </main>
  );
}
