import { ArrowLeft, Ship, Download, Upload, Users, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Breadcrumbs } from '../components/Breadcrumbs';

const vesselInfo = {
  name: 'MV Ocean Star',
  imo: 'IMO 9234567',
  client: 'Ocean Shipping Ltd',
  flag: 'Panama',
  type: 'Container Ship',
  dwt: '45,000 MT',
  grt: '32,000 GT',
  builtYear: '2015',
  builder: 'Hyundai Heavy Industries',
  status: 'Active',
  crewOnboard: 24,
  crewCapacity: 25,
};

const crewOnboard = [
  { id: 1, name: 'John Smith', rank: 'Captain', nationality: 'UK', joinDate: '2022-01-15', contractEnd: '2024-12-31', status: 'Onboard' },
  { id: 2, name: 'Maria Garcia', rank: 'Chief Engineer', nationality: 'Philippines', joinDate: '2022-03-20', contractEnd: '2025-01-15', status: 'Onboard' },
  { id: 3, name: 'Ahmed Hassan', rank: 'Chief Officer', nationality: 'Egypt', joinDate: '2023-06-10', contractEnd: '2025-03-10', status: 'Onboard' },
  { id: 4, name: 'Robert Lee', rank: 'Second Engineer', nationality: 'South Korea', joinDate: '2023-09-01', contractEnd: '2025-05-01', status: 'Onboard' },
];

const vesselDocuments = [
  { id: 1, name: 'Safety Management Certificate', number: 'SMC-2023-001', issueDate: '2023-01-15', expiryDate: '2024-12-25', status: 'Valid' },
  { id: 2, name: 'Class Certificate', number: 'CC-2022-045', issueDate: '2022-05-10', expiryDate: '2025-05-09', status: 'Valid' },
  { id: 3, name: 'Load Line Certificate', number: 'LLC-2023-078', issueDate: '2023-03-20', expiryDate: '2025-03-19', status: 'Valid' },
  { id: 4, name: 'Radio License', number: 'RL-2024-012', issueDate: '2024-02-01', expiryDate: '2025-02-01', status: 'Valid' },
];

const crewPlannerData = [
  { month: 'Dec 24', captain: true, chiefEngineer: true, chiefOfficer: true, secondEngineer: true },
  { month: 'Jan 25', captain: false, chiefEngineer: true, chiefOfficer: true, secondEngineer: true },
  { month: 'Feb 25', captain: false, chiefEngineer: false, chiefOfficer: true, secondEngineer: true },
  { month: 'Mar 25', captain: false, chiefEngineer: false, chiefOfficer: false, secondEngineer: true },
  { month: 'Apr 25', captain: false, chiefEngineer: false, chiefOfficer: false, secondEngineer: true },
  { month: 'May 25', captain: false, chiefEngineer: false, chiefOfficer: false, secondEngineer: false },
];

