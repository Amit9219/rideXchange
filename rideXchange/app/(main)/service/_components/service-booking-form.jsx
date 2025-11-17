"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar as CalendarIcon,
  Wrench,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { bookService } from "@/actions/service-booking";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

// Define Zod schema for form validation
const serviceBookingSchema = z.object({
  // Customer details
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  // Vehicle details
  vehicleMake: z.string().min(1, "Please enter vehicle make"),
  vehicleModel: z.string().min(1, "Please enter vehicle model"),
  vehicleYear: z.string().min(4, "Please enter a valid year"),
  registrationNumber: z.string().optional(),
  mileage: z.string().optional(),
  // Service details
  date: z.date({
    required_error: "Please select a date for your service",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot",
  }),
  serviceType: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export function ServiceBookingForm({ serviceInfo }) {
  const router = useRouter();
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Initialize react-hook-form with zod resolver
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(serviceBookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      registrationNumber: "",
      mileage: "",
      date: undefined,
      timeSlot: undefined,
      serviceType: "",
      description: "",
      notes: "",
    },
  });

  // Get dealership and booking information
  const dealership = serviceInfo?.dealership;
  const existingBookings = serviceInfo?.existingBookings || [];

  // Watch date field to update available time slots
  const selectedDate = watch("date");

  // Custom hooks for API calls
  const {
    loading: bookingInProgress,
    fn: bookServiceFn,
    data: bookingResult,
    error: bookingError,
  } = useFetch(bookService);

  // Handle successful booking
  useEffect(() => {
    console.log("bookingResult updated:", bookingResult);
    if (bookingResult?.success && bookingResult?.data) {
      console.log("Booking successful! Redirecting...", bookingResult);
      toast.success("Service booked successfully!");
      
      // Redirect directly to confirmation page instead of showing dialog
      router.push(`/service/confirmation?id=${bookingResult.data.id}`);
    } else if (bookingResult?.success === false) {
      console.error("Booking failed:", bookingResult);
      toast.error(bookingResult?.error || "Failed to book service");
    }
  }, [bookingResult, router]);

  // Handle booking error
  useEffect(() => {
    if (bookingError) {
      toast.error(
        bookingError.message || "Failed to book service. Please try again."
      );
    }
  }, [bookingError]);

  // Update available time slots when date changes
  useEffect(() => {
    if (!selectedDate || !dealership?.workingHours) return;

    const selectedDayOfWeek = format(selectedDate, "EEEE").toUpperCase();

    // Find working hours for the selected day
    const daySchedule = dealership.workingHours.find(
      (day) => day.dayOfWeek === selectedDayOfWeek
    );

    if (!daySchedule || !daySchedule.isOpen) {
      setAvailableTimeSlots([]);
      return;
    }

    // Parse opening and closing hours
    const openHour = parseInt(daySchedule.openTime.split(":")[0]);
    const closeHour = parseInt(daySchedule.closeTime.split(":")[0]);

    // Generate time slots (every hour)
    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      // Check if this slot is already booked
      const isBooked = existingBookings.some((booking) => {
        const bookingDate = booking.date;
        return (
          bookingDate === format(selectedDate, "yyyy-MM-dd") &&
          (booking.startTime === startTime || booking.endTime === endTime)
        );
      });

      if (!isBooked) {
        slots.push({
          id: `${startTime}-${endTime}`,
          label: `${startTime} - ${endTime}`,
          startTime,
          endTime,
        });
      }
    }

    setAvailableTimeSlots(slots);

    // Clear time slot selection when date changes
    setValue("timeSlot", "");
  }, [selectedDate, dealership, existingBookings, setValue]);

  // Create a function to determine which days should be disabled
  const isDayDisabled = (day) => {
    // Disable past dates - need to compare just the dates without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayToCheck = new Date(day);
    dayToCheck.setHours(0, 0, 0, 0);
    
    if (dayToCheck < today) {
      return true;
    }

    // Get day of week
    const dayOfWeek = format(day, "EEEE").toUpperCase();

    // Find working hours for the day
    const daySchedule = dealership?.workingHours?.find(
      (schedule) => schedule.dayOfWeek === dayOfWeek
    );

    // Disable if dealership is closed on this day
    return !daySchedule || !daySchedule.isOpen;
  };

  // Submit handler
  const onSubmit = async (data) => {
    try {
      // Validate form data
      if (!data.customerName || !data.customerEmail || !data.customerPhone) {
        toast.error("Please fill in all required customer fields");
        return;
      }

      if (!data.vehicleMake || !data.vehicleModel || !data.vehicleYear) {
        toast.error("Please fill in all required vehicle fields");
        return;
      }

      if (!data.date || !data.timeSlot) {
        toast.error("Please select a date and time slot");
        return;
      }

      const selectedSlot = availableTimeSlots.find(
        (slot) => slot.id === data.timeSlot
      );

      if (!selectedSlot) {
        toast.error("Selected time slot is not available");
        return;
      }

      console.log("Submitting booking form with data:", {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        serviceDate: format(data.date, "yyyy-MM-dd"),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      const result = await bookServiceFn({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
        registrationNumber: data.registrationNumber || null,
        mileage: data.mileage || null,
        serviceDate: format(data.date, "yyyy-MM-dd"),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        serviceType: data.serviceType || null,
        description: data.description || null,
        notes: data.notes || null,
      });

      console.log("Booking result:", result);
      
      if (!result?.success) {
        toast.error(result?.error || "Failed to book service");
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Failed to book service. Please try again.");
    }
  };

  const handleConfirmationClose = (open) => {
    if (!open) {
      setShowConfirmation(false);
      if (bookingDetails?.id) {
        router.push(`/service/confirmation?id=${bookingDetails.id}`);
      }
    }
  };

  const handleViewConfirmation = () => {
    setShowConfirmation(false);
    if (bookingDetails?.id) {
      router.push(`/service/confirmation?id=${bookingDetails.id}`);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Book Vehicle Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Controller
                    name="customerName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="customerName"
                        placeholder="John Doe"
                        {...field}
                      />
                    )}
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-500">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Controller
                    name="customerEmail"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    )}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-500">
                      {errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Controller
                    name="customerPhone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="customerPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                      />
                    )}
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-500">
                      {errors.customerPhone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehicle Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleMake">Make *</Label>
                  <Controller
                    name="vehicleMake"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="vehicleMake"
                        placeholder="Toyota"
                        {...field}
                      />
                    )}
                  />
                  {errors.vehicleMake && (
                    <p className="text-sm text-red-500">
                      {errors.vehicleMake.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Model *</Label>
                  <Controller
                    name="vehicleModel"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="vehicleModel"
                        placeholder="Camry"
                        {...field}
                      />
                    )}
                  />
                  {errors.vehicleModel && (
                    <p className="text-sm text-red-500">
                      {errors.vehicleModel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Year *</Label>
                  <Controller
                    name="vehicleYear"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="vehicleYear"
                        type="number"
                        placeholder="2023"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        {...field}
                      />
                    )}
                  />
                  {errors.vehicleYear && (
                    <p className="text-sm text-red-500">
                      {errors.vehicleYear.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Controller
                    name="registrationNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="registrationNumber"
                        placeholder="ABC-1234"
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Controller
                    name="mileage"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="mileage"
                        type="number"
                        placeholder="50000"
                        min="0"
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Service Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Service Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceDate">Service Date *</Label>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => {
                      // Get today's date in YYYY-MM-DD format
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const minDate = today.toISOString().split('T')[0];
                      
                      // Get the selected date in YYYY-MM-DD format if it exists
                      const selectedDate = field.value 
                        ? new Date(field.value).toISOString().split('T')[0]
                        : '';

                      return (
                        <Input
                          id="serviceDate"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => {
                            const dateStr = e.target.value;
                            if (dateStr) {
                              const date = new Date(dateStr + 'T00:00:00');
                              // Validate the date is not disabled
                              if (!isDayDisabled(date)) {
                                field.onChange(date);
                              } else {
                                toast.error("Selected date is not available for service");
                                e.target.value = '';
                              }
                            }
                          }}
                          min={minDate}
                          className="w-full"
                        />
                      );
                    }}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Time Slot *</Label>
                  <Controller
                    name="timeSlot"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedDate || availableTimeSlots.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedDate
                                ? "Select date first"
                                : availableTimeSlots.length === 0
                                ? "No slots available"
                                : "Select time slot"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.timeSlot && (
                    <p className="text-sm text-red-500">
                      {errors.timeSlot.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Controller
                    name="serviceType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular Service">
                            Regular Service
                          </SelectItem>
                          <SelectItem value="Repair">Repair</SelectItem>
                          <SelectItem value="Inspection">Inspection</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Service Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder="Describe the service needed..."
                      rows={3}
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="notes"
                      placeholder="Any additional information..."
                      rows={2}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={bookingInProgress || !isValid}
            >
              {bookingInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Service"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={handleConfirmationClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle>Service Booked Successfully!</DialogTitle>
            <DialogDescription>
              Your service appointment has been confirmed. You will receive a
              confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          {bookingDetails && (
            <div className="space-y-2 mt-4">
              <p className="text-sm">
                <span className="font-semibold">Booking ID:</span>{" "}
                {bookingDetails.id?.slice(0, 8)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date:</span> {bookingDetails.date}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Time:</span> {bookingDetails.timeSlot}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Vehicle:</span>{" "}
                {bookingDetails.vehicleMake} {bookingDetails.vehicleModel} (
                {bookingDetails.vehicleYear})
              </p>
            </div>
          )}
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                router.push("/service");
              }}
              className="flex-1"
            >
              Book Another
            </Button>
            <Button
              onClick={handleViewConfirmation}
              className="flex-1"
            >
              View Confirmation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

