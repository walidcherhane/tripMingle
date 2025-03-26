import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegistrationForm } from "@/lib/schemas/registration";

interface RegistrationContextType {
  formData: Partial<RegistrationForm>;
  updateFormData: (step: keyof RegistrationForm, data: any) => Promise<void>;
  clearFormData: () => Promise<void>;
  isLoading: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const RegistrationContext = createContext<
  RegistrationContextType | undefined
>(undefined);

const STORAGE_KEY = "@registration_form";
const STEP_KEY = "@registration_step";

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<Partial<RegistrationForm>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Load saved form data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      setIsLoading(true);
      const [savedFormData, savedStep] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(STEP_KEY),
      ]);

      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }

      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    } catch (error) {
      console.error("Error loading saved form data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = async (
    step: keyof RegistrationForm,
    data: Partial<RegistrationForm[keyof RegistrationForm]>
  ) => {
    setIsLoading(true);
    try {
      const updatedFormData = {
        ...formData,
        [step]: {
          ...(formData[step] || {}),
          ...data,
        },
      };

      setFormData(updatedFormData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFormData));
    } catch (error) {
      console.error("Error saving form data:", error);
      throw new Error("Failed to save form data");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFormData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        AsyncStorage.removeItem(STEP_KEY),
      ]);
      setFormData({});
      setCurrentStep(0);
    } catch (error) {
      console.error("Error clearing form data:", error);
      throw new Error("Failed to clear form data");
    }
  };

  const updateCurrentStep = async (step: number) => {
    try {
      setCurrentStep(step);
      await AsyncStorage.setItem(STEP_KEY, step.toString());
    } catch (error) {
      console.error("Error saving current step:", error);
    }
  };

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        updateFormData,
        clearFormData,
        isLoading,
        currentStep,
        setCurrentStep: updateCurrentStep,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};
