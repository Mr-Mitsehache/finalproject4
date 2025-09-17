// components/organiza/date-picker.tsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function DatePicker({ defaultDate }: { defaultDate: Date }) {
  const [date, setDate] = React.useState<Date | undefined>(defaultDate)
  const router = useRouter()
  const sp = useSearchParams()

  function updateDate(newDate: Date | undefined) {
    setDate(newDate)
    if (newDate) {
      const params = new URLSearchParams(sp.toString())
      params.set("date", format(newDate, "yyyy-MM-dd"))
      router.replace(`?${params.toString()}`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>เลือกวันที่</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={updateDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