export function VesselDetail() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Vessels', href: '#vessels' },
          { label: vesselInfo.name },
        ]}
      />

      {/* Back Button */}
      <Button variant="ghost" className="gap-2" onClick={() => window.location.hash = 'vessels'}>
        <ArrowLeft className="w-4 h-4" />
        Back to Vessels
      </Button>

      {/* Vessel Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Icon */}
            <div className="flex items-center justify-center md:justify-start">
              <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
                <Ship className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-foreground mb-1">{vesselInfo.name}</h2>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>{vesselInfo.imo}</span>
                    <span>•</span>
                    <span>{vesselInfo.type}</span>
                    <span>•</span>
                    <span>Flag: {vesselInfo.flag}</span>
                  </div>
                </div>
                <Badge className="bg-accent text-accent-foreground">
                  {vesselInfo.status}
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div>
                  <div className="text-sm text-muted-foreground">Client</div>
                  <div className="text-foreground">{vesselInfo.client}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">DWT</div>
                  <div className="text-foreground">{vesselInfo.dwt}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Built</div>
                  <div className="text-foreground">{vesselInfo.builtYear}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Crew</div>
                  <div className="text-foreground">{vesselInfo.crewOnboard} / {vesselInfo.crewCapacity}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-4">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Assign Crew
                </Button>
                <Button variant="outline">Edit Details</Button>
                <Button variant="outline">Generate Report</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crew-onboard">Crew Onboard</TabsTrigger>
          <TabsTrigger value="crew-planner">Crew Planner</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-foreground mb-4">Vessel Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Vessel Name</Label>
                  <Input value={vesselInfo.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>IMO Number</Label>
                  <Input value={vesselInfo.imo} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Ship Type</Label>
                  <Input value={vesselInfo.type} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Flag</Label>
                  <Input value={vesselInfo.flag} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>DWT</Label>
                  <Input value={vesselInfo.dwt} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>GRT</Label>
                  <Input value={vesselInfo.grt} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Built Year</Label>
                  <Input value={vesselInfo.builtYear} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Builder</Label>
                  <Input value={vesselInfo.builder} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={vesselInfo.client} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value={vesselInfo.status} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crew Onboard Tab */}
        <TabsContent value="crew-onboard">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-foreground">Crew Onboard ({vesselInfo.crewOnboard})</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="w-4 h-4" />
                    Assign New Crew
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Contract End</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crewOnboard.map((crew) => (
                      <TableRow key={crew.id}>
                        <TableCell>{crew.name}</TableCell>
                        <TableCell>{crew.rank}</TableCell>
                        <TableCell>{crew.nationality}</TableCell>
                        <TableCell>{crew.joinDate}</TableCell>
                        <TableCell>{crew.contractEnd}</TableCell>
                        <TableCell>
                          <Badge className="bg-primary text-primary-foreground">
                            {crew.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">View Profile</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crew Planner Tab */}
        <TabsContent value="crew-planner">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-foreground">Crew Rotation Planner</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Plan Rotation
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-foreground">Position</th>
                        {crewPlannerData.map((month, index) => (
                          <th key={index} className="text-center p-3 text-foreground min-w-[80px]">
                            {month.month}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="p-3 text-foreground">Captain</td>
                        {crewPlannerData.map((month, index) => (
                          <td key={index} className="p-3 text-center">
                            <div
                              className={`h-8 rounded ${
                                month.captain ? 'bg-accent' : 'bg-muted'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-foreground">Chief Engineer</td>
                        {crewPlannerData.map((month, index) => (
                          <td key={index} className="p-3 text-center">
                            <div
                              className={`h-8 rounded ${
                                month.chiefEngineer ? 'bg-accent' : 'bg-muted'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-foreground">Chief Officer</td>
                        {crewPlannerData.map((month, index) => (
                          <td key={index} className="p-3 text-center">
                            <div
                              className={`h-8 rounded ${
                                month.chiefOfficer ? 'bg-accent' : 'bg-muted'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-3 text-foreground">Second Engineer</td>
                        {crewPlannerData.map((month, index) => (
                          <td key={index} className="p-3 text-center">
                            <div
                              className={`h-8 rounded ${
                                month.secondEngineer ? 'bg-accent' : 'bg-muted'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-accent rounded" />
                    <span className="text-muted-foreground">Onboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <span className="text-muted-foreground">Sign-off / Relief</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-foreground">Vessel Certificates</h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vesselDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell className="text-muted-foreground">{doc.number}</TableCell>
                        <TableCell>{doc.issueDate}</TableCell>
                        <TableCell>{doc.expiryDate}</TableCell>
                        <TableCell>
                          <Badge className="bg-accent text-accent-foreground">
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-foreground mb-4">Available Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="text-foreground">Crew List PDF</div>
                    <div className="text-sm text-muted-foreground">Complete crew roster with details</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="text-foreground">Ship Report</div>
                    <div className="text-sm text-muted-foreground">Comprehensive vessel information</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="text-foreground">Certificate Summary</div>
                    <div className="text-sm text-muted-foreground">All vessel certificates and validity</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <div className="text-left">
                    <div className="text-foreground">Crew Change Schedule</div>
                    <div className="text-sm text-muted-foreground">Upcoming crew rotations</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
