import { db } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, Car, User, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export default async function ServiceConfirmationPage({ searchParams }) {
  const bookingId = searchParams?.id;

  if (!bookingId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-red-500">Invalid booking ID</p>
          <Link href="/service">
            <Button className="mt-4">Book Service</Button>
          </Link>
        </div>
      </div>
    );
  }

  let booking = null;
  try {
    booking = await db.serviceBooking.findUnique({
      where: { id: bookingId },
    });
  } catch (error) {
    // Model might not exist yet
    console.error("Error fetching booking:", error);
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-red-500">Booking not found</p>
          <Link href="/service">
            <Button className="mt-4">Book Service</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Service Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your service appointment has been successfully booked. You will receive
            a confirmation email shortly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking ID */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Booking ID</p>
              <p className="font-mono font-semibold">{booking.id}</p>
            </div>

            {/* Service Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Service Date</p>
                  <p className="font-semibold">
                    {format(new Date(booking.serviceDate), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Slot</p>
                  <p className="font-semibold">
                    {format(
                      parseISO(`2022-01-01T${booking.startTime}`),
                      "h:mm a"
                    )}{" "}
                    -{" "}
                    {format(
                      parseISO(`2022-01-01T${booking.endTime}`),
                      "h:mm a"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-semibold">{booking.customerName}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-semibold">{booking.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold">{booking.customerPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Make</p>
                  <p className="font-semibold">{booking.vehicleMake}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Model</p>
                  <p className="font-semibold">{booking.vehicleModel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="font-semibold">{booking.vehicleYear}</p>
                </div>
                {booking.registrationNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Registration Number
                    </p>
                    <p className="font-semibold">
                      {booking.registrationNumber}
                    </p>
                  </div>
                )}
                {booking.mileage && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mileage</p>
                    <p className="font-semibold">
                      {booking.mileage.toLocaleString()} km
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            {(booking.serviceType || booking.description) && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Service Details</h3>
                {booking.serviceType && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500 mb-1">Service Type</p>
                    <p className="font-semibold">{booking.serviceType}</p>
                  </div>
                )}
                {booking.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-700">{booking.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Status */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  booking.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.status === "CONFIRMED"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status}
              </span>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
                <p className="text-gray-700">{booking.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/service">Book Another Service</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

