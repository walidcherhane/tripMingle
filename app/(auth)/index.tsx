import React from "react";
import { Redirect } from "expo-router";

const index = () => {
  // Redirect to the account-type selection screen for the updated auth flow
  return <Redirect href="/(auth)/account-type" />;
};

export default index;
