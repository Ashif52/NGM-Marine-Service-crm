import { ShieldCheck, Users, Lock, Eye, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const permissionsMatrix = [
  { module: 'Dashboard', master: true, crew: true, staff: true },
  { module: 'Ship Overview', master: true, crew: false, staff: true },
  { module: 'PMS - View Tasks', master: true, crew: true, staff: true },
  { module: 'PMS - Create/Edit Tasks', master: true, crew: false, staff: true },
  { module: 'PMS - Approve Tasks', master: true, crew: false, staff: false },
  { module: 'Crew Daily Logs - Submit', master: true, crew: true, staff: false },
  { module: 'Crew Daily Logs - Review', master: true, crew: false, staff: false },
  { module: 'Crew Daily Logs - Approve', master: true, crew: false, staff: false },
  { module: 'Masters Data', master: true, crew: false, staff: true },
  { module: 'Clients', master: true, crew: false, staff: true },
  { module: 'Vessels - View', master: true, crew: false, staff: true },
  { module: 'Vessels - Edit', master: true, crew: false, staff: false },
  { module: 'Crew Management - View', master: true, crew: false, staff: true },
  { module: 'Crew Management - Edit', master: true, crew: false, staff: true },
  { module: 'Recruitment', master: true, crew: false, staff: true },
  { module: 'Documents - View', master: true, crew: true, staff: true },
  { module: 'Documents - Upload', master: true, crew: true, staff: true },
  { module: 'DG Communication', master: true, crew: false, staff: true },
  { module: 'Invoices - Create', master: true, crew: false, staff: true },
  { module: 'Invoices - Approve', master: true, crew: false, staff: false },
  { module: 'Finance - View', master: true, crew: false, staff: true },
  { module: 'Finance - Edit', master: true, crew: false, staff: false },
  { module: 'Reports - View', master: true, crew: false, staff: true },
  { module: 'Reports - Export', master: true, crew: false, staff: true },
  { module: 'Access Control', master: true, crew: false, staff: false },
  { module: 'Settings', master: true, crew: true, staff: true },
];

const usersList = [
  { id: '1', name: 'Captain Anderson', email: 'anderson@nmgmarine.com', role: 'master', ships: 'All Ships', status: 'active' },
  { id: '2', name: 'John Smith', email: 'jsmith@nmgmarine.com', role: 'crew', ships: 'MV Ocean Star', status: 'active' },
  { id: '3', name: 'Robert Lee', email: 'rlee@nmgmarine.com', role: 'crew', ships: 'MT Pacific Wave', status: 'active' },
  { id: '4', name: 'Chen Wei', email: 'cwei@nmgmarine.com', role: 'crew', ships: 'MV Atlantic Trader', status: 'active' },
  { id: '5', name: 'Sarah Johnson', email: 'sjohnson@nmgmarine.com', role: 'staff', ships: 'All Ships', status: 'active' },
  { id: '6', name: 'Mike Peters', email: 'mpeters@nmgmarine.com', role: 'staff', ships: 'All Ships', status: 'active' },
];

const auditLogs = [
  { timestamp: '2024-12-16 14:30:00', user: 'Captain Anderson', action: 'Approved PMS Task', target: 'Fire Pump - Pressure Test', ip: '192.168.1.100' },
  { timestamp: '2024-12-16 14:15:00', user: 'Sarah Johnson', action: 'Created Invoice', target: 'INV-2024-003', ip: '192.168.1.105' },
  { timestamp: '2024-12-16 13:45:00', user: 'John Smith', action: 'Updated Task Status', target: 'Main Engine - Oil Check', ip: '192.168.1.102' },
  { timestamp: '2024-12-16 12:30:00', user: 'Captain Anderson', action: 'Approved Daily Log', target: 'John Smith - Engine Maintenance', ip: '192.168.1.100' },
  { timestamp: '2024-12-16 11:20:00', user: 'Sarah Johnson', action: 'Added Crew Member', target: 'Michael Rodriguez', ip: '192.168.1.105' },
  { timestamp: '2024-12-16 10:15:00', user: 'Mike Peters', action: 'Updated Vessel Info', target: 'MV Ocean Star', ip: '192.168.1.106' },
];

export function AccessControl() {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'master':
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Master</Badge>;
      case 'crew':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Crew</Badge>;
      case 'staff':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Staff</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>
      : <Badge className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Role & Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage user permissions, roles, and system access across all ships
          </p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Users className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{usersList.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Masters</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {usersList.filter(u => u.role === 'master').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crew Members</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {usersList.filter(u => u.role === 'crew').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Staff Users</p>
                <p className="text-2xl font-semibold text-foreground mt-1">
                  {usersList.filter(u => u.role === 'staff').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Access Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm">{user.ships}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Matrix Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Permissions Matrix</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-sm text-muted-foreground">Access Granted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-300"></div>
                    <span className="text-sm text-muted-foreground">Access Denied</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Module / Feature</TableHead>
                    <TableHead className="text-center">Master</TableHead>
                    <TableHead className="text-center">Crew</TableHead>
                    <TableHead className="text-center">Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionsMatrix.map((permission, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{permission.module}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {permission.master ? (
                            <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded bg-gray-300"></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {permission.crew ? (
                            <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded bg-gray-300"></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {permission.staff ? (
                            <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded bg-gray-300"></div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Role Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  Master (Super Admin)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Full system access including:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• View all 7 ships</li>
                  <li>• Approve PMS tasks</li>
                  <li>• Approve crew daily logs</li>
                  <li>• Approve invoices</li>
                  <li>• Manage access control</li>
                  <li>• Generate all reports</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Crew (Limited Access)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Task-focused access including:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• View assigned ship only</li>
                  <li>• Submit daily work logs</li>
                  <li>• Update PMS task status</li>
                  <li>• Upload maintenance photos</li>
                  <li>• View documents</li>
                  <li>• Basic settings</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  Staff (Operations)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Operations access including:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Manage crew records</li>
                  <li>• Create/manage invoices</li>
                  <li>• Manage PMS schedules</li>
                  <li>• View all ships</li>
                  <li>• Generate reports</li>
                  <li>• No approval authority</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.target}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{log.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
