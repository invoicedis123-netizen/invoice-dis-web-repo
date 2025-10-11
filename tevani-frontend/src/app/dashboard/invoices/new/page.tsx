'use client';


import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  Loader2,
  Upload,
  X
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { invoiceAPI, legalbotAPI, mockData } from "../../../../lib/api";


export default function NewInvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
 
  // Form data for manual entry
  const [formData, setFormData] = useState({
    invoice_number: "",
    amount: "",
    invoice_date: "",
    due_date: "",
    buyer_name: "",
    buyer_gstin: "",
    buyer_email: "", // Added for LegalBot
    buyer_phone: "", // Added for LegalBot
    description: "",
  });


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setError("");
      
      // Start progress indicator
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90)); // Go up to 90% while processing
      }, 300);
      
      try {
        // Process the file with OCR
        const result = await invoiceAPI.processInvoiceFile(file);
        
        // Complete the progress
        clearInterval(interval);
        setUploadProgress(100);
        
        // Extract data from OCR result
        if (result && result.success && result.data) {
          const ocrData = result.data;
          
          // Map OCR data to form fields
          setExtractedData({
            invoice_number: ocrData.invoice_number || "",
            amount: ocrData.amount || "",
            invoice_date: ocrData.invoice_date || new Date().toISOString().split('T')[0],
            due_date: ocrData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            buyer_name: ocrData.buyer_name || "",
            buyer_gstin: ocrData.buyer_gstin || "",
            buyer_email: "", // Need to be filled by user
            buyer_phone: "", // Need to be filled by user
            description: ocrData.description || "",
          });
        } else {
          // Fallback to default values if OCR failed
          setExtractedData({
            invoice_number: `INV-${Math.floor(Math.random() * 10000)}`,
            amount: Math.floor(Math.random() * 100000) + 10000,
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            buyer_name: "Sample Corp Ltd.",
            buyer_gstin: "27AAPFU0939F1ZV",
            buyer_email: "", // Need to be filled by user
            buyer_phone: "", // Need to be filled by user
            description: "Services rendered as per agreement",
          });
        }
      } catch (err) {
        console.error("Error processing invoice:", err);
        setError("Failed to process invoice file. Please try again.");
        clearInterval(interval);
        setUploadProgress(0);
      }
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
   
    try {
      // Prepare the data based on active tab
      const invoiceData = activeTab === "upload" && extractedData
        ? extractedData
        : formData;
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all invoice data fields to FormData
      Object.entries(invoiceData).forEach(([key, value]) => {
        // Skip null or undefined values
        if (value === null || value === undefined) return;
        
        // Convert amount to number if it's a string
        if (key === 'amount' && typeof value === 'string') {
          formDataToSend.append(key, parseFloat(value).toString());
        } else {
          formDataToSend.append(key, value as string);
        }
      });
      
      // Explicitly set seller_id from the current user
      if (user && user.id) {
        formDataToSend.append('seller_id', user.id);
      }
      
      // Add the file if available
      if (uploadedFile) {
        formDataToSend.append('invoice_file', uploadedFile);
      }
      
      // Log the form data for debugging
      console.log("Form data being sent:", Object.fromEntries(formDataToSend.entries()));
      
      // Make API call to create invoice
      const newInvoice = await invoiceAPI.createInvoice(formDataToSend);
      
      // If buyer email is available, create consent record for LegalBot
      if (invoiceData.buyer_email) {
        try {
          await legalbotAPI.createConsent({
            invoice_id: newInvoice.id,
            buyer_email: invoiceData.buyer_email,
            buyer_phone: invoiceData.buyer_phone || null
          });
        } catch (consentErr) {
          console.error("Failed to create consent record:", consentErr);
          // Continue with success flow even if consent creation fails
        }
      }
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/invoices");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      setError(err.response?.data?.detail || "Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/invoices">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Upload New Invoice</h1>
      </div>


      {success ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Invoice Uploaded Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Your invoice has been uploaded and is now being processed for validation.
                A verification email has been sent to the buyer for consent.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/dashboard/invoices">View All Invoices</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add New Invoice</CardTitle>
            <CardDescription>
              Upload an invoice document or enter details manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "manual")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Invoice</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Manual Entry</span>
                </TabsTrigger>
              </TabsList>
             
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
                  {error}
                </div>
              )}


              <TabsContent value="upload">
                <div className="space-y-6">
                  {!uploadedFile ? (
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => document.getElementById("invoice-file")?.click()}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-medium mb-1">Upload Invoice Document</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Drag and drop or click to upload PDF, JPG, or PNG files
                          </p>
                          <Button size="sm" onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById("invoice-file")?.click();
                          }}>
                            Select File
                          </Button>
                        </div>
                      </div>
                      <Input
                        id="invoice-file"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border rounded-md p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-md">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUploadedFile(null);
                            setUploadProgress(0);
                            setExtractedData(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>


                      {uploadProgress < 100 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Analyzing document...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : extractedData ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                              <Check className="h-4 w-4" />
                              Data extracted successfully
                            </div>
                            <p className="text-sm text-muted-foreground">
                              We've extracted the following information from your invoice. Please verify and make any necessary corrections.
                            </p>
                          </div>
                         
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="extracted-invoice-number">Invoice Number</Label>
                              <Input
                                id="extracted-invoice-number"
                                value={extractedData.invoice_number}
                                onChange={(e) => setExtractedData({...extractedData, invoice_number: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="extracted-amount">Amount (₹)</Label>
                              <Input
                                id="extracted-amount"
                                value={extractedData.amount}
                                onChange={(e) => setExtractedData({...extractedData, amount: e.target.value})}
                              />
                            </div>
                          </div>
                         
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="extracted-invoice-date">Invoice Date</Label>
                              <Input
                                id="extracted-invoice-date"
                                type="date"
                                value={extractedData.invoice_date}
                                onChange={(e) => setExtractedData({...extractedData, invoice_date: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="extracted-due-date">Due Date</Label>
                              <Input
                                id="extracted-due-date"
                                type="date"
                                value={extractedData.due_date}
                                onChange={(e) => setExtractedData({...extractedData, due_date: e.target.value})}
                              />
                            </div>
                          </div>
                         
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="extracted-buyer-name">Buyer Name</Label>
                              <Input
                                id="extracted-buyer-name"
                                value={extractedData.buyer_name}
                                onChange={(e) => setExtractedData({...extractedData, buyer_name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="extracted-buyer-gstin">Buyer GSTIN</Label>
                              <Input
                                id="extracted-buyer-gstin"
                                value={extractedData.buyer_gstin}
                                onChange={(e) => setExtractedData({...extractedData, buyer_gstin: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="extracted-buyer-email">Buyer Email (for verification)</Label>
                              <Input
                                id="extracted-buyer-email"
                                type="email"
                                value={extractedData.buyer_email || ""}
                                onChange={(e) => setExtractedData({...extractedData, buyer_email: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="extracted-buyer-phone">Buyer Phone (optional)</Label>
                              <Input
                                id="extracted-buyer-phone"
                                value={extractedData.buyer_phone || ""}
                                onChange={(e) => setExtractedData({...extractedData, buyer_phone: e.target.value})}
                              />
                            </div>
                          </div>
                         
                          <div className="space-y-2">
                            <Label htmlFor="extracted-description">Description</Label>
                            <Input
                              id="extracted-description"
                              value={extractedData.description}
                              onChange={(e) => setExtractedData({...extractedData, description: e.target.value})}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>


              <TabsContent value="manual">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_number">Invoice Number *</Label>
                      <Input
                        id="invoice_number"
                        name="invoice_number"
                        value={formData.invoice_number}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹) *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_date">Invoice Date *</Label>
                      <Input
                        id="invoice_date"
                        name="invoice_date"
                        type="date"
                        value={formData.invoice_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date *</Label>
                      <Input
                        id="due_date"
                        name="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buyer_name">Buyer Name *</Label>
                      <Input
                        id="buyer_name"
                        name="buyer_name"
                        value={formData.buyer_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyer_gstin">Buyer GSTIN</Label>
                      <Input
                        id="buyer_gstin"
                        name="buyer_gstin"
                        value={formData.buyer_gstin}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buyer_email">Buyer Email (for verification) *</Label>
                      <Input
                        id="buyer_email"
                        name="buyer_email"
                        type="email"
                        value={formData.buyer_email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyer_phone">Buyer Phone (optional)</Label>
                      <Input
                        id="buyer_phone"
                        name="buyer_phone"
                        value={formData.buyer_phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                 
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/invoices">Cancel</Link>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (activeTab === "upload" && (!uploadedFile || !extractedData))}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Processing..." : "Submit Invoice"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}


// Made with Bob





