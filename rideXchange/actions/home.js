"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import { seedCarsIfEmpty } from "@/lib/seed-cars";

// Function to serialize car data
function serializeCarData(car) {
  return {
    ...car,
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt?.toISOString(),
    updatedAt: car.updatedAt?.toISOString(),
  };
}

/**
 * Get featured cars for the homepage from the database.
 *
 * - Ensures the Car table is seeded with a few sample cars if it's empty.
 * - Returns AVAILABLE cars only.
 * - Featured cars appear first, then newest cars.
 * - On error, returns an empty array so the UI can show its fallback message
 *   instead of a 500 error.
 */
export async function getFeaturedCars(limit = 3) {
  try {
    // In dev/empty DB, seed a few samples from lib/data.js
    await seedCarsIfEmpty();

    const cars = await db.car.findMany({
      where: {
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return cars.map(serializeCarData);
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    return [];
  }
}

// Function to convert File to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

/**
 * Process car image with Gemini AI
 */
export async function processImageSearch(file) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Convert image file to base64
    const base64Image = await fileToBase64(file);

    // Create image part for the model
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    // Define the prompt for car search extraction
    const prompt = `
      Carefully analyze this car image and extract the following information:
      1. Make (manufacturer) - Look for logos, badges, distinctive design elements. Be very specific and accurate.
      2. Body type (SUV, Sedan, Hatchback, Truck, Coupe, etc.)
      3. Color - The primary exterior color

      IMPORTANT: Be as accurate as possible with the make/manufacturer. Look for:
      - Brand logos/emblems on the front grille or hood
      - Distinctive design characteristics unique to that brand
      - Overall shape and proportions that identify the manufacturer

      Format your response ONLY as a JSON object, no other text:
      {
        "make": "actual_manufacturer_name",
        "bodyType": "body_type",
        "color": "color",
        "confidence": 0.0
      }

      Confidence: value between 0 and 1 (1.0 = very confident, 0.0 = not confident)
      ONLY respond with the JSON object, nothing else.
    `;

    // Get response from Gemini
    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    // Parse the JSON response
    try {
      const carDetails = JSON.parse(cleanedText);

      // Return success response with data
      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    throw new Error("AI Search error:" + error.message);
  }
}
