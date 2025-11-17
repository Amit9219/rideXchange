import { PrismaClient } from "@prisma/client";

let db;

try {
  if (process.env.NODE_ENV === "production") {
    db = new PrismaClient({
      log: process.env.DEBUG ? ['error', 'warn', 'info'] : ['error'],
    });
  } else {
    // In development, use a global to persist the client across hot reloads
    if (!globalThis.prisma) {
      globalThis.prisma = new PrismaClient({
        log: process.env.DEBUG ? ['error', 'warn', 'info'] : ['error'],
      });
    }
    db = globalThis.prisma;
  }
  
  if (!db) {
    throw new Error("Failed to initialize Prisma Client - db is null");
  }
} catch (error) {
  console.error("CRITICAL: Failed to initialize Prisma Client:", error);
  // Create a stub that will fail gracefully
  db = {
    $disconnect: async () => {},
  };
}

export { db };

// Ensure proper cleanup
if (process.env.NODE_ENV !== "production") {
  process.on("beforeExit", async () => {
    try {
      if (globalThis.prisma) {
        await globalThis.prisma.$disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting Prisma:", error);
    }
  });
}
