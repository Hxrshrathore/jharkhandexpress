"use client"
 
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
 
interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<string>(
    value ? format(value, "HH:mm") : "00:00"
  )
 
  // Update state if value prop changes externally
  React.useEffect(() => {
    if (value) {
      setDate(value);
      setTime(format(value, "HH:mm"));
    }
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate)
    
    // Parse the current time string and apply it
    const [hours, minutes] = time.split(":").map(Number)
    const newDate = new Date(selectedDate)
    newDate.setHours(hours || 0)
    newDate.setMinutes(minutes || 0)
    onChange(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime)
    
    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours || 0)
      newDate.setMinutes(minutes || 0)
      onChange(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-muted/30 border-input hover:bg-muted/50 text-xs sm:text-sm px-3",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">
            {date ? format(date, "MMM d, yyyy") + " at " + time : "Pick a date and time"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-border bg-background shadow-xl" align="start">
        <div className="p-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <Input 
              type="time" 
              value={time} 
              onChange={handleTimeChange} 
              className="w-full text-sm font-medium border-border focus:ring-primary h-8"
            />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="bg-transparent"
        />
      </PopoverContent>
    </Popover>
  )
}
