import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BookOpen, Download, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { documentService } from '@/services/documents';
import { Manual, ManualType } from '@/types/documents';
import { toast } from 'sonner';

export default function Manuals() {
    const { user } = useAuth();
    const [manuals, setManuals] = useState<Manual[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const isStaffOrMaster = ['staff', 'master'].includes(user?.role || '');

    useEffect(() => {
        loadManuals();
    }, []);

    const loadManuals = async () => {
        try {
            const response = await documentService.getManuals();
            if (response.data) {
                setManuals(response.data);
            }
        } catch (error) {
            console.error('Failed to load manuals:', error);
            toast.error('Failed to load manuals');
        } finally {
            setLoading(false);
        }
    };

    const filteredManuals = activeTab === 'all'
        ? manuals
        : manuals.filter(m => m.manual_type === activeTab);

    if (loading) {
        return <div className="p-8 text-center">Loading manuals...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manuals & Procedures</h1>
                    <p className="text-muted-foreground mt-2">
                        Access fleet procedures, safety manuals, and company guides.
                    </p>
                </div>
                {isStaffOrMaster && (
                    <Button variant="default">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Manual
                    </Button>
                )}
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Manuals</TabsTrigger>
                    <TabsTrigger value={ManualType.FPM}>FPM</TabsTrigger>
                    <TabsTrigger value={ManualType.SMM}>SMM</TabsTrigger>
                    <TabsTrigger value={ManualType.CPM}>CPM</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredManuals.map((manual) => (
                            <Card key={manual.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold">{manual.title}</CardTitle>
                                            <Badge variant="secondary" className="mt-1">
                                                v{manual.version}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {manual.description || `Official ${manual.manual_type} document for vessel operations.`}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                        <span>Type: {manual.manual_type}</span>
                                        <span>{new Date(manual.updated_at).toLocaleDateString()}</span>
                                    </div>

                                    <Button className="w-full" variant="outline" asChild>
                                        <a href={manual.file_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredManuals.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No manuals found in this category.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
