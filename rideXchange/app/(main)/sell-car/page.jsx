import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddCarForm } from "@/app/(admin)/admin/cars/create/_components/add-car-form";

export const metadata = {
  title: "Sell Your Car | Vehiql",
  description: "List your car for sale on Vehiql",
};

export default async function SellCarPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/sell-car");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-4 gradient-title">Sell Your Car</h1>
      <p className="text-gray-500 mb-8 max-w-2xl">
        Fill in your car details and upload photos to list your car for sale on our
        marketplace.
      </p>

      <AddCarForm mode="public" redirectPath="/cars" submitLabel="List My Car" />
    </div>
  );
}