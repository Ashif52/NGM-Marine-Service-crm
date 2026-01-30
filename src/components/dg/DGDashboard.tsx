import { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, AlertTriangle, Eye, Download, Loader2, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { dgCommunicationApi, DGCommunicationResponse, DGCommunicationStats } from '../../services/api';

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

const statusColors: Record<string, string> = {
  'pending': 'bg-warning text-warning-foreground',
  'action_required': 'bg-destructive text-destructive-foreground',
  'in_progress': 'bg-blue-100 text-blue-700',
  'completed': 'bg-accent text-accent-foreground',
  'archived': 'bg-muted text-muted-foreground',
};

const priorityColors: Record<string, string> = {
  'high': 'bg-destructive text-destructive-foreground',
  'normal': 'bg-warning text-warning-foreground',
  'low': 'bg-muted text-muted-foreground',
};

export function DGDashboard() {
  const [communications, setCommunications] = useState<DGCommunicationResponse[]>([]);
  const [stats, setStats] = useState<DGCommunicationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [commsResponse, statsResponse] = await Promise.all([
        dgCommunicationApi.getAll(),
        dgCommunicationApi.getStats()
      ]);
      
      if (commsResponse.data) {
        setCommunications(commsResponse.data);
      }
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      toast.error('Failed to load DG communications');
    } finally {
      setLoading(false);
    }
  };

  const recentComms = communications.slice(0, 5);
  const pendingComms = communications.filter(c => c.status === 'pending' || c.status === 'action_required');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Outgoing Communications</p>
                <div className="text-2xl font-semibold text-foreground">{stats?.outgoing || 0}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Incoming Communications</p>
                <div className="text-2xl font-semibold text-foreground">{stats?.incoming || 0}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Inbox className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Pending / Action Required</p>
                <div className="text-2xl font-semibold text-foreground">{(stats?.pending || 0) + (stats?.action_required || 0)}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <div className="text-2xl font-semibold text-foreground">{stats?.completed || 0}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Communications Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Communications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentComms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No communications yet. Create your first communication from the In-Communication or Out-Communication tabs.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref No.</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentComms.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell className="text-primary font-medium">
                      {comm.ref_no}
                    </TableCell>
                    <TableCell>{comm.subject}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(comm.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColors[comm.category] || ''}>
                        {comm.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={comm.comm_type === 'incoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                        {comm.comm_type === 'incoming' ? 'Incoming' : 'Outgoing'}
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
                          title="View"
                          onClick={() => window.location.href = `/dg-communication?view=${comm.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingComms.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending communications
              </div>
            ) : (
              <div className="space-y-4">
                {pendingComms.slice(0, 5).map((comm, index) => (
                  <div key={comm.id} className={`flex items-start gap-3 ${index < pendingComms.length - 1 ? 'pb-4 border-b border-border' : ''}`}>
                    <div className={`w-2 h-2 ${comm.status === 'action_required' ? 'bg-destructive' : 'bg-warning'} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <div className="text-foreground">{comm.subject}</div>
                      <div className="text-sm text-muted-foreground">{comm.dg_office} • {formatTimeAgo(comm.created_at)}</div>
                      <Badge className={`mt-2 ${statusColors[comm.status]}`}>
                        {comm.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {communications.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {communications.slice(0, 5).map((comm, index) => (
                  <div key={comm.id} className={`flex items-start gap-3 ${index < Math.min(communications.length, 5) - 1 ? 'pb-4 border-b border-border' : ''}`}>
                    <div className={`w-2 h-2 ${comm.comm_type === 'outgoing' ? 'bg-accent' : 'bg-primary'} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <div className="text-foreground">{comm.subject}</div>
                      <div className="text-sm text-muted-foreground">
                        {comm.comm_type === 'outgoing' ? 'Sent to' : 'Received from'} {comm.dg_office} • {formatTimeAgo(comm.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
