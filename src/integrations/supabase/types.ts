export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      competitor_channels: {
        Row: {
          created_at: string | null
          id: string
          subscriber_count: number | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          user_id: string
          video_count: number | null
          view_count: number | null
          youtube_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subscriber_count?: number | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          video_count?: number | null
          view_count?: number | null
          youtube_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subscriber_count?: number | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_count?: number | null
          view_count?: number | null
          youtube_id?: string
        }
        Relationships: []
      }
      competitor_videos: {
        Row: {
          channel_id: string
          comment_count: number | null
          created_at: string | null
          description: string | null
          id: string
          is_short: boolean | null
          like_count: number | null
          published_at: string | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          view_count: number | null
          youtube_id: string
        }
        Insert: {
          channel_id: string
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_short?: boolean | null
          like_count?: number | null
          published_at?: string | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
          youtube_id: string
        }
        Update: {
          channel_id?: string
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_short?: boolean | null
          like_count?: number | null
          published_at?: string | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          youtube_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_videos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "competitor_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_views: {
        Row: {
          channel_id: string
          created_at: string | null
          date: string
          id: string
          updated_at: string | null
          user_id: string
          views: number
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          date: string
          id?: string
          updated_at?: string | null
          user_id: string
          views?: number
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          date?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          views?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          youtube_channel_id: string | null
          youtube_channel_thumbnail: string | null
          youtube_channel_title: string | null
          youtube_connected: boolean | null
          youtube_refresh_token: string | null
          youtube_subscriber_count: number | null
          youtube_token: string | null
          youtube_token_expiry: string | null
          youtube_video_count: number | null
          youtube_view_count: number | null
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
          youtube_channel_id?: string | null
          youtube_channel_thumbnail?: string | null
          youtube_channel_title?: string | null
          youtube_connected?: boolean | null
          youtube_refresh_token?: string | null
          youtube_subscriber_count?: number | null
          youtube_token?: string | null
          youtube_token_expiry?: string | null
          youtube_video_count?: number | null
          youtube_view_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          youtube_channel_id?: string | null
          youtube_channel_thumbnail?: string | null
          youtube_channel_title?: string | null
          youtube_connected?: boolean | null
          youtube_refresh_token?: string | null
          youtube_subscriber_count?: number | null
          youtube_token?: string | null
          youtube_token_expiry?: string | null
          youtube_video_count?: number | null
          youtube_view_count?: number | null
        }
        Relationships: []
      }
      saved_scripts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
