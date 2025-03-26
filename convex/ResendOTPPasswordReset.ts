import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    console.log("API KEY =====> ", provider.apiKey);
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "Trip Mingle <noreply@tripmingle.com>",
      to: [email],
      subject: `Reset your password in Trip Mingle`,
      text: "Your password reset code is " + token,
    });

    // if (error) {
    //   throw new Error(JSON.stringify(error));
    // }
  },
});
