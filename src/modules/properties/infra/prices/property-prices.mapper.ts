"use client";

import type {
  ActiveRentPrice,
  ActiveSalePrice,
  PropertyPrices,
} from "@properties/domain/property.entity";

type ActiveSalePriceDTO = {
  sale_price: number;
  currency: string;
  is_negotiable: boolean;
} | null;

type ActiveRentPriceDTO = {
  period_id: number;
  rent_price: number;
  deposit: number | null;
  currency: string;
  is_negotiable: boolean;
};

type PropertyPricesDataDTO = {
  sale_price: ActiveSalePriceDTO;
  rent_prices: ActiveRentPriceDTO[];
};

type GetPropertyPricesDTO = {
  data: PropertyPricesDataDTO;
};

const mapActiveSalePrice = (
  dto: ActiveSalePriceDTO,
): ActiveSalePrice | null => {
  if (!dto) return null;

  return {
    salePrice: dto.sale_price,
    currency: dto.currency,
    isNegotiable: dto.is_negotiable,
  };
};

const mapActiveRentPrice = (dto: ActiveRentPriceDTO): ActiveRentPrice => ({
  periodId: dto.period_id,
  rentPrice: dto.rent_price,
  deposit: dto.deposit,
  currency: dto.currency,
  isNegotiable: dto.is_negotiable,
});

export const mapPropertyPrices = (dto: GetPropertyPricesDTO): PropertyPrices => ({
  salePrice: mapActiveSalePrice(dto.data.sale_price),
  rentPrices: dto.data.rent_prices.map(mapActiveRentPrice),
});
