# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Full-stack AI-powered car marketplace built with Next.js 15, featuring AI-driven car search and detail extraction using Google's Gemini AI. Users can buy and sell cars, book test drives, and search for vehicles using image recognition.

## Common Commands

### Development
```powershell
npm install              # Install dependencies
npm run dev             # Start development server with Turbopack (localhost:3000)
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
```

### Database (Prisma)
```powershell
npx prisma generate     # Generate Prisma Client (runs automatically after install)
npx prisma db push      # Push schema changes to database
npx prisma studio       # Open Prisma Studio GUI to view/edit data
npx prisma migrate dev  # Create and apply migrations in dev
npx prisma migrate reset # Reset database and apply all migrations
```

### Supabase Storage
The application uses Supabase for car image storage. Images are stored in the `Car-Images` bucket and organized by car ID in folders (`cars/{carId}/`).

## Environment Variables Required

Create a `.env` file with:
```
DATABASE_URL=                                    # Supabase/PostgreSQL connection string
DIRECT_URL=                                      # Direct database URL (for migrations)
NEXT_PUBLIC_SUPABASE_URL=                       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=                  # Supabase anonymous key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=              # Clerk authentication
CLERK_SECRET_KEY=                               # Clerk secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
GEMINI_API_KEY=                                 # Google Gemini AI API key
ARCJET_KEY=                                     # ArcJet rate limiting/security
```

## High-Level Architecture

### Authentication & Authorization
- **Clerk** handles all authentication (sign-in/sign-up)
- **checkUser utility** (`lib/checkUser.js`) synchronizes Clerk users to local Prisma database on first login
- **Role-based access**: Users have `USER` or `ADMIN` roles in database
- **Admin routes** (`/admin/*`) protected via layout checking user role

### Route Groups & Pages
The app uses Next.js 15 App Router with route groups:

- **`(auth)/`**: Authentication pages (sign-in, sign-up) with centered layout
- **`(main)/`**: Public-facing pages (buy cars, sell car, test drives, saved cars, reservations) with container layout
- **`(admin)/admin/`**: Admin dashboard with sidebar (cars management, test drive bookings, settings, users)
- **`/dashboard`**: User dashboard for choosing buy/sell actions
- **`/waitlist`**: Embedded waitlist iframe page
- **Root `/`**: Homepage with hero, featured cars, search, FAQs

### Server Actions Pattern
All data mutations and fetches use Next.js Server Actions ("use server"):

- **`actions/cars.js`**: Car CRUD operations, AI image processing with Gemini
- **`actions/home.js`**: Featured cars, AI image search with rate limiting
- **`actions/test-drive.js`**: Book, fetch, and cancel test drive bookings
- **`actions/admin.js`**: Admin-only operations (dashboard stats, test drive management)
- **`actions/settings.js`**: Dealership info, working hours, user management
- **`actions/car-listing.js`**: Car listings with filters, save/unsave cars

### AI Integration (Gemini)
- **Image-to-details extraction**: Upload car image → Gemini extracts make, model, year, color, body type, etc.
- **Image search**: Upload image → AI identifies car characteristics → search database
- **Rate limiting**: ArcJet token bucket (10 requests/hour per IP) on AI image search

### Database Models (Prisma)
Key models:
- **User**: Synced with Clerk, has role (USER/ADMIN)
- **Car**: Vehicle listings with status (AVAILABLE/UNAVAILABLE/SOLD), images array, indexed for search
- **TestDriveBooking**: Booking with status (PENDING/CONFIRMED/COMPLETED/CANCELLED/NO_SHOW)
- **UserSavedCar**: Many-to-many relationship for saved/wishlisted cars
- **DealershipInfo & WorkingHour**: Dealership configuration

### Image Upload Flow
1. Client converts images to base64 via `react-dropzone`
2. Server action receives base64 strings
3. Server converts to Buffer and uploads to Supabase Storage (`Car-Images` bucket)
4. Public URLs stored in database as string array

### Middleware Stack
Middleware chains ArcJet (bot detection, shield) → Clerk (authentication):
- **ArcJet**: Blocks bots (allows search engines), applies shield protection
- **Clerk**: Protects routes (`/admin/*`, `/saved-cars/*`, `/reservations/*`)

### Component Architecture
- **Server Components**: Most pages for data fetching and SEO
- **Client Components**: Interactive forms, search UI, image upload
- **Shadcn/ui**: Pre-built UI components in `components/ui/`
- **Custom components**: `car-card.jsx`, `header.jsx`, `buy-car-form.jsx`, etc.

### Utilities & Helpers
- **`lib/prisma.js`**: Singleton Prisma client (reuses instance in dev)
- **`lib/supabase.js`**: Server-side Supabase client factory with cookie handling
- **`lib/helpers.js`**: `formatCurrency` (INR), `serializeCarData` (converts Decimal to float)
- **`lib/data.js`**: Static data (carMakes, bodyTypes, faqItems)
- **`lib/seed-cars.js`**: Auto-seed database with sample cars if empty
- **`hooks/use-fetch.js`**: Client-side hook for async operations with loading/error states and toast notifications

### Styling
- **Tailwind CSS** with custom config (`tailwind.config.mjs`)
- **CSS variables** for themes in `app/globals.css`
- **`cn()` utility** (`lib/utils.js`) for conditional class merging

### Path Aliases
`jsconfig.json` defines `@/*` alias pointing to project root for clean imports.

## Key Development Patterns

### Server Action Error Handling
All server actions follow this pattern:
```javascript
try {
  // Auth check
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // Logic...
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

### Data Serialization
Prisma returns `Decimal` and `Date` types that can't be sent to client. Always serialize:
```javascript
import { serializeCarData } from "@/lib/helpers";
const cars = await db.car.findMany();
return cars.map(serializeCarData);
```

### Rate Limiting with ArcJet
Applied to expensive operations (AI image processing) in server actions:
```javascript
const req = await request();
const decision = await aj.protect(req, { requested: 1 });
if (decision.isDenied()) throw new Error("Too many requests");
```

### Image Handling
- **Public URLs** from Supabase use format: `${SUPABASE_URL}/storage/v1/object/public/Car-Images/${filePath}`
- **File paths** in storage match car IDs: `cars/{carId}/image-{timestamp}-{index}.{ext}`
- When deleting cars, extract path from URL and delete from storage

### Revalidation
After data mutations, revalidate affected pages:
```javascript
revalidatePath("/admin/cars");
revalidatePath(`/cars/${carId}`);
```

## Admin Access

To access admin features, a user must:
1. Be synced to database (automatic on first login)
2. Have `role: "ADMIN"` in User table (manually set via Prisma Studio or SQL)

Admin pages automatically check authorization in layout (`(admin)/layout.js`).

## Testing Approach

No test framework is currently configured. To add tests, check `package.json` and add appropriate test scripts (e.g., Jest, Vitest, Playwright).

## Important Notes

- **Turbopack**: Dev server uses Turbopack (Next.js 15 default) via `--turbopack` flag
- **Windows Paths**: Project is on Windows; use PowerShell for commands
- **Database Seeding**: `lib/seed-cars.js` automatically seeds sample cars on first homepage load if database is empty
- **Currency**: All prices in Indian Rupees (INR), formatted with `formatCurrency` helper
- **Bot Protection**: ArcJet middleware blocks malicious bots but allows search engine crawlers
