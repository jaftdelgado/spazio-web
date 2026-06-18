import type {
  ContractsEntity,
  ContractListItemEntity,
} from "../domain/contracts.entity";

type ContractDetailDto = {
  contract_id: number;
  contract_uuid: string;
  property_title: string;
  owner_name: string;
  client_name: string;
  agreed_amount: number;
  currency: string;
  period_name?: string;
  start_date: string;
  end_date?: string | null;
  status: string;
  pdf_url: string;
};

export type ContractListItemDto = {
  contract_id: number;
  contract_uuid: string;
  transaction_type: string;
  property_title: string;
  agreed_amount: number;
  currency: string;
  start_date: string;
  end_date?: string | null;
  status: string;
  client_name: string;
  created_at: string;
};

export function mapContract(dto: ContractDetailDto): ContractsEntity {
  return {
    contractId: dto.contract_id,
    contractUuid: dto.contract_uuid,
    propertyTitle: dto.property_title,
    ownerName: dto.owner_name,
    clientName: dto.client_name,
    agreedAmount: dto.agreed_amount,
    currency: dto.currency,
    periodName: dto.period_name,
    startDate: dto.start_date,
    endDate: dto.end_date,
    status: dto.status,
    pdfUrl: dto.pdf_url,
  };
}

export function mapContractListItem(
  dto: ContractListItemDto,
): ContractListItemEntity {
  return {
    contractId: dto.contract_id,
    contractUuid: dto.contract_uuid,
    transactionType: dto.transaction_type,
    propertyTitle: dto.property_title,
    agreedAmount: dto.agreed_amount,
    currency: dto.currency,
    startDate: dto.start_date,
    endDate: dto.end_date ?? null,
    status: dto.status,
    clientName: dto.client_name,
    createdAt: dto.created_at,
  };
}

export function mapContractList(
  dtoList: ContractListItemDto[],
): ContractListItemEntity[] {
  if (!Array.isArray(dtoList)) return [];
  return dtoList.map(mapContractListItem);
}

