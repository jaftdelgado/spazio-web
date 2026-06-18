export interface ContractsEntity {
  contractId: number;
  contractUuid: string;
  propertyTitle: string;
  ownerName: string;
  clientName: string;
  agreedAmount: number;
  currency: string;
  periodName?: string;
  startDate: string;
  endDate?: string | null;
  status: string;
  pdfUrl: string;
}

export interface ContractListItemEntity {
  contractId: number;
  contractUuid: string;
  transactionType: string;
  propertyTitle: string;
  agreedAmount: number;
  currency: string;
  startDate: string;
  endDate?: string | null;
  status: string;
  clientName: string;
  createdAt: string;
}

export interface ContractListFilters {
  page?: number;
  limit?: number;
  transactionType?: "rent" | "sale";
  statusId?: number;
  search?: string;
}

