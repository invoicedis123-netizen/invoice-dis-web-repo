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
 UserPlus,
 Download,
 MoreHorizontal,
 CheckCircle,
 XCircle,
 AlertCircle,
 User,
 Building,
 Wallet
} from 'lucide-react';
import { userAPI, adminAPI } from '../../../lib/api';
import { Loader2 } from 'lucide-react';


// User type badge component
function UserTypeBadge({ type }: { type: string }) {
 switch (type) {
   case 'business':
     return <Badge className="bg-blue-500 hover:bg-blue-600">Business</Badge>;
   case 'investor':
     return <Badge className="bg-green-500 hover:bg-green-600">Investor</Badge>;
   case 'admin':
     return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
   default:
     return <Badge>{type}</Badge>;
 }
}


// KYC status badge component
function KycStatusBadge({ status }: { status: string }) {
 switch (status) {
   case 'verified':
     return <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>;
   case 'pending':
     return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
   case 'rejected':
     return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
   default:
     return <Badge>{status}</Badge>;
 }
}


// User status badge component
function UserStatusBadge({ isActive }: { isActive: boolean }) {
 return isActive ?
   <Badge className="bg-green-500 hover:bg-green-600">Active</Badge> :
   <Badge className="bg-gray-500 hover:bg-gray-600">Inactive</Badge>;
}


