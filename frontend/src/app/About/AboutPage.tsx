import { ShieldAlert, Award, FileText } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Tentang
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitoring grid daya industri, optimasi beban, dan analisis anomali.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Fungsi</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Memantau parameter daya secara real-time untuk mendeteksi low PF, over-kompensasi, dan beban puncak guna menghindari denda & menjaga efisiensi grid.
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-lg">Analisis AI</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Memakai machine learning dan model inferensi untuk analisis risiko serta rekomendasi solusi agar grid tetap stabil.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Detail Teknis
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
          <li><strong>Parameter Input:</strong> Daya Aktif (kWh), Daya Reaktif (Lagging/Leading kVARh), Power Factor (Lagging/Leading PF), Timestamp.</li>
          <li><strong>Data Terhitung:</strong> NSM (Detik), Tipe Hari (Weekday / Weekend), Hari.</li>
          <li><strong>Hasil AI:</strong> Tipe Beban, Risiko, Rekomendasi AI, Akurasi AI.</li>
        </ul>
      </div>
    </div>
  );
}
