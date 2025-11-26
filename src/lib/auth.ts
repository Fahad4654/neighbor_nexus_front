

import _ from 'lodash';
import { api } from './api';


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

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    } catch (e) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
  }

  const data = await response.json();


  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  if (data.user) {
    // The user object from the API now contains the profile.
    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.user.profile && data.user.profile.avatarUrl) {
      try {
        const avatarResponse = await fetch(`${backendUrl}${data.user.profile.avatarUrl}`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`
          }
        });
        if (avatarResponse.ok) {
          const blob = await avatarResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            localStorage.setItem('avatarImage', reader.result as string);
            // Dispatch a storage event to notify other components of the change
            window.dispatchEvent(new Event('storage'));
          };
          reader.readAsDataURL(blob);
        } else {
           // If fetching avatar fails, remove any old one
           localStorage.removeItem('avatarImage');
           window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error("Failed to fetch and store avatar", e);
        localStorage.removeItem('avatarImage');
        window.dispatchEvent(new Event('storage'));
      }
    } else {
      // If no avatarUrl is present, ensure any old avatar is removed
      localStorage.removeItem('avatarImage');
      window.dispatchEvent(new Event('storage'));
    }
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
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (refreshToken) {
    try {
      // The `api` function will handle the backend URL and auth headers
      await api('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      // Even if server-side logout fails, proceed with client-side cleanup.
      console.error('Server logout failed, proceeding with client cleanup:', error);
    }
  }

  // Clear all local session data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('avatarImage');
  
  // Dispatch event to notify other tabs/components
  window.dispatchEvent(new Event('storage'));
}


export function getLoggedInUser() {
  if (typeof window === 'undefined') {
    return null;
  }
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export async function fetchUserProfile(userId: string) {
    const data = await api(`/users/${userId}`);
    if (data.user && data.profile) {
        return { ...data.user, profile: data.profile };
    }
    return data;
}


export async function fetchAllUsers() {
    const data = await api('/users/all', {
      method: 'POST',
      body: JSON.stringify({
        order: 'createdAt',
        asc: 'DESC',
        page: 1,
        pageSize: 10,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data.usersList.data;
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
      // If refresh fails, log out the user
      await logout(); 
      window.location.href = '/login';
      throw new Error(data.message || 'Session expired. Please log in again.');
    }

    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }

    return data;
  } catch (error) {
    // Ensure logout happens even if fetch itself fails
    await logout();
    window.location.href = '/login';
    throw error;
  }
}


export async function updateUser(
    userId: string, 
    updateType: 'core' | 'profile',
    data: any
) {
    let endpoint = '';
    let payload: any = {};

    if (updateType === 'core') {
        endpoint = `/users`;
        payload = {
            id: userId,
            ...data,
            updatedBy: userId
        };
    } else if (updateType === 'profile') {
        endpoint = `/profile`;
         payload = {
            userId: userId,
            ...data
        };
    } else {
        throw new Error("Invalid update type specified");
    }

    const updatedData = await api(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
    });
    
    // Update local storage
    const storedUser = getLoggedInUser();
    if (storedUser) {
        if (updateType === 'core' && updatedData.user) {
            const updatedUser = { ...storedUser, ..._.omit(updatedData.user, 'profile') };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } else if (updateType === 'profile' && updatedData.profile) {
            const updatedUser = { ...storedUser, profile: { ...storedUser.profile, ...updatedData.profile } };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    }

    return updatedData;
}

export async function uploadAvatar(userId: string, file: File) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  const formData = new FormData();
  formData.append('profile_pic', file);
  formData.append('userId', userId);

  // We use the api function here, but note that it sets Content-Type to application/json by default
  // so we need to remove it to let the browser set the correct multipart/form-data header.
  const result = await api('/profile/upload-avatar', {
    method: 'POST',
    body: formData,
    headers: {
        // Let the browser set the Content-Type for FormData
        'Content-Type': undefined, 
    }
  });


  if (result.profile && result.profile.avatarUrl) {
    const user = getLoggedInUser();
    if (user) {
        const updatedProfile = { ...user.profile, ...result.profile };
        const updatedUser = { ...user, profile: updatedProfile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      const avatarResponse = await fetch(`${backendUrl}${result.profile.avatarUrl}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (avatarResponse.ok) {
        const blob = await avatarResponse.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem('avatarImage', reader.result as string);
          window.dispatchEvent(new Event('storage'));
        };
        reader.readAsDataURL(blob);
      }
    } catch (e) {
      console.error("Failed to fetch and store new avatar", e);
    }
  }

  return result;
}