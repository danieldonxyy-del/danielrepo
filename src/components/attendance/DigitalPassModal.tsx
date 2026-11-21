import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Clock, MapPin, Calendar, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CampusEvent, EventRegistration, StudentProfile } from '../../types';
import { toast } from 'sonner';

interface DigitalPassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CampusEvent;
  registration: EventRegistration;
  student: StudentProfile;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  open,
  onOpenChange,
  event,
  registration,
  student,
}) => {
  const isCheckedIn = registration.attendanceStatus === 'checked_in';
  const qrValue = registration.registrationToken || `KLS-EVT-2026-${registration.id}`;

  const handleSavePass = () => {
    toast.success('Digital Pass saved to student wallet cache!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md p-0 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white text-center relative select-none">
        <div className="flex justify-center mb-2">
          <Badge variant="purple" className="bg-white/20 text-white border-white/30 text-[10px]">
            UNKLAB DIGITAL EVENT PASS
          </Badge>
        </div>
        <h3 className="text-lg font-black tracking-tight">{event.title}</h3>
        <p className="text-xs text-purple-200 mt-1 font-medium">{event.organizer}</p>
      </div>

      {/* Main Ticket Card */}
      <div className="p-6 bg-white dark:bg-slate-900 space-y-6">
        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="p-3 bg-white rounded-xl shadow-md ring-4 ring-blue-500/10">
            <QRCodeSVG
              value={qrValue}
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <span className="mt-3 font-mono text-xs font-black tracking-widest text-slate-800 dark:text-slate-200 uppercase bg-slate-200/60 dark:bg-slate-700/60 px-3 py-1 rounded-md">
            {qrValue}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">
            Present this QR code to the entrance usher for attendance verification.
          </p>
        </div>

        {/* Student & Attendance Status */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Student Name</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{student.fullName}</div>
            <div className="text-[11px] font-mono text-slate-500">NIM: {student.nim}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Attendance Status</span>
            <div className="mt-1 flex items-center gap-1.5 font-bold">
              {isCheckedIn ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Checked In
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Not Checked In
                </span>
              )}
            </div>
            {registration.checkedInAt && (
              <span className="text-[10px] text-slate-400">Time: {registration.checkedInAt}</span>
            )}
          </div>
        </div>

        {/* Event Rundown Snippet */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span>{event.startDate} · {event.startTime} WITA</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-purple-500" />
            <span>{event.location}</span>
          </div>
          {event.chapelPoints ? (
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
              <span>Awards +{event.chapelPoints} Chapel Point upon scanning</span>
            </div>
          ) : null}
        </div>

        {/* Warning & Notice */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 text-[11px] text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            This digital pass is simulated for testing. Official UNKLAB attendance requires physical scan at Pioneer Chapel / venue entrances.
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} className="flex-1">
            Close
          </Button>
          <Button variant="primary" onClick={handleSavePass} className="flex-1">
            <Download className="h-4 w-4 mr-1.5" /> Save Pass
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
