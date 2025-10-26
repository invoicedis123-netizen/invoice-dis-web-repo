'use client';


import React, { useState, useEffect } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
 Search,
 Filter,
 Download,
 MoreHorizontal,
 CheckCircle,
 XCircle,
 AlertCircle,
 FileText,
 Eye,
 FileCheck,
 Clock,
 Calendar,
 Building,
 User,
 DollarSign
} from 'lucide-react';
import { invoiceAPI, validationAPI, adminAPI } from '../../../lib/api';
import { Loader2 } from 'lucide-react';


// Default validation checks
const mockValidationChecks = [
 {
   id: 'gst',
   name: 'GST Validation',
   description: 'Verify GSTIN and match with invoice details',
   status: 'pending',
   details: null
 },
 {
   id: 'buyer',
   name: 'Buyer Verification',
   description: 'Verify buyer details and payment history',
   status: 'pending',
   details: null
 },
 {
   id: 'document',
   name: 'Document Check',
   description: 'Verify document authenticity and completeness',
   status: 'pending',
   details: null
 },
 {
   id: 'amount',
   name: 'Amount Verification',
   description: 'Verify invoice amount and calculations',
   status: 'pending',
   details: null
 },
 {
   id: 'dates',
   name: 'Date Verification',
   description: 'Verify invoice and due dates',
   status: 'pending',
   details: null
 }
];


// Invoice status badge component
function InvoiceStatusBadge({ status }: { status: string }) {
 switch (status) {
   case 'pending_validation':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Validation</Badge>;
   case 'pending_consent':
     return <Badge className="bg-blue-500 hover:bg-blue-600">Pending Consent</Badge>;
   case 'validated':
     return <Badge className="bg-green-500 hover:bg-green-600">Validated</Badge>;
   case 'rejected':
     return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
   case 'funded':
     return <Badge className="bg-purple-500 hover:bg-purple-600">Funded</Badge>;
   case 'paid':
     return <Badge className="bg-teal-500 hover:bg-teal-600">Paid</Badge>;
   case 'defaulted':
     return <Badge className="bg-gray-500 hover:bg-gray-600">Defaulted</Badge>;
   default:
     return <Badge>{status}</Badge>;
 }
}


// Validation status badge component
function ValidationStatusBadge({ status }: { status: string }) {
 switch (status) {
   case 'pass':
     return <Badge className="bg-green-500 hover:bg-green-600">Pass</Badge>;
   case 'warning':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
   case 'fail':
     return <Badge className="bg-red-500 hover:bg-red-600">Fail</Badge>;
   case 'pending':
     return <Badge className="bg-blue-500 hover:bg-blue-600">Pending</Badge>;
   default:
     return <Badge>{status}</Badge>;
 }
}


