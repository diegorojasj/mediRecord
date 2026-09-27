import type { CSSProperties, Ref } from 'react';
import {
  computeTotals,
  DOCUMENT_TYPE_TEXT,
  formatAmount,
  formatDay,
  formatIssued,
  formatQuantity,
  METHOD_TEXT,
  present,
  SIN_TEXT,
  STATUS_TEXT,
} from './invoice_functions';
import type { InvoiceClinic, InvoiceTotals, InvoiceView } from './invoice_types';
import { amountInWords } from './invoice_words';
import { Fact, FieldList, MoneyRow, SectionTitle } from './invoiceParts';
import './invoice.css';

type SectionProps = { invoice: InvoiceView };

/* 1. Header: who issues (left) and which document this is (right) */
function SheetHeader({ invoice, clinic }: SectionProps & { clinic: InvoiceClinic }) {
  const registration = present([
    { label: 'Tax ID (NIT)', value: clinic.nit },
    { label: 'Health license', value: clinic.license },
  ]);

  return (
    <header className="ci-header">
      <div className="ci-issuer">
        {clinic.logoUrl ? (
          <img className="ci-issuer__logo" src={clinic.logoUrl} alt={`${clinic.name} logo`} />
        ) : (
          <div className="ci-issuer__monogram" aria-hidden="true">
            {clinic.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="ci-issuer__text">
          <p className="ci-issuer__name">{clinic.name}</p>
          {clinic.tagline && <p className="ci-issuer__tagline">{clinic.tagline}</p>}
          {clinic.legalName && <p className="ci-issuer__legal">{clinic.legalName}</p>}
          {registration.length > 0 && (
            <p className="ci-issuer__registration">
              {registration.map((field) => (
                <span key={field.label}>
                  {field.label} <span className="ci-mono">{field.value}</span>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="ci-doc">
        <h1 className="ci-doc__title">Invoice</h1>
        <p className="ci-doc__number">
          <span className="ci-caption">No.</span>
          <span className="ci-mono">{invoice.number}</span>
        </p>
        <span className={`ci-pill ci-pill--${invoice.status}`}>{STATUS_TEXT[invoice.status]}</span>
      </div>
    </header>
  );
}

/* 2. Facts strip: the reference data a front desk looks up first */
function FactsStrip({ invoice }: SectionProps) {
  const facts = present([
    {
      label: 'Issue date',
      value: formatIssued(invoice.issuedAt),
      mono: true,
    },
    {
      label: 'Payment method',
      value: METHOD_TEXT[invoice.payment.method],
    },
    { label: 'Currency', value: invoice.currency, mono: true },
    { label: 'Paid on', value: formatDay(invoice.payment.paidAt), mono: true },
  ]);

  return (
    <dl className="ci-facts" style={{ '--facts': facts.length } as CSSProperties}>
      {facts.map((field) => (
        <Fact key={field.label} field={field} />
      ))}
    </dl>
  );
}

/* 3. Parties: who pays and who was treated can differ (a parent, an insurer) */
function Parties({ invoice }: SectionProps) {
  return (
    <section className="ci-parties">
      <div className="ci-party">
        <SectionTitle>Billed to</SectionTitle>
        <FieldList
          fields={[
            { label: 'Name', value: invoice.billedTo.name },
            {
              label: DOCUMENT_TYPE_TEXT[invoice.billedTo.documentType],
              value: invoice.billedTo.document,
              mono: true,
            },
          ]}
        />
      </div>
      <div className="ci-party">
        <SectionTitle>Patient</SectionTitle>
        <FieldList
          fields={[
            { label: 'Name', value: invoice.patient.name },
            { label: 'ID', value: invoice.patient.document, mono: true },
            {
              label: 'Record no.',
              value: invoice.patient.record,
              mono: true,
            },
          ]}
        />
      </div>
    </section>
  );
}

function VoidNotice({ invoice }: SectionProps) {
  const voidedOn = formatIssued(invoice.payment.voidedAt);
  return (
    <section className="ci-void" role="note">
      <p className="ci-void__title">
        This invoice has been voided
        {voidedOn && <span className="ci-mono"> · {voidedOn}</span>}
      </p>
      {invoice.payment.voidReason && (
        <p>
          <span className="ci-caption">Reason</span> {invoice.payment.voidReason}
        </p>
      )}
    </section>
  );
}

/* 4. Services: code and unit columns only appear when some line uses them */
function ServiceLedger({ invoice, totals }: SectionProps & { totals: InvoiceTotals }) {
  const hasCode = invoice.items.some((item) => item.code);
  const hasUnit = invoice.items.some((item) => item.unit);

  return (
    <section>
      <SectionTitle>Services</SectionTitle>
      <table className="ci-ledger">
        <thead>
          <tr>
            <th className="ci-ledger__index">#</th>
            {hasCode && <th>Code</th>}
            <th className="ci-ledger__description">Description</th>
            {hasUnit && <th>Unit</th>}
            <th className="ci-num">Qty</th>
            <th className="ci-num">Unit price</th>
            <th className="ci-num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id}>
              <td className="ci-ledger__index ci-mono">{String(index + 1).padStart(2, '0')}</td>
              {hasCode && <td className="ci-mono ci-ledger__code">{item.code}</td>}
              <td className="ci-ledger__description">{item.description}</td>
              {hasUnit && <td className="ci-ledger__unit">{item.unit}</td>}
              <td className="ci-num ci-mono">{formatQuantity(item.quantity)}</td>
              <td className="ci-num ci-mono">{formatAmount(item.unitPrice)}</td>
              <td className="ci-num ci-mono">{formatAmount(totals.lines[index])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* 5. Summary: amount in words and notes beside the totals */
function Summary({ invoice, totals }: SectionProps & { totals: InvoiceTotals }) {
  const voided = invoice.status === 'voided';
  const settled = !voided && totals.total > 0 && totals.balance <= 0;

  return (
    <section className="ci-summary">
      <div className="ci-summary__aside">
        <div>
          <p className="ci-caption">Amount in words</p>
          <p className="ci-words">{amountInWords(totals.total, invoice.currency)}</p>
        </div>
        {invoice.notes && (
          <div>
            <p className="ci-caption">Notes</p>
            <p className="ci-notes">{invoice.notes}</p>
          </div>
        )}
      </div>

      <dl className="ci-totals">
        <MoneyRow label="Subtotal" value={formatAmount(totals.subtotal)} />
        {totals.discount > 0 && (
          <MoneyRow tone="muted" label="Discount" value={`−${formatAmount(totals.discount)}`} />
        )}
        <MoneyRow
          tone="total"
          label={
            <>
              Total <span className="ci-money__currency">{invoice.currency}</span>
            </>
          }
          value={
            <span className={voided ? 'ci-struck' : undefined}>{formatAmount(totals.total)}</span>
          }
        />
        {!voided && (
          <>
            <MoneyRow tone="muted" label="Paid" value={formatAmount(totals.paid)} />
            {settled ? (
              <MoneyRow tone="settled" label="Paid in full" value="✓" />
            ) : (
              <MoneyRow
                tone="due"
                label="Balance due"
                value={`${invoice.currency} ${formatAmount(totals.balance)}`}
              />
            )}
          </>
        )}
      </dl>
    </section>
  );
}

/* 6. Closing: tax authorization and signatures */
function Closing({ invoice }: SectionProps) {
  return (
    <section className="ci-closing">
      <dl className="ci-fiscal">
        <Fact
          field={{
            label: 'Tax status',
            value: SIN_TEXT[invoice.fiscal.status],
          }}
        />
        {invoice.fiscal.authorization && (
          <Fact
            field={{
              label: 'Authorization code (CUF)',
              value: invoice.fiscal.authorization,
              mono: true,
            }}
          />
        )}
      </dl>
      <div className="ci-signatures">
        <p className="ci-signature">Issued by</p>
        <p className="ci-signature">Received by</p>
      </div>
    </section>
  );
}

/* 7. Footer: how to reach the clinic */
function SheetFooter({ clinic }: { clinic: InvoiceClinic }) {
  const contact = [clinic.address, ...clinic.phones, clinic.email, clinic.website].filter(Boolean);
  return (
    <footer className="ci-footer">
      {contact.length > 0 && <p>{contact.join('  ·  ')}</p>}
      <p className="ci-footer__thanks">Thank you for your trust</p>
    </footer>
  );
}

// One invoice laid out as an A4 sheet; react-to-print targets `ref`
export function ClinicInvoice({
  ref,
  invoice,
  clinic,
  accent,
}: {
  ref?: Ref<HTMLDivElement>;
  invoice: InvoiceView;
  clinic: InvoiceClinic;
  accent?: string;
}) {
  const totals = computeTotals(invoice.items, invoice.discount, invoice.amountPaid);
  const voided = invoice.status === 'voided';
  const style = accent ? ({ '--accent': accent } as CSSProperties) : undefined;

  return (
    <div ref={ref} className="clinic-invoice" style={style}>
      <div className="ci-band" aria-hidden="true" />
      {voided && (
        <div className="ci-watermark" aria-hidden="true">
          <span>VOID</span>
        </div>
      )}

      <SheetHeader invoice={invoice} clinic={clinic} />
      <FactsStrip invoice={invoice} />
      <Parties invoice={invoice} />
      {voided && <VoidNotice invoice={invoice} />}
      <ServiceLedger invoice={invoice} totals={totals} />
      <Summary invoice={invoice} totals={totals} />
      <Closing invoice={invoice} />
      <SheetFooter clinic={clinic} />
    </div>
  );
}
