// Mimics real auth endpoints (POST /api/auth/register, /login, etc).
// Since there's no real backend yet, registered users live in a small
// localStorage "table" so register → login actually works end-to-end for
// a demo/client preview. Swap the body of each function for a real
// apiPost/apiGet call later — callers already treat everything here as
// async and already handle errors, so no page needs to change.

const USERS_KEY = "daalbhat_users_db";
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// Seeded so you can explore the Admin Panel immediately without manually
// creating an admin account. Change this password before showing the site
// to anyone outside your team.
const SEED_ADMIN = {
  id: "u_admin_seed",
  name: "Admin",
  email: "admin@daalbhat.com",
  phone: "0000000000",
  password: "admin123",
  role: "admin",
  blocked: false,
  addresses: [],
  createdAt: new Date().toISOString(),
};

function loadUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    if (!Array.isArray(parsed)) {
      saveUsers([SEED_ADMIN]);
      return [SEED_ADMIN];
    }
    // Make sure the seed admin always exists, even if localStorage was
    // populated before this feature existed.
    if (!parsed.some((u) => u.id === SEED_ADMIN.id)) {
      const withAdmin = [...parsed, SEED_ADMIN];
      saveUsers(withAdmin);
      return withAdmin;
    }
    return parsed;
  } catch {
    return [SEED_ADMIN];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // Storage unavailable — registration won't persist across a refresh,
    // but still works for the current session.
  }
}

const publicUser = ({ password, ...rest }) => rest; // never return password fields

/** POST /api/auth/register */
export async function register({ name, email, phone, password }) {
  await delay();

  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }

  const user = {
    id: `u_${Date.now()}`,
    name,
    email,
    phone,
    password, // demo only — a real backend would hash this, never store as-is
    role: "customer",
    blocked: false,
    addresses: [],
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  return { user: publicUser(user), token: `demo-token-${user.id}` };
}

/** POST /api/auth/login */
export async function login({ email, password }) {
  await delay();

  const users = loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    throw new Error("Incorrect email or password.");
  }
  if (user.blocked) {
    throw new Error("This account has been suspended. Contact support for help.");
  }

  return { user: publicUser(user), token: `demo-token-${user.id}` };
}

/** GET /api/auth/me — used to restore a session on page load */
export async function getCurrentUser(userId) {
  await delay(200);
  const user = loadUsers().find((u) => u.id === userId);
  if (!user || user.blocked) throw new Error("Session expired.");
  return publicUser(user);
}

/** PATCH /api/auth/me */
export async function updateProfile(userId, updates) {
  await delay();
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("User not found.");

  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  return publicUser(users[index]);
}

/** POST /api/auth/change-password */
export async function changePassword(userId, currentPassword, newPassword) {
  await delay();
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("User not found.");
  if (users[index].password !== currentPassword) {
    throw new Error("Current password is incorrect.");
  }

  users[index] = { ...users[index], password: newPassword };
  saveUsers(users);
  return { success: true };
}

/** POST /api/auth/forgot-password — no real email in this demo */
export async function requestPasswordReset(email) {
  await delay();
  const exists = loadUsers().some((u) => u.email.toLowerCase() === email.toLowerCase());
  // Always resolve successfully either way — real apps shouldn't reveal
  // whether an email is registered, to avoid leaking account existence.
  return { success: true, exists };
}

// ---- Admin: customer management ----

/** GET /api/admin/customers */
export async function getAllUsers() {
  await delay(300);
  return loadUsers().map(publicUser);
}

/** PATCH /api/admin/customers/:id/block */
export async function setUserBlocked(userId, blocked) {
  await delay();
  const users = loadUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error("User not found.");
  users[index] = { ...users[index], blocked };
  saveUsers(users);
  return publicUser(users[index]);
}
