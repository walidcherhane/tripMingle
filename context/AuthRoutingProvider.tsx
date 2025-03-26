import React, { createContext, useContext, ReactNode } from "react";
import { useAuthRouting } from "@/hooks/useAuthRouting";
import { UserProfile } from "@/utils/authRouting";

interface AuthRoutingContextType {
  currentUser: UserProfile | null | undefined;
  isAppropriate: boolean;
  isRedirecting: boolean;
}

const AuthRoutingContext = createContext<AuthRoutingContextType | undefined>(
  undefined
);

interface AuthRoutingProviderProps {
  children: ReactNode;
  skipRouting?: boolean;
  authCheckOnly?: boolean;
  checkOnly?: boolean;
}

/**
 * Provider component for auth routing
 * Handles routing logic and provides user data to children
 */
export function AuthRoutingProvider({
  children,
  skipRouting,
  authCheckOnly,
  checkOnly,
}: AuthRoutingProviderProps) {
  const { currentUser, isAppropriate, isRedirecting } = useAuthRouting({
    skipRouting,
    authCheckOnly,
    checkOnly,
  });

  return (
    <AuthRoutingContext.Provider
      value={{ currentUser, isAppropriate, isRedirecting }}
    >
      {children}
    </AuthRoutingContext.Provider>
  );
}

/**
 * Hook to access auth routing context
 */
export function useAuthRoutingContext() {
  const context = useContext(AuthRoutingContext);
  if (context === undefined) {
    throw new Error(
      "useAuthRoutingContext must be used within an AuthRoutingProvider"
    );
  }
  return context;
}
