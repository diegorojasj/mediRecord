import H4 from "@/components/h4"
import { ExpandableCardList } from "@/components/expandable-card-list"
import SearchInput from "@/components/search-input"
import CreationFormApplication from "../application/creationForm.application"
import type { FormState } from "./creationForm/creationForm_types"
import type { Patient } from "@/types/type_patients"
import type { PatientOptions } from "@/lib/api/patients"
import { avatarColor } from "@/lib/utils"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon, FilterAddIcon, FilterRemoveIcon } from "@hugeicons/core-free-icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import AdvancedFilter, { type FilterValues } from "./advancedFilter"

const SEX_LABEL: Record<string, string> = { M: "Male", F: "Female", other: "Other" }

const EMPTY_OPTIONS: PatientOptions = {
    sex: [], bloodGroup: [], maritalStatus: [],
    educationLevel: [], insuranceType: [], primaryLanguage: [],
}

function fullName(p: Patient) {
    return [p.first_name, p.first_surname, p.second_surname].filter(Boolean).join(" ")
}

function initials(p: Patient) {
    return `${p.first_name[0]}${p.first_surname[0]}`.toUpperCase()
}

function age(dob: string) {
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
}

function patientToFormState(p: Patient): FormState {
    return {
        national_id: p.national_id,
        national_id_issued_in: p.national_id_issued_in,
        tax_id: p.tax_id ?? "",
        first_name: p.first_name,
        first_surname: p.first_surname,
        second_surname: p.second_surname ?? "",
        date_of_birth: p.date_of_birth,
        sex: p.sex,
        marital_status: p.marital_status ?? "",
        occupation: p.occupation ?? "",
        education_level: p.education_level ?? "",
        blood_group: p.blood_group ?? "",
        primary_language: p.primary_language,
        indigenous_community: p.indigenous_community ?? "",
        phone: p.phone,
        alternative_phone: p.alternative_phone ?? "",
        email: p.email ?? "",
        street: p.address.street,
        address_number: p.address.number ?? "",
        zone_neighborhood: p.address.zone_neighborhood ?? "",
        city: p.address.city,
        state_province: p.address.state_province,
        reference: p.address.reference ?? "",
        country: p.address.country,
        emergency_name: p.emergency_contact?.name ?? "",
        emergency_relationship: p.emergency_contact?.relationship ?? "",
        emergency_phone: p.emergency_contact?.phone ?? "",
        insurance_type: p.health_insurance?.type ?? "",
        insurance_affiliation_number: p.health_insurance?.affiliation_number ?? "",
        insurance_provider: p.health_insurance?.provider ?? "",
        administrative_notes: p.administrative_notes ?? "",
    }
}

function SectionLabel({ children }: { children: string }) {
    return (
        <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {children}
        </p>
    )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null
    return (
        <div className="flex items-baseline gap-1 min-w-0">
            <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{label}:</span>
            <span className="truncate text-[11px] font-medium text-foreground">{value}</span>
        </div>
    )
}

const INITIAL_ADVANCED: FilterValues = {
    document: "", sex: "", dateOfBirth: "", bloodGroup: "",
    maritalStatus: "", education: "", occupation: "", language: "",
    phone: "", email: "", city: "", stateProvince: "", country: "",
    recordNumber: "", insuranceType: "", affiliationNumber: "", insuranceProvider: "",
}

function matchesFilters(p: Patient, search: string, adv: FilterValues): boolean {
    if (search && !fullName(p).toLowerCase().includes(search.toLowerCase())) return false
    if (adv.document && !p.national_id.includes(adv.document)) return false
    if (adv.sex && p.sex !== adv.sex) return false
    if (adv.dateOfBirth && p.date_of_birth !== adv.dateOfBirth) return false
    if (adv.bloodGroup && p.blood_group !== adv.bloodGroup) return false
    if (adv.maritalStatus && p.marital_status !== adv.maritalStatus) return false
    if (adv.education && p.education_level !== adv.education) return false
    if (adv.occupation && !p.occupation?.toLowerCase().includes(adv.occupation.toLowerCase())) return false
    if (adv.language && p.primary_language !== adv.language) return false
    if (adv.phone && !p.phone?.includes(adv.phone)) return false
    if (adv.email && !p.email?.toLowerCase().includes(adv.email.toLowerCase())) return false
    if (adv.city && !p.address.city.toLowerCase().includes(adv.city.toLowerCase())) return false
    if (adv.stateProvince && !p.address.state_province.toLowerCase().includes(adv.stateProvince.toLowerCase())) return false
    if (adv.country && !p.address.country.toLowerCase().includes(adv.country.toLowerCase())) return false
    if (adv.recordNumber && !p.record_number.includes(adv.recordNumber)) return false
    if (adv.insuranceType && p.health_insurance?.type !== adv.insuranceType) return false
    if (adv.affiliationNumber && !p.health_insurance?.affiliation_number?.includes(adv.affiliationNumber)) return false
    if (adv.insuranceProvider && !p.health_insurance?.provider?.toLowerCase().includes(adv.insuranceProvider.toLowerCase())) return false
    return true
}

