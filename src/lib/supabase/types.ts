export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          intent: string | null
          line_uid: string
          metadata: Json
          role: string
          sender_id: string | null
          sender_type: string | null
          session_id: string | null
          student_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          intent?: string | null
          line_uid: string
          metadata?: Json
          role: string
          sender_id?: string | null
          sender_type?: string | null
          session_id?: string | null
          student_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          intent?: string | null
          line_uid?: string
          metadata?: Json
          role?: string
          sender_id?: string | null
          sender_type?: string | null
          session_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chatbot_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_insights: {
        Row: {
          action_url: string | null
          created_at: string
          deadline: string | null
          description_en: string
          description_th: string
          dismissed_at: string | null
          expires_at: string | null
          icon_name: string | null
          id: string
          insight_type: string
          priority: number
          title_en: string
          title_th: string
          urgency_label: string | null
          user_id: string
          variant: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          deadline?: string | null
          description_en?: string
          description_th?: string
          dismissed_at?: string | null
          expires_at?: string | null
          icon_name?: string | null
          id?: string
          insight_type: string
          priority?: number
          title_en?: string
          title_th: string
          urgency_label?: string | null
          user_id: string
          variant?: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          deadline?: string | null
          description_en?: string
          description_th?: string
          dismissed_at?: string | null
          expires_at?: string | null
          icon_name?: string | null
          id?: string
          insight_type?: string
          priority?: number
          title_en?: string
          title_th?: string
          urgency_label?: string | null
          user_id?: string
          variant?: string
        }
        Relationships: []
      }
      ai_upload_feedback: {
        Row: {
          accepted_fields: string[] | null
          comment: string | null
          created_at: string
          created_by: string | null
          document_id: string
          id: string
          rating: string
          suggestion_snapshot: Json | null
        }
        Insert: {
          accepted_fields?: string[] | null
          comment?: string | null
          created_at?: string
          created_by?: string | null
          document_id: string
          id?: string
          rating: string
          suggestion_snapshot?: Json | null
        }
        Update: {
          accepted_fields?: string[] | null
          comment?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string
          id?: string
          rating?: string
          suggestion_snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_upload_feedback_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_bookmarks: {
        Row: {
          announcement_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_bookmarks_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_documents: {
        Row: {
          announcement_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_documents_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_folders: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "announcement_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_registrations: {
        Row: {
          announcement_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_registrations_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_tag_assignments: {
        Row: {
          announcement_id: string
          created_at: string | null
          tag_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          tag_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_tag_assignments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "announcement_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          archived_at: string | null
          author_id: string | null
          category: string
          content: string | null
          content_en: string
          content_th: string
          cover_image: string | null
          created_at: string
          created_by: string | null
          expire_at: string | null
          flex_json: Json | null
          folder_id: string | null
          has_dorm_score: boolean
          id: string
          is_calendar_pinned: boolean | null
          is_pinned: boolean
          location: string | null
          message_type: string | null
          published_at: string | null
          scheduled_at: string | null
          score_points: number | null
          sent_at: string | null
          status: string | null
          target_tags: string[] | null
          target_type: string | null
          title: string
          title_en: string
          title_th: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          author_id?: string | null
          category?: string
          content?: string | null
          content_en?: string
          content_th?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          flex_json?: Json | null
          folder_id?: string | null
          has_dorm_score?: boolean
          id?: string
          is_calendar_pinned?: boolean | null
          is_pinned?: boolean
          location?: string | null
          message_type?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          score_points?: number | null
          sent_at?: string | null
          status?: string | null
          target_tags?: string[] | null
          target_type?: string | null
          title: string
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          author_id?: string | null
          category?: string
          content?: string | null
          content_en?: string
          content_th?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          flex_json?: Json | null
          folder_id?: string | null
          has_dorm_score?: boolean
          id?: string
          is_calendar_pinned?: boolean | null
          is_pinned?: boolean
          location?: string | null
          message_type?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          score_points?: number | null
          sent_at?: string | null
          status?: string | null
          target_tags?: string[] | null
          target_type?: string | null
          title?: string
          title_en?: string
          title_th?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "announcement_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      beds: {
        Row: {
          bed_label: string
          created_at: string
          id: string
          is_occupied: boolean
          room_id: string
        }
        Insert: {
          bed_label: string
          created_at?: string
          id?: string
          is_occupied?: boolean
          room_id: string
        }
        Update: {
          bed_label?: string
          created_at?: string
          id?: string
          is_occupied?: boolean
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_items: {
        Row: {
          amount: number
          bill_id: string
          category: Database["public"]["Enums"]["bill_category"]
          created_at: string | null
          id: string
          label: string
          notes: string | null
        }
        Insert: {
          amount?: number
          bill_id: string
          category?: Database["public"]["Enums"]["bill_category"]
          created_at?: string | null
          id?: string
          label: string
          notes?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          category?: Database["public"]["Enums"]["bill_category"]
          created_at?: string | null
          id?: string
          label?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          admin_notes: string | null
          bed_id: string | null
          billing_month: number
          billing_round: number
          billing_year: number
          building_id: string | null
          created_at: string | null
          created_by: string | null
          due_date: string
          id: string
          paid_at: string | null
          paid_by: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["bill_status"]
          student_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          bed_id?: string | null
          billing_month: number
          billing_round?: number
          billing_year: number
          building_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          student_id: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          bed_id?: string | null
          billing_month?: number
          billing_round?: number
          billing_year?: number
          building_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string
          id?: string
          paid_at?: string | null
          paid_by?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          student_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          created_at: string
          floors: number
          gender: string
          id: string
          name_en: string
          name_th: string
        }
        Insert: {
          created_at?: string
          floors?: number
          gender: string
          id?: string
          name_en: string
          name_th: string
        }
        Update: {
          created_at?: string
          floors?: number
          gender?: string
          id?: string
          name_en?: string
          name_th?: string
        }
        Relationships: []
      }
      chat_escalations: {
        Row: {
          admin_id: string | null
          ai_context: Json | null
          claimed_at: string | null
          closed_at: string | null
          closed_summary: Json | null
          created_at: string | null
          id: string
          reason: string
          session_id: string
          status: string
          student_id: string | null
        }
        Insert: {
          admin_id?: string | null
          ai_context?: Json | null
          claimed_at?: string | null
          closed_at?: string | null
          closed_summary?: Json | null
          created_at?: string | null
          id?: string
          reason?: string
          session_id: string
          status?: string
          student_id?: string | null
        }
        Update: {
          admin_id?: string | null
          ai_context?: Json | null
          claimed_at?: string | null
          closed_at?: string | null
          closed_summary?: Json | null
          created_at?: string | null
          id?: string
          reason?: string
          session_id?: string
          status?: string
          student_id?: string | null
        }
        Relationships: []
      }
      chatbot_sessions: {
        Row: {
          context_summary: string | null
          created_at: string
          id: string
          line_uid: string
          message_count: number | null
          state: string
          state_data: Json
          updated_at: string
        }
        Insert: {
          context_summary?: string | null
          created_at?: string
          id?: string
          line_uid: string
          message_count?: number | null
          state?: string
          state_data?: Json
          updated_at?: string
        }
        Update: {
          context_summary?: string | null
          created_at?: string
          id?: string
          line_uid?: string
          message_count?: number | null
          state?: string
          state_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      document_sections: {
        Row: {
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json
          token_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json
          token_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_sections_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tag_assignments: {
        Row: {
          document_id: string
          tag_id: string
        }
        Insert: {
          document_id: string
          tag_id: string
        }
        Update: {
          document_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tag_assignments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "document_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          ai_applied_at: string | null
          ai_suggestion: Json | null
          content: string
          content_type: string | null
          created_at: string
          created_by: string | null
          file_path: string | null
          filename: string | null
          folder_id: string | null
          id: string
          is_current: boolean
          metadata: Json
          parent_document_id: string | null
          source: string | null
          status: string
          title: string
          updated_at: string
          version: string | null
          version_number: number
        }
        Insert: {
          ai_applied_at?: string | null
          ai_suggestion?: Json | null
          content: string
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          filename?: string | null
          folder_id?: string | null
          id?: string
          is_current?: boolean
          metadata?: Json
          parent_document_id?: string | null
          source?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: string | null
          version_number?: number
        }
        Update: {
          ai_applied_at?: string | null
          ai_suggestion?: Json | null
          content?: string
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          filename?: string | null
          folder_id?: string | null
          id?: string
          is_current?: boolean
          metadata?: Json
          parent_document_id?: string | null
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "knowledge_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      dorm_calendar_completions: {
        Row: {
          completed_at: string
          completion_method: Database["public"]["Enums"]["calendar_completion_method"]
          id: string
          metadata: Json | null
          source_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completion_method: Database["public"]["Enums"]["calendar_completion_method"]
          id?: string
          metadata?: Json | null
          source_id: string
          source_type: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completion_method?: Database["public"]["Enums"]["calendar_completion_method"]
          id?: string
          metadata?: Json | null
          source_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dorm_calendar_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dorm_calendar_items: {
        Row: {
          academic_year: number | null
          archived_at: string | null
          audience: string
          category: Database["public"]["Enums"]["dorm_calendar_category"]
          created_at: string
          cta_event_id: string | null
          cta_type: Database["public"]["Enums"]["calendar_cta_type"]
          cta_url: string | null
          description_en: string | null
          description_th: string | null
          due_at: string
          id: string
          is_required: boolean
          penalty_points: number
          published_by: string | null
          score_category_id: string | null
          score_points: number
          semester: string | null
          start_at: string
          title_en: string | null
          title_th: string
          updated_at: string
        }
        Insert: {
          academic_year?: number | null
          archived_at?: string | null
          audience?: string
          category: Database["public"]["Enums"]["dorm_calendar_category"]
          created_at?: string
          cta_event_id?: string | null
          cta_type?: Database["public"]["Enums"]["calendar_cta_type"]
          cta_url?: string | null
          description_en?: string | null
          description_th?: string | null
          due_at: string
          id?: string
          is_required?: boolean
          penalty_points?: number
          published_by?: string | null
          score_category_id?: string | null
          score_points?: number
          semester?: string | null
          start_at: string
          title_en?: string | null
          title_th: string
          updated_at?: string
        }
        Update: {
          academic_year?: number | null
          archived_at?: string | null
          audience?: string
          category?: Database["public"]["Enums"]["dorm_calendar_category"]
          created_at?: string
          cta_event_id?: string | null
          cta_type?: Database["public"]["Enums"]["calendar_cta_type"]
          cta_url?: string | null
          description_en?: string | null
          description_th?: string | null
          due_at?: string
          id?: string
          is_required?: boolean
          penalty_points?: number
          published_by?: string | null
          score_category_id?: string | null
          score_points?: number
          semester?: string | null
          start_at?: string
          title_en?: string | null
          title_th?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dorm_calendar_items_cta_event_id_fkey"
            columns: ["cta_event_id"]
            isOneToOne: false
            referencedRelation: "dorm_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dorm_calendar_items_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dorm_calendar_items_score_category_id_fkey"
            columns: ["score_category_id"]
            isOneToOne: false
            referencedRelation: "score_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dorm_calendar_items_score_category_id_fkey"
            columns: ["score_category_id"]
            isOneToOne: false
            referencedRelation: "student_score_summary"
            referencedColumns: ["category_id"]
          },
        ]
      }
      dorm_events: {
        Row: {
          academic_year: number | null
          building_id: string | null
          calendar_category:
            | Database["public"]["Enums"]["dorm_calendar_category"]
            | null
          calendar_cta_type:
            | Database["public"]["Enums"]["calendar_cta_type"]
            | null
          calendar_cta_url: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          description_th: string | null
          end_datetime: string | null
          event_date: string
          event_status: string
          event_time: string | null
          event_type: string
          id: string
          impact_level: string
          is_calendar_pinned: boolean | null
          is_mandatory: boolean
          location: string | null
          location_en: string | null
          location_th: string | null
          max_capacity: number | null
          penalty_points: number
          score_category_id: string | null
          score_points: number
          semester: number | null
          start_datetime: string | null
          title: string
          title_en: string | null
          title_th: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: number | null
          building_id?: string | null
          calendar_category?:
            | Database["public"]["Enums"]["dorm_calendar_category"]
            | null
          calendar_cta_type?:
            | Database["public"]["Enums"]["calendar_cta_type"]
            | null
          calendar_cta_url?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          description_th?: string | null
          end_datetime?: string | null
          event_date: string
          event_status?: string
          event_time?: string | null
          event_type?: string
          id?: string
          impact_level?: string
          is_calendar_pinned?: boolean | null
          is_mandatory?: boolean
          location?: string | null
          location_en?: string | null
          location_th?: string | null
          max_capacity?: number | null
          penalty_points?: number
          score_category_id?: string | null
          score_points?: number
          semester?: number | null
          start_datetime?: string | null
          title: string
          title_en?: string | null
          title_th?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: number | null
          building_id?: string | null
          calendar_category?:
            | Database["public"]["Enums"]["dorm_calendar_category"]
            | null
          calendar_cta_type?:
            | Database["public"]["Enums"]["calendar_cta_type"]
            | null
          calendar_cta_url?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          description_th?: string | null
          end_datetime?: string | null
          event_date?: string
          event_status?: string
          event_time?: string | null
          event_type?: string
          id?: string
          impact_level?: string
          is_calendar_pinned?: boolean | null
          is_mandatory?: boolean
          location?: string | null
          location_en?: string | null
          location_th?: string | null
          max_capacity?: number | null
          penalty_points?: number
          score_category_id?: string | null
          score_points?: number
          semester?: number | null
          start_datetime?: string | null
          title?: string
          title_en?: string | null
          title_th?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dorm_events_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dorm_events_score_category_id_fkey"
            columns: ["score_category_id"]
            isOneToOne: false
            referencedRelation: "score_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dorm_events_score_category_id_fkey"
            columns: ["score_category_id"]
            isOneToOne: false
            referencedRelation: "student_score_summary"
            referencedColumns: ["category_id"]
          },
        ]
      }
      evaluation_criteria: {
        Row: {
          created_at: string
          criteria_type: string
          description_en: string | null
          description_th: string | null
          form_id: string
          id: string
          is_skippable: boolean
          sort_order: number
          title_en: string | null
          title_th: string
        }
        Insert: {
          created_at?: string
          criteria_type?: string
          description_en?: string | null
          description_th?: string | null
          form_id: string
          id?: string
          is_skippable?: boolean
          sort_order?: number
          title_en?: string | null
          title_th: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          description_en?: string | null
          description_th?: string | null
          form_id?: string
          id?: string
          is_skippable?: boolean
          sort_order?: number
          title_en?: string | null
          title_th?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_criteria_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "evaluation_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_forms: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description_en: string | null
          description_th: string | null
          event_id: string
          form_type: string
          id: string
          is_active: boolean
          title_en: string | null
          title_th: string
          total_steps: number
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_th?: string | null
          event_id: string
          form_type: string
          id?: string
          is_active?: boolean
          title_en?: string | null
          title_th: string
          total_steps?: number
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description_en?: string | null
          description_th?: string | null
          event_id?: string
          form_type?: string
          id?: string
          is_active?: boolean
          title_en?: string | null
          title_th?: string
          total_steps?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_forms_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "dorm_events"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_responses: {
        Row: {
          created_at: string
          criterion_id: string | null
          form_id: string
          id: string
          rating: number | null
          skipped: boolean
          step_index: number
          student_id: string
          text_response: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criterion_id?: string | null
          form_id: string
          id?: string
          rating?: number | null
          skipped?: boolean
          step_index?: number
          student_id: string
          text_response?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criterion_id?: string | null
          form_id?: string
          id?: string
          rating?: number | null
          skipped?: boolean
          step_index?: number
          student_id?: string
          text_response?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_responses_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "evaluation_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "evaluation_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_submissions: {
        Row: {
          created_at: string
          current_step: number
          form_id: string
          id: string
          personal_info: Json | null
          status: string
          student_id: string
          submitted_at: string | null
          updated_at: string
          uploaded_files: string[] | null
        }
        Insert: {
          created_at?: string
          current_step?: number
          form_id: string
          id?: string
          personal_info?: Json | null
          status?: string
          student_id: string
          submitted_at?: string | null
          updated_at?: string
          uploaded_files?: string[] | null
        }
        Update: {
          created_at?: string
          current_step?: number
          form_id?: string
          id?: string
          personal_info?: Json | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          updated_at?: string
          uploaded_files?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "evaluation_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          checked_in: boolean
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          event_id: string
          id: string
          notes: string | null
          recorded_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
          student_id: string
        }
        Update: {
          checked_in?: boolean
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "dorm_events"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_folders: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "knowledge_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          accepted_at: string | null
          admin_notes: string | null
          ai_category: string | null
          ai_confidence: number | null
          ai_priority: string | null
          ai_provider: string | null
          appointment_date: string | null
          appointment_time: string | null
          assigned_to: string | null
          category: string
          created_at: string
          damage_details: string | null
          description: string
          failure_reason: string | null
          id: string
          materials: Json
          photos: string[]
          requester_id: string
          requisition_generated_at: string | null
          requisition_url: string | null
          resolved_at: string | null
          specific_item: string | null
          status: string
          technician_id: string | null
          template_id: string | null
          ticket_code: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          admin_notes?: string | null
          ai_category?: string | null
          ai_confidence?: number | null
          ai_priority?: string | null
          ai_provider?: string | null
          appointment_date?: string | null
          appointment_time?: string | null
          assigned_to?: string | null
          category: string
          created_at?: string
          damage_details?: string | null
          description: string
          failure_reason?: string | null
          id?: string
          materials?: Json
          photos?: string[]
          requester_id: string
          requisition_generated_at?: string | null
          requisition_url?: string | null
          resolved_at?: string | null
          specific_item?: string | null
          status?: string
          technician_id?: string | null
          template_id?: string | null
          ticket_code?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          admin_notes?: string | null
          ai_category?: string | null
          ai_confidence?: number | null
          ai_priority?: string | null
          ai_provider?: string | null
          appointment_date?: string | null
          appointment_time?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          damage_details?: string | null
          description?: string
          failure_reason?: string | null
          id?: string
          materials?: Json
          photos?: string[]
          requester_id?: string
          requisition_generated_at?: string | null
          requisition_url?: string | null
          resolved_at?: string | null
          specific_item?: string | null
          status?: string
          technician_id?: string | null
          template_id?: string | null
          ticket_code?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_maintenance_requester_profile"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "repair_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          flex_json: Json | null
          id: string
          is_active: boolean
          message_type: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          flex_json?: Json | null
          id?: string
          is_active?: boolean
          message_type?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          flex_json?: Json | null
          id?: string
          is_active?: boolean
          message_type?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body_en: string
          body_th: string
          created_at: string
          id: string
          metadata: Json | null
          priority: number
          read_at: string | null
          title_en: string
          title_th: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body_en?: string
          body_th?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority?: number
          read_at?: string | null
          title_en?: string
          title_th: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body_en?: string
          body_th?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority?: number
          read_at?: string | null
          title_en?: string
          title_th?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parcels: {
        Row: {
          courier: string | null
          created_at: string
          description: string | null
          id: string
          notified_at: string | null
          parcel_type: Database["public"]["Enums"]["parcel_type"]
          picked_up_at: string | null
          pickup_code: string | null
          pickup_location: string
          registered_by: string | null
          status: Database["public"]["Enums"]["parcel_status"]
          student_id: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          courier?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notified_at?: string | null
          parcel_type?: Database["public"]["Enums"]["parcel_type"]
          picked_up_at?: string | null
          pickup_code?: string | null
          pickup_location?: string
          registered_by?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          student_id: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          courier?: string | null
          created_at?: string
          description?: string | null
          id?: string
          notified_at?: string | null
          parcel_type?: Database["public"]["Enums"]["parcel_type"]
          picked_up_at?: string | null
          pickup_code?: string | null
          pickup_location?: string
          registered_by?: string | null
          status?: Database["public"]["Enums"]["parcel_status"]
          student_id?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parcels_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bed_id: string | null
          building_id: string | null
          created_at: string
          display_name: string | null
          email: string
          faculty: string | null
          full_name: string | null
          full_name_en: string | null
          full_name_th: string
          id: string
          language: string
          line_uid: string | null
          move_in_date: string | null
          onboarding_completed: boolean
          phone: string | null
          role: string | null
          room_id: string | null
          status: string
          student_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bed_id?: string | null
          building_id?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          faculty?: string | null
          full_name?: string | null
          full_name_en?: string | null
          full_name_th: string
          id?: string
          language?: string
          line_uid?: string | null
          move_in_date?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role?: string | null
          room_id?: string | null
          status?: string
          student_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bed_id?: string | null
          building_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          faculty?: string | null
          full_name?: string | null
          full_name_en?: string | null
          full_name_th?: string
          id?: string
          language?: string
          line_uid?: string | null
          move_in_date?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          role?: string | null
          room_id?: string | null
          status?: string
          student_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_requisitions: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          building_name: string | null
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          materials_snapshot: Json
          requester_name: string | null
          room_number: string | null
          technician_name: string | null
          ticket_code: string | null
          ticket_id: string
          title: string | null
          version: number
        }
        Insert: {
          appointment_date?: string | null
          appointment_time?: string | null
          building_name?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          materials_snapshot?: Json
          requester_name?: string | null
          room_number?: string | null
          technician_name?: string | null
          ticket_code?: string | null
          ticket_id: string
          title?: string | null
          version?: number
        }
        Update: {
          appointment_date?: string | null
          appointment_time?: string | null
          building_name?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          materials_snapshot?: Json
          requester_name?: string | null
          room_number?: string | null
          technician_name?: string | null
          ticket_code?: string | null
          ticket_id?: string
          title?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "repair_requisitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_requisitions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repair_requisitions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests_with_requester"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_templates: {
        Row: {
          accuracy_score: number | null
          category: string
          created_at: string | null
          created_by: string | null
          default_materials: Json
          description: string | null
          embedding: string | null
          id: string
          image_url: string
          specific_item: string | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          accuracy_score?: number | null
          category: string
          created_at?: string | null
          created_by?: string | null
          default_materials?: Json
          description?: string | null
          embedding?: string | null
          id?: string
          image_url: string
          specific_item?: string | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          accuracy_score?: number | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          default_materials?: Json
          description?: string | null
          embedding?: string | null
          id?: string
          image_url?: string
          specific_item?: string | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          building_id: string
          capacity: number
          created_at: string
          floor: number
          id: string
          room_number: string
        }
        Insert: {
          building_id: string
          capacity?: number
          created_at?: string
          floor: number
          id?: string
          room_number: string
        }
        Update: {
          building_id?: string
          capacity?: number
          created_at?: string
          floor?: number
          id?: string
          room_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      score_categories: {
        Row: {
          color: string | null
          created_at: string
          description_en: string | null
          description_th: string | null
          icon: string | null
          id: string
          is_active: boolean
          max_score: number
          name: string
          name_en: string | null
          name_th: string | null
          slug: string
          weight: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          description_en?: string | null
          description_th?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          max_score?: number
          name: string
          name_en?: string | null
          name_th?: string | null
          slug: string
          weight?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          description_en?: string | null
          description_th?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          max_score?: number
          name?: string
          name_en?: string | null
          name_th?: string | null
          slug?: string
          weight?: number
        }
        Relationships: []
      }
      score_entries: {
        Row: {
          academic_year: number | null
          awarded_by: string | null
          category_id: string
          created_at: string
          description_en: string | null
          description_th: string | null
          event_id: string | null
          id: string
          points: number
          reason: string | null
          semester: number | null
          source: string
          student_id: string
        }
        Insert: {
          academic_year?: number | null
          awarded_by?: string | null
          category_id: string
          created_at?: string
          description_en?: string | null
          description_th?: string | null
          event_id?: string | null
          id?: string
          points?: number
          reason?: string | null
          semester?: number | null
          source?: string
          student_id: string
        }
        Update: {
          academic_year?: number | null
          awarded_by?: string | null
          category_id?: string
          created_at?: string
          description_en?: string | null
          description_th?: string | null
          event_id?: string | null
          id?: string
          points?: number
          reason?: string | null
          semester?: number | null
          source?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "score_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "student_score_summary"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "score_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "dorm_events"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          bed: string | null
          building: string | null
          created_at: string
          display_name: string | null
          floor: string | null
          id: string
          line_user_id: string | null
          room_number: string | null
          status: string | null
          student_id: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          bed?: string | null
          building?: string | null
          created_at?: string
          display_name?: string | null
          floor?: string | null
          id?: string
          line_user_id?: string | null
          room_number?: string | null
          status?: string | null
          student_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          bed?: string | null
          building?: string | null
          created_at?: string
          display_name?: string | null
          floor?: string | null
          id?: string
          line_user_id?: string | null
          room_number?: string | null
          status?: string | null
          student_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          line_user_id: string | null
          phone: string | null
          specialty: Database["public"]["Enums"]["technician_specialty"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          line_user_id?: string | null
          phone?: string | null
          specialty?: Database["public"]["Enums"]["technician_specialty"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          line_user_id?: string | null
          phone?: string | null
          specialty?: Database["public"]["Enums"]["technician_specialty"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          building_scope: Database["public"]["Enums"]["building_scope"] | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          building_scope?: Database["public"]["Enums"]["building_scope"] | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          building_scope?: Database["public"]["Enums"]["building_scope"] | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      maintenance_requests_with_requester: {
        Row: {
          accepted_at: string | null
          admin_notes: string | null
          ai_category: string | null
          ai_priority: string | null
          appointment_date: string | null
          appointment_time: string | null
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string | null
          failure_reason: string | null
          id: string | null
          photos: string[] | null
          requester_id: string | null
          requester_name_en: string | null
          requester_name_th: string | null
          requester_student_id: string | null
          resolved_at: string | null
          status: string | null
          technician_id: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_maintenance_requester_profile"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      student_score_summary: {
        Row: {
          academic_year: number | null
          category_id: string | null
          category_name: string | null
          category_score: number | null
          category_slug: string | null
          category_weight: number | null
          entry_count: number | null
          max_score: number | null
          raw_points: number | null
          semester: number | null
          student_id: string | null
          weighted_score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      book_appointment: {
        Args: { p_date: string; p_ticket_id: string; p_time: string }
        Returns: undefined
      }
      compute_academic_year: { Args: { dt: string }; Returns: number }
      compute_thai_semester: { Args: { dt: string }; Returns: string }
      decrease_template_accuracy: {
        Args: { template_id: string }
        Returns: undefined
      }
      gen_ticket_code: { Args: never; Returns: string }
      get_composite_score: {
        Args: {
          p_academic_year?: number
          p_semester?: number
          p_student_id: string
        }
        Returns: Json
      }
      get_registrar_students: {
        Args: { p_registrar_id: string }
        Returns: {
          bed_number: string
          building_id: Database["public"]["Enums"]["building_code"]
          full_name_th: string
          room_number: string
          student_id: string
          student_id_text: string
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_roles: {
        Args: { p_user_id: string }
        Returns: {
          building_scope: Database["public"]["Enums"]["building_scope"]
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_building_access: {
        Args: {
          p_target_building: Database["public"]["Enums"]["building_code"]
          p_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          p_building_scope?: Database["public"]["Enums"]["building_scope"]
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      increase_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_staff: { Args: never; Returns: boolean }
      is_finance_or_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_parcel_staff: { Args: never; Returns: boolean }
      mark_overdue_bills: { Args: never; Returns: number }
      match_document_sections: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          target_document_id: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          similarity: number
        }[]
      }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          document_title: string
          id: string
          similarity: number
        }[]
      }
      match_repair_templates: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          description: string
          id: string
          image_url: string
          similarity: number
          title: string
        }[]
      }
      refresh_score_summary: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "head"
        | "registrar"
        | "finance"
        | "parcel"
        | "admin_staff"
        | "service"
        | "activity"
        | "technician_head"
        | "technician"
        | "technician_it"
        | "committee"
        | "student"
      bill_category:
        | "room"
        | "electricity"
        | "water"
        | "deposit"
        | "fine"
        | "other"
      bill_status: "pending" | "paid" | "overdue" | "cancelled"
      building_code: "chumpee" | "chumpa" | "pudson" | "pudtan" | "chuanchom"
      building_scope:
        | "chumpee"
        | "chumpa"
        | "pudson"
        | "pudtan"
        | "chuanchom"
        | "male"
        | "female"
        | "all"
      calendar_completion_method:
        | "submission"
        | "manual_ack"
        | "admin_mark"
        | "auto_confirm"
      calendar_cta_type:
        | "internal_eval"
        | "internal_quiz"
        | "external_url"
        | "acknowledge"
        | "read_more"
        | "none"
        | "internal_bed_selection"
      dorm_calendar_category:
        | "reapplication"
        | "cr54_upload"
        | "shop_evaluation"
        | "fire_drill_theory"
        | "fire_drill_practical"
        | "dorm_meeting"
        | "dorm_inspection"
        | "important_announcement"
        | "bed_selection"
      parcel_status:
        | "pending"
        | "notified"
        | "picked_up"
        | "returned"
        | "cancelled"
      parcel_type: "box" | "envelope" | "bag" | "oversized" | "other"
      technician_specialty:
        | "electrical"
        | "plumbing"
        | "air_conditioning"
        | "general"
        | "furniture"
        | "internet"
        | "door_lock"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "head",
        "registrar",
        "finance",
        "parcel",
        "admin_staff",
        "service",
        "activity",
        "technician_head",
        "technician",
        "technician_it",
        "committee",
        "student",
      ],
      bill_category: [
        "room",
        "electricity",
        "water",
        "deposit",
        "fine",
        "other",
      ],
      bill_status: ["pending", "paid", "overdue", "cancelled"],
      building_code: ["chumpee", "chumpa", "pudson", "pudtan", "chuanchom"],
      building_scope: [
        "chumpee",
        "chumpa",
        "pudson",
        "pudtan",
        "chuanchom",
        "male",
        "female",
        "all",
      ],
      calendar_completion_method: [
        "submission",
        "manual_ack",
        "admin_mark",
        "auto_confirm",
      ],
      calendar_cta_type: [
        "internal_eval",
        "internal_quiz",
        "external_url",
        "acknowledge",
        "read_more",
        "none",
        "internal_bed_selection",
      ],
      dorm_calendar_category: [
        "reapplication",
        "cr54_upload",
        "shop_evaluation",
        "fire_drill_theory",
        "fire_drill_practical",
        "dorm_meeting",
        "dorm_inspection",
        "important_announcement",
        "bed_selection",
      ],
      parcel_status: [
        "pending",
        "notified",
        "picked_up",
        "returned",
        "cancelled",
      ],
      parcel_type: ["box", "envelope", "bag", "oversized", "other"],
      technician_specialty: [
        "electrical",
        "plumbing",
        "air_conditioning",
        "general",
        "furniture",
        "internet",
        "door_lock",
      ],
    },
  },
} as const

// ── Custom type aliases (re-add after every `supabase gen types`) ──────────

export type MaintenanceStatus =
  | "under_review"
  | "acknowledged"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TechnicianSpecialty = Database["public"]["Enums"]["technician_specialty"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type BuildingScope = Database["public"]["Enums"]["building_scope"];
export type UserRole = AppRole;
export type BillStatus = Database["public"]["Enums"]["bill_status"];
export type BillCategory = Database["public"]["Enums"]["bill_category"];
export type ParcelStatus = Database["public"]["Enums"]["parcel_status"];
export type ParcelType = Database["public"]["Enums"]["parcel_type"];
export type NotificationType =
  | "bill_overdue"
  | "bill_due"
  | "event_reminder"
  | "parcel_arrived"
  | "maintenance_update"
  | "parcel_reminder"
  | "score_added"
  | "event_new"
  | "chat_escalation"
  | "announcement"
  | "system";

export type EventType =
  | "meeting"
  | "evaluation"
  | "safety_drill"
  | "obligation"
  | "community_service"
  | "social"
  | "workshop"
  | "sports"
  | "other";

export type EventStatus = "draft" | "published" | "ongoing" | "completed" | "cancelled";
export type AttendanceStatus = "registered" | "attended" | "absent" | "excused";
export type EvaluationFormType = "shop_evaluation" | "dorm_reapplication" | "document_upload";
export type EvaluationStatus = "pending" | "in_progress" | "completed";
export type CriteriaType = "rating" | "textarea";
export type ImpactLevel = "low" | "medium" | "high";

export interface MaterialItem {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  estimated_cost?: number;
  specific_item?: string;
  source?: "ai" | "manual";
  added_at?: string;
}
