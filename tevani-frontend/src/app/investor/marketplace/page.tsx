'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ArrowUpDown,
  ChevronDown,
  Filter,
  Loader2,
  Search,
  SlidersHorizontal,
  Star,
  StarOff
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { invoiceAPI } from "../../../lib/api";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("return_desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch invoices from the API
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // For investor users, we want to get all available invoices
        const data = await invoiceAPI.getInvoices({ status: "validated" });
        
        // Process the data to add marketplace-specific fields
        const processedData = data.map((invoice: any) => {
          // Calculate days to maturity
          const dueDate = new Date(invoice.due_date);
          const today = new Date();
          const daysToMaturity = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
          
          // Calculate return rate based on risk tier
          let returnRate = 12.0; // Base rate
          if (invoice.risk_tier === 'B') returnRate = 14.0;
          if (invoice.risk_tier === 'C') returnRate = 15.5;
          if (invoice.risk_tier === 'D') returnRate = 17.0;
          
          // Check if invoice is starred by this investor
          const starredInvoices = JSON.parse(localStorage.getItem('starredInvoices') || '[]');
          const starred = starredInvoices.includes(invoice.id);
          
          return {
            ...invoice,
            company_name: invoice.seller_name || "Unknown Company",
            industry: invoice.industry || "Miscellaneous",
            days_to_maturity: daysToMaturity,
            return_rate: returnRate,
            starred
          };
        });
        
        setInvoices(processedData);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        // Fallback to localStorage if API fails
        const storedInvoices = JSON.parse(localStorage.getItem('marketplaceInvoices') || '[]');
        setInvoices(storedInvoices);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);

  // Toggle star status
  const toggleStar = (id: string) => {
    // Update local state
    setInvoices(invoices.map(invoice =>
      invoice.id === id ? { ...invoice, starred: !invoice.starred } : invoice
    ));
    
    // Update localStorage
    const starredInvoices = JSON.parse(localStorage.getItem('starredInvoices') || '[]');
    const isStarred = starredInvoices.includes(id);
    
    if (isStarred) {
      // Remove from starred
      const updatedStarred = starredInvoices.filter((invoiceId: string) => invoiceId !== id);
      localStorage.setItem('starredInvoices', JSON.stringify(updatedStarred));
    } else {
      // Add to starred
      starredInvoices.push(id);
      localStorage.setItem('starredInvoices', JSON.stringify(starredInvoices));
    }
    
    // In a real app, you would also make an API call to update the starred status on the server
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.company_name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(invoice => {
      // Apply risk filter
      if (riskFilter === "all") return true;
      return invoice.risk_tier === riskFilter;
    })
    .filter(invoice => {
      // Apply industry filter
      if (industryFilter === "all") return true;
      return invoice.industry.toLowerCase() === industryFilter.toLowerCase();
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
        case "trust_desc":
          return b.trust_score - a.trust_score;
        default:
          return 0;
      }
    });

  // Get unique industries for filter
  const industries = Array.from(new Set(invoices.map(invoice => invoice.industry)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Marketplace</h1>
          <p className="text-muted-foreground">
            Browse and invest in verified invoices
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="return_desc">Highest Return</SelectItem>
                  <SelectItem value="return_asc">Lowest Return</SelectItem>
                  <SelectItem value="amount_desc">Highest Amount</SelectItem>
                  <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                  <SelectItem value="maturity_asc">Shortest Term</SelectItem>
                  <SelectItem value="maturity_desc">Longest Term</SelectItem>
                  <SelectItem value="trust_desc">Trust Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="risk-filter">Risk Tier</Label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger id="risk-filter">
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Tiers</SelectItem>
                    <SelectItem value="A">Tier A (Low Risk)</SelectItem>
                    <SelectItem value="B">Tier B (Medium Risk)</SelectItem>
                    <SelectItem value="C">Tier C (High Risk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="industry-filter">Industry</Label>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger id="industry-filter">
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-1">No invoices found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="overflow-hidden">
                  <div className="bg-muted p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.company_name}</p>
                    </div>
                    <button 
                      onClick={() => toggleStar(invoice.id)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      {invoice.starred ? (
                        <Star className="h-5 w-5 fill-current" />
                      ) : (
                        <Star className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="font-medium">{formatCurrency(invoice.available_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Return Rate</p>
                        <p className="font-medium text-green-600">{invoice.return_rate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Term</p>
                        <p className="font-medium">{invoice.days_to_maturity} days</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          invoice.risk_tier === 'A' ? 'bg-green-100 text-green-800' :
                          invoice.risk_tier === 'B' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.risk_tier}
                        </div>
                        <div>
                          <p className="text-xs">Trust Score</p>
                          <p className="text-sm font-medium">{invoice.trust_score}%</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-xs text-muted-foreground">Due Date</p>
                        <p>{formatDate(invoice.due_date)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {invoice.industry}
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/investor/marketplace/${invoice.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Made with Bob
