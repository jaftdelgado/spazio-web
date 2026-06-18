"use client";

import * as React from "react";
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
import { useProcessPayment } from "../application/hooks/usePayments";
import type { CheckoutContext } from "../domain/payments.entity";

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
  const [paymentResult, setPaymentResult] = React.useState<{
    success: boolean;
    message: string;
    referenceNumber?: string | null;
    isOxxo?: boolean;
  } | null>(null);

  // Pre-populate email
  React.useEffect(() => {
    if (user?.email) {
      const timer = setTimeout(() => {
        setPayerEmail(user.email);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

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
      const errMsg = err instanceof Error ? err.message : "Ocurrió un error inesperado al procesar el pago.";
      setPaymentResult({
        success: false,
        message: errMsg,
      });
      toast.error("Error al procesar el pago");
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
                <div className="rounded-2xl bg-white p-3 shadow-md border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${paymentResult.referenceNumber}`}
                    alt="Código QR OXXO"
                    width={150}
                    height={150}
                    className="mx-auto"
                  />
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
                    onClick={() => setPaymentType("oxxo")}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all cursor-pointer ${
                      paymentType === "oxxo"
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border/80 bg-background text-muted-foreground hover:bg-muted/10"
                    }`}
                  >
                    <HugeiconsIcon icon={Mail01Icon} size={22} className="mb-2" />
                    <span className="text-xs font-semibold">OXXO (Efectivo)</span>
                  </button>
                </div>
              </div>

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
            </div>

            <AlertDialogFooter className="border-t border-border/70 bg-muted/10 px-6 py-4 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing}
                onClick={() => onOpenChange(false)}
                className="rounded-2xl px-5"
              >
                Pagar luego
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isProcessing}
                className="rounded-2xl flex-1 py-5 text-sm font-semibold cursor-pointer"
              >
                {isProcessing
                  ? "Procesando pago..."
                  : paymentType === "card"
                    ? "Confirmar y Pagar"
                    : "Generar Referencia OXXO"}
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

