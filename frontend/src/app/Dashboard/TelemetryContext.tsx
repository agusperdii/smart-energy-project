import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase, subscribeToTelemetry } from "./supabase";
import type { TelemetryRecord } from "./supabase";

interface TelemetryContextType {
  telemetry: TelemetryRecord[];
  logs: string[];
  isLive: boolean;
  setIsLive: (val: boolean) => void;
  isSupabaseConnected: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
};

interface TelemetryProviderProps {
  children: React.ReactNode;
}

export const TelemetryProvider: React.FC<TelemetryProviderProps> = ({ children }) => {
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const isSupabaseConnected = !!supabase;

  const telemetryRef = useRef<TelemetryRecord[]>([]);
  telemetryRef.current = telemetry;

  const handleNewRecord = (record: TelemetryRecord) => {
    const lastRecord = telemetryRef.current.length > 0 
      ? telemetryRef.current[telemetryRef.current.length - 1] 
      : null;

    const mergedRecord: TelemetryRecord = { ...record };

    const isNullOrUndefined = (val: any) => val === null || val === undefined;

    if (isNullOrUndefined(mergedRecord.load_type)) {
      mergedRecord.load_type = lastRecord ? lastRecord.load_type : "Base Facility Load";
    }
    if (isNullOrUndefined(mergedRecord.confidence)) {
      mergedRecord.confidence = lastRecord ? lastRecord.confidence : 1.0;
    }
    if (isNullOrUndefined(mergedRecord.risk_level)) {
      mergedRecord.risk_level = lastRecord ? lastRecord.risk_level : "Low";
    }
    if (isNullOrUndefined(mergedRecord.recommendation)) {
      mergedRecord.recommendation = lastRecord ? lastRecord.recommendation : "Menganalisis data...";
    }
    if (isNullOrUndefined(mergedRecord.alert_status)) {
      mergedRecord.alert_status = lastRecord ? lastRecord.alert_status : "Normal";
    }

    setTelemetry((prev) => {
      const updated = [...prev, mergedRecord];
      return updated.slice(-20);
    });

    const logTime = new Date(mergedRecord.timestamp).toLocaleTimeString();
    const newLog = `[${logTime}] RECV ID:${mergedRecord.id} | Active:${mergedRecord.usage_kwh.toFixed(2)}kW | LgPF:${mergedRecord.lagging_pf.toFixed(2)} | Alert:${mergedRecord.alert_status}`;
    setLogs((prev) => [newLog, ...prev].slice(0, 30));

    if (soundEnabled && mergedRecord.alert_status === "Critical") {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(580, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        console.error("Audio beep failed:", e);
      }
    }
  };

  const generateMockTick = (timeMs: number, id: number, tickNum: number = 0): TelemetryRecord => {
    const date = new Date(timeMs);
    const nsmVal = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dowVal = days[date.getDay()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const weekStatusVal = isWeekend ? "Weekend" : "Weekday";

    const anomalyPhase = tickNum % 25;
    const isLowPFAnomaly = anomalyPhase >= 10 && anomalyPhase < 14;
    const isCapacitiveAnomaly = anomalyPhase >= 18 && anomalyPhase < 21;
    const isPeakLoadAnomaly = anomalyPhase >= 4 && anomalyPhase < 8 && !isWeekend;

    let usage_kwh = 350 + Math.sin(tickNum / 5) * 40 + (Math.random() - 0.5) * 15;
    let lagging_reactive = 120 + Math.cos(tickNum / 4) * 15 + (Math.random() - 0.5) * 8;
    let leading_reactive = 15 + (Math.random() - 0.5) * 4;
    let lagging_pf = 0.91 + Math.sin(tickNum / 8) * 0.02 + Math.random() * 0.01;
    let leading_pf = 0.98 + (Math.random() - 0.5) * 0.01;

    let load_type = "Base Facility Load";
    let risk_level: 'Low' | 'Medium' | 'High' = 'Low';
    let alert_status: 'Normal' | 'Warning' | 'Critical' = 'Normal';
    let recommendation = "Grid aman & stabil. PF optimal, tidak butuh tindakan.";
    let confidence = 0.94 + Math.random() * 0.04;

    if (isLowPFAnomaly) {
      usage_kwh = 480 + Math.random() * 20;
      lagging_reactive = 390 + Math.random() * 15;
      lagging_pf = 0.71 + Math.random() * 0.03;
      load_type = "Low Power Factor / Heavy Inductive";
      risk_level = "High";
      alert_status = "Critical";
      recommendation = `PF lagging drop ke ${lagging_pf.toFixed(2)} (daya reaktif tinggi). Cek panel APFC dan pastikan kapasitor bank aktif.`;
      confidence = 0.88 + Math.random() * 0.05;
    } else if (isCapacitiveAnomaly) {
      usage_kwh = 40 + Math.random() * 8;
      leading_reactive = 135 + Math.random() * 10;
      lagging_reactive = 5 + Math.random() * 2;
      leading_pf = 0.61 + Math.random() * 0.04;
      load_type = "Over-compensated / Capacitive Idle";
      risk_level = "Medium";
      alert_status = "Warning";
      recommendation = `PF leading drop ke ${leading_pf.toFixed(2)} (over-kompensasi saat beban rendah). Setel delay APFC atau kurangi step kapasitor biar tegangan stabil.`;
      confidence = 0.91 + Math.random() * 0.04;
    } else if (isPeakLoadAnomaly) {
      usage_kwh = 840 + Math.random() * 50;
      lagging_reactive = 180 + Math.random() * 15;
      lagging_pf = 0.94 + Math.random() * 0.01;
      load_type = "Maximum Industrial Demand";
      risk_level = "Medium";
      alert_status = "Normal";
      recommendation = `Beban mepet peak di ${usage_kwh.toFixed(0)} kW pada jam sibuk. Atur startup mesin besar bergantian (staggered) biar gak kena denda daya.`;
      confidence = 0.93 + Math.random() * 0.03;
    } else if (isWeekend && usage_kwh > 200) {
      load_type = "Abnormal Weekend Load Leak";
      risk_level = "Medium";
      alert_status = "Warning";
      recommendation = `Beban weekend bocor di ${usage_kwh.toFixed(0)} kW. Cek AC, chiller, atau kompresor yang lupa dimatikan.`;
      confidence = 0.93 + Math.random() * 0.03;
    }

    const co2 = usage_kwh * 0.475;

    return {
      id,
      timestamp: new Date(timeMs).toISOString(),
      usage_kwh: parseFloat(usage_kwh.toFixed(2)),
      lagging_reactive: parseFloat(lagging_reactive.toFixed(2)),
      leading_reactive: parseFloat(leading_reactive.toFixed(2)),
      lagging_pf: parseFloat(lagging_pf.toFixed(3)),
      leading_pf: parseFloat(leading_pf.toFixed(3)),
      co2: parseFloat(co2.toFixed(2)),
      nsm: nsmVal,
      week_status: weekStatusVal,
      day_of_week: dowVal,
      load_type,
      confidence: parseFloat(confidence.toFixed(3)),
      risk_level,
      recommendation,
      alert_status
    };
  };

  useEffect(() => {
    if (!isLive || !isSupabaseConnected) return;

    const unsubscribe = subscribeToTelemetry((record) => {
      handleNewRecord(record);
    });

    return () => {
      unsubscribe();
    };
  }, [isLive, isSupabaseConnected, soundEnabled]);

  useEffect(() => {
    if (!isLive || isSupabaseConnected) return;

    if (telemetryRef.current.length === 0) {
      const initialRecords: TelemetryRecord[] = [];
      const now = Date.now();
      for (let i = 19; i >= 0; i--) {
        const t = now - (i * 2000);
        initialRecords.push(generateMockTick(t, 200 - i));
      }
      setTelemetry(initialRecords);
    }

    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      const nextId = telemetryRef.current.length > 0 
        ? Number(telemetryRef.current[telemetryRef.current.length - 1].id) + 1 
        : 1000;
        
      const newRecord = generateMockTick(Date.now(), nextId, tickCount);
      handleNewRecord(newRecord);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, isSupabaseConnected, soundEnabled]);

  return (
    <TelemetryContext.Provider value={{
      telemetry,
      logs,
      isLive,
      setIsLive,
      isSupabaseConnected,
      soundEnabled,
      setSoundEnabled
    }}>
      {children}
    </TelemetryContext.Provider>
  );
};
