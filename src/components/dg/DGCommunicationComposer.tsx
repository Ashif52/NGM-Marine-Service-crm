import { useState } from 'react';
import { FileText, Save, Send, Mail, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';

interface DGCommunicationComposerProps {
  onClose?: () => void;
}

export function DGCommunicationComposer({ onClose }: DGCommunicationComposerProps) {
  const [template, setTemplate] = useState('');
  const [letterContent, setLetterContent] = useState('');

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    
    // Auto-fill content based on template
    const templates: Record<string, string> = {
      'pre-joining': `Dear Sir/Madam,

Subject: Pre-Joining Letter for Crew Member

We hereby inform you that the following crew member has been approved for joining:

Crew Name: [AUTO-FILLED]
Rank: [AUTO-FILLED]
Vessel: [AUTO-FILLED]
IMO: [AUTO-FILLED]
Joining Date: [AUTO-FILLED]

All required documents and certifications are enclosed for your review.

We request your kind approval for the same.

Regards,
NMG Marine Service`,
      'manning': `Dear Sir/Madam,

Subject: Manning Request for Vessel

We request your approval for the manning scale of the following vessel:

Vessel Name: [AUTO-FILLED]
IMO Number: [AUTO-FILLED]
Flag: [AUTO-FILLED]
Ship Type: [AUTO-FILLED]

Proposed Manning Scale:
[Details to be filled]

All crew members possess valid certificates as per STCW requirements.

Kindly approve at the earliest.

Regards,
NMG Marine Service`,
      'incident': `Dear Sir/Madam,

Subject: Incident Report

We wish to report an incident that occurred on board:

Vessel: [AUTO-FILLED]
Date of Incident: [DATE]
Nature of Incident: [DESCRIPTION]

Details of the incident and actions taken are enclosed herewith.

We await your guidance on the matter.

Regards,
NMG Marine Service`,
    };
    
    setLetterContent(templates[value] || '');
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Panel - Fields */}
      <div className="col-span-1 space-y-4">
        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pre-joining">Pre-Joining Letter</SelectItem>
              <SelectItem value="manning">Manning Request</SelectItem>
              <SelectItem value="incident">Incident Report</SelectItem>
              <SelectItem value="dispute">Crew Dispute</SelectItem>
              <SelectItem value="medical">Medical Certification</SelectItem>
              <SelectItem value="custom">Custom Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>DG Office</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select DG Office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mumbai">DG Mumbai</SelectItem>
              <SelectItem value="delhi">DG Delhi</SelectItem>
              <SelectItem value="chennai">DG Chennai</SelectItem>
              <SelectItem value="kolkata">DG Kolkata</SelectItem>
              <SelectItem value="kochi">DG Kochi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="manning">Manning</SelectItem>
              <SelectItem value="stcw">STCW</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="incident">Incident</SelectItem>
              <SelectItem value="dispute">Dispute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Vessel (Optional)</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Vessel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="mv-ocean-star">MV Ocean Star</SelectItem>
              <SelectItem value="mt-pacific-wave">MT Pacific Wave</SelectItem>
              <SelectItem value="mv-atlantic-trader">MV Atlantic Trader</SelectItem>
              <SelectItem value="mt-indian-star">MT Indian Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Crew (Optional)</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Crew" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="john-smith">John Smith</SelectItem>
              <SelectItem value="maria-garcia">Maria Garcia</SelectItem>
              <SelectItem value="ahmed-hassan">Ahmed Hassan</SelectItem>
              <SelectItem value="robert-lee">Robert Lee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Reference No. (Optional)</Label>
          <Input placeholder="Enter reference number" />
        </div>

        <div className="space-y-2">
          <Label>Attachments</Label>
          <Button variant="outline" className="w-full gap-2" size="sm">
            <Paperclip className="w-4 h-4" />
            Add Files
          </Button>
          <div className="text-xs text-muted-foreground">
            No files attached
          </div>
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className="col-span-2 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input placeholder="Enter subject..." />
              </div>

              <div className="space-y-2">
                <Label>Letter Content</Label>
                <Textarea
                  placeholder="Type your letter here or select a template..."
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-muted p-3 rounded text-xs text-muted-foreground">
                <strong>Note:</strong> Fields marked as [AUTO-FILLED] will be automatically 
                populated based on your vessel and crew selections.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Generate PDF
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Send className="w-4 h-4" />
            Send Email
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Mail className="w-4 h-4" />
            Log Communication
          </Button>
        </div>
      </div>
    </div>
  );
}
