'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Download, FileText, Loader2, User, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Separator } from '../../../../components/ui/separator';
import { invoiceAPI } from '../../../../lib/api';
import ConsentStatus from '../../../../components/invoice/ConsentStatus';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvoiceData = async () => {
    setLoading(true);
    setError('');
    try {
      // In a real app, this would fetch from the API
      // For now, we'll use mock data from localStorage
      const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const foundInvoice = storedInvoices.find((inv: any) => inv.id === invoiceId);
      
      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        setError('Invoice not found');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceData();
    }
  }, [invoiceId]);

  const getStatusBadge = () => {
    if (!invoice) return null;

    const statusMap: Record<string, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }> = {
      pending_validation: { label: 'Pending Validation', variant: 'outline' },
      validated: { label: 'Validated', variant: 'default' },
      rejected: { label: 'Rejected', variant: 'destructive' },
      funded: { label: 'Funded', variant: 'secondary' },
      paid: { label: 'Paid', variant: 'default' },
      defaulted: { label: 'Defaulted', variant: 'destructive' },
    };

    const status = statusMap[invoice.status] || { label: invoice.status, variant: 'outline' };
    
    return (
      <Badge variant={status.variant}>{status.label}</Badge>
    );
  };

  const getRiskTierBadge = () => {
    if (!invoice || !invoice.risk_tier) return null;

    const tierMap: Record<string, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }> = {
      A: { label: 'Low Risk (A)', variant: 'default' },
      B: { label: 'Medium Risk (B)', variant: 'secondary' },
      C: { label: 'High Risk (C)', variant: 'outline' },
      D: { label: 'Very High Risk (D)', variant: 'destructive' },
    };

    const tier = tierMap[invoice.risk_tier] || { label: invoice.risk_tier, variant: 'outline' };
    
    return (
      <Badge variant={tier.variant}>{tier.label}</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Details</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link href="/dashboard/invoices">Back to Invoices</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Invoice #{invoice.invoice_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {getRiskTierBadge()}
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
                    <p className="text-base">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                    <p className="text-base font-semibold">₹{invoice.amount?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Available for Funding</h3>
                    <p className="text-base">₹{invoice.available_amount?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="text-base">{invoice.description || 'No description provided'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Invoice Date</h3>
                    <p className="text-base">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                    <p className="text-base">{new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Buyer</h3>
                    <p className="text-base">{invoice.buyer_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Buyer GSTIN</h3>
                    <p className="text-base">{invoice.buyer_gstin || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Validation Results</h3>
                {invoice.trust_score !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Trust Score:</div>
                    <div className="text-base">{invoice.trust_score}/100</div>
                  </div>
                )}
                {invoice.validation_results && invoice.validation_results.length > 0 ? (
                  <div className="space-y-2">
                    {invoice.validation_results.map((result: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className={`font-medium ${
                          result.result === 'pass' ? 'text-green-600' :
                          result.result === 'warning' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {result.result.toUpperCase()}:
                        </span>{' '}
                        {result.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No validation results available</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <ConsentStatus invoiceId={invoiceId} onRefresh={fetchInvoiceData} />
        </div>
      </div>
    </div>
  );
}

 
