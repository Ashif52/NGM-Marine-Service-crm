import { useState, useEffect } from 'react';
import { Anchor, Plus, Eye, Download, CheckCircle2, AlertTriangle, Droplet, Loader2 } from 'lucide-react';
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
import { bunkeringApi, shipsApi, BunkeringResponse, BunkeringCreate } from '../services/api';

const fuelTypeLabels: Record<string, string> = {
  vlsfo: 'VLSFO (0.5% Sulphur)',
  hfo: 'HFO (3.5% Sulphur)',
  mgo: 'MGO',
  lsmgo: 'LSMGO',
};

const bunkeringChecklist = [
  { id: 'pre-brief', label: 'Pre-bunkering safety briefing conducted', category: 'Preparation' },
  { id: 'manifold', label: 'Manifold connections inspected and ready', category: 'Equipment' },
  { id: 'scupper', label: 'Scupper plugs in place', category: 'Spill Prevention' },
  { id: 'drip-tray', label: 'Drip trays positioned at manifold', category: 'Spill Prevention' },
  { id: 'emergency', label: 'Emergency shutdown procedures reviewed', category: 'Safety' },
  { id: 'communication', label: 'Communication established with supplier', category: 'Operations' },
  { id: 'sampling', label: 'Sampling equipment ready', category: 'Quality Control' },
  { id: 'sounding', label: 'Tank sounding equipment operational', category: 'Equipment' },
  { id: 'watch', label: 'Continuous watch arranged', category: 'Operations' },
  { id: 'fire', label: 'Fire fighting equipment ready', category: 'Safety' },
  { id: 'boom', label: 'Oil boom available if required', category: 'Spill Prevention' },
  { id: 'documentation', label: 'BDN documentation prepared', category: 'Documentation' }
];

