import { useState } from "react";
import {
  Zap,
  Activity,
  AlertTriangle,
  Sparkles,
  Terminal,
  Database,
  WifiOff,
  Play,
  Pause,
  Layers,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Award
} from "lucide-react";
import { useTelemetry } from "./TelemetryContext";
import type { TelemetryRecord } from "./supabase";

export default function DashboardPage() {
  const {
    telemetry,
    logs,
    isLive,
    setIsLive,
    isSupabaseConnected,
    soundEnabled,
    setSoundEnabled
  } = useTelemetry();

  const [activeTab, setActiveTab] = useState<'usage' | 'pf' | 'reactive'>('usage');

  const currentRecord = telemetry[telemetry.length - 1];

  const renderSvgChart = () => {
    if (telemetry.length < 2) return null;

    const width = 600;
    const height = 180;
    const padding = 20;
    const maxPoints = 20;

    let getVal = (r: TelemetryRecord) => r.usage_kwh;
    let minVal = 0;
    let maxVal = 1000;
    let color = "oklch(var(--primary))";

    if (activeTab === 'pf') {
      getVal = (r: TelemetryRecord) => r.lagging_pf;
      minVal = 0.5;
      maxVal = 1.0;
      color = "#f59e0b";
    } else if (activeTab === 'reactive') {
      getVal = (r: TelemetryRecord) => r.lagging_reactive;
      minVal = 0;
      maxVal = 500;
      color = "#a855f7";
    }

    const points = telemetry.map((r, i) => {
      const x = padding + (i / (maxPoints - 1)) * (width - padding * 2);
      const val = getVal(r);
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y, val };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return {
      points,
      pathD,
      areaD,
      width,
      height,
      padding,
      color,
      maxVal,
      minVal
    };
  };

  const chartMeta = renderSvgChart();

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Monitoring Grid
          </h1>
          <p className="text-muted-foreground mt-1">
            Pantau data daya industri secara real-time, klasifikasi beban, dan deteksi anomali.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${isLive
            ? isSupabaseConnected
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            : "bg-muted text-muted-foreground border-border"
            }`}>
            <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse" : ""
              } ${isLive
                ? isSupabaseConnected
                  ? "bg-emerald-500"
                  : "bg-amber-500"
                : "bg-muted-foreground/60"
              }`} />
            {isLive
              ? isSupabaseConnected
                ? "🟢 Live"
                : "🟡 Live"
              : "🔴 Dijeda"}
          </span>

          <button
            onClick={() => setIsLive(!isLive)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-accent px-3 text-xs font-medium cursor-pointer transition-colors shadow-xs"
            title={isLive ? "Pause monitoring" : "Resume monitoring"}
          >
            {isLive ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                Resume
              </>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-medium cursor-pointer transition-all shadow-xs ${soundEnabled
              ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
              : "bg-card border-border hover:bg-accent text-muted-foreground"
              }`}
          >
            🔊 Alarm: {soundEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {!isSupabaseConnected && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 flex gap-3">
          <Database className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-500 text-sm">Offline Mode</h4>
            <p className="text-xs text-amber-700/80 dark:text-amber-500/80 leading-relaxed mt-1">
              Sambungkan IoT dengan mengisi Supabase credentials (.env) untuk live monitoring.
            </p>
          </div>
        </div>
      )}

      {currentRecord ? (
        <>
          {currentRecord.alert_status !== "Normal" && (
            <div className={`rounded-xl border p-4 flex items-center justify-between animate-pulse ${currentRecord.alert_status === "Critical"
              ? "bg-red-500/10 text-red-500 border-red-500/30"
              : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    Ada Anomali! ({currentRecord.alert_status === "Critical" ? "Kritis" : "Waspada"})
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90 leading-normal">
                    {currentRecord.load_type === "Base Facility Load" ? "Beban Dasar" :
                      currentRecord.load_type === "Low Power Factor / Heavy Inductive" ? "PF Rendah (Induktif)" :
                        currentRecord.load_type === "Over-compensated / Capacitive Idle" ? "Over-kompensasi (Kapasitif)" :
                          currentRecord.load_type === "Maximum Industrial Demand" ? "Beban Puncak" :
                            currentRecord.load_type === "Abnormal Weekend Load Leak" ? "Beban Weekend Anomali" :
                              currentRecord.load_type} | Risiko: {currentRecord.risk_level === "High" ? "Tinggi" : currentRecord.risk_level === "Medium" ? "Sedang" : "Rendah"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-background/50 border border-current px-2.5 py-0.5 rounded-full uppercase">
                {currentRecord.day_of_week === "Monday" ? "Senin" : currentRecord.day_of_week === "Tuesday" ? "Selasa" : currentRecord.day_of_week === "Wednesday" ? "Rabu" : currentRecord.day_of_week === "Thursday" ? "Kamis" : currentRecord.day_of_week === "Friday" ? "Jumat" : currentRecord.day_of_week === "Saturday" ? "Sabtu" : currentRecord.day_of_week === "Sunday" ? "Minggu" : currentRecord.day_of_week} ({currentRecord.week_status === "Weekend" ? "Weekend" : "Weekday"})
              </span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-xs relative overflow-hidden">
              <div className="absolute right-4 top-4 text-primary bg-primary/10 p-2 rounded-lg">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Daya Aktif</span>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight">{currentRecord.usage_kwh.toFixed(2)}</span>
                <span className="text-sm font-semibold text-muted-foreground">kW</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                Interval 2s
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-xs relative overflow-hidden">
              <div className="absolute right-4 top-4 text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Power Factor</span>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">PF LAGGING</span>
                  <span className={`text-lg font-bold ${currentRecord.lagging_pf < 0.85 ? "text-red-500 font-extrabold" : "text-foreground"
                    }`}>{currentRecord.lagging_pf.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">PF LEADING</span>
                  <span className="text-lg font-bold text-foreground">{currentRecord.leading_pf.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${currentRecord.lagging_pf < 0.85 ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  style={{ width: `${currentRecord.lagging_pf * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-xs relative overflow-hidden">
              <div className="absolute right-4 top-4 text-purple-500 bg-purple-500/10 p-2 rounded-lg">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Daya Reaktif</span>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">LAGGING</span>
                  <span className="text-lg font-bold text-foreground">{currentRecord.lagging_reactive.toFixed(0)}<span className="text-[10px] text-muted-foreground font-normal"> kVARh</span></span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold">LEADING</span>
                  <span className="text-lg font-bold text-foreground">{currentRecord.leading_reactive.toFixed(0)}<span className="text-[10px] text-muted-foreground font-normal"> kVARh</span></span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Daya reaktif aman
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-xs relative overflow-hidden">
              <div className="absolute right-4 top-4 text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Emisi Karbon</span>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-500">{currentRecord.co2.toFixed(2)}</span>
                <span className="text-sm font-semibold text-muted-foreground">kg CO₂/h</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Estimasi emisi
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-md flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tren Real-time
              </h3>
              <div className="flex bg-muted rounded-lg p-0.5 text-xs font-medium border border-border">
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'usage' ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Daya Aktif (kW)
                </button>
                <button
                  onClick={() => setActiveTab('pf')}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'pf' ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  PF Lagging
                </button>
                <button
                  onClick={() => setActiveTab('reactive')}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'reactive' ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Daya Reaktif Lagging (kVARh)
                </button>
              </div>
            </div>

            {chartMeta ? (
              <div className="w-full relative overflow-hidden bg-card/50 rounded-xl p-2 border border-border/20">
                <svg
                  viewBox={`0 0 ${chartMeta.width} ${chartMeta.height}`}
                  className="w-full h-[220px] select-none"
                >
                  <defs>
                    <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartMeta.color} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={chartMeta.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  {[0.25, 0.5, 0.75].map((ratio, index) => {
                    const y = chartMeta.padding + ratio * (chartMeta.height - chartMeta.padding * 2);
                    const valLabel = chartMeta.maxVal - ratio * (chartMeta.maxVal - chartMeta.minVal);
                    return (
                      <g key={index} opacity="0.15">
                        <line
                          x1={chartMeta.padding}
                          y1={y}
                          x2={chartMeta.width - chartMeta.padding}
                          y2={y}
                          stroke="oklch(var(--foreground))"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={chartMeta.padding + 5}
                          y={y - 4}
                          fill="oklch(var(--foreground))"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {valLabel.toFixed(activeTab === 'pf' ? 2 : 0)}
                        </text>
                      </g>
                    );
                  })}

                  <path
                    d={chartMeta.areaD}
                    fill="url(#chartGlow)"
                  />

                  <path
                    d={chartMeta.pathD}
                    fill="none"
                    stroke={chartMeta.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {chartMeta.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={i === chartMeta.points.length - 1 ? "4.5" : "2"}
                      fill={i === chartMeta.points.length - 1 ? chartMeta.color : "oklch(var(--background))"}
                      stroke={chartMeta.color}
                      strokeWidth="2.5"
                      className={i === chartMeta.points.length - 1 ? "animate-pulse" : ""}
                    />
                  ))}
                </svg>

                <div className="flex justify-between px-5 text-[9px] text-muted-foreground font-mono">
                  <span>{new Date(telemetry[0].timestamp).toLocaleTimeString()}</span>
                  <span>Tren Real-time (20 data terakhir)</span>
                  <span>{new Date(currentRecord.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center border rounded-xl border-dashed border-border text-xs text-muted-foreground">
                Buffering data... (butuh minimal 2 data)
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-xl border border-border/50 bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Analisis AI
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded">
                    Akurasi: {((currentRecord.confidence ?? 1.0) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="rounded-xl border border-border/30 bg-muted/10 p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

                  <div className="flex gap-3">
                    <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {currentRecord.load_type === "Base Facility Load" ? "Beban Dasar" :
                          currentRecord.load_type === "Low Power Factor / Heavy Inductive" ? "PF Rendah (Induktif)" :
                            currentRecord.load_type === "Over-compensated / Capacitive Idle" ? "Over-kompensasi (Kapasitif)" :
                              currentRecord.load_type === "Maximum Industrial Demand" ? "Beban Puncak" :
                                currentRecord.load_type === "Abnormal Weekend Load Leak" ? "Beban Weekend Anomali" :
                                  currentRecord.load_type}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">Rekomendasi Tindakan:</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-background/40 p-3 rounded-lg border border-border/20">
                    "{currentRecord.recommendation}"
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                <span>Model version: v2.1.0-alpha</span>
                <span>Pola beban: {currentRecord.week_status === "Weekend" ? "Weekend" : "Weekday"}</span>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-border/50 bg-card p-6 shadow-xs flex flex-col space-y-4 h-[300px]">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Log Grid
              </h3>

              <div className="flex-1 bg-black text-emerald-400 font-mono text-[10px] p-4 rounded-lg overflow-y-auto border border-border/40 space-y-1.5 select-none leading-relaxed">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-12">Menunggu data...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {log}
                    </div>
                  ))
                )}
              </div>

              <div className="text-[9px] text-muted-foreground flex items-center justify-between shrink-0">
                <span>Frekuensi: 2s</span>
                <span>Buffer limit: 30 log</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-12 text-center h-[350px] flex flex-col items-center justify-center">
          <WifiOff className="h-10 w-10 text-muted-foreground animate-bounce mb-3" />
          <h3 className="font-semibold">Koneksi Jaringan...</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Menghubungkan ke database Supabase atau simulator lokal. Menunggu data...
          </p>
        </div>
      )}
    </div>
  );
}
