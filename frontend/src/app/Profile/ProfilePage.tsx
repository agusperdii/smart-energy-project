import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Cpu,
  Building2,
  Volume2,
  VolumeX,
  Save,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import { useTelemetry } from "../Dashboard/TelemetryContext";
import { useTheme } from "../Components/ThemeContext";

interface OperatorProfile {
  name: string;
  email: string;
  role: string;
  division: string;
  facilityId: string;
  machineId: string;
  shift: string;
}

const DEFAULT_PROFILE: OperatorProfile = {
  name: "Budi Santoso",
  email: "budi.santoso@steelsense.io",
  role: "Supervisor Kelistrikan",
  division: "Divisi Peleburan Baja",
  facilityId: "FAC-STEEL-8892",
  machineId: "machine-01",
  shift: "Shift A (Pagi)"
};

export default function ProfilePage() {
  const { soundEnabled, setSoundEnabled, telemetry } = useTelemetry();
  const { theme, toggleTheme } = useTheme();
  
  // State for profile data
  const [profile, setProfile] = useState<OperatorProfile>(DEFAULT_PROFILE);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize from LocalStorage if available
  useEffect(() => {
    const savedData = localStorage.getItem("steelsense_profile");
    if (savedData) {
      try {
        setProfile(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved profile, using defaults.", e);
      }
    }
  }, []);

  // Handle save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("steelsense_profile", JSON.stringify(profile));
    setIsSaved(true);
    setIsEditing(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Get initials for avatar
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Profil Operator
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card & Stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-md p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
            {/* Visual Glassmorphism Background Accent */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
            
            <div className="mx-auto h-24 w-24 rounded-full bg-linear-to-tr from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-3xl font-black shadow-md border-2 border-background">
              {getInitials(profile.name)}
            </div>
            
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sesi Aktif Terverifikasi
            </div>

            <hr className="border-border/50" />

            <div className="space-y-3 text-left text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{profile.division}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cpu className="h-4 w-4 shrink-0 text-primary" />
                <span>Station: {profile.machineId}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>Jadwal: {profile.shift}</span>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Summary Stats */}
          <div className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-md p-6 space-y-4 shadow-sm">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Statistik Sesi Operator
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-accent/30 border border-border/30 text-center">
                <span className="text-2xl font-black text-primary">{telemetry.length}</span>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider font-semibold">
                  Sinyal Dipantau
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/30 border border-border/30 text-center">
                <span className="text-2xl font-black text-emerald-500">
                  {telemetry.filter(t => t.alert_status === "Normal").length}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase mt-1 tracking-wider font-semibold">
                  Status Aman
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center italic">
              Metrik disinkronkan secara real-time dari database SteelSense.
            </p>
          </div>
        </div>

        {/* Configuration Forms */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Pengaturan Kredensial & Stasiun
              </h3>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-foreground hover:bg-accent/80 transition-all cursor-pointer"
                >
                  Sunting Profil
                </button>
              )}
            </div>

            {isSaved && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 text-sm font-medium animate-pulse">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Pengaturan berhasil disimpan di memori lokal produksi!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Resmi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Jabatan Operasional
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    required
                    className="w-full px-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Divisi Kerja
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.division}
                    onChange={(e) => setProfile({ ...profile, division: e.target.value })}
                    required
                    className="w-full px-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    ID Fasilitas (Pabrik)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.facilityId}
                    onChange={(e) => setProfile({ ...profile, facilityId: e.target.value })}
                    required
                    className="w-full px-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    ID Mesin Dipantau (Sensor IoT)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profile.machineId}
                    onChange={(e) => setProfile({ ...profile, machineId: e.target.value })}
                    required
                    placeholder="Contoh: machine-01"
                    className="w-full px-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Jadwal Giliran (Shift) Kerja
                  </label>
                  <select
                    disabled={!isEditing}
                    value={profile.shift}
                    onChange={(e) => setProfile({ ...profile, shift: e.target.value })}
                    className="w-full px-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-60 transition-all"
                  >
                    <option value="Shift A (Pagi)">Shift A (Pagi) - 06:00 s.d 14:00</option>
                    <option value="Shift B (Sore)">Shift B (Sore) - 14:00 s.d 22:00</option>
                    <option value="Shift C (Malam)">Shift C (Malam) - 22:00 s.d 06:00</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Restore from localStorage or default
                      const saved = localStorage.getItem("steelsense_profile");
                      if (saved) setProfile(JSON.parse(saved));
                    }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent/70 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Preferences Settings (Audio Alarm & Theme) */}
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Preferensi Sistem & Alerting
            </h3>
            
            <div className="space-y-4">
              {/* Theme Toggle Preference */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-accent/10">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    {theme === "light" ? (
                      <Sun className="h-4 w-4 text-amber-500 animate-spin-once" />
                    ) : (
                      <Moon className="h-4 w-4 text-indigo-400" />
                    )}
                    Tema Tampilan (Mode Terang/Gelap)
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Ubah gaya dan kontras antarmuka panel kontrol untuk kenyamanan visual operasional SteelSense.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold border border-border bg-background hover:bg-accent cursor-pointer transition-all duration-200"
                >
                  Beralih ke {theme === "light" ? "Mode Gelap" : "Mode Terang"}
                </button>
              </div>

              {/* Sound alarm toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-accent/10">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-primary" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-muted-foreground" />
                    )}
                    Alarm Audio Suara
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Bunyi sirene digital (580Hz beep) otomatis saat mendeteksi status alert anomali kritis pada parameter kelistrikan industri.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-primary/20 ${
                    soundEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Email Alerting */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-accent/5 opacity-60">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Integrasi Email Peringatan Dini</h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Kirim laporan anomali listrik PF drop ke email operator secara otomatis (Fitur Enterprise).
                  </p>
                </div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1 rounded-md bg-accent">
                  Locked
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
