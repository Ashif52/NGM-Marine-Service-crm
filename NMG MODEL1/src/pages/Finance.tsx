import { DollarSign, TrendingUp, CreditCard, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function Finance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">Finance</h2>
        <p className="text-sm text-muted-foreground">Financial management and reporting (Coming Soon)</p>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <DollarSign className="w-24 h-24 text-muted-foreground/30 mb-6" />
          <h3 className="text-foreground mb-2">Finance Module Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            The Finance module is currently under development. This will include features for 
            invoicing, payments, payroll management, and financial reporting.
          </p>
          <Button variant="outline">Request Early Access</Button>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Invoicing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate and manage invoices for clients, track payments, and send automated reminders.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-2">
              <CreditCard className="w-6 h-6 text-accent" />
            </div>
            <CardTitle>Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage crew payroll, salary calculations, tax deductions, and payment processing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-warning" />
            </div>
            <CardTitle>Financial Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive financial reports, profit & loss statements, and cash flow analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
