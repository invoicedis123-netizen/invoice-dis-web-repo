'use client';


import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { userAPI } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Building, CheckCircle, FileText, Upload, User, Users } from "lucide-react";


export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Business Information
    businessType: user?.business_profile?.businessType || "",
    industry: "",
    yearEstablished: "",
    numberOfEmployees: "",
    website: "",
   
    // Banking Information
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
   
    // Document Upload
    gstCertificate: null as File | null,
    panCard: null as File | null,
    udyamCertificate: null as File | null,
    bankStatement: null as File | null,
   
    // Contact Information
    contactName: "",
    contactEmail: user?.email || "",
    contactPhone: user?.business_profile?.phone || "",
    contactDesignation: "",
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [fieldName]: e.target.files?.[0] || null }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
   
    try {
      // Create business profile object from form data
      const businessProfile = {
        business_type: formData.businessType,
        gst_status: "gst-registered", // Default value, can be made dynamic
        company_name: user?.name || "",
        gstin: "", // Can be added to form if needed
        pan: "", // Can be added to form if needed
        udyam: "", // Can be added to form if needed
        business_address: "", // Can be added to form if needed
        city: "", // Can be added to form if needed
        state: "", // Can be added to form if needed
        annual_turnover: "", // Can be added to form if needed
      };
      
      // Update user profile with business profile data
      await userAPI.updateProfile({
        business_profile: businessProfile
      });
      
      // Redirect to dashboard after onboarding
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setLoading(false);
    }
  };


  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };


  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center px-4 sm:px-8">
          <div className="font-poppins text-xl font-bold text-primary">TEVANI</div>
        </div>
      </header>
     
      <main className="flex-1 container py-8 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
            <p className="text-muted-foreground mt-2">
              Let's set up your business profile to help you get started with invoice financing.
            </p>
          </div>
         
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10" />
             
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex flex-col items-center gap-2 ${
                    step <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step === currentStep
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{step}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {step === 1 && "Business Info"}
                    {step === 2 && "Banking Details"}
                    {step === 3 && "Documents"}
                    {step === 4 && "Contacts"}
                  </span>
                </div>
              ))}
            </div>
          </div>
         
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Business Information"}
                {currentStep === 2 && "Banking Details"}
                {currentStep === 3 && "Document Upload"}
                {currentStep === 4 && "Contact Information"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Tell us more about your business"}
                {currentStep === 2 && "Add your banking information for payments"}
                {currentStep === 3 && "Upload required documents for verification"}
                {currentStep === 4 && "Add key contacts for your business"}
              </CardDescription>
            </CardHeader>
           
            <CardContent>
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select
                          value={formData.businessType}
                          onValueChange={(value) => handleSelectChange("businessType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="msme">MSME</SelectItem>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="private-limited">Private Limited</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="proprietorship">Proprietorship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleSelectChange("industry", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="it-services">IT Services</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="agriculture">Agriculture</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="logistics">Logistics</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearEstablished">Year Established</Label>
                        <Input
                          id="yearEstablished"
                          name="yearEstablished"
                          type="number"
                          placeholder="YYYY"
                          value={formData.yearEstablished}
                          onChange={handleInputChange}
                        />
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                        <Select
                          value={formData.numberOfEmployees}
                          onValueChange={(value) => handleSelectChange("numberOfEmployees", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10</SelectItem>
                            <SelectItem value="11-50">11-50</SelectItem>
                            <SelectItem value="51-200">51-200</SelectItem>
                            <SelectItem value="201-500">201-500</SelectItem>
                            <SelectItem value="500+">500+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                   
                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
               
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        name="bankName"
                        placeholder="Enter bank name"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          name="accountNumber"
                          placeholder="Enter account number"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          name="ifscCode"
                          placeholder="Enter IFSC code"
                          value={formData.ifscCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                   
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => handleSelectChange("accountType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">Current Account</SelectItem>
                          <SelectItem value="savings">Savings Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
               
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="gstCertificate">GST Certificate</Label>
                        <div className="border border-dashed border-border rounded-md p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">
                              {formData.gstCertificate ? formData.gstCertificate.name : "Upload GST Certificate"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PDF or image file (max 5MB)
                            </div>
                            <Input
                              id="gstCertificate"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, "gstCertificate")}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("gstCertificate")?.click()}
                            >
                              Select File
                            </Button>
                          </div>
                        </div>
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="panCard">PAN Card</Label>
                        <div className="border border-dashed border-border rounded-md p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">
                              {formData.panCard ? formData.panCard.name : "Upload PAN Card"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PDF or image file (max 5MB)
                            </div>
                            <Input
                              id="panCard"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, "panCard")}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("panCard")?.click()}
                            >
                              Select File
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="udyamCertificate">Udyam Certificate (Optional)</Label>
                        <div className="border border-dashed border-border rounded-md p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">
                              {formData.udyamCertificate ? formData.udyamCertificate.name : "Upload Udyam Certificate"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PDF or image file (max 5MB)
                            </div>
                            <Input
                              id="udyamCertificate"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, "udyamCertificate")}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("udyamCertificate")?.click()}
                            >
                              Select File
                            </Button>
                          </div>
                        </div>
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="bankStatement">Bank Statement (Last 6 months)</Label>
                        <div className="border border-dashed border-border rounded-md p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">
                              {formData.bankStatement ? formData.bankStatement.name : "Upload Bank Statement"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PDF file (max 10MB)
                            </div>
                            <Input
                              id="bankStatement"
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={(e) => handleFileChange(e, "bankStatement")}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById("bankStatement")?.click()}
                            >
                              Select File
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
               
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          placeholder="Enter full name"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="contactDesignation">Designation</Label>
                        <Input
                          id="contactDesignation"
                          name="contactDesignation"
                          placeholder="Enter designation"
                          value={formData.contactDesignation}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                     
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          placeholder="Enter phone number"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
           
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
             
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Completing..." : "Complete Onboarding"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}


 





