export type UserRole = "student" | "committee" | "admin" | "head";

export type TechnicianSpecialty =
  | "electrical"
  | "plumbing"
  | "air_conditioning"
  | "general"
  | "furniture"
  | "internet"
  | "door_lock";

export type MaintenanceStatus =
  | "pending"
  | "acknowledged"
  | "in_progress"
  | "completed"
  | "cancelled";

export type NotificationType =
  | "maintenance"
  | "announcement"
  | "bill"
  | "parcel"
  | "general";

// Placeholder – run `npx supabase gen types typescript` after creating migrations
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          student_id: string | null;
          full_name_th: string;
          full_name_en: string | null;
          email: string | null;
          phone: string | null;
          line_uid: string | null;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          building_id: string | null;
          room_id: string | null;
          bed_id: string | null;
          move_in_date: string | null;
          language: string;
          tags: string[];
          status: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          student_id?: string | null;
          full_name_th: string;
          full_name_en?: string | null;
          email?: string | null;
          phone?: string | null;
          line_uid?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          building_id?: string | null;
          room_id?: string | null;
          bed_id?: string | null;
          move_in_date?: string | null;
          language?: string;
          tags?: string[];
          status?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          full_name_th?: string;
          full_name_en?: string | null;
          email?: string | null;
          phone?: string | null;
          line_uid?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          building_id?: string | null;
          room_id?: string | null;
          bed_id?: string | null;
          move_in_date?: string | null;
          language?: string;
          tags?: string[];
          status?: string;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          line_user_id: string;
          student_id: string;
          display_name: string;
          tags: string[];
          status: string;
          building: string | null;
          floor: string | null;
          room_number: string | null;
          bed: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_user_id: string;
          student_id: string;
          display_name: string;
          tags?: string[];
          status?: string;
          building?: string | null;
          floor?: string | null;
          room_number?: string | null;
          bed?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          line_user_id?: string;
          student_id?: string;
          display_name?: string;
          tags?: string[];
          status?: string;
          building?: string | null;
          floor?: string | null;
          room_number?: string | null;
          bed?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      buildings: {
        Row: {
          id: string;
          name_th: string;
          name_en: string;
          gender: "male" | "female" | "mixed";
          floors: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_th: string;
          name_en: string;
          gender: "male" | "female" | "mixed";
          floors: number;
          created_at?: string;
        };
        Update: {
          name_th?: string;
          name_en?: string;
          gender?: "male" | "female" | "mixed";
          floors?: number;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          building_id: string;
          floor: number;
          room_number: string;
          capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          building_id: string;
          floor: number;
          room_number: string;
          capacity: number;
          created_at?: string;
        };
        Update: {
          building_id?: string;
          floor?: number;
          room_number?: string;
          capacity?: number;
        };
        Relationships: [];
      };
      beds: {
        Row: {
          id: string;
          room_id: string;
          bed_label: string;
          is_occupied: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          bed_label: string;
          is_occupied?: boolean;
          created_at?: string;
        };
        Update: {
          room_id?: string;
          bed_label?: string;
          is_occupied?: boolean;
        };
        Relationships: [];
      };
      maintenance_requests: {
        Row: {
          id: string;
          requester_id: string;
          category: string;
          title: string;
          description: string;
          photos: string[];
          status: MaintenanceStatus;
          assigned_to: string | null;
          technician_id: string | null;
          appointment_date: string | null;
          appointment_time: string | null;
          failure_reason: string | null;
          admin_notes: string | null;
          accepted_at: string | null;
          resolved_at: string | null;
          ai_category: string | null;
          ai_priority: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          category: string;
          title: string;
          description: string;
          photos?: string[];
          status?: MaintenanceStatus;
          assigned_to?: string | null;
          technician_id?: string | null;
          appointment_date?: string | null;
          appointment_time?: string | null;
          failure_reason?: string | null;
          admin_notes?: string | null;
          accepted_at?: string | null;
          resolved_at?: string | null;
          ai_category?: string | null;
          ai_priority?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          title?: string;
          description?: string;
          photos?: string[];
          status?: MaintenanceStatus;
          assigned_to?: string | null;
          technician_id?: string | null;
          appointment_date?: string | null;
          appointment_time?: string | null;
          failure_reason?: string | null;
          admin_notes?: string | null;
          accepted_at?: string | null;
          resolved_at?: string | null;
          ai_category?: string | null;
          ai_priority?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      technicians: {
        Row: {
          id: string;
          line_user_id: string | null;
          display_name: string;
          specialty: TechnicianSpecialty;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          line_user_id?: string | null;
          display_name: string;
          specialty?: TechnicianSpecialty;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          line_user_id?: string | null;
          display_name?: string;
          specialty?: TechnicianSpecialty;
          phone?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title_th: string;
          title_en: string;
          content_th: string;
          content_en: string;
          cover_image: string | null;
          is_pinned: boolean;
          target_tags: string[];
          author_id: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title_th: string;
          title_en: string;
          content_th: string;
          content_en: string;
          cover_image?: string | null;
          is_pinned?: boolean;
          target_tags?: string[];
          author_id: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title_th?: string;
          title_en?: string;
          content_th?: string;
          content_en?: string;
          cover_image?: string | null;
          is_pinned?: boolean;
          target_tags?: string[];
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title_th: string;
          title_en: string;
          body_th: string;
          body_en: string;
          data: Record<string, unknown> | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title_th: string;
          title_en: string;
          body_th: string;
          body_en: string;
          data?: Record<string, unknown> | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
      ai_chat_messages: {
        Row: {
          id: string;
          student_id: string | null;
          session_id: string;
          line_uid: string;
          role: "user" | "assistant" | "system";
          content: string;
          intent: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          session_id: string;
          line_uid: string;
          role: "user" | "assistant" | "system";
          content: string;
          intent?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          metadata?: Record<string, unknown>;
        };
        Relationships: [];
      };
      chatbot_sessions: {
        Row: {
          id: string;
          line_uid: string;
          state: string;
          state_data: Record<string, unknown>;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          line_uid: string;
          state?: string;
          state_data?: Record<string, unknown>;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          state?: string;
          state_data?: Record<string, unknown>;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          title: string;
          content: string;
          source: string | null;
          metadata: Record<string, unknown>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          source?: string | null;
          metadata?: Record<string, unknown>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          source?: string | null;
          metadata?: Record<string, unknown>;
          updated_at?: string;
        };
        Relationships: [];
      };
      document_sections: {
        Row: {
          id: string;
          document_id: string;
          content: string;
          embedding: unknown;
          token_count: number | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          content: string;
          embedding?: unknown;
          token_count?: number | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          content?: string;
          embedding?: unknown;
          token_count?: number | null;
          metadata?: Record<string, unknown>;
        };
        Relationships: [];
      };
      score_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          max_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          max_score?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          max_score?: number;
        };
        Relationships: [];
      };
      score_entries: {
        Row: {
          id: string;
          student_id: string;
          category_id: string;
          points: number;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          category_id: string;
          points: number;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          points?: number;
          reason?: string | null;
        };
        Relationships: [];
      };
      dorm_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          event_time: string | null;
          location: string | null;
          event_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          location?: string | null;
          event_status?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          location?: string | null;
          event_status?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_documents: {
        Args: {
          query_embedding: unknown;
          match_count?: number;
          match_threshold?: number;
        };
        Returns: {
          id: string;
          document_id: string;
          content: string;
          similarity: number;
        }[];
      };
      book_appointment: {
        Args: {
          p_ticket_id: string;
          p_date: string;
          p_time: string;
        };
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      maintenance_status: MaintenanceStatus;
      notification_type: NotificationType;
      technician_specialty: TechnicianSpecialty;
    };
  };
};
