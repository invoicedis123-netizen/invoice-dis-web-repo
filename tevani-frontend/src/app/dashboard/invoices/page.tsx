'use client';


import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ArrowUpDown,
  Download,
  Eye,
  FileText,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { formatCurrency, formatDate, calculateDaysLeft, getStatusColor } from "../../../lib/utils";
import { invoiceAPI } from "../../../lib/api";


export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
    // Fetch invoices from the API
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const data = await invoiceAPI.getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        // Fallback to localStorage if API fails
        const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        setInvoices(storedInvoices);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);


  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.buyer_name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(invoice => {
      // Apply status filter
      if (statusFilter === "all") return true;
      return invoice.status === statusFilter;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "date_asc":
          return new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
        case "date_desc":
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
        case "amount_asc":
          return a.amount - b.amount;
        case "amount_desc":
          return b.amount - a.amount;
        case "due_date_asc":
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case "due_date_desc":
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        default:
          return 0;
      }
    });


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoice financing
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" /> Upload Invoice
          </Link>
        </Button>
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
                  <SelectItem value="date_desc">Newest First</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                  <SelectItem value="amount_desc">Highest Amount</SelectItem>
                  <SelectItem value="amount_asc">Lowest Amount</SelectItem>
                  <SelectItem value="due_date_asc">Due Date (Earliest)</SelectItem>
                  <SelectItem value="due_date_desc">Due Date (Latest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {showFilters && (
            <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_validation">Pending Validation</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="funded">Funded</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-1">No invoices found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first invoice to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/dashboard/invoices/new">
                    <Plus className="mr-2 h-4 w-4" /> Upload Invoice
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Buyer</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Risk</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{invoice.invoice_number}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(invoice.invoice_date)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{invoice.buyer_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{formatDate(invoice.due_date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {calculateDaysLeft(invoice.due_date) > 0
                            ? `${calculateDaysLeft(invoice.due_date)} days left`
                            : "Overdue"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {invoice.risk_tier}
                          </div>
                          <div className="text-xs">
                            <div>Trust Score</div>
                            <div className="font-medium">{invoice.trust_score}%</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/invoices/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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


 





