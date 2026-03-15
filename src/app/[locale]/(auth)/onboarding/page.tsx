"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSupabase } from "@/providers/supabase-provider";
import { Stepper } from "@/components/onboarding/stepper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/lib/supabase/types";

type Building = Database["public"]["Tables"]["buildings"]["Row"];
type Room = Database["public"]["Tables"]["rooms"]["Row"];
type Bed = Database["public"]["Tables"]["beds"]["Row"];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const supabase = useSupabase();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile data from auth
  const [profile, setProfile] = useState<{
    displayName: string;
    fullNameTh: string;
    avatarUrl: string | null;
  }>({ displayName: "", fullNameTh: "", avatarUrl: null });

  // Room selection state
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBed, setSelectedBed] = useState("");

  // Preferences
  const [language, setLanguage] = useState("th");

  // Editable name
  const [editedNameTh, setEditedNameTh] = useState("");

  const steps = [t("stepProfile"), t("stepRoom"), t("stepPreferences")];

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single() as { data: { display_name: string | null; full_name_th: string; avatar_url: string | null } | null };

      if (data) {
        setProfile({
          displayName: data.display_name || "",
          fullNameTh: data.full_name_th || "",
          avatarUrl: data.avatar_url,
        });
        setEditedNameTh(data.full_name_th || "");
      }
    }
    loadProfile();
  }, [supabase]);

  // Load buildings
  useEffect(() => {
    async function loadBuildings() {
      const { data } = await supabase
        .from("buildings")
        .select("*")
        .order("name_th");
      if (data) setBuildings(data);
    }
    loadBuildings();
  }, [supabase]);

  // Load rooms when building + floor selected
  useEffect(() => {
    if (!selectedBuilding || !selectedFloor) {
      setRooms([]);
      return;
    }
    async function loadRooms() {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("building_id", selectedBuilding)
        .eq("floor", parseInt(selectedFloor))
        .order("room_number");
      if (data) setRooms(data);
    }
    loadRooms();
  }, [selectedBuilding, selectedFloor, supabase]);

  // Load beds when room selected
  useEffect(() => {
    if (!selectedRoom) {
      setBeds([]);
      return;
    }
    async function loadBeds() {
      const { data } = await supabase
        .from("beds")
        .select("*")
        .eq("room_id", selectedRoom)
        .eq("is_occupied", false)
        .order("bed_label");
      if (data) setBeds(data);
    }
    loadBeds();
  }, [selectedRoom, supabase]);

  const selectedBuildingData = buildings.find((b) => b.id === selectedBuilding);
  const floors = selectedBuildingData
    ? Array.from({ length: selectedBuildingData.floors }, (_, i) => i + 1)
    : [];

  const handleNext = () => {
    if (step === 0 && !editedNameTh.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (step === 1 && !selectedBed) {
      setError(t("bedRequired"));
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Update name if changed
      if (editedNameTh !== profile.fullNameTh) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from("profiles")
            .update({ full_name_th: editedNameTh })
            .eq("id", user.id);
        }
      }

      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: selectedBuilding,
          roomId: selectedRoom,
          bedId: selectedBed,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || tc("error"));
        return;
      }

      router.push("/dashboard");
    } catch {
      setError(tc("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-secondary bg-card p-6 shadow-sm">
        {/* Step 1: Confirm Profile */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">{t("stepProfile")}</h2>

            {profile.avatarUrl && (
              <div className="flex justify-center">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="size-20 rounded-full ring-2 ring-secondary"
                />
              </div>
            )}

            {profile.displayName && (
              <p className="text-center text-sm text-muted-foreground">
                LINE: {profile.displayName}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="nameTh">{t("confirmName")} *</Label>
              <Input
                id="nameTh"
                value={editedNameTh}
                onChange={(e) => setEditedNameTh(e.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">{t("stepRoom")}</h2>

            <div className="space-y-2">
              <Label>{t("building")}</Label>
              <Select
                value={selectedBuilding}
                onValueChange={(val) => {
                  setSelectedBuilding(val);
                  setSelectedFloor("");
                  setSelectedRoom("");
                  setSelectedBed("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectBuilding")} />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name_th} ({b.name_en})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBuilding && (
              <div className="space-y-2">
                <Label>{t("floor")}</Label>
                <Select
                  value={selectedFloor}
                  onValueChange={(val) => {
                    setSelectedFloor(val);
                    setSelectedRoom("");
                    setSelectedBed("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectFloor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((f) => (
                      <SelectItem key={f} value={f.toString()}>
                        {t("floorLabel", { floor: f })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedFloor && (
              <div className="space-y-2">
                <Label>{t("room")}</Label>
                <Select
                  value={selectedRoom}
                  onValueChange={(val) => {
                    setSelectedRoom(val);
                    setSelectedBed("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectRoom")} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {t("roomLabel", { room: r.room_number })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedRoom && (
              <div className="space-y-2">
                <Label>{t("bed")}</Label>
                {beds.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("noBedsAvailable")}
                  </p>
                ) : (
                  <Select value={selectedBed} onValueChange={setSelectedBed}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectBed")} />
                    </SelectTrigger>
                    <SelectContent>
                      {beds.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {t("bedLabel", { bed: b.bed_label })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">{t("stepPreferences")}</h2>

            <div className="space-y-2">
              <Label>{t("languageLabel")}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="th">ไทย</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            {tc("back")}
          </Button>
        )}
        {step < 2 ? (
          <Button onClick={handleNext} className="flex-1">
            {tc("next")}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? tc("loading") : tc("confirm")}
          </Button>
        )}
      </div>
    </div>
  );
}
