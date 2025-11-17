export const featuredCars = [
  {
    id: 1,
    make: "Toyota",
    model: "Camry",
    year: 2023,
    // Price in INR (₹47,00,000)
    price: 4700000,
    images: ["/1.png"],
    transmission: "Automatic",
    fuelType: "Gasoline",
    bodyType: "Sedan",
    mileage: 15000,
    color: "White",
    wishlisted: false,
  },
  {
    id: 2,
    make: "Honda",
    model: "Civic",
    year: 2023,
    // Price in INR (₹19,00,000)
    price: 1900000,
    images: ["/2.webp"],
    transmission: "Manual",
    fuelType: "Gasoline",
    bodyType: "Sedan",
    mileage: 12000,
    color: "Blue",
    wishlisted: true,
  },
  {
    id: 3,
    make: "Tesla",
    model: "Model 3",
    year: 2022,
    // Price in INR (₹65,00,000)
    price: 6500000,
    images: ["/3.jpg"],
    transmission: "Automatic",
    fuelType: "Electric",
    bodyType: "Sedan",
    mileage: 8000,
    color: "Red",
    wishlisted: false,
  },
];

export const carMakes = [
  { id: 1, name: "Hyundai", image: "/make/hyundai.webp", imageUrl: "/make/hyundai.webp" },
  { id: 2, name: "Honda", image: "/make/honda.webp", imageUrl: "/make/honda.webp" },
  { id: 3, name: "BMW", image: "/make/bmw.webp", imageUrl: "/make/bmw.webp" },
  { id: 4, name: "Tata", image: "/make/tata.webp", imageUrl: "/make/tata.webp" },
  { id: 5, name: "Mahindra", image: "/make/mahindra.webp", imageUrl: "/make/mahindra.webp" },
  { id: 6, name: "Ford", image: "/make/ford.webp", imageUrl: "/make/ford.webp" },
  { id: 9, name: "Mercedes-Benz", image: "/make/Benz.png", imageUrl: "/make/Benz.png" },
  { id: 10, name: "Mercedes", image: "/make/Benz.png", imageUrl: "/make/Benz.png" },
  { id: 11, name: "Audi", image: "/make/Audi.png", imageUrl: "/make/Audi.png" },
  // Additional makes that might appear from user-added cars.
  // These use remote logo URLs so they work even without local image files.
  {
    id: 7,
    name: "Tesla",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",
  },
  { id: 8, name: "Toyota", image: "/make/toyota.png", imageUrl: "/make/toyota.png" },
];

export const bodyTypes = [
  { id: 1, name: "SUV", image: "/body/suv.webp", imageUrl: "/body/suv.webp" },
  { id: 2, name: "Sedan", image: "/body/sedan.webp", imageUrl: "/body/sedan.webp" },
  { id: 3, name: "Hatchback", image: "/body/hatchback.webp", imageUrl: "/body/hatchback.webp" },
  { id: 4, name: "Convertible", image: "/body/convertible.webp", imageUrl: "/body/convertible.webp" },
];

export const faqItems = [
  {
    question: "How does the test drive booking work?",
    answer:
      "Simply find a car you're interested in, click the 'Test Drive' button, and select an available time slot. Our system will confirm your booking and provide all necessary details.",
  },
  {
    question: "Can I search for cars using an image?",
    answer:
      "Yes! Our AI-powered image search lets you upload a photo of a car you like, and we'll find similar models in our inventory.",
  },
  {
    question: "Are all cars certified and verified?",
    answer:
      "All cars listed on our platform undergo a verification process. We are a trusted dealerships and verified private seller.",
  },
  {
    question: "What happens after I book a test drive?",
    answer:
      "After booking, you'll receive a confirmation email with all the details. We will also contact you to confirm and provide any additional information.",
  },
];
