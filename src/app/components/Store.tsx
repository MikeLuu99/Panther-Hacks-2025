import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Card, Button } from "pixel-retroui";
import Image from "next/image";

// Define proper interfaces for the data structures
interface Profile {
  score: number;
  purchasedBackgrounds?: string[];
  selectedBackground?: string;
}

interface StoreItem {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
}

export function Store() {
  const items = useQuery(api.store.listItems) as StoreItem[] | undefined;
  const purchaseBackground = useMutation(api.store.purchaseBackground);
  const profile = useQuery(api.profiles.get) as Profile | undefined;

  if (!items || !profile) return null;

  // Add type guard for profile.score
  const score = profile.score ?? 0;

  const handlePurchase = async (imageUrl: string | null) => {
    try {
      await purchaseBackground({ imageUrl });
      toast.success(
        imageUrl === null
          ? "Switched to default background"
          : profile.purchasedBackgrounds?.includes(imageUrl)
            ? "Background selected!"
            : "Background purchased successfully!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to purchase background",
      );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Store</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex flex-col items-center gap-4">
            <h3 className="font-semibold">Default Background</h3>
            <div className="relative w-full h-40 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Plain White</span>
            </div>
            <p className="text-sm text-gray-600">
              Switch back to the default white background
            </p>
            <Button
              onClick={() => handlePurchase(null)}
              className={
                profile.selectedBackground === undefined
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              }
            >
              {profile.selectedBackground === undefined ? "Selected" : "Select"}
            </Button>
          </div>
        </Card>
        {items.map((item) => {
          const isPurchased = profile.purchasedBackgrounds?.includes(
            item.imageUrl,
          );
          const isSelected = profile.selectedBackground === item.imageUrl;

          return (
            <Card key={item._id} className="p-4">
              <div className="flex flex-col items-center gap-4">
                <h3 className="font-semibold">{item.name}</h3>
                <div className="relative w-full h-40">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
                {!isPurchased && (
                  <p className="flex items-center gap-2">
                    Price: {item.price}
                    <Image
                      src="/apple.svg"
                      alt="apples"
                      width={20}
                      height={20}
                      className="inline-block"
                    />
                  </p>
                )}
                <Button
                  onClick={() => handlePurchase(item.imageUrl)}
                  disabled={!isPurchased && score < item.price}
                  className={
                    isSelected
                      ? "bg-green-500 text-white"
                      : isPurchased
                        ? "bg-blue-500 text-white"
                        : score >= item.price
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-300"
                  }
                >
                  {isSelected
                    ? "Selected"
                    : isPurchased
                      ? "Select"
                      : score >= item.price
                        ? "Purchase"
                        : "Not enough apples"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
