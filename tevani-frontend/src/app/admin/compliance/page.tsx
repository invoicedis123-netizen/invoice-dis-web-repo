

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
 Shield,
 Eye,
 MessageSquare,
 Clock,
 Calendar,
 User,
 FileText,
 Bell,
 Loader2
} from 'lucide-react';
import { legalbotAPI, adminAPI } from '../../../lib/api';


// Consent status badge component
function ConsentStatusBadge({ status }: { status: string }) {
 switch (status) {
   case 'acknowledged':
     return <Badge className="bg-green-500 hover:bg-green-600">Acknowledged</Badge>;
   case 'pending':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
   case 'expired':
     return <Badge className="bg-red-500 hover:bg-red-600">Expired</Badge>;
   default:
     return <Badge>{status}</Badge>;
 }
}


// Flag severity badge component
function FlagSeverityBadge({ severity }: { severity: string }) {
 switch (severity) {
   case 'critical':
     return <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>;
   case 'high':
     return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
   case 'medium':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
   case 'low':
     return <Badge className="bg-blue-500 hover:bg-blue-600">Low</Badge>;
   default:
     return <Badge>{severity}</Badge>;
 }
}


// Flag status badge component
function FlagStatusBadge({ status }: { status: string }) {
 switch (status) {
   case 'open':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Open</Badge>;
   case 'investigating':
     return <Badge className="bg-blue-500 hover:bg-blue-600">Investigating</Badge>;
   case 'resolved':
     return <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>;
   default:
     return <Badge>{status}</Badge>;
 }
}


