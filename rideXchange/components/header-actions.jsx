"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Heart, CarFront, Layout, ArrowLeft, Wrench } from "lucide-react";

/**
 * Client-side header action buttons.
 *
 * Props:
 * - isAdminPage: boolean – whether we are currently on an admin route
 * - isAdmin: boolean – whether the current user has ADMIN role (from the server)
 */
export function HeaderActions({ isAdminPage = false, isAdmin = false }) {
  return (
    <div className="flex items-center space-x-4">
      {isAdminPage ? (
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link href="/">
            <ArrowLeft size={18} />
            <span>Back to App</span>
          </Link>
        </Button>
      ) : (
        <>
          <Button
            asChild
            variant="outline"
            className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
          >
            <Link href="/service">
              <Wrench size={18} />
              <span className="hidden md:inline">Book Service</span>
            </Link>
          </Button>
          <SignedIn>
          {!isAdmin && (
            <>
              <Button
                asChild
                variant="outline"
                className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
              >
                <Link href="/reservations">
                  <CarFront size={18} />
                  <span className="hidden md:inline">My Reservations</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
              >
                <Link href="/sell-car">
                  <CarFront size={18} />
                  <span className="hidden md:inline">Sell Your Car</span>
                </Link>
              </Button>
            </>
          )}

          <Button asChild className="flex items-center gap-2">
            <Link href="/saved-cars">
              <Heart size={18} />
              <span className="hidden md:inline">Saved Cars</span>
            </Link>
          </Button>

          {isAdmin && (
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link href="/admin">
                <Layout size={18} />
                <span className="hidden md:inline">Admin Portal</span>
              </Link>
            </Button>
          )}
          </SignedIn>
        </>
      )}

      <SignedOut>
        {!isAdminPage && (
          <SignInButton forceRedirectUrl="/">
            <Button variant="outline">Login</Button>
          </SignInButton>
        )}
      </SignedOut>

      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
