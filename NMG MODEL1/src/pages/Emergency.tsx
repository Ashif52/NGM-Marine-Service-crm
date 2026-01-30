import { useState } from 'react';
import { AlertTriangle, Flame, Waves, Anchor, User, LifeBuoy, Plus, Calendar, Users, Download, Eye, CheckCircle2 } from 'lucide-react';
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

interface EmergencyType {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  keyProcedures: string[];
}

interface Drill {
  id: string;
  type: string;
  date: string;
  vesselId: string;
  vesselName: string;
  participants: number;
  duration: string;
  status: 'completed' | 'scheduled' | 'overdue';
  conductedBy: string;
  reportUrl?: string;
  observations: string;
}

const emergencyTypes: EmergencyType[] = [
  {
    id: 'fire',
    name: 'Fire',
    icon: Flame,
    color: 'bg-red-500',
    description: 'Fire fighting and containment procedures',
    keyProcedures: [
      'Sound general alarm',
      'Muster at emergency stations',
      'Isolate fuel and oxygen sources',
      'Deploy fire fighting equipment',
      'Evacuate affected areas',
      'Account for all personnel'
    ]
  },
  {
    id: 'collision',
    name: 'Collision',
    icon: AlertTriangle,
    color: 'bg-orange-500',
    description: 'Collision response and damage control',
    keyProcedures: [
      'Sound general alarm',
      'Assess damage extent',
      'Check for hull breaches',
      'Deploy damage control teams',
      'Monitor stability',
      'Report to authorities'
    ]
  },
  {
    id: 'grounding',
    name: 'Grounding',
    icon: Anchor,
    color: 'bg-yellow-600',
    description: 'Grounding response and refloating procedures',
    keyProcedures: [
      'Stop engines immediately',
      'Assess vessel condition',
      'Sound tanks for damage',
      'Calculate refloating options',
      'Contact port/coastal authorities',
      'Engage salvage if necessary'
    ]
  },
  {
    id: 'oil-spill',
    name: 'Oil Spill',
    icon: Waves,
    color: 'bg-blue-600',
    description: 'Oil spill containment and reporting',
    keyProcedures: [
      'Stop the source of spillage',
      'Deploy oil containment equipment',
      'Notify coastal authorities',
      'Document spill extent',
      'Deploy cleanup measures',
      'Complete SOPEP procedures'
    ]
  },
  {
    id: 'man-overboard',
    name: 'Man Overboard',
    icon: User,
    color: 'bg-purple-500',
    description: 'Man overboard rescue procedures',
    keyProcedures: [
      'Shout "Man Overboard!"',
      'Release lifebuoy with smoke signal',
      'Mark position on GPS',
      'Execute Williamson turn',
      'Launch rescue boat',
      'Maintain visual contact'
    ]
  },
  {
    id: 'abandon-ship',
    name: 'Abandon Ship',
    icon: LifeBuoy,
    color: 'bg-red-700',
    description: 'Vessel abandonment procedures',
    keyProcedures: [
      'Sound abandon ship signal (7 short + 1 long)',
      'Don life jackets',
      'Muster at lifeboat stations',
      'Launch survival craft',
      'Account for all personnel',
      'Activate EPIRB and send distress'
    ]
  }
];

const mockDrills: Drill[] = [
  {
    id: '1',
    type: 'fire',
    date: '2024-12-20',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    participants: 28,
    duration: '45 min',
    status: 'completed',
    conductedBy: 'Chief Officer John Smith',
    reportUrl: '#',
    observations: 'All crew performed well. Response time was 3 minutes.'
  },
  {
    id: '2',
    type: 'man-overboard',
    date: '2025-01-05',
    vesselId: '2',
    vesselName: 'MT Pacific Wave',
    participants: 0,
    duration: '30 min',
    status: 'scheduled',
    conductedBy: 'Master',
    observations: ''
  },
  {
    id: '3',
    type: 'abandon-ship',
    date: '2024-11-15',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    participants: 28,
    duration: '60 min',
    status: 'completed',
    conductedBy: 'Master Captain Lee',
    reportUrl: '#',
    observations: 'Lifeboat lowering mechanism needs lubrication.'
  },
  {
    id: '4',
    type: 'oil-spill',
    date: '2024-12-01',
    vesselId: '3',
    vesselName: 'MV Atlantic Trader',
    participants: 0,
    duration: '40 min',
    status: 'overdue',
    conductedBy: 'Chief Engineer',
    observations: ''
  }
];