export default function CompliancePage() {
 const [consents, setConsents] = useState<any[]>([]);
 const [filteredConsents, setFilteredConsents] = useState<any[]>([]);
 const [auditLogs, setAuditLogs] = useState<any[]>([]);
 const [filteredAuditLogs, setFilteredAuditLogs] = useState<any[]>([]);
 const [complianceFlags, setComplianceFlags] = useState<any[]>([]);
 const [filteredFlags, setFilteredFlags] = useState<any[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [currentTab, setCurrentTab] = useState('passive-consent');
 const [selectedConsent, setSelectedConsent] = useState<any>(null);
 const [selectedFlag, setSelectedFlag] = useState<any>(null);
 const [loading, setLoading] = useState({
   consents: true,
   auditLogs: true,
   flags: true
 });
 const [error, setError] = useState<{
   consents: string | null,
   auditLogs: string | null,
   flags: string | null
 }>({
   consents: null,
   auditLogs: null,
   flags: null
 });
  // Fetch consents on component mount or tab change
 useEffect(() => {
   if (currentTab === 'passive-consent') {
     const fetchConsents = async () => {
       try {
         setLoading(prev => ({ ...prev, consents: true }));
         const consentsData = await adminAPI.getConsents();
         setConsents(consentsData);
         setFilteredConsents(consentsData);
         setLoading(prev => ({ ...prev, consents: false }));
       } catch (err) {
         console.error('Error fetching consents:', err);
         setError(prev => ({
           ...prev,
           consents: 'Failed to load consents. Please try again later.'
         }));
         setLoading(prev => ({ ...prev, consents: false }));
       }
     };
    
     fetchConsents();
   } else if (currentTab === 'audit-logs') {
     const fetchAuditLogs = async () => {
       try {
         setLoading(prev => ({ ...prev, auditLogs: true }));
         const logsData = await adminAPI.getAuditLogs();
         setAuditLogs(logsData);
         setFilteredAuditLogs(logsData);
         setLoading(prev => ({ ...prev, auditLogs: false }));
       } catch (err) {
         console.error('Error fetching audit logs:', err);
         setError(prev => ({
           ...prev,
           auditLogs: 'Failed to load audit logs. Please try again later.'
         }));
         setLoading(prev => ({ ...prev, auditLogs: false }));
       }
     };
    
     fetchAuditLogs();
   } else if (currentTab === 'compliance-flags') {
     const fetchComplianceFlags = async () => {
       try {
         setLoading(prev => ({ ...prev, flags: true }));
         const flagsData = await adminAPI.getComplianceFlags();
         setComplianceFlags(flagsData);
         setFilteredFlags(flagsData);
         setLoading(prev => ({ ...prev, flags: false }));
       } catch (err) {
         console.error('Error fetching compliance flags:', err);
         setError(prev => ({
           ...prev,
           flags: 'Failed to load compliance flags. Please try again later.'
         }));
         setLoading(prev => ({ ...prev, flags: false }));
       }
     };
    
     fetchComplianceFlags();
   }
 }, [currentTab]);
  // Filter data based on search term and current tab
 useEffect(() => {
   if (currentTab === 'passive-consent' && consents.length > 0) {
     const result = consents.filter(consent =>
       consent.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       consent.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       consent.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase())
     );
     setFilteredConsents(result);
   } else if (currentTab === 'audit-logs' && auditLogs.length > 0) {
     const result = auditLogs.filter(log =>
       log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       log.details?.toLowerCase().includes(searchTerm.toLowerCase())
     );
     setFilteredAuditLogs(result);
   } else if (currentTab === 'compliance-flags' && complianceFlags.length > 0) {
     const result = complianceFlags.filter(flag =>
       flag.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       flag.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (flag.assigned_to && flag.assigned_to.toLowerCase().includes(searchTerm.toLowerCase()))
     );
     setFilteredFlags(result);
   }
 }, [searchTerm, currentTab, consents, auditLogs, complianceFlags]);
  // Handle consent selection for details view
 const handleConsentSelect = async (consent: any) => {
   try {
     // Get detailed consent information
     const detailedConsent = await adminAPI.getConsentById(consent.id);
     setSelectedConsent(detailedConsent);
   } catch (err) {
     console.error('Error fetching consent details:', err);
     // Fall back to the basic consent info we already have
     setSelectedConsent(consent);
   }
 };
  // Handle flag selection for details view
 const handleFlagSelect = async (flag: any) => {
   try {
     // Get detailed flag information
     const detailedFlag = await adminAPI.getComplianceFlagById(flag.id);
     setSelectedFlag(detailedFlag);
   } catch (err) {
     console.error('Error fetching flag details:', err);
     // Fall back to the basic flag info we already have
     setSelectedFlag(flag);
   }
 };
  // Handle flag status update
 const updateFlagStatus = async (flagId: string, status: string) => {
   try {
     await adminAPI.updateComplianceFlag(flagId, { status });
    
     // Update local state
     setComplianceFlags(complianceFlags.map(flag =>
       flag.id === flagId ? { ...flag, status } : flag
     ));
    
     // Update selected flag if it's the one being modified
     if (selectedFlag && selectedFlag.id === flagId) {
       setSelectedFlag({
         ...selectedFlag,
         status
       });
     }
   } catch (err) {
     console.error('Error updating flag status:', err);
     setError(prev => ({
       ...prev,
       flags: 'Failed to update flag status. Please try again.'
     }));
   }
 };
  // Handle flag assignment
 const assignFlag = async (flagId: string, assignee: string) => {
   try {
     await adminAPI.updateComplianceFlag(flagId, { assigned_to: assignee });
    
     // Update local state
     setComplianceFlags(complianceFlags.map(flag =>
       flag.id === flagId ? { ...flag, assigned_to: assignee } : flag
     ));
    
     // Update selected flag if it's the one being modified
     if (selectedFlag && selectedFlag.id === flagId) {
       setSelectedFlag({
         ...selectedFlag,
         assigned_to: assignee
       });
     }
   } catch (err) {
     console.error('Error assigning flag:', err);
     setError(prev => ({
       ...prev,
       flags: 'Failed to assign flag. Please try again.'
     }));
   }
 };
  // Send reminder notification
 const sendReminder = async (consentId: string) => {
   try {
     await adminAPI.sendConsentReminder(consentId);
    
     // Update local state to show the reminder was sent
     // In a real implementation, we might want to refresh the consent data
     // to show the updated events timeline
     alert(`Reminder sent for consent ${consentId}`);
   } catch (err) {
     console.error('Error sending reminder:', err);
     setError(prev => ({
       ...prev,
       consents: 'Failed to send reminder. Please try again.'
     }));
   }
 };


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold tracking-tight">Legal & Compliance</h1>
       <div className="flex items-center gap-2">
         <Button variant="outline" className="flex items-center gap-2">
           <Download className="h-4 w-4" />
           Export
         </Button>
       </div>
     </div>
    
     <Tabs defaultValue="passive-consent" className="space-y-4" onValueChange={setCurrentTab}>
       <TabsList>
         <TabsTrigger value="passive-consent">Passive Consent</TabsTrigger>
         <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
         <TabsTrigger value="compliance-flags">Compliance Flags</TabsTrigger>
       </TabsList>
      
       <TabsContent value="passive-consent" className="space-y-4">
         <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
           <div className="md:w-2/3">
             <Card>
               <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                   <CardTitle>Passive Consent Tracker</CardTitle>
                   <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-8 gap-1">
                       <Filter className="h-3.5 w-3.5" />
                       Filter
                     </Button>
                   </div>
                 </div>
                 <CardDescription>
                   Track buyer acknowledgments and notifications
                 </CardDescription>
                 <div className="relative flex-1 pt-3">
                   <Search className="absolute left-2.5 top-5.5 h-4 w-4 text-muted-foreground" />
                   <Input
                     type="search"
                     placeholder="Search consents..."
                     className="pl-8"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {loading.consents ? (
                     <div className="py-12 text-center">
                       <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                       <p className="text-muted-foreground">Loading consents...</p>
                     </div>
                   ) : error.consents ? (
                     <div className="py-12 text-center text-red-500">
                       <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                       <p>{error.consents}</p>
                     </div>
                   ) : (
                     <>
                       <div className="rounded-md border">
                         <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                           <div className="col-span-3">Invoice</div>
                           <div className="col-span-3">Buyer</div>
                           <div className="col-span-2">Status</div>
                           <div className="col-span-2">Date</div>
                           <div className="col-span-2 text-right">Actions</div>
                         </div>
                         <div className="divide-y">
                           {filteredConsents.map((consent) => (
                             <div
                               key={consent.id}
                               className={`grid grid-cols-12 items-center p-3 text-sm ${
                                 selectedConsent?.id === consent.id ? 'bg-muted/50' : ''
                               }`}
                               onClick={() => handleConsentSelect(consent)}
                             >
                               <div className="col-span-3">
                                 <div className="font-medium">{consent.invoice_number}</div>
                                 <div className="text-xs text-muted-foreground">
                                   ID: {consent.invoice_id}
                                 </div>
                               </div>
                               <div className="col-span-3">
                                 <div className="font-medium">{consent.buyer_name}</div>
                                 <div className="text-xs text-muted-foreground">
                                   {consent.buyer_email}
                                 </div>
                               </div>
                               <div className="col-span-2">
                                 <ConsentStatusBadge status={consent.status} />
                               </div>
                               <div className="col-span-2">
                                 <div className="text-xs">
                                   {new Date(consent.created_at).toLocaleDateString()}
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
                      
                       {filteredConsents.length === 0 && !loading.consents && (
                         <div className="py-12 text-center text-muted-foreground">
                           No consents found matching your search criteria
                         </div>
                       )}
                     </>
                   )}
                 </div>
               </CardContent>
             </Card>
           </div>
          
           <div className="md:w-1/3">
             {selectedConsent ? (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle>Consent Details</CardTitle>
                   <CardDescription>
                     View passive consent information
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="flex flex-col items-center mb-4">
                     <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                       <MessageSquare className="h-8 w-8 text-muted-foreground" />
                     </div>
                     <h3 className="text-lg font-medium">{selectedConsent.invoice_number}</h3>
                     <p className="text-sm text-muted-foreground">
                       {selectedConsent.buyer_name}
                     </p>
                   </div>
                  
                   <Separator className="my-4" />
                  
                   <div className="space-y-4">
                     <div>
                       <h4 className="text-sm font-medium mb-2">Consent Information</h4>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         <div className="text-muted-foreground">Status</div>
                         <div className="font-medium">
                           <ConsentStatusBadge status={selectedConsent.status} />
                         </div>
                        
                         <div className="text-muted-foreground">Created</div>
                         <div className="font-medium">
                           {new Date(selectedConsent.created_at).toLocaleDateString()}
                         </div>
                        
                         {selectedConsent.acknowledged_at && (
                           <>
                             <div className="text-muted-foreground">Acknowledged</div>
                             <div className="font-medium">
                               {new Date(selectedConsent.acknowledged_at).toLocaleDateString()}
                             </div>
                           </>
                         )}
                        
                         <div className="text-muted-foreground">Method</div>
                         <div className="font-medium capitalize">
                           {selectedConsent.notification_method}
                         </div>
                        
                         <div className="text-muted-foreground">Buyer Email</div>
                         <div className="font-medium">{selectedConsent.buyer_email}</div>
                        
                         <div className="text-muted-foreground">Buyer Phone</div>
                         <div className="font-medium">{selectedConsent.buyer_phone}</div>
                       </div>
                     </div>
                    
                     <Separator />
                    
                     <div>
                       <h4 className="text-sm font-medium mb-2">Event Timeline</h4>
                       <div className="space-y-3">
                         {selectedConsent.events && selectedConsent.events.map((event: any, index: number) => (
                           <div key={index} className="flex items-start gap-2 text-sm">
                             <div className="h-2 w-2 mt-1.5 rounded-full bg-primary"></div>
                             <div className="flex-1">
                               <div className="font-medium capitalize">
                                 {event.event.replace(/_/g, ' ')}
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {new Date(event.timestamp).toLocaleString()}
                               </div>
                               {event.details && (
                                 <div className="text-xs text-muted-foreground mt-1">
                                   Method: {event.details.method}
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                    
                     {selectedConsent.status === 'pending' && (
                       <>
                         <Separator />
                        
                         <div>
                           <h4 className="text-sm font-medium mb-2">Actions</h4>
                           <Button
                             variant="default"
                             size="sm"
                             className="w-full"
                             onClick={() => sendReminder(selectedConsent.id)}
                           >
                             <Bell className="h-4 w-4 mr-1" />
                             Send Reminder
                           </Button>
                         </div>
                       </>
                     )}
                   </div>
                 </CardContent>
               </Card>
             ) : (
               <Card>
                 <CardHeader>
                   <CardTitle>Consent Details</CardTitle>
                   <CardDescription>
                     Select a consent to view details
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center py-10">
                   <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
                   <p className="text-muted-foreground text-center">
                     Select a consent from the list to view details
                   </p>
                 </CardContent>
               </Card>
             )}
           </div>
         </div>
       </TabsContent>
      
       <TabsContent value="audit-logs" className="space-y-4">
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <CardTitle>Audit Logs</CardTitle>
               <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" className="h-8 gap-1">
                   <Filter className="h-3.5 w-3.5" />
                   Filter
                 </Button>
                 <Button variant="outline" size="sm" className="h-8 gap-1">
                   <Download className="h-3.5 w-3.5" />
                   Export
                 </Button>
               </div>
             </div>
             <CardDescription>
               Immutable log of all admin actions
             </CardDescription>
             <div className="relative flex-1 pt-3">
               <Search className="absolute left-2.5 top-5.5 h-4 w-4 text-muted-foreground" />
               <Input
                 type="search"
                 placeholder="Search audit logs..."
                 className="pl-8"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {loading.auditLogs ? (
                 <div className="py-12 text-center">
                   <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                   <p className="text-muted-foreground">Loading audit logs...</p>
                 </div>
               ) : error.auditLogs ? (
                 <div className="py-12 text-center text-red-500">
                   <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                   <p>{error.auditLogs}</p>
                 </div>
               ) : (
                 <>
                   <div className="rounded-md border">
                     <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                       <div className="col-span-2">Timestamp</div>
                       <div className="col-span-2">User</div>
                       <div className="col-span-2">Action</div>
                       <div className="col-span-4">Details</div>
                       <div className="col-span-2">IP Address</div>
                     </div>
                     <div className="divide-y">
                       {filteredAuditLogs.map((log) => (
                         <div key={log.id} className="grid grid-cols-12 items-center p-3 text-sm">
                           <div className="col-span-2">
                             <div className="text-xs">
                               {new Date(log.timestamp).toLocaleDateString()}
                             </div>
                             <div className="text-xs text-muted-foreground">
                               {new Date(log.timestamp).toLocaleTimeString()}
                             </div>
                           </div>
                           <div className="col-span-2">
                             <div className="font-medium">{log.user}</div>
                             <div className="text-xs text-muted-foreground capitalize">
                               {log.user_role.replace(/_/g, ' ')}
                             </div>
                           </div>
                           <div className="col-span-2">
                             <div className="text-xs capitalize">
                               {log.action.replace(/_/g, ' ')}
                             </div>
                           </div>
                           <div className="col-span-4">
                             <div className="text-xs">
                               {log.details}
                             </div>
                           </div>
                           <div className="col-span-2">
                             <div className="text-xs">
                               {log.ip_address}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                  
                   {filteredAuditLogs.length === 0 && !loading.auditLogs && (
                     <div className="py-12 text-center text-muted-foreground">
                       No audit logs found matching your search criteria
                     </div>
                   )}
                 </>
               )}
             </div>
           </CardContent>
         </Card>
       </TabsContent>
      
       <TabsContent value="compliance-flags" className="space-y-4">
         <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
           <div className="md:w-2/3">
             <Card>
               <CardHeader className="pb-3">
                 <div className="flex items-center justify-between">
                   <CardTitle>Compliance Flags</CardTitle>
                   <div className="flex items-center gap-2">
                     <Button variant="outline" size="sm" className="h-8 gap-1">
                       <Filter className="h-3.5 w-3.5" />
                       Filter
                     </Button>
                   </div>
                 </div>
                 <CardDescription>
                   Automated alerts for potential compliance issues
                 </CardDescription>
                 <div className="relative flex-1 pt-3">
                   <Search className="absolute left-2.5 top-5.5 h-4 w-4 text-muted-foreground" />
                   <Input
                     type="search"
                     placeholder="Search flags..."
                     className="pl-8"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {loading.flags ? (
                     <div className="py-12 text-center">
                       <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                       <p className="text-muted-foreground">Loading compliance flags...</p>
                     </div>
                   ) : error.flags ? (
                     <div className="py-12 text-center text-red-500">
                       <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                       <p>{error.flags}</p>
                     </div>
                   ) : (
                     <>
                       <div className="rounded-md border">
                         <div className="grid grid-cols-12 bg-muted/50 p-3 text-sm font-medium">
                           <div className="col-span-3">Type</div>
                           <div className="col-span-2">Severity</div>
                           <div className="col-span-3">Details</div>
                           <div className="col-span-2">Status</div>
                           <div className="col-span-2 text-right">Actions</div>
                         </div>
                         <div className="divide-y">
                           {filteredFlags.map((flag) => (
                             <div
                               key={flag.id}
                               className={`grid grid-cols-12 items-center p-3 text-sm ${
                                 selectedFlag?.id === flag.id ? 'bg-muted/50' : ''
                               }`}
                               onClick={() => handleFlagSelect(flag)}
                             >
                               <div className="col-span-3">
                                 <div className="font-medium capitalize">
                                   {flag.type.replace(/_/g, ' ')}
                                 </div>
                                 <div className="text-xs text-muted-foreground">
                                   {new Date(flag.created_at).toLocaleDateString()}
                                 </div>
                               </div>
                               <div className="col-span-2">
                                 <FlagSeverityBadge severity={flag.severity} />
                               </div>
                               <div className="col-span-3">
                                 <div className="text-xs">
                                   {flag.details}
                                 </div>
                               </div>
                               <div className="col-span-2">
                                 <FlagStatusBadge status={flag.status} />
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
                      
                       {filteredFlags.length === 0 && !loading.flags && (
                         <div className="py-12 text-center text-muted-foreground">
                           No compliance flags found matching your search criteria
                         </div>
                       )}
                     </>
                   )}
                 </div>
               </CardContent>
             </Card>
           </div>
          
           <div className="md:w-1/3">
             {selectedFlag ? (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle>Flag Details</CardTitle>
                   <CardDescription>
                     View compliance flag information
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="flex flex-col items-center mb-4">
                     <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
                       <Shield className="h-8 w-8 text-muted-foreground" />
                     </div>
                     <h3 className="text-lg font-medium capitalize">
                       {selectedFlag.type.replace(/_/g, ' ')}
                     </h3>
                     <p className="text-sm text-muted-foreground">
                       <FlagSeverityBadge severity={selectedFlag.severity} />
                     </p>
                   </div>
                  
                   <Separator className="my-4" />
                  
                   <div className="space-y-4">
                     <div>
                       <h4 className="text-sm font-medium mb-2">Flag Information</h4>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                         <div className="text-muted-foreground">Status</div>
                         <div className="font-medium">
                           <FlagStatusBadge status={selectedFlag.status} />
                         </div>
                        
                         <div className="text-muted-foreground">Created</div>
                         <div className="font-medium">
                           {new Date(selectedFlag.created_at).toLocaleDateString()}
                         </div>
                        
                         <div className="text-muted-foreground">Assigned To</div>
                         <div className="font-medium">
                           {selectedFlag.assigned_to || 'Unassigned'}
                         </div>
                        
                         <div className="text-muted-foreground">Related Invoice</div>
                         <div className="font-medium">
                           {selectedFlag.invoice_id || 'N/A'}
                         </div>
                       </div>
                     </div>
                    
                     <Separator />
                    
                     <div>
                       <h4 className="text-sm font-medium mb-2">Details</h4>
                       <p className="text-sm">
                         {selectedFlag.details}
                       </p>
                     </div>
                    
                     <Separator />
                    
                     <div>
                       <h4 className="text-sm font-medium mb-2">Actions</h4>
                       <div className="space-y-2">
                         {selectedFlag.status !== 'resolved' && (
                           <Button
                             variant="default"
                             size="sm"
                             className="w-full"
                             onClick={() => updateFlagStatus(selectedFlag.id, 'resolved')}
                           >
                             <CheckCircle className="h-4 w-4 mr-1" />
                             Mark as Resolved
                           </Button>
                         )}
                        
                         {selectedFlag.status === 'open' && (
                           <Button
                             variant="outline"
                             size="sm"
                             className="w-full"
                             onClick={() => updateFlagStatus(selectedFlag.id, 'investigating')}
                           >
                             <Eye className="h-4 w-4 mr-1" />
                             Mark as Investigating
                           </Button>
                         )}
                        
                         {!selectedFlag.assigned_to && (
                           <Button
                             variant="outline"
                             size="sm"
                             className="w-full"
                             onClick={() => assignFlag(selectedFlag.id, 'current_user')}
                           >
                             <User className="h-4 w-4 mr-1" />
                             Assign to Me
                           </Button>
                         )}
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ) : (
               <Card>
                 <CardHeader>
                   <CardTitle>Flag Details</CardTitle>
                   <CardDescription>
                     Select a flag to view details
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center py-10">
                   <Shield className="h-16 w-16 text-muted-foreground/50 mb-4" />
                   <p className="text-muted-foreground text-center">
                     Select a compliance flag from the list to view details
                   </p>
                 </CardContent>
               </Card>
             )}
           </div>
         </div>
       </TabsContent>
     </Tabs>
   </div>
 );
}



