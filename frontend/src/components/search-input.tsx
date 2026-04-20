"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SearchInput = ({ label="Search", placeholder="Search...", value, onChange } : {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
}) => (
  <div className="w-full max-w-sm space-y-2">
    <Label>{label}</Label>
    <div className="relative">
      <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
      <Input
        className="bg-background pl-9"
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  </div>
)

export default SearchInput
