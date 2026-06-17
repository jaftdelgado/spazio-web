"use client";

export interface RentalPreviewInput {
  propertyUuid: string;
  periodId: number;
  startDate: string;
  endDate: string;
}

export interface RentalConfirmInput extends RentalPreviewInput {
  clientUuid: string;
}

export interface RentalBreakdown {
  years: number;
  months: number;
  weeks: number;
  nights: number;
}

export interface RentalPriceComponent {
  periodId: number;
  period: string;
  units: number;
  unitPrice: string;
  lineTotal: string;
}

export interface RentalPreview {
  propertyUuid: string;
  period: string;
  periodId: number;
  startDate: string;
  endDate: string;
  units: number;
  unitPrice: string;
  currency: string;
  subtotal: string;
  deposit: string;
  total: string;
  isNegotiable: boolean;
  blockedDates: string[];
  breakdown: RentalBreakdown;
  priceComponents: RentalPriceComponent[];
}

export interface RentalConfirmation {
  transactionUuid: string;
  contractUuid: string;
  propertyUuid: string;
  status: string;
  period: string;
  periodId: number;
  startDate: string;
  endDate: string;
  currency: string;
  subtotal: string;
  deposit: string;
  total: string;
  isNegotiable: boolean;
  breakdown: RentalBreakdown;
  priceComponents: RentalPriceComponent[];
}
