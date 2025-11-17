import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Welcome | RideXchange",
  description: "Choose whether you want to buy a car or sell your car.",
};

export default async function DashboardPage() {
  const { userId } = await auth();

  // If user is not signed in, send them to sign-in and then back here.
  if (!userId) {
    redirect("/sign-in?redirect=/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-title">
        What would you like to do?
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl">
        Choose whether you want to browse cars to buy or list your own car for sale.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Buy Cars card */}
        <Link href="/cars" className="group">
          <div className="border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition bg-white h-full flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 h-12 w-12 mb-4">
                <Car className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Buy a Car</h2>
              <p className="text-gray-600 mb-6">
                Browse all available cars, apply filters, and explore detailed information
                before booking a test drive.
              </p>
            </div>
            <Button className="mt-auto group-hover:translate-x-1 transition-transform">
              Go to Buy Cars
            </Button>
          </div>
        </Link>

        {/* Sell Car card */}
        <Link href="/sell-car" className="group">
          <div className="border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition bg-white h-full flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 h-12 w-12 mb-4">
                <CarFront className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Sell your Car</h2>
              <p className="text-gray-600 mb-6">
                Fill in your car details and upload photos to list your car on the
                marketplace.
              </p>
            </div>
            <Button className="mt-auto group-hover:translate-x-1 transition-transform">
              Go to Sell Car
            </Button>
          </div>
        </Link>
      </div>
    </div>
  );
}
