import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Calendar, Loader2 } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { dgCommunicationApi, DGCommunicationResponse } from '../../services/api';

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

export function DGComplianceTracker() {
  const [communications, setCommunications] = useState<DGCommunicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComm, setSelectedComm] = useState<DGCommunicationResponse | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await dgCommunicationApi.getAll();
      if (response.data) {
        setCommunications(response.data);
      }
    } catch (err) {
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (commId: string) => {
    try {
      const response = await dgCommunicationApi.markCompleted(commId);
      if (response.error) throw new Error(response.error);
      toast.success('Marked as completed');
      await loadData();
      if (selectedComm?.id === commId) {
        setSelectedComm(null);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredItems = communications.filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.ref_no.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  const stats = {
    total: communications.length,
    pending: communications.filter(c => c.status === 'pending').length,
    actionRequired: communications.filter(c => c.status === 'action_required').length,
    inProgress: communications.filter(c => c.status === 'in_progress').length,
    completed: communications.filter(c => c.status === 'completed').length,
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-semibold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Action Required</div>
            <div className="text-2xl font-semibold text-destructive">{stats.actionRequired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">In Progress</div>
            <div className="text-2xl font-semibold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-semibold text-accent">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject or ref no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="action_required">Action Required</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Table */}
      <Card>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No communications found. Add communications from the In-Communication or Out-Communication tabs.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref No.</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>DG Office</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-primary font-medium">{item.ref_no}</TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={item.comm_type === 'incoming' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}>
                        {item.comm_type === 'incoming' ? 'Incoming' : 'Outgoing'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColors[item.category] || ''}>
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{item.dg_office}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(item.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.status] || ''}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedComm(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {item.status !== 'completed' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-accent"
                            onClick={() => handleMarkCompleted(item.id)}
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
                  {selectedComm.ref_no} • {formatDate(selectedComm.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Reference Number</Label>
                    <div className="text-foreground">{selectedComm.ref_no}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Type</Label>
                    <div>
                      <Badge variant="outline" className={selectedComm.comm_type === 'incoming' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}>
                        {selectedComm.comm_type === 'incoming' ? 'Incoming' : 'Outgoing'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">DG Office</Label>
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
                  {selectedComm.crew_name && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Related Crew</Label>
                      <div className="text-foreground">{selectedComm.crew_name}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm text-muted-foreground">Priority</Label>
                    <div className="text-foreground capitalize">{selectedComm.priority}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <div>
                      <Badge className={statusColors[selectedComm.status] || ''}>
                        {selectedComm.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <Label>Content</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                    {selectedComm.content}
                  </div>
                </div>

                {/* Response */}
                {selectedComm.response && (
                  <div>
                    <Label>Response</Label>
                    <div className="mt-2 p-4 bg-accent/10 rounded-lg text-sm whitespace-pre-wrap">
                      {selectedComm.response}
                      {selectedComm.response_date && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Responded on {formatDate(selectedComm.response_date)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedComm.status !== 'completed' && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                      onClick={() => handleMarkCompleted(selectedComm.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
