/**
 * GL Mapper - Transform GL entities to DTOs
 */

import type { JournalEntryDTO, JournalLineDTO } from "~/server/types/pt-pks/warehouse-transaction";

export class GLMapper {
  /**
   * Map JournalEntry to DTO
   */
  static toDTO(entry: any): JournalEntryDTO {
    return {
      id: entry.id,
      companyId: entry.companyId,
      entryNumber: entry.entryNumber,
      date: entry.date.toISOString(),
      sourceType: entry.sourceType,
      sourceId: entry.sourceId ?? undefined,
      memo: entry.memo ?? undefined,
      status: entry.status,
      postedAt: entry.postedAt?.toISOString(),
      postedById: entry.postedById ?? undefined,
      createdById: entry.createdById,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      lines: entry.lines?.map((line: any) => this.lineToDTO(line)) ?? [],
    };
  }

  /**
   * Map JournalLine to DTO
   */
  static lineToDTO(line: any): JournalLineDTO {
    return {
      id: line.id,
      entryId: line.entryId,
      accountId: line.accountId,
      accountCode: line.account?.code,
      accountName: line.account?.name,
      debit: parseFloat(line.debit.toString()),
      credit: parseFloat(line.credit.toString()),
      costCenter: line.costCenter ?? undefined,
      dept: line.dept ?? undefined,
      itemId: line.itemId ?? undefined,
      warehouseId: line.warehouseId ?? undefined,
      description: line.description ?? undefined,
    };
  }

  /**
   * Map array of JournalEntry to DTOs
   */
  static toDTOList(entries: any[]): JournalEntryDTO[] {
    return entries.map((entry) => this.toDTO(entry));
  }
}
