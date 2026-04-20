import { Button } from "@/components/ui/button"
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BLOOD_GROUP_OPTIONS, EDUCATION_LEVEL_OPTIONS, INSURANCE_TYPE_OPTIONS, MARITAL_STATUS_OPTIONS, PRIMARY_LANGUAGE_OPTIONS, SEX_OPTIONS } from "@/consts/const_patients"
import { SelectField } from "@/components/selectField"
import { type ChangeEvent, type SyntheticEvent } from "react"
import type { FormState } from "./creationForm/creationForm_types"

const CreationFormPresentation = ({ form, set, setSelect, onSubmit } : { form: FormState, set: (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; setSelect: (key: keyof FormState) => (value: string) => void; onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void }) => {
  return <form onSubmit={onSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle className="!text-gray-900 dark:!text-gray-50">Register Patient</SheetTitle>
            <SheetDescription>Fill in the patient details below.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6 px-6 py-6">

            {/* Identification */}
            <FieldSet>
              <FieldLegend>Identification</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="national_id">National ID *</Label>
                    <Input id="national_id" value={form.national_id} onChange={set("national_id")} required />
                  </Field>
                  <Field>
                    <Label htmlFor="national_id_issued_in">Issued In *</Label>
                    <Input id="national_id_issued_in" placeholder="e.g. La Paz, California" value={form.national_id_issued_in} onChange={set("national_id_issued_in")} required />
                  </Field>
                </div>
                <Field>
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input id="tax_id" value={form.tax_id} onChange={set("tax_id")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Personal Info */}
            <FieldSet>
              <FieldLegend>Personal Information</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input id="first_name" value={form.first_name} onChange={set("first_name")} required />
                  </Field>
                  <Field>
                    <Label htmlFor="first_surname">First Surname *</Label>
                    <Input id="first_surname" value={form.first_surname} onChange={set("first_surname")} required />
                  </Field>
                  <Field>
                    <Label htmlFor="second_surname">Second Surname</Label>
                    <Input id="second_surname" value={form.second_surname} onChange={set("second_surname")} />
                  </Field>
                  <Field>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} required />
                  </Field>
                  <SelectField id="sex" label="Sex *" options={SEX_OPTIONS} value={form.sex} onChange={setSelect("sex")} />
                  <SelectField id="marital_status" label="Marital Status" options={MARITAL_STATUS_OPTIONS} value={form.marital_status} onChange={setSelect("marital_status")} />
                  <SelectField id="education_level" label="Education Level" options={EDUCATION_LEVEL_OPTIONS} value={form.education_level} onChange={setSelect("education_level")} />
                  <SelectField id="blood_group" label="Blood Group" options={BLOOD_GROUP_OPTIONS} value={form.blood_group} onChange={setSelect("blood_group")} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" value={form.occupation} onChange={set("occupation")} />
                  </Field>
                  <SelectField id="primary_language" label="Primary Language" options={PRIMARY_LANGUAGE_OPTIONS} value={form.primary_language} onChange={setSelect("primary_language")} />
                </div>
                <Field>
                  <Label htmlFor="indigenous_community">Indigenous Community</Label>
                  <Input id="indigenous_community" value={form.indigenous_community} onChange={set("indigenous_community")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Contact */}
            <FieldSet>
              <FieldLegend>Contact</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} required />
                  </Field>
                  <Field>
                    <Label htmlFor="alternative_phone">Alternative Phone</Label>
                    <Input id="alternative_phone" type="tel" value={form.alternative_phone} onChange={set("alternative_phone")} />
                  </Field>
                </div>
                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={set("email")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Address */}
            <FieldSet>
              <FieldLegend>Address</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                  <Field>
                    <Label htmlFor="street">Street *</Label>
                    <Input id="street" value={form.street} onChange={set("street")} required />
                  </Field>
                  <Field className="sm:w-28">
                    <Label htmlFor="address_number">Number</Label>
                    <Input id="address_number" value={form.address_number} onChange={set("address_number")} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="zone_neighborhood">Zone / Neighborhood</Label>
                    <Input id="zone_neighborhood" value={form.zone_neighborhood} onChange={set("zone_neighborhood")} />
                  </Field>
                  <Field>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={form.city} onChange={set("city")} required />
                  </Field>
                  <Field>
                    <Label htmlFor="state_province">State / Province *</Label>
                    <Input id="state_province" value={form.state_province} onChange={set("state_province")} required />
                  </Field>
                  <Field>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={form.country} onChange={set("country")} />
                  </Field>
                </div>
                <Field>
                  <Label htmlFor="reference">Reference</Label>
                  <Input id="reference" placeholder="e.g. Near the park" value={form.reference} onChange={set("reference")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Emergency Contact */}
            <FieldSet>
              <FieldLegend>Emergency Contact</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="emergency_name">Name</Label>
                    <Input id="emergency_name" value={form.emergency_name} onChange={set("emergency_name")} />
                  </Field>
                  <Field>
                    <Label htmlFor="emergency_relationship">Relationship</Label>
                    <Input id="emergency_relationship" value={form.emergency_relationship} onChange={set("emergency_relationship")} />
                  </Field>
                </div>
                <Field>
                  <Label htmlFor="emergency_phone">Phone</Label>
                  <Input id="emergency_phone" type="tel" value={form.emergency_phone} onChange={set("emergency_phone")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Insurance */}
            <FieldSet>
              <FieldLegend>Health Insurance</FieldLegend>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectField id="insurance_type" label="Type" options={INSURANCE_TYPE_OPTIONS} value={form.insurance_type} onChange={setSelect("insurance_type")} />
                  <Field>
                    <Label htmlFor="insurance_affiliation_number">Affiliation Number</Label>
                    <Input id="insurance_affiliation_number" value={form.insurance_affiliation_number} onChange={set("insurance_affiliation_number")} />
                  </Field>
                </div>
                <Field>
                  <Label htmlFor="insurance_provider">Provider</Label>
                  <Input id="insurance_provider" value={form.insurance_provider} onChange={set("insurance_provider")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            {/* Admin Notes */}
            <FieldSet>
              <FieldLegend>Administrative Notes</FieldLegend>
              <FieldGroup>
                <Field>
                  <Label htmlFor="administrative_notes">Notes</Label>
                  <Textarea id="administrative_notes" rows={3} value={form.administrative_notes} onChange={set("administrative_notes")} />
                </Field>
              </FieldGroup>
            </FieldSet>

            </div>
          </div>

          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </SheetClose>
            <Button type="submit">Register</Button>
          </SheetFooter>
        </form>
}

export default CreationFormPresentation