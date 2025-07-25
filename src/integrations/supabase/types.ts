export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answer_data: Json
          candidate_id: string
          id: string
          question_id: string
          section_id: string
          submitted_at: string | null
          time_taken_seconds: number | null
        }
        Insert: {
          answer_data: Json
          candidate_id: string
          id?: string
          question_id: string
          section_id: string
          submitted_at?: string | null
          time_taken_seconds?: number | null
        }
        Update: {
          answer_data?: Json
          candidate_id?: string
          id?: string
          question_id?: string
          section_id?: string
          submitted_at?: string | null
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          can_resubmit: boolean | null
          company_id: string
          created_at: string | null
          credentials_sent: boolean | null
          download_url: string | null
          email: string
          full_name: string
          id: string
          last_submitted_at: string | null
          lock_reason: string | null
          locked_by: string | null
          phone: string | null
          profile_data: Json | null
          submission_count: number | null
          test_configuration: Json | null
          test_status: Database["public"]["Enums"]["test_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          can_resubmit?: boolean | null
          company_id: string
          created_at?: string | null
          credentials_sent?: boolean | null
          download_url?: string | null
          email: string
          full_name: string
          id?: string
          last_submitted_at?: string | null
          lock_reason?: string | null
          locked_by?: string | null
          phone?: string | null
          profile_data?: Json | null
          submission_count?: number | null
          test_configuration?: Json | null
          test_status?: Database["public"]["Enums"]["test_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          can_resubmit?: boolean | null
          company_id?: string
          created_at?: string | null
          credentials_sent?: boolean | null
          download_url?: string | null
          email?: string
          full_name?: string
          id?: string
          last_submitted_at?: string | null
          lock_reason?: string | null
          locked_by?: string | null
          phone?: string | null
          profile_data?: Json | null
          submission_count?: number | null
          test_configuration?: Json | null
          test_status?: Database["public"]["Enums"]["test_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          email: string
          id: string
          industry: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          industry: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          industry?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          additional_notes: string | null
          company_name: string
          company_size: string | null
          contact_person: string
          created_at: string | null
          email: string
          id: string
          industry: string | null
          phone: string | null
          preferred_plan: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          company_name: string
          company_size?: string | null
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          industry?: string | null
          phone?: string | null
          preferred_plan?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          company_name?: string
          company_size?: string | null
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          industry?: string | null
          phone?: string | null
          preferred_plan?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          candidate_id: string
          created_at: string | null
          evaluation_data: Json | null
          evaluation_status: string | null
          id: string
          pdf_report_url: string | null
          section_scores: Json | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          evaluation_data?: Json | null
          evaluation_status?: string | null
          id?: string
          pdf_report_url?: string | null
          section_scores?: Json | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          evaluation_data?: Json | null
          evaluation_status?: string | null
          id?: string
          pdf_report_url?: string | null
          section_scores?: Json | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          profile_data: Json | null
          role_id: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          profile_data?: Json | null
          role_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_data?: Json | null
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      question_templates: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id: string
          industry_context: string | null
          is_template: boolean | null
          metadata: Json | null
          options: Json | null
          question_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          relevance_tag: string | null
          scale_dimension: string
          scoring_logic: Json | null
          section_id: string | null
          test_category: string | null
          test_name: string | null
          time_to_answer_seconds: number | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          industry_context?: string | null
          is_template?: boolean | null
          metadata?: Json | null
          options?: Json | null
          question_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          relevance_tag?: string | null
          scale_dimension: string
          scoring_logic?: Json | null
          section_id?: string | null
          test_category?: string | null
          test_name?: string | null
          time_to_answer_seconds?: number | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          industry_context?: string | null
          is_template?: boolean | null
          metadata?: Json | null
          options?: Json | null
          question_number?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          relevance_tag?: string | null
          scale_dimension?: string
          scoring_logic?: Json | null
          section_id?: string | null
          test_category?: string | null
          test_name?: string | null
          time_to_answer_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_templates_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string | null
          created_by_flow: boolean | null
          id: string
          metadata: Json | null
          options: Json | null
          question_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          section_id: string
          time_limit_seconds: number | null
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string | null
          created_by_flow?: boolean | null
          id?: string
          metadata?: Json | null
          options?: Json | null
          question_number: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          section_id: string
          time_limit_seconds?: number | null
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string | null
          created_by_flow?: boolean | null
          id?: string
          metadata?: Json | null
          options?: Json | null
          question_number?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          section_id?: string
          time_limit_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          time_limit_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          time_limit_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          time_limit_minutes?: number | null
        }
        Relationships: []
      }
      test_library: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          question_count: number | null
          sub_category: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          question_count?: number | null
          sub_category: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          question_count?: number | null
          sub_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          attempt: number | null
          candidate_id: string
          completed_at: string | null
          id: string
          section_id: string
          started_at: string | null
          status: string | null
          total_time_seconds: number | null
        }
        Insert: {
          attempt?: number | null
          candidate_id: string
          completed_at?: string | null
          id?: string
          section_id: string
          started_at?: string | null
          status?: string | null
          total_time_seconds?: number | null
        }
        Update: {
          attempt?: number | null
          candidate_id?: string
          completed_at?: string | null
          id?: string
          section_id?: string
          started_at?: string | null
          status?: string | null
          total_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      test_submission_logs: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          submission_attempt: number
          submission_metadata: Json | null
          submitted_at: string
          webhook_response: Json | null
          webhook_status: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          submission_attempt: number
          submission_metadata?: Json | null
          submitted_at?: string
          webhook_response?: Json | null
          webhook_status?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          submission_attempt?: number
          submission_metadata?: Json | null
          submitted_at?: string
          webhook_response?: Json | null
          webhook_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_submission_logs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
      check_submission_eligibility: {
        Args: { candidate_uuid: string }
        Returns: {
          can_submit: boolean
          reason: string
          current_status: string
          submission_count: number
        }[]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      reset_candidate_assessment: {
        Args: {
          candidate_uuid: string
          admin_user_id: string
          reset_reason?: string
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      submit_assessment: {
        Args: { candidate_uuid: string; submission_metadata?: Json }
        Returns: {
          success: boolean
          message: string
          submission_id: string
        }[]
      }
    }
    Enums: {
      difficulty_level: "easy" | "moderate" | "hard"
      question_type:
        | "forced_choice"
        | "sjt"
        | "likert_scale"
        | "true_false"
        | "open_ended"
        | "mcq"
      test_status:
        | "pending"
        | "questions_generated"
        | "in_progress"
        | "completed"
        | "submitted"
      user_role:
        | "admin"
        | "candidate"
        | "patient"
        | "survivor"
        | "caregiver"
        | "volunteer"
        | "ngo"
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
      difficulty_level: ["easy", "moderate", "hard"],
      question_type: [
        "forced_choice",
        "sjt",
        "likert_scale",
        "true_false",
        "open_ended",
        "mcq",
      ],
      test_status: [
        "pending",
        "questions_generated",
        "in_progress",
        "completed",
        "submitted",
      ],
      user_role: [
        "admin",
        "candidate",
        "patient",
        "survivor",
        "caregiver",
        "volunteer",
        "ngo",
      ],
    },
  },
} as const
