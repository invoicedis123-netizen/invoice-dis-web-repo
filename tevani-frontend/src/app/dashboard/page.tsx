'use client';


import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  FileText,
  Plus,
  Wallet
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { formatCurrency, formatDate, calculateDaysLeft, getStatusColor } from "../../lib/utils";


// Mock data for the dashboard
const mockInvoices = [
  {
    id: "inv-001",
    invoice_number: "INV-2025-001",
    amount: 125000,
    due_date: "2025-11-15",
    buyer_name: "Tech Solutions Ltd",
    status: "pending_validation",
  },
  {
    id: "inv-002",
    invoice_number: "INV-2025-002",
    amount: 75000,
    due_date: "2025-10-30",
    buyer_name: "Global Innovations Inc",
    status: "validated",
  },
  {
    id: "inv-003",
    invoice_number: "INV-2025-003",
    amount: 250000,
    due_date: "2025-12-05",
    buyer_name: "Mega Corp Enterprises",
    status: "funded",
  },
];


const mockStats = {
  totalInvoices: 12,
  totalAmount: 1450000,
  fundedAmount: 850000,
  pendingAmount: 600000,
  averageFundingTime: 3.5,
};


export default function DashboardPage() {
  const { user } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState(true); // This would come from user profile in a real app


  if (!isOnboarded) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] max-w-md mx-auto text-center">
        <div className="mb-6 p-4 rounded-full bg-primary/10">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Complete Your Onboarding</h1>
        <p className="text-muted-foreground mb-6">
          To start financing your invoices, please complete your business profile and verification.
        </p>
        <Button asChild>
          <Link href="/onboarding">
            Continue Onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" /> Upload Invoice
          </Link>
        </Button>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(250000)} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funded Amount</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.fundedAmount)}</div>
            <div className="flex items-center">
              <div className="w-full bg-muted rounded-full h-2 mr-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${(mockStats.fundedAmount / mockStats.totalAmount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round((mockStats.fundedAmount / mockStats.totalAmount) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Funding Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageFundingTime} days</div>
            <p className="text-xs text-muted-foreground">
              -0.5 days from last month
            </p>
          </CardContent>
        </Card>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Your recently uploaded invoices and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{invoice.buyer_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(invoice.amount)}</p>
                      <p className="text-xs text-muted-foreground">Due {formatDate(invoice.due_date)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/dashboard/invoices" className="flex items-center justify-center">
                View all invoices
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/dashboard/invoices/new">
                Upload New Invoice
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/dashboard/analytics">
                View Analytics
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/dashboard/company">
                Update Company Profile
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/dashboard/messages">
                Check Messages
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


 





