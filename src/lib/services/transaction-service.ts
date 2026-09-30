import type {
  PaginatedResult,
  Transaction,
  TransactionFilters,
} from "../types";
import { readCollection } from "./browser-store";
import { clone, delay } from "./util";

export async function searchTransactions(
  filters: TransactionFilters = {},
): Promise<PaginatedResult<Transaction>> {
  let results = readCollection("transactions");

  if (filters.partnerId) {
    results = results.filter(
      (t) =>
        t.sourcePartnerId === filters.partnerId ||
        t.destinationPartnerId === filters.partnerId,
    );
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.hubReference.toLowerCase().includes(q) ||
        t.partnerReference.toLowerCase().includes(q),
    );
  }
  if (filters.transactionId) {
    const q = filters.transactionId.toLowerCase();
    results = results.filter((t) => t.id.toLowerCase().includes(q));
  }
  if (filters.partnerReference) {
    const q = filters.partnerReference.toLowerCase();
    results = results.filter((t) =>
      t.partnerReference.toLowerCase().includes(q),
    );
  }
  if (filters.senderMobile) {
    results = results.filter((t) =>
      t.senderMobileMasked.includes(filters.senderMobile!),
    );
  }
  if (filters.recipientMobile) {
    results = results.filter((t) =>
      t.recipientMobileMasked.includes(filters.recipientMobile!),
    );
  }
  if (filters.senderCountry) {
    results = results.filter((t) => t.senderCountry === filters.senderCountry);
  }
  if (filters.recipientCountry) {
    results = results.filter(
      (t) => t.recipientCountry === filters.recipientCountry,
    );
  }
  if (filters.type) results = results.filter((t) => t.type === filters.type);
  if (filters.status) results = results.filter((t) => t.status === filters.status);
  if (filters.corridorId)
    results = results.filter((t) => t.corridorId === filters.corridorId);
  if (filters.settlementStatus)
    results = results.filter(
      (t) => t.settlementStatus === filters.settlementStatus,
    );
  if (filters.dateFrom)
    results = results.filter((t) => t.createdAt >= filters.dateFrom!);
  if (filters.dateTo)
    results = results.filter((t) => t.createdAt <= filters.dateTo! + "T23:59:59Z");
  if (filters.amountMin != null)
    results = results.filter((t) => t.sendingAmount >= filters.amountMin!);
  if (filters.amountMax != null)
    results = results.filter((t) => t.sendingAmount <= filters.amountMax!);

  const total = results.length;
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return delay({ items: clone(items), total, page, pageSize }, 420);
}

export async function getTransaction(
  id: string,
): Promise<Transaction | undefined> {
  return delay(clone(readCollection("transactions").find((t) => t.id === id)), 300);
}
