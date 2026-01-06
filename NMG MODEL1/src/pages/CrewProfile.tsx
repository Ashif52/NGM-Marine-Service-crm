import { ArrowLeft, Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const crewProfile = {
  name: 'John Smith',
  rank: 'Captain',
  nationality: 'United Kingdom',
  age: 45,
  photo: '',
  initials: 'JS',
  status: 'Available',
  expiryAlerts: [
    { type: 'Passport', daysRemaining: 14 },
    { type: 'Medical', daysRemaining: 45 },
  ],
};

const personalInfo = {
  dateOfBirth: '1979-03-15',
  placeOfBirth: 'London, United Kingdom',
  gender: 'Male',
  maritalStatus: 'Married',
  email: 'john.smith@email.com',
  phone: '+44-7700-900123',
  address: '123 Marine Drive, Southampton, UK',
  emergencyContact: 'Jane Smith (+44-7700-900124)',
};

const passport = {
  number: 'GB123456789',
  issuedAt: 'London',
  issueDate: '2020-06-15',
  expiryDate: '2025-06-14',
  file: 'passport.pdf',
};

const medical = {
  type: 'ENG1',
  clinic: 'Marine Medical Clinic, Southampton',
  issueDate: '2024-01-20',
  expiryDate: '2025-01-19',
  file: 'medical_certificate.pdf',
};

const education = [
  { degree: 'BSc Marine Engineering', institution: 'Maritime University', year: '2001' },
  { degree: 'Master Mariner Certificate', institution: 'UK Maritime Academy', year: '2010' },
];

const seaService = [
  { vessel: 'MV Ocean Star', rank: 'Captain', from: '2022-01-15', to: '2024-11-30', type: 'Container Ship', dwt: '45,000' },
  { vessel: 'MT Pacific Wave', rank: 'Chief Officer', from: '2019-06-01', to: '2021-12-31', type: 'Oil Tanker', dwt: '80,000' },
  { vessel: 'MV Atlantic Trader', rank: 'Second Officer', from: '2016-03-10', to: '2019-05-20', type: 'Bulk Carrier', dwt: '55,000' },
];

const courses = [
  { name: 'STCW Basic Safety', issueDate: '2015-04-10', expiryDate: '2025-04-09', status: 'Valid' },
  { name: 'Advanced Fire Fighting', issueDate: '2016-08-15', expiryDate: '2026-08-14', status: 'Valid' },
  { name: 'ECDIS Generic', issueDate: '2018-02-20', expiryDate: '2028-02-19', status: 'Valid' },
  { name: 'Bridge Resource Management', issueDate: '2020-05-10', expiryDate: '2025-05-09', status: 'Valid' },
];

export function CrewProfile() {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-accent text-accent-foreground';
      case 'onboard':
        return 'bg-primary text-primary-foreground';
      case 'standby':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" className="gap-2" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back to Crew List
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Photo & Basic Info */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={crewProfile.photo} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {crewProfile.initials}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
            </div>

            {/* Right: Details */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-foreground mb-1">{crewProfile.name}</h2>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>{crewProfile.rank}</span>
                    <span>•</span>
                    <span>{crewProfile.nationality}</span>
                    <span>•</span>
                    <span>{crewProfile.age} years old</span>
                  </div>
                </div>
                <Badge className={getStatusColor(crewProfile.status)}>
                  {crewProfile.status}
                </Badge>
              </div>

              {/* Expiry Alerts */}
              {crewProfile.expiryAlerts.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="text-sm text-destructive mb-2">⚠️ Expiry Alerts</div>
                  <div className="space-y-1">
                    {crewProfile.expiryAlerts.map((alert, index) => (
                      <div key={index} className="text-sm text-foreground">
                        <strong>{alert.type}</strong> expires in {alert.daysRemaining} days
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Assign to Vessel
                </Button>
                <Button variant="outline">Edit Profile</Button>
                <Button variant="outline">Generate Report</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-card border border-border flex-wrap h-auto">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="passport">Passport</TabsTrigger>
          <TabsTrigger value="sid">SID</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="beneficiary">Beneficiary</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="seaman-book">Seaman Book</TabsTrigger>
          <TabsTrigger value="bank">Bank Account</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="experience">Sea Service</TabsTrigger>
          <TabsTrigger value="documents">Signed Documents</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input value={personalInfo.dateOfBirth} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Place of Birth</Label>
                  <Input value={personalInfo.placeOfBirth} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input value={personalInfo.gender} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Input value={personalInfo.maritalStatus} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={personalInfo.email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={personalInfo.phone} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input value={personalInfo.address} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Emergency Contact</Label>
                  <Input value={personalInfo.emergencyContact} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passport Tab */}
        <TabsContent value="passport">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Passport Number</Label>
                  <Input value={passport.number} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Issued At</Label>
                  <Input value={passport.issuedAt} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input value={passport.issueDate} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input value={passport.expiryDate} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Document File</Label>
                  <div className="flex gap-2">
                    <Input value={passport.file} readOnly className="flex-1" />
                    <Button variant="outline" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Tab */}
        <TabsContent value="medical">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Medical Type</Label>
                  <Input value={medical.type} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Clinic</Label>
                  <Input value={medical.clinic} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input value={medical.issueDate} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input value={medical.expiryDate} readOnly />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Certificate File</Label>
                  <div className="flex gap-2">
                    <Input value={medical.file} readOnly className="flex-1" />
                    <Button variant="outline" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-foreground">Academic & Maritime Education</h3>
                  <Button variant="outline" size="sm">Add Education</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Degree / Certificate</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {education.map((edu, index) => (
                      <TableRow key={index}>
                        <TableCell>{edu.degree}</TableCell>
                        <TableCell>{edu.institution}</TableCell>
                        <TableCell>{edu.year}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-foreground">STCW & Specialized Courses</h3>
                  <Button variant="outline" size="sm">Add Course</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course, index) => (
                      <TableRow key={index}>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.issueDate}</TableCell>
                        <TableCell>{course.expiryDate}</TableCell>
                        <TableCell>
                          <Badge className="bg-accent text-accent-foreground">
                            {course.status}
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

        {/* Sea Service Tab */}
        <TabsContent value="experience">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-foreground">Sea Service History</h3>
                  <Button variant="outline" size="sm">Add Record</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vessel</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Ship Type</TableHead>
                      <TableHead>DWT</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seaService.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.vessel}</TableCell>
                        <TableCell>{service.rank}</TableCell>
                        <TableCell>{service.from}</TableCell>
                        <TableCell>{service.to}</TableCell>
                        <TableCell>{service.type}</TableCell>
                        <TableCell>{service.dwt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs */}
        <TabsContent value="sid">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">SID information would be displayed here similar to passport layout.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Vaccination records with table: Vaccine, Date, Next Due</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficiary">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Beneficiary information: Name, Relationship, Contact, Share %</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">COC details, license types, expiry dates, uploads</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seaman-book">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Seaman Book number, issue/expiry dates, file upload</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Bank details: Bank name, IBAN, SWIFT, etc.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Signed documents: Contracts, NDAs, company policies</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
