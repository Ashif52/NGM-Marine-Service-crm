import { useState, useEffect } from 'react';
import { FileCheck, Plus, Eye, Download, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { auditsApi, shipsApi, AuditResponse, AuditCreate } from '../services/api';

interface Audit {
  id: string;
  type: 'internal' | 'external' | 'management-review';
  title: string;
  vesselId: string;
  vesselName: string;
  auditor: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  findings: number;
  nonConformities: number;
  observations: number;
  correctiveActions: number;
  score?: number;
}

interface Finding {
  id: string;
  auditId: string;
  type: 'non-conformity' | 'observation' | 'positive';
  category: string;
  description: string;
  correctiveAction: string;
  responsiblePerson: string;
  targetDate: string;
  status: 'open' | 'in-progress' | 'closed';
}

const mockAudits: Audit[] = [
  {
    id: '1',
    type: 'internal',
    title: 'ISM Code Internal Audit',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    auditor: 'Captain John Smith (DPA)',
    date: '2024-12-15',
    status: 'completed',
    findings: 12,
    nonConformities: 3,
    observations: 9,
    correctiveActions: 3,
    score: 87
  },
  {
    id: '2',
    type: 'external',
    title: 'Flag State Inspection',
    vesselId: '2',
    vesselName: 'MT Pacific Wave',
    auditor: 'Panama Maritime Authority',
    date: '2025-01-10',
    status: 'scheduled',
    findings: 0,
    nonConformities: 0,
    observations: 0,
    correctiveActions: 0
  },
  {
    id: '3',
    type: 'management-review',
    title: 'Q4 2024 Management Review',
    vesselId: 'all',
    vesselName: 'All Vessels',
    auditor: 'Senior Management',
    date: '2024-12-28',
    status: 'in-progress',
    findings: 8,
    nonConformities: 2,
    observations: 6,
    correctiveActions: 2,
    score: 92
  },
  {
    id: '4',
    type: 'internal',
    title: 'SOLAS Compliance Audit',
    vesselId: '3',
    vesselName: 'MV Atlantic Trader',
    auditor: 'Chief Officer Mike Chen',
    date: '2024-11-20',
    status: 'completed',
    findings: 15,
    nonConformities: 5,
    observations: 10,
    correctiveActions: 4,
    score: 78
  },
  {
    id: '5',
    type: 'external',
    title: 'Port State Control Inspection',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    auditor: 'Singapore MPA',
    date: '2024-10-15',
    status: 'overdue',
    findings: 3,
    nonConformities: 1,
    observations: 2,
    correctiveActions: 1,
    score: 95
  }
];

const mockFindings: Finding[] = [
  {
    id: '1',
    auditId: '1',
    type: 'non-conformity',
    category: 'Safety Equipment',
    description: 'Fire extinguisher in engine room expired - last inspection date exceeded',
    correctiveAction: 'Replace fire extinguisher and establish monthly inspection checklist',
    responsiblePerson: 'Chief Engineer',
    targetDate: '2025-01-05',
    status: 'in-progress'
  },
  {
    id: '2',
    auditId: '1',
    type: 'observation',
    category: 'Documentation',
    description: 'Oil record book entries could be more detailed',
    correctiveAction: 'Provide training to officers on proper ORB entries',
    responsiblePerson: 'Chief Officer',
    targetDate: '2025-01-15',
    status: 'open'
  },
  {
    id: '3',
    auditId: '4',
    type: 'non-conformity',
    category: 'Life-saving Appliances',
    description: 'Lifeboat davit requires maintenance - hydraulic leak detected',
    correctiveAction: 'Schedule immediate repair, order spare seals',
    responsiblePerson: 'Bosun',
    targetDate: '2024-12-30',
    status: 'closed'
  }
];

export function Audits() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<AuditResponse[]>([]);
  const [ships, setShips] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [findings] = useState<Finding[]>(mockFindings);
  const [isAddAuditOpen, setIsAddAuditOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditResponse | null>(null);
  const [newAudit, setNewAudit] = useState({
    ship_id: '',
    audit_type: 'internal',
    title: '',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    auditor: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [auditsRes, shipsRes] = await Promise.all([
          auditsApi.getAll(),
          shipsApi.getAllShips()
        ]);
        if (auditsRes.data) setAudits(auditsRes.data);
        if (shipsRes.data) setShips(shipsRes.data.map(s => ({ id: s.id, name: s.name })));
        if (user?.ship_id) setNewAudit(prev => ({ ...prev, ship_id: user.ship_id || '' }));
      } catch (err) {
        toast.error('Failed to load audits');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const isMaster = user?.role === 'master';
  const isStaff = user?.role === 'staff';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-accent text-accent-foreground">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-destructive text-destructive-foreground">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'internal':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Internal</Badge>;
      case 'external':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">External</Badge>;
      case 'management-review':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Management Review</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getFindingBadge = (type: string) => {
    switch (type) {
      case 'non-conformity':
        return <Badge className="bg-destructive text-destructive-foreground">Non-Conformity</Badge>;
      case 'observation':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Observation</Badge>;
      case 'positive':
        return <Badge className="bg-accent text-accent-foreground">Positive</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleScheduleAudit = async () => {
    if (!newAudit.ship_id || !newAudit.title || !newAudit.scheduled_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const auditData: AuditCreate = {
        ship_id: newAudit.ship_id,
        audit_type: newAudit.audit_type,
        title: newAudit.title,
        description: newAudit.description || undefined,
        scheduled_date: newAudit.scheduled_date,
        auditor: newAudit.auditor || undefined
      };
      
      const response = await auditsApi.create(auditData);
      if (response.error) throw new Error(response.error);
      
      const auditsRes = await auditsApi.getAll();
      if (auditsRes.data) setAudits(auditsRes.data);
      
      toast.success('Audit scheduled successfully');
      setIsAddAuditOpen(false);
      setNewAudit({
        ship_id: user?.ship_id || '',
        audit_type: 'internal',
        title: '',
        description: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        auditor: ''
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule audit');
    }
  };

  const auditFindings = selectedAudit ? findings.filter(f => f.auditId === selectedAudit.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#02283F] p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="w-8 h-8 text-white" />
          <h1 className="text-white text-2xl">Audits & Reviews</h1>
        </div>
        <p className="text-white/80">
          Internal audits, external inspections, and management reviews
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Audits</p>
                <p className="text-2xl font-semibold mt-1">{audits.length}</p>
              </div>
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">
                  {audits.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold mt-1">
                  {audits.filter(a => a.status === 'in-progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Non-Conformities</p>
                <p className="text-2xl font-semibold mt-1">
                  {audits.reduce((sum, a) => sum + a.nonConformities, 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audits Table */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Schedule</CardTitle>
            {(isMaster || isStaff) && (
              <Dialog open={isAddAuditOpen} onOpenChange={setIsAddAuditOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Audit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Audit</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Audit Type</Label>
                      <Select value={newAudit.audit_type} onValueChange={(v) => setNewAudit({...newAudit, audit_type: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">Internal Audit</SelectItem>
                          <SelectItem value="external">External Audit</SelectItem>
                          <SelectItem value="flag_state">Flag State</SelectItem>
                          <SelectItem value="class">Class</SelectItem>
                          <SelectItem value="psc">PSC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vessel *</Label>
                      <Select value={newAudit.ship_id} onValueChange={(v) => setNewAudit({...newAudit, ship_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vessel" />
                        </SelectTrigger>
                        <SelectContent>
                          {ships.map(ship => (
                            <SelectItem key={ship.id} value={ship.id}>{ship.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Audit Title *</Label>
                      <Input placeholder="e.g., ISM Code Internal Audit" value={newAudit.title} onChange={(e) => setNewAudit({...newAudit, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Auditor</Label>
                      <Input placeholder="Name of auditor" value={newAudit.auditor} onChange={(e) => setNewAudit({...newAudit, auditor: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Scheduled Date *</Label>
                      <Input type="date" value={newAudit.scheduled_date} onChange={(e) => setNewAudit({...newAudit, scheduled_date: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Scope & Objectives</Label>
                      <Textarea placeholder="Audit scope and objectives" rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddAuditOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleAudit}>
                      Schedule Audit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>{getTypeBadge(audit.audit_type)}</TableCell>
                  <TableCell className="font-medium">{audit.title}</TableCell>
                  <TableCell className="text-sm">{audit.ship_name}</TableCell>
                  <TableCell className="text-sm">{audit.auditor || '-'}</TableCell>
                  <TableCell>{audit.scheduled_date ? new Date(audit.scheduled_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {audit.findings && (
                        <Badge variant="outline" className="text-xs">
                          Findings
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{getStatusBadge(audit.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setSelectedAudit(audit)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {audit.status === 'completed' && (
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Detail Dialog */}
      <Dialog open={!!selectedAudit} onOpenChange={() => setSelectedAudit(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedAudit && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">{selectedAudit.title}</DialogTitle>
                    <div className="flex gap-2 mb-4">
                      {getTypeBadge(selectedAudit.audit_type)}
                      {getStatusBadge(selectedAudit.status)}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Vessel</Label>
                    <p className="font-medium">{selectedAudit.ship_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{selectedAudit.scheduled_date ? new Date(selectedAudit.scheduled_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Auditor</Label>
                    <p className="font-medium">{selectedAudit.auditor || '-'}</p>
                  </div>
                </div>

                {selectedAudit.description && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium">{selectedAudit.description}</p>
                  </div>
                )}

                {selectedAudit.findings && (
                  <div>
                    <Label className="text-muted-foreground">Findings</Label>
                    <p className="font-medium">{selectedAudit.findings}</p>
                  </div>
                )}

                {selectedAudit.recommendations && (
                  <div>
                    <Label className="text-muted-foreground">Recommendations</Label>
                    <p className="font-medium">{selectedAudit.recommendations}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Findings & Corrective Actions</h3>
                  {auditFindings.length > 0 ? (
                    <div className="space-y-3">
                      {auditFindings.map(finding => (
                        <Card key={finding.id} className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getFindingBadge(finding.type)}
                                <Badge variant="outline">{finding.category}</Badge>
                              </div>
                              <Badge variant="outline" className={
                                finding.status === 'closed' ? 'bg-green-50 text-green-700 border-green-200' :
                                finding.status === 'in-progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-muted'
                              }>
                                {finding.status}
                              </Badge>
                            </div>
                            <p className="font-medium mb-2">{finding.description}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p><strong>Corrective Action:</strong> {finding.correctiveAction}</p>
                              <p><strong>Responsible:</strong> {finding.responsiblePerson} | <strong>Target Date:</strong> {new Date(finding.targetDate).toLocaleDateString()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No findings recorded</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAudit(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
