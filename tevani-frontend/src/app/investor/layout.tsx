'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import {
  BarChart3,
  Bell,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Star,
  User,
  Wallet
} from "lucide-react";
import { ThemeToggle } from "../../components/ui/theme-toggle";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (!loading && isAuthenticated && user?.type !== "investor") {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, user, router]);

  // Ensure user is an investor
  if (!loading && isAuthenticated && user?.type !== "investor") {
    return null; // Will be redirected by the useEffect
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-6">
          <Link href="/investor" className="flex items-center gap-2">
            <span className="font-poppins text-xl font-bold text-primary">TEVANI</span>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">Investor</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/investor" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/investor/marketplace" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
            <CreditCard className="h-5 w-5" />
            Marketplace
          </Link>
          <Link href="/investor/starred" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
            <Star className="h-5 w-5" />
            Starred Invoices
          </Link>
          <Link href="/investor/portfolio" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
            <Wallet className="h-5 w-5" />
            Portfolio
          </Link>
          <Link href="/investor/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </Link>
          <Link href="/investor/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
            <User className="h-5 w-5" />
            Profile
          </Link>
          <Link href="/investor/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium rounded-md hover:bg-accent"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t">
        <div className="grid grid-cols-6 h-16">
          <Link href="/investor" className="flex flex-col items-center justify-center">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/investor/marketplace" className="flex flex-col items-center justify-center">
            <CreditCard className="h-5 w-5" />
            <span className="text-xs mt-1">Market</span>
          </Link>
          <Link href="/investor/starred" className="flex flex-col items-center justify-center">
            <Star className="h-5 w-5" />
            <span className="text-xs mt-1">Starred</span>
          </Link>
          <Link href="/investor/portfolio" className="flex flex-col items-center justify-center">
            <Wallet className="h-5 w-5" />
            <span className="text-xs mt-1">Portfolio</span>
          </Link>
          <Link href="/investor/analytics" className="flex flex-col items-center justify-center">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          <Link href="/investor/profile" className="flex flex-col items-center justify-center">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b">
          <div className="flex h-16 items-center px-4 sm:px-6">
            <button className="md:hidden mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </button>
            <div className="ml-auto flex items-center gap-4">
              <ThemeToggle />
              <button className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
                <span className="sr-only">Notifications</span>
              </button>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="font-medium text-sm">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

 
