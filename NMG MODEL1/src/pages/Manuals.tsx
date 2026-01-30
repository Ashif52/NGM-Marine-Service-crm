import { useState } from 'react';
import { BookOpen, Shield, Briefcase, Ship, FileText, Download, Eye, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';

interface ManualSection {
  id: string;
  title: string;
  content: string[];
}

interface Manual {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  version: string;
  lastUpdated: string;
  sections: ManualSection[];
}

const manuals: Manual[] = [
  {
    id: 'smm',
    title: 'Safety Management Manual (SMM)',
    description: 'Policy & Compliance Layer – Admin Controlled',
    icon: Shield,
    color: 'bg-blue-500',
    version: '3.2',
    lastUpdated: '2024-12-15',
    sections: [
      {
        id: 'company-overview',
        title: '1. Company Overview',
        content: [
          'The company is committed to operating vessels safely, preventing pollution, and complying with international maritime regulations including ISM Code, SOLAS, MARPOL, and Flag State requirements.',
          'CRM Fields: company_name, imo_company_number, office_address, contact_details'
        ]
      },
      {
        id: 'safety-policy',
        title: '2. Safety & Environmental Protection Policy',
        content: [
          'The company establishes and maintains a Safety Management System (SMS) to:',
          '• Ensure safe ship operation',
          '• Prevent injury and loss of life',
          '• Avoid damage to the environment and property',
          'CRM Usage: Policy document upload, Version control, Acknowledgement by crew'
        ]
      },
      {
        id: 'roles',
        title: '3. Roles & Responsibilities',
        content: [
          'Shore Management:',
          '• Provide resources',
          '• Monitor vessel performance',
          '• Conduct audits',
          '',
          'Shipboard Management:',
          '• Implement SMS onboard',
          '• Ensure crew compliance',
          '• Report non-conformities',
          '',
          'CRM Fields: role_name, responsibilities, assigned_users'
        ]
      },
      {
        id: 'dpa',
        title: '4. Designated Person Ashore (DPA)',
        content: [
          'Acts as a direct link between ship and management to monitor safety and pollution prevention.',
          'CRM: dpa_user_id, vessels_assigned, contact_status'
        ]
      },
      {
        id: 'emergency',
        title: '5. Emergency Preparedness',
        content: [
          'Procedures for:',
          '• Fire',
          '• Collision',
          '• Grounding',
          '• Oil spill',
          '• Man overboard',
          '• Abandon ship',
          '',
          'CRM: emergency_type, drill_date, participants, drill_report_upload'
        ]
      },
      {
        id: 'maintenance',
        title: '6. Maintenance & Defect Reporting',
        content: [
          'All equipment must be maintained as per PMS. Defects must be reported immediately.',
          'CRM: equipment_id, defect_description, priority, rectification_status'
        ]
      },
      {
        id: 'audits',
        title: '7. Audits & Reviews',
        content: [
          'Types of audits:',
          '• Internal audits',
          '• External audits',
          '• Management reviews',
          '',
          'CRM: audit_type, auditor, findings, corrective_actions'
        ]
      }
    ]
  },
  {
    id: 'cpm',
    title: 'Company Procedure Manual (CPM)',
    description: 'How the Company Operates',
    icon: Briefcase,
    color: 'bg-green-500',
    version: '2.8',
    lastUpdated: '2024-12-10',
    sections: [
      {
        id: 'operational-control',
        title: '1. Operational Control',
        content: [
          'Defines procedures for:',
          '• Voyage planning',
          '• Cargo handling',
          '• Navigation safety',
          '• Communication protocols',
          '',
          'CRM: procedure_name, vessel_type, approval_status'
        ]
      },
      {
        id: 'crew-management',
        title: '2. Crew Management',
        content: [
          '• Crew selection & certification',
          '• Training & familiarization',
          '• Rest hours compliance',
          '',
          'CRM: crew_id, certificates, expiry_alerts'
        ]
      },
      {
        id: 'safety-procedures',
        title: '3. Safety Procedures',
        content: [
          '• Permit to work',
          '• Lock-out / Tag-out',
          '• Hot work',
          '• Confined space entry',
          '',
          'CRM: permit_type, issued_by, validity'
        ]
      },
      {
        id: 'incident-reporting',
        title: '4. Incident Reporting',
        content: [
          'All incidents, accidents, and near-misses must be reported.',
          'CRM: incident_type, severity, root_cause, corrective_action'
        ]
      }
    ]
  },
  {
    id: 'fpm',
    title: 'Fleet Procedure Manual (FPM)',
    description: 'Ship-Level Execution',
    icon: Ship,
    color: 'bg-purple-500',
    version: '4.1',
    lastUpdated: '2024-12-20',
    sections: [
      {
        id: 'navigation',
        title: '1. Navigation Procedures',
        content: [
          '• Passage planning',
          '• Watchkeeping',
          '• Bridge team management',
          '',
          'CRM: voyage_id, passage_plan_upload, approval_status'
        ]
      },
      {
        id: 'engine-room',
        title: '2. Engine Room Operations',
        content: [
          '• Startup & shutdown procedures',
          '• Fuel handling',
          '• Lubrication management',
          '',
          'CRM: engine_hours, fuel_consumption, maintenance_log'
        ]
      },
      {
        id: 'pms',
        title: '3. Planned Maintenance System (PMS)',
        content: [
          '• Routine maintenance',
          '• Overhaul schedules',
          '• Spare management',
          '',
          'CRM: task_id, interval, last_done, next_due'
        ]
      },
      {
        id: 'cargo',
        title: '4. Cargo Operations',
        content: [
          '• Loading',
          '• Discharging',
          '• Securing',
          '• Damage prevention',
          '',
          'CRM: cargo_type, checklist_upload, remarks'
        ]
      },
      {
        id: 'bunkering',
        title: '5. Bunkering Operations',
        content: [
          '• Pre-bunkering checklist',
          '• Sampling',
          '• Spill prevention',
          '',
          'CRM: bunkering_date, supplier, quantity, checklist_status'
        ]
      }
    ]
  },
  {
    id: 'forms',
    title: 'Forms & Logs (CPMF + FPMF)',
    description: 'Daily Crew Uploads – Core of CRM',
    icon: FileText,
    color: 'bg-orange-500',
    version: '1.5',
    lastUpdated: '2024-12-25',
    sections: [
      {
        id: 'common-structure',
        title: 'Common Structure',
        content: [
          'Every form must contain:',
          '• vessel_id',
          '• date',
          '• crew_id',
          '• form_type',
          '• data_fields',
          '• photo / pdf upload',
          '• status (draft / submitted / approved)'
        ]
      },
      {
        id: 'daily-work-log',
        title: 'Daily Work Log',
        content: [
          '• Work description',
          '• Location onboard',
          '• Tools used',
          '• Supervisor approval'
        ]
      },
      {
        id: 'risk-assessment',
        title: 'Risk Assessment',
        content: [
          '• Hazard identified',
          '• Risk level (Low / Medium / High)',
          '• Control measures'
        ]
      },
      {
        id: 'incident-report',
        title: 'Incident / Near Miss Report',
        content: [
          '• What happened',
          '• Why it happened',
          '• Preventive action'
        ]
      },
      {
        id: 'pms-log',
        title: 'PMS Log',
        content: [
          '• Equipment name',
          '• Job done',
          '• Spare used',
          '• Running hours'
        ]
      },
      {
        id: 'safety-meeting',
        title: 'Safety Meeting Record',
        content: [
          '• Topics discussed',
          '• Attendees',
          '• Action items'
        ]
      },
      {
        id: 'certificates',
        title: 'Certificates Status Report',
        content: [
          '• Certificate name',
          '• Issue date',
          '• Expiry date',
          '• Alert status'
        ]
      }
    ]
  }
];

export function Manuals() {
  const { user } = useAuth();
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [selectedSection, setSelectedSection] = useState<ManualSection | null>(null);

  const isMaster = user?.role === 'master';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#02283F] p-6 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-white" />
          <h1 className="text-white text-2xl">Manuals & Procedures</h1>
        </div>
        <p className="text-white/80">
          Complete documentation for Safety Management, Company Procedures, and Fleet Operations
        </p>
      </div>

      {!selectedManual ? (
        <>
          {/* Manual Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {manuals.map((manual) => {
              const Icon = manual.icon;
              return (
                <Card 
                  key={manual.id} 
                  className="shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedManual(manual)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl ${manual.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">v{manual.version}</Badge>
                        <Badge variant="outline" className="bg-muted">
                          {manual.sections.length} sections
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {manual.title}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                    <CardDescription>{manual.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last updated: {new Date(manual.lastUpdated).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {isMaster && (
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Access */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Quick Access - Most Viewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Emergency Procedures</div>
                    <div className="text-xs text-muted-foreground">SMM Section 5</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Ship className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">PMS Procedures</div>
                    <div className="text-xs text-muted-foreground">FPM Section 3</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Daily Work Logs</div>
                    <div className="text-xs text-muted-foreground">Forms Section</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Manual Viewer */}
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedManual(null);
                setSelectedSection(null);
              }}
            >
              ← Back to All Manuals
            </Button>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl ${selectedManual.color} flex items-center justify-center`}>
                      <selectedManual.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedManual.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {selectedManual.description}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge>Version {selectedManual.version}</Badge>
                        <Badge variant="outline">
                          Updated: {new Date(selectedManual.lastUpdated).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isMaster && (
                    <Button>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={selectedManual.sections[0]?.id} className="w-full">
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(selectedManual.sections.length, 4)}, 1fr)` }}>
                    {selectedManual.sections.slice(0, 4).map((section) => (
                      <TabsTrigger key={section.id} value={section.id}>
                        {section.title.split('.')[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {selectedManual.sections.map((section) => (
                    <TabsContent key={section.id} value={section.id} className="mt-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">{section.title}</h3>
                        <div className="prose max-w-none">
                          {section.content.map((paragraph, idx) => (
                            <p key={idx} className="mb-3 leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* All Sections List */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">All Sections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedManual.sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{section.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
