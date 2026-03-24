"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { AnnouncementFormData } from "./announcement-prototype";

interface AnnouncementFormProps {
  formData: AnnouncementFormData;
  onChange: (updates: Partial<AnnouncementFormData>) => void;
}

const BUILDINGS = ["อาคาร A", "อาคาร B", "อาคาร C", "อาคาร D"];
const YEARS = [1, 2, 3, 4];

export function AnnouncementForm({ formData, onChange }: AnnouncementFormProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="title-th">หัวข้อ (ไทย) *</Label>
          <Input
            id="title-th"
            value={formData.titleTh}
            onChange={(e) => onChange({ titleTh: e.target.value })}
            placeholder="เช่น ปิดหอพักชั่วคราวเพื่อซ่อมแซม"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="title-en">หัวข้อ (English)</Label>
          <Input
            id="title-en"
            value={formData.titleEn}
            onChange={(e) => onChange({ titleEn: e.target.value })}
            placeholder="Optional"
            className="mt-1.5"
          />
        </div>
      </Card>

      {/* Description */}
      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="desc-th">รายละเอียด (ไทย)</Label>
          <Textarea
            id="desc-th"
            value={formData.descriptionTh}
            onChange={(e) => onChange({ descriptionTh: e.target.value })}
            placeholder="รายละเอียดเพิ่มเติมสำหรับแสดงใน app (ถ้ามี)"
            rows={3}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="desc-en">รายละเอียด (English)</Label>
          <Textarea
            id="desc-en"
            value={formData.descriptionEn}
            onChange={(e) => onChange({ descriptionEn: e.target.value })}
            placeholder="Optional"
            rows={3}
            className="mt-1.5"
          />
        </div>
      </Card>

      {/* Target Audience */}
      <Card className="p-4 space-y-4">
        <Label>กลุ่มเป้าหมาย</Label>
        <RadioGroup
          value={formData.targetType}
          onValueChange={(value) =>
            onChange({ targetType: value as AnnouncementFormData["targetType"] })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="target-all" />
            <Label htmlFor="target-all" className="font-normal">
              ทุกคน
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="buildings" id="target-buildings" />
            <Label htmlFor="target-buildings" className="font-normal">
              เลือกตามอาคาร
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="years" id="target-years" />
            <Label htmlFor="target-years" className="font-normal">
              เลือกตามชั้นปี
            </Label>
          </div>
        </RadioGroup>

        {/* Buildings Multi-select */}
        {formData.targetType === "buildings" && (
          <div className="ml-6 flex flex-wrap gap-2">
            {BUILDINGS.map((building) => (
              <Badge
                key={building}
                variant={
                  formData.targetBuildings.includes(building)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
                onClick={() => {
                  const newTargets = formData.targetBuildings.includes(building)
                    ? formData.targetBuildings.filter((b) => b !== building)
                    : [...formData.targetBuildings, building];
                  onChange({ targetBuildings: newTargets });
                }}
              >
                {building}
              </Badge>
            ))}
          </div>
        )}

        {/* Years Multi-select */}
        {formData.targetType === "years" && (
          <div className="ml-6 flex flex-wrap gap-2">
            {YEARS.map((year) => (
              <Badge
                key={year}
                variant={
                  formData.targetYears.includes(year) ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => {
                  const newYears = formData.targetYears.includes(year)
                    ? formData.targetYears.filter((y) => y !== year)
                    : [...formData.targetYears, year];
                  onChange({ targetYears: newYears });
                }}
              >
                ชั้นปีที่ {year}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Priority */}
      <Card className="p-4 space-y-4">
        <Label>ระดับความสำคัญ</Label>
        <RadioGroup
          value={formData.priority}
          onValueChange={(value) =>
            onChange({ priority: value as AnnouncementFormData["priority"] })
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="priority-normal" />
            <Label htmlFor="priority-normal" className="font-normal">
              ปกติ
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="important" id="priority-important" />
            <Label htmlFor="priority-important" className="font-normal">
              สำคัญ
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="urgent" id="priority-urgent" />
            <Label htmlFor="priority-urgent" className="font-normal">
              ด่วน
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Channels */}
      <Card className="p-4 space-y-4">
        <Label>ช่องทางเผยแพร่</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="channel-facebook"
              checked={formData.channels.facebook}
              onCheckedChange={(checked) =>
                onChange({
                  channels: { ...formData.channels, facebook: !!checked },
                })
              }
            />
            <Label htmlFor="channel-facebook" className="font-normal">
              Facebook Page (auto-post)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="channel-line"
              checked={formData.channels.line}
              onCheckedChange={(checked) =>
                onChange({
                  channels: { ...formData.channels, line: !!checked },
                })
              }
            />
            <Label htmlFor="channel-line" className="font-normal">
              LINE Notification (push ไปนิสิต)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="channel-app"
              checked={formData.channels.inApp}
              onCheckedChange={(checked) =>
                onChange({
                  channels: { ...formData.channels, inApp: !!checked },
                })
              }
            />
            <Label htmlFor="channel-app" className="font-normal">
              In-app (แสดงในแอป)
            </Label>
          </div>
        </div>
      </Card>

      {/* Schedule */}
      <Card className="p-4 space-y-4">
        <Label>กำหนดเวลาเผยแพร่</Label>
        <RadioGroup
          value={formData.scheduleType}
          onValueChange={(value) =>
            onChange({
              scheduleType: value as AnnouncementFormData["scheduleType"],
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="now" id="schedule-now" />
            <Label htmlFor="schedule-now" className="font-normal">
              เผยแพร่ทันที
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="later" id="schedule-later" />
            <Label htmlFor="schedule-later" className="font-normal">
              กำหนดเวลา
            </Label>
          </div>
        </RadioGroup>

        {formData.scheduleType === "later" && (
          <div className="ml-6">
            <Input
              type="datetime-local"
              value={
                formData.scheduleDate
                  ? formData.scheduleDate.toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                onChange({ scheduleDate: new Date(e.target.value) })
              }
            />
          </div>
        )}
      </Card>

      {/* Pin */}
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="pin"
            checked={formData.isPinned}
            onCheckedChange={(checked) => onChange({ isPinned: !!checked })}
          />
          <Label htmlFor="pin" className="font-normal">
            ปักหมุดประกาศ (แสดงด้านบนสุดใน app)
          </Label>
        </div>
      </Card>
    </div>
  );
}
