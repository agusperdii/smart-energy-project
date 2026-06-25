import { createClient } from "@supabase/supabase-js";

export interface TelemetryRecord {
  id: string | number;
  timestamp: string;
  usage_kwh: number;
  lagging_reactive: number;
  leading_reactive: number;
  lagging_pf: number;
  leading_pf: number;
  co2: number;
  nsm: number;
  week_status: string;
  day_of_week: string;
  load_type: string | null;
  confidence: number | null;
  risk_level: 'Low' | 'Medium' | 'High' | null;
  recommendation: string | null;
  alert_status: 'Normal' | 'Warning' | 'Critical' | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_project_url" &&
  supabaseAnonKey !== "your_supabase_anon_key";

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase) {
  console.warn(
    "Supabase client not initialized: Missing or placeholder environment credentials. " +
    "Dashboard will operate in localized high-fidelity simulation mode."
  );
}

export function subscribeToTelemetry(onInsert: (record: TelemetryRecord) => void) {
  if (!supabase) {
    console.warn("Supabase client not initialized: Missing or placeholder environment credentials.");
    return () => { };
  }

  console.log("Attempting to subscribe to public.live_monitoring INSERT events...");

  const channel = supabase
    .channel("telemetry_inserts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "live_monitoring",
      },
      (payload) => {
        console.log("Received realtime payload:", payload);
        if (payload.new) {
          const raw = payload.new;
          const record: TelemetryRecord = {
            id: raw.id,
            timestamp: raw.timestamp || new Date().toISOString(),
            usage_kwh: parseFloat((Number(raw.usage_kwh) || 0).toFixed(2)),
            lagging_reactive: parseFloat((Number(raw.lagging_reactive) || 0).toFixed(2)),
            leading_reactive: parseFloat((Number(raw.leading_reactive) || 0).toFixed(2)),
            lagging_pf: parseFloat((Number(raw.lagging_pf) || 0).toFixed(2)),
            leading_pf: parseFloat((Number(raw.leading_pf) || 0).toFixed(2)),
            co2: parseFloat((Number(raw.co2) || 0).toFixed(2)),
            nsm: Number(raw.nsm) || 0,
            week_status: raw.week_status || "Weekday",
            day_of_week: raw.day_of_week || "Monday",
            load_type: raw.load_type || null,
            confidence: raw.confidence !== null && raw.confidence !== undefined ? Number(raw.confidence) : null,
            risk_level: raw.risk_level || null,
            recommendation: raw.recommendation || null,
            alert_status: raw.alert_status || null,
          };
          onInsert(record);
        }
      }
    )
    .subscribe((status, err) => {
      console.log(`Supabase Realtime subscription status: ${status}`);
      if (err) {
        console.error("Supabase Realtime subscription error:", err);
      }
    });

  return () => {
    console.log("Unsubscribing from public.live_monitoring Realtime channel.");
    supabase.removeChannel(channel);
  };
}
