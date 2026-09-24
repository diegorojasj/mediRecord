import { Delete02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { ExpandableCardList } from '@/components/expandable-card-list';
import H4 from '@/components/h4';
import SearchInput from '@/components/search-input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { DoctorOptions } from '@/lib/api/doctors';
import { avatarColor, cn } from '@/lib/utils';
import CreationFormApplication from '@/pages/config/application/doctors/creationForm.application';
import type { Doctor, DoctorStatus } from '@/types/doctors_type';
import type { FormState } from './creationForm/creationForm_types';
import DeleteDialog from './deleteDialog';
import {
  doctorToFormState,
  formatHourRanges,
  fullName,
  initials,
  labelFor,
  workingDaysCount,
} from './doctors_functions';

const STATUS_STYLE: Record<DoctorStatus, string> = {
  active: 'border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400',
  inactive: 'border-border text-muted-foreground',
  retired: 'border-border text-muted-foreground',
  not_available: 'border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400',
  suspended: 'border-destructive/40 text-destructive',
};

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

// Label/value pairs in two aligned columns
function DetailGrid({ rows }: { rows: { label: string; value?: string }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1">
      {rows
        .filter((row) => row.value)
        .map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {row.label}
            </dt>
            <dd className="truncate text-[11px] font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
    </dl>
  );
}

function matchesSearch(d: Doctor, search: string, specialtyLabel: string) {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    fullName(d).toLowerCase().includes(q) ||
    d.professional_registration_number.toLowerCase().includes(q) ||
    specialtyLabel.toLowerCase().includes(q)
  );
}

const DoctorsPresentation = ({
  doctors,
  options,
  loading,
  error,
  pendingDelete,
  deleting,
  deleteError,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
  onRefresh,
}: {
  doctors: Doctor[];
  options: DoctorOptions | null;
  loading: boolean;
  error: string | null;
  pendingDelete?: Doctor;
  deleting: boolean;
  deleteError: string | null;
  onRequestDelete: (doctor: Doctor) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onRefresh: () => void;
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<
    { formState: FormState; id: string } | undefined
  >();
  const [searchQuery, setSearchQuery] = useState('');

  const specialtyLabel = (d: Doctor) => labelFor(options?.specialty ?? [], d.specialty);
  const statusLabel = (d: Doctor) => labelFor(options?.status ?? [], d.status);
  const filteredDoctors = doctors.filter((d) => matchesSearch(d, searchQuery, specialtyLabel(d)));

  const onEdit = (doctor: Doctor) => {
    setSelectedDoctor({ formState: doctorToFormState(doctor), id: doctor.id });
  };

  const onClose = () => setSelectedDoctor(undefined);

  const onSaved = () => {
    setSelectedDoctor(undefined);
    onRefresh();
  };

  return (
    <div className="p-6 space-y-4">
      <H4>Doctors</H4>
      <div className="flex gap-2">
        <div className="flex flex-1">
          <SearchInput
            placeholder="Name, registration number or specialty"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        {options && (
          <div className="flex-shrink-0 flex items-end">
            <CreationFormApplication
              key={selectedDoctor?.id ?? 'new'}
              initialData={selectedDoctor?.formState}
              doctorId={selectedDoctor?.id}
              options={options}
              onClose={onClose}
              onSaved={onSaved}
            />
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading doctors…</p>}
      {error && <p className="text-sm text-destructive">Error: {error}</p>}

      {!loading && !error && filteredDoctors.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {doctors.length === 0 ? 'No doctors registered yet.' : 'No doctors match your search.'}
        </p>
      )}

      {!loading && !error && (
        <ExpandableCardList
          items={filteredDoctors}
          getKey={(d) => d.id}
          renderRow={(d) => (
            <div className="flex items-center gap-3 w-full pr-2">
              <span
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(fullName(d))}`}
              >
                {initials(d)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground truncate">
                  {fullName(d)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {specialtyLabel(d)} · {d.professional_registration_number}
                </span>
              </span>
              <span className="hidden sm:block shrink-0 text-xs text-muted-foreground">
                {workingDaysCount(d.schedule.week_days)} days/week
              </span>
              <span
                className={cn(
                  'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold',
                  STATUS_STYLE[d.status],
                )}
              >
                {statusLabel(d)}
              </span>
            </div>
          )}
          renderDetail={(d) => (
            <div className="relative">
              <div className="absolute -top-1 right-0 flex gap-0.5">
                <Tooltip delayDuration={800}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Edit doctor"
                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      onClick={() => onEdit(d)}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={12} strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={800}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Delete doctor"
                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                      onClick={() => onRequestDelete(d)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-wrap gap-x-10 gap-y-4 pr-12 text-left text-[11px] leading-snug">
                <div className="min-w-0">
                  <SectionLabel>Professional</SectionLabel>
                  <DetailGrid
                    rows={[
                      { label: 'Specialty', value: specialtyLabel(d) },
                      { label: 'Reg. No.', value: d.professional_registration_number },
                      { label: 'Phone', value: d.phone },
                    ]}
                  />
                </div>

                <div className="min-w-0">
                  <SectionLabel>Working hours</SectionLabel>
                  {workingDaysCount(d.schedule.week_days) > 0 ? (
                    <DetailGrid
                      rows={(options?.weekDays ?? []).map(({ value: day, label }) => {
                        const hours = d.schedule.week_days[day];
                        return {
                          label,
                          value: hours && hours.length > 0 ? formatHourRanges(hours) : undefined,
                        };
                      })}
                    />
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            </div>
          )}
        />
      )}

      <DeleteDialog
        doctorName={pendingDelete && fullName(pendingDelete)}
        deleting={deleting}
        error={deleteError}
        onConfirm={onConfirmDelete}
        onClose={onCancelDelete}
      />
    </div>
  );
};

export default DoctorsPresentation;
