'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  LineChart,
  Plus,
  Star,
  TrendingUp,
  Wallet
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { formatCurrency } from "../../lib/utils";

// Mock data for the investor dashboard
const mockStats = {
  totalInvested: 2500000,
  availableFunds: 1500000,
  activeInvestments: 8,
  averageReturn: 12.5,
  totalEarnings: 325000,
};

const mockInvestments = [
  {
    id: "inv-001",
    invoice_number: "INV-2025-001",
    amount: 125000,
    due_date: "2025-11-15",
    company_name: "Tech Solutions Ltd",
    status: "active",
    return_rate: 13.2,
    days_remaining: 36,
  },
  {
    id: "inv-002",
    invoice_number: "INV-2025-002",
    amount: 75000,
    due_date: "2025-10-30",
    company_name: "Global Innovations Inc",
    status: "active",
    return_rate: 12.8,
    days_remaining: 20,
  },
  {
    id: "inv-003",
    invoice_number: "INV-2025-003",
    amount: 250000,
    due_date: "2025-12-05",
    company_name: "Mega Corp Enterprises",
    status: "active",
    return_rate: 14.5,
    days_remaining: 56,
  },
];

const mockRecommendations = [
  {
    id: "rec-001",
    invoice_number: "INV-2025-004",
    amount: 180000,
    company_name: "Innovative Startups Ltd",
    risk_tier: "A",
    return_rate: 13.8,
    match_score: 95,
  },
  {
    id: "rec-002",
    invoice_number: "INV-2025-005",
    amount: 95000,
    company_name: "Digital Solutions Co",
    risk_tier: "B",
    return_rate: 14.2,
    match_score: 92,
  },
];

export default function InvestorDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "Investor"}
          </p>
        </div>
        <Button asChild>
          <Link href="/investor/marketplace">
            <Plus className="mr-2 h-4 w-4" /> Explore Marketplace
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(250000)} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Funds</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.availableFunds)}</div>
            <p className="text-xs text-muted-foreground">
              Ready to invest
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground">
              Across {mockStats.activeInvestments} invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Return Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageReturn}%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatCurrency(42000)} this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Active Investments</CardTitle>
            <CardDescription>
              Your current investment portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInvestments.map((investment) => (
                <div key={investment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{investment.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{investment.company_name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(investment.amount)}</p>
                      <p className="text-xs text-green-600">{investment.return_rate}% return</p>
                    </div>
                    <div className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {investment.days_remaining} days left
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/investor/investments" className="flex items-center justify-center">
                View all investments
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recommended Invoices</CardTitle>
            <CardDescription>
              Personalized investment opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecommendations.map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{rec.invoice_number}</h4>
                      <p className="text-sm text-muted-foreground">{rec.company_name}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      <span>{rec.match_score}%</span>
                      <span>match</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(rec.amount)}</span>
                    <span className="font-medium text-green-600">{rec.return_rate}% return</span>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      <span>Risk Tier {rec.risk_tier}</span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/investor/marketplace/${rec.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link href="/investor/marketplace" className="flex items-center justify-center">
                Explore marketplace
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Made with Bob
