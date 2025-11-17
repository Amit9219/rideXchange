// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Heart, Car as CarIcon, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import { toggleSavedCar } from "@/actions/car-listing";
// import { useAuth } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import useFetch from "@/hooks/use-fetch";

// export const CarCard = ({ car }) => {
//   const { isSignedIn } = useAuth();
//   const router = useRouter();
//   const [isSaved, setIsSaved] = useState(car.wishlisted);

//   // Use the useFetch hook
//   const {
//     loading: isToggling,
//     fn: toggleSavedCarFn,
//     data: toggleResult,
//     error: toggleError,
//   } = useFetch(toggleSavedCar);

//   // Handle toggle result with useEffect
//   useEffect(() => {
//     if (toggleResult?.success && toggleResult.saved !== isSaved) {
//       setIsSaved(toggleResult.saved);
//       toast.success(toggleResult.message);
//     }
//   }, [toggleResult, isSaved]);

//   // Handle errors with useEffect
//   useEffect(() => {
//     if (toggleError) {
//       toast.error("Failed to update favorites");
//     }
//   }, [toggleError]);

//   // Handle save/unsave car
//   const handleToggleSave = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!isSignedIn) {
//       toast.error("Please sign in to save cars");
//       router.push("/sign-in");
//       return;
//     }

//     if (isToggling) return;

//     // Call the toggleSavedCar function using our useFetch hook
//     await toggleSavedCarFn(car.id);
//   };

//   return (
//     <Card className="overflow-hidden hover:shadow-lg transition group">
//       <div className="relative h-48">
//         {car.images && car.images.length > 0 ? (
//           <div className="relative w-full h-full">
//             <Image
//               src={car.images[0]}
//               alt={`${car.make} ${car.model}`}
//               fill
//               className="object-cover group-hover:scale-105 transition duration-300"
//             />
//           </div>
//         ) : (
//           <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//             <CarIcon className="h-12 w-12 text-gray-400" />
//           </div>
//         )}

//         <Button
//           variant="ghost"
//           size="icon"
//           className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
//             isSaved
//               ? "text-red-500 hover:text-red-600"
//               : "text-gray-600 hover:text-gray-900"
//           }`}
//           onClick={handleToggleSave}
//           disabled={isToggling}
//         >
//           {isToggling ? (
//             <Loader2 className="h-4 w-4 animate-spin" />
//           ) : (
//             <Heart className={isSaved ? "fill-current" : ""} size={20} />
//           )}
//         </Button>
//       </div>

//       <CardContent className="p-4">
//         <div className="flex flex-col mb-2">
//           <h3 className="text-lg font-bold line-clamp-1">
//             {car.make} {car.model}
//           </h3>
//           <span className="text-xl font-bold text-blue-600">
//             ${car.price.toLocaleString()}
//           </span>
//         </div>

//         <div className="text-gray-600 mb-2 flex items-center">
//           <span>{car.year}</span>
//           <span className="mx-2">•</span>
//           <span>{car.transmission}</span>
//           <span className="mx-2">•</span>
//           <span>{car.fuelType}</span>
//         </div>

//         <div className="flex flex-wrap gap-1 mb-4">
//           <Badge variant="outline" className="bg-gray-50">
//             {car.bodyType}
//           </Badge>
//           <Badge variant="outline" className="bg-gray-50">
//             {car.mileage.toLocaleString()} miles
//           </Badge>
//           <Badge variant="outline" className="bg-gray-50">
//             {car.color}
//           </Badge>
//         </div>

//         <div className="flex justify-between">
//           <Button
//             className="flex-1"
//             onClick={() => {
//               router.push(`/cars/${car.id}`);
//             }}
//           >
//             View Car
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };



"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Car as CarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { toggleSavedCar } from "@/actions/car-listing";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/helpers";
import { carMakes } from "@/lib/data";

// Helper function to get manufacturer logo URL
function getMakeLogoUrl(makeName) {
  if (!makeName) return null;
  const normalized = makeName.trim().toLowerCase();
  const make = carMakes.find(
    (m) => m.name.trim().toLowerCase() === normalized
  );
  return make?.imageUrl || null;
}

export const CarCard = ({ car = {} }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // defensive defaults
  const safeCar = {
    id: car?.id,
    make: car?.make ?? "Unknown",
    model: car?.model ?? "",
    price: typeof car?.price === "number" ? car.price : Number(car?.price) || 0,
    year: car?.year ?? "N/A",
    transmission: car?.transmission ?? "N/A",
    fuelType: car?.fuelType ?? "N/A",
    bodyType: car?.bodyType ?? "N/A",
    mileage: typeof car?.mileage === "number" ? car.mileage : Number(car?.mileage) || 0,
    color: car?.color ?? "N/A",
    images: Array.isArray(car?.images) ? car.images : [],
    wishlisted: Boolean(car?.wishlisted),
  };

  const [isSaved, setIsSaved] = useState(safeCar.wishlisted);
  const [imageError, setImageError] = useState(false);
  const makeLogoUrl = getMakeLogoUrl(safeCar.make);

  const {
    loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  // update saved state when toggleResult arrives (only once per result)
  useEffect(() => {
    if (toggleResult && typeof toggleResult.saved === "boolean") {
      setIsSaved(toggleResult.saved);
      if (toggleResult.message) toast.success(toggleResult.message);
    }
  }, [toggleResult]);

  useEffect(() => {
    if (toggleError) {
      console.error("toggleSavedCar error:", toggleError);
      toast.error("Failed to update favorites");
    }
  }, [toggleError]);

  // Reset image error when car changes
  useEffect(() => {
    setImageError(false);
  }, [safeCar.images]);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Please sign in to save cars");
      router.push("/sign-in");
      return;
    }

    if (isToggling) return;

    if (!safeCar.id) {
      console.warn("Attempt to toggle save for car missing id:", safeCar);
      toast.error("Unable to save this car right now.");
      return;
    }

    try {
      await toggleSavedCarFn(safeCar.id);
    } catch (err) {
      console.error("toggleSavedCarFn thrown:", err);
      toast.error("Failed to update favorites");
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition group">
      <div className="relative h-48">
        {safeCar.images.length > 0 && !imageError ? (
          <div className="relative w-full h-full">
            <Image
              src={safeCar.images[0]}
              alt={`${safeCar.make} ${safeCar.model}`}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              onError={() => {
                setImageError(true);
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <CarIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
            isSaved ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={isSaved ? "fill-current" : ""} size={20} />}
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <div className="flex items-center gap-2 mb-1">
            {makeLogoUrl && (
              <div className="h-6 w-12 flex-shrink-0 relative">
                <Image
                  src={makeLogoUrl}
                  alt={safeCar.make}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
            )}
            <h3 className="text-lg font-bold line-clamp-1">
              {safeCar.make} {safeCar.model}
            </h3>
          </div>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(safeCar.price)}
          </span>
        </div>

        <div className="text-gray-600 mb-2 flex items-center">
          <span>{safeCar.year}</span>
          <span className="mx-2">•</span>
          <span>{safeCar.transmission}</span>
          <span className="mx-2">•</span>
          <span>{safeCar.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="bg-gray-50">
            {safeCar.bodyType}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {safeCar.mileage.toLocaleString()} miles
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {safeCar.color}
          </Badge>
        </div>

        <div className="flex justify-between">
          <Button
            className="flex-1"
            onClick={() => {
              if (!safeCar.id) {
                toast.error("Cannot open car details");
                return;
              }
              router.push(`/cars/${safeCar.id}`);
            }}
          >
            View Car
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
