import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCarById } from "@/actions/car-listing";
import { formatCurrency } from "@/lib/helpers";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment | RideXchange",
};

export default async function PaymentPage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect=/buy/${params.id}/payment`);
  }

  const result = await getCarById(params.id);
  if (!result?.success) {
    redirect("/cars");
  }

  const car = result.data;
  const buyerName = searchParams.fullName || "Customer";

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Payment</h1>
      <p className="mb-4 text-gray-700">
        Hi {buyerName}, you are about to pay for:
      </p>
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <p className="font-semibold">
          {car.year} {car.make} {car.model}
        </p>
        <p className="text-gray-700">Total amount: {formatCurrency(car.price)}</p>
      </div>

      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="font-semibold mb-2">Payment Method</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is a demo payment page. Integrate your payment gateway (Stripe,
          Razorpay, etc.) here.
        </p>
        <Button className="w-full" disabled>
          Proceed to Pay (Demo)
        </Button>
      </div>
    </div>
  );
}
