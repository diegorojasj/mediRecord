import { Delete02Icon, Hospital01Icon, ImageUpload01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type ChangeEvent, type ReactNode, type SyntheticEvent, useRef } from 'react';
import H4 from '@/components/h4';
import { APP_NAME } from '@/consts/const_global';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { LOGO_ACCEPT } from './business_functions';
import type { FormState, TextField } from './business_types';

type SetField = (
  key: TextField,
) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

function TextInput({
  id,
  label,
  form,
  set,
  type = 'text',
  placeholder,
  required,
}: {
  id: TextField;
  label: string;
  form: FormState;
  set: SetField;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <Field>
      <Label htmlFor={id}>
        {label}
        {required && ' *'}
      </Label>
      <Input
        id={id}
        type={type}
        value={form[id]}
        onChange={set(id)}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="px-5 py-5">
      <FieldSet>
        <FieldLegend>{title}</FieldLegend>
        <FieldGroup>{children}</FieldGroup>
      </FieldSet>
    </Card>
  );
}

function LogoPicker({
  logo,
  error,
  onPick,
  onRemove,
}: {
  logo: string;
  error: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Field>
      <Label htmlFor="logo">Logo</Label>
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
          {logo ? (
            <img src={logo} alt="Clinic logo" className="size-full object-contain p-1" />
          ) : (
            <HugeiconsIcon
              icon={Hospital01Icon}
              size={28}
              strokeWidth={1.4}
              className="text-muted-foreground"
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              <HugeiconsIcon icon={ImageUpload01Icon} size={14} strokeWidth={2} />
              {logo ? 'Change' : 'Upload'}
            </Button>
            {logo && (
              <Button type="button" variant="ghost" onClick={onRemove}>
                <HugeiconsIcon icon={Delete02Icon} size={14} strokeWidth={2} />
                Remove
              </Button>
            )}
          </div>
          <FieldDescription>PNG, JPG, WebP or SVG. Square logos look best.</FieldDescription>
        </div>
      </div>
      <input
        ref={inputRef}
        id="logo"
        type="file"
        accept={LOGO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          // Allow picking the same file again after removing it
          e.target.value = '';
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </Field>
  );
}

// How the clinic heads its printed invoices
function HeaderPreview({ form }: { form: FormState }) {
  const joinParts = (...parts: string[]) => parts.filter(Boolean).join(' · ');
  const registration = joinParts(
    form.tax_id && `NIT ${form.tax_id}`,
    form.health_license && `Lic. ${form.health_license}`,
  );
  const place = [form.address, form.city, form.country].filter(Boolean).join(', ');
  const contact = joinParts(form.phone, form.mobile, form.email, form.website);

  return (
    <Card className="gap-3 px-5 py-5">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        Invoice header preview
      </p>
      <div className="rounded-md bg-white p-4 text-neutral-900 ring-1 ring-neutral-200">
        <div className="flex items-start gap-3">
          {form.logo && <img src={form.logo} alt="" className="size-12 shrink-0 object-contain" />}
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-sm font-bold">{form.name || APP_NAME}</p>
            {form.slogan && <p className="text-[11px] italic text-neutral-500">{form.slogan}</p>}
            {form.legal_name && <p className="text-[10px] text-neutral-600">{form.legal_name}</p>}
            {registration && <p className="text-[10px] text-neutral-600">{registration}</p>}
            {place && <p className="whitespace-pre-line text-[10px] text-neutral-600">{place}</p>}
            {contact && <p className="text-[10px] text-neutral-600">{contact}</p>}
          </div>
        </div>
      </div>
    </Card>
  );
}

const BusinessPresentation = ({
  form,
  dirty,
  loading,
  loadError,
  saving,
  error,
  logoError,
  justSaved,
  set,
  onPickLogo,
  onRemoveLogo,
  onReset,
  onSubmit,
}: {
  form: FormState;
  dirty: boolean;
  loading: boolean;
  loadError: string | null;
  saving: boolean;
  error: string | null;
  logoError: string | null;
  justSaved: boolean;
  set: SetField;
  onPickLogo: (file: File) => void;
  onRemoveLogo: () => void;
  onReset: () => void;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
}) => {
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6 sm:px-8">
        <H4>Business</H4>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6 sm:px-8">
        <H4>Business</H4>
        <p className="text-sm text-destructive">
          The business information could not be loaded: {loadError}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-5xl space-y-4 px-4 py-6 sm:px-8">
      <div>
        <H4>Business</H4>
        <p className="text-xs text-muted-foreground">
          The clinic's name, logo and contact details, shown in the sidebar, the browser tab and on
          every invoice. Without a name, the app uses {APP_NAME}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Section title="Identity">
            <LogoPicker
              logo={form.logo}
              error={logoError}
              onPick={onPickLogo}
              onRemove={onRemoveLogo}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput id="name" label="Name" placeholder={APP_NAME} form={form} set={set} />
              <TextInput
                id="legal_name"
                label="Legal name"
                placeholder="Razón social"
                form={form}
                set={set}
              />
            </div>
            <TextInput
              id="slogan"
              label="Slogan"
              placeholder="Caring for your health"
              form={form}
              set={set}
            />
          </Section>

          <Section title="Registration">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput id="tax_id" label="NIT" form={form} set={set} />
              <TextInput
                id="health_license"
                label="Health license"
                placeholder="Health ministry registration"
                form={form}
                set={set}
              />
            </div>
          </Section>

          <Section title="Contact">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput id="phone" label="Phone" type="tel" form={form} set={set} />
              <TextInput id="mobile" label="Mobile / WhatsApp" type="tel" form={form} set={set} />
              <TextInput id="email" label="Email" type="email" form={form} set={set} />
              <TextInput
                id="website"
                label="Website"
                placeholder="www.example.com"
                form={form}
                set={set}
              />
            </div>
          </Section>

          <Section title="Location">
            <Field>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={set('address')}
                placeholder="Street, number, zone"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput id="city" label="City" form={form} set={set} />
              <TextInput id="country" label="Country" form={form} set={set} />
            </div>
          </Section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <HeaderPreview form={form} />
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        {error && <p className="mr-auto text-xs text-destructive">{error}</p>}
        {!error && justSaved && !dirty && (
          <p className="mr-auto text-xs text-emerald-700 dark:text-emerald-400">Saved</p>
        )}
        <Button type="button" variant="outline" disabled={!dirty || saving} onClick={onReset}>
          Discard changes
        </Button>
        <Button type="submit" disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default BusinessPresentation;
