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
 AlertTriangle,
 Clock,
 Calendar,
 Building,
 User,
 DollarSign
} from 'lucide-react';
import { invoiceAPI, validationAPI, adminAPI } from '../../../lib/api';
import { Loader2 } from 'lucide-react';


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


// Risk tier badge component
function RiskTierBadge({ tier }: { tier: string | null }) {
 if (!tier) return null;
  switch (tier) {
   case 'A':
     return <Badge className="bg-green-500 hover:bg-green-600">Tier A</Badge>;
   case 'B':
     return <Badge className="bg-blue-500 hover:bg-blue-600">Tier B</Badge>;
   case 'C':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Tier C</Badge>;
   case 'D':
     return <Badge className="bg-red-500 hover:bg-red-600">Tier D</Badge>;
   default:
     return <Badge>{tier}</Badge>;
 }
}


// Validation result badge component
function ValidationResultBadge({ result }: { result: string }) {
 switch (result) {
   case 'pass':
     return <Badge className="bg-green-500 hover:bg-green-600">Pass</Badge>;
   case 'warning':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
   case 'fail':
     return <Badge className="bg-red-500 hover:bg-red-600">Fail</Badge>;
   default:
     return <Badge>{result}</Badge>;
 }
}


export default function InvoicesPage() {
 const [invoices, setInvoices] = useState<any[]>([]);
 const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [currentFilter, setCurrentFilter] = useState('all');
 const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  // Fetch invoices on component mount
 useEffect(() => {
   const fetchInvoices = async () => {
     try {
       setLoading(true);
       const invoiceData = await adminAPI.getAllInvoices();
       setInvoices(invoiceData);
       setFilteredInvoices(invoiceData);
       setLoading(false);
     } catch (err) {
       console.error('Error fetching invoices:', err);
       setError('Failed to load invoices. Please try again later.');
       setLoading(false);
     }
   };
  
   fetchInvoices();
 }, []);
  // Filter invoices based on search term and filter
 useEffect(() => {
   let result = invoices;
  
   // Apply search filter
   if (searchTerm) {
     result = result.filter(invoice =>
       invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       invoice.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       invoice.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
     );
   }
  
   // Apply status filter
   if (currentFilter !== 'all') {
     result = result.filter(invoice => invoice.status === currentFilter);
   }
  
   setFilteredInvoices(result);
 }, [searchTerm, currentFilter, invoices]);
  // Handle invoice selection for details view
 const handleInvoiceSelect = async (invoice: any) => {
   try {
     // Get detailed invoice information
     const detailedInvoice = await adminAPI.getInvoiceById(invoice.id);
     setSelectedInvoice(detailedInvoice);
   } catch (err) {
     console.error('Error fetching invoice details:', err);
     // Fall back to the basic invoice info we already have
     setSelectedInvoice(invoice);
   }
 };
  // Handle invoice validation
 const validateInvoice = async (invoiceId: string) => {
   try {
     const validationData = {
       status: 'validated',
       risk_tier: 'B',
       trust_score: 85,
       validation_results: [
         { check_name: 'Admin Review', result: 'pass', message: 'Validated by admin' }
       ]
     };
    
     await adminAPI.validateInvoice(invoiceId, validationData);
    
     // Update local state
     setInvoices(invoices.map(invoice => {
       if (invoice.id === invoiceId) {
         return {
           ...invoice,
           status: 'validated',
           risk_tier: 'B',
           trust_score: 85,
           validation_results: [
             { check_name: 'Admin Review', result: 'pass', message: 'Validated by admin' }
           ]
         };
       }
       return invoice;
     }));
    
     // Update selected invoice if it's the one being modified
     if (selectedInvoice && selectedInvoice.id === invoiceId) {
       setSelectedInvoice({
         ...selectedInvoice,
         status: 'validated',
         risk_tier: 'B',
         trust_score: 85,
         validation_results: [
           { check_name: 'Admin Review', result: 'pass', message: 'Validated by admin' }
         ]
       });
     }
   } catch (err) {
     console.error('Error validating invoice:', err);
     setError('Failed to validate invoice. Please try again.');
   }
 };
  // Handle invoice rejection
 const rejectInvoice = async (invoiceId: string) => {
   try {
     await adminAPI.rejectInvoice(invoiceId, 'Rejected by admin');
    
     // Update local state
     setInvoices(invoices.map(invoice => {
       if (invoice.id === invoiceId) {
         return {
           ...invoice,
           status: 'rejected',
           validation_results: [
             { check_name: 'Admin Review', result: 'fail', message: 'Rejected by admin' }
           ]
         };
       }
       return invoice;
     }));
    
     // Update selected invoice if it's the one being modified
     if (selectedInvoice && selectedInvoice.id === invoiceId) {
       setSelectedInvoice({
         ...selectedInvoice,
         status: 'rejected',
         validation_results: [
           { check_name: 'Admin Review', result: 'fail', message: 'Rejected by admin' }
         ]
       });
     }
   } catch (err) {
     console.error('Error rejecting invoice:', err);
     setError('Failed to reject invoice. Please try again.');
   }
 };
  // Handle invoice flagging
 const flagInvoice = async (invoiceId: string) => {
   try {
     // Update invoice status to flagged
     await adminAPI.updateInvoiceStatus(invoiceId, 'flagged', 'Flagged for further review');
    
     // Update local state
     setInvoices(invoices.map(invoice => {
       if (invoice.id === invoiceId) {
         return {
           ...invoice,
           status: 'flagged',
           validation_results: [
             ...(invoice.validation_results || []),
             { check_name: 'Admin Review', result: 'warning', message: 'Flagged for further review' }
           ]
         };
       }
       return invoice;
     }));
    
     // Update selected invoice if it's the one being modified
     if (selectedInvoice && selectedInvoice.id === invoiceId) {
       setSelectedInvoice({
         ...selectedInvoice,
         status: 'flagged',
         validation_results: [
           ...(selectedInvoice.validation_results || []),
           { check_name: 'Admin Review', result: 'warning', message: 'Flagged for further review' }
         ]
       });
     }
   } catch (err) {
     console.error('Error flagging invoice:', err);
     setError('Failed to flag invoice. Please try again.');
   }
 };


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
       <div className="flex items-center gap-2">
         <Button variant="outline" className="flex items-center gap-2">
           <Download className="h-4 w-4" />
           Export
         </Button>
       </div>
     </div>
    
     <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
       <div className="md:w-2/3">
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <CardTitle>Invoices</CardTitle>
               <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" className="h-8 gap-1">
                   <Filter className="h-3.5 w-3.5" />
                   Filter
                 </Button>
               </div>
             </div>
             <CardDescription>
               Manage and validate invoices
             </CardDescription>
             <div className="flex items-center gap-2 pt-3">
               <div className="relative flex-1">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Search invoices..."
                   className="pl-8"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <Tabs defaultValue="all" className="w-[400px]" onValueChange={setCurrentFilter}>
                 <TabsList>
                   <TabsTrigger value="all">All</TabsTrigger>
                   <TabsTrigger value="pending_validation">Pending</TabsTrigger>
                   <TabsTrigger value="validated">Validated</TabsTrigger>
                   <TabsTrigger value="funded">Funded</TabsTrigger>
                   <TabsTrigger value="rejected">Rejected</TabsTrigger>
                 </TabsList>
               </Tabs>
             </div>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {loading ? (
                 <div className="py-12 text-center">
                   <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                   <p className="text-muted-foreground">Loading invoices...</p>
                 </div>
               ) : error ? (
                 <div className="py-12 text-center text-red-500">
                   <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                   <p>{error}</p>
                 </div>
               ) : (
                 <>
                   <div className="rounded-md border">
                     <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                       <div className="col-span-3">Invoice Number</div>
                       <div className="col-span-2">Amount</div>
                       <div className="col-span-3">Seller / Buyer</div>
                       <div className="col-span-2">Status</div>
                       <div className="col-span-2 text-right">Actions</div>
                     </div>
                     <div className="divide-y">
                       {filteredInvoices.map((invoice) => (
                         <div
                           key={invoice.id}
                           className={`grid grid-cols-12 items-center p-3 text-sm ${
                             selectedInvoice?.id === invoice.id ? 'bg-muted/50' : ''
                           }`}
                           onClick={() => handleInvoiceSelect(invoice)}
                         >
                           <div className="col-span-3">
                             <div className="font-medium">{invoice.invoice_number}</div>
                             <div className="text-xs text-muted-foreground">
                               {new Date(invoice.created_at).toLocaleDateString()}
                             </div>
                           </div>
                           <div className="col-span-2">
                             <div className="font-medium">₹{invoice.amount.toLocaleString()}</div>
                             {invoice.risk_tier && (
                               <div className="mt-1">
                                 <RiskTierBadge tier={invoice.risk_tier} />
                               </div>
                             )}
                           </div>
                           <div className="col-span-3">
                             <div className="font-medium">{invoice.seller_name}</div>
                             <div className="text-xs text-muted-foreground">
                               {invoice.buyer_name}
                             </div>
                           </div>
                           <div className="col-span-2">
                             <InvoiceStatusBadge status={invoice.status} />
                           </div>
                           <div className="col-span-2 flex justify-end">
                             <Button variant="ghost" size="icon">
                               <Eye className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                  
                   {filteredInvoices.length === 0 && !loading && (
                     <div className="py-12 text-center text-muted-foreground">
                       No invoices found matching your search criteria
                     </div>
                   )}
                 </>
               )}
              
               <div className="flex items-center justify-between">
                 <div className="text-sm text-muted-foreground">
                   Showing <strong>{filteredInvoices.length}</strong> of <strong>{invoices.length}</strong> invoices
                 </div>
                 <div className="flex items-center space-x-2">
                   <Button variant="outline" size="sm" disabled>
                     Previous
                   </Button>
                   <Button variant="outline" size="sm">
                     Next
                   </Button>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
      
       <div className="md:w-1/3">
         {selectedInvoice ? (
           <Card>
             <CardHeader className="pb-3">
               <CardTitle>Invoice Details</CardTitle>
               <CardDescription>
                 View and validate invoice information
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="flex flex-col items-center mb-4">
                 <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                   <FileText className="h-8 w-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-medium">{selectedInvoice.invoice_number}</h3>
                 <p className="text-sm text-muted-foreground">
                   {new Date(selectedInvoice.created_at).toLocaleDateString()}
                 </p>
               </div>
              
               <Separator className="my-4" />
              
               <div className="space-y-4">
                 <div>
                   <h4 className="text-sm font-medium mb-2">Invoice Information</h4>
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
                    
                     <div className="text-muted-foreground">Seller</div>
                     <div className="font-medium">{selectedInvoice.seller_name}</div>
                    
                     <div className="text-muted-foreground">Buyer</div>
                     <div className="font-medium">{selectedInvoice.buyer_name}</div>
                    
                     <div className="text-muted-foreground">Status</div>
                     <div className="font-medium">
                       <InvoiceStatusBadge status={selectedInvoice.status} />
                     </div>
                    
                     {selectedInvoice.risk_tier && (
                       <>
                         <div className="text-muted-foreground">Risk Tier</div>
                         <div className="font-medium">
                           <RiskTierBadge tier={selectedInvoice.risk_tier} />
                         </div>
                       </>
                     )}
                    
                     {selectedInvoice.trust_score && (
                       <>
                         <div className="text-muted-foreground">Trust Score</div>
                         <div className="font-medium">{selectedInvoice.trust_score}/100</div>
                       </>
                     )}
                   </div>
                 </div>
                
                 <Separator />
                
                 <div>
                   <h4 className="text-sm font-medium mb-2">Validation Results</h4>
                   {selectedInvoice.validation_results.length > 0 ? (
                     <div className="space-y-2">
                       {selectedInvoice.validation_results.map((result: any, index: number) => (
                         <div key={index} className="flex items-center justify-between text-sm">
                           <span>{result.check_name}</span>
                           <ValidationResultBadge result={result.result} />
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-sm text-muted-foreground">
                       No validation results available
                     </div>
                   )}
                 </div>
                
                 {selectedInvoice.status === 'pending_validation' && (
                   <>
                     <Separator />
                    
                     <div>
                       <h4 className="text-sm font-medium mb-2">Validation Actions</h4>
                       <div className="flex items-center gap-2">
                         <Button
                           variant="default"
                           size="sm"
                           className="flex-1"
                           onClick={() => validateInvoice(selectedInvoice.id)}
                         >
                           <CheckCircle className="h-4 w-4 mr-1" />
                           Validate
                         </Button>
                         <Button
                           variant="destructive"
                           size="sm"
                           className="flex-1"
                           onClick={() => rejectInvoice(selectedInvoice.id)}
                         >
                           <XCircle className="h-4 w-4 mr-1" />
                           Reject
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           className="flex-1"
                           onClick={() => flagInvoice(selectedInvoice.id)}
                         >
                           <AlertCircle className="h-4 w-4 mr-1" />
                           Flag
                         </Button>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             </CardContent>
             <CardFooter className="border-t pt-4 flex justify-between">
               <Button variant="outline">Download</Button>
               <Button variant="default">View Documents</Button>
             </CardFooter>
           </Card>
         ) : (
           <Card>
             <CardHeader>
               <CardTitle>Invoice Details</CardTitle>
               <CardDescription>
                 Select an invoice to view details
               </CardDescription>
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center py-10">
               <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
               <p className="text-muted-foreground text-center">
                 Select an invoice from the list to view details and perform validation
               </p>
             </CardContent>
           </Card>
         )}
       </div>
     </div>
   </div>
 );
}


 





