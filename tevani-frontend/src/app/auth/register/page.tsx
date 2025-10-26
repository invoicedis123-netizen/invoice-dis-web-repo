'use client';


import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Building, Users, Factory, Rocket } from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"
import { PasswordInput } from "../../../components/ui/password-input"


export default function RegisterPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type")
  const [activeTab, setActiveTab] = useState<"business" | "investor">(type === "investor" ? "investor" : "business")
  const [businessType, setBusinessType] = useState<"msme" | "startup" | "">("")
  const [gstStatus, setGstStatus] = useState<"gst-registered" | "non-gst" | "">("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    gstin: "",
    pan: "",
    udyam: "",
    businessAddress: "",
    city: "",
    state: "",
    annualTurnover: "",
    password: "",
    confirmPassword: "",
    investorType: "",
    investmentCapacity: "",
  })
 
  const { register } = useAuth()
  const router = useRouter()


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")


    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }


    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }


    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      setLoading(false);
      return;
    }


    try {
      const registrationData = {
        name: activeTab === "business"
          ? formData.companyName
          : `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        type: activeTab,
        ...(activeTab === "business" && {
          companyName: formData.companyName,
          gstin: formData.gstin,
          pan: formData.pan,
          udyam: formData.udyam,
          businessAddress: formData.businessAddress,
          city: formData.city,
          state: formData.state,
          annualTurnover: formData.annualTurnover,
          businessType,
          gstStatus,
        }),
        ...(activeTab === "investor" && {
          investorType: formData.investorType,
          investmentCapacity: formData.investmentCapacity,
        }),
      }


      await register(registrationData)
      router.push(activeTab === "business" ? "/dashboard" : "/investor")
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="font-poppins text-2xl font-bold text-primary">TEVANI</span>
        </Link>
        <Card className="bg-card/90 backdrop-blur-sm border-border shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
            <CardDescription className="text-center">Choose your account type and fill in your details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "business" | "investor")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Business</span>
                </TabsTrigger>
                <TabsTrigger value="investor" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Investor</span>
                </TabsTrigger>
              </TabsList>
             
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
                  {error}
                </div>
              )}


              <TabsContent value="business">
                {!businessType || !gstStatus ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Business Type</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant={businessType === "msme" ? "default" : "outline"}
                            onClick={() => setBusinessType("msme")}
                            className="flex items-center gap-2"
                          >
                            <Factory className="h-4 w-4" />
                            MSME
                          </Button>
                          <Button
                            type="button"
                            variant={businessType === "startup" ? "default" : "outline"}
                            onClick={() => setBusinessType("startup")}
                            className="flex items-center gap-2"
                          >
                            <Rocket className="h-4 w-4" />
                            Startup
                          </Button>
                        </div>
                      </div>
                     
                      {businessType && (
                        <div className="space-y-2">
                          <Label>GST Registration Status</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              type="button"
                              variant={gstStatus === "gst-registered" ? "default" : "outline"}
                              onClick={() => setGstStatus("gst-registered")}
                            >
                              GST Registered
                            </Button>
                            <Button
                              type="button"
                              variant={gstStatus === "non-gst" ? "default" : "outline"}
                              onClick={() => setGstStatus("non-gst")}
                            >
                              Non-GST
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="mb-4 p-4 bg-accent/50 rounded-lg border border-border">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        {businessType === "msme" ? <Factory className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
                        {businessType === "msme" ? "MSME" : "Startup"} - {gstStatus === "gst-registered" ? "GST Registered" : "Non-GST Registered"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {businessType === "msme"
                          ? "Register as a Micro, Small & Medium Enterprise to unlock working capital."
                          : "Register as a Startup to access quick funding for your growing business."}
                      </p>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-business">Email *</Label>
                        <Input
                          id="email-business"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone-business">Phone Number *</Label>
                        <Input
                          id="phone-business"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pan-business">PAN Number *</Label>
                        <Input
                          id="pan-business"
                          name="pan"
                          value={formData.pan}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>


                    {gstStatus === "gst-registered" && (
                      <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN *</Label>
                        <Input
                          id="gstin"
                          name="gstin"
                          value={formData.gstin}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}


                    {gstStatus === "non-gst" && (
                      <div className="space-y-2">
                        <Label htmlFor="udyam">Udyam Registration Number</Label>
                        <Input
                          id="udyam"
                          name="udyam"
                          value={formData.udyam}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}


                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Business Address *</Label>
                      <Input
                        id="businessAddress"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        required
                      />
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="gujarat">Gujarat</SelectItem>
                            <SelectItem value="rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                            <SelectItem value="west-bengal">West Bengal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="annualTurnover">Annual Turnover (₹) *</Label>
                      <Select
                        value={formData.annualTurnover}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, annualTurnover: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select turnover range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-25lakh">Up to ₹25 Lakh</SelectItem>
                          <SelectItem value="25lakh-5cr">₹25 Lakh - ₹5 Crore</SelectItem>
                          <SelectItem value="5cr-25cr">₹5 Crore - ₹25 Crore</SelectItem>
                          <SelectItem value="25cr-100cr">₹25 Crore - ₹100 Crore</SelectItem>
                          <SelectItem value="100cr+">Above ₹100 Crore</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password-business">Password *</Label>
                        <PasswordInput
                          id="password-business"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword-business">Confirm Password *</Label>
                        <PasswordInput
                          id="confirmPassword-business"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>


                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Business Account"}
                    </Button>
                   
                    <div className="flex justify-start">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setBusinessType("")
                          setGstStatus("")
                        }}
                        className="text-sm"
                      >
                        ← Back to selection
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>


              <TabsContent value="investor">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-investor">Email *</Label>
                      <Input
                        id="email-investor"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone-investor">Phone Number *</Label>
                      <Input
                        id="phone-investor"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="investorType">Investor Type *</Label>
                      <Select value={formData.investorType} onValueChange={(value) => setFormData(prev => ({ ...prev, investorType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select investor type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="hni">High Net Worth Individual (HNI)</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="family-office">Family Office</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="investmentCapacity">Investment Capacity (₹) *</Label>
                      <Select
                        value={formData.investmentCapacity}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, investmentCapacity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select investment range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5lakh">₹1 - ₹5 Lakh</SelectItem>
                          <SelectItem value="5-25lakh">₹5 - ₹25 Lakh</SelectItem>
                          <SelectItem value="25lakh-1cr">₹25 Lakh - ₹1 Crore</SelectItem>
                          <SelectItem value="1cr+">Above ₹1 Crore</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="pan-investor">PAN Number *</Label>
                    <Input
                      id="pan-investor"
                      name="pan"
                      value={formData.pan}
                      onChange={handleInputChange}
                      required
                    />
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-investor">Password *</Label>
                      <PasswordInput
                        id="password-investor"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword-investor">Confirm Password *</Label>
                      <PasswordInput
                        id="confirmPassword-investor"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>


                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Investor Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>


            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


 





