import { useState } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Master Data
const countryMaster = [
  { id: 1, code: 'IN', name: 'India', phoneCode: '+91', createdDate: '2024-01-15' },
  { id: 2, code: 'US', name: 'United States', phoneCode: '+1', createdDate: '2024-01-15' },
  { id: 3, code: 'PH', name: 'Philippines', phoneCode: '+63', createdDate: '2024-01-16' },
  { id: 4, code: 'GB', name: 'United Kingdom', phoneCode: '+44', createdDate: '2024-01-16' },
];

const rankMaster = [
  { id: 1, code: 'MSTR', name: 'Master', department: 'Deck', createdDate: '2024-01-15' },
  { id: 2, code: 'CHOF', name: 'Chief Officer', department: 'Deck', createdDate: '2024-01-15' },
  { id: 3, code: 'CHNG', name: 'Chief Engineer', department: 'Engine', createdDate: '2024-01-15' },
  { id: 4, code: '2ENG', name: '2nd Engineer', department: 'Engine', createdDate: '2024-01-16' },
];

const agentMaster = [
  { id: 1, code: 'AGT001', name: 'Mumbai Port Services', location: 'Mumbai, India', createdDate: '2024-01-15' },
  { id: 2, code: 'AGT002', name: 'Singapore Maritime', location: 'Singapore', createdDate: '2024-01-16' },
  { id: 3, code: 'AGT003', name: 'Dubai Ship Agency', location: 'Dubai, UAE', createdDate: '2024-01-16' },
];

const currencyMaster = [
  { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', createdDate: '2024-01-15' },
  { id: 2, code: 'EUR', name: 'Euro', symbol: '€', createdDate: '2024-01-15' },
  { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', createdDate: '2024-01-16' },
  { id: 4, code: 'INR', name: 'Indian Rupee', symbol: '₹', createdDate: '2024-01-16' },
];

export function Masters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">Master Data</h2>
        <p className="text-sm text-muted-foreground">
          Configure system-wide master data including countries, ranks, agents, and currencies
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="country" className="space-y-6">
        <TabsList className="bg-card border border-border inline-flex h-12 items-center justify-start rounded-lg p-1 gap-1">
          <TabsTrigger 
            value="country" 
            className="data-[state=active]:bg-[#E6F3FF] data-[state=active]:text-primary rounded-lg px-6"
          >
            Country Master
          </TabsTrigger>
          <TabsTrigger 
            value="rank"
            className="data-[state=active]:bg-[#E6F3FF] data-[state=active]:text-primary rounded-lg px-6"
          >
            Rank Master
          </TabsTrigger>
          <TabsTrigger 
            value="agent"
            className="data-[state=active]:bg-[#E6F3FF] data-[state=active]:text-primary rounded-lg px-6"
          >
            Agent Master
          </TabsTrigger>
          <TabsTrigger 
            value="currency"
            className="data-[state=active]:bg-[#E6F3FF] data-[state=active]:text-primary rounded-lg px-6"
          >
            Currency Master
          </TabsTrigger>
        </TabsList>

        {/* Country Master */}
        <TabsContent value="country">
          <Card className="shadow-lg">
            <CardHeader className="bg-[#F0F5F8] border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary">Country Master</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 h-10 bg-card"
                    />
                  </div>
                  <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10 px-4">
                        <Plus className="w-4 h-4" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Country</DialogTitle>
                        <DialogDescription>
                          Add a new country to the master data
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Country Code</Label>
                          <Input placeholder="e.g., IN" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Country Name</Label>
                          <Input placeholder="e.g., India" className="h-10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Code</Label>
                          <Input placeholder="e.g., +91" className="h-10" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F0F5F8] hover:bg-[#F0F5F8]">
                    <TableHead className="text-primary h-12">Code</TableHead>
                    <TableHead className="text-primary">Country Name</TableHead>
                    <TableHead className="text-primary">Phone Code</TableHead>
                    <TableHead className="text-primary">Created Date</TableHead>
                    <TableHead className="text-primary text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryMaster.map((country) => (
                    <TableRow key={country.id} className="hover:bg-[#F7FAFD] h-14">
                      <TableCell className="font-medium text-primary">{country.code}</TableCell>
                      <TableCell>{country.name}</TableCell>
                      <TableCell className="text-muted-foreground">{country.phoneCode}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{country.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
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

        {/* Rank Master */}
        <TabsContent value="rank">
          <Card className="shadow-lg">
            <CardHeader className="bg-[#F0F5F8] border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary">Rank Master</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ranks..."
                      className="pl-9 w-64 h-10 bg-card"
                    />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10 px-4">
                    <Plus className="w-4 h-4" />
                    Add New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F0F5F8] hover:bg-[#F0F5F8]">
                    <TableHead className="text-primary h-12">Code</TableHead>
                    <TableHead className="text-primary">Rank Name</TableHead>
                    <TableHead className="text-primary">Department</TableHead>
                    <TableHead className="text-primary">Created Date</TableHead>
                    <TableHead className="text-primary text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankMaster.map((rank) => (
                    <TableRow key={rank.id} className="hover:bg-[#F7FAFD] h-14">
                      <TableCell className="font-medium text-primary">{rank.code}</TableCell>
                      <TableCell>{rank.name}</TableCell>
                      <TableCell className="text-muted-foreground">{rank.department}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{rank.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
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

        {/* Agent Master */}
        <TabsContent value="agent">
          <Card className="shadow-lg">
            <CardHeader className="bg-[#F0F5F8] border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary">Agent Master</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search agents..."
                      className="pl-9 w-64 h-10 bg-card"
                    />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10 px-4">
                    <Plus className="w-4 h-4" />
                    Add New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F0F5F8] hover:bg-[#F0F5F8]">
                    <TableHead className="text-primary h-12">Code</TableHead>
                    <TableHead className="text-primary">Agent Name</TableHead>
                    <TableHead className="text-primary">Location</TableHead>
                    <TableHead className="text-primary">Created Date</TableHead>
                    <TableHead className="text-primary text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentMaster.map((agent) => (
                    <TableRow key={agent.id} className="hover:bg-[#F7FAFD] h-14">
                      <TableCell className="font-medium text-primary">{agent.code}</TableCell>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell className="text-muted-foreground">{agent.location}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{agent.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
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

        {/* Currency Master */}
        <TabsContent value="currency">
          <Card className="shadow-lg">
            <CardHeader className="bg-[#F0F5F8] border-b border-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-primary">Currency Master</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search currencies..."
                      className="pl-9 w-64 h-10 bg-card"
                    />
                  </div>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-10 px-4">
                    <Plus className="w-4 h-4" />
                    Add New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F0F5F8] hover:bg-[#F0F5F8]">
                    <TableHead className="text-primary h-12">Code</TableHead>
                    <TableHead className="text-primary">Currency Name</TableHead>
                    <TableHead className="text-primary">Symbol</TableHead>
                    <TableHead className="text-primary">Created Date</TableHead>
                    <TableHead className="text-primary text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencyMaster.map((currency) => (
                    <TableRow key={currency.id} className="hover:bg-[#F7FAFD] h-14">
                      <TableCell className="font-medium text-primary">{currency.code}</TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell className="text-muted-foreground">{currency.symbol}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{currency.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
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
      </Tabs>
    </div>
  );
}
