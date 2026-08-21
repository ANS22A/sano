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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
        }
        Relationships: []
      }
      blackout_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          is_active: boolean
          location_id: string | null
          reason_ar: string
          reason_en: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          reason_ar?: string
          reason_en?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          reason_ar?: string
          reason_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "blackout_dates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_items: {
        Row: {
          booking_id: string
          duration_minutes: number
          id: string
          price_sar: number
          service_id: string | null
          sort_order: number
        }
        Insert: {
          booking_id: string
          duration_minutes: number
          id?: string
          price_sar: number
          service_id?: string | null
          sort_order?: number
        }
        Update: {
          booking_id?: string
          duration_minutes?: number
          id?: string
          price_sar?: number
          service_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_number: string
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          date: string
          end_time: string
          id: string
          locale: string
          location_id: string | null
          notes: string | null
          package_slug: string | null
          price_sar: number
          service_id: string | null
          source: string
          staff_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          booking_number?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          date: string
          end_time: string
          id?: string
          locale?: string
          location_id?: string | null
          notes?: string | null
          package_slug?: string | null
          price_sar: number
          service_id?: string | null
          source?: string
          staff_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          booking_number?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          date?: string
          end_time?: string
          id?: string
          locale?: string
          location_id?: string | null
          notes?: string | null
          package_slug?: string | null
          price_sar?: number
          service_id?: string | null
          source?: string
          staff_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          close_time: string | null
          day_of_week: number
          id: string
          is_closed: boolean
          location_id: string
          open_time: string | null
        }
        Insert: {
          close_time?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean
          location_id: string
          open_time?: string | null
        }
        Update: {
          close_time?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean
          location_id?: string
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address_ar: string
          address_en: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name_ar: string
          name_en: string
          phone: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          address_ar?: string
          address_en?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar: string
          name_en: string
          phone?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          address_ar?: string
          address_en?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar?: string
          name_en?: string
          phone?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_benefits: {
        Row: {
          benefit_ar: string
          benefit_en: string
          id: string
          service_id: string
          sort_order: number
        }
        Insert: {
          benefit_ar: string
          benefit_en: string
          id?: string
          service_id: string
          sort_order?: number
        }
        Update: {
          benefit_ar?: string
          benefit_en?: string
          id?: string
          service_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_benefits_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          active: boolean
          created_at: string
          description_ar: string
          description_en: string
          display_order: number
          icon: string
          id: string
          image_url: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description_ar?: string
          description_en?: string
          display_order?: number
          icon?: string
          id?: string
          image_url?: string | null
          name_ar: string
          name_en: string
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description_ar?: string
          description_en?: string
          display_order?: number
          icon?: string
          id?: string
          image_url?: string | null
          name_ar?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      service_options: {
        Row: {
          active: boolean
          duration_minutes: number
          id: string
          is_default: boolean
          label_ar: string
          label_en: string
          price_sar: number
          service_id: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          duration_minutes: number
          id?: string
          is_default?: boolean
          label_ar: string
          label_en: string
          price_sar: number
          service_id: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          duration_minutes?: number
          id?: string
          is_default?: boolean
          label_ar?: string
          label_en?: string
          price_sar?: number
          service_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_options_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          cleanup_minutes: number
          compare_at_price_sar: number | null
          created_at: string
          description_ar: string
          description_en: string
          duration_minutes: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_popular: boolean
          name_ar: string
          name_en: string
          preparation_minutes: number
          price_currency: string
          price_sar: number
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          short_description_ar: string
          short_description_en: string
          slug: string
          sort_order: number
          tags: string[]
          thumbnail_url: string | null
          updated_at: string
          what_to_expect_ar: string | null
          what_to_expect_en: string | null
        }
        Insert: {
          category_id: string
          cleanup_minutes?: number
          compare_at_price_sar?: number | null
          created_at?: string
          description_ar?: string
          description_en?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_popular?: boolean
          name_ar: string
          name_en: string
          preparation_minutes?: number
          price_currency?: string
          price_sar?: number
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          short_description_ar?: string
          short_description_en?: string
          slug: string
          sort_order?: number
          tags?: string[]
          thumbnail_url?: string | null
          updated_at?: string
          what_to_expect_ar?: string | null
          what_to_expect_en?: string | null
        }
        Update: {
          category_id?: string
          cleanup_minutes?: number
          compare_at_price_sar?: number | null
          created_at?: string
          description_ar?: string
          description_en?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_popular?: boolean
          name_ar?: string
          name_en?: string
          preparation_minutes?: number
          price_currency?: string
          price_sar?: number
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          short_description_ar?: string
          short_description_en?: string
          slug?: string
          sort_order?: number
          tags?: string[]
          thumbnail_url?: string | null
          updated_at?: string
          what_to_expect_ar?: string | null
          what_to_expect_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_advances: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          date: string
          id: string
          is_archived: boolean
          notes: string | null
          payment_method: string
          reference: string
          salary_id: string | null
          staff_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          date: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          payment_method: string
          reference: string
          salary_id?: string | null
          staff_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          date?: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          payment_method?: string
          reference?: string
          salary_id?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_advances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_advances_salary_id_fkey"
            columns: ["salary_id"]
            isOneToOne: false
            referencedRelation: "salaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_advances_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_withdrawals: {
        Row: {
          amount: number
          attachment_url: string | null
          created_at: string
          created_by: string
          date: string
          id: string
          is_archived: boolean
          notes: string | null
          partner_id: string
          payment_method: string
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          created_at?: string
          created_by: string
          date: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          partner_id: string
          payment_method: string
          reference: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          created_at?: string
          created_by?: string
          date?: string
          id?: string
          is_archived?: boolean
          notes?: string | null
          partner_id?: string
          payment_method?: string
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_withdrawals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_withdrawals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          ownership_percentage: number | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          ownership_percentage?: number | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salaries: {
        Row: {
          advances_deducted: number
          attachment_url: string | null
          bonuses: number
          created_at: string
          created_by: string
          gross_salary: number
          id: string
          is_archived: boolean
          month: string
          net_salary: number
          notes: string | null
          other_deductions: number
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          reference: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          advances_deducted?: number
          attachment_url?: string | null
          bonuses?: number
          created_at?: string
          created_by: string
          gross_salary: number
          id?: string
          is_archived?: boolean
          month: string
          net_salary: number
          notes?: string | null
          other_deductions?: number
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          reference: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          advances_deducted?: number
          attachment_url?: string | null
          bonuses?: number
          created_at?: string
          created_by?: string
          gross_salary?: number
          id?: string
          is_archived?: boolean
          month?: string
          net_salary?: number
          notes?: string | null
          other_deductions?: number
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          reference?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salaries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          bio_ar: string
          bio_en: string
          base_salary: number | null
          employment_start_date: string | null
          employment_status: string | null
          iban: string | null
          national_id: string | null
          salary_basis: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          location_id: string | null
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          bio_ar?: string
          bio_en?: string
          base_salary?: number | null
          employment_start_date?: string | null
          employment_status?: string | null
          iban?: string | null
          national_id?: string | null
          salary_basis?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location_id?: string | null
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          bio_ar?: string
          bio_en?: string
          base_salary?: number | null
          employment_start_date?: string | null
          employment_status?: string | null
          iban?: string | null
          national_id?: string | null
          salary_basis?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location_id?: string | null
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "staff_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_availability: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          location_id: string | null
          staff_id: string
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          staff_id: string
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          staff_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_availability_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_services: {
        Row: {
          service_id: string
          staff_id: string
        }
        Insert: {
          service_id: string
          staff_id: string
        }
        Update: {
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          id: string
          name_en: string
          name_ar: string
          is_archived: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name_en: string
          name_ar: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name_en?: string
          name_ar?: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          id: string
          reference: string | null
          category_id: string
          description: string
          amount: number
          date: string
          payment_method: string
          notes: string | null
          attachment_url: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          reference?: string | null
          category_id: string
          description: string
          amount: number
          date: string
          payment_method: string
          notes?: string | null
          attachment_url?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          reference?: string | null
          category_id?: string
          description?: string
          amount?: number
          date?: string
          payment_method?: string
          notes?: string | null
          attachment_url?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          id: string
          reference: string | null
          supplier_id: string
          date: string
          description: string
          amount: number
          payment_method: string
          payment_status: string
          notes: string | null
          attachment_url: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          reference?: string | null
          supplier_id: string
          date: string
          description: string
          amount: number
          payment_method: string
          payment_status: string
          notes?: string | null
          attachment_url?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          reference?: string | null
          supplier_id?: string
          date?: string
          description?: string
          amount?: number
          payment_method?: string
          payment_status?: string
          notes?: string | null
          attachment_url?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          id: string
          reference: string
          booking_id: string | null
          customer_id: string | null
          amount: number
          payment_method: string
          type: string
          status: string
          source: string
          notes: string | null
          attachment_url: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          reference: string
          booking_id?: string | null
          customer_id?: string | null
          amount: number
          payment_method: string
          type: string
          status?: string
          source: string
          notes?: string | null
          attachment_url?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          reference?: string
          booking_id?: string | null
          customer_id?: string | null
          amount?: number
          payment_method?: string
          type?: string
          status?: string
          source?: string
          notes?: string | null
          attachment_url?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
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
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
    },
  },
} as const
