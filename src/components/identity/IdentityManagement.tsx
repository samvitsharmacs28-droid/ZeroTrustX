import React, { useState } from 'react';
import { useZeroTrust } from '../../context/ZeroTrustContext';
import { User, UserRole, AccountStatus, MFAMethod } from '../../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Clock,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  KeyRound,
  History,
  CheckCircle,
} from 'lucide-react';

export const IdentityManagement: React.FC = () => {
  const {
    users,
    devices,
    sessions,
    auditLogs,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    setActiveUserById,
    activeUser,
  } = useZeroTrust();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Employee');
  const [newUserDepartment, setNewUserDepartment] = useState('Engineering');
  const [newUserMfa, setNewUserMfa] = useState<MFAMethod>('FIDO2_HARDWARE_KEY');
  const [newUserLocation, setNewUserLocation] = useState('San Francisco, US');

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDepartment,
      status: 'Active',
      mfaMethod: newUserMfa,
      mfaEnrolled: newUserMfa !== 'NONE',
      assignedDeviceIds: [],
      lastActiveAt: new Date().toISOString(),
      excessivePrivileges: false,
      locationBaseline: newUserLocation,
      currentLocation: newUserLocation,
    });

    setIsAddModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Identity & Access Management (IAM)
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">Least-Privilege Directory</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Zero Trust Identity Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage authenticated human & machine identities. Every user possesses explicit role assignments, hardware MFA status, evaluated risk scores, and audited device associations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Identity</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search identities by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Security Analyst">Security Analyst</option>
              <option value="Employee">Employee</option>
              <option value="Contractor">Contractor</option>
              <option value="Auditor">Auditor</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Dormant">Dormant</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Identity / Name</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">MFA Method</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4">Assigned Devices</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((user) => {
                const userDevices = devices.filter((d) => user.assignedDeviceIds.includes(d.id));
                const isSelected = selectedUser?.id === user.id;

                const riskBadge =
                  user.riskScore >= 80 ? 'text-rose-400 bg-rose-950/40 border-rose-900/40' :
                  user.riskScore >= 60 ? 'text-orange-400 bg-orange-950/40 border-orange-900/40' :
                  user.riskScore >= 30 ? 'text-amber-400 bg-amber-950/40 border-amber-900/40' :
                  'text-emerald-400 bg-emerald-950/40 border-emerald-900/40';

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-slate-300 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-slate-200 block truncate">{user.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono block truncate">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-300 block">{user.role}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{user.department}</span>
                      {user.excessivePrivileges && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Excessive Privileges Flag</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          user.status === 'Active'
                            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40'
                            : user.status === 'Dormant'
                            ? 'text-amber-400 bg-amber-950/40 border-amber-900/40'
                            : 'text-rose-400 bg-rose-950/40 border-rose-900/40'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* MFA */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-300 block">
                        {user.mfaMethod === 'FIDO2_HARDWARE_KEY' ? 'FIDO2 WebAuthn' :
                         user.mfaMethod === 'AUTHENTICATOR_APP' ? 'Authenticator App' :
                         user.mfaMethod === 'SMS_OTP' ? 'SMS OTP' : 'None'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {user.mfaEnrolled ? 'Enrolled & Verified' : 'Not Enrolled'}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border inline-block ${riskBadge}`}>
                        {user.riskScore}
                      </span>
                    </td>

                    {/* Devices */}
                    <td className="py-3 px-4">
                      {userDevices.length > 0 ? (
                        <div className="space-y-0.5">
                          {userDevices.map((d) => (
                            <span key={d.id} className="text-[11px] text-slate-300 flex items-center gap-1">
                              <Laptop className="w-3 h-3 text-slate-500" />
                              <span className="truncate max-w-[150px]">{d.name}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No bound devices</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="px-2.5 py-1 text-[11px] rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                          title="Toggle Active / Suspended"
                        >
                          {user.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedUser.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">Assigned Role</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedUser.role}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">Department</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedUser.department}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">MFA Method</span>
                <span className="font-semibold text-slate-200 mt-0.5 block font-mono">{selectedUser.mfaMethod}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block">Baseline Geolocation</span>
                <span className="font-semibold text-slate-200 mt-0.5 block font-mono">{selectedUser.locationBaseline}</span>
              </div>
            </div>

            {/* Security Timeline */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent Security Audit Timeline
              </h4>
              <div className="space-y-1.5 text-xs">
                {auditLogs
                  .filter((a) => a.actor.includes(selectedUser.name) || a.actor.includes(selectedUser.id))
                  .slice(0, 4)
                  .map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-300 block">{log.eventType}</span>
                        <span className="text-[11px] text-slate-500 block">{log.reason}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  setActiveUserById(selectedUser.id);
                  setSelectedUser(null);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Log In As This Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUser}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">Enroll New Demo Identity</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. maya.lin@zerotrustx.internal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="Employee">Employee</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">MFA Enforcement</label>
                  <select
                    value={newUserMfa}
                    onChange={(e) => setNewUserMfa(e.target.value as MFAMethod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="FIDO2_HARDWARE_KEY">FIDO2 Hardware Key</option>
                    <option value="AUTHENTICATOR_APP">Authenticator App</option>
                    <option value="SMS_OTP">SMS OTP</option>
                    <option value="NONE">None</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Baseline Location</label>
                  <input
                    type="text"
                    value={newUserLocation}
                    onChange={(e) => setNewUserLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                Enroll Identity
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
