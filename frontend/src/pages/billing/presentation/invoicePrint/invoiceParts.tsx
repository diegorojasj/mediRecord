import type { ReactNode } from 'react';
import { present } from './invoice_functions';
import type { Field } from './invoice_types';

// Small primitives every invoice section is built from

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="ci-section-title">{children}</h2>;
}

// Label column + value column, used by the parties block
export function FieldList({ fields }: { fields: Field[] }) {
  return (
    <dl className="ci-fields">
      {present(fields).map((field) => (
        <div key={field.label} className="ci-fields__row">
          <dt className="ci-caption">{field.label}</dt>
          <dd className={field.mono ? 'ci-mono' : undefined}>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Label stacked over value, used by the facts strip
export function Fact({ field }: { field: Field }) {
  return (
    <div className="ci-fact">
      <dt className="ci-caption">{field.label}</dt>
      <dd className={field.mono ? 'ci-mono' : undefined}>{field.value}</dd>
    </div>
  );
}

export function MoneyRow({
  label,
  value,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: 'muted' | 'total' | 'due' | 'settled';
}) {
  return (
    <div className={tone ? `ci-money ci-money--${tone}` : 'ci-money'}>
      <dt>{label}</dt>
      <dd className="ci-mono">{value}</dd>
    </div>
  );
}
