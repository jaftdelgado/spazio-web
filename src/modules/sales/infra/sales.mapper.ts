"use client";

import type { SaleFormalization } from "../domain/sales.entity";

type SaleFormalizationDTO = {
  transaction_uuid: string;
  contract_uuid: string;
  property_uuid: string;
  status: string;
  final_amount: number;
  currency: string;
};

export const mapSaleFormalization = (
  dto: SaleFormalizationDTO,
): SaleFormalization => ({
  transactionUuid: dto.transaction_uuid,
  contractUuid: dto.contract_uuid,
  propertyUuid: dto.property_uuid,
  status: dto.status,
  finalAmount: dto.final_amount,
  currency: dto.currency,
});
