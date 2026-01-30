import { auth, API_BASE_URL } from '../firebase';
import {
    Manual, ManualType,
    FormTemplate, FormCategory,
    FormSubmission, FormStatus,
    TriggerWorkRequest
} from '../types/documents';

const API_URL = API_BASE_URL + '/api/v1';

interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

const getAuthToken = async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await user.getIdToken();
    } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
    }
};

const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    try {
        const token = await getAuthToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {}),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        return {
            data: response.ok ? data : undefined,
            error: response.ok ? undefined : data.detail || 'An error occurred',
            status: response.status,
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Network error',
            status: 0,
        };
    }
};

export const documentService = {
    // --- Manuals ---
    getManuals: async (type?: ManualType) => {
        const queryParams = new URLSearchParams();
        if (type) queryParams.append('type', type);
        const qs = queryParams.toString();
        return apiRequest<Manual[]>(`/documents/manuals${qs ? `?${qs}` : ''}`);
    },

    createManual: async (data: any) => {
        return apiRequest<Manual>('/documents/manuals', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // --- Templates ---
    getTemplates: async (category?: FormCategory) => {
        const queryParams = new URLSearchParams();
        if (category) queryParams.append('category', category);
        const qs = queryParams.toString();
        return apiRequest<FormTemplate[]>(`/documents/templates${qs ? `?${qs}` : ''}`);
    },

    getTemplate: async (id: string) => {
        return apiRequest<FormTemplate>(`/documents/templates/${id}`);
    },

    createTemplate: async (data: Omit<FormTemplate, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
        return apiRequest<FormTemplate>('/documents/templates', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // --- Submissions ---
    getSubmissions: async (params?: { vessel_id?: string; status?: FormStatus; template_id?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.vessel_id) queryParams.append('vessel_id', params.vessel_id);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.template_id) queryParams.append('template_id', params.template_id);
        const qs = queryParams.toString();
        return apiRequest<FormSubmission[]>(`/documents/submissions${qs ? `?${qs}` : ''}`);
    },

    triggerWork: async (data: TriggerWorkRequest) => {
        return apiRequest<FormSubmission[]>('/documents/trigger-work', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    updateSubmission: async (id: string, data: Partial<FormSubmission>) => {
        return apiRequest<FormSubmission>(`/documents/submissions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    approveSubmission: async (id: string) => {
        return apiRequest<FormSubmission>(`/documents/submissions/${id}/approve`, {
            method: 'POST'
        });
    }
};
