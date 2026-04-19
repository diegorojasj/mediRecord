import { useEffect, useState } from "react"
import type { FormState } from "../presentation/creationForm/creationForm_types"
import { INITIAL_STATE } from "../presentation/creationForm/creationForm_initialState"
import CreationFormPresentation from "../presentation/creationForm.presentation"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"


const CreationFormApplication = ({ initialData, onClose }: { initialData?: FormState; onClose?: () => void } = {}) => {
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

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Patient form submitted:", form)
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
        />
      </SheetContent>
    </Sheet>
  )
}

export default CreationFormApplication
