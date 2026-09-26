import { Delete02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { ExpandableCardList } from '@/components/expandable-card-list';
import H4 from '@/components/h4';
import SearchInput from '@/components/search-input';
import { SelectField } from '@/components/selectField';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { BillingOptions } from '@/lib/api/billing';
import { cn } from '@/lib/utils';
import CreationFormApplication from '@/pages/billing/application/creationForm.application';
import type { Invoice, PaymentStatus } from '@/types/billing_type';
import type { Patient } from '@/types/patients_type';
import {
  balanceDue,
  canDelete,
  canEdit,
  formatDate,
  formatDateTime,
  formatMoney,
  invoiceToFormState,
  labelFor,
  patientName,
} from './billing_functions';
import type { FormState } from './creationForm/creationForm_types';
import DeleteDialog from './deleteDialog';

const ALL_STATUSES = 'all';

const STATUS_STYLE: Record<PaymentStatus, string> = {
  paid: 'border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400',
  partial: 'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400',
  pending: 'border-border text-muted-foreground',
  voided: 'border-destructive/40 text-destructive',
};

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

// Label/value pairs in two aligned columns
function DetailGrid({ rows }: { rows: { label: string; value?: string | null }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1">
      {rows
        .filter((row) => row.value)
        .map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {row.label}
            </dt>
            <dd className="truncate text-[11px] font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
    </dl>
  );
}

function ItemsTable({ invoice }: { invoice: Invoice }) {
  return (
    <table className="w-full text-[11px]">
      <thead>
        <tr className="text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          <th className="py-1 pr-2 font-semibold">Description</th>
          <th className="py-1 pr-2 text-right font-semibold">Qty</th>
          <th className="py-1 pr-2 text-right font-semibold">Unit price</th>
          <th className="py-1 text-right font-semibold">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item, index) => (
          <tr key={index} className="border-t border-dashed border-border">
            <td className="py-1 pr-2 text-foreground">
              {item.description}
              {item.sin_service_code && (
                <span className="ml-1 text-muted-foreground">({item.sin_service_code})</span>
              )}
            </td>
            <td className="py-1 pr-2 text-right tabular-nums">{Number(item.quantity)}</td>
            <td className="py-1 pr-2 text-right tabular-nums">
              {formatMoney(item.unit_price, invoice.currency)}
            </td>
            <td className="py-1 text-right tabular-nums">
              {formatMoney(item.subtotal, invoice.currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const BillingPresentation = ({
  invoices,
  patients,
  options,
  loading,
  error,
  pendingDelete,
  deleting,
  deleteError,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onRefresh,
}: {
  invoices: Invoice[];
  patients: Patient[];
  options: BillingOptions | null;
  loading: boolean;
  error: string | null;
  pendingDelete?: Invoice;
  deleting: boolean;
  deleteError: string | null;
  onRequestDelete: (invoice: Invoice) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onRefresh: () => void;
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<
    { formState: FormState; id: string; contentLocked: boolean } | undefined
  >();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);

  const patientById = new Map(patients.map((p) => [p.id, p]));
  const patientLabel = (inv: Invoice) => {
    const patient = patientById.get(inv.patient_id);
    return patient ? patientName(patient) : inv.receiver_name;
  };
  const statusLabel = (inv: Invoice) => labelFor(options?.paymentStatus ?? [], inv.payment_status);
  const methodLabel = (inv: Invoice) => labelFor(options?.paymentMethod ?? [], inv.payment_method);
  const sinLabel = (inv: Invoice) => labelFor(options?.sinStatus ?? [], inv.sin_status);

  const matchesSearch = (inv: Invoice) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return [
      inv.invoice_number,
      patientLabel(inv),
      inv.receiver_name,
      inv.receiver_document_number,
    ].some((text) => text?.toLowerCase().includes(q));
  };
  const filteredInvoices = invoices.filter(
    (inv) =>
      (statusFilter === ALL_STATUSES || inv.payment_status === statusFilter) && matchesSearch(inv),
  );

  const onEdit = (invoice: Invoice) => {
    setSelectedInvoice({
      formState: invoiceToFormState(invoice),
      id: invoice.id,
      contentLocked: invoice.sin_status === 'validated',
    });
  };

  const onClose = () => setSelectedInvoice(undefined);

  const onSaved = () => {
    setSelectedInvoice(undefined);
    onRefresh();
  };

  return (
    <div className="p-6 space-y-4">
      <H4>Billing</H4>
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-1">
          <SearchInput
            placeholder="Invoice number, patient or receiver"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        {options && (
          <div className="w-40 flex-shrink-0">
            <SelectField
              id="status_filter"
              label="Status"
              options={[{ value: ALL_STATUSES, label: 'All' }, ...options.paymentStatus]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        )}
        {options && (
          <div className="flex-shrink-0 flex items-end">
            <CreationFormApplication
              key={selectedInvoice?.id ?? 'new'}
              initialData={selectedInvoice?.formState}
              invoiceId={selectedInvoice?.id}
              contentLocked={selectedInvoice?.contentLocked}
              options={options}
              patients={patients}
              patientsLoading={loading}
              onClose={onClose}
              onSaved={onSaved}
            />
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading invoices…</p>}
      {error && <p className="text-sm text-destructive">Error: {error}</p>}

      {!loading && !error && filteredInvoices.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {invoices.length === 0 ? 'No invoices registered yet.' : 'No invoices match your search.'}
        </p>
      )}

      {!loading && !error && (
        <ExpandableCardList
          items={filteredInvoices}
          getKey={(inv) => inv.id}
          renderRow={(inv) => (
            <div className="flex items-center gap-3 w-full pr-2">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground truncate">
                  {patientLabel(inv)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {inv.invoice_number} · {formatDate(inv.issue_date)}
                </span>
              </span>
              <span
                className={cn(
                  'hidden sm:block shrink-0 text-sm font-semibold tabular-nums',
                  inv.payment_status === 'voided'
                    ? 'text-muted-foreground line-through'
                    : 'text-foreground',
                )}
              >
                {formatMoney(inv.total, inv.currency)}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
                  STATUS_STYLE[inv.payment_status],
                )}
              >
                {statusLabel(inv)}
              </span>
            </div>
          )}
          renderDetail={(inv) => (
            <div className="relative">
              <div className="absolute -top-1 right-0 flex gap-0.5">
                {canEdit(inv) && (
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Edit invoice"
                        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => onEdit(inv)}
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} size={12} strokeWidth={2} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {canDelete(inv) && (
                  <Tooltip delayDuration={800}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Delete invoice"
                        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                        onClick={() => onRequestDelete(inv)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex flex-col gap-4 pr-12 text-left text-[11px] leading-snug">
                <div className="flex flex-wrap gap-x-10 gap-y-4">
                  <div className="min-w-0">
                    <SectionLabel>Receiver</SectionLabel>
                    <DetailGrid
                      rows={[
                        { label: 'Name', value: inv.receiver_name },
                        {
                          label: inv.receiver_document_type,
                          value: inv.receiver_document_number,
                        },
                        { label: 'Issued', value: formatDateTime(inv.issue_date) },
                      ]}
                    />
                  </div>

                  <div className="min-w-0">
                    <SectionLabel>Payment</SectionLabel>
                    <DetailGrid
                      rows={[
                        { label: 'Method', value: methodLabel(inv) },
                        { label: 'Paid', value: formatMoney(inv.amount_paid, inv.currency) },
                        {
                          label: 'Balance',
                          value:
                            inv.payment_status === 'voided'
                              ? undefined
                              : formatMoney(balanceDue(inv), inv.currency),
                        },
                        { label: 'Paid on', value: formatDateTime(inv.paid_at) },
                        { label: 'Voided on', value: formatDateTime(inv.voided_at) },
                        { label: 'Reason', value: inv.void_reason },
                      ]}
                    />
                  </div>

                  <div className="min-w-0">
                    <SectionLabel>SIN</SectionLabel>
                    <DetailGrid
                      rows={[
                        { label: 'Status', value: sinLabel(inv) },
                        { label: 'CUF', value: inv.cuf },
                      ]}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <SectionLabel>Items</SectionLabel>
                  <ItemsTable invoice={inv} />
                  <div className="mt-2 ml-auto w-full max-w-56 space-y-0.5">
                    <DetailGrid
                      rows={[
                        { label: 'Subtotal', value: formatMoney(inv.subtotal, inv.currency) },
                        {
                          label: 'Discount',
                          value:
                            Number(inv.discount) > 0
                              ? `- ${formatMoney(inv.discount, inv.currency)}`
                              : undefined,
                        },
                        { label: 'Total', value: formatMoney(inv.total, inv.currency) },
                      ]}
                    />
                  </div>
                </div>

                {inv.notes && (
                  <div className="min-w-0">
                    <SectionLabel>Notes</SectionLabel>
                    <p className="whitespace-pre-line text-foreground">{inv.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        />
      )}

      <DeleteDialog
        invoiceNumber={pendingDelete?.invoice_number}
        deleting={deleting}
        error={deleteError}
        onConfirm={onConfirmDelete}
        onClose={onCancelDelete}
      />
    </div>
  );
};

export default BillingPresentation;
