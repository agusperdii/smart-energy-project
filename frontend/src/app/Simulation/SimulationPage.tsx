import { useState, useEffect } from "react";
import { 
  Zap, 
  Activity, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Copy, 
  Check, 
  History,
  Gauge
} from "lucide-react";
import { postSimulationData } from "./api";
import type { SimulationInput, SimulationOutput } from "./api";

const formatDateTimeLocal = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

export default function SimulationPage() {
  const [datetime, setDatetime] = useState<string>(formatDateTimeLocal(new Date()));
  const [laggingReactivePower, setLaggingReactivePower] = useState<number>(120);
  const [leadingReactivePower, setLeadingReactivePower] = useState<number>(12);
  const [laggingPF, setLaggingPF] = useState<number>(0.92);
  const [leadingPF, setLeadingPF] = useState<number>(0.98);
  const [usageKWh, setUsageKWh] = useState<number>(450);

  const [nsm, setNsm] = useState<number>(0);
  const [weekStatus, setWeekStatus] = useState<string>("Weekday");
  const [dayOfWeek, setDayOfWeek] = useState<string>("Monday");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SimulationOutput | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  const [history, setHistory] = useState<SimulationOutput[]>([]);

  useEffect(() => {
    if (!datetime) return;
    try {
      const date = new Date(datetime);
      if (isNaN(date.getTime())) return;

      const calculatedNsm = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
      setNsm(calculatedNsm);

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const calculatedDayOfWeek = days[date.getDay()];
      setDayOfWeek(calculatedDayOfWeek);

      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      setWeekStatus(isWeekend ? "Weekend" : "Weekday");
    } catch (e) {
      console.error("Error parsing datetime:", e);
    }
  }, [datetime]);

  const presets = [
    {
      name: "Peak Load (Weekday)",
      icon: Zap,
      data: {
        datetime: (() => {
          const d = new Date();
          d.setHours(14, 30, 0);
          if (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 2);
          return formatDateTimeLocal(d);
        })(),
        laggingReactivePower: 220,
        leadingReactivePower: 15,
        laggingPF: 0.94,
        leadingPF: 0.99,
        usageKWh: 880
      }
    },
    {
      name: "Anomali Low PF",
      icon: AlertCircle,
      data: {
        datetime: (() => {
          const d = new Date();
          d.setHours(9, 15, 0);
          return formatDateTimeLocal(d);
        })(),
        laggingReactivePower: 380,
        leadingReactivePower: 5,
        laggingPF: 0.72,
        leadingPF: 0.99,
        usageKWh: 450
      }
    },
    {
      name: "Over-kompensasi Kapasitif",
      icon: RefreshCw,
      data: {
        datetime: (() => {
          const d = new Date();
          d.setHours(23, 45, 0);
          return formatDateTimeLocal(d);
        })(),
        laggingReactivePower: 5,
        leadingReactivePower: 140,
        laggingPF: 0.99,
        leadingPF: 0.62,
        usageKWh: 60
      }
    },
    {
      name: "Beban Weekend Tidak Normal",
      icon: Activity,
      data: {
        datetime: (() => {
          const d = new Date();
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? 0 : 7);
          d.setDate(diff);
          d.setHours(15, 0, 0);
          return formatDateTimeLocal(d);
        })(),
        laggingReactivePower: 140,
        leadingReactivePower: 10,
        laggingPF: 0.92,
        leadingPF: 0.99,
        usageKWh: 580
      }
    }
  ];

  const applyPreset = (presetData: typeof presets[0]["data"]) => {
    setDatetime(presetData.datetime);
    setLaggingReactivePower(presetData.laggingReactivePower);
    setLeadingReactivePower(presetData.leadingReactivePower);
    setLaggingPF(presetData.laggingPF);
    setLeadingPF(presetData.leadingPF);
    setUsageKWh(presetData.usageKWh);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: SimulationInput = {
      datetime,
      laggingReactivePower,
      leadingReactivePower,
      laggingPF,
      leadingPF,
      usageKWh,
      nsm,
      weekStatus,
      dayOfWeek
    };

    try {
      const response = await postSimulationData(payload);
      setResults(response);
      setHistory(prev => [response, ...prev].slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRecommendation = () => {
    if (!results) return;
    navigator.clipboard.writeText(results.recommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Simulasi Grid
        </h1>
        <p className="text-muted-foreground mt-1">
          Uji parameter daya listrik untuk melihat analisis beban dan rekomendasi AI.
        </p>
      </div>

      <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-4 shadow-xs hover:border-primary/20 transition-all duration-300">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preset Cepat</h2>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <button
                key={index}
                onClick={() => applyPreset(preset.data)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-6 space-y-6 shadow-xs hover:border-primary/20 transition-all duration-300">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Input Data
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Waktu</label>
                <input
                  type="datetime-local"
                  required
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-muted-foreground mb-1.5">Auto-Hitung</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Hari</span>
                    <span className="text-sm font-bold text-foreground mt-0.5 block">{dayOfWeek === "Monday" ? "Senin" : dayOfWeek === "Tuesday" ? "Selasa" : dayOfWeek === "Wednesday" ? "Rabu" : dayOfWeek === "Thursday" ? "Kamis" : dayOfWeek === "Friday" ? "Jumat" : dayOfWeek === "Saturday" ? "Sabtu" : dayOfWeek === "Sunday" ? "Minggu" : dayOfWeek}</span>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Tipe Hari</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      weekStatus === "Weekend" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                    }`}>
                      {weekStatus === "Weekend" ? "Weekend" : "Weekday"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">NSM (Detik)</span>
                    <span className="text-sm font-mono font-bold text-foreground mt-0.5 block">{nsm}s</span>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border/50" />

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label className="font-medium text-foreground">Daya Aktif (Usage)</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number"
                      value={usageKWh}
                      onChange={(e) => setUsageKWh(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 text-right px-1.5 py-0.5 text-xs rounded border border-input focus:outline-hidden"
                    />
                    <span className="text-xs text-muted-foreground font-semibold">kWh</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={usageKWh}
                  onChange={(e) => setUsageKWh(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label className="font-medium text-foreground">Daya Reaktif Lagging</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number"
                      value={laggingReactivePower}
                      onChange={(e) => setLaggingReactivePower(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 text-right px-1.5 py-0.5 text-xs rounded border border-input focus:outline-hidden"
                    />
                    <span className="text-xs text-muted-foreground font-semibold">kVARh</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={laggingReactivePower}
                  onChange={(e) => setLaggingReactivePower(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <label className="font-medium text-foreground">Daya Reaktif Leading</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number"
                      value={leadingReactivePower}
                      onChange={(e) => setLeadingReactivePower(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 text-right px-1.5 py-0.5 text-xs rounded border border-input focus:outline-hidden"
                    />
                    <span className="text-xs text-muted-foreground font-semibold">kVARh</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={leadingReactivePower}
                  onChange={(e) => setLeadingReactivePower(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <hr className="border-border/50" />

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-foreground">PF Lagging</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={laggingPF}
                    onChange={(e) => setLaggingPF(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-14 text-right px-1 py-0.5 text-xs rounded border border-input focus:outline-hidden"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={laggingPF}
                  onChange={(e) => setLaggingPF(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="font-medium text-foreground">PF Leading</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={leadingPF}
                    onChange={(e) => setLeadingPF(Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-14 text-right px-1 py-0.5 text-xs rounded border border-input focus:outline-hidden"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={leadingPF}
                  onChange={(e) => setLeadingPF(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex h-11 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  Simulasikan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 flex flex-col">
          {isLoading ? (
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-6 shadow-xs flex-1 space-y-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-muted rounded-md" />
                <div className="h-5 w-20 bg-muted rounded-full" />
              </div>
              <div className="space-y-4">
                <div className="h-24 bg-muted rounded-xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary/30 animate-spin" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-muted rounded-xl" />
                  <div className="h-16 bg-muted rounded-xl" />
                </div>
                <div className="h-32 bg-muted rounded-xl" />
              </div>
            </div>
          ) : results ? (
            <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-6 shadow-xs flex-1 space-y-6 animate-fade-in flex flex-col justify-between hover:border-primary/20 transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Analisis AI
                  </h3>
                  
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-xs animate-pulse ${
                    results.alertStatus === "Critical" 
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : results.alertStatus === "Warning"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      results.alertStatus === "Critical" ? "bg-red-500" : results.alertStatus === "Warning" ? "bg-amber-500" : "bg-emerald-500"
                     }`} />
                    {results.alertStatus === "Critical" ? "Kritis" : results.alertStatus === "Warning" ? "Waspada" : "Normal"}
                  </span>
                </div>
 
                {results.isMocked && (
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2 flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-amber-600/90 leading-tight">
                      <strong>Offline Mode:</strong> Pakai simulasi lokal.
                    </span>
                  </div>
                )}
 
                <div className="rounded-xl bg-muted/20 border border-border/40 p-4 text-center">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block">Tipe Beban</span>
                  <span className="text-xl font-bold block mt-1 text-foreground">
                    {results.loadType === "Base Facility Load" ? "Beban Dasar" :
                     results.loadType === "Inductive / Low Power Factor" ? "PF Rendah (Induktif)" :
                     results.loadType === "Over-compensated / Capacitive" ? "Over-kompensasi (Kapasitif)" :
                     results.loadType === "Abnormal Weekend Load" ? "Beban Weekend Anomali" :
                     results.loadType === "Maximum Peak Demand" ? "Beban Puncak" :
                     results.loadType === "Standard Manufacturing Load" ? "Beban Produksi" :
                     results.loadType}
                  </span>
                </div>
 
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border/40 bg-muted/10 p-3.5 space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Risiko</span>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-base font-bold ${
                        results.riskLevel === "High" ? "text-red-500" : results.riskLevel === "Medium" ? "text-amber-500" : "text-emerald-500"
                      }`}>{results.riskLevel === "High" ? "Tinggi" : results.riskLevel === "Medium" ? "Sedang" : "Rendah"}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        results.riskLevel === "High" ? "w-full bg-red-500" : results.riskLevel === "Medium" ? "w-2/3 bg-amber-500" : "w-1/3 bg-emerald-500"
                      }`} />
                    </div>
                  </div>
 
                  <div className="rounded-xl border border-border/40 bg-muted/10 p-3.5 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Akurasi AI</span>
                    <div className="flex items-center gap-2">
                      <div className="relative h-9 w-9 flex items-center justify-center">
                        <svg className="absolute transform -rotate-90 w-full h-full">
                          <circle cx="18" cy="18" r="14" stroke="var(--border)" strokeWidth="2.5" fill="transparent" />
                          <circle cx="18" cy="18" r="14" stroke="var(--primary)" strokeWidth="2.5" fill="transparent"
                            strokeDasharray={88}
                            strokeDashoffset={88 - (88 * results.confidenceScore)}
                          />
                        </svg>
                        <span className="text-[10px] font-bold text-foreground">{(results.confidenceScore * 100).toFixed(0)}%</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">Akurasi</span>
                    </div>
                  </div>
                </div>
 
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rekomendasi AI</label>
                    <button 
                      onClick={copyRecommendation}
                      className="p-1 rounded-md text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
                      title="Salin rekomendasi"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-linear-to-b from-card to-muted/15 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{results.recommendation}"
                    </p>
                  </div>
                </div>
              </div>
 
              <button
                onClick={() => setResults(null)}
                className="mt-6 w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2 block hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center flex-1 flex flex-col items-center justify-center min-h-[350px]">
              <div className="p-3 rounded-full bg-primary/5 text-primary mb-3">
                <Gauge className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="font-semibold text-sm">Simulator Siap</h3>
              <p className="text-xs text-muted-foreground max-w-[280px] mt-1 mb-4 leading-relaxed">
                Atur parameter di panel kiri, lalu klik <strong>Simulasikan</strong> untuk melihat tipe beban dan rekomendasi AI.
              </p>
            </div>
          )}
        </div>
      </div>
 
      {history.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md p-6 shadow-xs space-y-4 hover:border-primary/20 transition-all duration-300">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
            <History className="h-4 w-4" />
            Riwayat
          </h3>
          <div className="divide-y divide-border/50">
            {history.map((run, i) => (
              <div 
                key={i} 
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs cursor-pointer hover:bg-muted/10 rounded px-2 -mx-2 transition-colors"
                onClick={() => setResults(run)}
              >
                <div className="space-y-0.5">
                  <span className="font-semibold block">
                    {run.loadType === "Base Facility Load" ? "Beban Dasar" :
                     run.loadType === "Inductive / Low Power Factor" ? "PF Rendah (Induktif)" :
                     run.loadType === "Over-compensated / Capacitive" ? "Over-kompensasi (Kapasitif)" :
                     run.loadType === "Abnormal Weekend Load" ? "Beban Weekend Anomali" :
                     run.loadType === "Maximum Peak Demand" ? "Beban Puncak" :
                     run.loadType === "Standard Manufacturing Load" ? "Beban Produksi" :
                     run.loadType}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {new Date(run.timestamp).toLocaleTimeString()} — Akurasi: {(run.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    run.riskLevel === "High" ? "bg-red-500/10 text-red-500" : run.riskLevel === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                    {run.riskLevel === "High" ? "Tinggi" : run.riskLevel === "Medium" ? "Sedang" : "Rendah"}
                  </span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    run.alertStatus === "Critical" ? "bg-red-500/10 text-red-500" : run.alertStatus === "Warning" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                    {run.alertStatus === "Critical" ? "Kritis" : run.alertStatus === "Warning" ? "Waspada" : "Normal"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
