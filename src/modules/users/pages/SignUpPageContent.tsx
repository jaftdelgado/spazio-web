"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { EmailStep } from "@users/components/sign-up/EmailStep";
import { OtpStep } from "@users/components/sign-up/OtpStep";
import { PasswordStep } from "@users/components/sign-up/PasswordStep";
import { ProfileStep } from "@users/components/sign-up/ProfileStep";
import { RegistrationResultStep } from "@users/components/sign-up/RegistrationResultStep";
import { AuthShell } from "@users/layouts/AuthShell";

type Step = "email" | "otp" | "profile" | "password" | "result";
type RegistrationStatus = "success" | "error";

const STEPS: Step[] = ["email", "otp", "profile", "password", "result"];

export function SignUpPageContent() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationStatus, setRegistrationStatus] =
    useState<RegistrationStatus>("success");

  const stepIndex = STEPS.indexOf(step);
  const canReturnToVerification = verificationToken.length === 0;

  const goToStep = (nextStep: Step) => {
    if (!canReturnToVerification && (nextStep === "email" || nextStep === "otp")) {
      return;
    }

    setStep(nextStep);
  };

  return (
    <AuthShell>
      <div className="mb-7 flex items-center justify-between">
        <span className="text-xs font-medium text-black/45">
          {stepIndex + 1} / {STEPS.length}
        </span>
        <div className="flex gap-1.5">
          {STEPS.map((currentStep, index) => (
            <motion.span
              layout
              key={currentStep}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={
                currentStep === step
                  ? "h-1.5 w-5 rounded-full bg-primary"
                  : index < stepIndex
                    ? "size-1.5 rounded-full bg-primary/70"
                    : "size-1.5 rounded-full bg-primary/20"
              }
            />
          ))}
        </div>
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={step}
          className="transform-gpu"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          {step === "email" ? (
            <EmailStep
              onSuccess={(nextEmail) => {
                setEmail(nextEmail);
                goToStep("otp");
              }}
            />
          ) : null}
          {step === "otp" ? (
            <OtpStep
              email={email}
              onSuccess={(token) => {
                setVerificationToken(token);
                goToStep("profile");
              }}
              onBack={() => goToStep("email")}
            />
          ) : null}
          {step === "profile" ? (
            <ProfileStep
              onSuccess={(data) => {
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setPhone(data.phone);
                goToStep("password");
              }}
            />
          ) : null}
          {step === "password" ? (
            <PasswordStep
              verificationToken={verificationToken}
              firstName={firstName}
              lastName={lastName}
              phone={phone}
              onBack={() => goToStep("profile")}
              onError={(message) => {
                setRegistrationStatus("error");
                setRegistrationMessage(message);
                goToStep("result");
              }}
              onSuccess={() => {
                setRegistrationStatus("success");
                setRegistrationMessage("");
                goToStep("result");
              }}
            />
          ) : null}
          {step === "result" ? (
            <RegistrationResultStep
              message={registrationMessage}
              onRetry={
                registrationStatus === "error"
                  ? () => goToStep("password")
                  : undefined
              }
              status={registrationStatus}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}
