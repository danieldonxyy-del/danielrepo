import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Archive,
  Edit3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { CampusOrganization } from '../types';
import { toast } from 'sonner';

export const OrganizationManagement: React.FC = () => {
  const {
    organizations,
    createOrganization,
    updateOrganization,
    archiveOrganization,
    events,
    activeRole,
    currentAdminUser,
  } = useApp();

  const isSuperAdmin = activeRole === 'super_admin';
  const assignedOrgId =
    currentAdminUser?.organizationId || (activeRole === 'ormawa_admin' ? 'org-bem' : undefined);

  // Scoped organization list: Super Admin sees all, Organization Admin only sees assigned
  const scopedOrgs = isSuperAdmin
    ? organizations
    : organizations.filter((o) => o.id === assignedOrgId);

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<CampusOrganization | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('bem');
  const [description, setDescription] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  const filteredOrgs = scopedOrgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase()) ||
      o.categoryId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createOrganization({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      categoryId,
      description,
      contactPerson,
      email,
      location,
      status: 'active',
      createdBy: 'Super Admin',
    });

    toast.success(`Campus organization "${name}" registered successfully!`);
    setIsCreateOpen(false);
    setName('');
    setSlug('');
    setDescription('');
    setContactPerson('');
    setEmail('');
    setLocation('');
  };

  const handleUpdateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    updateOrganization({
      ...editingOrg,
      name,
      description,
      contactPerson,
      email,
      location,
      updatedAt: new Date().toISOString().substring(0, 10),
    });

    toast.success(`Organization profile for "${name}" updated.`);
    setEditingOrg(null);
  };

  const openEdit = (org: CampusOrganization) => {
    setEditingOrg(org);
    setName(org.name);
    setSlug(org.slug);
    setCategoryId(org.categoryId);
    setDescription(org.description);
    setContactPerson(org.contactPerson || '');
    setEmail(org.email || '');
    setLocation(org.location || '');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" className="text-[10px]">
              DYNAMIC ORGANIZATION REGISTRY
            </Badge>
            <span className="text-xs text-slate-400 font-medium">Part 30.9 Extensible Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Campus Organizations &amp; Clubs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-driven organizations supporting BEM, HMP, UKM, dorm councils, and chapel ministries without source-code modifications.
          </p>
        </div>

        {isSuperAdmin && (
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} className="font-bold text-xs">
            <PlusCircle className="h-4 w-4 mr-1.5" /> Register Organization
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search campus organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => {
          const orgEvents = events.filter((e) => e.organizationId === org.id);

          return (
            <div
              key={org.id}
              className="p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="purple" className="text-[10px] uppercase font-bold">
                    {org.categoryId}
                  </Badge>
                  <Badge
                    variant={org.status === 'active' ? 'success' : 'secondary'}
                    className="capitalize text-[10px]"
                  >
                    {org.status}
                  </Badge>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                  {org.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                  {org.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500 font-medium">
                  {org.contactPerson && (
                    <div className="truncate">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Lead:</span> {org.contactPerson}
                    </div>
                  )}
                  {org.location && (
                    <div className="truncate">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Office:</span> {org.location}
                    </div>
                  )}
                  <div className="text-blue-600 dark:text-blue-400 font-semibold pt-1">
                    {orgEvents.length} activities scheduled
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" size="sm" onClick={() => openEdit(org)} className="text-xs">
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Profile
                </Button>
                {isSuperAdmin && org.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      archiveOrganization(org.id);
                      toast.info(`Archived ${org.name}. Historical events preserved.`);
                    }}
                    className="text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Archive className="h-3.5 w-3.5 mr-1" /> Archive
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal Form */}
      {(isCreateOpen || editingOrg) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => {
              setIsCreateOpen(false);
              setEditingOrg(null);
            }}
          />
          <form
            onSubmit={editingOrg ? handleUpdateOrg : handleCreateOrg}
            className="relative z-50 w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {editingOrg ? 'Edit Organization Profile' : 'Register New Campus Organization'}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Organization Name *
              </label>
              <Input
                required
                placeholder="e.g. UNKLAB Robotic & AI Society"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100"
                >
                  <option value="bem">BEM (Executive Student Board)</option>
                  <option value="hmp">HMP (Study Program Association)</option>
                  <option value="ukm">UKM (Student Activity Unit)</option>
                  <option value="academic">Academic Faculty Society</option>
                  <option value="dormitory">Dormitory Council</option>
                  <option value="spiritual">Spiritual Ministry</option>
                  <option value="club">Student Interest Club</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Campus Location / Office
                </label>
                <Input
                  placeholder="e.g. GK3 Student Center"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Mission statement, activities, and membership criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contact Person / Leader
                </label>
                <Input
                  placeholder="e.g. John Doe (Chairman)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Email
                </label>
                <Input
                  type="email"
                  placeholder="society@student.unklab.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingOrg(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                {editingOrg ? 'Save Changes' : 'Register Organization'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
