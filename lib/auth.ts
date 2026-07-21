import { auth } from "./firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

export function setupRecaptcha(containerId: string) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "normal",
        callback: () => {
          console.log("reCAPTCHA solved");
        },
      }
    );

    window.recaptchaVerifier.render();
  }
}

export async function sendOTP(phone: string) {
  const appVerifier = window.recaptchaVerifier;

  const formattedPhone =
    phone.startsWith("+") ? phone : "+91" + phone;

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    formattedPhone,
    appVerifier
  );

  window.confirmationResult = confirmationResult;
}

export async function verifyOTP(code: string) {
  const result = await window.confirmationResult.confirm(code);
  return result.user;
}