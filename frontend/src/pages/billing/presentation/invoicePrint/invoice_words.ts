import type { Currency } from '@/types/billing_type';

// "One hundred fifty and 00/100 Bolivianos" — the literal amount printed under the total

const EN_UNITS = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
]; // prettier-ignore
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']; // prettier-ignore

const CURRENCY_NAME: Record<Currency, string> = {
  BOB: 'Bolivianos',
  USD: 'US dollars',
};

function enBelowThousand(n: number): string {
  const rest = n % 100;
  const tail =
    rest < 20
      ? EN_UNITS[rest]
      : EN_TENS[Math.floor(rest / 10)] + (rest % 10 ? `-${EN_UNITS[rest % 10]}` : '');
  const hundreds = Math.floor(n / 100);
  return [hundreds > 0 && `${EN_UNITS[hundreds]} hundred`, tail].filter(Boolean).join(' ');
}

function enWords(n: number): string {
  if (n === 0) return 'zero';
  const scales: [number, string][] = [
    [1e9, 'billion'],
    [1e6, 'million'],
    [1e3, 'thousand'],
  ];
  const parts: string[] = [];
  let remaining = n;
  for (const [size, name] of scales) {
    const count = Math.floor(remaining / size);
    if (count > 0) parts.push(`${enWords(count)} ${name}`);
    remaining %= size;
  }
  if (remaining > 0) parts.push(enBelowThousand(remaining));
  return parts.join(' ');
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function amountInWords(value: number, currency: Currency): string {
  const cents = Math.round(Math.abs(value) * 100);
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');
  return `${capitalize(enWords(whole))} and ${fraction}/100 ${CURRENCY_NAME[currency]}`;
}
