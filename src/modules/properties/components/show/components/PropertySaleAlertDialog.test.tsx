import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { HttpError } from "@/lib/http/http-errors";
import { useFormalizeSale } from "@/modules/sales/application/hooks/useSales";
import { PropertySaleAlertDialog } from "./PropertySaleAlertDialog";

vi.mock("@/modules/sales/application/hooks/useSales", () => ({
  useFormalizeSale: vi.fn(),
}));

vi.mock("@properties/i18n/usePropertiesTranslation", () => ({
  usePropertiesTranslation: () => ({
    intlLocale: "es-MX",
    t: (key: string) =>
      (
        {
          "show.sale.dialogTitle": "Confirmar venta",
          "show.sale.dialogDescription":
            "Vamos a formalizar la venta de la propiedad.",
          "show.sale.summaryTitle": "Resumen de venta",
          "show.sale.fields.property": "Propiedad",
          "show.sale.fields.salePrice": "Precio de venta",
          "show.sale.fields.currency": "Moneda",
          "show.sale.lockedAmountNote":
            "El monto queda bloqueado al confirmar la venta.",
          "show.sale.cancel": "Cancelar",
          "show.sale.confirm": "Formalizar venta",
          "show.sale.submitting": "Formalizando...",
          "show.sale.toast.successTitle": "Venta formalizada",
          "show.sale.toast.successDescription":
            "La venta se formalizó correctamente.",
          "show.sale.errorFallback":
            "No se pudo formalizar la venta en este momento.",
        } satisfies Record<string, string>
      )[key] ?? key,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

vi.mock("@hugeicons/react", () => ({
  HugeiconsIcon: () => <span data-testid="sale-icon" />,
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div>{children}</div> : null),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

const mockMutateAsync = vi.fn();
const mockReset = vi.fn();

describe("PropertySaleAlertDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFormalizeSale).mockReturnValue({
      mutateAsync: mockMutateAsync,
      reset: mockReset,
      isPending: false,
    } as unknown as ReturnType<typeof useFormalizeSale>);
  });

  it("renders the sale summary when open", () => {
    render(
      <PropertySaleAlertDialog
        agreedAmount={1500000}
        currency="MXN"
        isOpen={true}
        onOpenChange={vi.fn()}
        propertyTitle="Casa Roma"
        propertyUuid="prop-789"
      />,
    );

    expect(screen.getByText("Confirmar venta")).toBeDefined();
    expect(screen.getByText("Resumen de venta")).toBeDefined();
    expect(screen.getByText("Casa Roma")).toBeDefined();
    expect(screen.getByText("$1,500,000.00")).toBeDefined();
    expect(screen.getByText("MXN")).toBeDefined();
    expect(screen.getByText("Formalizar venta")).toBeDefined();
  });

  it("formalizes the sale successfully and closes the dialog", async () => {
    mockMutateAsync.mockResolvedValue({
      transactionUuid: "txn-123",
      contractUuid: "ctr-456",
      propertyUuid: "prop-789",
      status: "formalized",
      finalAmount: 1500000,
      currency: "MXN",
    });

    const { toast } = await import("sonner");
    const onOpenChange = vi.fn();

    render(
      <PropertySaleAlertDialog
        agreedAmount={1500000}
        currency="MXN"
        isOpen={true}
        onOpenChange={onOpenChange}
        propertyTitle="Casa Roma"
        propertyUuid="prop-789"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Formalizar venta" }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        propertyUuid: "prop-789",
        agreedAmount: 1500000,
      });
    });
    expect(toast.success).toHaveBeenCalledWith("Venta formalizada", {
      description: "La venta se formalizó correctamente.",
    });
    expect(mockReset).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows the api error message when formalization fails", async () => {
    mockMutateAsync.mockRejectedValue(
      new HttpError(400, {
        error: "La venta ya fue procesada.",
      }),
    );

    render(
      <PropertySaleAlertDialog
        agreedAmount={1500000}
        currency="MXN"
        isOpen={true}
        onOpenChange={vi.fn()}
        propertyTitle="Casa Roma"
        propertyUuid="prop-789"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Formalizar venta" }));

    await waitFor(() => {
      expect(screen.getByText("La venta ya fue procesada.")).toBeDefined();
    });
  });
});
