import { useState, useEffect } from 'react';
import { FileCheck, Plus, Eye, AlertTriangle, CheckCircle2, Clock, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
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
import { incidentsApi, shipsApi, IncidentResponse, IncidentCreate } from '../services/api';

interface Incident {
  id: string;
  type: 'incident' | 'accident' | 'near-miss';
  title: string;
  vesselId: string;
  vesselName: string;
  date: string;
  reportedBy: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  whatHappened: string;
  whyHappened: string;
  preventiveAction: string;
  location: string;
  witnesses: string;
  injuries: boolean;
  photos?: string[];
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'near-miss',
    title: 'Near collision during mooring operations',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    date: '2024-12-28',
    reportedBy: 'Third Officer Mike Chen',
    severity: 'high',
    status: 'investigating',
    whatHappened: 'During mooring operations at port, tug boat came dangerously close to bow thruster area',
    whyHappened: 'Miscommunication between pilot and tug master',
    preventiveAction: 'Implement standardized communication protocol with tugs',
    location: 'Port side forward',
    witnesses: 'Chief Officer, Deck Crew',
    injuries: false
  },
  {
    id: '2',
    type: 'incident',
    title: 'Oil spill during bunkering',
    vesselId: '2',
    vesselName: 'MT Pacific Wave',
    date: '2024-12-25',
    reportedBy: 'Chief Engineer',
    severity: 'medium',
    status: 'resolved',
    whatHappened: 'Approximately 5 liters of fuel oil spilled on deck during bunkering operation',
    whyHappened: 'Hose connection was not properly secured',
    preventiveAction: 'Double-check all connections before starting bunkering, retrain crew',
    location: 'Starboard bunker station',
    witnesses: 'Fourth Engineer, Oiler',
    injuries: false
  },
  {
    id: '3',
    type: 'accident',
    title: 'Crew member slipped on wet deck',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    date: '2024-12-20',
    reportedBy: 'Safety Officer',
    severity: 'low',
    status: 'closed',
    whatHappened: 'AB seaman slipped on wet deck during cleaning operations and sustained minor bruising',
    whyHappened: 'Non-slip mat was not deployed in work area',
    preventiveAction: 'Mandatory use of non-slip mats in wet areas, additional safety briefing',
    location: 'Main deck aft',
    witnesses: 'Bosun, AB crew',
    injuries: true
  },
  {
    id: '4',
    type: 'near-miss',
    title: 'Equipment failure during cargo operations',
    vesselId: '3',
    vesselName: 'MV Atlantic Trader',
    date: '2024-12-18',
    reportedBy: 'Cargo Officer',
    severity: 'critical',
    status: 'investigating',
    whatHappened: 'Cargo crane hydraulic system showed signs of failure while load was suspended',
    whyHappened: 'Missed preventive maintenance schedule',
    preventiveAction: 'Strict adherence to PMS, immediate inspection of all cranes',
    location: 'Cargo hold #3',
    witnesses: 'Chief Officer, Crane Operator',
    injuries: false
  }
];

