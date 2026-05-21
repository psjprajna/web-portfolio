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
      bio_chunks: {
        Row: {
          content: string
          created_at: string
          display_order: number
          embedding: string | null
          embedding_updated_at: string | null
          heading: string | null
          id: string
          section: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number
          embedding?: string | null
          embedding_updated_at?: string | null
          heading?: string | null
          id?: string
          section: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number
          embedding?: string | null
          embedding_updated_at?: string | null
          heading?: string | null
          id?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content_embedding: string | null
          content_md: string | null
          created_at: string
          id: string
          published_at: string | null
          slug: string
          tags: string[]
          title: string
          tldr: string | null
        }
        Insert: {
          content_embedding?: string | null
          content_md?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          slug: string
          tags?: string[]
          title: string
          tldr?: string | null
        }
        Update: {
          content_embedding?: string | null
          content_md?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          slug?: string
          tags?: string[]
          title?: string
          tldr?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          body_md: string | null
          created_at: string
          description: string | null
          display_name: string
          embedding_updated_at: string | null
          featured_order: number | null
          github_repo: string | null
          id: string
          metrics: Json
          readme_embedding: string | null
          readme_raw: string | null
          source: string
          status: string
          tech_stack: string[]
          updated_at: string
        }
        Insert: {
          body_md?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          embedding_updated_at?: string | null
          featured_order?: number | null
          github_repo?: string | null
          id?: string
          metrics?: Json
          readme_embedding?: string | null
          readme_raw?: string | null
          source?: string
          status?: string
          tech_stack?: string[]
          updated_at?: string
        }
        Update: {
          body_md?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          embedding_updated_at?: string | null
          featured_order?: number | null
          github_repo?: string | null
          id?: string
          metrics?: Json
          readme_embedding?: string | null
          readme_raw?: string | null
          source?: string
          status?: string
          tech_stack?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      rag_queries: {
        Row: {
          created_at: string
          id: string
          latency_ms: number | null
          model: string | null
          prompt_version: string | null
          query: string
          refused: boolean
          relevance_top_score: number | null
          response: string | null
          retrieved_ids: Json
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          latency_ms?: number | null
          model?: string | null
          prompt_version?: string | null
          query: string
          refused?: boolean
          relevance_top_score?: number | null
          response?: string | null
          retrieved_ids?: Json
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          latency_ms?: number | null
          model?: string | null
          prompt_version?: string | null
          query?: string
          refused?: boolean
          relevance_top_score?: number | null
          response?: string | null
          retrieved_ids?: Json
          session_id?: string | null
        }
        Relationships: []
      }
      resume_chunks: {
        Row: {
          chunk_type: string
          content: string
          created_at: string
          date_range: string | null
          display_order: number
          embedding: string | null
          embedding_updated_at: string | null
          end_date: string | null
          id: string
          organization: string | null
          source_file: string | null
          start_date: string | null
          tech_stack: string[]
          title: string
          updated_at: string
        }
        Insert: {
          chunk_type: string
          content: string
          created_at?: string
          date_range?: string | null
          display_order?: number
          embedding?: string | null
          embedding_updated_at?: string | null
          end_date?: string | null
          id?: string
          organization?: string | null
          source_file?: string | null
          start_date?: string | null
          tech_stack?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          chunk_type?: string
          content?: string
          created_at?: string
          date_range?: string | null
          display_order?: number
          embedding?: string | null
          embedding_updated_at?: string | null
          end_date?: string | null
          id?: string
          organization?: string | null
          source_file?: string | null
          start_date?: string | null
          tech_stack?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      visitor_events: {
        Row: {
          created_at: string
          id: string
          persona: string | null
          project_clicks: string[]
          sections_viewed: string[]
          session_id: string
          time_on_section: Json
        }
        Insert: {
          created_at?: string
          id?: string
          persona?: string | null
          project_clicks?: string[]
          sections_viewed?: string[]
          session_id: string
          time_on_section?: Json
        }
        Update: {
          created_at?: string
          id?: string
          persona?: string | null
          project_clicks?: string[]
          sections_viewed?: string[]
          session_id?: string
          time_on_section?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_chunks: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          chunk_id: string
          content: string
          score: number
          source: string
          title: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
