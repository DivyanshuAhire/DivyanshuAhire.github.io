"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transform transition-transform hover:scale-105">
          StyleP2P
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/"><Button variant="ghost">Browse</Button></Link>
          {user && <Link href="/dashboard/profile"><Button variant="ghost">Profile</Button></Link>}
          {user ? (
             <>
               {user.role === "USER" && <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>}
               {user.role === "ADMIN" && <Link href="/dashboard/admin"><Button variant="ghost">Admin Panel</Button></Link>}
               <Button variant="outline" onClick={logout}>Logout</Button>
             </>
          ) : (
             <>
               <Link href="/login"><Button variant="ghost">Login</Button></Link>
               <Link href="/signup"><Button className="bg-indigo-600 hover:bg-indigo-700">Sign Up</Button></Link>
             </>
          )}
        </div>
      </div>
    </nav>
  );
}
