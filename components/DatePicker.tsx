"use client";

import * as React from "react";
import { format, set } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./ui/input";
import { useInput } from "react-day-picker";

type Props = {
  date: Date;
  setDate: (...event: any[]) => void;
  withInput?: boolean;
};

export function DatePicker({ withInput = false, date, setDate }: Props) {
  const { inputProps, dayPickerProps, setSelected } = useInput({
    defaultSelected: new Date(),
    fromYear: 1900,
    toYear: new Date().getFullYear(),
    format: "PP",
    required: true,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toLocaleDateString() : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(e) => {
            if (e) setDate(e);
          }}
          initialFocus
          footer={
            withInput && (
              <Input
                className="w-full mt-2"
                placeholder="Enter a date"
                {...inputProps}
              />
            )
          }
          {...dayPickerProps}
        />
      </PopoverContent>
    </Popover>
  );
}
