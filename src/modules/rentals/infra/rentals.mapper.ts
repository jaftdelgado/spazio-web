"use client";

import type {
  RentalBreakdown,
  RentalConfirmation,
  RentalPreview,
  RentalPriceComponent,
} from "../domain/rentals.entity";

type RentalBreakdownDTO = {
  years: number;
  months: number;
  weeks: number;
  nights: number;
};

type RentalPriceComponentDTO = {
  period_id: number;
  period: string;
  units: number;
  unit_price: string;
  line_total: string;
};

type RentalPreviewDTO = {
  property_uuid: string;
  period: string;
  period_id: number;
  start_date: string;
  end_date: string;
  units: number;
  unit_price: string;
  currency: string;
  subtotal: string;
  deposit: string;
  total: string;
  is_negotiable: boolean;
  blocked_dates: string[];
  breakdown: RentalBreakdownDTO;
  price_components: RentalPriceComponentDTO[];
};

type RentalConfirmationDTO = {
  transaction_uuid: string;
  contract_uuid: string;
  property_uuid: string;
  status: string;
  period: string;
  period_id: number;
  start_date: string;
  end_date: string;
  currency: string;
  subtotal: string;
  deposit: string;
  total: string;
  is_negotiable: boolean;
  breakdown: RentalBreakdownDTO;
  price_components: RentalPriceComponentDTO[];
};

const mapRentalBreakdown = (dto: RentalBreakdownDTO): RentalBreakdown => ({
  years: dto.years,
  months: dto.months,
  weeks: dto.weeks,
  nights: dto.nights,
});

const mapRentalPriceComponent = (
  dto: RentalPriceComponentDTO,
): RentalPriceComponent => ({
  periodId: dto.period_id,
  period: dto.period,
  units: dto.units,
  unitPrice: dto.unit_price,
  lineTotal: dto.line_total,
});

export const mapRentalPreview = (dto: RentalPreviewDTO): RentalPreview => ({
  propertyUuid: dto.property_uuid,
  period: dto.period,
  periodId: dto.period_id,
  startDate: dto.start_date,
  endDate: dto.end_date,
  units: dto.units,
  unitPrice: dto.unit_price,
  currency: dto.currency,
  subtotal: dto.subtotal,
  deposit: dto.deposit,
  total: dto.total,
  isNegotiable: dto.is_negotiable,
  blockedDates: dto.blocked_dates,
  breakdown: mapRentalBreakdown(dto.breakdown),
  priceComponents: dto.price_components.map(mapRentalPriceComponent),
});

export const mapRentalConfirmation = (
  dto: RentalConfirmationDTO,
): RentalConfirmation => ({
  transactionUuid: dto.transaction_uuid,
  contractUuid: dto.contract_uuid,
  propertyUuid: dto.property_uuid,
  status: dto.status,
  period: dto.period,
  periodId: dto.period_id,
  startDate: dto.start_date,
  endDate: dto.end_date,
  currency: dto.currency,
  subtotal: dto.subtotal,
  deposit: dto.deposit,
  total: dto.total,
  isNegotiable: dto.is_negotiable,
  breakdown: mapRentalBreakdown(dto.breakdown),
  priceComponents: dto.price_components.map(mapRentalPriceComponent),
});
