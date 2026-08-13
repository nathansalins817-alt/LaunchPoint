/**
 * Hand-written to match supabase/migrations/0001_init.sql. Regenerate with
 * `npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts`
 * once a real project exists, then this comment can go.
 */
export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      organizations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          logo_url: string | null;
          website: string;
          organization_type: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & { slug: string; name: string; website: string; organization_type: string };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      interests: {
        Row: { id: string; name: string; slug: string };
        Insert: { id?: string; name: string; slug: string };
        Update: Partial<{ id: string; name: string; slug: string }>;
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          slug: string;
          title: string;
          organization_id: string;
          short_description: string;
          description: string;
          category: string;
          format: string;
          city: string | null;
          state: string | null;
          country: string;
          remote: boolean;
          grad_seniors_eligible: boolean;
          min_age: number | null;
          max_age: number | null;
          citizenship_requirement: string | null;
          eligibility_description: string;
          deadline: string | null;
          rolling_deadline: boolean;
          application_open_date: string | null;
          decision_date: string | null;
          program_start_date: string | null;
          program_end_date: string | null;
          cost: number | null;
          paid: boolean;
          stipend_amount: number | null;
          financial_aid: boolean;
          activities: string[];
          application_url: string;
          website_url: string;
          faq_url: string | null;
          tags: string[];
          featured: boolean;
          status: string;
          is_sample_data: boolean;
          last_verified_at: string | null;
          verification_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["opportunities"]["Row"]> & {
          slug: string;
          title: string;
          organization_id: string;
          category: string;
          format: string;
          application_url: string;
          website_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Row"]>;
        Relationships: [];
      };
      opportunity_interests: {
        Row: { opportunity_id: string; interest_id: string };
        Insert: { opportunity_id: string; interest_id: string };
        Update: Partial<{ opportunity_id: string; interest_id: string }>;
        Relationships: [];
      };
      opportunity_grades: {
        Row: { opportunity_id: string; grade: number };
        Insert: { opportunity_id: string; grade: number };
        Update: Partial<{ opportunity_id: string; grade: number }>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          grade: number | null;
          location: string | null;
          opportunity_interests: string[];
          location_preference: string | null;
          cost_preference: string | null;
          onboarding_completed: boolean;
          is_admin: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      user_interests: {
        Row: { user_id: string; interest_id: string };
        Insert: { user_id: string; interest_id: string };
        Update: Partial<{ user_id: string; interest_id: string }>;
        Relationships: [];
      };
      saved_opportunities: {
        Row: { user_id: string; opportunity_id: string; status: string; saved_at: string };
        Insert: { user_id: string; opportunity_id: string; status?: string; saved_at?: string };
        Update: Partial<{ user_id: string; opportunity_id: string; status: string; saved_at: string }>;
        Relationships: [];
      };
      deadline_reminders: {
        Row: {
          id: string;
          user_id: string;
          opportunity_id: string;
          days_before: number;
          remind_at: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["deadline_reminders"]["Row"]> & {
          user_id: string;
          opportunity_id: string;
          days_before: number;
          remind_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["deadline_reminders"]["Row"]>;
        Relationships: [];
      };
      opportunity_submissions: {
        Row: {
          id: string;
          opportunity_name: string;
          organization_name: string;
          website_url: string | null;
          application_url: string | null;
          description: string;
          category: string;
          deadline: string | null;
          eligible_grades: number[];
          location: string | null;
          cost: string | null;
          contact_email: string;
          additional_notes: string | null;
          status: string;
          submitted_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["opportunity_submissions"]["Row"]> & {
          opportunity_name: string;
          organization_name: string;
          description: string;
          category: string;
          contact_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunity_submissions"]["Row"]>;
        Relationships: [];
      };
      opportunity_reports: {
        Row: {
          id: string;
          opportunity_id: string;
          reason: string;
          details: string | null;
          reporter_email: string | null;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["opportunity_reports"]["Row"]> & {
          opportunity_id: string;
          reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunity_reports"]["Row"]>;
        Relationships: [];
      };
      discovery_sources: {
        Row: {
          id: string;
          organization_name: string;
          source_url: string;
          source_type: string;
          active: boolean;
          check_frequency: string;
          last_checked_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["discovery_sources"]["Row"]> & {
          organization_name: string;
          source_url: string;
          source_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["discovery_sources"]["Row"]>;
        Relationships: [];
      };
      discovery_runs: {
        Row: {
          id: string;
          source_id: string;
          started_at: string;
          completed_at: string | null;
          status: string;
          opportunities_found: number;
          errors: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["discovery_runs"]["Row"]> & { source_id: string };
        Update: Partial<Database["public"]["Tables"]["discovery_runs"]["Row"]>;
        Relationships: [];
      };
      discovered_opportunities: {
        Row: {
          id: string;
          source_id: string;
          raw_title: string;
          raw_content: string;
          extracted_data: Record<string, unknown>;
          confidence_score: number;
          duplicate_of_id: string | null;
          review_status: string;
          discovered_at: string;
          last_checked_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["discovered_opportunities"]["Row"]> & {
          source_id: string;
          raw_title: string;
        };
        Update: Partial<Database["public"]["Tables"]["discovered_opportunities"]["Row"]>;
        Relationships: [];
      };
      opportunity_changes: {
        Row: {
          id: string;
          opportunity_id: string;
          field_name: string;
          old_value: string | null;
          new_value: string | null;
          source_url: string | null;
          detected_at: string;
          review_status: string;
        };
        Insert: Partial<Database["public"]["Tables"]["opportunity_changes"]["Row"]> & {
          opportunity_id: string;
          field_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunity_changes"]["Row"]>;
        Relationships: [];
      };
    };
  };
}
