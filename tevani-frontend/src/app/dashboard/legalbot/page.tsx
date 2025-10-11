'use client';


import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  Shield,
  ThumbsUp,
  X
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { legalbotAPI } from "../../../lib/api";


// Mock data for consents
const mockConsents = [
  {
    id: "consent-001",
    invoice_id: "inv-001",
    invoice_number: "INV-2025-001",
    amount: 125000,
    buyer_name: "Tech Solutions Ltd",
    buyer_email: "finance@techsolutions.com",
    status: "pending",
    created_at: "2025-10-01T10:30:00Z",
    updated_at: "2025-10-01T10:30:00Z",
    expiry_date: "2025-10-08T10:30:00Z",
    events: [
      {
        id: "event-001",
        event: "consent_created",
        details: "Consent request created",
        timestamp: "2025-10-01T10:30:00Z",
      },
      {
        id: "event-002",
        event: "notification_sent",
        details: "Email notification sent to buyer",
        timestamp: "2025-10-01T10:30:00Z",
      },
    ],
  },
  {
    id: "consent-002",
    invoice_id: "inv-002",
    invoice_number: "INV-2025-002",
    amount: 75000,
    buyer_name: "Global Innovations Inc",
    buyer_email: "accounts@globalinnovations.com",
    status: "approved",
    created_at: "2025-09-25T14:15:00Z",
    updated_at: "2025-09-26T09:45:00Z",
    expiry_date: "2025-10-02T14:15:00Z",
    events: [
      {
        id: "event-003",
        event: "consent_created",
        details: "Consent request created",
        timestamp: "2025-09-25T14:15:00Z",
      },
      {
        id: "event-004",
        event: "notification_sent",
        details: "Email notification sent to buyer",
        timestamp: "2025-09-25T14:15:00Z",
      },
      {
        id: "event-005",
        event: "consent_approved",
        details: "Buyer approved the consent",
        timestamp: "2025-09-26T09:45:00Z",
      },
    ],
  },
  {
    id: "consent-003",
    invoice_id: "inv-003",
    invoice_number: "INV-2025-003",
    amount: 250000,
    buyer_name: "Mega Corp Enterprises",
    buyer_email: "finance@megacorp.com",
    status: "passive_approved",
    created_at: "2025-10-05T11:20:00Z",
    updated_at: "2025-10-07T00:00:00Z",
    expiry_date: "2025-10-12T11:20:00Z",
    events: [
      {
        id: "event-006",
        event: "consent_created",
        details: "Consent request created",
        timestamp: "2025-10-05T11:20:00Z",
      },
      {
        id: "event-007",
        event: "notification_sent",
        details: "Email notification sent to buyer",
        timestamp: "2025-10-05T11:20:00Z",
      },
      {
        id: "event-008",
        event: "passive_consent_applied",
        details: "Passive consent applied after 48 hours",
        timestamp: "2025-10-07T11:20:00Z",
      },
    ],
  },
  {
    id: "consent-004",
    invoice_id: "inv-004",
    invoice_number: "INV-2025-004",
    amount: 45000,
    buyer_name: "Small Business Co",
    buyer_email: "accounts@smallbiz.com",
    status: "rejected",
    created_at: "2025-09-15T09:10:00Z",
    updated_at: "2025-09-16T16:30:00Z",
    expiry_date: "2025-09-22T09:10:00Z",
    events: [
      {
        id: "event-009",
        event: "consent_created",
        details: "Consent request created",
        timestamp: "2025-09-15T09:10:00Z",
      },
      {
        id: "event-010",
        event: "notification_sent",
        details: "Email notification sent to buyer",
        timestamp: "2025-09-15T09:10:00Z",
      },
      {
        id: "event-011",
        event: "consent_rejected",
        details: "Buyer rejected the consent",
        timestamp: "2025-09-16T16:30:00Z",
      },
    ],
  },
];


