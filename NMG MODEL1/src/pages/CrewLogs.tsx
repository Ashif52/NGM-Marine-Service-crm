import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Calendar, CheckCircle2, Clock, X, Upload, Image as ImageIcon, AlertTriangle, Users, Wrench, Loader2, Eye, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { worklogsApi, shipsApi, WorkLogResponse, WorkLogCreate, WorkLogUpdate } from '../services/api';

export function CrewLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkLogResponse[]>([]);
  const [ships, setShips] = useState<Array<{id: string, name: string}>>([]);
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkLogResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    taskType: '',
    description: '',
    hoursWorked: '',
    photo: null as File | null,
  });
  
  const [editLog, setEditLog] = useState({
    date: '',
    taskType: '',
    description: '',
    hoursWorked: '',
  });

  const isMaster = user?.role === 'master';
  const isCrew = user?.role === 'crew';

  // Load ships and logs on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load ships for selection
        const shipsResponse = await shipsApi.getAllShips();
        if (shipsResponse.data) {
          const shipsList = shipsResponse.data.map(ship => ({ id: ship.id, name: ship.name }));
          setShips(shipsList);
          if (shipsList.length > 0 && !selectedShip) {
            setSelectedShip(shipsList[0].id);
          }
        }

        // Load logs
        await loadLogs();
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

  const loadLogs = async () => {
    try {
      const response = await worklogsApi.getAllLogs();
      if (response.error) {
        throw new Error(response.error);
      }
      setLogs(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load logs';
      toast.error(errorMessage);
    }
  };

  // Logs are already filtered by backend based on role
  const displayLogs = logs;

  const pendingCount = displayLogs.filter(l => l.status === 'pending').length;
  const approvedCount = displayLogs.filter(l => l.status === 'approved').length;
  const rejectedCount = displayLogs.filter(l => l.status === 'rejected').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  const handleCreateLog = async () => {
    if (!newLog.taskType || !newLog.description || !newLog.hoursWorked) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Use user's ship_id or first available ship
    const shipId = user?.ship_id || selectedShip;
    if (!shipId) {
      toast.error('No ship selected');
      return;
    }

    try {
      setSubmitting(true);
      const logData: WorkLogCreate = {
        ship_id: shipId,
        date: newLog.date,
        task_type: newLog.taskType,
        description: newLog.description,
        hours_worked: parseFloat(newLog.hoursWorked),
      };

      const response = await worklogsApi.createLog(logData);
      if (response.error) {
        throw new Error(response.error);
      }

      await loadLogs();
      setIsCreateDialogOpen(false);
      setNewLog({
        date: new Date().toISOString().split('T')[0],
        taskType: '',
        description: '',
        hoursWorked: '',
        photo: null,
      });
      toast.success('Daily log submitted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create log';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleViewLog = (log: WorkLogResponse) => {
    setSelectedLog(log);
    setIsViewDialogOpen(true);
  };
  
  const handleEditLog = (log: WorkLogResponse) => {
    setSelectedLog(log);
    setEditLog({
      date: log.date,
      taskType: log.task_type,
      description: log.description,
      hoursWorked: log.hours_worked.toString(),
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteLog = (log: WorkLogResponse) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteLog = async () => {
    if (!selectedLog) return;
    
    try {
      setSubmitting(true);
      const response = await worklogsApi.deleteLog(selectedLog.id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      await loadLogs();
      setIsDeleteDialogOpen(false);
      setSelectedLog(null);
      toast.success('Log deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete log';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleUpdateLog = async () => {
    if (!selectedLog) return;
    if (!editLog.taskType || !editLog.description || !editLog.hoursWorked) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      const logData: WorkLogUpdate = {
        task_type: editLog.taskType,
        description: editLog.description,
        hours_worked: parseFloat(editLog.hoursWorked),
        date: editLog.date,
      };
      
      const response = await worklogsApi.updateLog(selectedLog.id, logData);
      if (response.error) {
        throw new Error(response.error);
      }
      
      await loadLogs();
      setIsEditDialogOpen(false);
      setSelectedLog(null);
      toast.success('Log updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update log';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (logId: string, approved: boolean) => {
    try {
      if (approved) {
        const response = await worklogsApi.approveLog(logId);
        if (response.error) {
          throw new Error(response.error);
        }
      } else {
        const response = await worklogsApi.rejectLog(logId);
        if (response.error) {
          throw new Error(response.error);
        }
      }

      await loadLogs();
      toast.success(`Log ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update log';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Daily Work Logs</h1>
          <p className="text-muted-foreground mt-1">
            {isCrew ? 'Submit your daily work activities' : 'Review and approve crew daily logs'}
          </p>
        </div>
        {(isCrew || user?.role === 'staff') && (
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Log Entry
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{pendingCount}</p>
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
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{approvedCount}</p>
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
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{displayLogs.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isMaster ? (
            // Master view - Review panel
            <div className="space-y-4">
              {displayLogs.filter(log => log.status === 'pending').length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Pending Approval</h3>
                  <div className="space-y-3">
                    {displayLogs.filter(log => log.status === 'pending').map((log) => (
                      <div key={log.id} className="border border-border rounded-lg p-4 bg-yellow-50/30">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{log.task_type}</h4>
                              <Badge variant="outline">{log.hours_worked}h</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {log.crew_name} • {log.ship_name} • {log.date}
                            </p>
                          </div>
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-sm text-foreground mb-3">{log.description}</p>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproval(log.id, true)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApproval(log.id, false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-foreground mb-3">All Logs</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Crew</TableHead>
                      <TableHead>Ship</TableHead>
                      <TableHead>Task Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">{log.date}</TableCell>
                        <TableCell className="font-medium">{log.crew_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.ship_name}</TableCell>
                        <TableCell>{log.task_type}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.hours_worked}h</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            // Crew view - Simple table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{log.date}</TableCell>
                    <TableCell className="font-medium">{log.task_type}</TableCell>
                    <TableCell className="max-w-xs">{log.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.hours_worked}h</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {log.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLog(log)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteLog(log)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </>
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

      {/* Create Log Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Daily Work Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">Task Type</Label>
              <Select value={newLog.taskType} onValueChange={(value) => setNewLog({ ...newLog, taskType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engine Maintenance">Engine Maintenance</SelectItem>
                  <SelectItem value="Deck Work">Deck Work</SelectItem>
                  <SelectItem value="Safety Inspection">Safety Inspection</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Repair Work">Repair Work</SelectItem>
                  <SelectItem value="Inventory Check">Inventory Check</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newLog.description}
                onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                placeholder="Describe the work performed in detail..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={newLog.hoursWorked}
                onChange={(e) => setNewLog({ ...newLog, hoursWorked: e.target.value })}
                placeholder="e.g., 3.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Upload Photo (Optional)</Label>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <label htmlFor="photo" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setNewLog({ ...newLog, photo: e.target.files?.[0] || null })}
                  />
                </label>
              </Button>
              {newLog.photo && (
                <p className="text-xs text-muted-foreground">{newLog.photo.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCreateLog}>
              Submit Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Log Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Work Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>{selectedLog.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Task Type</p>
                  <p>{selectedLog.task_type}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1">{selectedLog.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hours Worked</p>
                  <p>{selectedLog.hours_worked}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
              </div>
              
              {selectedLog.remarks && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                  <p className="mt-1">{selectedLog.remarks}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Log Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Work Log</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_date">Date</Label>
              <Input
                id="edit_date"
                type="date"
                value={editLog.date}
                onChange={(e) => setEditLog({ ...editLog, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_taskType">Task Type</Label>
              <Select value={editLog.taskType} onValueChange={(value) => setEditLog({ ...editLog, taskType: value })}>
                <SelectTrigger id="edit_taskType">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engine Maintenance">Engine Maintenance</SelectItem>
                  <SelectItem value="Deck Work">Deck Work</SelectItem>
                  <SelectItem value="Safety Inspection">Safety Inspection</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Repair Work">Repair Work</SelectItem>
                  <SelectItem value="Inventory Check">Inventory Check</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={editLog.description}
                onChange={(e) => setEditLog({ ...editLog, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_hours">Hours Worked</Label>
              <Input
                id="edit_hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={editLog.hoursWorked}
                onChange={(e) => setEditLog({ ...editLog, hoursWorked: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleUpdateLog} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Log Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this work log? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteLog} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}