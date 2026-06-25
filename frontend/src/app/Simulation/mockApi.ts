import type { SimulationInput, SimulationOutput } from "./api";

export function generateMockResponse(input: SimulationInput): SimulationOutput {
  const { laggingPF, leadingPF, usageKWh, laggingReactivePower, leadingReactivePower, weekStatus, nsm } = input;

  let loadType = 'Normal Balanced Load';
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  let alertStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  let recommendation = '';

  if (usageKWh < 25 && (laggingReactivePower > 15 || leadingReactivePower > 15)) {
    loadType = 'Capacitive Idle Overhead';
    riskLevel = 'Medium';
    alertStatus = 'Warning';
    recommendation = `Beban daya aktif rendah (${usageKWh} kW) tapi daya reaktif tinggi (${Math.max(laggingReactivePower, leadingReactivePower)} kVARh). Trafo idle atau APFC tidak mati otomatis saat pabrik tutup. Segera matikan bank kapasitor.`;
  } else if (laggingPF < 0.85) {
    loadType = 'Inductive / Low Power Factor';
    riskLevel = 'High';
    alertStatus = 'Critical';
    recommendation = `PF lagging (${laggingPF}) di bawah standar 0.85, biasanya karena motor/kompresor tanpa beban. Pastikan APFC aktif dan tambahkan kapasitor lokal jika perlu.`;
  } else if (leadingPF < 0.85) {
    loadType = 'Over-compensated / Capacitive';
    riskLevel = 'Medium';
    alertStatus = 'Warning';
    recommendation = `PF leading (${leadingPF}) akibat over-kompensasi kapasitor. Bahaya bagi tegangan busbar. Setel ulang delay controller APFC atau matikan step kapasitor fixed.`;
  } else if (weekStatus === 'Weekend' && usageKWh > 400) {
    loadType = 'Abnormal Weekend Load';
    riskLevel = 'Medium';
    alertStatus = 'Warning';
    recommendation = `Daya tinggi (${usageKWh} kW) di weekend. Cek apakah ada chiller, AC, atau kompresor utama yang lupa dimatikan.`;
  } else if (weekStatus === 'Weekday' && usageKWh > 750 && nsm >= 28800 && nsm <= 61200) {
    loadType = 'Maximum Peak Demand';
    riskLevel = 'Medium';
    alertStatus = 'Normal';
    recommendation = `Beban mepet peak (${usageKWh} kW) di weekday. Atur startup mesin besar bergantian (staggered startup) biar gak kena denda daya.`;
  } else {
    loadType = usageKWh > 500 ? 'Standard Manufacturing Load' : 'Base Facility Load';
    riskLevel = 'Low';
    alertStatus = 'Normal';
    recommendation = `Grid aman & stabil. Daya aktif ${usageKWh} kW dengan PF optimal (Lagging: ${laggingPF}, Leading: ${leadingPF}). Tidak butuh tindakan.`;
  }

  let confidenceScore = 0.92 + Math.random() * 0.07;
  if (laggingPF < 0.7 || leadingPF < 0.7) {
    confidenceScore = 0.82 + Math.random() * 0.08;
  }

  return {
    loadType,
    riskLevel,
    recommendation,
    confidenceScore: parseFloat(confidenceScore.toFixed(3)),
    alertStatus,
    timestamp: new Date().toISOString(),
    isMocked: true
  };
}
