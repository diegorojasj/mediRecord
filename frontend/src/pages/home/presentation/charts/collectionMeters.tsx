import { formatMoney } from '@/pages/billing/presentation/billing_functions';
import { formatAmount, formatPercent, type CurrencyTotals } from '../home_functions';
import { ChartCard } from './chartParts';

// Collected against invoiced, one meter per currency: amounts in BOB and USD are never added
export function CollectionMeters({ id, totals, takeaway }: { id: string; totals: CurrencyTotals[]; takeaway?: string }) {
  return (
    <ChartCard
      id={id}
      title="How much of what we billed has been paid?"
      subtitle="The filled part of each bar is the money already received. Cancelled (voided) invoices are not counted. Bolivianos and dollars are shown apart."
      takeaway={takeaway}
      table={{
        columns: ['Currency', 'Invoices', 'Billed', 'Received', 'Still owed', 'Paid'],
        rows: totals.map((row) => [
          row.currency,
          row.invoices,
          formatMoney(row.invoiced, row.currency),
          formatMoney(row.collected, row.currency),
          formatMoney(row.outstanding, row.currency),
          formatPercent(row.invoiced > 0 ? row.collected / row.invoiced : null),
        ]),
      }}
    >
      {totals.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No invoices in this period</p>
      ) : (
        <ul className="m-0 list-none space-y-5 p-0">
          {totals.map((row) => {
            const ratio = row.invoiced > 0 ? row.collected / row.invoiced : 0;
            return (
              <li key={row.currency}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {row.currency} · {row.invoices} invoices
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{formatPercent(ratio)}</span> paid
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full"
                  style={{ background: 'var(--meter-track)' }}
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(ratio * 100)}
                  aria-label={`${row.currency} paid`}
                >
                  <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: 'var(--meter-fill)' }} />
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  {[
                    ['Billed', row.invoiced],
                    ['Received', row.collected],
                    ['Still owed', row.outstanding],
                  ].map(([label, amount]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="m-0 truncate font-medium text-foreground">
                        {formatAmount(amount as number, row.currency)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}