export default function UsersPage() {
 const [users, setUsers] = useState<any[]>([]);
 const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [currentFilter, setCurrentFilter] = useState('all');
 const [selectedUser, setSelectedUser] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  // Fetch users on component mount
 useEffect(() => {
   const fetchUsers = async () => {
     try {
       setLoading(true);
       const userData = await adminAPI.getUsers();
       setUsers(userData);
       setFilteredUsers(userData);
       setLoading(false);
     } catch (err) {
       console.error('Error fetching users:', err);
       setError('Failed to load users. Please try again later.');
       setLoading(false);
     }
   };
  
   fetchUsers();
 }, []);
  // Filter users based on search term and filter
 useEffect(() => {
   let result = users;
  
   // Apply search filter
   if (searchTerm) {
     result = result.filter(user =>
       user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase())
     );
   }
  
   // Apply type filter
   if (currentFilter !== 'all') {
     result = result.filter(user => user.type === currentFilter);
   }
  
   setFilteredUsers(result);
 }, [searchTerm, currentFilter, users]);
  // Handle user selection for details view
 const handleUserSelect = async (user: any) => {
   try {
     // Get detailed user information
     const detailedUser = await adminAPI.getUserById(user.id);
     setSelectedUser(detailedUser);
   } catch (err) {
     console.error('Error fetching user details:', err);
     // Fall back to the basic user info we already have
     setSelectedUser(user);
   }
 };
  // Handle user activation/deactivation
 const toggleUserStatus = async (userId: string) => {
   try {
     const user = users.find(u => u.id === userId);
     if (!user) return;
    
     if (user.is_active) {
       await adminAPI.deactivateUser(userId);
     } else {
       await adminAPI.activateUser(userId);
     }
    
     // Update local state
     setUsers(users.map(user =>
       user.id === userId ? { ...user, is_active: !user.is_active } : user
     ));
    
     // Update selected user if it's the one being modified
     if (selectedUser && selectedUser.id === userId) {
       setSelectedUser({
         ...selectedUser,
         is_active: !selectedUser.is_active
       });
     }
   } catch (err) {
     console.error('Error toggling user status:', err);
     setError('Failed to update user status. Please try again.');
   }
 };
  // Handle KYC verification
 const updateKycStatus = async (userId: string, status: string) => {
   try {
     await adminAPI.updateKycStatus(userId, status);
    
     // Update local state
     setUsers(users.map(user =>
       user.id === userId ? { ...user, kyc_status: status } : user
     ));
    
     // Update selected user if it's the one being modified
     if (selectedUser && selectedUser.id === userId) {
       setSelectedUser({
         ...selectedUser,
         kyc_status: status
       });
     }
   } catch (err) {
     console.error('Error updating KYC status:', err);
     setError('Failed to update KYC status. Please try again.');
   }
 };


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
       <Button className="flex items-center gap-2">
         <UserPlus className="h-4 w-4" />
         Add User
       </Button>
     </div>
    
     <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
       <div className="md:w-2/3">
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center justify-between">
               <CardTitle>Users</CardTitle>
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
               Manage user accounts, KYC verification, and permissions
             </CardDescription>
             <div className="flex items-center gap-2 pt-3">
               <div className="relative flex-1">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder="Search users..."
                   className="pl-8"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <Tabs defaultValue="all" className="w-[400px]" onValueChange={setCurrentFilter}>
                 <TabsList>
                   <TabsTrigger value="all">All</TabsTrigger>
                   <TabsTrigger value="business">Business</TabsTrigger>
                   <TabsTrigger value="investor">Investor</TabsTrigger>
                   <TabsTrigger value="admin">Admin</TabsTrigger>
                 </TabsList>
               </Tabs>
             </div>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {loading ? (
                 <div className="py-12 text-center">
                   <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                   <p className="text-muted-foreground">Loading users...</p>
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
                       <div className="col-span-4">Name / Email</div>
                       <div className="col-span-2">Type</div>
                       <div className="col-span-2">KYC Status</div>
                       <div className="col-span-2">Status</div>
                       <div className="col-span-2 text-right">Actions</div>
                     </div>
                     <div className="divide-y">
                       {filteredUsers.map((user) => (
                         <div
                           key={user.id}
                           className={`grid grid-cols-12 items-center p-3 text-sm ${
                             selectedUser?.id === user.id ? 'bg-muted/50' : ''
                           }`}
                           onClick={() => handleUserSelect(user)}
                         >
                           <div className="col-span-4">
                             <div className="font-medium">{user.name}</div>
                             <div className="text-muted-foreground">{user.email}</div>
                           </div>
                           <div className="col-span-2">
                             <UserTypeBadge type={user.type} />
                           </div>
                           <div className="col-span-2">
                             <KycStatusBadge status={user.kyc_status} />
                           </div>
                           <div className="col-span-2">
                             <UserStatusBadge isActive={user.is_active} />
                           </div>
                           <div className="col-span-2 flex justify-end">
                             <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                  
                   {filteredUsers.length === 0 && (
                     <div className="py-12 text-center text-muted-foreground">
                       No users found matching your search criteria
                     </div>
                   )}
                 </>
               )}
              
               <div className="flex items-center justify-between">
                 <div className="text-sm text-muted-foreground">
                   Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
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
         {selectedUser ? (
           <Card>
             <CardHeader className="pb-3">
               <CardTitle>User Details</CardTitle>
               <CardDescription>
                 View and manage user information
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="flex flex-col items-center mb-4">
                 <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-2">
                   {selectedUser.type === 'business' ? (
                     <Building className="h-10 w-10 text-muted-foreground" />
                   ) : selectedUser.type === 'investor' ? (
                     <Wallet className="h-10 w-10 text-muted-foreground" />
                   ) : (
                     <User className="h-10 w-10 text-muted-foreground" />
                   )}
                 </div>
                 <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                 <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
               </div>
              
               <Separator className="my-4" />
              
               <div className="space-y-4">
                 <div>
                   <h4 className="text-sm font-medium mb-2">Account Information</h4>
                   <div className="grid grid-cols-2 gap-2 text-sm">
                     <div className="text-muted-foreground">User Type</div>
                     <div className="font-medium capitalize">{selectedUser.type}</div>
                    
                     {selectedUser.type === 'admin' && (
                       <>
                         <div className="text-muted-foreground">Admin Role</div>
                         <div className="font-medium capitalize">
                           {selectedUser.admin_role?.replace('_', ' ')}
                         </div>
                       </>
                     )}
                    
                     {selectedUser.type === 'business' && (
                       <>
                         <div className="text-muted-foreground">Business Type</div>
                         <div className="font-medium uppercase">{selectedUser.business_profile?.business_type}</div>
                        
                         <div className="text-muted-foreground">Company Name</div>
                         <div className="font-medium">{selectedUser.business_profile?.company_name}</div>
                        
                         <div className="text-muted-foreground">GSTIN</div>
                         <div className="font-medium">{selectedUser.business_profile?.gstin}</div>
                       </>
                     )}
                    
                     {selectedUser.type === 'investor' && (
                       <>
                         <div className="text-muted-foreground">Investor Type</div>
                         <div className="font-medium capitalize">{selectedUser.investor_profile?.investor_type?.replace('-', ' ')}</div>
                        
                         <div className="text-muted-foreground">Investment Capacity</div>
                         <div className="font-medium">₹{selectedUser.investor_profile?.investment_capacity}</div>
                       </>
                     )}
                    
                     <div className="text-muted-foreground">Created On</div>
                     <div className="font-medium">
                       {new Date(selectedUser.created_at).toLocaleDateString()}
                     </div>
                   </div>
                 </div>
                
                 <Separator />
                
                 <div>
                   <h4 className="text-sm font-medium mb-2">Account Status</h4>
                   <div className="flex items-center justify-between">
                     <span className="text-sm">
                       {selectedUser.is_active ? 'Active' : 'Inactive'}
                     </span>
                     <Button
                       variant={selectedUser.is_active ? "destructive" : "default"}
                       size="sm"
                       onClick={() => toggleUserStatus(selectedUser.id)}
                     >
                       {selectedUser.is_active ? 'Deactivate' : 'Activate'}
                     </Button>
                   </div>
                 </div>
                
                 <Separator />
                
                 <div>
                   <h4 className="text-sm font-medium mb-2">KYC Verification</h4>
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <span className="text-sm">Status: </span>
                       <KycStatusBadge status={selectedUser.kyc_status} />
                     </div>
                    
                     <div className="flex items-center gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         className="flex-1"
                         onClick={() => updateKycStatus(selectedUser.id, 'verified')}
                       >
                         <CheckCircle className="h-4 w-4 mr-1" />
                         Approve
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="flex-1"
                         onClick={() => updateKycStatus(selectedUser.id, 'rejected')}
                       >
                         <XCircle className="h-4 w-4 mr-1" />
                         Reject
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         className="flex-1"
                         onClick={() => updateKycStatus(selectedUser.id, 'pending')}
                       >
                         <AlertCircle className="h-4 w-4 mr-1" />
                         Flag
                       </Button>
                     </div>
                   </div>
                 </div>
               </div>
             </CardContent>
             <CardFooter className="border-t pt-4 flex justify-between">
               <Button variant="outline">Reset Password</Button>
               <Button variant="default">Edit User</Button>
             </CardFooter>
           </Card>
         ) : (
           <Card>
             <CardHeader>
               <CardTitle>User Details</CardTitle>
               <CardDescription>
                 Select a user to view details
               </CardDescription>
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center py-10">
               <User className="h-16 w-16 text-muted-foreground/50 mb-4" />
               <p className="text-muted-foreground text-center">
                 Select a user from the list to view their details and manage their account
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





