'use client';




import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Building, Users, Shield } from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"
import { PasswordInput } from "../../../components/ui/password-input"




export default function LoginPage() {
 const [activeTab, setActiveTab] = useState<"business" | "investor" | "admin">("business")
 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [error, setError] = useState("")
 const [loading, setLoading] = useState(false)
 const { login } = useAuth()
 const router = useRouter()




 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   setLoading(true)
   setError("")




   try {
     await login(email, password, activeTab)
     if (activeTab === "business") {
       router.push("/dashboard");
     } else if (activeTab === "investor") {
       router.push("/investor");
     } else if (activeTab === "admin") {
       router.push("/admin");
     }
   } catch (err) {
     setError("Invalid email or password")
   } finally {
     setLoading(false)
   }
 }




 return (
   <div className="min-h-screen flex items-center justify-center bg-background p-4">
     <div className="w-full max-w-md">
       <Link href="/" className="flex items-center justify-center mb-8">
         <span className="font-poppins text-2xl font-bold text-primary">TEVANI</span>
       </Link>
       <Card className="bg-card/90 backdrop-blur-sm border-border shadow-xl">
         <CardHeader className="space-y-1">
           <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
           <CardDescription className="text-center">Choose your account type and enter your credentials</CardDescription>
         </CardHeader>
         <CardContent>
           <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "business" | "investor" | "admin")} className="w-full">
             <TabsList className="grid w-full grid-cols-3 mb-6">
               <TabsTrigger value="business" className="flex items-center gap-2">
                 <Building className="h-4 w-4" />
                 <span>Business</span>
               </TabsTrigger>
               <TabsTrigger value="investor" className="flex items-center gap-2">
                 <Users className="h-4 w-4" />
                 <span>Investor</span>
               </TabsTrigger>
               <TabsTrigger value="admin" className="flex items-center gap-2">
                 <Shield className="h-4 w-4" />
                 <span>Admin</span>
               </TabsTrigger>
             </TabsList>
           
             {error && (
               <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
                 {error}
               </div>
             )}




             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   placeholder="name@example.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <Label htmlFor="password">Password</Label>
                   <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                     Forgot password?
                   </Link>
                 </div>
                 <PasswordInput
                   id="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                 />
               </div>
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                 {loading ? "Signing in..." : "Sign in"}
               </Button>
             </form>
           </Tabs>




           <div className="mt-6 text-center text-sm">
             <span className="text-muted-foreground">Don't have an account? </span>
             <Link
               href={`/auth/register?type=${activeTab}`}
               className="text-primary hover:underline font-medium"
             >
               Sign up
             </Link>
           </div>
         </CardContent>
       </Card>
     </div>
   </div>
 )
}




 















