import { ServiceBookingsList } from "./_components/service-booking-list";

export const metadata = {
  title: "Service Bookings | Vehiql Admin",
  description: "Manage service bookings",
};

export default function ServiceBookingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Service Booking Management</h1>
      <ServiceBookingsList />
    </div>
  );
}

