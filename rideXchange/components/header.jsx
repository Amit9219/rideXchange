import React from "react";
import Link from "next/link";
import Image from "next/image";

import { checkUser } from "@/lib/checkUser";
import { HeaderActions } from "./header-actions";

const Header = async ({ isAdminPage = false }) => {
  // Server-side: get the current user and whether they are an admin.
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex">
          <Image
            src={"/logo1.png"}
            alt="Vehiql Logo"
            width={100}
            height={90000}
            className="h-12 w-auto object-contain"
          />
          {isAdminPage && (
            <span className="text-xs font-extralight">admin</span>
          )}
        </Link>

        {/* Client-side action buttons (Clerk, etc.) */}
        <HeaderActions isAdminPage={isAdminPage} isAdmin={!!isAdmin} />
      </nav>
    </header>
  );
};

export default Header;