export default function ValidationPage() {
 const [invoices, setInvoices] = useState<any[]>([]);
 const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
 const [validationChecks, setValidationChecks] = useState(mockValidationChecks);
 const [isValidating, setIsValidating] = useState(false);
 const [validationNotes, setValidationNotes] = useState('');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  // Fetch pending validations on component mount
 useEffect(() => {
   const fetchPendingValidations = async () => {
     try {
       setLoading(true);
       const pendingInvoices = await adminAPI.getPendingValidations();
       setInvoices(pendingInvoices);
       setFilteredInvoices(pendingInvoices);
       setLoading(false);
     } catch (err) {
       console.error('Error fetching pending validations:', err);
       setError('Failed to load pending validations. Please try again later.');
       setLoading(false);
     }
   };
  
   fetchPendingValidations();
 }, []);
  // Filter invoices based on search term
 useEffect(() => {
   if (!invoices.length) return;
  
   const result = invoices.filter(invoice =>
     invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     invoice.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     invoice.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
   );
   setFilteredInvoices(result);
 }, [searchTerm, invoices]);
  // Handle invoice selection for validation
 const handleInvoiceSelect = async (invoice: any) => {
   try {
     // Get detailed invoice information
     const detailedInvoice = await adminAPI.getInvoiceById(invoice.id);
     setSelectedInvoice(detailedInvoice);
     // Reset validation checks
     setValidationChecks(mockValidationChecks);
     setValidationNotes('');
   } catch (err) {
     console.error('Error fetching invoice details:', err);
     // Fall back to the basic invoice info we already have
     setSelectedInvoice(invoice);
     setValidationChecks(mockValidationChecks);
     setValidationNotes('');
   }
 };
  // Handle validation check status update
 const updateValidationCheck = (checkId: string, status: string, details: string | null = null) => {
   setValidationChecks(validationChecks.map(check =>
     check.id === checkId ? { ...check, status, details } : check
   ));
 };
  // Handle invoice validation
 const validateInvoice = async () => {
   setIsValidating(true);
  
   try {
     // Calculate trust score based on validation checks
     const passCount = validationChecks.filter(check => check.status === 'pass').length;
     const warningCount = validationChecks.filter(check => check.status === 'warning').length;
     const failCount = validationChecks.filter(check => check.status === 'fail').length;
    
     // Simple trust score calculation
     const totalChecks = validationChecks.length;
     const trustScore = Math.round(((passCount * 100) + (warningCount * 50)) / totalChecks);
    
     // Determine risk tier
     let riskTier = 'A';
     if (trustScore < 70) {
       riskTier = 'D';
     } else if (trustScore < 80) {
       riskTier = 'C';
     } else if (trustScore < 90) {
       riskTier = 'B';
     }
    
     // Update invoice status
     const newStatus = failCount > 0 ? 'rejected' : 'validated';
    
     // Create validation results
     const validationResults = validationChecks.map(check => ({
       check_name: check.name,
       result: check.status,
       message: check.details || check.description
     }));
    
     // Prepare validation data
     const validationData = {
       status: newStatus,
       risk_tier: failCount > 0 ? null : riskTier,
       trust_score: trustScore,
       validation_results: validationResults,
       notes: validationNotes
     };
    
     // Call API to validate invoice
     if (newStatus === 'validated') {
       await adminAPI.validateInvoice(selectedInvoice.id, validationData);
     } else {
       await adminAPI.rejectInvoice(selectedInvoice.id, validationNotes || 'Rejected due to validation failures');
     }
    
     // Update invoice
     const updatedInvoice = {
       ...selectedInvoice,
       status: newStatus,
       trust_score: trustScore,
       risk_tier: failCount > 0 ? null : riskTier,
       validation_results: validationResults
     };
    
     // Update invoices list (remove from list since it's no longer pending)
     setInvoices(invoices.filter(invoice => invoice.id !== selectedInvoice.id));
    
     // Update selected invoice
     setSelectedInvoice(updatedInvoice);
    
     setIsValidating(false);
   } catch (err) {
     console.error('Error validating invoice:', err);
     setError('Failed to validate invoice. Please try again.');
     setIsValidating(false);
   }
 };
  // Handle invoice rejection
 const rejectInvoice = async () => {
   setIsValidating(true);
  
   try {
     // Call API to reject invoice
     await adminAPI.rejectInvoice(selectedInvoice.id, validationNotes || 'Rejected by admin');
    
     // Update invoice
     const updatedInvoice = {
       ...selectedInvoice,
       status: 'rejected',
       validation_results: [{
         check_name: 'Admin Review',
         result: 'fail',
         message: validationNotes || 'Rejected by admin'
       }]
     };
    
     // Update invoices list (remove from list since it's no longer pending)
     setInvoices(invoices.filter(invoice => invoice.id !== selectedInvoice.id));
    
     // Update selected invoice
     setSelectedInvoice(updatedInvoice);
    
     setIsValidating(false);
   } catch (err) {
     console.error('Error rejecting invoice:', err);
     setError('Failed to reject invoice. Please try again.');
     setIsValidating(false);
   }
 };


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold tracking-tight">Invoice Validation</h1>
     </div>
    
     <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
       <div className="md:w-1/3">
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <CardTitle>Pending Invoices</CardTitle>
             </div>
             <CardDescription>
               Invoices awaiting validation
             </CardDescription>
             <div className="relative flex-1 pt-3">
               <Search className="absolute left-2.5 top-5.5 h-4 w-4 text-muted-foreground" />
               <Input
                 type="search"
                 placeholder="Search invoices..."
                 className="pl-8"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {loading ? (
                 <div className="py-12 text-center">
                   <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                   <p className="text-muted-foreground">Loading pending validations...</p>
                 </div>
               ) : error ? (
                 <div className="py-12 text-center text-red-500">
                   <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                   <p>{error}</p>
                 </div>
               ) : (
                 <>
                   <div className="rounded-md border">
                     <div className="divide-y">
                       {filteredInvoices.map((invoice) => (
                         <div
                           key={invoice.id}
                           className={`p-3 text-sm cursor-pointer ${
                             selectedInvoice?.id === invoice.id ? 'bg-muted/50' : ''
                           }`}
                           onClick={() => handleInvoiceSelect(invoice)}
                         >
                           <div className="flex items-center justify-between mb-1">
                             <div className="font-medium">{invoice.invoice_number}</div>
                             <InvoiceStatusBadge status={invoice.status} />
                           </div>
                           <div className="text-xs text-muted-foreground mb-1">
                             {invoice.seller_name} → {invoice.buyer_name}
                           </div>
                           <div className="flex items-center justify-between text-xs">
                             <span>₹{invoice.amount.toLocaleString()}</span>
                             <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                  
                   {filteredInvoices.length === 0 && !loading && (
                     <div className="py-12 text-center text-muted-foreground">
                       No pending invoices found
                     </div>
                   )}
                 </>
               )}
             </div>
           </CardContent>
         </Card>
       </div>
      
       <div className="md:w-2/3">
         {selectedInvoice ? (
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle>Validation Panel</CardTitle>
                   <CardDescription>
                     Validate invoice {selectedInvoice.invoice_number}
                   </CardDescription>
                 </div>
                 <InvoiceStatusBadge status={selectedInvoice.status} />
               </div>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div>
                   <h3 className="text-sm font-medium mb-2">Invoice Details</h3>
                   <div className="grid grid-cols-2 gap-2 text-sm">
                     <div className="text-muted-foreground">Amount</div>
                     <div className="font-medium">₹{selectedInvoice.amount.toLocaleString()}</div>
                    
                     <div className="text-muted-foreground">Invoice Date</div>
                     <div className="font-medium">
                       {new Date(selectedInvoice.invoice_date).toLocaleDateString()}
                     </div>
                    
                     <div className="text-muted-foreground">Due Date</div>
                     <div className="font-medium">
                       {new Date(selectedInvoice.due_date).toLocaleDateString()}
                     </div>
                   </div>
                 </div>
                
                 <div>
                   <h3 className="text-sm font-medium mb-2">Parties</h3>
                   <div className="grid grid-cols-2 gap-2 text-sm">
                     <div className="text-muted-foreground">Seller</div>
                     <div className="font-medium">{selectedInvoice.seller_name}</div>
                    
                     <div className="text-muted-foreground">Buyer</div>
                     <div className="font-medium">{selectedInvoice.buyer_name}</div>
                   </div>
                 </div>
               </div>
              
               <Separator />
              
               {selectedInvoice.status === 'pending_validation' ? (
                 <>
                   <div>
                     <h3 className="text-sm font-medium mb-3">Validation Checks</h3>
                     <div className="space-y-3">
                       {validationChecks.map((check) => (
                         <div key={check.id} className="rounded-md border p-3">
                           <div className="flex items-center justify-between mb-1">
                             <div className="font-medium">{check.name}</div>
                             <ValidationStatusBadge status={check.status} />
                           </div>
                           <div className="text-xs text-muted-foreground mb-2">
                             {check.description}
                           </div>
                           <div className="flex items-center gap-2">
                             <Button
                               variant={check.status === 'pass' ? 'default' : 'outline'}
                               size="sm"
                               className="flex-1"
                               onClick={() => updateValidationCheck(check.id, 'pass')}
                             >
                               <CheckCircle className="h-4 w-4 mr-1" />
                               Pass
                             </Button>
                             <Button
                               variant={check.status === 'warning' ? 'default' : 'outline'}
                               size="sm"
                               className="flex-1"
                               onClick={() => updateValidationCheck(check.id, 'warning')}
                             >
                               <AlertCircle className="h-4 w-4 mr-1" />
                               Warning
                             </Button>
                             <Button
                               variant={check.status === 'fail' ? 'default' : 'outline'}
                               size="sm"
                               className="flex-1"
                               onClick={() => updateValidationCheck(check.id, 'fail')}
                             >
                               <XCircle className="h-4 w-4 mr-1" />
                               Fail
                             </Button>
                           </div>
                           {check.status !== 'pending' && (
                             <div className="mt-2">
                               <Input
                                 placeholder="Add details about this check..."
                                 value={check.details || ''}
                                 onChange={(e) => updateValidationCheck(check.id, check.status, e.target.value)}
                               />
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                  
                   <div>
                     <h3 className="text-sm font-medium mb-2">Validation Notes</h3>
                     <textarea
                       className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                       placeholder="Add any additional notes about this invoice..."
                       value={validationNotes}
                       onChange={(e) => setValidationNotes(e.target.value)}
                     ></textarea>
                   </div>
                 </>
               ) : (
                 <div>
                   <h3 className="text-sm font-medium mb-3">Validation Results</h3>
                   {selectedInvoice.validation_results.length > 0 ? (
                     <div className="space-y-3">
                       {selectedInvoice.validation_results.map((result: any, index: number) => (
                         <div key={index} className="rounded-md border p-3">
                           <div className="flex items-center justify-between mb-1">
                             <div className="font-medium">{result.check_name}</div>
                             <ValidationStatusBadge status={result.result} />
                           </div>
                           <div className="text-xs text-muted-foreground">
                             {result.message}
                           </div>
                         </div>
                       ))}
                      
                       {selectedInvoice.trust_score && (
                         <div className="mt-4 p-3 rounded-md border">
                           <div className="flex items-center justify-between mb-1">
                             <div className="font-medium">Trust Score</div>
                             <div className="font-bold">{selectedInvoice.trust_score}/100</div>
                           </div>
                           <div className="h-2 w-full rounded-full bg-muted mt-1">
                             <div
                               className={`h-2 rounded-full ${
                                 selectedInvoice.trust_score >= 90 ? 'bg-green-500' :
                                 selectedInvoice.trust_score >= 80 ? 'bg-blue-500' :
                                 selectedInvoice.trust_score >= 70 ? 'bg-yellow-500' :
                                 'bg-red-500'
                               }`}
                               style={{ width: `${selectedInvoice.trust_score}%` }}
                             ></div>
                           </div>
                           {selectedInvoice.risk_tier && (
                             <div className="text-xs text-muted-foreground mt-1">
                               Risk Tier: {selectedInvoice.risk_tier}
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="py-4 text-center text-muted-foreground">
                       No validation results available
                     </div>
                   )}
                 </div>
               )}
             </CardContent>
             {selectedInvoice.status === 'pending_validation' && (
               <CardFooter className="border-t pt-4 flex justify-between">
                 <Button
                   variant="destructive"
                   onClick={rejectInvoice}
                   disabled={isValidating}
                 >
                   <XCircle className="h-4 w-4 mr-1" />
                   Reject Invoice
                 </Button>
                 <Button
                   variant="default"
                   onClick={validateInvoice}
                   disabled={isValidating || validationChecks.some(check => check.status === 'pending')}
                 >
                   {isValidating ? (
                     <>
                       <div className="h-4 w-4 mr-1 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                       Processing...
                     </>
                   ) : (
                     <>
                       <CheckCircle className="h-4 w-4 mr-1" />
                       Validate Invoice
                     </>
                   )}
                 </Button>
               </CardFooter>
             )}
           </Card>
         ) : (
           <Card>
             <CardHeader>
               <CardTitle>Validation Panel</CardTitle>
               <CardDescription>
                 Select an invoice to validate
               </CardDescription>
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center py-16">
               <FileCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
               <p className="text-muted-foreground text-center">
                 Select an invoice from the list to begin validation
               </p>
             </CardContent>
           </Card>
         )}
       </div>
     </div>
   </div>
 );
}


// Made with Bob





