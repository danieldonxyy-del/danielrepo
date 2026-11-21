import React, { useState } from 'react';
import { Building2, Save, Mail, MapPin, Globe } from 'lucide-react';
import { CampusOrganization } from '../../types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

interface OrganizationProfileFormProps {
  organization: CampusOrganization;
  isReadOnly?: boolean;
}

export const OrganizationProfileForm: React.FC<OrganizationProfileFormProps> = ({
  organization,
  isReadOnly = false,
}) => {
  const { updateOrganization } = useApp();

  const [description, setDescription] = useState(organization.description || '');
  const [email, setEmail] = useState(organization.email || '');
  const [contactPerson, setContactPerson] = useState(organization.contactPerson || '');
  const [contactPhone] = useState(organization.contactPhone || '');
  const [location, setLocation] = useState(organization.location || '');
  const [instagram, setInstagram] = useState(
    organization.socialLinks?.find((s) => s.platform.toLowerCase() === 'instagram')?.url || ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    setIsSaving(true);
    const updatedSocialLinks = [];
    if (instagram.trim()) {
      updatedSocialLinks.push({ platform: 'Instagram', url: instagram.trim() });
    }

    const updated: CampusOrganization = {
      ...organization,
      description,
      email,
      contactPerson,
      contactPhone,
      location,
      socialLinks: updatedSocialLinks,
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    updateOrganization(updated);
    setIsSaving(false);
    toast.success(`Profile for "${organization.name}" updated successfully!`);
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {organization.name}
            </h3>
            <Badge variant="secondary" className="uppercase text-[10px] font-bold">
              {organization.categoryId}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Profil organisasi kampus dan informasi kontak publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            ID: {organization.id}
          </span>
          <Badge variant={organization.status === 'active' ? 'success' : 'amber'} className="capitalize text-[10px]">
            {organization.status}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Misi dan ringkasan organisasi
          </label>
          <textarea
            rows={3}
            disabled={isReadOnly}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan cakupan, tujuan, dan keanggotaan organisasi..."
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Email resmi
            </label>
            <div className="relative">
              <Mail className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
              <Input
                type="email"
                disabled={isReadOnly}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="org@student.unklab.ac.id"
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Narahubung / Ketua
            </label>
            <Input
              type="text"
              disabled={isReadOnly}
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Contoh: Nama ketua"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Lokasi sekretariat
            </label>
            <div className="relative">
              <MapPin className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
              <Input
                type="text"
                disabled={isReadOnly}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Student Center lantai 2"
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Instagram / situs resmi
            </label>
            <div className="relative">
              <Globe className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
              <Input
                type="text"
                disabled={isReadOnly}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        {!isReadOnly && (
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="font-bold text-xs"
            >
              <Save className="h-4 w-4 mr-1.5" /> Simpan profil
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrganizationProfileForm;
