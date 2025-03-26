import { RegistrationContext } from "@/context/RegistrationContext";
import { useContext } from "react";

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error(
      "useRegistration must be used within a RegistrationProvider"
    );
  }
  return context;
};
