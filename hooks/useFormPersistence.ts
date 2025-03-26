import { useContext, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { RegistrationForm } from "@/lib/schemas/registration";
import { useRegistration } from "./useRegistration";
import { FieldValues } from "react-hook-form";

export function useFormPersistence<T extends FieldValues>(
  form: UseFormReturn<T>,
  step: keyof RegistrationForm
) {
  const { formData, updateFormData } = useRegistration();

  // Load saved data into form
  useEffect(() => {
    if (formData[step]) {
      form.reset(formData[step] as unknown as T);
    }
  }, []);

  // Save form data on changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData(step, value);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  return form;
}
