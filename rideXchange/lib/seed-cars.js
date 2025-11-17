import { db } from "@/lib/prisma";
import { featuredCars } from "@/lib/data";

/**
 * Seed the Car table with a few sample cars if it is currently empty.
 *
 * This is meant for local/dev usage so the homepage Featured Cars and /cars
 * listing have something to display even before real data is created via
 * the admin UI.
 */
export async function seedCarsIfEmpty() {
  const count = await db.car.count();
  if (count > 0) return;

  const now = new Date();

  await db.car.createMany({
    data: featuredCars.map((car) => ({
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      color: car.color,
      fuelType: car.fuelType,
      transmission: car.transmission,
      bodyType: car.bodyType,
      seats: 5,
      description:
        car.description ||
        `${car.year} ${car.make} ${car.model} in ${car.color} (seeded sample vehicle).`,
      status: "AVAILABLE",
      featured: true,
      images: car.images,
      createdAt: now,
      updatedAt: now,
    })),
    skipDuplicates: true,
  });
}
