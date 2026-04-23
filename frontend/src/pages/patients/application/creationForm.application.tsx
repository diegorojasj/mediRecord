import { useEffect, useState } from "react"
import type { FormState } from "../presentation/creationForm/creationForm_types"
import { INITIAL_STATE } from "../presentation/creationForm/creationForm_initialState"
import CreationFormPresentation from "../presentation/creationForm.presentation"
import { createPatient, updatePatient, type PatientOptions } from "@/lib/api/patients"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

const CreationFormApplication = ({
  initialData,
  patientId,
  options,
  onClose,
  onSaved,
}: {
  initialData?: FormState
  patientId?: string
  options: PatientOptions
  onClose?: () => void
  onSaved?: () => void
} = {} as never) => {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [open, setOpen] = useState(!!initialData)

  useEffect(() => {
    setForm(initialData ?? INITIAL_STATE)
    if (initialData !== undefined) setOpen(true)
  }, [initialData])

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const setSelect = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (patientId) {
        await updatePatient(patientId, form)
      } else {
        await createPatient(form)
      }
      setOpen(false)
      onSaved?.()
    } catch (err) {
      console.error("Failed to save patient:", err)
    }
  }

  const formOptions = {
    sex: options.sex,
    maritalStatus: options.maritalStatus,
    educationLevel: options.educationLevel,
    bloodGroup: options.bloodGroup,
    primaryLanguage: options.primaryLanguage,
    insuranceType: options.insuranceType,
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) onClose?.() }}>
      <SheetTrigger asChild>
        <Button variant="outline">Register Patient</Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col overflow-hidden sm:max-w-xl md:max-w-2xl">
        <CreationFormPresentation
          form={form}
          set={set}
          setSelect={setSelect}
          onSubmit={onSubmit}
          options={formOptions}
        />
      </SheetContent>
    </Sheet>
  )
}

export default CreationFormApplication
