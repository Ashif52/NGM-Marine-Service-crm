import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DGDashboard } from '../components/dg/DGDashboard';
import { DGInCommunication } from '../components/dg/DGInCommunication';
import { DGOutCommunication } from '../components/dg/DGOutCommunication';
import { DGComplianceTracker } from '../components/dg/DGComplianceTracker';

export function DGCommunication() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground">DG Communication</h2>
        <p className="text-sm text-muted-foreground">
          Manage communications with Directorate General of Shipping
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="in-communication">In-Communication</TabsTrigger>
          <TabsTrigger value="out-communication">Out-Communication</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Tracker</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DGDashboard />
        </TabsContent>

        <TabsContent value="in-communication">
          <DGInCommunication />
        </TabsContent>

        <TabsContent value="out-communication">
          <DGOutCommunication />
        </TabsContent>

        <TabsContent value="compliance">
          <DGComplianceTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
