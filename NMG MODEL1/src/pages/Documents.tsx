import { useState } from 'react';
import { Search, Download, Eye, FileText } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const documentsData = [
  { id: 1, name: 'John Smith', type: 'Crew', subtype: 'Passport', issueDate: '2020-06-15', expiryDate: '2025-06-14', daysRemaining: 165, status: 'Valid' },
  { id: 2, name: 'Maria Garcia', type: 'Crew', subtype: 'COC', issueDate: '2019-03-10', expiryDate: '2024-12-20', daysRemaining: 19, status: 'Expiring' },
  { id: 3, name: 'MV Ocean Star', type: 'Vessel', subtype: 'Safety Certificate', issueDate: '2023-01-15', expiryDate: '2024-12-25', daysRemaining: 24, status: 'Expiring' },
  { id: 4, name: 'Ahmed Hassan', type: 'Crew', subtype: 'Medical', issueDate: '2024-01-20', expiryDate: '2025-01-19', daysRemaining: 49, status: 'Valid' },
  { id: 5, name: 'MT Pacific Wave', type: 'Vessel', subtype: 'Class Certificate', issueDate: '2022-05-10', expiryDate: '2025-05-09', daysRemaining: 159, status: 'Valid' },
  { id: 6, name: 'Robert Lee', type: 'Crew', subtype: 'STCW', issueDate: '2019-08-15', expiryDate: '2024-11-30', daysRemaining: -1, status: 'Expired' },
  { id: 7, name: 'Ocean Shipping Ltd', type: 'Client', subtype: 'Contract', issueDate: '2022-01-15', expiryDate: '2025-01-14', daysRemaining: 44, status: 'Valid' },
  { id: 8, name: 'Chen Wei', type: 'Crew', subtype: 'Seaman Book', issueDate: '2021-04-20', expiryDate: '2026-04-19', daysRemaining: 505, status: 'Valid' },
];

export function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredDocuments = documentsData.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.subtype.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid':
        return 'bg-accent text-accent-foreground';
      case 'expiring':
        return 'bg-warning text-warning-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return 'text-destructive';
    if (days <= 30) return 'text-destructive';
    if (days <= 60) return 'text-warning';
    return 'text-accent';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-foreground">Documents</h2>
          <p className="text-sm text-muted-foreground">Central document management hub for crew, vessels, and clients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or document type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Crew">Crew Documents</SelectItem>
              <SelectItem value="Vessel">Vessel Documents</SelectItem>
              <SelectItem value="Client">Client Documents</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Subtype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subtypes</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="coc">COC</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="stcw">STCW</SelectItem>
              <SelectItem value="certificate">Certificates</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Remaining</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{doc.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {doc.subtype}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{doc.issueDate}</TableCell>
                <TableCell className="text-sm">{doc.expiryDate}</TableCell>
                <TableCell>
                  <span className={getDaysColor(doc.daysRemaining)}>
                    {doc.daysRemaining > 0 ? `${doc.daysRemaining} days` : 'Expired'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" title="View">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Download">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
