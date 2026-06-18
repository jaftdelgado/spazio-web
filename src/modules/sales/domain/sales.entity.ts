"use client";

export interface FormalizeSaleInput {
  propertyUuid: string;
  agreedAmount: number;
}

export interface SaleFormalization {
  transactionUuid: string;
  contractUuid: string;
  propertyUuid: string;
  status: string;
  finalAmount: number;
  currency: string;
}
