
export async function login(identifier: string, password: string): Promise<any> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL is not configured');
  }

  const response = await fetch(`${backendUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  if (data.user) {
    // Store basic user data. The full profile will be fetched by the UI when needed.
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export async function register(userData: any): Promise<any> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('Backend URL is not configured');
    }
  
    const payload = {
      ...userData,
    };

    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
  
    return data;
  }

export async function verifyOtp(identifier: string, otp: string): Promise<any> {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        throw new Error('Backend URL is not configured');
    }

    const response = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
    }

    return data;
}

export async function requestPasswordReset(identifier: string): Promise<any> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL is not configured');
  }

  const response = await fetch(`${backendUrl}/auth/request-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to request password reset');
  }
  return data;
}

export async function resetPassword(identifier: string, newPassword: string): Promise<any> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL is not configured');
  }

  const response = await fetch(`${backendUrl}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, newPassword }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to reset password');
  }
  return data;
}


export async function logout() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.error('Backend URL is not configured');
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken && backendUrl) {
    try {
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout failed on the server:', error);
    }
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getLoggedInUser() {
  if (typeof window === 'undefined') {
    return null;
  }
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export async function fetchUserProfile(userId: string, token: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        throw new Error('Backend URL not configured');
    }
    const response = await fetch(`${backendUrl}/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data.profile;
}


export async function refreshToken(): Promise<any> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL is not configured');
  }

  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (!storedRefreshToken) {
    return Promise.reject('No refresh token found');
  }

  try {
    const response = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      await logout();
      window.location.href = '/login';
      throw new Error(data.message || 'Session expired. Please log in again.');
    }

    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }

    return data;
  } catch (error) {
    await logout();
    window.location.href = '/login';
    throw error;
  }
}
