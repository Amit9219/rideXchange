"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Wrench, AlertCircle, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import useFetch from "@/hooks/use-fetch";
import { getUserServiceBookings } from "@/actions/service-booking";
import { format, parseISO } from "date-fns";

export function MyServiceBookings() {
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Custom hook for API call
  const {
    loading: fetchingBookings,
    fn: fetchBookings,
    data: bookingsData,
    error: bookingsError,
  } = useFetch(getUserServiceBookings);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle errors
  useEffect(() => {
    if (bookingsError) {
      toast.error("Failed to load your service bookings");
    }
  }, [bookingsError]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            My Service Bookings
          </CardTitle>
          <CardDescription>
            View your service appointment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingBookings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : bookingsError ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Logged In</AlertTitle>
              <AlertDescription>
                Sign in to view your service bookings
              </AlertDescription>
            </Alert>
          ) : !bookingsData?.data || bookingsData.data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No service bookings yet</p>
              <p className="text-sm mt-2">
                Book your first service appointment using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bookings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookingsData.data.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                    className="text-left transition-all hover:shadow-lg"
                  >
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm truncate">
                          {booking.vehicleMake} {booking.vehicleModel}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>

                      {/* Date and Time */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(booking.serviceDate), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                      </div>

                      {/* Service Type */}
                      {booking.serviceType && (
                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Service:</span> {booking.serviceType}
                        </div>
                      )}

                      {/* Customer Info */}
                      <div className="text-xs text-gray-500 border-t pt-2">
                        <p>{booking.customerName}</p>
                        <p>{booking.customerEmail}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Expanded Details */}
              {selectedBooking && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold mb-4">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    {/* Customer Details */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Customer Information</h4>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p><span className="font-medium">Name:</span> {selectedBooking.customerName}</p>
                        <p><span className="font-medium">Email:</span> {selectedBooking.customerEmail}</p>
                        <p><span className="font-medium">Phone:</span> {selectedBooking.customerPhone}</p>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Vehicle Information</h4>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p><span className="font-medium">Make:</span> {selectedBooking.vehicleMake}</p>
                        <p><span className="font-medium">Model:</span> {selectedBooking.vehicleModel}</p>
                        <p><span className="font-medium">Year:</span> {selectedBooking.vehicleYear}</p>
                        {selectedBooking.registrationNumber && (
                          <p><span className="font-medium">Registration:</span> {selectedBooking.registrationNumber}</p>
                        )}
                        {selectedBooking.mileage && (
                          <p><span className="font-medium">Mileage:</span> {selectedBooking.mileage.toLocaleString()} km</p>
                        )}
                      </div>
                    </div>

                    {/* Service Details */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Service Details</h4>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p><span className="font-medium">Type:</span> {selectedBooking.serviceType || "Not specified"}</p>
                        <p><span className="font-medium">Status:</span> <Badge className={getStatusColor(selectedBooking.status)}>{selectedBooking.status}</Badge></p>
                        {selectedBooking.description && (
                          <p><span className="font-medium">Description:</span> {selectedBooking.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Booking Info */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Booking Information</h4>
                      <div className="text-sm space-y-1 text-gray-600">
                        <p><span className="font-medium">Booking ID:</span> {selectedBooking.id.slice(0, 8)}</p>
                        <p><span className="font-medium">Date:</span> {format(new Date(selectedBooking.serviceDate), "MMM d, yyyy")}</p>
                        <p><span className="font-medium">Time:</span> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
                        <p><span className="font-medium">Booked On:</span> {format(new Date(selectedBooking.createdAt), "MMM d, yyyy h:mm a")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
