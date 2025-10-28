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
      kick_subscribers: {
        Row: {
          created_at: string
          id: string
          subscribed_at: string
          subscription_tier: string
          subscription_type: string | null
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          subscribed_at?: string
          subscription_tier: string
          subscription_type?: string | null
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          subscribed_at?: string
          subscription_tier?: string
          subscription_type?: string | null
          username?: string
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
