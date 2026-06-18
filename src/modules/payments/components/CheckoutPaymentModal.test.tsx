import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock qrcode library
vi.mock("qrcode", () => ({
  default: {
    toDataURL: () => Promise.resolve("data:image/png;base64,mocked-qr-code-url"),
  },
  toDataURL: () => Promise.resolve("data:image/png;base64,mocked-qr-code-url"),
}));

import { CheckoutPaymentModal } from "./CheckoutPaymentModal";
import { useProcessPayment } from "../application/hooks/usePayments";
import { useAuth } from "@/lib/auth/useAuth";

// Mock hooks
vi.mock("../application/hooks/usePayments", () => ({
  useProcessPayment: vi.fn(),
}));

vi.mock("@/lib/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("CheckoutPaymentModal", () => {
  const mockMutateAsync = vi.fn();

  const mockCheckout = {
    contractId: 10,
    contractUuid: "contract-uuid-123",
    currency: "MXN",
    amount: 1500.00,
    periodName: "Monthly",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { email: "tenant@example.com" },
      isAuthenticated: true,
      isLoading: false,
      role: 3,
    } as unknown as ReturnType<typeof useAuth>);

    vi.mocked(useProcessPayment).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    } as unknown as ReturnType<typeof useProcessPayment>);
  });

  it("does not render when isOpen is false", () => {
    render(
      <CheckoutPaymentModal
        isOpen={false}
        onOpenChange={vi.fn()}
        checkout={mockCheckout}
      />
    );
    expect(screen.queryByText("Pasarela de Pago Seguro")).toBeNull();
  });

  it("renders checkout details and pre-populates email when open", () => {
    render(
      <CheckoutPaymentModal
        isOpen={true}
        onOpenChange={vi.fn()}
        checkout={mockCheckout}
      />
    );

    expect(screen.getByText("Pasarela de Pago Seguro")).toBeDefined();
    expect(screen.getByText("$1,500.00")).toBeDefined();
    expect(screen.getByText("Monthly")).toBeDefined();
    expect((screen.getByLabelText(/Correo Electrónico/) as HTMLInputElement).value).toBe("tenant@example.com");
  });

  it("renders credit card inputs by default", () => {
    render(
      <CheckoutPaymentModal
        isOpen={true}
        onOpenChange={vi.fn()}
        checkout={mockCheckout}
      />
    );

    expect(screen.getByText("Número de Tarjeta")).toBeDefined();
    expect(screen.getByText("Nombre del Titular")).toBeDefined();
    expect(screen.getByText("Vencimiento")).toBeDefined();
    expect(screen.getByText("CVV")).toBeDefined();
  });

  it("submits payment successfully after tokenizing card details", async () => {
    const mockCreateCardToken = vi.fn().mockResolvedValue({ id: "tok_abc123" });
    window.MercadoPago = vi.fn().mockImplementation(function () {
      return {
        createCardToken: mockCreateCardToken,
      };
    });

    mockMutateAsync.mockResolvedValue({
      paymentUuid: "pay-123",
      status: "Success",
      statusId: 2,
      amount: 150000,
    });

    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    render(
      <CheckoutPaymentModal
        isOpen={true}
        onOpenChange={onOpenChange}
        checkout={mockCheckout}
        onSuccess={onSuccess}
      />
    );

    // Fill card inputs
    fireEvent.change(screen.getByLabelText("Número de Tarjeta"), { target: { value: "4111 1111 1111 1111" } });
    fireEvent.change(screen.getByLabelText("Nombre del Titular"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByLabelText("Vencimiento"), { target: { value: "12/28" } });
    fireEvent.change(screen.getByLabelText("CVV"), { target: { value: "123" } });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Confirmar y Pagar" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateCardToken).toHaveBeenCalledWith({
        cardNumber: "4111111111111111",
        cardholderName: "John Doe",
        cardExpirationMonth: "12",
        cardExpirationYear: "2028",
        securityCode: "123",
        identificationType: "RFC",
        identificationNumber: "XAXX010101000",
      });
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        contractId: 10,
        paymentMethodId: 1,
        gatewayId: 1,
        amount: 150000,
        currency: "MXN",
        token: "tok_abc123",
        gatewayMethodId: "visa",
        payerEmail: "tenant@example.com",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("¡Pago Exitoso!")).toBeDefined();
    });
  });

  it("submits OXXO payment successfully", async () => {
    mockMutateAsync.mockResolvedValue({
      paymentUuid: "pay-456",
      status: "Pending",
      statusId: 1,
      amount: 150000,
      referenceNumber: "REF-OXXO123",
    });

    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();

    render(
      <CheckoutPaymentModal
        isOpen={true}
        onOpenChange={onOpenChange}
        checkout={mockCheckout}
        onSuccess={onSuccess}
      />
    );

    // Switch to OXXO
    const oxxoBtn = screen.getByRole("button", { name: "OXXO (Efectivo)" });
    fireEvent.click(oxxoBtn);

    // Verify card fields are gone
    expect(screen.queryByLabelText("Número de Tarjeta")).toBeNull();
    expect(screen.queryByLabelText("Nombre del Titular")).toBeNull();

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Generar Referencia OXXO" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        contractId: 10,
        paymentMethodId: 3,
        gatewayId: 1,
        amount: 150000,
        currency: "MXN",
        token: "",
        gatewayMethodId: "oxxo",
        payerEmail: "tenant@example.com",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("¡Referencia Generada!")).toBeDefined();
      expect(screen.getByText("Referencia: REF-OXXO123")).toBeDefined();
    });
  });
});
