import { getServiceBookingInfo } from "@/actions/service-booking";
import { ServiceBookingForm } from "./_components/service-booking-form";
import { MyServiceBookings } from "./_components/my-service-bookings";

export default async function ServicePage() {
  const serviceInfo = await getServiceBookingInfo();

  if (!serviceInfo?.success) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-red-500">
            <p>Failed to load service booking information.</p>
            <p className="text-sm mt-2">{serviceInfo?.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vehicle Service Booking</h1>
          <p className="text-gray-600">
            Schedule a service appointment for your vehicle or view your existing bookings.
          </p>
        </div>

        {/* Book Service Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Book a Service</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ServiceBookingForm serviceInfo={serviceInfo.data} />
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold mb-2">Service Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our service center offers comprehensive vehicle maintenance and
                  repair services.
                </p>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Regular maintenance</li>
                  <li>• Engine diagnostics</li>
                  <li>• Brake service</li>
                  <li>• Oil change</li>
                  <li>• Tire service</li>
                  <li>• And more...</li>
                </ul>
              </div>

              {serviceInfo.data?.dealership && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Service Center</h3>
                  <p className="text-sm text-gray-600">
                    <strong>{serviceInfo.data.dealership.name}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {serviceInfo.data.dealership.address}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {serviceInfo.data.dealership.phone}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {serviceInfo.data.dealership.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Service Bookings Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">My Service Bookings</h2>
          <MyServiceBookings />
        </div>
      </div>
    </div>
  );
}

