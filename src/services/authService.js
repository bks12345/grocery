import { apiGet, apiPost, apiPatch } from './apiClient';

export async function register(data) {
  try {
    const res = await apiPost('/api/auth/register', data);
    return res;
  } catch (err) {
    console.error('[authService] Register API failed:', err.message);
    throw err;
  }
}

export async function login(data) {
  try {
    const res = await apiPost('/api/auth/login', data);
    return res;
  } catch (err) {
    console.error('[authService] Login API failed:', err.message);
    throw err;
  }
}

export async function adminLogin(data) {
  try {
    const res = await apiPost('/api/auth/admin-login', data);
    return res;
  } catch (err) {
    console.error('[authService] Admin login API failed:', err.message);
    throw err;
  }
}

export async function logout() {
  try {
    const res = await apiPost('/api/auth/logout');
    return res;
  } catch (err) {
    console.error('[authService] Logout API failed:', err.message);
    throw err;
  }
}

export async function getCurrentUser() {
  try {
    const res = await apiGet('/api/auth/me');
    return res;
  } catch (err) {
    console.warn('[authService] GetMe API failed or session missing:', err.message);
    throw err;
  }
}

export async function updateProfile(userId, updates) {
  try {
    const res = await apiPatch('/api/auth/me', updates);
    return res;
  } catch (err) {
    console.error('[authService] UpdateProfile API failed:', err.message);
    throw err;
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  try {
    const res = await apiPost('/api/auth/change-password', { currentPassword, newPassword });
    return res;
  } catch (err) {
    console.error('[authService] ChangePassword API failed:', err.message);
    throw err;
  }
}

export async function requestPasswordReset(email) {
  try {
    const res = await apiPost('/api/auth/forgot-password', { email });
    return res;
  } catch (err) {
    console.error('[authService] ForgotPassword API failed:', err.message);
    throw err;
  }
}

export async function resetPassword(email, otp, newPassword) {
  try {
    const res = await apiPost('/api/auth/reset-password', { email, otp, newPassword });
    return res;
  } catch (err) {
    console.error('[authService] ResetPassword API failed:', err.message);
    throw err;
  }
}

// ---- Admin: customer management ----
export async function getAllUsers() {
  try {
    const res = await apiGet('/api/admin/customers');
    return res;
  } catch (err) {
    console.error('[authService] Admin customers API failed:', err.message);
    throw err;
  }
}

export async function setUserBlocked(userId, blocked) {
  try {
    const res = await apiPatch(`/api/admin/customers/${userId}/block`, { blocked });
    return res;
  } catch (err) {
    console.error('[authService] Block customer API failed:', err.message);
    throw err;
  }
}

export async function setUserRole(userId, role) {
  try {
    const res = await apiPatch(`/api/admin/customers/${userId}/role`, { role });
    return res;
  } catch (err) {
    console.error('[authService] Change user role API failed:', err.message);
    throw err;
  }
}
