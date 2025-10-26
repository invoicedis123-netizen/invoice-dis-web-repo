'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ArrowLeft,
  BadgeDollarSign,
  Loader2,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Separator } from "../../../../components/ui/separator";
import { formatCurrency, formatDate } from "../../../../lib/utils";
import { invoiceAPI } from "../../../../lib/api";

export default function InvestPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
        
        // Process invoice data
        const processedInvoice = {
          ...data,
          company_name: data.seller_name || "Unknown Company",
          industry: data.industry || "Miscellaneous",
          days_to_maturity: daysToMaturity,
          return_rate: returnRate
        };
        
        setInvoice(processedInvoice);
        // Set default investment amount to 25% of available amount
        setInvestmentAmount((Math.round(processedInvoice.available_amount * 0.25 / 1000) * 1000).toString());
      } catch (error) {
        console.error("Failed to fetch invoice details:", error);
        setError("Failed to load invoice details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceDetails();
  }, [params.id]);

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      setError("Please enter a valid investment amount");
      return;
    }
    
    if (parseFloat(investmentAmount) > invoice.available_amount) {
      setError("Investment amount cannot exceed available amount");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // In a real app, this would make an API call to create an investment
      // For now, we'll simulate a successful investment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirect to portfolio after a short delay
      setTimeout(() => {
        router.push('/investor/portfolio');
      }, 2000);
      
    } catch (error) {
      console.error("Failed to submit investment:", error);
      setError("Failed to process your investment. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !submitting && !success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link href="/investor/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Investment Successful!</h2>
        <p className="text-muted-foreground mb-6">
          Your investment of {formatCurrency(parseFloat(investmentAmount))} has been processed.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Redirecting to your portfolio...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/investor/marketplace/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invest in Invoice</h1>
          <p className="text-muted-foreground">
            {invoice.invoice_number} - {invoice.company_name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
              <CardDescription>
                Enter the amount you want to invest
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleInvestmentSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="investment-amount">Investment Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id="investment-amount"
                        type="number"
                        placeholder="Enter amount"
                        className="pl-8"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        min={1000}
                        max={invoice.available_amount}
                        step={1000}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min: ₹1,000 | Max: {formatCurrency(invoice.available_amount)}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">Investment Amount</p>
                      <p className="font-medium">{formatCurrency(parseFloat(investmentAmount) || 0)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Return Rate</p>
                      <p className="font-medium text-green-600">{invoice.return_rate}%</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Term</p>
                      <p className="font-medium">{invoice.days_to_maturity} days</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Expected Return</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency((parseFloat(investmentAmount) || 0) * (invoice.return_rate / 100) * (invoice.days_to_maturity / 365))}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Expected Total</p>
                      <p className="font-medium">
                        {formatCurrency((parseFloat(investmentAmount) || 0) + ((parseFloat(investmentAmount) || 0) * (invoice.return_rate / 100) * (invoice.days_to_maturity / 365)))}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Expected Maturity Date</p>
                      <p className="font-medium">{formatDate(invoice.due_date)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/investor/marketplace/${params.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BadgeDollarSign className="mr-2 h-4 w-4" />
                      Confirm Investment
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seller</p>
                <p className="font-medium">{invoice.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">{invoice.industry}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Invoice Amount</p>
                <p className="font-medium">{formatCurrency(invoice.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Amount</p>
                <p className="font-medium">{formatCurrency(invoice.available_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(invoice.due_date)}</p>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  invoice.risk_tier === 'A' ? 'bg-green-100 text-green-800' :
                  invoice.risk_tier === 'B' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.risk_tier}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Risk Tier</p>
                  <p className="text-sm font-medium">
                    {invoice.risk_tier === 'A' ? 'Low Risk' : 
                     invoice.risk_tier === 'B' ? 'Medium Risk' : 'High Risk'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

 
