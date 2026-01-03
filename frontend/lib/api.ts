const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Token management
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

const removeToken = (): void => {
  localStorage.removeItem("token");
};

const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Claim {
  id: string;
  claim: string;
  status: "verified" | "uncertain" | "hallucinated";
  confidence: number;
  explanation: string;
  evidence: Array<{
    source: string;
    verdict: string;
    url?: string;
  }>;
}

export interface Source {
  title: string;
  url: string;
  verified?: boolean;
  suspicious?: boolean;
}

export interface AnalysisResult {
  analysisId: string;
  score: number;
  label: string;
  claims: Claim[];
  sources: Source[];
  verifiedText: string;
  summary: string;
}

export interface Report {
  id: string;
  title: string;
  timestamp: string;
  score: number;
  status: string;
  label: string;
}

// Auth API
export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(error.message || "Registration failed");
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(error.message || "Login failed");
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

export async function getMe(): Promise<{ user: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    removeToken();
    throw new Error("Not authenticated");
  }

  return response.json();
}

export function logout(): void {
  removeToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// Verification API
export async function analyzeText(text: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/verification/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Analysis failed" }));
    throw new Error(error.message || "Analysis failed");
  }

  return response.json();
}

export async function getClaims(analysisId: string): Promise<Claim[]> {
  const response = await fetch(`${API_BASE_URL}/verification/${analysisId}/claims`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch claims");
  }

  return response.json();
}

export async function getClaimEvidence(claimId: string) {
  const response = await fetch(`${API_BASE_URL}/verification/claim/${claimId}/evidence`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch evidence");
  }

  return response.json();
}

export async function getVerifiedText(analysisId: string) {
  const response = await fetch(`${API_BASE_URL}/verification/${analysisId}/verified-text`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch verified text");
  }

  return response.json();
}

// Reports API
export async function getReports(): Promise<Report[]> {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Please login to view reports");
    }
    throw new Error("Failed to fetch reports");
  }

  return response.json();
}

export async function getReportById(id: string): Promise<AnalysisResult & { originalText: string; createdAt: string }> {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }

  return response.json();
}

export async function deleteReport(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete report");
  }
}
