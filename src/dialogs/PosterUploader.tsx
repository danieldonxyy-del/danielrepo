import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
} from 'lucide-react';
import { samplePosterPresets, SamplePosterPreset } from '../data/samplePosters';
import { aiService } from '../services/aiService';
import { CampusEvent, PosterExtractionResult } from '../types';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Event title is required'),
  category: z.enum(['spiritual', 'academic', 'ormawa', 'dormitory', 'seminar', 'competition']),
  organizer: z.string().min(2, 'Organizer name is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format must be HH:mm'),
  endTime: z.string().optional(),
  location: z.string().min(2, 'Venue location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dressCode: z.string().optional(),
  chapelPoints: z.number().min(0).max(5).default(0),
  capacity: z.number().min(0).optional(),
  registrationDeadline: z.string().optional(),
  dormitoryOnly: z.boolean().default(false),
  contactInfo: z.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface PosterUploaderProps {
  onSuccess?: (event: CampusEvent) => void;
}

export const PosterUploader: React.FC<PosterUploaderProps> = ({ onSuccess }) => {
  const { createEvent, activeRole } = useApp();
  const requiredCategory =
    activeRole === 'ormawa_admin'
      ? 'ormawa'
      : activeRole === 'dormitory_admin'
        ? 'dormitory'
        : activeRole === 'spiritual_admin'
          ? 'spiritual'
          : undefined;
  const categoryOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'spiritual', label: 'Spiritual / Chapel' },
    { value: 'ormawa', label: 'ORMAWA / BEM' },
    { value: 'dormitory', label: 'Dormitory' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'competition', label: 'Competition' },
  ].filter((option) => !requiredCategory || option.value === requiredCategory);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [aiMode, setAiMode] = useState<'demo' | 'live'>('demo');
  const [extractionResult, setExtractionResult] = useState<PosterExtractionResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: {
      category: requiredCategory ?? 'academic',
      chapelPoints: 0,
      dormitoryOnly: false,
    },
  });

  // Handle Drag & Drop / File Upload
  const handleFileChange = (file: File) => {
    setSelectedPresetId(null);
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPosterPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    toast.info(`Poster "${file.name}" uploaded. Click "Extract with AI" to parse.`);
  };

  // Handle preset selection
  const handleSelectPreset = (preset: SamplePosterPreset) => {
    setSelectedPresetId(preset.id);
    setPosterPreview(preset.previewUrl);
    setPosterFile(null);
    runExtraction(preset.id);
  };

  // Run AI Extraction with scanning animation
  const runExtraction = async (presetOrFileName?: string) => {
    if (!posterPreview && !presetOrFileName) {
      toast.error('Please upload a poster or pick a sample preset first.');
      return;
    }

    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    try {
      const target = presetOrFileName || posterFile || 'poster.png';
      const result = await aiService.extractPoster(target);

      clearInterval(interval);
      setScanProgress(100);
      setExtractionResult(result);

      // Populate form
      setValue('title', result.title);
      setValue('category', requiredCategory ?? result.category);
      setValue('organizer', result.organizer);
      setValue('startDate', result.startDate);
      setValue('endDate', result.endDate);
      setValue('startTime', result.startTime);
      setValue('endTime', result.endTime || '');
      setValue('location', result.location);
      setValue('description', result.description);
      setValue('dressCode', result.dressCode || '');
      setValue('chapelPoints', result.chapelPoints || 0);
      setValue('capacity', result.capacity || undefined);
      setValue('registrationDeadline', result.registrationDeadline || '');
      setValue('dormitoryOnly', result.dormitoryOnly || false);
      setValue('contactInfo', result.contactInfo || '');

      if (result.missingFields.length > 0) {
        toast.warning(
          `Ekstraksi selesai dengan ${result.missingFields.length} kolom yang belum pasti. Periksa kolom yang ditandai.`
        );
      } else {
        toast.success('Ekstraksi berhasil. Informasi kegiatan telah diisi dari poster.');
      }
    } catch {
      toast.error('Ekstraksi gagal. Periksa kembali file gambar.');
    } finally {
      setTimeout(() => setIsScanning(false), 400);
    }
  };

  const onSubmit = (data: EventFormData) => {
    const newEvent = createEvent({
      title: data.title,
      description: data.description,
      category: data.category,
      organizer: data.organizer,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime || undefined,
      location: data.location,
      dressCode: data.dressCode || undefined,
      chapelPoints: data.chapelPoints,
      capacity: data.capacity,
      registeredCount: 0,
      registrationDeadline: data.registrationDeadline,
      dormitoryOnly: data.dormitoryOnly,
      contact: data.contactInfo
        ? { name: data.organizer, email: data.contactInfo }
        : undefined,
      status: 'published',
      isVerified: true,
      isDemo: true,
      posterGradient:
        data.category === 'spiritual'
          ? 'from-violet-900 via-indigo-950 to-purple-950'
          : data.category === 'academic'
          ? 'from-blue-900 via-cyan-950 to-slate-950'
          : 'from-amber-900 via-orange-950 to-zinc-950',
    });

    toast.success(`Kegiatan "${data.title}" diterbitkan dan ditambahkan ke daftar kegiatan.`);
    if (onSuccess) onSuccess(newEvent);
  };

  return (
    <div className="space-y-6">
      {/* AI Mode Banner & Instructions */}
      <div className="p-4 rounded-3xl bg-linear-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border border-purple-200/80 dark:border-purple-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-purple-600/20">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Ekstraksi poster kegiatan
              <Badge variant="purple" className="text-[10px]">
                {aiMode === 'demo' ? 'Mode Demo · preset lokal' : 'Mode AI langsung'}
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unggah poster resmi UNKLAB atau pilih poster contoh. AI multimodal akan mengambil judul, jadwal, Poin Chapel, dan lokasi.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setAiMode('demo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              aiMode === 'demo'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Mode Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setAiMode('live');
              toast.info('Mode AI langsung memerlukan adapter layanan backend aman (/api/ai/extract-poster).');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              aiMode === 'live'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Mode AI langsung
          </button>
        </div>
      </div>

      {/* Split-Screen Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: POSTER UPLOAD & PREVIEW (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Unggah poster
              </span>
              {posterPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPosterPreview(null);
                    setPosterFile(null);
                    setSelectedPresetId(null);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Hapus
                </button>
              )}
            </div>

            {/* Drag & Drop or Preview Area */}
            {!posterPreview ? (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 bg-slate-50/50 dark:bg-slate-800/30 transition-colors cursor-pointer group text-center"
              >
                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Seret poster kegiatan ke sini
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Format PNG, JPG, JPEG, WEBP (maks. 10 MB)
                </p>
                <span className="mt-4 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Pilih file
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center min-h-[360px]">
                {/* Poster Graphic Render */}
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="max-h-[440px] w-full object-contain rounded-xl"
                />

                {/* Scanning Line Animation Effect */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none bg-purple-950/20 backdrop-blur-[1px]">
                    <div className="absolute top-0 w-full h-1.5 [--scan-distance:20rem] bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scan" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="px-4 py-2 rounded-2xl bg-slate-900/90 text-white border border-purple-400/40 text-xs font-bold flex items-center gap-2 shadow-2xl">
                        <Sparkles className="h-4 w-4 text-cyan-300 animate-spin" />
                        <span>Menganalisis konten visual ({scanProgress}%)…</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Extract CTA Button */}
            <Button
              type="button"
              variant="purple"
              disabled={!posterPreview || isScanning}
              onClick={() => runExtraction(selectedPresetId || undefined)}
              className="w-full font-bold shadow-md shadow-purple-600/20"
            >
              <Sparkles className="h-4 w-4 mr-1.5 text-amber-300" />
              {isScanning ? 'Menganalisis poster…' : 'Ekstrak informasi dengan AI'}
            </Button>
          </div>

          {/* PART 9: CLICKABLE SAMPLE UNKLAB POSTER PRESETS */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Coba poster contoh UNKLAB
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold">
                3 poster contoh
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih poster contoh untuk mengisi kolom kegiatan dengan hasil ekstraksi simulasi.
            </p>

            <div className="space-y-2">
              {samplePosterPresets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                const badgeLabel = preset.badgeLabel.includes('Incomplete')
                  ? 'Informasi belum lengkap'
                  : preset.badgeLabel.includes('Complete')
                    ? 'Informasi lengkap'
                    : 'Kerohanian · Poin Chapel';
                return (
                  <div
                    key={preset.id}
                    className={`p-3 rounded-2xl border transition-colors flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 bg-slate-50/60 dark:bg-slate-800/40'
                    }`}
                  >
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleSelectPreset(preset)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                    >
                      <span
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner"
                        style={{ backgroundColor: preset.accentColor }}
                      >
                        <FileText className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {preset.name}
                        </span>
                        <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {preset.tagline}
                        </span>
                      </span>
                    </button>
                    <Badge
                      variant={preset.badgeLabel.includes('Incomplete') ? 'amber' : 'purple'}
                      className="text-[10px] shrink-0"
                    >
                      {badgeLabel}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: STRUCTURED EVENT INFORMATION FORM (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  2. Tinjau dan edit informasi kegiatan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kolom diisi dari poster. Periksa dan perbaiki informasi sebelum menerbitkan.
                </p>
              </div>
              {extractionResult && (
                <Badge
                  variant={extractionResult.missingFields.length > 0 ? 'amber' : 'success'}
                  className="text-xs font-bold"
                >
                  {extractionResult.missingFields.length > 0
                    ? `${extractionResult.missingFields.length} kolom belum terisi`
                    : 'Informasi terambil lengkap'}
                </Badge>
              )}
            </div>

            {/* Missing Fields Warning Alert */}
            {extractionResult && extractionResult.missingFields.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">Informasi belum lengkap:</span>
                  <p className="mt-0.5">
                    Poster yang diunggah belum mencantumkan:{' '}
                    <span className="font-semibold underline">
                      {extractionResult.missingFields.join(', ')}
                    </span>
                    . Lengkapi kolom berikut secara manual.
                  </p>
                </div>
              </div>
            )}

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="poster-event-title" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama kegiatan *
                </label>
                <Input
                  id="poster-event-title"
                  placeholder="Contoh: Hackathon AI dan Cloud FIK"
                  {...register('title')}
                  error={errors.title?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="poster-event-category" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kategori *
                </label>
                <select
                  id="poster-event-category"
                  {...register('category')}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Organizer & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="poster-event-organizer" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Penyelenggara *
                </label>
                <Input
                  id="poster-event-organizer"
                  placeholder="Contoh: HMP Informatika atau BEM UNKLAB"
                  {...register('organizer')}
                  error={errors.organizer?.message}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="poster-event-location" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lokasi *
                </label>
                <Input
                  id="poster-event-location"
                  placeholder="Contoh: Pioneer Chapel atau Auditorium GK1"
                  {...register('location')}
                  error={errors.location?.message}
                />
              </div>
            </div>

            {/* Dates & Times */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="poster-event-start-date" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tanggal mulai *
                </label>
                <Input id="poster-event-start-date" type="date" {...register('startDate')} error={errors.startDate?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="poster-event-end-date" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tanggal selesai *
                </label>
                <Input id="poster-event-end-date" type="date" {...register('endDate')} error={errors.endDate?.message} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="poster-event-start-time" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Waktu mulai *
                </label>
                <Input id="poster-event-start-time" type="time" {...register('startTime')} error={errors.startTime?.message} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="poster-event-end-time" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Waktu selesai
                  </label>
                  {extractionResult?.missingFields.includes('endTime') && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      Belum diisi
                    </span>
                  )}
                </div>
                <Input
                  id="poster-event-end-time"
                  type="time"
                  placeholder="HH:mm"
                  className={
                    extractionResult?.missingFields.includes('endTime')
                      ? 'border-amber-400 bg-amber-50/30'
                      : ''
                  }
                  {...register('endTime')}
                />
              </div>
            </div>

            {/* Dress Code & Chapel Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="poster-event-dress-code" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ketentuan pakaian
                  </label>
                  {extractionResult?.missingFields.includes('dressCode') && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      Belum diisi
                    </span>
                  )}
                </div>
                <Input
                  id="poster-event-dress-code"
                  placeholder="Contoh: pakaian resmi Sabat atau kasual rapi"
                  className={
                    extractionResult?.missingFields.includes('dressCode')
                      ? 'border-amber-400 bg-amber-50/30'
                      : ''
                  }
                  {...register('dressCode')}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="poster-event-chapel-points" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Poin Chapel (0–5)
                </label>
                <Input
                  id="poster-event-chapel-points"
                  type="number"
                  min="0"
                  max="5"
                  {...register('chapelPoints', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="poster-event-description" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Deskripsi kegiatan *
              </label>
              <textarea
                id="poster-event-description"
                rows={3}
                placeholder="Informasi kegiatan, susunan acara, dan narasumber…"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Dormitory Only Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="dormitoryOnly"
                {...register('dormitoryOnly')}
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label
                htmlFor="dormitoryOnly"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Khusus penghuni asrama (Edelweiss, Jasmine, atau Crystal)
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                className="text-xs text-slate-500"
              >
                Hapus isian
              </Button>
              <Button type="submit" variant="primary" className="font-bold text-xs px-6">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Terbitkan kegiatan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
