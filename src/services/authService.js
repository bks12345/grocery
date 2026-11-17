import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Friendly error message converter for Firebase Auth
export function getAuthErrorMessage(err) {
  if (!err) return "An unexpected error occurred. Please try again.";
  const code = err.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please double check and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please log in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a few minutes before trying again.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before completing.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups.";
    default:
      return err.message || "Authentication error. Please try again.";
  }
}

// Helper to sanitize and format user object
function formatUser(uid, authUser, profileData = {}) {
  return {
    id: uid,
    uid: uid,
    name: profileData.name || authUser?.displayName || "User",
    email: authUser?.email || profileData.email || "",
    phone: profileData.phone || authUser?.phoneNumber || "",
    role: profileData.role || "customer",
    blocked: !!profileData.blocked,
    createdAt: profileData.createdAt || new Date().toISOString(),
    addresses: profileData.addresses || [],
    ...profileData,
  };
}

export async function register({ name, email, password, phone = "" }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    if (name) {
      try {
        await updateFirebaseProfile(fbUser, { displayName: name });
      } catch {}
    }

    const userData = {
      id: fbUser.uid,
      name: name || fbUser.displayName || "User",
      email: fbUser.email.toLowerCase().trim(),
      phone: phone || "",
      role: "customer",
      blocked: false,
      createdAt: new Date().toISOString(),
      addresses: [],
    };

    await setDoc(doc(db, "users", fbUser.uid), userData);
    return { user: userData };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function login({ email, password }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    const userDocRef = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    let profileData = {};
    if (userDoc.exists()) {
      profileData = userDoc.data();
    } else {
      profileData = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split("@")[0],
        email: fbUser.email,
        role: "customer",
        blocked: false,
        createdAt: new Date().toISOString(),
        addresses: [],
      };
      await setDoc(userDocRef, profileData);
    }

    if (profileData.blocked) {
      await signOut(auth);
      throw new Error("This account has been suspended. Contact support for help.");
    }

    const user = formatUser(fbUser.uid, fbUser, profileData);
    return { user };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;

    const userDocRef = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    let profileData = {};
    if (userDoc.exists()) {
      profileData = userDoc.data();
    } else {
      profileData = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
        email: fbUser.email || "",
        phone: fbUser.phoneNumber || "",
        role: "customer",
        blocked: false,
        createdAt: new Date().toISOString(),
        addresses: [],
      };
      await setDoc(userDocRef, profileData);
    }

    if (profileData.blocked) {
      await signOut(auth);
      throw new Error("This account has been suspended. Contact support for help.");
    }

    const user = formatUser(fbUser.uid, fbUser, profileData);
    return { user };
  } catch (err) {
    if (err.code === "auth/popup-closed-by-user") {
      const cancellationErr = new Error("Google sign-in was closed.");
      cancellationErr.code = "auth/popup-closed-by-user";
      throw cancellationErr;
    }
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function adminLogin({ email, password }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    const userDocRef = doc(db, "users", fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
      await signOut(auth);
      throw new Error("Access Denied: This portal is for Administrators only.");
    }

    const profileData = userDoc.data();
    if (profileData.blocked) {
      await signOut(auth);
      throw new Error("This admin account has been suspended.");
    }

    const user = formatUser(fbUser.uid, fbUser, profileData);
    return { user };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      unsubscribe();
      if (!fbUser) {
        return resolve(null);
      }
      try {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data();
          if (profile.blocked) {
            await signOut(auth);
            return resolve(null);
          }
          return resolve(formatUser(fbUser.uid, fbUser, profile));
        }
        return resolve(formatUser(fbUser.uid, fbUser));
      } catch {
        resolve(formatUser(fbUser.uid, fbUser));
      }
    }, reject);
  });
}

export async function updateProfile(userId, updates) {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, updates);
    const updatedDoc = await getDoc(userDocRef);
    return formatUser(userId, auth.currentUser, updatedDoc.data());
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function requestPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true, message: "Password reset link sent to your email." };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user.");
    const { updatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

// ---- Admin: customer management ----
export async function getAllUsers() {
  try {
    const usersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
    return usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function setUserBlocked(userId, blocked) {
  try {
    await updateDoc(doc(db, "users", userId), { blocked });
    return { success: true };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}

export async function setUserRole(userId, role) {
  try {
    await updateDoc(doc(db, "users", userId), { role });
    return { success: true };
  } catch (err) {
    throw new Error(getAuthErrorMessage(err));
  }
}
