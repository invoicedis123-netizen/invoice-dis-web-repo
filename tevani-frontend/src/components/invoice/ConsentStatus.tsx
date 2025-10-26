'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { legalbotAPI } from '../../lib/api';

interface ConsentStatusProps {
  invoiceId: string;
  onRefresh?: () => void;
}

export function ConsentStatus({ invoiceId, onRefresh }: ConsentStatusProps) {
  const [consentData, setConsentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConsentData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await legalbotAPI.getConsentByInvoice(invoiceId);
      setConsentData(data);
    } catch (err: any) {
      console.error('Error fetching consent data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch consent status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchConsentData();
    }
  }, [invoiceId]);

  const handleRefresh = () => {
    fetchConsentData();
    if (onRefresh) onRefresh();
  };

  const getStatusIcon = () => {
    if (!consentData) return <HelpCircle className="h-8 w-8 text-muted-foreground" />;

    switch (consentData.status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-amber-500" />;
      case 'acknowledged':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'disputed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      case 'expired':
        return <Clock className="h-8 w-8 text-gray-500" />;
      default:
        return <HelpCircle className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    if (!consentData) return 'No consent record found';

    switch (consentData.status) {
      case 'pending':
        return 'Pending buyer verification';
      case 'acknowledged':
        return 'Buyer has acknowledged the invoice';
      case 'disputed':
        return 'Buyer has disputed the invoice';
      case 'expired':
        return 'Consent window has expired';
      default:
        return 'Unknown status';
    }
  };

  const getStatusDescription = () => {
    if (!consentData) return 'No verification process has been initiated for this invoice.';

    switch (consentData.status) {
      case 'pending':
        return `Verification email sent to ${consentData.buyer_email}. Waiting for response.`;
      case 'acknowledged':
        return consentData.ledger_entry || 'Buyer has verified and acknowledged this invoice.';
      case 'disputed':
        return `Dispute reason: ${consentData.dispute_reason || 'No reason provided'}`;
      case 'expired':
        return 'The verification window has expired without a response.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading verification status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2">Buyer Verification Status</span>
        </CardTitle>
        <CardDescription>{getStatusText()}</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">{getStatusDescription()}</p>
            {consentData && (
              <div className="text-xs text-muted-foreground">
                <div>Verification initiated: {new Date(consentData.created_at).toLocaleString()}</div>
                <div>
                  Verification window: {new Date(consentData.consent_window_end).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ConsentStatus;

 
