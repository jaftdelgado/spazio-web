"use client";

import * as React from "react";
import QRCode from "qrcode";
import { 
  CreditCardIcon, 
  UserIcon, 
  Calendar01Icon, 
  AccessIcon, 
  Mail01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/useAuth";
import { HttpError } from "@/lib/http/http-errors";
import { useProcessPayment } from "../application/hooks/usePayments";
import type { CheckoutContext } from "../domain/payments.entity";

// Map of MercadoPago status_detail codes to friendly Spanish messages.
// Covers all test scenarios from the MercadoPago sandbox.
const MP_STATUS_DETAIL_MESSAGES: Record<string, string> = {
  // Approved
  accredited: "¡Pago aprobado y acreditado exitosamente!",

  // Pending / in process
  pending_contingency:
    "El pago está pendiente. Te notificaremos cuando sea procesado (puede tardar hasta 2 días hábiles).",
  pending_waiting_payment:
    "El pago está pendiente de confirmación. Si pagaste en OXXO, puede tardar hasta 3 días hábiles.",
  pending_review_manual:
    "Tu pago está en revisión. Te notificaremos cuando sea aprobado.",

  // Rejection reasons
  cc_rejected_other_reason:
    "Tu tarjeta fue rechazada por un error general. Intenta con otra tarjeta o contacta a tu banco.",
  cc_rejected_call_for_authorize:
    "Tu banco requiere que autorices este pago. Llama al número que aparece en el reverso de tu tarjeta y luego intenta de nuevo.",
  cc_rejected_insufficient_amount:
    "Fondos insuficientes. Verifica el saldo disponible en tu tarjeta e intenta de nuevo.",
  cc_rejected_bad_cvv:
    "El código de seguridad (CVV) es inválido. Revisa los 3 o 4 dígitos en el reverso de tu tarjeta.",
  cc_rejected_bad_filled_date:
    "La fecha de vencimiento es incorrecta. Verifica el mes y año de expiración.",
  cc_rejected_bad_filled_card_number:
    "El número de tarjeta es inválido. Revisa que los 16 dígitos sean correctos.",
  cc_rejected_bad_filled_other:
    "Algunos datos del formulario son incorrectos. Revisa la información de tu tarjeta e intenta de nuevo.",
  cc_rejected_blacklist:
    "Tu tarjeta no puede procesar este pago. Contacta a tu banco para más información.",
  cc_rejected_high_risk:
    "El pago fue rechazado por seguridad. Intenta con otra tarjeta o método de pago.",
  cc_rejected_card_disabled:
    "Tu tarjeta está desactivada. Actívala desde la app de tu banco o solicita una nueva.",
  cc_rejected_duplicated_payment:
    "Ya existe un pago idéntico reciente. Espera unos minutos antes de intentarlo de nuevo.",
  cc_rejected_max_attempts:
    "Superaste el límite de intentos. Intenta de nuevo en 24 horas o usa otra tarjeta.",
  cc_rejected_card_error:
    "Error al procesar la tarjeta. Verifica los datos o intenta con otra tarjeta.",
  cc_amount_rate_limit_exceeded:
    "Superaste el límite de monto permitido para esta tarjeta. Intenta con un monto menor o usa otra tarjeta.",

  // Bank transfer / offline
  bank_rejected: "El pago fue rechazado por el banco. Contacta a tu banco para más información.",

  // Generic
  rejected_by_bank:
    "Tu banco rechazó el pago. Contacta a tu banco o intenta con otra tarjeta.",
};

/**
 * Resolves a user-friendly error message from a backend error string.
 * The backend sends errors in two formats:
 *   1. Rejections: "el pago fue rechazado por la pasarela (Motivo: <status_detail>)"
 *   2. Gateway errors: "error al procesar pago en pasarela: <raw MP error JSON>"
 */
function resolveGatewayErrorMessage(rawError: string): string {
  // Try to extract the status_detail code from the rejection format
  const motivoMatch = rawError.match(/\(Motivo:\s*([^)]+)\)/);
  if (motivoMatch) {
    const code = motivoMatch[1].trim();
    if (MP_STATUS_DETAIL_MESSAGES[code]) {
      return MP_STATUS_DETAIL_MESSAGES[code];
    }
    // Unknown code — still readable
    return `Tu pago fue rechazado. Razón: ${code.replace(/_/g, " ")}. Intenta con otra tarjeta o contacta a tu banco.`;
  }

  // Gateway communication errors (bin_not_found, etc.)
  if (rawError.includes("bin_not_found") || rawError.includes("Bin not found")) {
    return "El número de tarjeta no fue reconocido. Verifica que sea correcto o usa una tarjeta diferente.";
  }
  if (rawError.includes("bad_request")) {
    return "Los datos de la tarjeta son inválidos. Revisa el número, fecha y CVV.";
  }

  // Fall back to a generic but informative message stripping internal prefixes
  const cleaned = rawError
    .replace(/^error al procesar pago en pasarela:\s*/i, "")
    .replace(/^el pago fue rechazado por la pasarela[^:]*:\s*/i, "")
    .trim();

  return cleaned.length > 0
    ? `Error de pasarela: ${cleaned}`
    : "Ocurrió un error al procesar el pago con la pasarela. Intenta de nuevo.";
}

