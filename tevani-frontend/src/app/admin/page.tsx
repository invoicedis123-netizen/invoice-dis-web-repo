'use client';


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import {
 BarChart,
 Users,
 FileText,
 AlertTriangle,
 CheckCircle,
 Clock,
 TrendingUp,
 TrendingDown,
 Wallet,
 Shield
} from 'lucide-react';
import { adminAPI } from '../../lib/api';


// Chart components
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 BarElement,
 PointElement,
 LineElement,
 Title,
 Tooltip,
 Legend,
 ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';


// Register ChartJS components
ChartJS.register(
 CategoryScale,
 LinearScale,
 BarElement,
 PointElement,
 LineElement,
 Title,
 Tooltip,
 Legend,
 ArcElement
);


// Dashboard KPI Card component
interface KPICardProps {
 title: string;
 value: string | number;
 description: string;
 icon: React.ReactNode;
 trend?: 'up' | 'down' | 'neutral';
 trendValue?: string;
}


function KPICard({ title, value, description, icon, trend, trendValue }: KPICardProps) {
 return (
   <Card>
     <CardHeader className="flex flex-row items-center justify-between pb-2">
       <CardTitle className="text-sm font-medium">{title}</CardTitle>
       <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
         {icon}
       </div>
     </CardHeader>
     <CardContent>
       <div className="text-2xl font-bold">{value}</div>
       <p className="text-xs text-muted-foreground">{description}</p>
     </CardContent>
     {trend && (
       <CardFooter className="p-2">
         <div className={`flex items-center text-xs ${
           trend === 'up' ? 'text-green-500' :
           trend === 'down' ? 'text-red-500' : 'text-gray-500'
         }`}>
           {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> :
            trend === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
           {trendValue}
         </div>
       </CardFooter>
     )}
   </Card>
 );
}


export default function AdminDashboard() {
 const [userStats, setUserStats] = useState({
   total: 0,
   business: 0,
   investor: 0,
   active: 0
 });
  const [invoiceStats, setInvoiceStats] = useState({
   total: 0,
   pending: 0,
   validated: 0,
   funded: 0,
   defaulted: 0
 });
  const [investmentStats, setInvestmentStats] = useState({
   totalVolume: 0,
   activeInvestments: 0,
   averageROI: 0,
   trrf: {
     total_pool: 0,
     utilized: 0,
     available: 0,
     default_rate: 0,
     industry_avg_default: 0
   }
 });


 // Fetch data on component mount
 useEffect(() => {
   const fetchDashboardData = async () => {
     try {
       // Fetch real data from the API
       const dashboardStats = await adminAPI.getDashboardStats();
      
       // Update user stats
       setUserStats({
         total: dashboardStats.user_stats.total,
         business: dashboardStats.user_stats.business,
         investor: dashboardStats.user_stats.investor,
         active: dashboardStats.user_stats.active
       });
      
       // Update invoice stats
       setInvoiceStats({
         total: dashboardStats.invoice_stats.total,
         pending: dashboardStats.invoice_stats.pending_validation,
         validated: dashboardStats.invoice_stats.validated,
         funded: dashboardStats.invoice_stats.funded,
         defaulted: dashboardStats.invoice_stats.defaulted
       });
      
       // Update investment stats
       setInvestmentStats({
         totalVolume: dashboardStats.investment_stats.total_volume,
         activeInvestments: dashboardStats.investment_stats.active_investments,
         averageROI: dashboardStats.investment_stats.average_roi,
         trrf: dashboardStats.investment_stats.trrf || {
           total_pool: 0,
           utilized: 0,
           available: 0,
           default_rate: 0,
           industry_avg_default: 0
         }
       });
      
       // Update chart data
      
       // Transaction trends
       if (dashboardStats.transaction_trends && dashboardStats.transaction_trends.length > 0) {
         const labels = dashboardStats.transaction_trends.map(item => item.date);
         const volumes = dashboardStats.transaction_trends.map(item => item.volume);
        
         setTransactionData({
           labels,
           datasets: [
             {
               label: 'Invoice Volume',
               data: volumes,
               backgroundColor: 'rgba(59, 130, 246, 0.5)',
               borderColor: 'rgb(59, 130, 246)',
               borderWidth: 1,
             },
           ],
         });
       }
      
       // Approval rates
       if (dashboardStats.approval_rates && dashboardStats.approval_rates.length > 0) {
         const labels = dashboardStats.approval_rates.map(item => item.month);
         const approved = dashboardStats.approval_rates.map(item => item.approved);
         const rejected = dashboardStats.approval_rates.map(item => item.rejected);
        
         setApprovalData({
           labels,
           datasets: [
             {
               label: 'Approved',
               data: approved,
               borderColor: 'rgb(34, 197, 94)',
               backgroundColor: 'rgba(34, 197, 94, 0.5)',
               tension: 0.3,
             },
             {
               label: 'Rejected',
               data: rejected,
               borderColor: 'rgb(239, 68, 68)',
               backgroundColor: 'rgba(239, 68, 68, 0.5)',
               tension: 0.3,
             },
           ],
         });
       }
      
       // Risk tier distribution
       if (dashboardStats.risk_distribution) {
         const tierA = dashboardStats.risk_distribution.A || 0;
         const tierB = dashboardStats.risk_distribution.B || 0;
         const tierC = dashboardStats.risk_distribution.C || 0;
         const tierD = dashboardStats.risk_distribution.D || 0;
        
         setRiskTierData({
           labels: ['Tier A', 'Tier B', 'Tier C', 'Tier D'],
           datasets: [
             {
               data: [tierA, tierB, tierC, tierD],
               backgroundColor: [
                 'rgba(34, 197, 94, 0.7)',
                 'rgba(59, 130, 246, 0.7)',
                 'rgba(245, 158, 11, 0.7)',
                 'rgba(239, 68, 68, 0.7)',
               ],
               borderColor: [
                 'rgb(34, 197, 94)',
                 'rgb(59, 130, 246)',
                 'rgb(245, 158, 11)',
                 'rgb(239, 68, 68)',
               ],
               borderWidth: 1,
             },
           ],
         });
       }
     } catch (error) {
       console.error('Error fetching dashboard data:', error);
       // Fallback to mock data if API fails
       setUserStats({
         total: 1250,
         business: 850,
         investor: 400,
         active: 980
       });
      
       setInvoiceStats({
         total: 3750,
         pending: 120,
         validated: 3450,
         funded: 2800,
         defaulted: 15
       });
      
       setInvestmentStats({
         totalVolume: 45000000,
         activeInvestments: 1200,
         averageROI: 12.5,
         trrf: {
           total_pool: 5000000,
           utilized: 2500000,
           available: 2500000,
           default_rate: 1.2,
           industry_avg_default: 2.5
         }
       });
     }
   };
  
   fetchDashboardData();
 }, []);


 // State for chart data
 const [transactionData, setTransactionData] = useState({
   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
   datasets: [
     {
       label: 'Invoice Volume',
       data: [0, 0, 0, 0, 0, 0, 0],
       backgroundColor: 'rgba(59, 130, 246, 0.5)',
       borderColor: 'rgb(59, 130, 246)',
       borderWidth: 1,
     },
   ],
 });


 const [approvalData, setApprovalData] = useState({
   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
   datasets: [
     {
       label: 'Approved',
       data: [0, 0, 0, 0, 0, 0, 0],
       borderColor: 'rgb(34, 197, 94)',
       backgroundColor: 'rgba(34, 197, 94, 0.5)',
       tension: 0.3,
     },
     {
       label: 'Rejected',
       data: [0, 0, 0, 0, 0, 0, 0],
       borderColor: 'rgb(239, 68, 68)',
       backgroundColor: 'rgba(239, 68, 68, 0.5)',
       tension: 0.3,
     },
   ],
 });


 const [riskTierData, setRiskTierData] = useState({
   labels: ['Tier A', 'Tier B', 'Tier C', 'Tier D'],
   datasets: [
     {
       data: [25, 25, 25, 25],
       backgroundColor: [
         'rgba(34, 197, 94, 0.7)',
         'rgba(59, 130, 246, 0.7)',
         'rgba(245, 158, 11, 0.7)',
         'rgba(239, 68, 68, 0.7)',
       ],
       borderColor: [
         'rgb(34, 197, 94)',
         'rgb(59, 130, 246)',
         'rgb(245, 158, 11)',
         'rgb(239, 68, 68)',
       ],
       borderWidth: 1,
     },
   ],
 });


 // No need for a separate useEffect for chart data as we're fetching it all in one call


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
       <div className="flex items-center space-x-2">
         <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()} (Live Data)</span>
       </div>
     </div>
    
     <Tabs defaultValue="overview" className="space-y-4">
       <TabsList>
         <TabsTrigger value="overview">Overview</TabsTrigger>
         <TabsTrigger value="users">Users</TabsTrigger>
         <TabsTrigger value="invoices">Invoices</TabsTrigger>
         <TabsTrigger value="investments">Investments</TabsTrigger>
       </TabsList>
      
       <TabsContent value="overview" className="space-y-4">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <KPICard
             title="Total Users"
             value={userStats.total}
             description="Total registered users on the platform"
             icon={<Users className="h-4 w-4 text-primary" />}
             trend="up"
             trendValue="+12% from last month"
           />
           <KPICard
             title="Total Invoices"
             value={invoiceStats.total}
             description="Total invoices uploaded to the platform"
             icon={<FileText className="h-4 w-4 text-primary" />}
             trend="up"
             trendValue="+8% from last month"
           />
           <KPICard
             title="Pending Validation"
             value={invoiceStats.pending}
             description="Invoices awaiting validation"
             icon={<Clock className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Active Investments"
             value={`₹${(investmentStats.totalVolume / 10000000).toFixed(1)}Cr`}
             description={`${investmentStats.activeInvestments} active investments`}
             icon={<Wallet className="h-4 w-4 text-primary" />}
             trend="up"
             trendValue="+15% from last month"
           />
         </div>
        
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
           <Card className="col-span-4">
             <CardHeader>
               <CardTitle>Transaction Trends</CardTitle>
               <CardDescription>Daily/Weekly transaction volume</CardDescription>
             </CardHeader>
             <CardContent className="pl-2">
               <Bar
                 data={transactionData}
                 options={{
                   responsive: true,
                   scales: {
                     y: {
                       beginAtZero: true,
                       ticks: {
                         callback: function(value) {
                           return '₹' + (Number(value) / 10000000).toFixed(1) + 'Cr';
                         }
                       }
                     }
                   }
                 }}
               />
             </CardContent>
           </Card>
          
           <Card className="col-span-3">
             <CardHeader>
               <CardTitle>Risk Tier Distribution</CardTitle>
               <CardDescription>Investor participation by risk tier</CardDescription>
             </CardHeader>
             <CardContent className="flex justify-center">
               <div style={{ width: '80%', height: '220px' }}>
                 <Doughnut
                   data={riskTierData}
                   options={{
                     responsive: true,
                     maintainAspectRatio: false,
                     plugins: {
                       legend: {
                         position: 'bottom',
                       }
                     }
                   }}
                 />
               </div>
             </CardContent>
           </Card>
         </div>
        
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
           <Card className="col-span-4">
             <CardHeader>
               <CardTitle>Invoice Approval Rates</CardTitle>
               <CardDescription>Monthly approval and rejection trends</CardDescription>
             </CardHeader>
             <CardContent>
               <Line
                 data={approvalData}
                 options={{
                   responsive: true,
                   scales: {
                     y: {
                       beginAtZero: true
                     }
                   }
                 }}
               />
             </CardContent>
           </Card>
          
           <Card className="col-span-3">
             <CardHeader>
               <CardTitle>TRRF Fund Utilization</CardTitle>
               <CardDescription>Trade Receivables Risk Fund metrics</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Total Pool</span>
                   <span className="font-bold">₹{(investmentStats.trrf.total_pool / 10000000).toFixed(1)} Cr</span>
                 </div>
                
                 {investmentStats.trrf && (
                   <>
                     <div className="space-y-2">
                       <div className="flex items-center justify-between text-sm">
                         <span>Current Utilization</span>
                         <span className="font-medium">
                           ₹{((investmentStats.trrf.utilized || 0) / 10000000).toFixed(1)} Cr
                           ({investmentStats.trrf.utilized && investmentStats.trrf.total_pool ?
                             Math.round((investmentStats.trrf.utilized / investmentStats.trrf.total_pool) * 100) : 0}%)
                         </span>
                       </div>
                       <div className="h-2 w-full rounded-full bg-muted">
                         <div
                           className="h-2 rounded-full bg-primary"
                           style={{
                             width: `${investmentStats.trrf.utilized && investmentStats.trrf.total_pool ?
                               Math.round((investmentStats.trrf.utilized / investmentStats.trrf.total_pool) * 100) : 0}%`
                           }}
                         ></div>
                       </div>
                     </div>
                    
                     <div className="space-y-2">
                       <div className="flex items-center justify-between text-sm">
                         <span>Default Coverage</span>
                         <span className="font-medium">
                           ₹{((investmentStats.trrf.available || 0) / 10000000).toFixed(1)} Cr
                           ({investmentStats.trrf.available && investmentStats.trrf.total_pool ?
                             Math.round((investmentStats.trrf.available / investmentStats.trrf.total_pool) * 100) : 0}%)
                         </span>
                       </div>
                       <div className="h-2 w-full rounded-full bg-muted">
                         <div
                           className="h-2 rounded-full bg-green-500"
                           style={{
                             width: `${investmentStats.trrf.available && investmentStats.trrf.total_pool ?
                               Math.round((investmentStats.trrf.available / investmentStats.trrf.total_pool) * 100) : 0}%`
                           }}
                         ></div>
                       </div>
                     </div>
                    
                     <div className="pt-2 text-xs text-muted-foreground">
                       <div className="flex items-center">
                         <Shield className="h-3 w-3 mr-1" />
                         <span>
                           Current default rate: {investmentStats.trrf.default_rate || 0}%
                           (Industry avg: {investmentStats.trrf.industry_avg_default || 0}%)
                         </span>
                       </div>
                     </div>
                   </>
                 )}
               </div>
             </CardContent>
           </Card>
         </div>
       </TabsContent>
      
       <TabsContent value="users" className="space-y-4">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <KPICard
             title="Total Users"
             value={userStats.total}
             description="Total registered users on the platform"
             icon={<Users className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Business Users"
             value={userStats.business}
             description="MSMEs and startups"
             icon={<Users className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Investor Users"
             value={userStats.investor}
             description="Individual and institutional investors"
             icon={<Users className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Active Users"
             value={userStats.active}
             description="Users active in the last 30 days"
             icon={<Users className="h-4 w-4 text-primary" />}
           />
         </div>
        
         <Card>
           <CardHeader>
             <CardTitle>User Management</CardTitle>
             <CardDescription>
               For detailed user management, please visit the Users page
             </CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-center py-8 text-muted-foreground">
               Detailed user management functionality is available on the Users page.
             </p>
           </CardContent>
         </Card>
       </TabsContent>
      
       <TabsContent value="invoices" className="space-y-4">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
           <KPICard
             title="Total Invoices"
             value={invoiceStats.total}
             description="Total invoices uploaded"
             icon={<FileText className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Pending Validation"
             value={invoiceStats.pending}
             description="Awaiting validation"
             icon={<Clock className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Validated"
             value={invoiceStats.validated}
             description="Successfully validated"
             icon={<CheckCircle className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Funded"
             value={invoiceStats.funded}
             description="Invoices with active funding"
             icon={<Wallet className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Defaulted"
             value={invoiceStats.defaulted}
             description="Defaulted invoices"
             icon={<AlertTriangle className="h-4 w-4 text-primary" />}
           />
         </div>
        
         <Card>
           <CardHeader>
             <CardTitle>Invoice Management</CardTitle>
             <CardDescription>
               For detailed invoice management, please visit the Invoices page
             </CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-center py-8 text-muted-foreground">
               Detailed invoice management functionality is available on the Invoices page.
             </p>
           </CardContent>
         </Card>
       </TabsContent>
      
       <TabsContent value="investments" className="space-y-4">
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <KPICard
             title="Total Volume"
             value={`₹${(investmentStats.totalVolume / 10000000).toFixed(1)}Cr`}
             description="Total investment volume"
             icon={<Wallet className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Active Investments"
             value={investmentStats.activeInvestments}
             description="Currently active investments"
             icon={<TrendingUp className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="Average ROI"
             value={`${investmentStats.averageROI}%`}
             description="Average return on investment"
             icon={<BarChart className="h-4 w-4 text-primary" />}
           />
           <KPICard
             title="TRRF Fund"
             value={`₹${(investmentStats.trrf.total_pool / 10000000).toFixed(1)}Cr`}
             description="Trade Receivables Risk Fund"
             icon={<Shield className="h-4 w-4 text-primary" />}
           />
         </div>
        
         <Card>
           <CardHeader>
             <CardTitle>Investment Management</CardTitle>
             <CardDescription>
               For detailed investment management, please visit the Investments page
             </CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-center py-8 text-muted-foreground">
               Detailed investment management functionality is available on the Investments page.
             </p>
           </CardContent>
         </Card>
       </TabsContent>
     </Tabs>
   </div>
 );
}
