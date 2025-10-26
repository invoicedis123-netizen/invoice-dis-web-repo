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
 Wallet,
 Eye,
 TrendingUp,
 TrendingDown,
 Calendar,
 User,
 Building,
 DollarSign,
 Percent,
 Clock,
 Shield,
 Loader2
} from 'lucide-react';
import { adminAPI } from '../../../lib/api';


// Investment status badge component
function InvestmentStatusBadge({ status }: { status: string }) {
 switch (status) {
   case 'active':
     return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
   case 'completed':
     return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>;
   case 'defaulted':
     return <Badge className="bg-red-500 hover:bg-red-600">Defaulted</Badge>;
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


// TRRF status badge component
function TRRFStatusBadge({ status }: { status: string }) {
 switch (status) {
   case 'approved':
     return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
   case 'pending':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
   case 'rejected':
     return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
   default:
     return <Badge>{status}</Badge>;
 }
}


export default function InvestmentsPage() {
 const [investments, setInvestments] = useState<any[]>([]);
 const [filteredInvestments, setFilteredInvestments] = useState<any[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [currentFilter, setCurrentFilter] = useState('all');
 const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
 const [trrf, setTRRF] = useState<any>({
   total_pool: 0,
   utilized: 0,
   available: 0,
   default_rate: 0,
   industry_avg_default: 0,
   disbursals: []
 });
 const [activeTab, setActiveTab] = useState('investments');
 const [loading, setLoading] = useState({
   investments: true,
   trrf: true
 });
 const [error, setError] = useState<{
   investments: string | null,
   trrf: string | null
 }>({
   investments: null,
   trrf: null
 });
  // Fetch investments on component mount
 useEffect(() => {
   const fetchInvestments = async () => {
     try {
       setLoading(prev => ({ ...prev, investments: true }));
       const investmentData = await adminAPI.getAllInvestments();
       setInvestments(investmentData);
       setFilteredInvestments(investmentData);
       setLoading(prev => ({ ...prev, investments: false }));
     } catch (err) {
       console.error('Error fetching investments:', err);
       setError(prev => ({
         ...prev,
         investments: 'Failed to load investments. Please try again later.'
       }));
       setLoading(prev => ({ ...prev, investments: false }));
     }
   };
  
   fetchInvestments();
 }, []);
  // Fetch TRRF data when tab changes to TRRF
 useEffect(() => {
   if (activeTab === 'trrf') {
     const fetchTRRFData = async () => {
       try {
         setLoading(prev => ({ ...prev, trrf: true }));
        
         // Get TRRF stats
         const trrfStats = await adminAPI.getTRRFStats();
        
         // Get TRRF disbursals
         const trrfDisbursals = await adminAPI.getTRRFDisbursals();
        
         // Combine data
         setTRRF({
           ...trrfStats,
           disbursals: trrfDisbursals
         });
        
         setLoading(prev => ({ ...prev, trrf: false }));
       } catch (err) {
         console.error('Error fetching TRRF data:', err);
         setError(prev => ({
           ...prev,
           trrf: 'Failed to load TRRF data. Please try again later.'
         }));
         setLoading(prev => ({ ...prev, trrf: false }));
       }
     };
    
     fetchTRRFData();
   }
 }, [activeTab]);
  // Filter investments based on search term and filter
 useEffect(() => {
   if (!investments.length) return;
  
   let result = investments;
  
   // Apply search filter
   if (searchTerm) {
     result = result.filter(investment =>
       investment.investment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       investment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       investment.investor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       investment.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
     );
   }
  
   // Apply status filter
   if (currentFilter !== 'all') {
     result = result.filter(investment => investment.status === currentFilter);
   }
  
   setFilteredInvestments(result);
 }, [searchTerm, currentFilter, investments]);
  // Handle investment selection for details view
 const handleInvestmentSelect = async (investment: any) => {
   try {
     // Get detailed investment information
     const detailedInvestment = await adminAPI.getInvestmentById(investment.id);
     setSelectedInvestment(detailedInvestment);
   } catch (err) {
     console.error('Error fetching investment details:', err);
     // Fall back to the basic investment info we already have
     setSelectedInvestment(investment);
   }
 };
  // Handle TRRF disbursal approval
 const approveTRRFDisbursal = async (id: string) => {
   try {
     await adminAPI.approveTRRFDisbursal(id);
    
     // Update local state
     setTRRF({
       ...trrf,
       disbursals: trrf.disbursals.map((disbursal: any) =>
         disbursal.id === id ? { ...disbursal, status: 'approved' } : disbursal
       )
     });
   } catch (err) {
     console.error('Error approving TRRF disbursal:', err);
     setError(prev => ({
       ...prev,
       trrf: 'Failed to approve disbursal. Please try again.'
     }));
   }
 };
  // Handle TRRF disbursal rejection
 const rejectTRRFDisbursal = async (id: string) => {
   try {
     await adminAPI.rejectTRRFDisbursal(id, 'Rejected by admin');
    
     // Update local state
     setTRRF({
       ...trrf,
       disbursals: trrf.disbursals.map((disbursal: any) =>
         disbursal.id === id ? { ...disbursal, status: 'rejected' } : disbursal
       )
     });
   } catch (err) {
     console.error('Error rejecting TRRF disbursal:', err);
     setError(prev => ({
       ...prev,
       trrf: 'Failed to reject disbursal. Please try again.'
     }));
   }
 };


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold tracking-tight">Investment Management</h1>
       <div className="flex items-center gap-2">
         <Button variant="outline" className="flex items-center gap-2">
           <Download className="h-4 w-4" />
           Export
         </Button>
       </div>
     </div>
    
     <Tabs defaultValue="investments" className="space-y-4" onValueChange={setActiveTab}>
       <TabsList>
         <TabsTrigger value="investments">Investments</TabsTrigger>
         <TabsTrigger value="trrf">TRRF Fund</TabsTrigger>
       </TabsList>
      
       <TabsContent value="investments" className="space-y-4">
         <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
           <div className="md:w-2/3">
             <Card>
               <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                   <CardTitle>Investments</CardTitle>
                   <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-8 gap-1">
                       <Filter className="h-3.5 w-3.5" />
                       Filter
                     </Button>
                   </div>
                 </div>
                 <CardDescription>
                   Monitor and manage investments
                 </CardDescription>
                 <div className="flex items-center gap-2 pt-3">
                   <div className="relative flex-1">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                       type="search"
                       placeholder="Search investments..."
                       className="pl-8"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                   </div>
                   <Tabs defaultValue="all" className="w-[300px]" onValueChange={setCurrentFilter}>
                     <TabsList>
                       <TabsTrigger value="all">All</TabsTrigger>
                       <TabsTrigger value="active">Active</TabsTrigger>
                       <TabsTrigger value="completed">Completed</TabsTrigger>
                       <TabsTrigger value="defaulted">Defaulted</TabsTrigger>
                     </TabsList>
                   </Tabs>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {loading.investments ? (
                     <div className="py-12 text-center">
                       <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                       <p className="text-muted-foreground">Loading investments...</p>
                     </div>
                   ) : error.investments ? (
                     <div className="py-12 text-center text-red-500">
                       <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                       <p>{error.investments}</p>
                     </div>
                   ) : (
                     <>
                       <div className="rounded-md border">
                         <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                           <div className="col-span-3">Investment ID</div>
                           <div className="col-span-2">Amount</div>
                           <div className="col-span-3">Investor / Invoice</div>
                           <div className="col-span-2">Status</div>
                           <div className="col-span-2 text-right">Actions</div>
                         </div>
                         <div className="divide-y">
                           {filteredInvestments.map((investment) => (
                             <div
                               key={investment.id}
                               className={`grid grid-cols-12 items-center p-3 text-sm ${
                                 selectedInvestment?.id === investment.id ? 'bg-muted/50' : ''
                               }`}
                               onClick={() => handleInvestmentSelect(investment)}
                             >
                               <div className="col-span-3">
                                 <div className="font-medium">{investment.investment_id}</div>
                                 <div className="text-xs text-muted-foreground">
                                   {new Date(investment.investment_date).toLocaleDateString()}
                                 </div>
                               </div>
                               <div className="col-span-2">
                                 <div className="font-medium">₹{investment.amount.toLocaleString()}</div>
                                 <div className="text-xs text-muted-foreground">
                                   ROI: {investment.roi}%
                                 </div>
                               </div>
                               <div className="col-span-3">
                                 <div className="font-medium">{investment.investor_name}</div>
                                 <div className="text-xs text-muted-foreground">
                                   {investment.invoice_number}
                                 </div>
                               </div>
                               <div className="col-span-2">
                                 <InvestmentStatusBadge status={investment.status} />
                                 <div className="mt-1">
                                   <RiskTierBadge tier={investment.risk_tier} />
                                 </div>
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
                      
                       {filteredInvestments.length === 0 && !loading.investments && (
                         <div className="py-12 text-center text-muted-foreground">
                           No investments found matching your search criteria
                         </div>
                       )}
                      
                       <div className="flex items-center justify-between">
                         <div className="text-sm text-muted-foreground">
                           Showing <strong>{filteredInvestments.length}</strong> of <strong>{investments.length}</strong> investments
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
                     </>
                   )}
                 </div>
               </CardContent>
             </Card>
           </div>
          
           <div className="md:w-1/3">
             {selectedInvestment ? (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle>Investment Details</CardTitle>
                   <CardDescription>
                     View investment information
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="flex flex-col items-center mb-4">
                     <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                       <Wallet className="h-8 w-8 text-muted-foreground" />
                     </div>
                     <h3 className="text-lg font-medium">{selectedInvestment.investment_id}</h3>
                     <p className="text-sm text-muted-foreground">
                       {new Date(selectedInvestment.investment_date).toLocaleDateString()}
                     </p>
                   </div>
                  
                   <Separator className="my-4" />
                  
                   <div className="space-y-4">
                     <div>
                       <h4 className="text-sm font-medium mb-2">Investment Information</h4>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         <div className="text-muted-foreground">Amount</div>
                         <div className="font-medium">₹{selectedInvestment.amount.toLocaleString()}</div>
                        
                         <div className="text-muted-foreground">ROI</div>
                         <div className="font-medium">{selectedInvestment.roi}%</div>
                        
                         <div className="text-muted-foreground">Investment Date</div>
                         <div className="font-medium">
                           {new Date(selectedInvestment.investment_date).toLocaleDateString()}
                         </div>
                        
                         <div className="text-muted-foreground">Maturity Date</div>
                         <div className="font-medium">
                           {new Date(selectedInvestment.maturity_date).toLocaleDateString()}
                         </div>
                        
                         <div className="text-muted-foreground">Status</div>
                         <div className="font-medium">
                           <InvestmentStatusBadge status={selectedInvestment.status} />
                         </div>
                        
                         <div className="text-muted-foreground">Risk Tier</div>
                         <div className="font-medium">
                           <RiskTierBadge tier={selectedInvestment.risk_tier} />
                         </div>
                       </div>
                     </div>
                    
                     <Separator />
                    
                     <div>
                       <h4 className="text-sm font-medium mb-2">Investor Information</h4>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         <div className="text-muted-foreground">Investor ID</div>
                         <div className="font-medium">{selectedInvestment.investor_id}</div>
                        
                         <div className="text-muted-foreground">Investor Name</div>
                         <div className="font-medium">{selectedInvestment.investor_name}</div>
                       </div>
                     </div>
                    
                     <Separator />
                    
                     <div>
                       <h4 className="text-sm font-medium mb-2">Invoice Information</h4>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         <div className="text-muted-foreground">Invoice ID</div>
                         <div className="font-medium">{selectedInvestment.invoice_id}</div>
                        
                         <div className="text-muted-foreground">Invoice Number</div>
                         <div className="font-medium">{selectedInvestment.invoice_number}</div>
                        
                         <div className="text-muted-foreground">Seller</div>
                         <div className="font-medium">{selectedInvestment.seller_name}</div>
                        
                         <div className="text-muted-foreground">Buyer</div>
                         <div className="font-medium">{selectedInvestment.buyer_name}</div>
                       </div>
                     </div>
                   </div>
                 </CardContent>
                 <CardFooter className="border-t pt-4 flex justify-between">
                   <Button variant="outline">Download</Button>
                   <Button variant="default">View Invoice</Button>
                 </CardFooter>
               </Card>
             ) : (
               <Card>
                 <CardHeader>
                   <CardTitle>Investment Details</CardTitle>
                   <CardDescription>
                     Select an investment to view details
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center py-10">
                   <Wallet className="h-16 w-16 text-muted-foreground/50 mb-4" />
                   <p className="text-muted-foreground text-center">
                     Select an investment from the list to view details
                   </p>
                 </CardContent>
               </Card>
             )}
           </div>
         </div>
       </TabsContent>
      
       <TabsContent value="trrf" className="space-y-4">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium">Total Pool</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">₹{(trrf.total_pool / 10000000).toFixed(1)} Cr</div>
               <p className="text-xs text-muted-foreground">Trade Receivables Risk Fund</p>
             </CardContent>
           </Card>
          
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium">Utilized</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">₹{(trrf.utilized / 10000000).toFixed(1)} Cr</div>
               <p className="text-xs text-muted-foreground">{((trrf.utilized / trrf.total_pool) * 100).toFixed(1)}% of total pool</p>
             </CardContent>
           </Card>
          
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium">Available</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">₹{(trrf.available / 10000000).toFixed(1)} Cr</div>
               <p className="text-xs text-muted-foreground">{((trrf.available / trrf.total_pool) * 100).toFixed(1)}% of total pool</p>
             </CardContent>
           </Card>
          
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{trrf.default_rate.toFixed(1)}%</div>
               <p className="text-xs text-muted-foreground">Industry avg: {trrf.industry_avg_default.toFixed(1)}%</p>
             </CardContent>
           </Card>
         </div>
        
         <Card>
           <CardHeader>
             <CardTitle>TRRF Fund Utilization</CardTitle>
             <CardDescription>
               Monitor and manage TRRF fund disbursals
             </CardDescription>
           </CardHeader>
           <CardContent>
             {loading.trrf ? (
               <div className="py-12 text-center">
                 <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                 <p className="text-muted-foreground">Loading TRRF data...</p>
               </div>
             ) : error.trrf ? (
               <div className="py-12 text-center text-red-500">
                 <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                 <p>{error.trrf}</p>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="space-y-2">
                   <h4 className="text-sm font-medium">Fund Utilization</h4>
                   <div className="h-2 w-full rounded-full bg-muted">
                     <div
                       className="h-2 rounded-full bg-primary"
                       style={{ width: `${(trrf.utilized / trrf.total_pool) * 100}%` }}
                     ></div>
                   </div>
                   <div className="flex justify-between text-xs text-muted-foreground">
                     <span>₹{(trrf.utilized / 10000000).toFixed(1)} Cr used</span>
                     <span>₹{(trrf.available / 10000000).toFixed(1)} Cr available</span>
                   </div>
                 </div>
                
                 <Separator />
                
                 <div>
                   <h4 className="text-sm font-medium mb-4">Recent Disbursals</h4>
                   {trrf.disbursals && trrf.disbursals.length > 0 ? (
                     <div className="rounded-md border">
                       <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                         <div className="col-span-2">ID</div>
                         <div className="col-span-2">Amount</div>
                         <div className="col-span-3">Date</div>
                         <div className="col-span-3">Reason</div>
                         <div className="col-span-2">Status</div>
                       </div>
                       <div className="divide-y">
                         {trrf.disbursals.map((disbursal: any) => (
                           <div key={disbursal.id} className="grid grid-cols-12 items-center p-3 text-sm">
                             <div className="col-span-2">
                               <div className="font-medium">#{disbursal.id}</div>
                             </div>
                             <div className="col-span-2">
                               <div className="font-medium">₹{(disbursal.amount / 100000).toFixed(1)}L</div>
                             </div>
                             <div className="col-span-3">
                               <div className="font-medium">
                                 {new Date(disbursal.date).toLocaleDateString()}
                               </div>
                             </div>
                             <div className="col-span-3">
                               <div className="font-medium">{disbursal.reason}</div>
                             </div>
                             <div className="col-span-2">
                               <TRRFStatusBadge status={disbursal.status} />
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className="py-8 text-center text-muted-foreground">
                       No disbursals found
                     </div>
                   )}
                 </div>
                
                 <Separator />
                
                 <div>
                   <h4 className="text-sm font-medium mb-4">Pending Approvals</h4>
                   {trrf.disbursals && trrf.disbursals.filter((d: any) => d.status === 'pending').length > 0 ? (
                     <div className="space-y-4">
                       {trrf.disbursals
                         .filter((disbursal: any) => disbursal.status === 'pending')
                         .map((disbursal: any) => (
                           <Card key={disbursal.id}>
                             <CardHeader className="pb-2">
                               <div className="flex items-center justify-between">
                                 <CardTitle className="text-sm">Disbursal Request #{disbursal.id}</CardTitle>
                                 <TRRFStatusBadge status={disbursal.status} />
                               </div>
                               <CardDescription>
                                 {new Date(disbursal.date).toLocaleDateString()}
                               </CardDescription>
                             </CardHeader>
                             <CardContent className="pb-2">
                               <div className="grid grid-cols-2 gap-2 text-sm">
                                 <div className="text-muted-foreground">Amount</div>
                                 <div className="font-medium">₹{disbursal.amount.toLocaleString()}</div>
                                
                                 <div className="text-muted-foreground">Reason</div>
                                 <div className="font-medium">{disbursal.reason}</div>
                               </div>
                             </CardContent>
                             <CardFooter className="flex justify-end gap-2">
                               <Button
                                 variant="destructive"
                                 size="sm"
                                 onClick={() => rejectTRRFDisbursal(disbursal.id)}
                               >
                                 Reject
                               </Button>
                               <Button
                                 variant="default"
                                 size="sm"
                                 onClick={() => approveTRRFDisbursal(disbursal.id)}
                               >
                                 Approve
                               </Button>
                             </CardFooter>
                           </Card>
                         ))}
                     </div>
                   ) : (
                     <div className="py-8 text-center text-muted-foreground">
                       No pending approvals at this time
                     </div>
                   )}
                 </div>
               </div>
             )}
           </CardContent>
         </Card>
       </TabsContent>
     </Tabs>
   </div>
 );
}


// Made with Bob





