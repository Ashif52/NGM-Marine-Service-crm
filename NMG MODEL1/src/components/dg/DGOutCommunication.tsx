import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Send, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { 
  dgCommunicationApi, 
  DGCommunicationResponse, 
  DGCommunicationCreate,
  DGCommunicationCategory,
  shipsApi
} from '../../services/api';

const statusColors: Record<string, string> = {
  'pending': 'bg-warning text-warning-foreground',
  'action_required': 'bg-destructive text-destructive-foreground',
  'in_progress': 'bg-blue-100 text-blue-700',
  'completed': 'bg-accent text-accent-foreground',
  'archived': 'bg-muted text-muted-foreground',
};

const categoryColors: Record<string, string> = {
  'training': 'bg-blue-100 text-blue-700 border-blue-200',
  'manning': 'bg-purple-100 text-purple-700 border-purple-200',
  'safety': 'bg-orange-100 text-orange-700 border-orange-200',
  'medical': 'bg-green-100 text-green-700 border-green-200',
  'dispute': 'bg-red-100 text-red-700 border-red-200',
  'certification': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'inspection': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'compliance': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'other': 'bg-gray-100 text-gray-700 border-gray-200',
};

const dgOffices = [
  'DG Mumbai',
  'DG Delhi',
  'DG Chennai',
  'DG Kolkata',
  'DG Kochi',
  'DG Kandla',
];