const PatientsPresentation = ({
    patients,
    options,
    loading,
    error,
    onRefresh,
}: {
    patients: Patient[]
    options: PatientOptions | null
    loading?: boolean
    error?: string | null
    onRefresh?: () => void
}) => {
    const resolvedOptions = options ?? EMPTY_OPTIONS
    const [selectedPatient, setSelectedPatient] = useState<{ formState: FormState; id: string } | undefined>()
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false)
    const [advancedFilterUsed, setAdvancedFilterUsed] = useState(false)
    const [clearSignal, setClearSignal] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>(INITIAL_ADVANCED)

    const filteredPatients = patients.filter(p => matchesFilters(p, searchQuery, advancedFilters))

    const onEdit = (patient: Patient) => {
        setSelectedPatient({ formState: patientToFormState(patient), id: patient.id })
    }

    const onClose = () => setSelectedPatient(undefined)

    const onSaved = () => {
        setSelectedPatient(undefined)
        onRefresh?.()
    }

    return (
        <div className="p-6 space-y-4">
            <H4>Patients</H4>
            <div className="flex gap-2">
                <div className="flex flex-1">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} />
                    <div className="flex ml-1 items-end gap-0.5">
                        <Tooltip delayDuration={800}>
                            <TooltipTrigger>
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    onClick={() => setAdvancedFilterOpen(!advancedFilterOpen)}
                                >
                                    <HugeiconsIcon icon={FilterAddIcon} size={20} strokeWidth={2} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Advanced filter</p>
                            </TooltipContent>
                        </Tooltip>
                        {advancedFilterUsed && (
                            <Tooltip delayDuration={800}>
                                <TooltipTrigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                                        onClick={() => setClearSignal(s => s + 1)}
                                    >
                                        <HugeiconsIcon icon={FilterRemoveIcon} size={20} strokeWidth={2} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Clear filters</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-end">
                    <CreationFormApplication
                        initialData={selectedPatient?.formState}
                        patientId={selectedPatient?.id}
                        options={resolvedOptions}
                        onClose={onClose}
                        onSaved={onSaved}
                    />
                </div>
            </div>
            <AdvancedFilter
                open={advancedFilterOpen}
                clearSignal={clearSignal}
                options={resolvedOptions}
                onUsedChange={setAdvancedFilterUsed}
                onFilterChange={setAdvancedFilters}
            />

            {loading && <p className="text-sm text-muted-foreground">Loading patients…</p>}
            {error && <p className="text-sm text-destructive">Error: {error}</p>}

            {!loading && !error && (
                <ExpandableCardList
                    items={filteredPatients}
                    getKey={(p) => p.id}

                    renderRow={(p) => (
                        <div className="flex items-center gap-3 w-full pr-2">
                            <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(fullName(p))}`}>
                                {initials(p)}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-foreground truncate">{fullName(p)}</span>
                                <span className="block text-xs text-muted-foreground">{p.record_number} · {p.phone}</span>
                            </span>
                            <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">
                                {age(p.date_of_birth)} yrs · {SEX_LABEL[p.sex]}
                            </span>
                            {p.blood_group && (
                                <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold text-foreground">
                                    {p.blood_group}
                                </span>
                            )}
                        </div>
                    )}

                    renderDetail={(p) => (
                        <div className="relative">
                            <div className="absolute -top-1 right-0">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    onClick={() => onEdit(p)}
                                >
                                    <HugeiconsIcon icon={PencilEdit01Icon} size={12} strokeWidth={2} />
                                </button>
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <div className="min-w-[140px] flex-1">
                                    <SectionLabel>Personal</SectionLabel>
                                    <div className="flex flex-col gap-px">
                                        <DetailRow label="DOB" value={new Date(p.date_of_birth).toLocaleDateString()} />
                                        <DetailRow label="ID" value={`${p.national_id} (${p.national_id_issued_in})`} />
                                        <DetailRow label="Status" value={p.marital_status} />
                                        <DetailRow label="Occupation" value={p.occupation} />
                                        <DetailRow label="Education" value={p.education_level} />
                                        <DetailRow label="Language" value={p.primary_language} />
                                        <DetailRow label="Community" value={p.indigenous_community} />
                                        <DetailRow label="Tax ID" value={p.tax_id} />
                                    </div>
                                </div>

                                <div className="min-w-[140px] flex-1">
                                    <SectionLabel>Contact</SectionLabel>
                                    <div className="flex flex-col gap-px">
                                        <DetailRow label="Phone" value={p.phone} />
                                        <DetailRow label="Alt." value={p.alternative_phone} />
                                        <DetailRow label="Email" value={p.email} />
                                        <DetailRow label="Address" value={[p.address.street, p.address.number, p.address.city, p.address.state_province].filter(Boolean).join(", ")} />
                                        <DetailRow label="Zone" value={p.address.zone_neighborhood} />
                                        <DetailRow label="Ref." value={p.address.reference} />
                                    </div>
                                </div>

                                <div className="min-w-[120px] flex-1">
                                    <SectionLabel>Emergency</SectionLabel>
                                    {p.emergency_contact ? (
                                        <div className="flex flex-col gap-px">
                                            <DetailRow label="Name" value={p.emergency_contact.name} />
                                            <DetailRow label="Rel." value={p.emergency_contact.relationship} />
                                            <DetailRow label="Phone" value={p.emergency_contact.phone} />
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-muted-foreground">—</p>
                                    )}

                                    <p className="mb-0.5 mt-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Insurance</p>
                                    {p.health_insurance ? (
                                        <div className="flex flex-col gap-px">
                                            <DetailRow label="Type" value={p.health_insurance.type} />
                                            <DetailRow label="Affil." value={p.health_insurance.affiliation_number} />
                                            <DetailRow label="Provider" value={p.health_insurance.provider} />
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-muted-foreground">—</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                />
            )}
        </div>
    )
}

export default PatientsPresentation