export function Bunkering() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<BunkeringResponse[]>([]);
  const [ships, setShips] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOperationOpen, setIsAddOperationOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BunkeringResponse | null>(null);
  const [newOperation, setNewOperation] = useState({
    ship_id: '',
    port: '',
    supplier: '',
    fuel_type: 'vlsfo' as const,
    quantity: '',
    scheduled_date: '',
    cost_per_mt: '',
    officer_in_charge: '',
    remarks: '',
  });

  const isMaster = user?.role === 'master';
  const isStaff = user?.role === 'staff';
  const isCrew = user?.role === 'crew';

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load ships
        const shipsResponse = await shipsApi.getAllShips();
        if (shipsResponse.data) {
          const shipsList = shipsResponse.data.map(ship => ({ id: ship.id, name: ship.name }));
          setShips(shipsList);
          
          // Set default ship for staff and crew users
          if (!newOperation.ship_id) {
            if ((user?.role === 'staff' || user?.role === 'crew') && user.ship_id) {
              setNewOperation(prev => ({ ...prev, ship_id: user.ship_id }));
            } else if (shipsList.length > 0) {
              setNewOperation(prev => ({ ...prev, ship_id: shipsList[0].id }));
            }
          }
        }

        // Load operations
        await loadOperations();
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const loadOperations = async () => {
    try {
      // For staff and crew, only load operations for their vessel
      const params = (user?.role === 'staff' || user?.role === 'crew') && user?.ship_id
        ? { ship_id: user.ship_id }
        : undefined;
      
      const response = await bunkeringApi.getAll(params);
      if (response.error) {
        throw new Error(response.error);
      }
      setOperations(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load operations';
      toast.error(errorMessage);
    }
  };

  const filteredOperations = operations;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-accent text-accent-foreground">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-muted">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddOperation = async () => {
    if (!newOperation.ship_id || !newOperation.port || !newOperation.supplier || !newOperation.quantity || !newOperation.scheduled_date || !newOperation.cost_per_mt) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data: BunkeringCreate = {
        ship_id: newOperation.ship_id,
        port: newOperation.port,
        supplier: newOperation.supplier,
        fuel_type: newOperation.fuel_type,
        quantity: parseFloat(newOperation.quantity),
        scheduled_date: newOperation.scheduled_date,
        cost_per_mt: parseFloat(newOperation.cost_per_mt),
        officer_in_charge: newOperation.officer_in_charge || undefined,
        remarks: newOperation.remarks || undefined,
      };

      const response = await bunkeringApi.create(data);
      if (response.error) {
        throw new Error(response.error);
      }

      await loadOperations();
      setIsAddOperationOpen(false);
      setNewOperation({
        ship_id: ships[0]?.id || '',
        port: '',
        supplier: '',
        fuel_type: 'vlsfo',
        quantity: '',
        scheduled_date: '',
        cost_per_mt: '',
        officer_in_charge: '',
        remarks: '',
      });
      toast.success('Bunkering operation scheduled successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create operation';
      toast.error(errorMessage);
    }
  };

  const handleCompleteChecklist = async () => {
    if (selectedOperation) {
      try {
        const response = await bunkeringApi.completeChecklist(selectedOperation.id);
        if (response.error) {
          throw new Error(response.error);
        }
        await loadOperations();
        toast.success('Bunkering checklist completed');
      } catch (err) {
        toast.error('Failed to complete checklist');
      }
    }
    setIsChecklistOpen(false);
  };

  // Calculate stats
  const totalQuantity = filteredOperations
    .filter(op => op.status === 'completed')
    .reduce((sum, op) => sum + op.quantity, 0);
  
  const totalCost = filteredOperations
    .filter(op => op.status === 'completed')
    .reduce((sum, op) => sum + op.total_cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#02283F] p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Anchor className="w-8 h-8 text-white" />
          <h1 className="text-white text-2xl">Bunkering Operations</h1>
        </div>
        <p className="text-white/80">
          Manage fuel bunkering operations, safety checklists, and quality control
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
              <Anchor className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fuel Loaded (MT)</p>
                <p className="text-2xl font-semibold mt-1">{totalQuantity.toFixed(0)}</p>
              </div>
              <Droplet className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-semibold mt-1">${(totalCost / 1000).toFixed(0)}K</p>
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
                  {filteredOperations.filter(op => op.status === 'in_progress').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
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
                <p className="text-sm text-muted-foreground">Safety Checklist</p>
                <p className="text-lg font-semibold mt-1">Pre-Bunkering</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SOPEP Plan</p>
                <p className="text-lg font-semibold mt-1">View/Download</p>
              </div>
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fuel Analysis</p>
                <p className="text-lg font-semibold mt-1">Lab Reports</p>
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
            <CardTitle>Bunkering Operations</CardTitle>
            {!isCrew && (
              <Dialog open={isAddOperationOpen} onOpenChange={setIsAddOperationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Bunkering
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Bunkering Operation</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Vessel</Label>
                    {isMaster ? (
                      <Select value={newOperation.ship_id} onValueChange={(value) => setNewOperation({...newOperation, ship_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vessel" />
                        </SelectTrigger>
                        <SelectContent>
                          {ships.map(ship => (
                            <SelectItem key={ship.id} value={ship.id}>{ship.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={ships.find(s => s.id === newOperation.ship_id)?.name || 'Loading...'} 
                        disabled 
                        className="bg-gray-100"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input placeholder="Port name" value={newOperation.port} onChange={(e) => setNewOperation({...newOperation, port: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Input placeholder="Fuel supplier name" value={newOperation.supplier} onChange={(e) => setNewOperation({...newOperation, supplier: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input type="datetime-local" value={newOperation.scheduled_date} onChange={(e) => setNewOperation({...newOperation, scheduled_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select value={newOperation.fuel_type} onValueChange={(value: 'vlsfo' | 'hfo' | 'mgo' | 'lsmgo') => setNewOperation({...newOperation, fuel_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vlsfo">VLSFO (0.5% Sulphur)</SelectItem>
                        <SelectItem value="hfo">HFO (3.5% Sulphur)</SelectItem>
                        <SelectItem value="mgo">MGO</SelectItem>
                        <SelectItem value="lsmgo">LSMGO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (MT)</Label>
                    <Input type="number" placeholder="450" value={newOperation.quantity} onChange={(e) => setNewOperation({...newOperation, quantity: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost per MT ($)</Label>
                    <Input type="number" placeholder="580" value={newOperation.cost_per_mt} onChange={(e) => setNewOperation({...newOperation, cost_per_mt: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Officer in Charge</Label>
                    <Input placeholder="Chief Engineer" value={newOperation.officer_in_charge} onChange={(e) => setNewOperation({...newOperation, officer_in_charge: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Remarks</Label>
                    <Textarea placeholder="Additional notes" rows={3} value={newOperation.remarks} onChange={(e) => setNewOperation({...newOperation, remarks: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOperationOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddOperation}>
                    Schedule Operation
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
                <TableHead>Vessel</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Checklist</TableHead>
                <TableHead>Sample</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((operation) => (
                <TableRow key={operation.id}>
                  <TableCell className="font-medium">{operation.ship_name}</TableCell>
                  <TableCell>{operation.port}</TableCell>
                  <TableCell className="text-sm">{operation.supplier}</TableCell>
                  <TableCell className="text-sm">{fuelTypeLabels[operation.fuel_type] || operation.fuel_type}</TableCell>
                  <TableCell>{operation.quantity} MT</TableCell>
                  <TableCell>{new Date(operation.scheduled_date).toLocaleDateString()}</TableCell>
                  <TableCell>${operation.total_cost.toLocaleString()}</TableCell>
                  <TableCell>
                    {operation.checklist_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {operation.sample_taken ? (
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                    )}
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

      {/* Bunkering Checklist Dialog */}
      <Dialog open={isChecklistOpen} onOpenChange={setIsChecklistOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Pre-Bunkering Safety Checklist</DialogTitle>
            <p className="text-muted-foreground">Complete all items before commencing bunkering</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {['Preparation', 'Equipment', 'Spill Prevention', 'Safety', 'Operations', 'Quality Control', 'Documentation'].map(category => (
              <div key={category}>
                <h3 className="font-semibold mb-3">{category}</h3>
                <div className="space-y-2">
                  {bunkeringChecklist.filter(item => item.category === category).map(item => (
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
                    <DialogTitle className="text-2xl mb-2">Bunkering Operation</DialogTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedOperation.status)}
                      <Badge variant="outline">{fuelTypeLabels[selectedOperation.fuel_type] || selectedOperation.fuel_type}</Badge>
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
                    <Label className="text-muted-foreground">Supplier</Label>
                    <p className="font-medium">{selectedOperation.supplier}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{new Date(selectedOperation.scheduled_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Quantity</Label>
                    <p className="font-medium">{selectedOperation.quantity} MT</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Cost</Label>
                    <p className="font-medium">${selectedOperation.total_cost.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Officer in Charge</Label>
                    <p className="font-medium">{selectedOperation.officer_in_charge || 'TBD'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Cost per MT</Label>
                    <p className="font-medium">${selectedOperation.cost_per_mt}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label className="text-muted-foreground">Checklist Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedOperation.checklist_completed ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          <span className="font-medium text-accent">Completed</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium text-yellow-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Sample Taken</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedOperation.sample_taken ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          <span className="font-medium text-accent">Yes</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium text-yellow-600">No</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {selectedOperation.remarks && (
                  <div>
                    <Label className="text-muted-foreground">Remarks</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedOperation.remarks}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOperation(null)}>
                  Close
                </Button>
                {isMaster && (
                  <>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      BDN Report
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
