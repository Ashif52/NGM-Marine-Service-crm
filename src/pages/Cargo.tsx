import { useState, useEffect } from 'react';
import { Package, Plus, Eye, Download, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { cargoApi, shipsApi, CargoResponse, CargoCreate } from '../services/api';

interface CargoOperation {
  id: string;
  type: 'loading' | 'discharging';
  vesselId: string;
  vesselName: string;
  port: string;
  cargoType: string;
  quantity: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  checklistCompleted: boolean;
  officer: string;
  remarks: string;
}

const mockOperations: CargoOperation[] = [
  {
    id: '1',
    type: 'loading',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    port: 'Singapore',
    cargoType: 'Container',
    quantity: '1,250 TEU',
    date: '2024-12-29',
    status: 'in-progress',
    checklistCompleted: true,
    officer: 'Chief Officer John Smith',
    remarks: 'Loading proceeding as planned. Weather conditions favorable.'
  },
  {
    id: '2',
    type: 'discharging',
    vesselId: '2',
    vesselName: 'MT Pacific Wave',
    port: 'Shanghai',
    cargoType: 'Crude Oil',
    quantity: '45,000 MT',
    date: '2024-12-28',
    status: 'completed',
    checklistCompleted: true,
    officer: 'Chief Officer',
    remarks: 'Discharge completed successfully. No incidents.'
  },
  {
    id: '3',
    type: 'loading',
    vesselId: '3',
    vesselName: 'MV Atlantic Trader',
    port: 'Rotterdam',
    cargoType: 'General Cargo',
    quantity: '12,500 MT',
    date: '2025-01-02',
    status: 'scheduled',
    checklistCompleted: false,
    officer: 'TBD',
    remarks: ''
  },
  {
    id: '4',
    type: 'discharging',
    vesselId: '1',
    vesselName: 'MV Ocean Star',
    port: 'Hong Kong',
    cargoType: 'Container',
    quantity: '850 TEU',
    date: '2024-12-20',
    status: 'delayed',
    checklistCompleted: true,
    officer: 'Second Officer',
    remarks: 'Delay due to port congestion. New ETA confirmed.'
  }
];

const cargoChecklist = [
  { id: 'pre-loading', label: 'Pre-loading/discharging inspection', category: 'Preparation' },
  { id: 'safety-brief', label: 'Safety briefing conducted', category: 'Safety' },
  { id: 'equipment-check', label: 'Cargo equipment operational check', category: 'Equipment' },
  { id: 'securing', label: 'Cargo securing equipment ready', category: 'Equipment' },
  { id: 'stability', label: 'Stability calculation completed', category: 'Documentation' },
  { id: 'cargo-plan', label: 'Cargo plan approved', category: 'Documentation' },
  { id: 'fire-safety', label: 'Fire fighting equipment ready', category: 'Safety' },
  { id: 'spillage', label: 'Spill prevention measures in place', category: 'Environment' },
  { id: 'communication', label: 'Communication with terminal established', category: 'Operations' },
  { id: 'watch', label: 'Cargo watch arranged', category: 'Operations' }
];

export function Cargo() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<CargoResponse[]>([]);
  const [ships, setShips] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOperationOpen, setIsAddOperationOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<CargoResponse | null>(null);
  const [newCargo, setNewCargo] = useState({
    ship_id: '',
    cargo_type: 'loading',
    cargo_name: '',
    quantity: 0,
    unit: 'MT',
    port: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cargoRes, shipsRes] = await Promise.all([
          cargoApi.getAll(),
          shipsApi.getAllShips()
        ]);
        if (cargoRes.data) setOperations(cargoRes.data);
        if (shipsRes.data) setShips(shipsRes.data.map(s => ({ id: s.id, name: s.name })));
        if (user?.ship_id) setNewCargo(prev => ({ ...prev, ship_id: user.ship_id || '' }));
      } catch (err) {
        toast.error('Failed to load cargo operations');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const isMaster = user?.role === 'master';
  const isCrew = user?.role === 'crew';

  const filteredOperations = isCrew 
    ? operations.filter(op => op.ship_id === user?.ship_id)
    : operations;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-accent text-accent-foreground">Completed</Badge>;
      case 'delayed':
        return <Badge className="bg-destructive text-destructive-foreground">Delayed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'loading' 
      ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Loading</Badge>
      : <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Discharging</Badge>;
  };

  const handleAddOperation = async () => {
    if (!newCargo.ship_id || !newCargo.cargo_name || !newCargo.port) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const cargoData: CargoCreate = {
        ship_id: newCargo.ship_id,
        cargo_type: newCargo.cargo_type,
        cargo_name: newCargo.cargo_name,
        quantity: newCargo.quantity,
        unit: newCargo.unit,
        port: newCargo.port,
        scheduled_date: newCargo.scheduled_date,
        notes: newCargo.notes || undefined
      };
      const response = await cargoApi.create(cargoData);
      if (response.error) throw new Error(response.error);
      const cargoRes = await cargoApi.getAll();
      if (cargoRes.data) setOperations(cargoRes.data);
      toast.success('Cargo operation scheduled successfully');
      setIsAddOperationOpen(false);
      setNewCargo({
        ship_id: user?.ship_id || '',
        cargo_type: 'loading',
        cargo_name: '',
        quantity: 0,
        unit: 'MT',
        port: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule cargo operation');
    }
  };

  const handleCompleteChecklist = () => {
    toast.success('Cargo checklist completed');
    setIsChecklistOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#02283F] p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-white" />
          <h1 className="text-white text-2xl">Cargo Operations</h1>
        </div>
        <p className="text-white/80">
          Manage cargo loading, discharging, and operational checklists
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Operations</p>
                <p className="text-2xl font-semibold mt-1">{filteredOperations.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold mt-1">
                  {filteredOperations.filter(op => op.status === 'in-progress').length}
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">
                  {filteredOperations.filter(op => op.status === 'completed').length}
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
                <p className="text-sm text-muted-foreground">Delayed</p>
                <p className="text-2xl font-semibold mt-1">
                  {filteredOperations.filter(op => op.status === 'delayed').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsChecklistOpen(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cargo Checklist</p>
                <p className="text-lg font-semibold mt-1">Pre-operation Check</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cargo Plan</p>
                <p className="text-lg font-semibold mt-1">View/Upload</p>
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Guide</p>
                <p className="text-lg font-semibold mt-1">View Procedures</p>
              </div>
              <Download className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations Table */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cargo Operations</CardTitle>
            <Dialog open={isAddOperationOpen} onOpenChange={setIsAddOperationOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Operation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Cargo Operation</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Operation Type</Label>
                    <Select value={newCargo.cargo_type} onValueChange={(v) => setNewCargo({...newCargo, cargo_type: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loading">Loading</SelectItem>
                        <SelectItem value="unloading">Unloading</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vessel *</Label>
                    <Select value={newCargo.ship_id} onValueChange={(v) => setNewCargo({...newCargo, ship_id: v})}>
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
                    <Label>Port *</Label>
                    <Input placeholder="Port name" value={newCargo.port} onChange={(e) => setNewCargo({...newCargo, port: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input type="date" value={newCargo.scheduled_date} onChange={(e) => setNewCargo({...newCargo, scheduled_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo Name *</Label>
                    <Input placeholder="e.g., Container, Crude Oil" value={newCargo.cargo_name} onChange={(e) => setNewCargo({...newCargo, cargo_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="Amount" value={newCargo.quantity || ''} onChange={(e) => setNewCargo({...newCargo, quantity: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Officer in Charge</Label>
                    <Input placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Remarks</Label>
                    <Textarea placeholder="Additional notes" rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOperationOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddOperation}>
                    Add Operation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead>Checklist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell>{getTypeBadge(operation.cargo_type)}</TableCell>
                  <TableCell className="font-medium">{operation.ship_name}</TableCell>
                  <TableCell>{operation.port}</TableCell>
                  <TableCell>{operation.cargo_name}</TableCell>
                  <TableCell>{operation.quantity} {operation.unit}</TableCell>
                  <TableCell>{operation.scheduled_date ? new Date(operation.scheduled_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell className="text-sm">{operation.created_by_name || '-'}</TableCell>
                  <TableCell>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell>{getStatusBadge(operation.status)}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedOperation(operation)}
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

      {/* Cargo Checklist Dialog */}
      <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cargo Operations Checklist</DialogTitle>
            <p className="text-muted-foreground">Pre-loading/discharging safety checklist</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {['Preparation', 'Safety', 'Equipment', 'Documentation', 'Environment', 'Operations'].map(category => (
              <div key={category}>
                <h3 className="font-semibold mb-3">{category}</h3>
                <div className="space-y-2">
                  {cargoChecklist.filter(item => item.category === category).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Checkbox id={item.id} />
                      <Label htmlFor={item.id} className="cursor-pointer flex-1">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChecklistOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteChecklist}>
              Complete & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Operation Detail Dialog */}
      <Dialog open={!!selectedOperation} onOpenChange={() => setSelectedOperation(null)}>
        <DialogContent className="max-w-2xl">
          {selectedOperation && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl mb-2">
                      {selectedOperation.cargo_type === 'loading' ? 'Loading' : 'Unloading'} Operation
                    </DialogTitle>
                    <div className="flex gap-2">
                      {getTypeBadge(selectedOperation.cargo_type)}
                      {getStatusBadge(selectedOperation.status)}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Vessel</Label>
                    <p className="font-medium">{selectedOperation.ship_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Port</Label>
                    <p className="font-medium">{selectedOperation.port}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Cargo</Label>
                    <p className="font-medium">{selectedOperation.cargo_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Quantity</Label>
                    <p className="font-medium">{selectedOperation.quantity} {selectedOperation.unit}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Scheduled Date</Label>
                    <p className="font-medium">{selectedOperation.scheduled_date ? new Date(selectedOperation.scheduled_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created By</Label>
                    <p className="font-medium">{selectedOperation.created_by_name || '-'}</p>
                  </div>
                </div>
                {selectedOperation.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedOperation.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOperation(null)}>
                  Close
                </Button>
                {isMaster && (
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
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
