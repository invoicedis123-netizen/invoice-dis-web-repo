'use client';


import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import {
 BarChart3,
 Building,
 FileText,
 Home,
 LogOut,
 Menu,
 Settings,
 User,
 X,
 Users,
 FileCheck,
 Wallet,
 Shield,
 Bell
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../../components/ui/theme-toggle";


interface SidebarNavProps {
 isCollapsed: boolean;
 links: {
   title: string;
   label?: string;
   icon: React.ReactNode;
   variant: "default" | "ghost";
   href: string;
 }[];
}


function SidebarNav({ links, isCollapsed }: SidebarNavProps) {
 const pathname = usePathname();


 return (
   <div
     data-collapsed={isCollapsed}
     className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
   >
     <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
       {links.map((link, index) => (
         <Link
           key={index}
           href={link.href}
           className={cn(
             "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
             pathname === link.href
               ? "bg-accent text-accent-foreground"
               : "text-muted-foreground",
             isCollapsed && "justify-center"
           )}
         >
           {link.icon}
           {!isCollapsed && <span>{link.title}</span>}
           {!isCollapsed && link.label && (
             <span className="ml-auto text-xs font-semibold">{link.label}</span>
           )}
         </Link>
       ))}
     </nav>
   </div>
 );
}


export default function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [isMobileOpen, setIsMobileOpen] = useState(false);
 const { user, logout, loading } = useAuth();
 const router = useRouter();


 // Redirect to appropriate dashboard if user is not an admin
 useEffect(() => {
   if (!loading && user) {
     if (user.type === "business") {
       router.push("/dashboard");
     } else if (user.type === "investor") {
       router.push("/investor");
     }
   } else if (!loading && !user) {
     router.push("/auth/login");
   }
 }, [user, loading, router]);


 // Show loading state while checking user type
 if (loading || !user) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
     </div>
   );
 }


 // Ensure user is an admin
 if (user.type !== "admin") {
   return null; // Will be redirected by the useEffect
 }


 const links = [
   {
     title: "Dashboard",
     icon: <Home className="h-4 w-4" />,
     variant: "default" as const,
     href: "/admin",
   },
   {
     title: "Users",
     icon: <Users className="h-4 w-4" />,
     variant: "ghost" as const,
     href: "/admin/users",
   },
   {
     title: "Invoices",
     icon: <FileText className="h-4 w-4" />,
     variant: "ghost" as const,
     href: "/admin/invoices",
   },
   {
     title: "Validation",
     icon: <FileCheck className="h-4 w-4" />,
     variant: "ghost" as const,
     href: "/admin/validation",
   },
   {
     title: "Investments",
     icon: <Wallet className="h-4 w-4" />,
     variant: "ghost" as const,
     href: "/admin/investments",
   },
   {
     title: "Compliance",
     icon: <Shield className="h-4 w-4" />,
     variant: "ghost" as const,
     href: "/admin/compliance",
   },
   {
     title: "Settings",
     icon: <Settings className="h-4 w-4" />,
     variant: "ghost" as const,
     href: "/admin/settings",
   },
 ];


 return (
   <div className="flex min-h-screen flex-col">
     {/* Mobile Header */}
     <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static md:hidden">
       <Button
         variant="outline"
         size="icon"
         className="md:hidden"
         onClick={() => setIsMobileOpen(true)}
       >
         <Menu className="h-5 w-5" />
         <span className="sr-only">Toggle Menu</span>
       </Button>
       <div className="flex-1">
         <Link href="/admin" className="flex items-center gap-2">
           <span className="font-poppins text-xl font-bold text-primary">TEVANI</span>
           <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">Admin</span>
         </Link>
       </div>
       <div className="flex items-center gap-2">
         <ThemeToggle />
         <Button
           variant="ghost"
           size="icon"
           className="relative"
         >
           <Bell className="h-5 w-5" />
           <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
         </Button>
       </div>
     </header>


     <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
       {/* Mobile Sidebar */}
       {isMobileOpen && (
         <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
           <div className="fixed inset-y-0 left-0 z-50 h-full w-3/4 border-r bg-background shadow-lg animate-in slide-in-from-left">
             <div className="flex h-14 items-center px-4 py-4 border-b">
               <Link href="/admin" className="flex items-center gap-2">
                 <span className="font-poppins text-xl font-bold text-primary">TEVANI</span>
                 <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">Admin</span>
               </Link>
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute right-4 top-3"
                 onClick={() => setIsMobileOpen(false)}
               >
                 <X className="h-5 w-5" />
                 <span className="sr-only">Close</span>
               </Button>
             </div>
             <div className="py-4">
               <SidebarNav links={links} isCollapsed={false} />
               <div className="px-6 py-4 mt-4 border-t">
                 <div className="flex items-center gap-2 mb-8">
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                     <User className="h-4 w-4 text-primary" />
                   </div>
                   <div>
                     <div className="font-medium text-sm">{user?.name}</div>
                     <div className="text-xs text-muted-foreground">{user?.email}</div>
                     <div className="text-xs font-medium text-primary">{user?.admin_role}</div>
                   </div>
                 </div>
                 <Button
                   variant="outline"
                   className="w-full justify-start gap-2"
                   onClick={() => logout()}
                 >
                   <LogOut className="h-4 w-4" />
                   Sign Out
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}


       {/* Desktop Sidebar */}
       <aside className="fixed top-0 z-30 hidden h-screen border-r bg-background md:sticky md:block">
         <div className="flex h-full flex-col gap-2">
           <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
             <Link href="/admin" className="flex items-center gap-2 font-semibold">
               <span className="font-poppins text-xl font-bold text-primary">
                 {isCollapsed ? "T" : "TEVANI"}
               </span>
               {!isCollapsed && (
                 <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">Admin</span>
               )}
             </Link>
             <div className="ml-auto flex items-center gap-2">
               <ThemeToggle />
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8"
                 onClick={() => setIsCollapsed(!isCollapsed)}
               >
                 <Menu className="h-4 w-4" />
                 <span className="sr-only">Toggle Sidebar</span>
               </Button>
             </div>
           </div>
           <div className="flex-1">
             <SidebarNav links={links} isCollapsed={isCollapsed} />
           </div>
           <div className={cn(
             "mt-auto p-4 border-t",
             isCollapsed ? "flex justify-center" : ""
           )}>
             {isCollapsed ? (
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => logout()}
               >
                 <LogOut className="h-4 w-4" />
                 <span className="sr-only">Sign Out</span>
               </Button>
             ) : (
               <div>
                 <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                     <User className="h-4 w-4 text-primary" />
                   </div>
                   <div>
                     <div className="font-medium text-sm">{user?.name}</div>
                     <div className="text-xs text-muted-foreground">{user?.email}</div>
                     <div className="text-xs font-medium text-primary capitalize">
                       {user?.admin_role?.replace('_', ' ')}
                     </div>
                   </div>
                 </div>
                 <Button
                   variant="outline"
                   className="w-full justify-start gap-2"
                   onClick={() => logout()}
                 >
                   <LogOut className="h-4 w-4" />
                   Sign Out
                 </Button>
               </div>
             )}
           </div>
         </div>
       </aside>


       {/* Main Content */}
       <main className="flex flex-col">
         <div className="flex-1 space-y-4 p-5 md:p-8">
           {children}
         </div>
       </main>
     </div>
   </div>
 );
}


 





