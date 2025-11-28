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
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          points: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id?: string
          points?: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          points?: number
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
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
      comments: {
        Row: {
          author_id: string | null
          author_username: string
          content: string
          content_html: string | null
          created_at: string | null
          downvotes: number | null
          id: string
          is_anonymous: boolean | null
          is_deleted: boolean | null
          is_shadowbanned: boolean | null
          media_urls: string[] | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          author_id?: string | null
          author_username: string
          content: string
          content_html?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          is_shadowbanned?: boolean | null
          media_urls?: string[] | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          author_id?: string | null
          author_username?: string
          content?: string
          content_html?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          is_shadowbanned?: boolean | null
          media_urls?: string[] | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          description_long: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          member_count: number | null
          name: string
          post_count: number | null
          rules: Json | null
          slug: string
          theme_color: string | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          post_count?: number | null
          rules?: Json | null
          slug: string
          theme_color?: string | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          description_long?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          rules?: Json | null
          slug?: string
          theme_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_moderators: {
        Row: {
          assigned_by: string | null
          community_id: string | null
          created_at: string | null
          id: string
          permissions: Json | null
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_moderators_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
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
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
          updated_at?: string
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
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      mini_game_scores: {
        Row: {
          completed_at: string
          game_id: string
          id: string
          score: number
          user_identifier: string
        }
        Insert: {
          completed_at?: string
          game_id: string
          id?: string
          score?: number
          user_identifier: string
        }
        Update: {
          completed_at?: string
          game_id?: string
          id?: string
          score?: number
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "mini_game_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "mini_games"
            referencedColumns: ["id"]
          },
        ]
      }
      mini_games: {
        Row: {
          config: Json
          created_at: string
          ends_at: string | null
          game_type: string
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          config?: Json
          created_at?: string
          ends_at?: string | null
          game_type: string
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          config?: Json
          created_at?: string
          ends_at?: string | null
          game_type?: string
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          type?: string
          user_id?: string
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
      post_queue: {
        Row: {
          created_at: string | null
          flagged_by: string | null
          id: string
          post_id: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          post_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          flagged_by?: string | null
          id?: string
          post_id?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_queue_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          author_id: string | null
          author_username: string
          comment_count: number | null
          community_id: string | null
          content: string
          content_html: string | null
          created_at: string | null
          downvotes: number | null
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          is_deleted: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          is_shadowbanned: boolean | null
          media_urls: string[] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          view_count: number | null
        }
        Insert: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          author_username: string
          comment_count?: number | null
          community_id?: string | null
          content: string
          content_html?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          is_deleted?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_shadowbanned?: boolean | null
          media_urls?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          view_count?: number | null
        }
        Update: {
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          author_username?: string
          comment_count?: number | null
          community_id?: string | null
          content?: string
          content_html?: string | null
          created_at?: string | null
          downvotes?: number | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          is_deleted?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          is_shadowbanned?: boolean | null
          media_urls?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_bets: {
        Row: {
          created_at: string
          id: string
          option_index: number
          points_wagered: number
          points_won: number | null
          prediction_id: string
          user_id: string | null
          user_identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          points_wagered?: number
          points_won?: number | null
          prediction_id: string
          user_id?: string | null
          user_identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          points_wagered?: number
          points_won?: number | null
          prediction_id?: string
          user_id?: string | null
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_bets_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "prediction_games"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_games: {
        Row: {
          closes_at: string
          correct_option_index: number | null
          created_at: string
          description: string | null
          id: string
          options: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          closes_at: string
          correct_option_index?: number | null
          created_at?: string
          description?: string | null
          id?: string
          options?: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          closes_at?: string
          correct_option_index?: number | null
          created_at?: string
          description?: string | null
          id?: string
          options?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          kick_connected_at: string | null
          kick_username: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id: string
          kick_connected_at?: string | null
          kick_username?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          kick_connected_at?: string | null
          kick_username?: string | null
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
      rate_limit_tracking: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          reporter_identifier: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          reporter_identifier?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          reporter_identifier?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          endpoint: string | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
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
      stream_reminders: {
        Row: {
          created_at: string
          id: string
          reminded: boolean | null
          schedule_id: string
          user_email: string | null
          user_identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          reminded?: boolean | null
          schedule_id: string
          user_email?: string | null
          user_identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          reminded?: boolean | null
          schedule_id?: string
          user_email?: string | null
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_reminders_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "stream_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_schedule: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          scheduled_date: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          scheduled_date: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          scheduled_date?: string
          title?: string
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
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_identifier: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_identifier: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_by: string
          community_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_permanent: boolean | null
          is_shadowban: boolean | null
          reason: string
          user_id: string | null
        }
        Insert: {
          banned_by: string
          community_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_permanent?: boolean | null
          is_shadowban?: boolean | null
          reason: string
          user_id?: string | null
        }
        Update: {
          banned_by?: string
          community_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_permanent?: boolean | null
          is_shadowban?: boolean | null
          reason?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bans_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          show_nsfw: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          show_nsfw?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          show_nsfw?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      viewer_stats: {
        Row: {
          id: string
          is_live: boolean | null
          recorded_at: string
          viewer_count: number
        }
        Insert: {
          id?: string
          is_live?: boolean | null
          recorded_at?: string
          viewer_count: number
        }
        Update: {
          id?: string
          is_live?: boolean | null
          recorded_at?: string
          viewer_count?: number
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
      vod_tag_mappings: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          vod_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          vod_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          vod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vod_tag_mappings_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vod_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vod_tag_mappings_vod_id_fkey"
            columns: ["vod_id"]
            isOneToOne: false
            referencedRelation: "vod_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vod_tag_mappings_vod_id_fkey"
            columns: ["vod_id"]
            isOneToOne: false
            referencedRelation: "vods"
            referencedColumns: ["id"]
          },
        ]
      }
      vod_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      vod_views: {
        Row: {
          completed: boolean | null
          id: string
          last_position: number | null
          user_identifier: string
          vod_id: string
          watch_duration: number | null
          watched_at: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          last_position?: number | null
          user_identifier: string
          vod_id: string
          watch_duration?: number | null
          watched_at?: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          last_position?: number | null
          user_identifier?: string
          vod_id?: string
          watch_duration?: number | null
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vod_views_vod_id_fkey"
            columns: ["vod_id"]
            isOneToOne: false
            referencedRelation: "vod_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vod_views_vod_id_fkey"
            columns: ["vod_id"]
            isOneToOne: false
            referencedRelation: "vods"
            referencedColumns: ["id"]
          },
        ]
      }
      vods: {
        Row: {
          category: string | null
          created_at: string
          duration: number | null
          id: string
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
          user_identifier: string | null
          vote_type: number
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
          user_identifier?: string | null
          vote_type: number
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
          user_identifier?: string | null
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      prediction_leaderboard: {
        Row: {
          correct_predictions: number | null
          games_played: number | null
          total_points: number | null
          user_id: string | null
        }
        Relationships: []
      }
      viewer_stats_daily: {
        Row: {
          avg_viewers: number | null
          data_points: number | null
          day: string | null
          min_viewers: number | null
          peak_viewers: number | null
        }
        Relationships: []
      }
      viewer_stats_hourly: {
        Row: {
          avg_viewers: number | null
          data_points: number | null
          hour: string | null
          min_viewers: number | null
          peak_viewers: number | null
        }
        Relationships: []
      }
      viewer_stats_monthly: {
        Row: {
          avg_viewers: number | null
          data_points: number | null
          min_viewers: number | null
          month: string | null
          peak_viewers: number | null
        }
        Relationships: []
      }
      viewer_stats_weekly: {
        Row: {
          avg_viewers: number | null
          data_points: number | null
          min_viewers: number | null
          peak_viewers: number | null
          week: string | null
        }
        Relationships: []
      }
      vod_stats: {
        Row: {
          average_rating: number | null
          category: string | null
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
      app_role:
        | "admin"
        | "editor"
        | "developer"
        | "super_admin"
        | "global_mod"
        | "university_mod"
        | "forum_mod"
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
      app_role: [
        "admin",
        "editor",
        "developer",
        "super_admin",
        "global_mod",
        "university_mod",
        "forum_mod",
      ],
      chat_status: ["waiting", "active", "closed"],
      clip_category: ["gameplay", "funny", "music", "other"],
      message_sender: ["user", "admin", "ai"],
    },
  },
} as const
