"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone } from "lucide-react";
import { LineNotificationPreview } from "./line-notification-preview";
import { InAppCardPreview } from "./in-app-card-preview";
import type { AnnouncementFormData } from "./announcement-prototype";

interface PreviewSectionProps {
  formData: AnnouncementFormData;
}

export function PreviewSection({ formData }: PreviewSectionProps) {
  return (
    <div className="lg:sticky lg:top-6">
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="h-4 w-4" />
            <span>Preview</span>
          </div>
        </div>

        <Tabs defaultValue="line" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="line" className="flex-1">
              LINE
            </TabsTrigger>
            <TabsTrigger value="app" className="flex-1">
              In-App
            </TabsTrigger>
          </TabsList>

          <TabsContent value="line" className="m-0 p-4">
            <LineNotificationPreview formData={formData} />
          </TabsContent>

          <TabsContent value="app" className="m-0 p-4">
            <InAppCardPreview formData={formData} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
