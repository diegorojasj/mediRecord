import H4 from "@/components/h4"
import { ExpandableCardList } from "@/components/expandable-card-list"

type PatientStatus = "Critical" | "Stable" | "Monitoring"

type Patient = {
    id: string
    name: string
    initials: string
    bed: string
    ward: string
    status: PatientStatus
    lastCheckIn: string
    diagnosis: string
    allergies: string
    vitals: { bp: string; pulse: string; temp: string }
    medications: string[]
}

const MOCK_PATIENTS: Patient[] = [
    {
        id: "p1",
        name: "John Doe",
        initials: "JD",
        bed: "42",
        ward: "ICU",
        status: "Critical",
        lastCheckIn: "10 min ago",
        diagnosis: "Acute myocardial infarction",
        allergies: "Penicillin, Aspirin",
        vitals: { bp: "140/90 mmHg", pulse: "102", temp: "38.4 °C" },
        medications: ["Metoprolol 50mg", "Atorvastatin 40mg", "Heparin IV"],
    },
    {
        id: "p2",
        name: "Maria Garcia",
        initials: "MG",
        bed: "17",
        ward: "General",
        status: "Stable",
        lastCheckIn: "1 hr ago",
        diagnosis: "Type 2 Diabetes — routine follow-up",
        allergies: "None known",
        vitals: { bp: "118/76 mmHg", pulse: "72", temp: "36.8 °C" },
        medications: ["Metformin 500mg", "Lisinopril 10mg"],
    },
    {
        id: "p3",
        name: "Robert Kim",
        initials: "RK",
        bed: "08",
        ward: "Cardiology",
        status: "Monitoring",
        lastCheckIn: "35 min ago",
        diagnosis: "Atrial fibrillation — post-cardioversion",
        allergies: "Sulfonamides",
        vitals: { bp: "125/82 mmHg", pulse: "88", temp: "37.1 °C" },
        medications: ["Warfarin 5mg", "Digoxin 0.25mg", "Amiodarone 200mg"],
    },
]

const statusStyles: Record<PatientStatus, string> = {
    Critical: "bg-red-50 text-red-700 border border-red-200",
    Stable: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Monitoring: "bg-amber-50 text-amber-700 border border-amber-200",
}

const avatarPalette = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-teal-100 text-teal-700",
    "bg-rose-100 text-rose-700",
    "bg-orange-100 text-orange-700",
]

function avatarColor(name: string) {
    const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    return avatarPalette[hash % avatarPalette.length]
}

const PatientsApplication = () => {
    return (
        <div className="p-6 space-y-4">
            <H4>Patients</H4>

            <ExpandableCardList
                items={MOCK_PATIENTS}
                getKey={(p) => p.id}

                renderRow={(p) => (
                    <div className="flex items-center gap-3 w-full pr-2">
                        {/* Initials avatar */}
                        <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(p.name)}`}>
                            {p.initials}
                        </span>

                        {/* Identity */}
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-foreground truncate">{p.name}</span>
                            <span className="block text-xs text-muted-foreground">Bed {p.bed} · {p.ward}</span>
                        </span>

                        {/* Last check-in */}
                        <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">{p.lastCheckIn}</span>

                        {/* Status pill */}
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[p.status]}`}>
                            {p.status}
                        </span>
                    </div>
                )}

                renderDetail={(p) => (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
                            {/* Vitals */}
                            <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vitals</p>
                                <dl className="space-y-0.5">
                                    <div className="flex gap-1.5"><dt className="text-muted-foreground">BP</dt><dd className="font-medium">{p.vitals.bp}</dd></div>
                                    <div className="flex gap-1.5"><dt className="text-muted-foreground">Pulse</dt><dd className="font-medium">{p.vitals.pulse} bpm</dd></div>
                                    <div className="flex gap-1.5"><dt className="text-muted-foreground">Temp</dt><dd className="font-medium">{p.vitals.temp}</dd></div>
                                </dl>
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Diagnosis</p>
                                <p className="text-foreground">{p.diagnosis}</p>
                            </div>

                            {/* Allergies */}
                            <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Allergies</p>
                                <p className="font-medium text-red-600">{p.allergies}</p>
                            </div>

                            {/* Medications */}
                            <div>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Meds</p>
                                <ul className="space-y-1 text-foreground">
                                    {p.medications.map((med) => (
                                        <li key={med} className="flex items-center gap-1.5">
                                            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                                            {med}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                View Full Chart
                            </button>
                            <button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors">
                                Update Vitals
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    )
}

export default PatientsApplication