export function Emergency() {
  const { user } = useAuth();
  const [drills, setDrills] = useState<Drill[]>(mockDrills);
  const [isAddDrillOpen, setIsAddDrillOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);

  const isMaster = user?.role === 'master';
  const isCrew = user?.role === 'crew';

  // Filter drills by ship if crew
  const filteredDrills = isCrew 
    ? drills.filter(d => d.vesselId === user?.ship_id)
    : drills;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-accent text-accent-foreground">Completed</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Scheduled</Badge>;
      case 'overdue':
        return <Badge className="bg-destructive text-destructive-foreground">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleScheduleDrill = () => {
    toast.success('Emergency drill scheduled successfully');
    setIsAddDrillOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-white" />
          <h1 className="text-white text-2xl">Emergency Preparedness</h1>
        </div>
        <p className="text-white/80">
          Emergency procedures, drills, and response protocols
        </p>
      </div>

      {/* Emergency Types Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Emergency Procedures</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.id} 
                className="shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedType(type)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="mt-3">{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Procedures
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Drill Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Drills</p>
                <p className="text-2xl font-semibold mt-1">24</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">18</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-semibold mt-1">4</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-semibold mt-1">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drills Table */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Emergency Drills</CardTitle>
            {(isMaster || user?.role === 'staff') && (
              <Dialog open={isAddDrillOpen} onOpenChange={setIsAddDrillOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Drill
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule Emergency Drill</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Drill Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {emergencyTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vessel</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vessel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">MV Ocean Star</SelectItem>
                          <SelectItem value="2">MT Pacific Wave</SelectItem>
                          <SelectItem value="3">MV Atlantic Trader</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input type="number" placeholder="30" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Conducted By</Label>
                      <Input placeholder="Master / Chief Officer" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Objectives</Label>
                      <Textarea placeholder="Drill objectives and focus areas" rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDrillOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleDrill}>
                      Schedule Drill
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
                <TableHead>Vessel</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Conducted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrills.map((drill) => {
                const type = emergencyTypes.find(t => t.id === drill.type);
                const Icon = type?.icon;
                return (
                  <TableRow key={drill.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <div className={`w-8 h-8 rounded ${type.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <span>{type?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{drill.vesselName}</TableCell>
                    <TableCell>{new Date(drill.date).toLocaleDateString()}</TableCell>
                    <TableCell>{drill.duration}</TableCell>
                    <TableCell>{drill.participants > 0 ? drill.participants : '-'}</TableCell>
                    <TableCell className="text-sm">{drill.conductedBy}</TableCell>
                    <TableCell>{getStatusBadge(drill.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {drill.status === 'completed' && drill.reportUrl && (
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Procedure Dialog */}
      <Dialog open={!!selectedType} onOpenChange={() => setSelectedType(null)}>
        <DialogContent className="max-w-3xl">
          {selectedType && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl ${selectedType.color} flex items-center justify-center`}>
                    <selectedType.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedType.name} Emergency</DialogTitle>
                    <p className="text-muted-foreground mt-1">{selectedType.description}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <h3 className="font-semibold mb-3">Key Procedures</h3>
                <div className="space-y-2">
                  {selectedType.keyProcedures.map((procedure, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                        {idx + 1}
                      </div>
                      <p>{procedure}</p>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedType(null)}>Close</Button>
                {isMaster && (
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
