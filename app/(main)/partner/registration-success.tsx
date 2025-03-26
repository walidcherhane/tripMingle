// app/screens/registration/RegistrationSuccess.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { CheckCircle, Clock, Mail, ArrowRight } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import {
  useAuthorizationForm,
  usePersonalInfoForm,
  useVehicleInfoForm,
} from "@/hooks/useRegistrationForms";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegistrationSuccess = () => {
  const personalInfoForm = usePersonalInfoForm();
  const vehicleInfoForm = useVehicleInfoForm();
  const authorizationForm = useAuthorizationForm();

  useFormPersistence(personalInfoForm, "personalInfo");

  useFormPersistence(vehicleInfoForm, "vehicleInfo");
  useFormPersistence(authorizationForm, "authorizationInfo");

  const createUser = useMutation(api.users.createUser);
  const createVehicle = useMutation(api.vehicles.registerVehicle);
  const createDocument = useMutation(api.documents.uploadDocument);

  const handleNavigateHome = async () => {
    try {
      // Prepare user data with proper type handling
      const userData = {
        email: personalInfoForm.getValues("email"),
        firstName: personalInfoForm.getValues("firstName"),
        lastName: personalInfoForm.getValues("lastName"),
        userType: "partner",
        phone: personalInfoForm.getValues("phone"),
        cin: personalInfoForm.getValues("cin"),
        address: personalInfoForm.getValues("address"),
        city: personalInfoForm.getValues("city"),
        postalCode: personalInfoForm.getValues("postalCode"),
        profileImage: personalInfoForm.getValues("profileImage") || undefined,
        cinFrontImage: personalInfoForm.getValues("cinFrontImage") || undefined,
        cinBackImage: personalInfoForm.getValues("cinBackImage") || undefined,
        driverLicenseImage:
          personalInfoForm.getValues("driverLicenseImage") || undefined,
      };

      // Store the email for later use in verification and password creation
      await AsyncStorage.setItem("@partner_email", userData.email);

      // Reset any previous sign-in state
      await AsyncStorage.removeItem("@user_signed_in");
      await AsyncStorage.removeItem("@partner_password_set");

      // create the user - using properly typed data
      const userId = await createUser(userData);

      const vehicleData = {
        brand: vehicleInfoForm.getValues("brand"),
        model: vehicleInfoForm.getValues("model"),
        year: vehicleInfoForm.getValues("year"),
        licensePlate: vehicleInfoForm.getValues("licensePlate"),
        color: "Black", // Default value
        capacity: Number(vehicleInfoForm.getValues("capacity")),
        images: vehicleInfoForm.getValues("vehicleImages") || [],
        pricePerKm: Number(vehicleInfoForm.getValues("pricePerKm")),
        baseFare: 200, // Default value
        category: "standard", // Set a default category or get it from the form
        ownerId: userId,
      };

      await createVehicle(vehicleData);

      const documentData = {
        ownerId: userId,
        type: "tourism_licese",
        fileUrl:
          authorizationForm.getValues("tourismLicenseImage.fileUrl") || "",
        storageId: authorizationForm.getValues("tourismLicenseImage.storageId"),
      };

      await createDocument(documentData);
      // Navigate to home screen or appropriate screen
      router.push("/partner");
    } catch (error) {}
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#10B981" />
        </View>

        {/* Main Message */}
        <Typography variant="xl" weight="bold" align="center">
          Registration Submitted!
        </Typography>
        <Typography variant="sm" color="primary.mid">
          Thank you for registering with our platform
        </Typography>

        {/* Next Steps Section */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Typography color="text" weight="bold" align="center">
                What's Next?
              </Typography>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Mail size={20} color={colors.primary.brand} />
                </View>
                <View style={styles.stepContent}>
                  <Typography>Verification Email</Typography>
                  <Typography variant="sm" color="gray.500">
                    Check your email for verification details and next steps
                  </Typography>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Clock size={20} color={colors.primary.brand} />
                </View>
                <View style={styles.stepContent}>
                  <Typography>Document Review</Typography>
                  <Typography variant="sm" color="gray.500">
                    Our team will review your documents within 48 hours
                  </Typography>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <ArrowRight size={20} color={colors.primary.brand} />
                </View>
                <View style={styles.stepContent}>
                  <Typography>Account Activation</Typography>
                  <Typography variant="sm" color="gray.500">
                    Once approved, you'll receive access to start using the
                    platform
                  </Typography>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.infoContainer}>
          <Typography>Need help? Contact our support team at:</Typography>
          <Typography color="primary.brand" weight="bold">
            support@yourplatform.com
          </Typography>
        </View>

        {/* Action Button */}
        <Button
          title="Return to Home"
          onPress={handleNavigateHome}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 24,
    alignItems: "center",
    gap: spacing.lg,
  },
  iconContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    gap: 16,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  infoContainer: {
    alignItems: "center",
  },
  button: {
    width: "100%",
  },
});

export default RegistrationSuccess;
