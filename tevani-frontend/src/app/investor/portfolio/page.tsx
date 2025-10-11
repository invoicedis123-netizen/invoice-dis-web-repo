'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ArrowUpDown,
  BadgeDollarSign,
  Calendar,
  ChevronDown,
  Clock,
  Filter,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Separator } from "../../../components/ui/separator";
import { formatCurrency, formatDate } from "../../../lib/utils";

// Mock data for portfolio investments
const mockInvestments = [
  {
    id: "inv-001",
    invoice_number: "INV-2025-001",
    amount: 25000,
    investment_date: "2025-10-05",
    due_date: "2025-11-05",
    company_name: "Tech Solutions Ltd",
    industry: "Technology",
    risk_tier: "A",
    return_rate: 12.5,
    days_to_maturity: 25,
    status: "active",
    expected_return: 25000 * 0.125 * (30 / 365),
  },
  {
    id: "inv-003",
    invoice_number: "INV-2025-003",
    amount: 40000,
    investment_date: "2025-10-01",
    due_date: "2025-10-31",
    company_name: "Green Energy Co",
    industry: "Renewable Energy",
    risk_tier: "B",
    return_rate: 14.2,
    days_to_maturity: 20,
    status: "active",
    expected_return: 40000 * 0.142 * (30 / 365),
  },
];

export default function PortfolioPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  useEffect(() => {
    // In a real app, this would fetch investments from the API
    // For now, we'll use the mock data
    setTimeout(() => {
      setInvestments(mockInvestments);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate portfolio stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expected_return, 0);
  const activeInvestments = investments.filter(inv => inv.status === "active").length;

  // Filter and sort investments
  const filteredInvestments = investments
    .filter(investment => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          investment.invoice_number.toLowerCase().includes(searchLower) ||
          investment.company_name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(investment => {
      // Apply status filter
      if (statusFilter === "all") return true;
      return investment.status === statusFilter;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "amount_asc":
          return a.amount - b.amount;
        case "amount_desc":
          return b.amount - a.amount;
        case "return_asc":
          return a.return_rate - b.return_rate;
        case "return_desc":
          return b.return_rate - a.return_rate;
        case "maturity_asc":
          return a.days_to_maturity - b.days_to_maturity;
        case "maturity_desc":
          return b.days_to_maturity - a.days_to_maturity;
        case "date_asc":
          return new Date(a.investment_date).getTime() - new Date(b.investment_date).getTime();
        case "date_desc":
          return new Date(b.investment_date).getTime() - new Date(a.investment_date).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investment Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your invoice investments
          </p>
        </div>
        <Button asChild>
          <Link href="/investor/marketplace">
            <BadgeDollarSign className="mr-2 h-4 w-4" />
            Explore Opportunities
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {activeInvestments} active investments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expected Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalExpectedReturn)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(totalExpectedReturn / totalInvested * 100).toFixed(2)}% on invested capital
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Return Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {investments.length > 0 
                ? (investments.reduce((sum, inv) => sum + inv.return_rate, 0) / investments.length).toFixed(2) 
                : "0.00"}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Annualized return rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="matured">Matured</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Most Recent</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                  <SelectItem value="amount_desc">Highest Amount</SelectItem>
                  <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                  <SelectItem value="return_desc">Highest Return</SelectItem>
                  <SelectItem value="maturity_asc">Closest to Maturity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <BadgeDollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-1">No investments found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "Start investing in invoices to build your portfolio"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/investor/marketplace">
                    Browse Marketplace
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvestments.map((investment) => (
                <Card key={investment.id} className="overflow-hidden">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium">{investment.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">{investment.company_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          investment.risk_tier === 'A' ? 'bg-green-100 text-green-800' :
                          investment.risk_tier === 'B' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {investment.risk_tier}
                        </div>
                        <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {investment.industry}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Invested</p>
                          <p className="font-medium">{formatCurrency(investment.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expected Return</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(investment.expected_return)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs">
                          Invested on {formatDate(investment.investment_date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {investment.days_to_maturity} days to maturity
                          </p>
                        </div>
                        <p className="text-xs">
                          Due date: {formatDate(investment.due_date)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild className="mt-2">
                        <Link href={`/investor/portfolio/${investment.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Showing {filteredInvestments.length} of {investments.length} investments
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Made with Bob
