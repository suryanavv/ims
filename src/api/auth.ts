import { API_BASE_URL } from './config';

// Token storage key for sessionStorage
const TOKEN_STORAGE_KEY = 'ims_access_token';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  clinic_id?: number | null;
  clinic_name?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}

export const authAPI = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Required to receive cookies from backend
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail?.[0]?.msg || error.detail || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    
    // Store access token in sessionStorage
    if (data.access_token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    }
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('userRole', data.role);
    
    return data;
  },

  /**
   * Initiate Microsoft OAuth login
   */
  async initiateMicrosoftLogin(): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/microsoft/initiate?email=login`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to initiate Microsoft login' }));
      throw new Error(error.detail || 'Failed to initiate Microsoft login');
    }

    const data = await response.json();
    return data.auth_url;
  },

  /**
   * Initiate Google OAuth login
   */
  async initiateGoogleLogin(): Promise<string> {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/google/initiate?email=login`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to initiate Google login' }));
      throw new Error(error.detail || 'Failed to initiate Google login');
    }

    const data = await response.json();
    return data.auth_url;
  },

  /**
   * Get current access token
   */
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  },

  /**
   * Refresh access token using refresh token cookie
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data: RefreshTokenResponse = await response.json();

      if (data.access_token) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        return data.access_token;
      }

      return null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Get stored user data
   */
  getUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get user role
   */
  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  },

  /**
   * Logout - clear tokens and user data
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }
    
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },

  /**
   * Launch external service via SSO using current IMS session
   */
  async launchSSO(serviceName: string): Promise<void> {
    // Ensure we have a valid access token (try refresh if needed)
    let token = this.getToken();
    if (!token) {
      token = await this.refreshToken();
    }

    if (!token) {
      throw new Error('Not authenticated. Please login again.');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/auth/sso-redirect?service=${encodeURIComponent(serviceName)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to get SSO redirect URL' }));
      throw new Error(error.detail || 'Failed to get SSO redirect URL');
    }

    const data = await response.json();
    if (data.redirect_url) {
      window.open(data.redirect_url, '_blank', 'noopener');
    } else {
      throw new Error('SSO redirect URL not provided by server');
    }
  },
};