export function Incidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [ships, setShips] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentResponse | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newIncident, setNewIncident] = useState({
    ship_id: '',
    title: '',
    description: '',
    incident_type: 'safety',
    severity: 'medium',
    location: '',
    date_time: new Date().toISOString().slice(0, 16),
    injuries: false,
    witnesses: ''
  });

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [incidentsRes, shipsRes] = await Promise.all([
          incidentsApi.getAll(),
          shipsApi.getAllShips()
        ]);
        
        if (incidentsRes.data) setIncidents(incidentsRes.data);
        if (shipsRes.data) setShips(shipsRes.data.map(s => ({ id: s.id, name: s.name })));
        
        // Set default ship for crew
        if (user?.ship_id) {
          setNewIncident(prev => ({ ...prev, ship_id: user.ship_id || '' }));
        }
      } catch (err) {
        toast.error('Failed to load incidents');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const isMaster = user?.role === 'master';
  const isCrew = user?.role === 'crew';

  // Filter incidents
  let filteredIncidents = isCrew 
    ? incidents.filter(i => i.ship_id === user?.ship_id)
    : incidents;

  if (filterType !== 'all') {
    filteredIncidents = filteredIncidents.filter(i => i.incident_type === filterType);
  }
  if (filterStatus !== 'all') {
    filteredIncidents = filteredIncidents.filter(i => i.status === filterStatus);
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
      case 'critical':
        return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return <Badge variant="outline">Reported</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Investigating</Badge>;
      case 'resolved':
        return <Badge className="bg-accent text-accent-foreground">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-muted">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'incident':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Incident</Badge>;
      case 'accident':
        return <Badge className="bg-destructive text-destructive-foreground">Accident</Badge>;
      case 'near-miss':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Near Miss</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleSubmitIncident = async () => {
    if (!newIncident.ship_id || !newIncident.title || !newIncident.description || !newIncident.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const incidentData: IncidentCreate = {
        ship_id: newIncident.ship_id,
        title: newIncident.title,
        description: newIncident.description,
        incident_type: newIncident.incident_type,
        severity: newIncident.severity,
        location: newIncident.location,
        date_time: newIncident.date_time,
        injuries: newIncident.injuries,
        witnesses: newIncident.witnesses || undefined
      };
      
      const response = await incidentsApi.create(incidentData);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refresh incidents list
      const incidentsRes = await incidentsApi.getAll();
      if (incidentsRes.data) setIncidents(incidentsRes.data);
      
      toast.success('Incident report submitted successfully');
      setIsAddIncidentOpen(false);
      setNewIncident({
        ship_id: user?.ship_id || '',
        title: '',
        description: '',
        incident_type: 'safety',
        severity: 'medium',
        location: '',
        date_time: new Date().toISOString().slice(0, 16),
        injuries: false,
        witnesses: ''
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit incident';
      toast.error(message);
    }
  };

  // Statistics
  const totalIncidents = filteredIncidents.length;
  const openCases = filteredIncidents.filter(i => i.status === 'investigating' || i.status === 'reported').length;
  const withInjuries = filteredIncidents.filter(i => i.injuries).length;
  const nearMisses = filteredIncidents.filter(i => i.incident_type === 'near_miss').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="w-8 h-8 text-white" />
          <h1 className="text-white text-2xl">Incident Reporting</h1>
        </div>
        <p className="text-white/80">
          Report and track incidents, accidents, and near-misses across the fleet
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-semibold mt-1">{totalIncidents}</p>
              </div>
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-semibold mt-1">{openCases}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Injuries</p>
                <p className="text-2xl font-semibold mt-1">{withInjuries}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Near Misses</p>
                <p className="text-2xl font-semibold mt-1">{nearMisses}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents Table */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Incident Reports</CardTitle>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="near-miss">Near Miss</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddIncidentOpen} onOpenChange={setIsAddIncidentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Report Incident
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Report Incident / Accident / Near Miss</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select value={newIncident.incident_type} onValueChange={(v) => setNewIncident({...newIncident, incident_type: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="near_miss">Near Miss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Severity *</Label>
                      <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({...newIncident, severity: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Incident Title *</Label>
                      <Input placeholder="Brief description" value={newIncident.title} onChange={(e) => setNewIncident({...newIncident, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Vessel *</Label>
                      <Select value={newIncident.ship_id} onValueChange={(v) => setNewIncident({...newIncident, ship_id: v})}>
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
                    <div className="space-y-2">
                      <Label>Date & Time *</Label>
                      <Input type="datetime-local" value={newIncident.date_time} onChange={(e) => setNewIncident({...newIncident, date_time: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Location Onboard *</Label>
                      <Input placeholder="e.g., Engine room, Bridge, Deck" value={newIncident.location} onChange={(e) => setNewIncident({...newIncident, location: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Witnesses</Label>
                      <Input placeholder="Names of witnesses" value={newIncident.witnesses} onChange={(e) => setNewIncident({...newIncident, witnesses: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Description *</Label>
                      <Textarea placeholder="Detailed description of what occurred" rows={4} value={newIncident.description} onChange={(e) => setNewIncident({...newIncident, description: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Any Injuries?</Label>
                      <Select value={newIncident.injuries ? 'yes' : 'no'} onValueChange={(v) => setNewIncident({...newIncident, injuries: v === 'yes'})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Photos / Evidence</Label>
                      <Input type="file" multiple accept="image/*" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddIncidentOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitIncident}>
                      Submit Report
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{getTypeBadge(incident.incident_type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{incident.title}</span>
                      {incident.injuries && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{incident.ship_name}</TableCell>
                  <TableCell>{new Date(incident.date_time).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm">{incident.reported_by_name}</TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedIncident && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">{selectedIncident.title}</DialogTitle>
                    <div className="flex gap-2">
                      {getTypeBadge(selectedIncident.type)}
                      {getSeverityBadge(selectedIncident.severity)}
                      {getStatusBadge(selectedIncident.status)}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Vessel</Label>
                    <p className="font-medium">{selectedIncident.vesselName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{new Date(selectedIncident.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="font-medium">{selectedIncident.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Reported By</Label>
                    <p className="font-medium">{selectedIncident.reportedBy}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Witnesses</Label>
                    <p className="font-medium">{selectedIncident.witnesses}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Injuries</Label>
                    <p className="font-medium">{selectedIncident.injuries ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">What Happened?</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedIncident.whatHappened}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Why It Happened?</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedIncident.whyHappened}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Preventive Action</Label>
                  <p className="mt-1 p-3 bg-accent/20 rounded-lg">{selectedIncident.preventiveAction}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedIncident(null)}>
                  Close
                </Button>
                {isMaster && (
                  <>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button>Update Status</Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
