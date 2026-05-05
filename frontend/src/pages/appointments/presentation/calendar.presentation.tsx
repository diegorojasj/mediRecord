import type { DateRange } from "react-day-picker"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { useState } from "react"

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const CalendarPresentation = () => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 11, 8),
    to: addDays(new Date(new Date().getFullYear(), 11, 8), 10),
  })

  return (
    <Calendar
      mode="range"
      defaultMonth={range?.from}
      selected={range}
      onSelect={setRange}
      numberOfMonths={1}
      captionLayout="dropdown"
      className="[--cell-size:--spacing(2000)] md:[--cell-size:--spacing(12)]"
      formatters={{
        formatMonthDropdown: (date) => {
          return date.toLocaleString("default", { month: "long" })
        },
      }}
      components={{
        DayButton: ({ children, modifiers, day, ...props }) => {
          const isWeekend =
            day.date.getDay() === 0 || day.date.getDay() === 6
          return (
            <CalendarDayButton day={day} modifiers={modifiers} {...props}>
              {children}
              {!modifiers.outside && (
                <span>{isWeekend ? "$120" : "$100"}</span>
              )}
            </CalendarDayButton>
          )
        },
      }}
    />
  )
}

export default CalendarPresentation
