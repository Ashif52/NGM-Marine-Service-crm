import { FileSpreadsheet, FileText, Download, Calendar, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const reports = [
  {
    id: 1,
    title: 'All DG In-Communication',
    description: 'Complete list of all communications received from DG Shipping',
    icon: FileText,
    category: 'In-Communication',
    color: 'bg-primary',
  },
  {
    id: 2,
    title: 'All DG Out-Communication',
    description: 'Complete list of all letters sent to DG Shipping',
    icon: FileText,
    category: 'Out-Communication',
    color: 'bg-accent',
  },
  {
    id: 3,
    title: 'Compliance Status Report',
    description: 'Current status of all DG compliance requirements',
    icon: BarChart3,
    category: 'Compliance',
    color: 'bg-warning',
  },
  {
    id: 4,
    title: 'DG Circular Summary',
    description: 'Summary of all DG circulars and their implementation status',
    icon: FileText,
    category: 'Circulars',
    color: 'bg-purple-500',
  },
  {
    id: 5,
    title: 'Response Time Analysis',
    description: 'Analysis of response times for DG communications',
    icon: Clock,
    category: 'Analytics',
    color: 'bg-blue-500',
  },
  {
    id: 6,
    title: 'Vessel-wise DG Interactions',
    description: 'DG communications grouped by vessel',
    icon: BarChart3,
    category: 'Vessel',
    color: 'bg-green-500',
  },
  {
    id: 7,
    title: 'Pending Actions Report',
    description: 'List of all pending actions and deadlines',
    icon: Calendar,
    category: 'Actions',
    color: 'bg-orange-500',
  },
  {
    id: 8,
    title: 'Monthly Activity Report',
    description: 'Month-wise summary of all DG communications',
    icon: BarChart3,
    category: 'Monthly',
    color: 'bg-red-500',
  },
];

export function DGReports() {
  return (
    <div className="space-y-6">
      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Customize your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisyear">This Year</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>DG Office</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Office" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All DG Offices</SelectItem>
                  <SelectItem value="mumbai">DG Mumbai</SelectItem>
                  <SelectItem value="delhi">DG Delhi</SelectItem>
                  <SelectItem value="chennai">DG Chennai</SelectItem>
                  <SelectItem value="kolkata">DG Kolkata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vessel</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  <SelectItem value="mv-ocean-star">MV Ocean Star</SelectItem>
                  <SelectItem value="mt-pacific-wave">MT Pacific Wave</SelectItem>
                  <SelectItem value="mv-atlantic-trader">MV Atlantic Trader</SelectItem>
                  <SelectItem value="mt-indian-star">MT Indian Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${report.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${report.color} text-white`}>
                    {report.category}
                  </span>
                </div>
                <CardTitle className="text-foreground">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                    <FileText className="w-4 h-4" />
                    Generate
                  </Button>
                  <Button variant="outline" size="icon" title="Export to Excel">
                    <FileSpreadsheet className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" title="Download PDF">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Actions</CardTitle>
          <CardDescription>Commonly used report exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4 gap-2">
              <Calendar className="w-4 h-4" />
              <div className="text-left">
                <div className="text-foreground">This Month's Communications</div>
                <div className="text-xs text-muted-foreground">Excel Export</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4 gap-2">
              <Clock className="w-4 h-4" />
              <div className="text-left">
                <div className="text-foreground">Pending Compliances</div>
                <div className="text-xs text-muted-foreground">PDF Report</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4 gap-2">
              <BarChart3 className="w-4 h-4" />
              <div className="text-left">
                <div className="text-foreground">Annual Summary</div>
                <div className="text-xs text-muted-foreground">Excel Export</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4 gap-2">
              <FileText className="w-4 h-4" />
              <div className="text-left">
                <div className="text-foreground">All Circulars</div>
                <div className="text-xs text-muted-foreground">PDF Report</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
