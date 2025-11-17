"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search, Loader2, Wrench, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServiceBookingCard } from "@/components/service-booking-card";
import useFetch from "@/hooks/use-fetch";
import {
  getAdminServiceBookings,
  updateServiceBookingStatus,
  deleteServiceBooking,
} from "@/actions/admin";

export const ServiceBookingsList = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Custom hooks for API calls
  const {
    loading: fetchingBookings,
    fn: fetchBookings,
    data: bookingsData,
    error: bookingsError,
  } = useFetch(getAdminServiceBookings);

  const {
    loading: updatingStatus,
    fn: updateStatusFn,
    data: updateResult,
    error: updateError,
  } = useFetch(updateServiceBookingStatus);

  const {
    loading: deleting,
    fn: deleteBookingFn,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteServiceBooking);

  // Initial fetch and refetch on search/filter changes
  useEffect(() => {
    // Convert "all" to empty string for API
    const statusForApi = statusFilter === "all" ? "" : statusFilter;
    fetchBookings({ search, status: statusForApi });
  }, [search, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (bookingsError) {
      toast.error("Failed to load service bookings");
    }
    if (updateError) {
      toast.error("Failed to update service booking status");
    }
    if (deleteError) {
      toast.error("Failed to delete service booking");
    }
  }, [bookingsError, updateError, deleteError]);

  // Handle successful operations
  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Service booking status updated successfully");
      const statusForApi = statusFilter === "all" ? "" : statusFilter;
      fetchBookings({ search, status: statusForApi });
    }
    if (deleteResult?.success) {
      toast.success("Service booking deleted successfully");
      const statusForApi = statusFilter === "all" ? "" : statusFilter;
      fetchBookings({ search, status: statusForApi });
    }
  }, [updateResult, deleteResult]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const statusForApi = statusFilter === "all" ? "" : statusFilter;
    fetchBookings({ search, status: statusForApi });
  };

  // Handle status update
  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (newStatus) {
      await updateStatusFn(bookingId, newStatus);
    }
  };

  // Handle booking deletion
  const handleDelete = async (bookingId) => {
    if (
      confirm(
        "Are you sure you want to delete this service booking? This action cannot be undone."
      )
    ) {
      await deleteBookingFn(bookingId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full sm:w-48"
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, email, phone, vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Service Bookings
          </CardTitle>
          <CardDescription>
            Manage all vehicle service bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingBookings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : bookingsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {bookingsError.message || "Failed to load service bookings"}
              </AlertDescription>
            </Alert>
          ) : !bookingsData?.data || bookingsData.data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No service bookings found</p>
              {search || statusFilter ? (
                <p className="text-sm mt-2">
                  Try adjusting your search or filter criteria
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {bookingsData.data.map((booking) => (
                <div key={booking.id} className="relative">
                  <ServiceBookingCard
                    booking={booking}
                    onDelete={handleDelete}
                    onStatusUpdate={handleUpdateStatus}
                    showActions={true}
                    isAdmin={true}
                    isDeleting={deleting}
                    renderStatusSelector={() => (
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleUpdateStatus(booking.id, value)
                        }
                        disabled={updatingStatus}
                        className="w-40"
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          <SelectItem value="NO_SHOW">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

