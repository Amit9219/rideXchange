## Summary of changes

- Fix Featured Cars section to load real AVAILABLE cars from the database, prioritizing cars marked as `featured`.
- Harden authentication integration so Clerk failures no longer crash pages or listings.
- Improve car card rendering behavior and homepage UX, including logo and static data alignment.
- Update dependencies (Next.js, Clerk, Prisma, Supabase, etc.) to more recent versions.

## Technical implementation details

- Updated `getFeaturedCars` in `actions/home.js` to:
  - Query only cars with `status: "AVAILABLE"`.
  - Order results by `featured` (descending) and then `createdAt` (newest first).
  - Return an empty array when no AVAILABLE cars exist, allowing the UI to display its fallback message.
- Made Clerk usage more robust:
  - Wrapped `currentUser()` in `lib/checkUser.js` with try/catch and return `null` when Clerk or DB lookups fail instead of throwing.
  - Updated `getCars` in `actions/car-listing.js` to wrap `auth()` in try/catch, logging a warning and falling back to guest mode when Clerk is not fully configured.
- Refined the `CarCard` component in `components/car-card.jsx`:
  - Introduced a `safeCar` object with defensive defaults and numeric coercion for `price` and `mileage`.
  - Initialized wishlist state from `safeCar.wishlisted` and added explicit checks/logging when toggling saved state.
  - Added an `Image` `onError` handler to hide broken thumbnails and kept an icon fallback when no images exist.
  - Guarded navigation when `id` is missing to avoid pushing invalid routes.
- Tweaked layout and static data:
  - Swapped the header logo to `public/logo1.png` and removed unused logo variants (`logo.png`, `logo-black.png`, `logo-white.png`).
  - Adjusted footer text in `app/layout.js` and ensured waitlist page embeds the created.app form.
  - Extended `lib/data.js` entries with `imageUrl` fields for `carMakes` and `bodyTypes` to align with the homepage image usage.
- Config and dependency updates:
  - Updated `next.config.mjs` experimental flags and remote image patterns (Supabase host/path).
  - Bumped core dependencies in `package.json` and refreshed `package-lock.json` to match.

## Testing steps

- [ ] Start the dev server with `npm run dev`.
- [ ] Visit `/` and verify the **Featured Cars** section shows real cars when there are AVAILABLE cars in the database, and shows the fallback message only when there are none.
- [ ] Toggle the featured flag and status for cars in `/admin/cars` and confirm the homepage ordering reflects `featured` and `createdAt`.
- [ ] Visit `/cars` and filter listings to confirm `getCars` functions normally when signed in and does not crash when Clerk middleware is misconfigured or the user is signed out.
- [ ] Open an individual car detail page at `/cars/[id]` and verify the card images, wishlist button, and test drive CTA behave as expected (including fallback when images are missing).
- [ ] Smoke-test authentication flows (header login, saved cars, reservations) to ensure Clerk failures no longer break the layout.

## Related issues/tickets

- None linked explicitly; this change addresses runtime errors around Clerk middleware usage and the Featured Cars section rendering empty when the database contains valid cars.
