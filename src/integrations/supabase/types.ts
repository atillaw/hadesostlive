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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ad_performance: {
        Row: {
          ad_id: string | null
          ad_slot: string | null
          ad_type: string
          created_at: string
          event_type: string
          id: string
          page_path: string
          user_identifier: string | null
        }
        Insert: {
          ad_id?: string | null
          ad_slot?: string | null
          ad_type: string
          created_at?: string
          event_type: string
          id?: string
          page_path: string
          user_identifier?: string | null
        }
        Update: {
          ad_id?: string | null
          ad_slot?: string | null
          ad_type?: string
          created_at?: string
          event_type?: string
          id?: string
          page_path?: string
          user_identifier?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_session_id?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      clip_comments: {
        Row: {
          clip_id: string
          comment: string
          created_at: string
          id: string
          user_id: string | null
          user_identifier: string | null
        }
        Insert: {
          clip_id: string
          comment: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_identifier?: string | null
        }
        Update: {
          clip_id?: string
          comment?: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clip_comments_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "clips"
            referencedColumns: ["id"]
          },
        ]
      }
      clip_likes: {
        Row: {
          clip_id: string
          created_at: string
          id: string
          user_id: string | null
          user_identifier: string | null
        }
        Insert: {
          clip_id: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_identifier?: string | null
        }
        Update: {
          clip_id?: string
          created_at?: string
          id?: string
          user_id?: string | null
          user_identifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clip_likes_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "clips"
            referencedColumns: ["id"]
          },
        ]
      }
      clips: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["clip_category"]
          created_at: string
          file_path: string
          id: string
          status: string
          title: string
          user_identifier: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["clip_category"]
          created_at?: string
          file_path: string
          id?: string
          status?: string
          title: string
          user_identifier: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["clip_category"]
          created_at?: string
          file_path?: string
          id?: string
          status?: string
          title?: string
          user_identifier?: string
        }
        Relationships: []
      }
      community_proposals: {
        Row: {
          author: string
          created_at: string
          description: string
          id: string
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
          votes: number
        }
        Insert: {
          author: string
          created_at?: string
          description: string
          id?: string
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
          votes?: number
        }
        Update: {
          author?: string
          created_at?: string
          description?: string
          id?: string
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          votes?: number
        }
        Relationships: []
      }
      content_ideas: {
        Row: {
          created_at: string
          email: string
          id: string
          idea: string
          likes: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          idea: string
          likes?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          idea?: string
          likes?: number
        }
        Relationships: []
      }
      countdown_timer: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          label: string
          target_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          target_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          target_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_trivia_questions: {
        Row: {
          active_date: string
          correct_answer: number
          created_at: string
          id: string
          options: Json
          points: number
          question: string
        }
        Insert: {
          active_date: string
          correct_answer: number
          created_at?: string
          id?: string
          options?: Json
          points?: number
          question: string
        }
        Update: {
          active_date?: string
          correct_answer?: number
          created_at?: string
          id?: string
          options?: Json
          points?: number
          question?: string
        }
        Relationships: []
      }
      email_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      impact_points: {
        Row: {
          created_at: string
          id: string
          total_points: number
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          total_points?: number
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          total_points?: number
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      kick_subscribers: {
        Row: {
          created_at: string
          follower_since: string | null
          id: string
          subscribed_at: string
          subscription_tier: string
          subscription_type: string | null
          username: string
        }
        Insert: {
          created_at?: string
          follower_since?: string | null
          id?: string
          subscribed_at?: string
          subscription_tier: string
          subscription_type?: string | null
          username: string
        }
        Update: {
          created_at?: string
          follower_since?: string | null
          id?: string
          subscribed_at?: string
          subscription_tier?: string
          subscription_type?: string | null
          username?: string
        }
        Relationships: []
      }
      live_polls: {
        Row: {
          active: boolean
          created_at: string
          id: string
          options: Json
          question: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          options?: Json
          question: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          options?: Json
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      meme_chat_messages: {
        Row: {
          created_at: string
          guest_username: string | null
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_username?: string | null
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_username?: string | null
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      meme_uploads: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          image_path: string
          status: string
          title: string
          user_identifier: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          image_path: string
          status?: string
          title: string
          user_identifier: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          image_path?: string
          status?: string
          title?: string
          user_identifier?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          user_identifier: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          user_identifier?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          user_identifier?: string | null
        }
        Relationships: []
      }
      paytr_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          merchant_oid: string
          payment_date: string | null
          points: number
          status: string
          updated_at: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          merchant_oid: string
          payment_date?: string | null
          points: number
          status?: string
          updated_at?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          merchant_oid?: string
          payment_date?: string | null
          points?: number
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          id: string
          option_index: number
          poll_id: string
          user_identifier: string
          voted_at: string
        }
        Insert: {
          id?: string
          option_index: number
          poll_id: string
          user_identifier: string
          voted_at?: string
        }
        Update: {
          id?: string
          option_index?: number
          poll_id?: string
          user_identifier?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "live_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      proposal_votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          user_identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          user_identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "community_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          logo_url: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_chats: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          mode: string
          status: Database["public"]["Enums"]["chat_status"]
          updated_at: string
          user_identifier: string
          user_name: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          mode: string
          status?: Database["public"]["Enums"]["chat_status"]
          updated_at?: string
          user_identifier: string
          user_name?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          mode?: string
          status?: Database["public"]["Enums"]["chat_status"]
          updated_at?: string
          user_identifier?: string
          user_name?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          sender_name: string | null
          sender_type: Database["public"]["Enums"]["message_sender"]
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          sender_name?: string | null
          sender_type: Database["public"]["Enums"]["message_sender"]
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_name?: string | null
          sender_type?: Database["public"]["Enums"]["message_sender"]
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "support_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      trivia_answers: {
        Row: {
          answer_index: number
          answered_at: string
          id: string
          is_correct: boolean
          question_id: string
          user_identifier: string
        }
        Insert: {
          answer_index: number
          answered_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          user_identifier: string
        }
        Update: {
          answer_index?: number
          answered_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "trivia_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "daily_trivia_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vod_ratings: {
        Row: {
          created_at: string
          id: string
          rating: number
          user_identifier: string
          vod_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          user_identifier: string
          vod_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          user_identifier?: string
          vod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vod_ratings_vod_id_fkey"
            columns: ["vod_id"]
            isOneToOne: false
            referencedRelation: "vod_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vod_ratings_vod_id_fkey"
            columns: ["vod_id"]
            isOneToOne: false
            referencedRelation: "vods"
            referencedColumns: ["id"]
          },
        ]
      }
      vods: {
        Row: {
          created_at: string
          id: string
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      vod_stats: {
        Row: {
          average_rating: number | null
          created_at: string | null
          id: string | null
          thumbnail_url: string | null
          title: string | null
          video_url: string | null
          vote_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_idea_likes: { Args: { _idea_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "editor" | "developer"
      chat_status: "waiting" | "active" | "closed"
      clip_category: "gameplay" | "funny" | "music" | "other"
      message_sender: "user" | "admin" | "ai"
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
      app_role: ["admin", "editor", "developer"],
      chat_status: ["waiting", "active", "closed"],
      clip_category: ["gameplay", "funny", "music", "other"],
      message_sender: ["user", "admin", "ai"],
    },
  },
} as const
