
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://njzafdctddxbuixwzapb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qemFmZGN0ZGR4YnVpeHd6YXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MDM1MDIsImV4cCI6MjA2MjI3OTUwMn0.jRGNZuI4IM8dGbskphmgyHLBfutWYQbZJNuws007eXo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Function to fetch YouTube Analytics data
export async function fetchYouTubeAnalytics() {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-analytics');
    
    if (error) {
      console.error("Error fetching YouTube analytics:", error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error("Exception fetching YouTube analytics:", error);
    return { error };
  }
}
