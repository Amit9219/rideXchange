"use client";

import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Car,
  Wrench,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ServiceBookingCard({
  booking,
  onDelete,
  onStatusUpdate,
  showActions = false,
  isAdmin = false,
  isDeleting = false,
  renderStatusSelector,
}) {
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Service Booking
            </CardTitle>
            <div className="mt-2">
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
          </div>
          {isAdmin && showActions && (
            <div className="flex gap-2">
              {renderStatusSelector && renderStatusSelector()}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(booking.id)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
                {format(parseISO(`2022-01-01T${booking.endTime}`), "h:mm a")}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Name</p>
              <p className="font-medium">{booking.customerName}</p>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium">{booking.customerEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-medium">{booking.customerPhone}</p>
              </div>
            </div>
            {booking.user && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Account User</p>
                <p className="font-medium text-sm">
                  {booking.user.name || booking.user.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Make</p>
              <p className="font-medium">{booking.vehicleMake}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Model</p>
              <p className="font-medium">{booking.vehicleModel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Year</p>
              <p className="font-medium">{booking.vehicleYear}</p>
            </div>
            {booking.registrationNumber && (
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Registration Number
                </p>
                <p className="font-medium">{booking.registrationNumber}</p>
              </div>
            )}
            {booking.mileage && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Mileage</p>
                <p className="font-medium">
                  {booking.mileage.toLocaleString()} km
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Service Details */}
        {(booking.serviceType || booking.description) && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Service Details</h4>
            {booking.serviceType && (
              <div className="mb-2">
                <p className="text-sm text-gray-500 mb-1">Service Type</p>
                <p className="font-medium">{booking.serviceType}</p>
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

        {/* Notes */}
        {booking.notes && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
            <p className="text-gray-700">{booking.notes}</p>
          </div>
        )}

        {/* Booking Info */}
        <div className="border-t pt-4 text-xs text-gray-500">
          <p>Booking ID: {booking.id.slice(0, 8)}</p>
          <p>
            Created: {format(new Date(booking.createdAt), "MMM d, yyyy h:mm a")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