// ─── MercadoPago SDK types ────────────────────────────────────────────────────

// Extend global window type to include MercadoPago
declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: { locale: string },
    ) => {
      createCardToken: (data: {
        cardNumber: string;
        cardholderName: string;
        cardExpirationMonth: string;
        cardExpirationYear: string;
        securityCode: string;
        identificationType: string;
        identificationNumber: string;
      }) => Promise<{ id: string } | null>;
    };
  }
}

type CheckoutPaymentModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  checkout: CheckoutContext | null;
  onSuccess?: () => void;
};

export function CheckoutPaymentModal({
  isOpen,
  onOpenChange,
  checkout,
  onSuccess,
}: CheckoutPaymentModalProps) {
  const { user } = useAuth();
  const processPaymentMutation = useProcessPayment();

  // Form States
  const [paymentType, setPaymentType] = React.useState<"card" | "oxxo">("card");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardholderName, setCardholderName] = React.useState("");
  const [expiry, setExpiry] = React.useState(""); // MM/YY
  const [cvv, setCvv] = React.useState("");
  const [payerEmail, setPayerEmail] = React.useState(user?.email || "");

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isQrLoading, setIsQrLoading] = React.useState(true);
  const [paymentResult, setPaymentResult] = React.useState<{
    success: boolean;
    message: string;
    referenceNumber?: string | null;
    isOxxo?: boolean;
  } | null>(null);

  const [newQrCodeUrl, setNewQrCodeUrl] = React.useState<string>("");
  const [existingQrCodeUrl, setExistingQrCodeUrl] = React.useState<string>("");

  // Generate QR code locally for new payment reference
  React.useEffect(() => {
    if (paymentResult?.referenceNumber) {
      setIsQrLoading(true);
      QRCode.toDataURL(paymentResult.referenceNumber, { width: 150, margin: 1 })
        .then((url) => {
          setNewQrCodeUrl(url);
          setIsQrLoading(false);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setIsQrLoading(false);
        });
    } else {
      setNewQrCodeUrl("");
    }
  }, [paymentResult?.referenceNumber]);

  // Generate QR code locally for existing payment reference.
  // isOpen is included so the QR regenerates each time the modal opens,
  // even when the UUID hasn't changed (state was reset on close).
  React.useEffect(() => {
    if (!isOpen) return;

    const ref = checkout?.existingPaymentUuid
      ? "REF-" + checkout.existingPaymentUuid.slice(0, 8).toUpperCase()
      : "";

    if (ref) {
      setIsQrLoading(true);
      QRCode.toDataURL(ref, { width: 150, margin: 1 })
        .then((url) => {
          setExistingQrCodeUrl(url);
          setIsQrLoading(false);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setIsQrLoading(false);
        });
    } else {
      setExistingQrCodeUrl("");
    }
  }, [isOpen, checkout?.existingPaymentUuid]);

  // Pre-populate email
  React.useEffect(() => {
    if (user?.email) {
      const timer = setTimeout(() => {
        setPayerEmail(user.email);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  React.useEffect(() => {
    if (isOpen && checkout?.existingPaymentMethod?.trim().toLowerCase() === "oxxo") {
      setPaymentType("oxxo");
    } else {
      setPaymentType("card");
    }
  }, [isOpen, checkout]);

  // If checkout amount exceeds OXXO limit, force card payment type
  React.useEffect(() => {
    if (checkout && checkout.amount > 10000) {
      setPaymentType("card");
    }
  }, [checkout]);

  // Load MercadoPago SDK script
  React.useEffect(() => {
    if (!isOpen) return;

    if (window.MercadoPago) return;

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    document.body.appendChild(script);
  }, [isOpen]);

  // Reset form on close
  React.useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setCardNumber("");
        setCardholderName("");
        setExpiry("");
        setCvv("");
        setPaymentType("card");
        setIsProcessing(false);
        setPaymentResult(null);
        setIsQrLoading(true);
        setNewQrCodeUrl("");
        setExistingQrCodeUrl("");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Form validation helper
  const isFormValid = React.useMemo(() => {
    if (!payerEmail.includes("@")) return false;
    
    if (paymentType === "oxxo") return true;
    
    const cleanCard = cardNumber.replace(/\s/g, "");
    const cleanExpiry = expiry.replace(/\s/g, "");
    
    return (
      cleanCard.length >= 15 &&
      cleanCard.length <= 16 &&
      cardholderName.trim().length > 3 &&
      cleanExpiry.length === 5 && // MM/YY
      cvv.length >= 3 &&
      cvv.length <= 4
    );
  }, [cardNumber, cardholderName, expiry, cvv, payerEmail, paymentType]);

  // Handle card number formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setCardNumber(formatted.slice(0, 19)); // Max 16 digits + 3 spaces
  };

  // Handle expiry formatting (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiry(value.slice(0, 5));
  };

  // Submit Payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout || !isFormValid) return;

    setIsProcessing(true);
    setPaymentResult(null);

    // Convert amount to cents (multiplying float by 100)
    const amountInCents = Math.round(checkout.amount * 100);

    try {
      if (paymentType === "card") {
        if (!window.MercadoPago) {
          throw new Error("El SDK de MercadoPago no ha cargado. Por favor, intente de nuevo.");
        }

        const mpPublicKey =
          process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
          "TEST-1692769139150670-050918-5c6834642d4aba89c094da9f6b31bc77-1191667193"; // Placeholder test key

        const mp = new window.MercadoPago(mpPublicKey, { locale: "es-MX" });

        const [month, year] = expiry.split("/");
        // Format year to full 4 digits (e.g. 26 -> 2026)
        const fullYear = year ? `20${year}` : "";

        const cardTokenResult = await mp.createCardToken({
          cardNumber: cardNumber.replace(/\s/g, ""),
          cardholderName,
          cardExpirationMonth: month,
          cardExpirationYear: fullYear,
          securityCode: cvv,
          identificationType: "RFC",
          identificationNumber: "XAXX010101000",
        });

        if (!cardTokenResult || !cardTokenResult.id) {
          throw new Error("No se pudo tokenizar la tarjeta de crédito. Verifique sus datos.");
        }

        const token = cardTokenResult.id;
        // Simple heuristic to detect card brand
        let gatewayMethodId = "visa";
        const firstDigit = cardNumber.charAt(0);
        if (firstDigit === "4") gatewayMethodId = "visa";
        else if (firstDigit === "5") gatewayMethodId = "master";
        else if (firstDigit === "3") gatewayMethodId = "amex";

        const response = await processPaymentMutation.mutateAsync({
          contractId: checkout.contractId,
          paymentMethodId: 1, // Tarjeta
          gatewayId: 1, // MercadoPago
          amount: amountInCents,
          currency: checkout.currency,
          token,
          gatewayMethodId,
          payerEmail,
        });

        if (response.status === "Success" || response.statusId === 2) {
          setPaymentResult({
            success: true,
            message: "El pago se ha procesado y aprobado exitosamente.",
            isOxxo: false,
          });
          toast.success("Pago completado exitosamente");
          if (onSuccess) onSuccess();
        } else {
          setPaymentResult({
            success: true, // transaccion creada pero pendiente
            message: "El pago está en proceso de verificación por la pasarela de pagos.",
            referenceNumber: response.referenceNumber,
            isOxxo: false,
          });
          toast.info("El pago se encuentra pendiente");
          if (onSuccess) onSuccess();
        }
      } else {
        // OXXO Cash Payment
        const response = await processPaymentMutation.mutateAsync({
          contractId: checkout.contractId,
          paymentMethodId: 3, // OXXO
          gatewayId: 1, // MercadoPago
          amount: amountInCents,
          currency: checkout.currency,
          token: "", // No card token
          gatewayMethodId: "oxxo",
          payerEmail,
        });

        setPaymentResult({
          success: true,
          message: "Referencia de pago en OXXO generada correctamente.",
          referenceNumber: response.referenceNumber,
          isOxxo: true,
        });
        toast.info("Referencia OXXO generada");
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
      let errMsg = "Ocurrió un error inesperado al procesar el pago. Intenta de nuevo.";
      let isRejection = false;

      if (err instanceof HttpError) {
        const body = err.body as { error?: string } | null;
        const rawMsg = body?.error?.trim() ?? "";

        if (rawMsg) {
          isRejection = rawMsg.includes("rechazado") || rawMsg.includes("Motivo:");
          errMsg = resolveGatewayErrorMessage(rawMsg);
        } else {
          errMsg = `Error del servidor (${err.status}): No se pudo procesar el pago.`;
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      } else if (err && typeof err === "object") {
        // El SDK de MercadoPago lanza objetos planos (no instancias de Error)
        // Estructura típica: { message: "...", cause: [{ code, description }] }
        const mpErr = err as {
          message?: string;
          error?: string;
          status?: number;
          cause?: Array<{ description?: string; code?: number }>;
        };

        // Map known MP SDK error codes
        const causeCode = mpErr.cause?.[0]?.code;
        const causeDesc = mpErr.cause?.[0]?.description ?? "";

        if (causeCode === 10105 || mpErr.message === "bin_not_found") {
          errMsg = "El número de tarjeta no fue reconocido. Verifica los primeros dígitos o usa una tarjeta diferente.";
        } else if (causeCode === 205 || causeDesc.toLowerCase().includes("cardNumber")) {
          errMsg = "El número de tarjeta es inválido. Verifica que sean 15 o 16 dígitos correctos.";
        } else if (causeCode === 208 || causeDesc.toLowerCase().includes("expirationMonth")) {
          errMsg = "El mes de vencimiento es inválido. Usa el formato MM (01-12).";
        } else if (causeCode === 209 || causeDesc.toLowerCase().includes("expirationYear")) {
          errMsg = "El año de vencimiento es inválido.";
        } else if (causeCode === 214 || causeDesc.toLowerCase().includes("securityCode")) {
          errMsg = "El código de seguridad (CVV) es inválido.";
        } else if (causeCode === 316 || causeDesc.toLowerCase().includes("cardholderName")) {
          errMsg = "El nombre del titular es inválido. Usa el nombre como aparece en la tarjeta.";
        } else if (causeCode === 324) {
          errMsg = "El tipo de documento de identificación es inválido.";
        } else if (mpErr.cause?.[0]?.description) {
          errMsg = `Error de tarjeta: ${causeDesc}`;
        } else if (mpErr.message) {
          errMsg = resolveGatewayErrorMessage(mpErr.message);
        } else {
          errMsg = "Error al validar la tarjeta. Revisa los datos e intenta de nuevo.";
        }
        isRejection = true;
      }

      setPaymentResult({ success: false, message: errMsg });
      toast.error(isRejection ? "Pago rechazado" : "Error al procesar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md overflow-hidden rounded-4xl border border-border bg-background p-0 shadow-2xl">
        {paymentResult ? (
          /* Payment Result State */
          <div className="flex flex-col items-center p-8 text-center animate-fade-in">
            <div className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
              paymentResult.success ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
            }`}>
              <HugeiconsIcon 
                icon={paymentResult.success ? CheckmarkCircle02Icon : Alert02Icon} 
                size={36} 
                strokeWidth={1.8}
              />
            </div>

            <h3 className="mt-6 text-xl font-semibold text-foreground">
              {paymentResult.success
                ? paymentResult.isOxxo
                  ? "¡Referencia Generada!"
                  : "¡Pago Exitoso!"
                : "Pago Rechazado"}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {paymentResult.message}
            </p>

            {paymentResult.referenceNumber && (
              <div className="mt-6 flex flex-col items-center space-y-4 w-full">
                <div className="relative rounded-2xl bg-white p-3 shadow-md border border-border flex items-center justify-center min-h-[174px] min-w-[174px]">
                  {isQrLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  )}
                  {newQrCodeUrl && (
                    <img
                      src={newQrCodeUrl}
                      alt="Código QR OXXO"
                      width={150}
                      height={150}
                      className="mx-auto"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  Presenta este código QR o proporciona la siguiente referencia en caja para realizar tu pago en cualquier OXXO.
                </p>
                <div className="rounded-2xl bg-muted/40 px-5 py-2.5 text-sm font-bold font-mono text-foreground border border-border/70 select-all">
                  Referencia: {paymentResult.referenceNumber}
                </div>
              </div>
            )}

            <Button
              className="mt-8 w-full rounded-2xl py-6 text-sm font-semibold"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Entendido
            </Button>
          </div>
        ) : (
          /* Checkout Payment Form */
          <form onSubmit={handleSubmit}>
            <AlertDialogHeader className="border-b border-border/70 bg-muted/10 px-6 py-5">
              <AlertDialogTitle className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <HugeiconsIcon icon={CreditCardIcon} size={18} strokeWidth={1.8} />
                </div>
                <span>Pasarela de Pago Seguro</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Paga de forma segura e instantánea usando MercadoPago Checkout Transparente.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 p-6">
              {/* Payment Summary */}
              {checkout && (
                <div className="rounded-3xl border border-border/80 bg-muted/15 p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total a Pagar</span>
                    <h4 className="text-xl font-bold text-foreground tabular-nums mt-0.5">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: checkout.currency,
                      }).format(checkout.amount)}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Periodo</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {checkout.periodName ?? "—"}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Método de Pago</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType("card")}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all cursor-pointer ${
                      paymentType === "card"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border/80 bg-background text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    <HugeiconsIcon icon={CreditCardIcon} size={22} className="mb-2" />
                    <span className="text-xs font-semibold">Tarjeta</span>
                  </button>
                  <button
                    type="button"
                    disabled={checkout !== null && checkout.amount > 10000}
                    onClick={() => setPaymentType("oxxo")}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${
                      checkout !== null && checkout.amount > 10000
                        ? "border-border/40 bg-muted/20 text-muted-foreground/40 cursor-not-allowed opacity-50"
                        : paymentType === "oxxo"
                          ? "border-primary bg-primary/5 text-primary shadow-sm cursor-pointer"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted/10 cursor-pointer"
                    }`}
                  >
                    <HugeiconsIcon icon={Mail01Icon} size={22} className="mb-2" />
                    <span className="text-xs font-semibold">OXXO (Efectivo)</span>
                  </button>
                </div>
              </div>

              {checkout !== null && checkout.amount > 10000 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 flex gap-2.5 text-xs text-amber-600 dark:text-amber-500 animate-fade-in">
                  <HugeiconsIcon icon={Alert02Icon} size={16} className="shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    El pago por **OXXO (Efectivo)** tiene un límite máximo de **$10,000.00 MXN**. Para montos superiores, por favor utiliza una tarjeta de crédito o débito.
                  </p>
                </div>
              )}

              {paymentType === "oxxo" && checkout?.existingPaymentMethod?.trim().toLowerCase() === "oxxo" ? (
                <div className="flex flex-col items-center text-center animate-fade-in space-y-4 py-2">
                  <div className="relative rounded-2xl bg-white p-3 shadow-md border border-border flex items-center justify-center min-h-[174px] min-w-[174px]">
                    {isQrLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      </div>
                    )}
                    {existingQrCodeUrl && (
                      <img
                        src={existingQrCodeUrl}
                        alt="Código QR OXXO"
                        width={150}
                        height={150}
                        className="mx-auto"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground max-w-[280px]">
                    Esta referencia ya fue generada. Presenta este código QR o proporciona la siguiente referencia en caja para realizar tu pago en cualquier OXXO.
                  </p>
                  <div className="rounded-2xl bg-muted/40 px-5 py-2.5 text-sm font-bold font-mono text-foreground border border-border/70 select-all">
                    Referencia: {"REF-" + checkout.existingPaymentUuid?.slice(0, 8).toUpperCase()}
                  </div>
                </div>
              ) : (
                <>
                  {/* Payer Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-payer-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                      <HugeiconsIcon icon={Mail01Icon} size={12} />
                      <span>Correo Electrónico de Contacto</span>
                    </label>
                    <Input
                      id="checkout-payer-email"
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>

                  {paymentType === "card" && (
                    <>
                      {/* Card Number */}
                      <div className="space-y-1.5">
                        <label htmlFor="checkout-card-number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                          <HugeiconsIcon icon={CreditCardIcon} size={12} />
                          <span>Número de Tarjeta</span>
                        </label>
                        <Input
                          id="checkout-card-number"
                          type="text"
                          required
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="rounded-2xl"
                        />
                      </div>

                      {/* Cardholder Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="checkout-cardholder-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                          <HugeiconsIcon icon={UserIcon} size={12} />
                          <span>Nombre del Titular</span>
                        </label>
                        <Input
                          id="checkout-cardholder-name"
                          type="text"
                          required
                          placeholder="Escribe como aparece en la tarjeta"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          className="rounded-2xl"
                        />
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="checkout-card-expiry" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                            <HugeiconsIcon icon={Calendar01Icon} size={12} />
                            <span>Vencimiento</span>
                          </label>
                          <Input
                            id="checkout-card-expiry"
                            type="text"
                            required
                            placeholder="MM/AA"
                            value={expiry}
                            onChange={handleExpiryChange}
                            className="rounded-2xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="checkout-card-cvv" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                            <HugeiconsIcon icon={AccessIcon} size={12} />
                            <span>CVV</span>
                          </label>
                          <Input
                            id="checkout-card-cvv"
                            type="password"
                            required
                            placeholder="123"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="rounded-2xl"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <AlertDialogFooter className="border-t border-border/70 bg-muted/10 px-6 py-4 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing}
                onClick={() => onOpenChange(false)}
                className="rounded-2xl px-5"
              >
                {paymentType === "oxxo" && checkout?.existingPaymentMethod?.trim().toLowerCase() === "oxxo" ? "Cerrar" : "Pagar luego"}
              </Button>
              {!(paymentType === "oxxo" && checkout?.existingPaymentMethod?.trim().toLowerCase() === "oxxo") && (
                <Button
                  type="submit"
                  disabled={!isFormValid || isProcessing}
                  className="rounded-2xl flex-1 py-5 text-sm font-semibold cursor-pointer"
                >
                  {isProcessing
                    ? "Procesando pago..."
                    : paymentType === "card"
                      ? checkout?.existingPaymentMethod
                        ? "Pagar de una vez"
                        : "Confirmar y Pagar"
                      : "Generar Referencia OXXO"}
                </Button>
              )}
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
