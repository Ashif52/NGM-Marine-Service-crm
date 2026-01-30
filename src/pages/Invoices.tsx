import { useState, useEffect } from 'react';
import { Receipt, Plus, Filter, Download, CheckCircle2, Clock, XCircle, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { invoicesApi, shipsApi, InvoiceResponse, InvoiceCreate, InvoiceCategory, InvoiceStats } from '../services/api';

export function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [ships, setShips] = useState<Array<{id: string, name: string}>>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: '',
    ship_id: '',
    category: '' as InvoiceCategory | '',
    vendor_name: '',
    amount: '',
    currency: 'USD',
    due_date: '',
    description: '',
  });

  const isMaster = user?.role === 'master';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, shipsRes, statsRes] = await Promise.all([
        invoicesApi.getAll(),
        shipsApi.getAllShips(),
        invoicesApi.getStats()
      ]);
      
      if (invoicesRes.data) {
        setInvoices(invoicesRes.data);
      }
      if (shipsRes.data) {
        setShips(shipsRes.data.map(s => ({ id: s.id, name: s.name })));
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      toast.error('Failed to load invoices');
      console.error('Error loading invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'approved':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Submitted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'fuel': 'Fuel',
      'maintenance': 'Maintenance',
      'provisions': 'Provisions',
      'port_fees': 'Port Fees',
      'crew_wages': 'Crew Wages',
      'insurance': 'Insurance',
      'other': 'Other'
    };
    return labels[category] || category;
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.ship_id || !newInvoice.category || !newInvoice.amount || !newInvoice.vendor_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const data: InvoiceCreate = {
        ship_id: newInvoice.ship_id,
        invoice_number: newInvoice.invoice_number || undefined,
        vendor_name: newInvoice.vendor_name,
        category: newInvoice.category as InvoiceCategory,
        amount: parseFloat(newInvoice.amount),
        currency: newInvoice.currency,
        due_date: newInvoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: newInvoice.description,
      };

      const response = await invoicesApi.create(data);
      if (response.error) throw new Error(response.error);

      toast.success('Invoice created successfully');
      setIsCreateDialogOpen(false);
      setNewInvoice({
        invoice_number: '',
        ship_id: '',
        category: '',
        vendor_name: '',
        amount: '',
        currency: 'USD',
        due_date: '',
        description: '',
      });
      await loadData();
    } catch (err) {
      toast.error('Failed to create invoice');
      console.error('Error creating invoice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (invoiceId: string) => {
    try {
      const response = await invoicesApi.submit(invoiceId);
      if (response.error) throw new Error(response.error);
      toast.success('Invoice submitted for approval');
      await loadData();
    } catch (err) {
      toast.error('Failed to submit invoice');
    }
  };

  const handleApprove = async (invoiceId: string) => {
    try {
      const response = await invoicesApi.approve(invoiceId);
      if (response.error) throw new Error(response.error);
      toast.success('Invoice approved');
      await loadData();
    } catch (err) {
      toast.error('Failed to approve invoice');
    }
  };

  const handleReject = async (invoiceId: string) => {
    try {
      const response = await invoicesApi.reject(invoiceId);
      if (response.error) throw new Error(response.error);
      toast.success('Invoice rejected');
      await loadData();
    } catch (err) {
      toast.error('Failed to reject invoice');
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const response = await invoicesApi.markPaid(invoiceId);
      if (response.error) throw new Error(response.error);
      toast.success('Invoice marked as paid');
      await loadData();
    } catch (err) {
      toast.error('Failed to mark invoice as paid');
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">
            {isStaff ? 'Upload and manage invoices across all ships' : 'Review and approve invoices'}
          </p>
        </div>
        {(isStaff || isMaster) && (
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Invoice
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  ${((stats?.total_amount || 0) / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  ${((stats?.pending_amount || 0) / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  ${((stats?.paid_amount || 0) / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Approval</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{stats?.submitted_count || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invoices</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isMaster && invoices.filter(inv => inv.status === 'submitted').length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Pending Approval</h3>
              <div className="space-y-3">
                {invoices.filter(inv => inv.status === 'submitted').map((invoice) => (
                  <div key={invoice.id} className="border border-border rounded-lg p-4 bg-yellow-50/30">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{invoice.invoice_number}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {invoice.ship_name} • {invoice.vendor_name} • {getCategoryLabel(invoice.category)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(invoice.amount, invoice.currency)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Due: {formatDate(invoice.due_date)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground mb-3">{invoice.description}</p>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(invoice.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(invoice.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No invoices found. Click "Add Invoice" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Ship</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-sm">{invoice.ship_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(invoice.category)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.vendor_name}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      {invoice.status === 'draft' && (isStaff || isMaster) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSubmit(invoice.id)}
                        >
                          Submit
                        </Button>
                      )}
                      {invoice.status === 'approved' && (isStaff || isMaster) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkPaid(invoice.id)}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={newInvoice.invoice_number}
                  onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ship">Ship *</Label>
                <Select value={newInvoice.ship_id} onValueChange={(value) => setNewInvoice({ ...newInvoice, ship_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ship" />
                  </SelectTrigger>
                  <SelectContent>
                    {ships.map(ship => (
                      <SelectItem key={ship.id} value={ship.id}>{ship.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor Name *</Label>
              <Input
                id="vendor"
                value={newInvoice.vendor_name}
                onChange={(e) => setNewInvoice({ ...newInvoice, vendor_name: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={newInvoice.category} onValueChange={(value) => setNewInvoice({ ...newInvoice, category: value as InvoiceCategory })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="provisions">Provisions</SelectItem>
                  <SelectItem value="port_fees">Port Fees</SelectItem>
                  <SelectItem value="crew_wages">Crew Wages</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={newInvoice.currency} onValueChange={(value) => setNewInvoice({ ...newInvoice, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="SGD">SGD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newInvoice.due_date}
                onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newInvoice.description}
                onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                placeholder="Invoice description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-accent text-accent-foreground hover:bg-accent/90" 
              onClick={handleCreateInvoice}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
