import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'User' | 'Admin';
  is_active: boolean;
  date_joined: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  constraints: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  starter_code?: string;
  created_by: number;
}

export interface TestCase {
  id: number;
  problem: number;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
}

export interface Submission {
  id: number;
  problem: number | Problem;
  user: number;
  code: string;
  language: string;
  verdict: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error' | 'Memory Limit Exceeded';
  execution_time?: number;
  memory?: number;
  submitted_at: string;
  evaluated_at?: string;
  error_message?: string;
  test_cases_passed?: number;
  total_test_cases?: number;
}

export interface ContestSubmission {
  id: number;
  contest: {
    id: number;
    title: string;
  };
  participant: {
    id: number;
    user: {
      id: number;
      username: string;
    };
  };
  problem: number | Problem;
  code: string;
  language: string;
  verdict: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Compilation Error' | 'Runtime Error' | 'Memory Limit Exceeded';
  execution_time?: number;
  memory?: number;
  submitted_at: string;
  evaluated_at?: string;
  error_message?: string;
  test_cases_passed?: number;
  total_test_cases?: number;
  score: number;
}

export interface AIAssistantLog {
  id: number;
  user: number;
  problem?: number;
  query: string;
  response: string;
  created_at: string;
}

// API Functions
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/users/login/', { username, password }),
  
  register: (username: string, email: string, password: string, confirmPassword: string) =>
    api.post('/users/register/', { username, email, password, confirm_password: confirmPassword }),
  
  logout: () => api.post('/users/logout/'),
  
  getProfile: () => api.get('/users/profile/'),
  
  updateProfile: (data: any) => api.put('/users/profile/update/', data),
};

export const problemsAPI = {
  getProblems: (params?: { difficulty?: string; tags?: string }) =>
    api.get('/problems/', { params }),
  
  getProblem: (id: number) => api.get(`/problems/${id}/`),
  
  createProblem: (problem: Omit<Problem, 'id' | 'created_by'>) =>
    api.post('/problems/', problem),
  
  updateProblem: (id: number, problem: Partial<Problem>) =>
    api.put(`/problems/${id}/`, problem),
  
  deleteProblem: (id: number) => api.delete(`/problems/${id}/`),
};

export const submissionsAPI = {
  submitSolution: (problemId: number, code: string, language: string) =>
    api.post('/submissions/create/', { problem: problemId, code, language }),
  
  getSubmissions: (params?: { problem?: number; user?: number; verdict?: string }) =>
    api.get('/submissions/', { params }),
  
  getSubmission: (id: number) => api.get(`/submissions/${id}/`),
  
  runTest: (problemId: number, code: string, language: string) =>
    api.post('/submissions/run-test/', { problem_id: problemId, code, language }),
  
  onlineCompiler: (code: string, language: string, input: string, timeout?: number) =>
    api.post('/online-compiler/', { code, language, input, timeout }),
};

export const leaderboardAPI = {
  getLeaderboard: (params?: { problem?: number }) =>
    api.get('/submissions/leaderboard/', { params }),
  
  getSubmissionStats: () => api.get('/submissions/stats/'),
};

export const aiAssistantAPI = {
  sendMessage: (query: string, problemId?: number, code?: string) =>
    api.post('/ai-assistant/chat/', { query, problem_id: problemId, code }),
  
  getHistory: (problemId?: number) =>
    api.get('/ai-assistant/logs/', { params: { problem: problemId } }),
  
  getStats: () => api.get('/ai-assistant/stats/'),
};

export const contestsAPI = {
  getContests: (params?: { status?: string }) =>
    api.get('/contests/', { params }),
  
  getContest: (id: number) => api.get(`/contests/${id}/`),
  
  registerForContest: (contestId: number) =>
    api.post(`/contests/${contestId}/register/`),
  
  getContestProblems: (contestId: number) =>
    api.get(`/contests/${contestId}/problems/`),
  
  getContestLeaderboard: (contestId: number) =>
    api.get(`/contests/${contestId}/leaderboard/`),
  
  getContestSubmissions: (contestId: number) =>
    api.get(`/contests/${contestId}/submissions/`),
  
  getUserContestSubmissions: (contestId?: number) =>
    api.get('/contests/submissions/', { params: { contest: contestId } }),
  
  submitContestSolution: (contestId: number, problemId: number, code: string, language: string) =>
    api.post(`/contests/${contestId}/submissions/create/`, { problem: problemId, code, language }),
};