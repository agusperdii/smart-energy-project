import { generateMockResponse } from "./mockApi";

export interface SimulationInput {
  datetime: string;
  laggingReactivePower: number;
  leadingReactivePower: number;
  laggingPF: number;
  leadingPF: number;
  usageKWh: number;
  nsm: number;
  weekStatus: string;
  dayOfWeek: string;
}

export interface SimulationOutput {
  loadType: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
  confidenceScore: number;
  alertStatus: 'Normal' | 'Warning' | 'Critical';
  isMocked?: boolean;
  timestamp: string;
}

export async function postSimulationData(input: SimulationInput): Promise<SimulationOutput> {
  const apiUrl = import.meta.env.VITE_API_SIMULATION_URL;

  console.log("DEBUG: VITE_API_SIMULATION_URL =", apiUrl);

  if (!apiUrl) {
    console.warn(
      "WARNING: VITE_API_SIMULATION_URL is undefined. " +
      "If you just updated the .env file, please restart your Vite dev server (Ctrl+C and npm run dev)."
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    console.log(`DEBUG: Sending POST to ${apiUrl || "/simulate"}...`);
    const response = await fetch(apiUrl || '/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usage_kwh: input.usageKWh,
        lagging_reactive: input.laggingReactivePower,
        leading_reactive: input.leadingReactivePower,
        lagging_pf: input.laggingPF,
        leading_pf: input.leadingPF,
        nsm: input.nsm,
        week_status: input.weekStatus,
        day_of_week: input.dayOfWeek
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log("DEBUG: API Response successful:", data);

      let confidenceVal = 1.0;
      const rawConfidence = data.confidence !== undefined ? data.confidence : (data.confidenceScore || data.Confidence_Score);
      
      if (typeof rawConfidence === 'number') {
        confidenceVal = rawConfidence;
      } else if (typeof rawConfidence === 'string') {
        const parsed = parseFloat(rawConfidence);
        if (!isNaN(parsed)) {
          confidenceVal = parsed;
        }
      }

      if (confidenceVal > 1) {
        confidenceVal = confidenceVal / 100;
      }

      return {
        loadType: data.load_type || data.loadType || data.Load_Type || 'Unknown Load',
        riskLevel: data.risk_level || data.riskLevel || data.Risk_Level || 'Low',
        recommendation: data.recommendation || data.Recommendation || 'No recommendation provided.',
        confidenceScore: confidenceVal,
        alertStatus: data.alert_status || data.alertStatus || data.Alert_Status || 'Normal',
        timestamp: new Date().toISOString(),
        isMocked: false
      };
    }

    throw new Error(`API returned status ${response.status}`);
  } catch (error) {
    console.error(`DEBUG: Fetch failed for URL "${apiUrl}". Error detail:`, error);
    console.warn(`Energizer API client falling back to local simulation intelligence. Reason:`, error);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return generateMockResponse(input);
  }
}
