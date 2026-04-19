import { AVATAR_PALETTE } from "@/consts/const_global"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function avatarColor(name: string) {
    const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}