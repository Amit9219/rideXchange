"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// Verify db is properly initialized
if (!db) {
  console.error("ERROR: Database client not initialized");
}

/**
 * Books a vehicle service appointment
 */
export async function bookService({
  customerName,
  customerEmail,
  customerPhone,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  registrationNumber,
  mileage,
  serviceDate,
  startTime,
  endTime,
  serviceType,
  description,
  notes,
}) {
  try {
    if (!db) {
      throw new Error("Database connection not available");
    }
    // Get user if logged in (optional - service booking can be done by guests)
    let userId = null;
    try {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        const user = await db.user.findUnique({
          where: { clerkUserId },
        });
        if (user) {
          userId = user.id;
        }
      }
    } catch (error) {
      // User not logged in - that's okay for service booking
      console.log("Service booking by guest user");
    }

    // Check if slot is already booked
    let existingBooking = null;
    try {
      existingBooking = await db.serviceBooking.findFirst({
        where: {
          serviceDate: new Date(serviceDate),
          startTime,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      });
    } catch (modelError) {
      // Model might not exist yet
      if (modelError.message?.includes("serviceBooking")) {
        throw new Error(
          "Service booking model not found. Please run database migration: npx prisma migrate dev"
        );
      }
      throw modelError;
    }

    if (existingBooking) {
      throw new Error(
        "This time slot is already booked. Please select another time."
      );
    }

    // Create the booking
    const booking = await db.serviceBooking.create({
      data: {
        userId,
        customerName,
        customerEmail,
        customerPhone,
        vehicleMake,
        vehicleModel,
        vehicleYear: parseInt(vehicleYear),
        registrationNumber: registrationNumber || null,
        mileage: mileage ? parseInt(mileage) : null,
        serviceDate: new Date(serviceDate),
        startTime,
        endTime,
        serviceType: serviceType || null,
        description: description || null,
        notes: notes || null,
        status: "PENDING",
      },
    });

    // Revalidate relevant paths
    revalidatePath("/service");
    revalidatePath("/service/confirmation");

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error("Error booking service:", error);
    return {
      success: false,
      error: error.message || "Failed to book service appointment",
    };
  }
}

/**
 * Get existing service bookings for a specific date (to check availability)
 */
export async function getServiceBookingsForDate(date) {
  try {
    if (!db) {
      throw new Error("Database connection not available");
    }

    const bookings = await db.serviceBooking.findMany({
      where: {
        serviceDate: new Date(date),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    return {
      success: true,
      data: bookings,
    };
  } catch (error) {
    console.error("Error fetching service bookings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch service bookings",
      data: [],
    };
  }
}

/**
 * Get user's service bookings (if logged in)
 */
export async function getUserServiceBookings() {
  try {
    if (!db) {
      throw new Error("Database connection not available");
    }

    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to view your service bookings",
        data: [],
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        data: [],
      };
    }

    const bookings = await db.serviceBooking.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        serviceDate: "desc",
      },
    });

    return {
      success: true,
      data: bookings.map((booking) => ({
        id: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        vehicleMake: booking.vehicleMake,
        vehicleModel: booking.vehicleModel,
        vehicleYear: booking.vehicleYear,
        registrationNumber: booking.registrationNumber,
        mileage: booking.mileage,
        serviceDate: booking.serviceDate.toISOString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        serviceType: booking.serviceType,
        description: booking.description,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching user service bookings:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch service bookings",
      data: [],
    };
  }
}

/**
 * Get dealership info for service booking (working hours)
 */
export async function getServiceBookingInfo() {
  try {
    if (!db) {
      console.error("Database client is not initialized");
      return {
        success: false,
        error: "Database connection failed. Please refresh the page.",
      };
    }

    // Check if dealershipInfo model is accessible
    if (!db.dealershipInfo || typeof db.dealershipInfo.findFirst !== 'function') {
      console.error("DealershipInfo model not found on db object. Available:", Object.keys(db || {}));
      return {
        success: false,
        error: "Database models not loaded. Please refresh the page.",
      };
    }

    let dealership = null;
    
    try {
      dealership = await db.dealershipInfo.findFirst({
        include: {
          workingHours: {
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      });
    } catch (findError) {
      console.error("Error finding dealership:", findError?.message);
    }

    // If no dealership exists, create a default one
    if (!dealership) {
      console.log("Creating default dealership...");
      try {
        dealership = await db.dealershipInfo.create({
          data: {
            // Default values from schema will be used
            workingHours: {
              create: [
                {
                  dayOfWeek: "MONDAY",
                  openTime: "09:00",
                  closeTime: "18:00",
                  isOpen: true,
                },
                {
                  dayOfWeek: "TUESDAY",
                  openTime: "09:00",
                  closeTime: "18:00",
                  isOpen: true,
                },
                {
                  dayOfWeek: "WEDNESDAY",
                  openTime: "09:00",
                  closeTime: "18:00",
                  isOpen: true,
                },
                {
                  dayOfWeek: "THURSDAY",
                  openTime: "09:00",
                  closeTime: "18:00",
                  isOpen: true,
                },
                {
                  dayOfWeek: "FRIDAY",
                  openTime: "09:00",
                  closeTime: "18:00",
                  isOpen: true,
                },
                {
                  dayOfWeek: "SATURDAY",
                  openTime: "10:00",
                  closeTime: "16:00",
                  isOpen: true,
                },
                {
                  dayOfWeek: "SUNDAY",
                  openTime: "10:00",
                  closeTime: "16:00",
                  isOpen: false,
                },
              ],
            },
          },
          include: {
            workingHours: {
              orderBy: {
                dayOfWeek: "asc",
              },
            },
          },
        });
        console.log("Default dealership created:", dealership?.id);
      } catch (createError) {
        console.error("Error creating dealership:", createError?.message);
        return {
          success: false,
          error: "Failed to create dealership: " + (createError?.message || "Unknown error"),
        };
      }
    }

    // Get existing bookings for today and future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if serviceBooking model exists, if not return empty array
    let existingBookings = [];
    try {
      existingBookings = await db.serviceBooking.findMany({
        where: {
          serviceDate: {
            gte: today,
          },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: {
          serviceDate: true,
          startTime: true,
          endTime: true,
        },
      });
    } catch (modelError) {
      // Model might not exist yet - return empty bookings
      console.warn("ServiceBooking model not found. Run migration first:", modelError.message);
      existingBookings = [];
    }

    return {
      success: true,
      data: {
        dealership,
        existingBookings: existingBookings.map((booking) => ({
          date: booking.serviceDate.toISOString().split("T")[0],
          startTime: booking.startTime,
          endTime: booking.endTime,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching service booking info:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch service booking information",
    };
  }
}

