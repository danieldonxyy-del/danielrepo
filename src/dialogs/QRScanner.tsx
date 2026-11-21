import React, { useState } from 'react';
import { QrCode, ScanLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useApp } from '../context/AppContext';
import { EventRegistration, CampusEvent } from '../types';

interface QRScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ open, onOpenChange }) => {
  const { checkInToken, registrations, events, student } = useApp();
  const [tokenInput, setTokenInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    registration?: EventRegistration;
  } | null>(null);

  // Suggested tokens from existing demo registrations
  const availableTokens = registrations
    .filter((r: EventRegistration) => !!r.registrationToken)
    .map((r: EventRegistration) => {
      const evt = events.find((e: CampusEvent) => e.id === r.eventId);
      return {
        token: r.registrationToken!,
        title: evt?.title || 'Kegiatan tidak diketahui',
        status: r.attendanceStatus,
      };
    });

  const handleScan = async (tokenToVerify?: string) => {
    const token = (tokenToVerify || tokenInput).trim();
    if (!token) return;

    setIsScanning(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const result = await checkInToken(token);
      setScanResult(result);
      setTokenInput('');
    } finally {
      setIsScanning(false);
    }
  };

  const getEventForReg = (eventId?: string): CampusEvent | undefined => {
    if (!eventId) return undefined;
    return events.find((e: CampusEvent) => e.id === eventId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Pemindai kehadiran demo UNKLAB
            </h3>
            <p className="text-[11px] text-slate-400">
              Verifikasi tiket digital saat peserta memasuki kegiatan kampus.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Scanner Viewfinder */}
      <div className="relative rounded-2xl bg-slate-950 h-52 flex flex-col items-center justify-center overflow-hidden border border-slate-800 text-white select-none">
        <div className="relative w-36 h-36 border-2 border-dashed border-cyan-400/70 rounded-2xl flex items-center justify-center">
          <ScanLine className="h-10 w-10 text-cyan-400 animate-pulse" />
          {/* Animated scanning bar */}
          <div className="absolute top-0 left-0 right-0 h-1 [--scan-distance:8rem] bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-scan" />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 font-mono">
          [KAMERA SIMULASI AKTIF]
        </p>
      </div>

      {/* Manual Token Input / One-Click Sample Tokens */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            aria-label="Pindai atau masukkan token tiket"
            placeholder="Pindai atau masukkan token (contoh: KLS-EVT-2026-8F3A91)"
            value={tokenInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenInput(e.target.value)}
            className="text-xs font-mono uppercase"
          />
          <Button
            size="sm"
            variant="primary"
            disabled={!tokenInput.trim() || isScanning}
            onClick={() => handleScan()}
            className="font-bold shrink-0 text-xs"
          >
            {isScanning ? 'Memverifikasi…' : 'Verifikasi'}
          </Button>
        </div>

        {/* Quick Click Demo Tokens */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Token demo dari agenda mahasiswa:
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {availableTokens.map((item: { token: string; title: string; status: string }, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => handleScan(item.token)}
                className={`text-[10px] px-2.5 py-1 rounded-xl font-mono border transition-colors ${
                  item.status === 'checked_in'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {item.token} ({item.status === 'checked_in' ? 'Sudah check-in' : 'Menunggu'})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Result Feedback */}
      {scanResult && (
        <div
          className={`p-4 rounded-2xl border text-xs animate-in fade-in duration-200 ${
            scanResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {scanResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold text-sm">
                {scanResult.success ? 'Kehadiran terverifikasi' : 'Pemberitahuan check-in'}
              </span>
              <p className="leading-relaxed">{scanResult.message}</p>

              {scanResult.registration && (
                <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-[11px] space-y-0.5">
                  <div>
                    <span className="font-semibold">Mahasiswa:</span> {student.fullName} ({student.nim})
                  </div>
                  <div>
                    <span className="font-semibold">Kegiatan:</span>{' '}
                    {getEventForReg(scanResult.registration.eventId)?.title || 'Kegiatan kampus'}
                  </div>
                  {scanResult.registration.checkedInAt && (
                    <div>
                      <span className="font-semibold">Waktu:</span>{' '}
                      {scanResult.registration.checkedInAt}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
          Tutup pemindai
        </Button>
      </div>
    </Dialog>
  );
};
