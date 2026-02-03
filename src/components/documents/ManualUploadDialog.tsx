import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ManualType } from '@/types/documents';
import { documentService } from '@/services/documents';
import { auth, API_BASE_URL } from '../../firebase';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

interface ManualUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ManualUploadDialog({ open, onOpenChange, onSuccess }: ManualUploadDialogProps) {
    const [loading, setLoading] = useState(false);
    const [successCount, setSuccessCount] = useState(0);
    const [failCount, setFailCount] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ManualType>(ManualType.FPM);
    const [version, setVersion] = useState('1.0');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!files || files.length === 0) {
            toast.error('Please select at least one file');
            return;
        }

        setLoading(true);
        setSuccessCount(0);
        setFailCount(0);
        setTotalFiles(files.length);

        let sCount = 0;
        let fCount = 0;

        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) throw new Error('Authentication required');

            // Process each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // 1. Upload the file
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('category', 'LAYER_1_MANUALS');
                    formData.append('subcategory', type);

                    const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/uploads/?category=LAYER_1_MANUALS&subcategory=${type}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!uploadResponse.ok) {
                        const errorData = await uploadResponse.json();
                        throw new Error(errorData.detail || `Failed to upload ${file.name}`);
                    }

                    const { url } = await uploadResponse.json();
                    
                    // 2. Create the manual record
                    const manualData = {
                        title: files.length > 1 ? file.name.replace(/\.[^/.]+$/, "") : (title || file.name.replace(/\.[^/.]+$/, "")),
                        manual_type: type,
                        version,
                        description,
                        file_url: url
                    };

                    const response = await documentService.createManual(manualData);
                    
                    if (response.error) {
                        console.error(`Failed to create manual record for ${file.name}:`, response.error);
                        fCount++;
                        setFailCount(fCount);
                    } else {
                        sCount++;
                        setSuccessCount(sCount);
                    }
                } catch (err) {
                    console.error(`Error processing ${file.name}:`, err);
                    fCount++;
                    setFailCount(fCount);
                }
            }

            if (sCount > 0) {
                toast.success(`Successfully uploaded ${sCount} manual(s)${fCount > 0 ? `. ${fCount} failed.` : ''}`);
                onSuccess();
                if (fCount === 0) {
                    onOpenChange(false);
                    resetForm();
                }
            } else {
                toast.error('All uploads failed. Please check logs.');
            }
        } catch (error) {
            console.error('Batch upload failed:', error);
            toast.error(error instanceof Error ? error.message : 'Batch upload failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setType(ManualType.FPM);
        setVersion('1.0');
        setDescription('');
        setFiles(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Manuals</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {(!files || files.length <= 1) && (
                        <div className="space-y-2">
                            <Label htmlFor="title">Title {files && files.length === 1 ? '*' : '(Optional if batch)'}</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                placeholder="e.g. Fleet Operations Manual"
                                required={files?.length === 1}
                            />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Manual Type *</Label>
                            <Select value={type} onValueChange={(v: string) => setType(v as ManualType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ManualType.FPM}>FPM (Fleet)</SelectItem>
                                    <SelectItem value={ManualType.SMM}>SMM (Safety)</SelectItem>
                                    <SelectItem value={ManualType.CPM}>CPM (Company)</SelectItem>
                                    <SelectItem value={ManualType.OTHER}>Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="version">Version *</Label>
                            <Input
                                id="version"
                                value={version}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVersion(e.target.value)}
                                placeholder="1.0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                            placeholder="Briefly describe the contents..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">Files * (Multiple allowed)</Label>
                        <div className="flex flex-col gap-2">
                            <Input
                                id="file"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                multiple
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiles(e.target.files)}
                                required
                                className="cursor-pointer"
                            />
                            {files && files.length > 0 && (
                                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                    Selected {files.length} file(s)
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading ({successCount + failCount}/{files?.length})...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload {files && files.length > 1 ? `${files.length} Manuals` : 'Manual'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
