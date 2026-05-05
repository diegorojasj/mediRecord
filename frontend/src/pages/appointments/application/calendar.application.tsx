import { Card, CardContent } from "@/components/ui/card"
import CalendarPresentation from "../presentation/calendar.presentation"

const CalendarApplication = () => {
    return <Card className="mx-auto w-fit p-0">
      <CardContent className="p-0">
        <CalendarPresentation />
      </CardContent>
    </Card>
}

export default CalendarApplication