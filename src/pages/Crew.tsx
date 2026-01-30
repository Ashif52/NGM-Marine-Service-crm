import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, UserCheck, UserX, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { userApi, shipsApi, UserResponse, UserCreate, UserUpdate, ShipResponse } from '../services/api';
import { toast } from 'sonner';
 
export function Crew() {
  const { user } = useAuth();
  const [crew, setCrew] = useState<UserResponse[]>([]);
  const [ships, setShips] = useState<ShipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<UserResponse | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'crew' as const,
    position: '',
    phone: '',
    ship_id: 'none',
  });

  const isMaster = user?.role === 'master';

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load crew members and ships
        const [crewResponse, shipsResponse] = await Promise.all([
          userApi.getAllUsers(),
          shipsApi.getAllShips()
        ]);

        if (crewResponse.error) {
          throw new Error(crewResponse.error);
        }
        if (shipsResponse.error) {
          throw new Error(shipsResponse.error);
        }

        setCrew(crewResponse.data || []);
        setShips(shipsResponse.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const filteredCrew = crew.filter(crewMember => {
    const matchesSearch = crewMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crewMember.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = rankFilter === 'all' || crewMember.position === rankFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'available' && !crewMember.ship_id) ||
      (statusFilter === 'onboard' && crewMember.ship_id) ||
      (statusFilter === 'inactive' && !crewMember.active);
    return matchesSearch && matchesRank && matchesStatus;
  });

  const loadCrew = async () => {
    try {
      const response = await userApi.getAllUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      setCrew(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load crew';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'crew',
      position: '',
      phone: '',
      ship_id: 'none',
    });
  };

  const openEditDialog = (crewMember: UserResponse) => {
    setSelectedCrew(crewMember);
    setFormData({
      name: crewMember.name,
      email: crewMember.email,
      password: '',
      role: crewMember.role as any,
      position: crewMember.position || '',
      phone: crewMember.phone || '',
      ship_id: crewMember.ship_id || 'none',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (crewMember: UserResponse) => {
    setSelectedCrew(crewMember);
    setIsDeleteDialogOpen(true);
  };

  const openAssignDialog = (crewMember: UserResponse) => {
    setSelectedCrew(crewMember);
    setFormData({
      ...formData,
      ship_id: crewMember.ship_id || 'none',
    });
    setIsAssignDialogOpen(true);
  };

  const handleCreateCrew = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const crewData: UserCreate = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        position: formData.position || undefined,
        phone: formData.phone || undefined,
        ship_id: formData.ship_id === 'none' ? null : formData.ship_id,
      };

      const response = await userApi.createUser(crewData);
      if (response.error) {
        throw new Error(response.error);
      }

      await loadCrew();
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Crew member added successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create crew member';
      toast.error(errorMessage);
    }
  };

  const handleUpdateCrew = async () => {
    if (!selectedCrew) return;

    try {
      const updateData: UserUpdate = {
        name: formData.name || undefined,
        role: formData.role || undefined,
        position: formData.position || undefined,
        phone: formData.phone || undefined,
        ship_id: formData.ship_id === 'none' ? null : formData.ship_id,
      };

      const response = await userApi.updateUser(selectedCrew.id, updateData);
      if (response.error) {
        throw new Error(response.error);
      }

      await loadCrew();
      setIsEditDialogOpen(false);
      setSelectedCrew(null);
      resetForm();
      toast.success('Crew member updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update crew member';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCrew = async () => {
    if (!selectedCrew) return;

    try {
      const response = await userApi.deleteUser(selectedCrew.id);
      if (response.error) {
        throw new Error(response.error);
      }

      await loadCrew();
      setIsDeleteDialogOpen(false);
      setSelectedCrew(null);
      toast.success('Crew member deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete crew member';
      toast.error(errorMessage);
    }
  };

  const handleAssignCrew = async () => {
    if (!selectedCrew) return;

    try {
      const updateData: UserUpdate = {
        ship_id: formData.ship_id === 'none' ? null : formData.ship_id,
      };

      const response = await userApi.updateUser(selectedCrew.id, updateData);
      if (response.error) {
        throw new Error(response.error);
      }

      await loadCrew();
      setIsAssignDialogOpen(false);
      setSelectedCrew(null);
      resetForm();
      toast.success('Crew member assigned successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign crew member';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (crewMember: UserResponse) => {
    if (!crewMember.active) return 'bg-destructive text-destructive-foreground';
    if (crewMember.ship_id) return 'bg-primary text-primary-foreground';
    return 'bg-accent text-accent-foreground';
  };

  const getStatusText = (crewMember: UserResponse) => {
    if (!crewMember.active) return 'Inactive';
    if (crewMember.ship_id) return 'Onboard';
    return 'Available';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-foreground">Crew Management</h2>
          <p className="text-sm text-muted-foreground">Manage crew profiles, availability, and assignments</p>
        </div>
        {isMaster && (
          <Button 
            className="bg-accent text-accent-foreground hover:bg-accent/90" 
            onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); resetForm(); setIsCreateDialogOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Crew Member
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or nationality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={rankFilter} onValueChange={setRankFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              <SelectItem value="Captain">Captain</SelectItem>
              <SelectItem value="Chief Engineer">Chief Engineer</SelectItem>
              <SelectItem value="Chief Officer">Chief Officer</SelectItem>
              <SelectItem value="Second Engineer">Second Engineer</SelectItem>
              <SelectItem value="AB Seaman">AB Seaman</SelectItem>
              <SelectItem value="Bosun">Bosun</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="onboard">Onboard</SelectItem>
              <SelectItem value="standby">Standby</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Nationality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Nationalities</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ph">Philippines</SelectItem>
              <SelectItem value="eg">Egypt</SelectItem>
              <SelectItem value="kr">South Korea</SelectItem>
              <SelectItem value="cn">China</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Crew Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Last Vessel / Company</TableHead>
              <TableHead>Total Sea Time</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">Loading crew members...</p>
                </TableCell>
              </TableRow>
            ) : filteredCrew.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No crew members found
                </TableCell>
              </TableRow>
            ) : (
              filteredCrew.map((crewMember) => (
                <TableRow key={crewMember.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {crewMember.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{crewMember.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{crewMember.position || 'N/A'}</TableCell>
                  <TableCell>{crewMember.email}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{crewMember.ship_name || 'No vessel assigned'}</div>
                      <div className="text-muted-foreground">{crewMember.phone || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{crewMember.role.charAt(0).toUpperCase() + crewMember.role.slice(1)}</TableCell>
                  <TableCell>{new Date(crewMember.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(crewMember)}>
                      {getStatusText(crewMember)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {!crewMember.ship_id && crewMember.active && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Assign to Vessel" 
                          className="text-accent"
                          onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); openAssignDialog(crewMember); }}
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      )}
                      {isMaster && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit crew member"
                            onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); openEditDialog(crewMember); }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Delete crew member" 
                            className="text-red-600 hover:text-red-700"
                            onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); openDeleteDialog(crewMember); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Crew Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Crew Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crew">Crew</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="Captain, Chief Engineer, etc." />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <Label>Assign to Vessel</Label>
              <Select value={formData.ship_id} onValueChange={(value) => setFormData({...formData, ship_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No vessel assigned</SelectItem>
                  {ships.map(ship => (
                    <SelectItem key={ship.id} value={ship.id}>{ship.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCrew}>Add Crew Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Crew Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Crew Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crew">Crew</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Assign to Vessel</Label>
              <Select value={formData.ship_id} onValueChange={(value) => setFormData({...formData, ship_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No vessel assigned</SelectItem>
                  {ships.map(ship => (
                    <SelectItem key={ship.id} value={ship.id}>{ship.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCrew}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Crew Member</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{selectedCrew?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCrew}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Vessel Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Crew Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>Assign <strong>{selectedCrew?.name}</strong> to a vessel:</p>
            <div className="space-y-2">
              <Label>Vessel</Label>
              <Select value={formData.ship_id} onValueChange={(value) => setFormData({...formData, ship_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Remove from vessel</SelectItem>
                  {ships.map(ship => (
                    <SelectItem key={ship.id} value={ship.id}>{ship.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignCrew}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
