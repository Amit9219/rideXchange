import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCarById } from "@/actions/car-listing";
import { BuyCarForm } from "@/components/buy-car-form";
import { formatCurrency } from "@/lib/helpers";

export const metadata = {
  title: "Buy Car | RideXchange",
};

export default async function BuyCarPage(props) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect=/buy/${params.id}`);
  }

  const result = await getCarById(params.id);

  if (!result?.success) {
    redirect("/cars");
  }

  const car = result.data;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">
        Buy {car.year} {car.make} {car.model}
      </h1>
      <p className="text-gray-600 mb-6">
        Price: <span className="font-semibold">{formatCurrency(car.price)}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BuyCarForm car={car} />
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="font-semibold mb-2">Car Summary</h2>
            <p className="text-sm text-gray-700">
              {car.year} {car.make} {car.model}
            </p>
            <p className="text-sm text-gray-700">
              Body type: {car.bodyType}
            </p>
            <p className="text-sm text-gray-700">Fuel: {car.fuelType}</p>
            <p className="text-sm text-gray-700">Transmission: {car.transmission}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
