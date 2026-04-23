import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"

type SelectOption = { value: string; label: string }
type FilterOptions = {
    sex: SelectOption[]
    bloodGroup: SelectOption[]
    maritalStatus: SelectOption[]
    educationLevel: SelectOption[]
    insuranceType: SelectOption[]
    primaryLanguage: SelectOption[]
}

export type FilterValues = {
    document: string
    sex: string
    dateOfBirth: string
    bloodGroup: string
    maritalStatus: string
    education: string
    occupation: string
    language: string
    phone: string
    email: string
    city: string
    stateProvince: string
    country: string
    recordNumber: string
    insuranceType: string
    affiliationNumber: string
    insuranceProvider: string
}

const INITIAL_FILTER: FilterValues = {
    document: "", sex: "", dateOfBirth: "", bloodGroup: "",
    maritalStatus: "", education: "", occupation: "", language: "",
    phone: "", email: "", city: "", stateProvince: "", country: "",
    recordNumber: "", insuranceType: "", affiliationNumber: "", insuranceProvider: "",
}

function SectionLabel({ children }: { children: string }) {
    return (
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {children}
        </p>
    )
}

function FilterInput({ label, placeholder, type = "text", value, onChange }: {
    label: string; placeholder?: string; type?: string
    value: string; onChange: (v: string) => void
}) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-medium text-muted-foreground">{label}</Label>
            <Input
                className="h-7 text-xs bg-background"
                placeholder={placeholder ?? label}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}

function FilterSelect({ label, options, value, onChange }: {
    label: string; options: { value: string; label: string }[]
    value: string; onChange: (v: string) => void
}) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-medium text-muted-foreground">{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-7 w-full text-xs">
                    <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                    {options.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

const AdvancedFilter = ({ open, clearSignal, options, onUsedChange, onFilterChange }: {
    open: boolean
    clearSignal: number
    options: FilterOptions
    onUsedChange: (isUsed: boolean) => void
    onFilterChange?: (filters: FilterValues) => void
}) => {
    const [filters, setFilters] = useState<FilterValues>(INITIAL_FILTER)
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return }
        setFilters(INITIAL_FILTER)
        onUsedChange(false)
        onFilterChange?.(INITIAL_FILTER)
    }, [clearSignal])

    const set = (key: keyof FilterValues) => (value: string) => {
        const next = { ...filters, [key]: value }
        setFilters(next)
        onUsedChange(Object.values(next).some(v => v !== ""))
        onFilterChange?.(next)
    }

    return (
        <Accordion value={open ? "1" : undefined} type="single" className="w-full border-0 rounded-none overflow-visible" collapsible>
            <AccordionItem value="1" className="bg-card data-[state=open]:bg-card">
                <AccordionContent className="px-3">
                    <div className="pt-3 space-y-4">

                        <div>
                            <SectionLabel>Personal</SectionLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-2">
                                <FilterInput label="Document" placeholder="National ID" value={filters.document} onChange={set("document")} />
                                <FilterSelect label="Sex" options={options.sex} value={filters.sex} onChange={set("sex")} />
                                <FilterInput label="Date of birth" type="date" value={filters.dateOfBirth} onChange={set("dateOfBirth")} />
                                <FilterSelect label="Blood group" options={options.bloodGroup} value={filters.bloodGroup} onChange={set("bloodGroup")} />
                                <FilterSelect label="Marital status" options={options.maritalStatus} value={filters.maritalStatus} onChange={set("maritalStatus")} />
                                <FilterSelect label="Education" options={options.educationLevel} value={filters.education} onChange={set("education")} />
                                <FilterInput label="Occupation" value={filters.occupation} onChange={set("occupation")} />
                                <FilterSelect label="Language" options={options.primaryLanguage} value={filters.language} onChange={set("language")} />
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Contact</SectionLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-2">
                                <FilterInput label="Phone" placeholder="+591..." value={filters.phone} onChange={set("phone")} />
                                <FilterInput label="Email" type="email" value={filters.email} onChange={set("email")} />
                                <FilterInput label="City" value={filters.city} onChange={set("city")} />
                                <FilterInput label="State / Province" value={filters.stateProvince} onChange={set("stateProvince")} />
                                <FilterInput label="Country" value={filters.country} onChange={set("country")} />
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Administrative</SectionLabel>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-2">
                                <FilterInput label="Record number" placeholder="EXP-2026-..." value={filters.recordNumber} onChange={set("recordNumber")} />
                                <FilterSelect label="Insurance type" options={options.insuranceType} value={filters.insuranceType} onChange={set("insuranceType")} />
                                <FilterInput label="Affiliation number" value={filters.affiliationNumber} onChange={set("affiliationNumber")} />
                                <FilterInput label="Insurance provider" value={filters.insuranceProvider} onChange={set("insuranceProvider")} />
                            </div>
                        </div>

                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default AdvancedFilter
