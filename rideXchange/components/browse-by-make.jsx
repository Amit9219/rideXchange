import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { getCarFilters } from "@/actions/car-listing";
import { carMakes } from "@/lib/data";

// Server component: renders the "Browse by Make" section on the homepage.
// Uses real makes from the Car table so it works for cars added via Sell Car.
export async function BrowseByMake() {
  const filtersResult = await getCarFilters();

  if (!filtersResult?.success || !filtersResult.data?.makes) {
    return null;
  }

  // Unique, sorted makes from DB
  const makesFromDb = Array.from(
    new Set(
      filtersResult.data.makes
        .filter(Boolean)
        .map((m) => m.trim())
    )
  ).sort((a, b) => a.localeCompare(b));

  if (makesFromDb.length === 0) {
    return null;
  }

  // Map DB makes to logo metadata (if available)
  const items = makesFromDb.map((name) => {
    const normalized = name.toLowerCase();
    const meta = carMakes.find(
      (m) => m.name.trim().toLowerCase() === normalized
    );

    return {
      name,
      imageUrl: meta?.imageUrl || null,
    };
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Browse by Make</h2>
          <Button variant="ghost" className="flex items-center" asChild>
            <Link href="/cars">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((make) => (
            <Link
              key={make.name}
              href={`/cars?make=${encodeURIComponent(make.name)}`}
              className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer"
            >
              <div className="h-16 w-auto mx-auto mb-2 flex items-center justify-center">
                {make.imageUrl ? (
                  <img
                    src={make.imageUrl}
                    alt={make.name}
                    className="max-h-16 w-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 text-gray-600 font-semibold">
                    {make.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="font-medium">{make.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
