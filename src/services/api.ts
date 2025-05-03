
import { User, UserRole } from '@/contexts/AuthContext';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper to create headers with authentication
const authHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string): Promise<{ token: string, user: User }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    return data;
  },
  
  register: async (name: string, email: string, password: string, role: UserRole): Promise<{ token: string, user: User }> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });
    
    const data = await handleResponse(response);
    return data;
  },
  
  logout: async (): Promise<void> => {
    await fetch(`${API_URL}/auth/logout`, {
      headers: authHeaders(),
    });
    
    // Clear local storage on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
};

// Tender API calls
export const tenderAPI = {
  getAllTenders: async (filters = {}): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value as string);
    });
    
    const response = await fetch(`${API_URL}/tenders?${queryParams}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getTenderById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/tenders/${id}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  createTender: async (tenderData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/tenders`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(tenderData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  updateTender: async (id: string, tenderData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/tenders/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(tenderData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  deleteTender: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tenders/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    
    await handleResponse(response);
  },
  
  getTenderSubmissions: async (tenderId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/tenders/${tenderId}/submissions`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  publishWinner: async (tenderId: string, submissionId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/tenders/${tenderId}/winner`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ submissionId }),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getTenderDisputes: async (tenderId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/tenders/${tenderId}/disputes`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
};

// Submission API calls
export const submissionAPI = {
  getAllSubmissions: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/submissions`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getSubmissionById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/submissions/${id}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  createSubmission: async (submissionData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(submissionData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  updateSubmission: async (id: string, submissionData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(submissionData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  deleteSubmission: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    
    await handleResponse(response);
  },
  
  rejectSubmission: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/submissions/${id}/reject`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  updateRankings: async (tenderId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/submissions/update-rankings`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ tenderId }),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
};

// Evaluation API calls
export const evaluationAPI = {
  getAllEvaluations: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/evaluations`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getEvaluationById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/evaluations/${id}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  createEvaluation: async (evaluationData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/evaluations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(evaluationData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  updateEvaluation: async (id: string, evaluationData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/evaluations/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(evaluationData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getSubmissionEvaluations: async (submissionId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/evaluations/submission/${submissionId}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
};

// Dispute API calls
export const disputeAPI = {
  getAllDisputes: async (filters = {}): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value as string);
    });
    
    const response = await fetch(`${API_URL}/disputes?${queryParams}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getDisputeById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/disputes/${id}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  createDispute: async (disputeData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/disputes`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(disputeData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  updateDisputeStatus: async (id: string, status: 'accepted' | 'rejected', responseText: string): Promise<any> => {
    const response = await fetch(`${API_URL}/disputes/${id}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status, responseText }),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
};

// User API calls
export const userAPI = {
  getAllUsers: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/users`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getUserById: async (id: string): Promise<any> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  getUsersByRole: async (role: UserRole): Promise<any> => {
    const response = await fetch(`${API_URL}/users/role/${role}`, {
      headers: authHeaders(),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  createUser: async (userData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(userData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  updateUser: async (id: string, userData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(userData),
    });
    
    const data = await handleResponse(response);
    return data.data;
  },
  
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    
    await handleResponse(response);
  },
};

export default {
  auth: authAPI,
  tenders: tenderAPI,
  submissions: submissionAPI,
  evaluations: evaluationAPI,
  disputes: disputeAPI,
  users: userAPI,
};
