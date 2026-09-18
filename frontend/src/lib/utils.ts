import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { AVATAR_PALETTE } from '@/consts/const_global';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function avatarColor(name: string) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export type SelectOption<T extends string> = { value: T; label: string };

export function toOptions<T extends string>(values: T[]): SelectOption<T>[] {
  return values.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
}

export async function fetchConst<T extends string>(base: string, path: string): Promise<SelectOption<T>[]> {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return toOptions<T>(await res.json());
}

export const toDateTimeLocal = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");
