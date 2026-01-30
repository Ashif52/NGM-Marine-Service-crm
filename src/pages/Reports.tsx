import { FileSpreadsheet, FileText, Users, Ship, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const reports = [
  {
    id: 1,
    title: 'Crew Expiry Report',
    description: 'View crew documents expiring within specified date range',
    icon: Calendar,
    category: 'Crew',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 2,
    title: 'Vessel-wise Crew List',
    description: 'Complete crew roster for each vessel with current assignments',
    icon: Ship,
    category: 'Vessel',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 3,
    title: 'Client-wise Vessel List',
    description: 'List of all vessels grouped by client company',
    icon: Users,
    category: 'Client',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 4,
    title: 'Recruitment Status by Vessel',
    description: 'Track recruitment pipeline status for each vessel',
    icon: Users,
    category: 'Recruitment',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 5,
    title: 'Signed Document Report',
    description: 'List of all signed contracts, NDAs, and company policies',
    icon: FileText,
    category: 'Documents',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 6,
    title: 'Sea Service Report',
    description: 'Detailed sea service history for crew members',
    icon: Ship,
    category: 'Crew',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 7,
    title: 'Certification Summary',
    description: 'Overview of all crew certifications and their validity status',
    icon: FileText,
    category: 'Crew',
    formats: ['PDF', 'Excel'],
  },
  {
    id: 8,
    title: 'Vessel Compliance Report',
    description: 'Compliance status of vessel certificates and inspections',
    icon: Ship,
    category: 'Vessel',
    formats: ['PDF', 'Excel'],
  },
];

const categoryColors: Record<string, string> = {
  'Crew': 'bg-primary text-primary-foreground',
  'Vessel': 'bg-accent text-accent-foreground',
  'Client': 'bg-blue-500 text-white',
  'Recruitment': 'bg-yellow-500 text-white',
  'Documents': 'bg-purple-500 text-white',
};

export function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground">Generate and export various reports for analysis</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${categoryColors[report.category]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${categoryColors[report.category]}`}>
                    {report.category}
                  </span>
                </div>
                <CardTitle className="text-foreground">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                    <FileText className="w-4 h-4 mr-2" />
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
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used report operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Documents Expiring This Month
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Available Crew Report
            </Button>
            <Button variant="outline" className="justify-start">
              <Ship className="w-4 h-4 mr-2" />
              Active Vessels Summary
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Monthly Activity Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
