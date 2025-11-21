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
    localStorage.setItem('user', JSON.stringify(data.user));
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
