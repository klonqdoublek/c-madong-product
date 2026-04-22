"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";
import { APPOINTMENT_HOURS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

interface BookingPageContentProps {
  ticketId: string;
}

export function BookingPageContent({ ticketId }: BookingPageContentProps) {
  const t = useTranslations();
  const tb = useTranslations("booking");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticketId,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Booking failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="space-y-4 pt-6">
            <CheckCircle className="mx-auto size-16 text-green-500" />
            <h2 className="font-heading text-xl font-bold">
              {t("booking.success")}
            </h2>
            <p className="text-muted-foreground">
              {t("booking.successDescription")}
            </p>
            <p className="font-medium">
              {selectedDate && format(selectedDate, "PPP", { locale: th })} @ {selectedTime}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading">
            {t("booking.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("booking.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date picker */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="size-4" />
              {tb("selectDate")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal gap-2",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate
                    ? format(selectedDate, "PPP", { locale: th })
                    : tb("selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => 
                    date < new Date(new Date().setHours(0, 0, 0, 0)) || // Past dates
                    date > new Date(new Date().setDate(new Date().getDate() + 30)) // Limit to 30 days ahead
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4" />
              {tb("selectTime")}
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder={tb("selectTime")} />
              </SelectTrigger>
              <SelectContent>
                {APPOINTMENT_HOURS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!selectedDate || !selectedTime || submitting}
          >
            {submitting ? t("common.loading") : t("booking.confirm")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
