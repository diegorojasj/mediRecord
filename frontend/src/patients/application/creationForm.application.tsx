import { useState } from "react"
import type { FormState } from "../presentation/creationForm/creationForm_types"
import { INITIAL_STATE } from "../presentation/creationForm/creationForm_initialState"
import CreationFormPresentation from "../presentation/creationForm.presentation"

const CreationFormApplication = () => {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)

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
    <CreationFormPresentation form={form} set={set} setSelect={setSelect} onSubmit={onSubmit} />
  )
}

export default CreationFormApplication
