import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ExternalLink, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export const SiteFooter: React.FC = () => {
  const [currentYear] = React.useState(() => new Date().getFullYear());

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] text-slate-600 dark:text-slate-400 text-xs transition-colors mt-auto">
      {/* Top Main Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand & Institutional Identity */}
          <div className="lg:col-span-2 space-y-3 pr-0 lg:pr-6">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#142D4E] text-white flex items-center justify-center font-black text-xs shadow-2xs">
                <Compass className="h-4 w-4 text-[#D6A84B]" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  Klabat<span className="text-[#142D4E] dark:text-blue-400">Sync</span>
                </span>
              </div>
            </div>

            <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm">
              Satu kampus, satu jadwal, satu komunitas.
            </p>

            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Informasi kegiatan akademik, organisasi mahasiswa, agenda asrama, dan pelayanan Pioneer Chapel Universitas Klabat.
            </p>

            <div className="pt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-[#D6A84B] shrink-0" />
              <span>Jl. Arnold Mononutu, Airmadidi, Minahasa Utara, Sulawesi Utara 95371</span>
            </div>
          </div>

          {/* Col 3: Campus Nav */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              Jelajahi Kampus
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="hover:text-[#142D4E] dark:hover:text-blue-400 transition-colors">
                  Eksplorasi Kegiatan
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-[#142D4E] dark:hover:text-blue-400 transition-colors">
                  Kalender Akademik
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="hover:text-[#142D4E] dark:hover:text-blue-400 transition-colors">
                  Pusat Pengumuman
                </Link>
              </li>
              <li>
                <Link to="/agenda" className="hover:text-[#142D4E] dark:hover:text-blue-400 transition-colors">
                  Agenda mahasiswa dan tiket digital
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              Layanan Kampus
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ai-assistant" className="hover:text-[#142D4E] dark:hover:text-blue-400 transition-colors">
                  Asisten AI KlabatSync
                </Link>
              </li>
              <li>
                <a
                  href="https://unklab.ac.id"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#142D4E] dark:hover:text-blue-400 transition-colors"
                >
                  Portal Resmi UNKLAB <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">
                  Panduan Validasi QR Pass
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">
                  Kredit Pioneer Chapel Point
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Connect & Verified Info */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              Kontak Universitas
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>info@unklab.ac.id</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>+62 431 891035</span>
              </li>
              <li className="pt-1.5">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Zona WITA (UTC+8)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1320] py-3.5">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {currentYear} <strong>KlabatSync</strong>. Universitas Klabat. Hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Platform kegiatan kampus</span>
            <span>•</span>
            <span>Fakultas Ilmu Komputer (FIK)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
