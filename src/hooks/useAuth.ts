import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { authHelpers, db } from "../lib/firebase";
import { AuthState, User } from "../types";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          username: firebaseUser.displayName || "",
          displayName: firebaseUser.displayName || "",
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date(),
        };
        setAuthState({ user, isLoading: false, error: null });
      } else {
        setAuthState({ user: null, isLoading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    const { error } = await authHelpers.signIn(email, password);
    if (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    const { user, error } = await authHelpers.signUp(email, password, username);
    if (error) {
      console.log({ error });
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }

    console.log({ signUp: user });

    await setDoc(doc(db, "users", user?.uid || ""), {
      uid: user?.uid,
      email: user?.email,
      username,
      createdAt: new Date().toISOString(),
    });

    setAuthState((prev) => ({ ...prev, isLoading: false }));
  };

  const signOut = async () => {
    const { error } = await authHelpers.signOut();
    if (error) {
      setAuthState((prev) => ({ ...prev, error: error.message }));
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
