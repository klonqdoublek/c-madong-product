"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { APPOINTMENT_HOURS } from "@/lib/utils/constants";

interface BookingPageContentProps {
  ticketId: string;
}

export function BookingPageContent({ ticketId }: BookingPageContentProps) {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // start from tomorrow
    return d.toISOString().split("T")[0];
  });

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
          date: selectedDate,
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
              {selectedDate} @ {selectedTime}
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
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Calendar className="size-4" />
              {t("booking.selectDate")}
            </label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder={t("booking.selectDate")} />
              </SelectTrigger>
              <SelectContent>
                {dates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {new Date(date + "T00:00:00").toLocaleDateString("th-TH", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time picker */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4" />
              {t("booking.selectTime")}
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder={t("booking.selectTime")} />
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