export function DGOutCommunication() {
  const [communications, setCommunications] = useState<DGCommunicationResponse[]>([]);
  const [ships, setShips] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComm, setSelectedComm] = useState<DGCommunicationResponse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newComm, setNewComm] = useState({
    subject: '',
    content: '',
    category: 'other' as DGCommunicationCategory,
    dg_office: 'DG Mumbai',
    ship_id: '',
    priority: 'normal',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [commsResponse, shipsResponse] = await Promise.all([
        dgCommunicationApi.getAll({ comm_type: 'outgoing' }),
        shipsApi.getAllShips()
      ]);
      
      if (commsResponse.data) {
        // Filter explicitly to ensure we only get outgoing communications
        const outgoingCommunications = commsResponse.data.filter(comm => comm.comm_type === 'outgoing');
        setCommunications(outgoingCommunications);
        console.log('Loaded outgoing communications:', outgoingCommunications.length);
      }
      if (shipsResponse.data) {
        setShips(shipsResponse.data.map(s => ({ id: s.id, name: s.name })));
      }
    } catch (err) {
      toast.error('Failed to load communications');
      console.error('Error loading communications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newComm.subject || !newComm.content) {
      toast.error('Please fill in subject and content');
      return;
    }

    try {
      setSubmitting(true);
      const data: DGCommunicationCreate = {
        comm_type: 'outgoing',
        subject: newComm.subject,
        content: newComm.content,
        category: newComm.category,
        dg_office: newComm.dg_office,
        ship_id: newComm.ship_id || undefined,
        priority: newComm.priority,
      };

      const response = await dgCommunicationApi.create(data);
      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Communication sent successfully');
      setIsAddDialogOpen(false);
      setNewComm({
        subject: '',
        content: '',
        category: 'other',
        dg_office: 'DG Mumbai',
        ship_id: '',
        priority: 'normal',
      });
      await loadData();
    } catch (err) {
      toast.error('Failed to create communication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async (commId: string) => {
    try {
      const response = await dgCommunicationApi.markCompleted(commId);
      if (response.error) {
        throw new Error(response.error);
      }

      toast.success('Marked as completed');
      await loadData();
      if (selectedComm?.id === commId) {
        setSelectedComm(response.data || null);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openComposerWithTemplate = (category: DGCommunicationCategory, subject: string) => {
    setNewComm({
      ...newComm,
      category,
      subject,
    });
    setIsAddDialogOpen(true);
  };

  const filteredComms = communications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.ref_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || comm.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Outbound Communications</h3>
          <p className="text-sm text-muted-foreground">
            Letters and communications sent to DG Shipping
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Plus className="w-4 h-4" />
              Create Letter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Outgoing Communication</DialogTitle>
              <DialogDescription>
                Draft a new letter to DG Shipping
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label>Subject *</Label>
                <Input 
                  placeholder="Communication subject" 
                  value={newComm.subject}
                  onChange={(e) => setNewComm({...newComm, subject: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Send To (DG Office)</Label>
                <Select value={newComm.dg_office} onValueChange={(v) => setNewComm({...newComm, dg_office: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dgOffices.map(office => (
                      <SelectItem key={office} value={office}>{office}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newComm.category} onValueChange={(v: DGCommunicationCategory) => setNewComm({...newComm, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="manning">Manning</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="dispute">Dispute</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Related Vessel (Optional)</Label>
                <Select value={newComm.ship_id || "none"} onValueChange={(v) => setNewComm({...newComm, ship_id: v === "none" ? "" : v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {ships.map(ship => (
                      <SelectItem key={ship.id} value={ship.id}>{ship.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newComm.priority} onValueChange={(v) => setNewComm({...newComm, priority: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Content *</Label>
                <Textarea 
                  placeholder="Letter content..." 
                  rows={8}
                  value={newComm.content}
                  onChange={(e) => setNewComm({...newComm, content: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Communication
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject or ref no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="manning">Manning</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Quick Templates:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => openComposerWithTemplate('certification', 'Pre-Joining Letter - ')}>
              Pre-Joining Letter
            </Button>
            <Button variant="outline" size="sm" onClick={() => openComposerWithTemplate('manning', 'Manning Request - ')}>
              Manning Request
            </Button>
            <Button variant="outline" size="sm" onClick={() => openComposerWithTemplate('dispute', 'Crew Dispute Resolution - ')}>
              Crew Dispute
            </Button>
            <Button variant="outline" size="sm" onClick={() => openComposerWithTemplate('safety', 'Incident Report - ')}>
              Incident Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => openComposerWithTemplate('medical', 'Medical Certification - ')}>
              Medical Certification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Communications Table */}
      <Card>
        <CardContent className="p-0">
          {filteredComms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No outgoing communications found. Click "Create Letter" to send one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref No.</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>To (DG Office)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComms.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell className="text-primary font-medium">{comm.ref_no}</TableCell>
                    <TableCell>{comm.subject}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(comm.created_at)}
                    </TableCell>
                    <TableCell>{comm.dg_office}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColors[comm.category] || ''}>
                        {comm.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[comm.status] || ''}>
                        {comm.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedComm(comm)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {comm.status !== 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-accent"
                            onClick={() => handleMarkCompleted(comm.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Communication Dialog */}
      <Dialog open={!!selectedComm} onOpenChange={() => setSelectedComm(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedComm && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedComm.subject}</DialogTitle>
                <DialogDescription>
                  {selectedComm.ref_no} • Sent on {formatDate(selectedComm.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-3 gap-6 py-4">
                {/* Left Panel - Metadata */}
                <div className="col-span-1 space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Sent To</Label>
                    <div className="text-foreground">{selectedComm.dg_office}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Category</Label>
                    <div>
                      <Badge variant="outline" className={categoryColors[selectedComm.category] || ''}>
                        {selectedComm.category}
                      </Badge>
                    </div>
                  </div>
                  {selectedComm.ship_name && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Related Vessel</Label>
                      <div className="text-foreground">{selectedComm.ship_name}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div>
                      <Badge className={statusColors[selectedComm.status] || ''}>
                        {selectedComm.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Priority</Label>
                    <div className="text-foreground capitalize">{selectedComm.priority}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Created By</Label>
                    <div className="text-foreground">{selectedComm.created_by_name}</div>
                  </div>
                </div>

                {/* Right Panel - Content */}
                <div className="col-span-2 space-y-4">
                  <div>
                    <Label>Letter Content</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg text-sm text-foreground whitespace-pre-wrap">
                      {selectedComm.content}
                    </div>
                  </div>

                  {selectedComm.response && (
                    <div>
                      <Label>Response Received</Label>
                      <div className="mt-2 p-4 bg-accent/10 rounded-lg text-sm text-foreground whitespace-pre-wrap">
                        {selectedComm.response}
                        {selectedComm.response_date && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Received on {formatDate(selectedComm.response_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedComm.status !== 'completed' && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline"
                        onClick={() => handleMarkCompleted(selectedComm.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