export default function LegalBotPage() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedConsent, setSelectedConsent] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);


  useEffect(() => {
    // In a real app, this would fetch consents from the API
    // For now, we'll use the mock data
    setTimeout(() => {
      setConsents(mockConsents);
      setLoading(false);
    }, 1000);
  }, []);


  const filteredConsents = consents.filter(consent => {
    if (activeTab === "all") return true;
    return consent.status === activeTab;
  });


  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConsent) return;
   
    setSendingMessage(true);
   
    try {
      // In a real app, this would send a message through the API
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
     
      // Update the selected consent with the new message
      const updatedConsent = {
        ...selectedConsent,
        events: [
          ...selectedConsent.events,
          {
            id: `event-${Date.now()}`,
            event: "message_sent",
            details: message,
            timestamp: new Date().toISOString(),
          },
        ],
      };
     
      // Update the consents list
      setConsents(consents.map(c => c.id === selectedConsent.id ? updatedConsent : c));
      setSelectedConsent(updatedConsent);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "passive_approved":
        return <ThumbsUp className="h-5 w-5 text-blue-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };


  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "passive_approved":
        return "Passively Approved";
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        return "Pending";
    }
  };


  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "passive_approved":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800";
    }
  };


  const getEventIcon = (event: string) => {
    switch (event) {
      case "consent_created":
        return <FileText className="h-4 w-4 text-gray-500" />;
      case "notification_sent":
        return <Send className="h-4 w-4 text-blue-500" />;
      case "consent_approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "passive_consent_applied":
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case "consent_rejected":
        return <X className="h-4 w-4 text-red-500" />;
      case "message_sent":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LegalBot</h1>
          <p className="text-muted-foreground">
            Manage buyer consents and communications
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Consent Requests</CardTitle>
              <CardDescription>
                Track and manage buyer consent status
              </CardDescription>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredConsents.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">No consents found</h3>
                  <p className="text-muted-foreground text-sm">
                    {activeTab !== "all"
                      ? `No ${activeTab} consents available`
                      : "Upload an invoice to create consent requests"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConsents.map((consent) => (
                    <div
                      key={consent.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedConsent?.id === consent.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedConsent(consent)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{consent.invoice_number}</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(consent.status)}`}>
                          {getStatusText(consent.status)}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">{consent.buyer_name}</div>
                      <div className="text-sm font-medium">{formatCurrency(consent.amount)}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Created {new Date(consent.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        <div className="lg:col-span-2">
          {selectedConsent ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(selectedConsent.status)}
                      <span>Consent for {selectedConsent.invoice_number}</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedConsent.buyer_name} - {formatCurrency(selectedConsent.amount)}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(selectedConsent.status)}`}>
                    {getStatusText(selectedConsent.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Buyer</Label>
                      <div>{selectedConsent.buyer_name}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <div>{selectedConsent.buyer_email}</div>
                    </div>
                  </div>
                 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Created</Label>
                      <div>{formatDate(selectedConsent.created_at)}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Updated</Label>
                      <div>{formatDate(selectedConsent.updated_at)}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Expiry</Label>
                      <div>{formatDate(selectedConsent.expiry_date)}</div>
                    </div>
                  </div>
                 
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Consent Timeline
                    </h3>
                    <div className="space-y-4">
                      {selectedConsent.events.map((event: any) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="mt-0.5">
                            {getEventIcon(event.event)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">
                                {event.event === "message_sent" ? "Message sent" : event.details}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {event.event === "message_sent" && (
                              <div className="mt-1 text-sm bg-primary/10 p-2 rounded-md">
                                {event.details}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="flex items-center gap-2 w-full">
                  <Input
                    placeholder="Type a message to the buyer..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={selectedConsent.status === "rejected"}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendingMessage || selectedConsent.status === "rejected"}
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-8 text-center">
              <div className="mb-4 p-4 rounded-full bg-primary/10">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">LegalBot Consent Manager</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Select a consent request from the list to view details and manage communications with buyers.
              </p>
              <Button asChild>
                <Link href="/dashboard/invoices/new">
                  Upload New Invoice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


// Made with Bob





