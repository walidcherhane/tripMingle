import { useCallback } from "react";
import { useRegistration } from "./useRegistration";

export const useRegistrationStep = (totalSteps: number) => {
  const { currentStep, setCurrentStep, formData } = useRegistration();

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const canGoNext = currentStep < totalSteps - 1;
  const canGoBack = currentStep > 0;
  const isLastStep = currentStep === totalSteps - 1;

  return {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoBack,
    isLastStep,
    stepData: formData,
  };
};
