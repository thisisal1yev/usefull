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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          body: string
          created_at: string
          id: string
          is_removed: boolean
          question_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_removed?: boolean
          question_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_removed?: boolean
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          id: string
          learner_id: string
          reminded_1h: boolean
          reminded_24h: boolean
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"]
          type: Database["public"]["Enums"]["booking_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          learner_id: string
          reminded_1h?: boolean
          reminded_24h?: boolean
          slot_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          type: Database["public"]["Enums"]["booking_type"]
        }
        Update: {
          created_at?: string
          id?: string
          learner_id?: string
          reminded_1h?: boolean
          reminded_24h?: boolean
          slot_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          type?: Database["public"]["Enums"]["booking_type"]
        }
        Relationships: [
          {
            foreignKeyName: "bookings_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: true
            referencedRelation: "teacher_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_assignments: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          learner_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          learner_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          learner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_assignments_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_questions: {
        Row: {
          body: string
          created_at: string
          id: string
          is_removed: boolean
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_removed?: boolean
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_removed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          author_id: string | null
          exam: Database["public"]["Enums"]["exam_type"]
          id: string
          part: string
          published_at: string
          question: string
          topic: string | null
        }
        Insert: {
          author_id?: string | null
          exam?: Database["public"]["Enums"]["exam_type"]
          id?: string
          part: string
          published_at?: string
          question: string
          topic?: string | null
        }
        Update: {
          author_id?: string | null
          exam?: Database["public"]["Enums"]["exam_type"]
          id?: string
          part?: string
          published_at?: string
          question?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_requests: {
        Row: {
          created_at: string
          from_user: string
          id: string
          status: Database["public"]["Enums"]["match_status"]
          to_user: string
        }
        Insert: {
          created_at?: string
          from_user: string
          id?: string
          status?: Database["public"]["Enums"]["match_status"]
          to_user: string
        }
        Update: {
          created_at?: string
          from_user?: string
          id?: string
          status?: Database["public"]["Enums"]["match_status"]
          to_user?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_requests_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_requests_to_user_fkey"
            columns: ["to_user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          stars_tx_id: string | null
          starts_at: string
          tier: Database["public"]["Enums"]["plan_tier"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          stars_tx_id?: string | null
          starts_at?: string
          tier: Database["public"]["Enums"]["plan_tier"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          stars_tx_id?: string | null
          starts_at?: string
          tier?: Database["public"]["Enums"]["plan_tier"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_slots: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          starts_at: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          starts_at: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          starts_at?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_slots_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teachers: {
        Row: {
          bio: string
          certificates_url: string | null
          created_at: string
          experience: string | null
          status: Database["public"]["Enums"]["teacher_status"]
          user_id: string
        }
        Insert: {
          bio?: string
          certificates_url?: string | null
          created_at?: string
          experience?: string | null
          status?: Database["public"]["Enums"]["teacher_status"]
          user_id: string
        }
        Update: {
          bio?: string
          certificates_url?: string | null
          created_at?: string
          experience?: string | null
          status?: Database["public"]["Enums"]["teacher_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          availability: string | null
          created_at: string
          first_name: string
          goal: string | null
          id: string
          level: string | null
          onboarded: boolean
          plan: Database["public"]["Enums"]["plan_tier"]
          plan_expires_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          tg_id: number
          ui_lang: Database["public"]["Enums"]["ui_lang"]
          username: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string
          first_name?: string
          goal?: string | null
          id?: string
          level?: string | null
          onboarded?: boolean
          plan?: Database["public"]["Enums"]["plan_tier"]
          plan_expires_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tg_id: number
          ui_lang?: Database["public"]["Enums"]["ui_lang"]
          username?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string
          first_name?: string
          goal?: string | null
          id?: string
          level?: string | null
          onboarded?: boolean
          plan?: Database["public"]["Enums"]["plan_tier"]
          plan_expires_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tg_id?: number
          ui_lang?: Database["public"]["Enums"]["ui_lang"]
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "booked" | "cancelled" | "completed"
      booking_type: "free" | "paid"
      exam_type: "ielts" | "sat"
      match_status: "pending" | "accepted" | "declined"
      plan_tier: "free" | "premium" | "gold"
      teacher_status: "pending" | "approved" | "rejected"
      ui_lang: "uz" | "en"
      user_role: "learner" | "teacher" | "coach" | "admin"
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
  public: {
    Enums: {
      booking_status: ["booked", "cancelled", "completed"],
      booking_type: ["free", "paid"],
      exam_type: ["ielts", "sat"],
      match_status: ["pending", "accepted", "declined"],
      plan_tier: ["free", "premium", "gold"],
      teacher_status: ["pending", "approved", "rejected"],
      ui_lang: ["uz", "en"],
      user_role: ["learner", "teacher", "coach", "admin"],
    },
  },
} as const
