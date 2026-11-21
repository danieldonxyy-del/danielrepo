import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserPlus,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { AdminRole, AdminUser } from '../types';
import { toast } from 'sonner';

export const AdminManagement: React.FC = () => {
  const { adminUsers, inviteAdminUser, updateAdminStatus, organizations, activeRole, isDemoMode } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invite form fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('ormawa_admin');
  const [organizationId, setOrganizationId] = useState<string>('org-bem');
  const [permissionScope, setPermissionScope] = useState('');

  // Permission guard: Only Super Admin can manage other administrators
  if (activeRole !== 'super_admin') {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 animate-in fade-in">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Super Admin Access Required
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Administrator user provisioning and RBAC team invitations are restricted exclusively to Super Admin accounts. Your current role is <strong className="capitalize">{activeRole.replace('_', ' ')}</strong>.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/admin-studio')}
          className="text-xs font-bold"
        >
          Return to Admin Studio
        </Button>
      </div>
    );
  }

  const filteredAdmins = adminUsers.filter(
    (a) =>
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (adminUsers.some((a) => a.email.toLowerCase() === trimmedEmail)) {
      toast.error('An administrator with this email is already provisioned.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newAdmin = await inviteAdminUser({
        email: trimmedEmail,
        name: name || trimmedEmail.split('@')[0],
        role,
        organizationId: ['organization_admin', 'ormawa_admin', 'dormitory_admin', 'spiritual_admin'].includes(role)
          ? organizationId
          : undefined,
        permissionScope: permissionScope || `${role.replace('_', ' ')} scope`,
        status: 'active',
        createdBy: 'Super Admin',
      });
      toast.success(
        isDemoMode
          ? `Administrator demo ${newAdmin.email} ditambahkan.`
          : `Administrator ${newAdmin.email} telah diprovisikan.`
      );
      setIsInviteOpen(false);
      setEmail('');
      setName('');
      setPermissionScope('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Provisioning administrator gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (admin: AdminUser, status: AdminUser['status']) => {
    try {
      await updateAdminStatus(admin.id, status);
      toast.success(`Status ${admin.name} diperbarui menjadi ${status.replace('_', ' ')}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Perubahan akses administrator gagal.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" className="text-[10px]">
              RBAC AUTHORIZATION CONSOLE
            </Badge>
            <span className="text-xs text-slate-400 font-medium">Super Admin Exclusive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Administrator Team &amp; Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Provision, invite, and scope role permissions for university event managers.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)} className="font-bold text-xs">
          <UserPlus className="h-4 w-4 mr-1.5" /> Add Administrator
        </Button>
      </div>

      {/* Part 30.8 Security Policy Notice */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-xs uppercase tracking-wide">Strict Institutional Email RBAC (Part 30.8)</span>
          <p className="leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
            Super Admins can assign authority across campus faculties. Production administrator accounts must already exist in Firebase Authentication with a verified email. Roles cannot be self-assigned.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search administrator name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Admin Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="p-4">Administrator</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Permission Scope</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-4">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{admin.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">{admin.email}</div>
                </td>
                <td className="p-4">
                  <Badge variant="purple" className="capitalize text-[10px]">
                    {admin.role.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                  {admin.permissionScope}
                </td>
                <td className="p-4">
                  <Badge
                    variant={
                      admin.status === 'active'
                        ? 'success'
                        : admin.status === 'pending_invitation'
                        ? 'amber'
                        : 'danger'
                    }
                    className="capitalize text-[10px]"
                  >
                    {admin.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                  {admin.status === 'pending_invitation' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => void handleStatusChange(admin, 'active')}
                      className="text-xs"
                    >
                      Accept Invite
                    </Button>
                  ) : admin.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleStatusChange(admin, 'suspended')}
                      className="text-xs text-rose-500"
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void handleStatusChange(admin, 'active')}
                      className="text-xs"
                    >
                      Reactivate
                    </Button>
                  )}
                  {admin.status !== 'revoked' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleStatusChange(admin, 'revoked')}
                      className="text-xs text-rose-700 dark:text-rose-300"
                    >
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Administrator Modal Form */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)} />
          <form
            onSubmit={handleInviteSubmit}
            className="relative z-50 w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Provision New Campus Administrator
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Administrator Full Name
              </label>
              <Input
                required
                placeholder="e.g. Kezia Sompie"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Institutional Email Address *
              </label>
              <Input
                type="email"
                required
                placeholder={role === 'super_admin' ? 'any.domain@domain.com' : 'username@student.unklab.ac.id'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-[10px] text-slate-400">
                Akun harus sudah terdaftar di Firebase Authentication dan emailnya terverifikasi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Role Permission
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="campus_admin">Campus Admin</option>
                  <option value="ormawa_admin">ORMAWA Admin</option>
                  <option value="dormitory_admin">Dormitory Admin</option>
                  <option value="spiritual_admin">Spiritual Admin</option>
                  <option value="organization_admin">Organization Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {['organization_admin', 'ormawa_admin', 'dormitory_admin', 'spiritual_admin'].includes(role) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Assigned Organization
                  </label>
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Permission Scope Description
              </label>
              <Input
                placeholder="e.g. Authorized to schedule BEM assemblies and tournaments"
                value={permissionScope}
                onChange={(e) => setPermissionScope(e.target.value)}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                {isSubmitting ? 'Provisioning…' : 'Provision Administrator'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
