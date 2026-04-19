import H4 from "@/components/h4"
import { ExpandableCardList } from "@/components/expandable-card-list"
import SearchInput from "@/components/search-input"
import CreationFormApplication from "../application/creationForm.application"
import type { FormState } from "./creationForm/creationForm_types"
import type { Patient } from "@/types/type_patients"
import { SEX_LABEL } from "@/consts/const_patients"
import { avatarColor } from "@/lib/utils"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon } from "@hugeicons/core-free-icons"

const patients_example: Patient[] = [
    {
        id: "p1",
        record_number: "EXP-2026-00001",
        national_id: "4821903",
        national_id_issued_in: "La Paz",
        first_name: "John",
        first_surname: "Doe",
        date_of_birth: "1980-03-15",
        sex: "M",
        marital_status: "married",
        occupation: "Engineer",
        education_level: "university",
        blood_group: "O+",
        primary_language: "english",
        phone: "+591 71234567",
        email: "john.doe@email.com",
        address: { street: "Av. 6 de Agosto", number: "1420", city: "La Paz", state_province: "La Paz", country: "Bolivia" },
        emergency_contact: { name: "Jane Doe", relationship: "Spouse", phone: "+591 71234568" },
        health_insurance: { type: "CNS", affiliation_number: "CNS-00123" },
        is_active: true,
    },
    {
        id: "p2",
        record_number: "EXP-2026-00002",
        national_id: "7634120",
        national_id_issued_in: "Santa Cruz",
        first_name: "Maria",
        first_surname: "García",
        second_surname: "López",
        date_of_birth: "1975-08-22",
        sex: "F",
        marital_status: "single",
        occupation: "Teacher",
        education_level: "postgraduate",
        blood_group: "A+",
        primary_language: "spanish",
        phone: "+591 76543210",
        email: "maria.garcia@email.com",
        address: { street: "Calle Independencia", number: "305", zone_neighborhood: "Equipetrol", city: "Santa Cruz", state_province: "Santa Cruz", country: "Bolivia" },
        emergency_contact: { name: "Carlos García", relationship: "Brother", phone: "+591 76543211" },
        health_insurance: { type: "SUS" },
        is_active: true,
    },
    {
        id: "p3",
        record_number: "EXP-2026-00003",
        national_id: "3912847",
        national_id_issued_in: "Cochabamba",
        first_name: "Robert",
        first_surname: "Kim",
        date_of_birth: "1990-11-05",
        sex: "M",
        blood_group: "B-",
        primary_language: "english",
        phone: "+591 72109876",
        address: { street: "Av. Heroínas", number: "88", city: "Cochabamba", state_province: "Cochabamba", country: "Bolivia" },
        health_insurance: { type: "private", provider: "BUPA Bolivia" },
        is_active: true,
    },
]

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

const PatientsPresentation = () => {
    const [patientSelected, setPatientSelected] = useState<FormState | undefined>()

    const onEdit = (patient: Patient) => {
        setPatientSelected(patientToFormState(patient))
    }

    const onClose = () => {
        setPatientSelected(undefined)
    }

    return (
        <div className="p-6 space-y-4">
            <H4>Patients</H4>
            <div className="flex gap-2">
                <div className="flex-1">
                    <SearchInput />
                </div>
                <div className="flex-shrink-0 flex items-end">
                    <CreationFormApplication initialData={patientSelected} onClose={onClose} />
                </div>
            </div>

            <ExpandableCardList
                items={patients_example}
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
        </div>
    )
}

export default PatientsPresentation
