import { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  Zap,
  Server,
  Database,
  BarChart3,
  CheckCircle,
  FileCheck2,
  Sparkles,
  BookOpen
} from "lucide-react";

interface ScatterPoint {
  x: number;
  y: number;
  pf: number;
  label: "Light_Load" | "Medium_Load" | "Maximum_Load";
}

interface LoadCurvePoint {
  hour: string;
  val: number;
  label: string;
}

const apiSimUrl = import.meta.env.VITE_API_SIMULATION_URL || "http://localhost:8000/api/v1/simulate";
let apiBaseUrl = "http://localhost:8000";
try {
  const urlObj = new URL(apiSimUrl);
  apiBaseUrl = urlObj.origin;
} catch (e) {
  apiBaseUrl = "";
}
export default function AboutPage() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [apiMetadata, setApiMetadata] = useState<{ status?: string; service?: string; docs_url?: string; latency?: number } | null>(null);

  const [edaTab, setEdaTab] = useState<"scatter" | "curve">("scatter");
  
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);
  
  const [hoveredCurvePoint, setHoveredCurvePoint] = useState<LoadCurvePoint | null>(null);

  const checkApiHealth = async () => {
    setApiStatus("checking");
    const startTime = Date.now();
    try {
      const res = await fetch(`${apiBaseUrl}/`, { mode: "cors", signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const latency = Date.now() - startTime;
        setApiStatus("online");
        setApiMetadata({ ...data, latency });
      } else {
        setApiStatus("offline");
        setApiMetadata(null);
      }
    } catch (e) {
      console.warn("Backend API not reachable:", e);
      setApiStatus("offline");
      setApiMetadata(null);
    }
  };

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const columnDefinitions = [
    { name: "usage_kwh", type: "float", desc: "Konsumsi daya listrik aktif utama (kWh)" },
    { name: "lagging_reactive", type: "float", desc: "Konsumsi daya reaktif lagging (kVarh) yang dipicu oleh beban induktif" },
    { name: "leading_reactive", type: "float", desc: "Konsumsi daya reaktif leading (kVarh) yang dipicu oleh beban kapasitif" },
    { name: "lagging_pf", type: "float", desc: "Faktor daya (Power Factor) lagging dengan ambang batas regulasi minimal 0.85" },
    { name: "leading_pf", type: "float", desc: "Faktor daya (Power Factor) leading" },
    { name: "nsm", type: "int", desc: "Jumlah detik yang berlalu sejak tengah malam (Number of Seconds since Midnight)" },
    { name: "week_status", type: "string", desc: "Status temporal hari: \"Weekday\" (Hari Kerja) atau \"Weekend\" (Akhir Pekan)" },
    { name: "day_of_week", type: "string", desc: "Nama hari dalam seminggu (Senin s.d. Minggu)" },
    { name: "load_type", type: "string", desc: "Target kelas klasifikasi: \"Light_Load\" (Beban Rendah), \"Medium_Load\" (Beban Sedang), atau \"Maximum_Load\" (Beban Puncak)" },
  ];

  const scatterPoints: ScatterPoint[] = [
    { x: 30, y: 12, pf: 0.928, label: "Light_Load" },
    { x: 45, y: 15, pf: 0.949, label: "Light_Load" },
    { x: 22, y: 8, pf: 0.939, label: "Light_Load" },
    { x: 35, y: 11, pf: 0.954, label: "Light_Load" },
    { x: 50, y: 25, pf: 0.894, label: "Light_Load" },
    { x: 18, y: 6, pf: 0.948, label: "Light_Load" },
    { x: 28, y: 14, pf: 0.894, label: "Light_Load" },
    { x: 40, y: 18, pf: 0.912, label: "Light_Load" },
    { x: 32, y: 10, pf: 0.953, label: "Light_Load" },
    { x: 25, y: 9, pf: 0.941, label: "Light_Load" },

    { x: 180, y: 48, pf: 0.966, label: "Medium_Load" },
    { x: 140, y: 38, pf: 0.965, label: "Medium_Load" },
    { x: 220, y: 72, pf: 0.950, label: "Medium_Load" },
    { x: 250, y: 98, pf: 0.931, label: "Medium_Load" },
    { x: 160, y: 55, pf: 0.945, label: "Medium_Load" },
    { x: 190, y: 62, pf: 0.951, label: "Medium_Load" },
    { x: 280, y: 120, pf: 0.919, label: "Medium_Load" },
    { x: 210, y: 68, pf: 0.952, label: "Medium_Load" },
    { x: 130, y: 35, pf: 0.966, label: "Medium_Load" },
    { x: 175, y: 50, pf: 0.962, label: "Medium_Load" },
    
    { x: 165, y: 140, pf: 0.762, label: "Medium_Load" },
    { x: 230, y: 190, pf: 0.771, label: "Medium_Load" },
    { x: 195, y: 155, pf: 0.783, label: "Medium_Load" },

    { x: 620, y: 180, pf: 0.960, label: "Maximum_Load" },
    { x: 580, y: 170, pf: 0.959, label: "Maximum_Load" },
    { x: 740, y: 240, pf: 0.951, label: "Maximum_Load" },
    { x: 810, y: 290, pf: 0.941, label: "Maximum_Load" },
    { x: 690, y: 210, pf: 0.956, label: "Maximum_Load" },
    { x: 550, y: 162, pf: 0.959, label: "Maximum_Load" },
    { x: 890, y: 380, pf: 0.920, label: "Maximum_Load" },
    { x: 640, y: 195, pf: 0.957, label: "Maximum_Load" },
    { x: 780, y: 275, pf: 0.943, label: "Maximum_Load" },
    { x: 710, y: 220, pf: 0.955, label: "Maximum_Load" },
    
    { x: 590, y: 390, pf: 0.835, label: "Maximum_Load" },
    { x: 670, y: 440, pf: 0.836, label: "Maximum_Load" },
  ];

  const loadCurvePoints: LoadCurvePoint[] = [
    { hour: "00:00", val: 38, label: "Beban Rendah" },
    { hour: "02:00", val: 35, label: "Beban Rendah" },
    { hour: "04:00", val: 42, label: "Beban Rendah" },
    { hour: "06:00", val: 110, label: "Beban Sedang" },
    { hour: "08:00", val: 460, label: "Beban Puncak" },
    { hour: "10:00", val: 540, label: "Beban Puncak" },
    { hour: "12:00", val: 480, label: "Beban Puncak" },
    { hour: "14:00", val: 560, label: "Beban Puncak" },
    { hour: "16:00", val: 340, label: "Beban Puncak" },
    { hour: "18:00", val: 240, label: "Beban Sedang" },
    { hour: "20:00", val: 190, label: "Beban Sedang" },
    { hour: "22:00", val: 75, label: "Beban Rendah" },
  ];

  const linePoints = loadCurvePoints.map((pt, i) => {
    const x = 40 + (i / 11) * 380;
    const y = 170 - (pt.val / 600) * 150;
    return { x, y, ...pt };
  });

  const pathD = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${linePoints[linePoints.length - 1].x} 170 L ${linePoints[0].x} 170 Z`;

  return (
    <div className="space-y-8 pb-16 animate-fade-in text-justify relative">
      <style>{`
        @keyframes pulse-flow {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .animate-flow-dot {
          position: absolute;
          top: -3px;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background-color: var(--primary);
          box-shadow: 0 0 8px var(--primary);
          animation: pulse-flow 3s infinite linear;
        }
        .animate-flow-dot-emerald {
          background-color: oklch(0.796 0.141 135.258);
          box-shadow: 0 0 8px oklch(0.796 0.141 135.258);
        }
        .chart-glow-filter {
          filter: drop-shadow(0px 4px 8px var(--primary));
          opacity: 0.9;
        }
      `}</style>

      <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-96 h-96 rounded-full bg-emerald-500/3 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Tentang SteelSense
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistem Pemantauan Kelistrikan Industri dan Klasifikasi Beban Berbasis Algoritma Pembelajaran Mesin.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/25 border border-border/30 max-w-fit">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span>Dokumentasi Teknis Proyek</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-6 space-y-6 shadow-xs text-left relative overflow-hidden flex flex-col justify-between hover:border-primary/20 transition-all duration-300">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5" />
              Latar Belakang & Urgensi Pemantauan
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pada industri manufaktur logam berat seperti pabrik peleburan baja, efisiensi energi merupakan salah satu parameter krusial dalam menekan konsumsi daya total serta mengurangi dampak emisi karbon. Proyek <strong>SteelSense</strong> diimplementasikan sebagai sistem pemantauan terintegrasi yang mencatat parameter kelistrikan (telemetri) secara <em>real-time</em> dari instrumen produksi (seperti <em>electric arc furnace</em> dan <em>rolling mill</em>) untuk dianalisis secara prediktif.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Melalui integrasi framework backend berbasis <strong>FastAPI</strong>, data dari sensor IoT lapangan dikumpulkan setiap 2 detik. Data telemetri tersebut diproses secara terpusat untuk mendeteksi profil pembebanan kerja mesin, kebocoran daya reaktif, faktor daya (<em>power factor</em>), serta emisi karbon (CO₂) yang dihasilkan.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Aliran Data Telemetri Real-Time</span>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-center justify-between bg-accent/20 p-6 rounded-2xl border border-border/30 relative">
              <div className="flex flex-col items-center text-center space-y-2 relative z-10 w-28">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-primary truncate">IoT Sensor Gateway</h5>
                  <p className="text-[9px] text-muted-foreground">Mesin Peleburan</p>
                </div>
              </div>

              <div className="hidden md:block flex-1 h-[2px] bg-dashed border-t-2 border-dashed border-border/60 relative w-full mx-2">
                <div className="animate-flow-dot" style={{ animationDelay: "0s" }} />
              </div>
              <div className="block md:hidden text-muted-foreground text-xs leading-none">&darr;</div>

              <div className="flex flex-col items-center text-center space-y-2 relative z-10 w-28">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-primary truncate">FastAPI Gateway</h5>
                  <p className="text-[9px] text-muted-foreground">Uvicorn API Engine</p>
                </div>
              </div>

              <div className="hidden md:block flex-1 h-[2px] bg-dashed border-t-2 border-dashed border-border/60 relative w-full mx-2">
                <div className="animate-flow-dot animate-flow-dot-emerald" style={{ animationDelay: "1.5s" }} />
              </div>
              <div className="block md:hidden text-muted-foreground text-xs leading-none">&darr;</div>

              <div className="flex flex-col items-center text-center space-y-2 relative z-10 w-28">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-emerald-500 truncate">PostgreSQL (Supabase)</h5>
                  <p className="text-[9px] text-muted-foreground">Real-time DB &amp; ML</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-6 flex flex-col justify-between text-left space-y-4 hover:border-primary/20 transition-all duration-300">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5 text-amber-500" />
              Tujuan Teknis
            </h3>
            <p className="text-xs text-muted-foreground">
              Tiga objektif utama implementasi pemantauan kelistrikan:
            </p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex gap-4 items-start p-3.5 rounded-xl bg-accent/20 border border-border/30 hover:border-amber-500/20 transition-all duration-300">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary">Manajemen Beban Kerja</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Mencegah beban puncak berlebih (<em>peak overload</em>) melalui pemetaan profil operasional mesin secara kontinu.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-3.5 rounded-xl bg-accent/20 border border-border/30 hover:border-emerald-500/20 transition-all duration-300">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary">Optimalisasi Faktor Daya</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Menjaga faktor daya &ge; 0.85 secara real-time untuk mengeliminasi penalti biaya reaktif tambahan dari PLN.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-3.5 rounded-xl bg-accent/20 border border-border/30 hover:border-primary/20 transition-all duration-300">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Server className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary">Pencegahan Anomali Alat</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Mendeteksi degradasi kapasitas kompensator daya reaktif (<em>capacitor bank</em>) sebelum terjadi kerusakan fatal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-6 space-y-6 shadow-xs text-left hover:border-primary/20 transition-all duration-300">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" />
            Karakteristik Dataset & Analisis Eksploratif Multivariat (EDA)
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Model klasifikasi dilatih menggunakan dataset <strong>Steel Industry Energy Consumption</strong> yang terdiri atas 
            <strong> 35.040 observasi</strong> data telemetri historis dengan interval pencatatan 15 menit. 
            Berikut adalah variabel telemetri model beserta pemodelan visual multivariat dari data lapangan:
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-border/40 h-[430px] overflow-y-auto bg-card/60 backdrop-blur-md shadow-inner">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-accent/40 text-muted-foreground border-b border-border/50 font-bold sticky top-0 backdrop-blur-xs">
                  <th className="p-3">Variabel Model</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">Deskripsi Parameter Fisik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {columnDefinitions.map((col) => (
                  <tr key={col.name} className="hover:bg-accent/10 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-primary">{col.name}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-muted text-[9px] font-mono font-medium border border-border/30">
                        {col.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-muted-foreground leading-relaxed">{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-3 p-6 rounded-xl border border-border/50 bg-accent/5 flex flex-col justify-between h-[430px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h4 className="font-bold text-xs uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Visualisasi Eksplorasi Data Lanjut
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setEdaTab("scatter")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    edaTab === "scatter" 
                      ? "bg-primary text-primary-foreground shadow-xs" 
                      : "bg-background border border-border hover:bg-accent text-muted-foreground"
                  }`}
                >
                  Klastering Scatter
                </button>
                <button
                  onClick={() => setEdaTab("curve")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    edaTab === "curve" 
                      ? "bg-primary text-primary-foreground shadow-xs" 
                      : "bg-background border border-border hover:bg-accent text-muted-foreground"
                  }`}
                >
                  Kurva Beban Harian
                </button>
              </div>
            </div>

            {edaTab === "scatter" && (
              <div className="relative flex-1 flex flex-col justify-center pt-4">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-2">
                  <span>Sumbu Y: Daya Reaktif Lagging (kVARh)</span>
                  <span>Sumbu X: Daya Aktif (kWh)</span>
                </div>
                
                <div className="relative flex-1 bg-background/60 border border-border/50 rounded-lg p-2 flex items-center justify-center">
                  <svg className="w-full h-48 overflow-visible" viewBox="0 0 450 200">
                    <line x1="40" y1="20" x2="430" y2="20" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="40" y1="60" x2="430" y2="60" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="40" y1="100" x2="430" y2="100" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="40" y1="140" x2="430" y2="140" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    
                    <line x1="137" y1="20" x2="137" y2="170" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="235" y1="20" x2="235" y2="170" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="332" y1="20" x2="332" y2="170" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />

                    <circle cx="55" cy="165" r="22" fill="oklch(0.796 0.141 135.258 / 10%)" />
                    <circle cx="120" cy="140" r="35" fill="var(--primary)" fillOpacity={0.06} />
                    <circle cx="340" cy="85" r="60" fill="oklch(0.769 0.188 70.08 / 8%)" />

                    <line x1="40" y1="170" x2="430" y2="170" stroke="var(--border)" strokeWidth="1.5" />
                    <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" strokeWidth="1.5" />

                    <text x="32" y="174" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">0</text>
                    <text x="32" y="143" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">125</text>
                    <text x="32" y="103" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">250</text>
                    <text x="32" y="63" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">375</text>
                    <text x="32" y="24" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">500</text>

                    <text x="40" y="182" fontSize="8" fill="var(--muted-foreground)" textAnchor="middle">0</text>
                    <text x="137" y="182" fontSize="8" fill="var(--muted-foreground)" textAnchor="middle">250</text>
                    <text x="235" y="182" fontSize="8" fill="var(--muted-foreground)" textAnchor="middle">500</text>
                    <text x="332" y="182" fontSize="8" fill="var(--muted-foreground)" textAnchor="middle">750</text>
                    <text x="430" y="182" fontSize="8" fill="var(--muted-foreground)" textAnchor="middle">1000</text>

                    {scatterPoints.map((pt, idx) => {
                      const cx = 40 + (pt.x / 1000) * 390;
                      const cy = 170 - (pt.y / 500) * 150;
                      
                      const isLight = pt.label === "Light_Load";
                      const isMax = pt.label === "Maximum_Load";
                      
                      let color = "var(--primary)";
                      if (isLight) color = "oklch(0.796 0.141 135.258)";
                      else if (isMax) color = "oklch(0.769 0.188 70.08)";

                      const isHovered = hoveredPoint && hoveredPoint.x === pt.x && hoveredPoint.y === pt.y;

                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 7 : 4}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth={isHovered ? 1.5 : 0.5}
                          className="transition-all duration-150 cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </svg>
                  
                  {hoveredPoint && (
                    <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-md border border-border p-2.5 rounded-lg text-[10px] space-y-1 shadow-md z-20 w-44 font-mono">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${
                          hoveredPoint.label === "Light_Load" 
                            ? "bg-emerald-500" 
                            : hoveredPoint.label === "Maximum_Load"
                            ? "bg-amber-500"
                            : "bg-primary"
                        }`} />
                        <span className="font-sans text-[9px] uppercase tracking-wider">
                          {hoveredPoint.label.replace("_", " ")}
                        </span>
                      </div>
                      <hr className="border-border/50" />
                      <p>Active: <strong>{hoveredPoint.x} kWh</strong></p>
                      <p>Reactive: <strong>{hoveredPoint.y} kVARh</strong></p>
                      <p>Cos Phi (PF): <strong>{hoveredPoint.pf.toFixed(3)}</strong></p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-muted-foreground justify-center pt-2 border-t border-border/20 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Beban Rendah (Cluster Bawah-Kiri)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span>Beban Sedang (Cluster Tengah)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Beban Maksimum (Cluster Atas-Kanan)</span>
                  </div>
                </div>
              </div>
            )}

            {edaTab === "curve" && (
              <div className="relative flex-1 flex flex-col justify-center pt-4">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-2">
                  <span>Sumbu Y: Konsumsi Daya (kWh)</span>
                  <span>Sumbu X: Waktu Operasional (24 Jam)</span>
                </div>

                <div className="relative flex-1 bg-background/60 border border-border/50 rounded-lg p-2 flex items-center justify-center">
                  <svg className="w-full h-48 overflow-visible" viewBox="0 0 450 200">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>

                    <line x1="40" y1="20" x2="420" y2="20" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="40" y1="57.5" x2="420" y2="57.5" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="40" y1="95" x2="420" y2="95" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />
                    <line x1="40" y1="132.5" x2="420" y2="132.5" stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="3,3" />

                    <line x1="40" y1="170" x2="420" y2="170" stroke="var(--border)" strokeWidth="1.5" />
                    <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" strokeWidth="1.5" />

                    <text x="32" y="174" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">0</text>
                    <text x="32" y="136.5" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">150</text>
                    <text x="32" y="99" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">300</text>
                    <text x="32" y="61.5" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">450</text>
                    <text x="32" y="24" fontSize="8" fill="var(--muted-foreground)" textAnchor="end">600</text>

                    {linePoints.map((pt, i) => (
                      <text key={i} x={pt.x} y="182" fontSize="7" fill="var(--muted-foreground)" textAnchor="middle">
                        {pt.hour}
                      </text>
                    ))}

                    <path d={areaD} fill="url(#areaGradient)" />

                    <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2.5" className="chart-glow-filter" />

                    {linePoints.map((pt, idx) => {
                      const isHovered = hoveredCurvePoint && hoveredCurvePoint.hour === pt.hour;
                      return (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : 3.5}
                          fill={isHovered ? "var(--primary)" : "var(--background)"}
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                          onMouseEnter={() => setHoveredCurvePoint(pt)}
                          onMouseLeave={() => setHoveredCurvePoint(null)}
                          className="cursor-pointer transition-all duration-150"
                        />
                      );
                    })}
                  </svg>

                  {hoveredCurvePoint && (
                    <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-md border border-border p-2.5 rounded-lg text-[10px] space-y-1 shadow-md z-20 w-44 font-mono">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="font-sans text-[9px] uppercase tracking-wider">
                          KURVA BEBAN HARIAN
                        </span>
                      </div>
                      <hr className="border-border/50" />
                      <p>Waktu: <strong>{hoveredCurvePoint.hour}</strong></p>
                      <p>Rata-rata: <strong>{hoveredCurvePoint.val} kWh</strong></p>
                      <p>Kategori: <strong>{hoveredCurvePoint.label}</strong></p>
                    </div>
                  )}
                </div>

                <div className="h-8 flex items-center justify-center border-t border-border/20 pt-2 text-[10px]">
                  {hoveredCurvePoint ? (
                    <span className="text-primary font-mono">
                      Pukul <strong>{hoveredCurvePoint.hour}</strong> | Konsumsi: <strong>{hoveredCurvePoint.val} kWh</strong> ({hoveredCurvePoint.label})
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">
                      *Arahkan kursor pada titik grafik untuk membaca data konsumsi daya per jam.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 text-left">
        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-6 space-y-5 shadow-xs hover:border-primary/20 transition-all duration-300">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
              <BarChart3 className="h-5 w-5" />
              Evaluasi Kinerja Model Klasifikasi
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pengujian model dilakukan menggunakan pembagian data dengan proporsi <strong>80% untuk data latih (training set)</strong> dan <strong>20% untuk data uji (test set)</strong> menggunakan skema <em>stratified split</em> untuk menjaga distribusi kelas target tetap seimbang.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Logistic Regression</span>
                <span className="font-mono text-muted-foreground">76.03% Accuracy</span>
              </div>
              <div className="h-2.5 w-full bg-accent border border-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/75" style={{ width: "76.03%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                Menunjukkan keterbatasan dalam mempelajari hubungan non-linear pada karakteristik beban industri.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Decision Tree</span>
                <span className="font-mono text-muted-foreground">89.51% Accuracy</span>
              </div>
              <div className="h-2.5 w-full bg-accent border border-border/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/30 to-primary/80" style={{ width: "89.51%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                Mencapai performa yang cukup baik, namun rentan terhadap overfitting akibat variansi data kecil.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Random Forest Classifier (Selected Model)
                </span>
                <span className="font-mono font-bold text-emerald-500">90.25% Accuracy</span>
              </div>
              <div className="h-2.5 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_8px_oklch(0.796_0.141_135.258_/_0.5)]" style={{ width: "90.25%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                Algoritma terbaik yang dipilih untuk diimplementasikan karena memiliki performa generalisasi tertinggi dengan macro F1-score sebesar <strong>0.8746</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-6 space-y-5 shadow-xs hover:border-primary/20 transition-all duration-300">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
              <FileCheck2 className="h-5 w-5" />
              Laporan Metrik Uji Random Forest
            </h3>
            <p className="text-sm text-muted-foreground">
              Evaluasi kuantitatif model terpilih (Random Forest) pada data uji menunjukkan metrik sebagai berikut:
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border/40 overflow-hidden text-[11px] bg-card/60 backdrop-blur-md shadow-xs">
              <div className="grid grid-cols-4 bg-accent/40 p-2.5 font-bold text-muted-foreground border-b border-border/40 text-center">
                <span className="text-left">Kelas Target</span>
                <span>Presisi</span>
                <span>Sensitivitas (Recall)</span>
                <span>F1-Score</span>
              </div>
              <div className="divide-y divide-border/20 text-center font-mono">
                <div className="grid grid-cols-4 p-2.5 text-left items-center">
                  <span className="text-left font-semibold font-sans">Light_Load</span>
                  <span>0.97</span>
                  <span>0.98</span>
                  <span className="font-bold text-emerald-500">0.98</span>
                </div>
                <div className="grid grid-cols-4 p-2.5 text-left items-center">
                  <span className="text-left font-semibold font-sans">Maximum_Load</span>
                  <span>0.80</span>
                  <span>0.84</span>
                  <span className="font-bold text-amber-500">0.82</span>
                </div>
                <div className="grid grid-cols-4 p-2.5 text-left items-center">
                  <span className="text-left font-semibold font-sans">Medium_Load</span>
                  <span>0.84</span>
                  <span>0.81</span>
                  <span className="font-bold text-primary">0.83</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/20 border border-border/30 space-y-2 text-xs text-muted-foreground leading-relaxed shadow-inner">
              <p>
                📌 <strong>Klasifikasi Beban Rendah (Light Load):</strong> Menghasilkan F1-score sebesar 0.98, menunjukkan bahwa kondisi waktu menganggur (idle periods) mesin dapat diidentifikasi secara optimal.
              </p>
              <p>
                📌 <strong>Klasifikasi Beban Puncak (Maximum Load):</strong> Menghasilkan F1-score sebesar 0.82, memberikan tingkat kepercayaan yang memadai untuk memicu notifikasi peringatan dini beban puncak.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-6 space-y-6 shadow-xs text-left hover:border-primary/20 transition-all duration-300">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <Cpu className="h-5 w-5" />
          Pipeline Pre-processing Data Kelistrikan
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-accent/20 border border-border/30 relative">
          
          <div className="text-center p-4 rounded-xl bg-background border border-border/50 min-w-44 shadow-xs relative hover:border-primary/20 transition-all duration-300">
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider mb-1">6 Fitur Numerik</span>
            <div className="text-xs text-primary font-mono font-bold py-1 px-2 rounded-md bg-accent/30 inline-block mb-1">
              StandardScaler
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">Normalisasi nilai agar rata-rata = 0 dan variansi = 1</p>
          </div>

          <div className="hidden md:block flex-1 h-[2px] bg-dashed border-t-2 border-dashed border-border/60 relative mx-2">
            <div className="animate-flow-dot" style={{ animationDelay: "0.5s", animationDuration: "2s" }} />
          </div>
          <div className="block md:hidden text-muted-foreground text-xs leading-none">&darr;</div>

          <div className="text-center p-4 rounded-xl bg-background border border-border/50 min-w-44 shadow-xs relative hover:border-primary/20 transition-all duration-300">
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider mb-1">2 Fitur Kategorik</span>
            <div className="text-xs text-primary font-mono font-bold py-1 px-2 rounded-md bg-accent/30 inline-block mb-1">
              OneHotEncoder
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">Transformasi representasi biner untuk variabel temporal</p>
          </div>

          <div className="hidden md:block flex-1 h-[2px] bg-dashed border-t-2 border-dashed border-border/60 relative mx-2">
            <div className="animate-flow-dot animate-flow-dot-emerald" style={{ animationDelay: "1.2s", animationDuration: "2s" }} />
          </div>
          <div className="block md:hidden text-muted-foreground text-xs leading-none">&darr;</div>

          <div className="text-center p-4 rounded-xl bg-primary text-primary-foreground min-w-48 shadow-sm relative hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/40 rounded-xl blur-xs opacity-30 -z-10" />
            <span className="text-[10px] font-bold opacity-80 block uppercase tracking-wider mb-1">Horizontal Concatenation</span>
            <div className="text-xs font-mono font-black py-1 px-2 rounded-md bg-black/25 inline-block mb-1">
              Vektor Fitur (Dim: 15)
            </div>
            <p className="text-[9px] opacity-80 mt-1 leading-relaxed">Dimasukkan ke dalam model classifier.pkl</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md p-6 shadow-xs text-left hover:border-primary/20 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex items-center gap-3">
            <div className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">Konektivitas Layanan API Backend</h3>
              <p className="text-sm text-muted-foreground">
                Memantau endpoint backend SteelSense secara berkala untuk ketersediaan analitik ML terdistribusi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {apiStatus === "checking" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground border border-border">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                Mengecek Koneksi...
              </span>
            )}
            
            {apiStatus === "online" && (
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_8px_oklch(0.796_0.141_135.258_/_0.2)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  API Terhubung
                </span>
                {apiMetadata?.latency !== undefined && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Latency: {apiMetadata.latency}ms | Ver: {apiMetadata.status ? "Active" : "Unknown"}
                  </span>
                )}
              </div>
            )}

            {apiStatus === "offline" && (
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_8px_oklch(0.769_0.188_70.08_/_0.2)]">
                  Offline (Modalitas Lokal)
                </span>
                <span className="text-[10px] text-muted-foreground text-right">
                  Mendeteksi API di {apiBaseUrl || "backend"} tidak aktif.
                </span>
              </div>
            )}

            <button
              onClick={checkApiHealth}
              disabled={apiStatus === "checking"}
              className="px-3.5 py-2 rounded-lg text-xs font-bold border border-border hover:bg-accent disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-xs"
            >
              Cek Ulang
            </button>
          </div>
        </div>

        {apiStatus === "online" && apiMetadata && (
          <div className="mt-4 p-3.5 rounded-xl bg-accent/20 border border-border/30 text-xs flex justify-between items-center shadow-inner">
            <span className="text-muted-foreground font-semibold">
              Detail Service: <span className="font-mono text-primary">{apiMetadata.service || "SteelSense Backend"}</span>
            </span>
            <a
              href={`${apiBaseUrl}${apiMetadata.docs_url || "/docs"}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-semibold flex items-center gap-1 transition-all"
            >
              Buka Dokumentasi Swagger API &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
