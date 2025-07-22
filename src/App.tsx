import React, { useState } from "react";
import { AuthForm } from "./components/Auth/AuthForm";
import { ChatInterface } from "./components/Chat/ChatInterface";
import { useAuth } from "./hooks/useAuth";

function App() {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { user, isLoading, error, signIn, signUp, signOut } = useAuth();

  const handleAuthSubmit = async (
    email: string,
    password: string,
    username?: string
  ) => {
    if (authMode === "signin") {
      await signIn(email, password);
    } else {
      await signUp(email, password, username || "");
    }
  };


  const toggleAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuthSubmit}
        onToggleMode={toggleAuthMode}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return <ChatInterface currentUser={user} onSignOut={signOut} />;
}

export default App;
