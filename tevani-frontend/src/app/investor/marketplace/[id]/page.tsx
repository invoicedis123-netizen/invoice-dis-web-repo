'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Star,
  StarOff,
  User,
  Building,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
  BadgeCheck,
  BadgeDollarSign
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { formatCurrency, formatDate } from "../../../../lib/utils";
import { invoiceAPI } from "../../../../lib/api";

export default function InvoiceDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const invoiceId = params.id as string;
        
        // Fetch invoice details from API
        const data = await invoiceAPI.getInvoice(invoiceId);
        
        // Calculate days to maturity
        const dueDate = new Date(data.due_date);
        const today = new Date();
        const daysToMaturity = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Calculate return rate based on risk tier
        let returnRate = 12.0; // Base rate
        if (data.risk_tier === 'B') returnRate = 14.0;
        if (data.risk_tier === 'C') returnRate = 15.5;
        if (data.risk_tier === 'D') returnRate = 17.0;
        
        // Check if invoice is starred
        const starredInvoices = JSON.parse(localStorage.getItem('starredInvoices') || '[]');
        const starred = starredInvoices.includes(data.id);
        setIsStarred(starred);
        
        // Process invoice data
        const processedInvoice = {
          ...data,
          company_name: data.seller_name || "Unknown Company",
          industry: data.industry || "Miscellaneous",
          days_to_maturity: daysToMaturity,
          return_rate: returnRate
        };
        
        setInvoice(processedInvoice);
      } catch (error) {
        console.error("Failed to fetch invoice details:", error);
        setError("Failed to load invoice details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceDetails();
  }, [params.id]);

  // Toggle star status
  const toggleStar = () => {
    const invoiceId = params.id as string;
    const starredInvoices = JSON.parse(localStorage.getItem('starredInvoices') || '[]');
    
    if (isStarred) {
      // Remove from starred
      const updatedStarred = starredInvoices.filter((id: string) => id !== invoiceId);
      localStorage.setItem('starredInvoices', JSON.stringify(updatedStarred));
    } else {
      // Add to starred
      starredInvoices.push(invoiceId);
      localStorage.setItem('starredInvoices', JSON.stringify(starredInvoices));
    }
    
    setIsStarred(!isStarred);
    // In a real app, you would also make an API call to update the starred status on the server
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Invoice</h2>
        <p className="text-muted-foreground mb-6">{error || "Invoice not found"}</p>
        <Button asChild>
          <Link href="/investor/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/investor/marketplace">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{invoice.invoice_number}</h1>
            <p className="text-muted-foreground">
              {invoice.company_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleStar}
            className={isStarred ? "text-yellow-500" : ""}
          >
            {isStarred ? (
              <Star className="h-4 w-4 fill-current" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
          <Button asChild>
            <Link href={`/investor/invest/${invoice.id}`}>
              <BadgeDollarSign className="mr-2 h-4 w-4" />
              Invest Now
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Complete information about this invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Amount</p>
                  <p className="text-lg font-semibold">{formatCurrency(invoice.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Amount</p>
                  <p className="text-lg font-semibold">{formatCurrency(invoice.available_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Rate</p>
                  <p className="text-lg font-semibold text-green-600">{invoice.return_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(invoice.invoice_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(invoice.due_date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Term</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>{invoice.days_to_maturity} days</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Seller Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p>{invoice.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p>{invoice.industry}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Buyer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p>{invoice.buyer_name || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Status</p>
                      <p className="text-green-600">Verified</p>
                    </div>
                  </div>
                </div>
              </div>

              {invoice.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">{invoice.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Invoice and supporting documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Invoice Document</p>
                      <p className="text-xs text-muted-foreground">PDF • Verified</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
                {invoice.supporting_docs && invoice.supporting_docs.length > 0 && (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Supporting Documents</p>
                        <p className="text-xs text-muted-foreground">ZIP • {invoice.supporting_docs.length} files</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    invoice.risk_tier === 'A' ? 'bg-green-100 text-green-800' :
                    invoice.risk_tier === 'B' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.risk_tier}
                  </div>
                  <div>
                    <p className="font-medium">Risk Tier {invoice.risk_tier}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.risk_tier === 'A' ? 'Low Risk' : 
                       invoice.risk_tier === 'B' ? 'Medium Risk' : 'High Risk'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm">Trust Score</p>
                  <p className="font-medium">{invoice.trust_score}%</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      invoice.trust_score >= 80 ? 'bg-green-500' :
                      invoice.trust_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${invoice.trust_score}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <p className="text-sm">Buyer Verification Complete</p>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                  <p className="text-sm">Invoice Validated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Available Amount</p>
                  <p className="font-medium">{formatCurrency(invoice.available_amount)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Return Rate</p>
                  <p className="font-medium text-green-600">{invoice.return_rate}%</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Term</p>
                  <p className="font-medium">{invoice.days_to_maturity} days</p>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Potential Return</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(invoice.available_amount * (invoice.return_rate / 100) * (invoice.days_to_maturity / 365))}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/investor/invest/${invoice.id}`}>
                  <BadgeDollarSign className="mr-2 h-4 w-4" />
                  Invest Now
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

 
