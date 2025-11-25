
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
    const { profile, ...restOfUser } = data.user;
    // Make sure user.id is not overwritten by profile.id
    const { id: profileId, ...profileData } = profile || {};
    const completeUser = { ...restOfUser, ...profileData };
    localStorage.setItem('user', JSON.stringify(completeUser));

    // Fetch and store avatar as base64
    if (completeUser?.avatarUrl) {
      try {
        const avatarResponse = await fetch(`${backendUrl}${completeUser.avatarUrl}`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`
          }
        });
        if (avatarResponse.ok) {
          const blob = await avatarResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            localStorage.setItem('avatarImage', reader.result as string);
            window.dispatchEvent(new Event('storage'));
          };
          reader.readAsDataURL(blob);
        } else {
           localStorage.removeItem('avatarImage');
           window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error("Failed to fetch and store avatar", e);
        localStorage.removeItem('avatarImage');
        window.dispatchEvent(new Event('storage'));
      }
    } else {
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
  localStorage.removeItem('avatarImage');
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user profile');
    }

    const data = await response.json();
    const { profile, ...restOfUser } = data;
    return { ...restOfUser, ...profile };
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

export async function updateUserProfile(userId: string, token: string, profileData: any) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        throw new Error('Backend URL not configured');
    }

    const response = await fetch(`${backendUrl}/users/${userId}/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Could not update profile.");
    }
    
    const updatedData = await response.json();

    // After updating, if there's a new avatar, re-fetch and store it.
    if (updatedData.user?.profile?.avatarUrl) {
         try {
            const avatarResponse = await fetch(`${backendUrl}${updatedData.user.profile.avatarUrl}`, {
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
            console.error("Failed to fetch and store updated avatar", e);
          }
    }
    
    return updatedData;
}

export async function uploadAvatar(userId: string, token: string, file: File) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  const formData = new FormData();
  formData.append('profile_pic', file);
  formData.append('userId', userId);

  const response = await fetch(`${backendUrl}/profile/upload-avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Could not upload avatar.');
  }

  const result = await response.json();

  // The API response contains the updated profile object with the new avatarUrl
  if (result.profile && result.profile.avatarUrl) {
    const user = getLoggedInUser();
    if (user) {
       const {id: profileId, ...profileData} = result.profile;
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    // Re-fetch and store the new avatar image
    try {
      const avatarResponse = await fetch(`${backendUrl}${result.profile.avatarUrl}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (avatarResponse.ok) {
        const blob = await avatarResponse.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem('avatarImage', reader.result as string);
          // This event tells other components (like UserNav) to update their state
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
