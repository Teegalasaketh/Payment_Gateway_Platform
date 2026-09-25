import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import {
  User as UserIcon,
  Shield,
  Key,
  Laptop,
  Smartphone,
  Save,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  isCurrent: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
];

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  // Profile edit fields
  const [name, setName] = useState(user?.name || 'Merchant Administrator');
  const [email, setEmail] = useState(user?.email || 'merchant@example.com');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || PRESET_AVATARS[0]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionToKill, setSessionToKill] = useState<string | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        toast.success('Local image uploaded. Click Save to apply.');
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchSessions = async () => {
    try {
      const response = await userService.getSessions();
      setSessions(response.data);
    } catch (err) {
      console.error('Failed to load active sessions', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email cannot be blank.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await userService.updateProfile(name, email, avatarUrl);
      updateUser({ name, email, avatarUrl });
      toast.success('Profile details updated successfully.');
    } catch (err) {
      toast.error('Failed to save profile changes.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password fields do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await userService.changePassword(user?.email || email, newPassword);
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const triggerKillSession = (id: string) => {
    setSessionToKill(id);
  };

  const confirmKillSession = async () => {
    if (!sessionToKill) return;
    
    try {
      await userService.terminateSession(sessionToKill);
      setSessions((prev) => prev.filter((s) => s.id !== sessionToKill));
      toast.success('Session terminated successfully.');
    } catch (err) {
      toast.error('Could not terminate session.');
    } finally {
      setSessionToKill(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
        <p className="mt-1 text-xs text-slate-500">
          Modify merchant identifiers, reset credentials, and monitor active sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800 flex items-center gap-1.5">
              <UserIcon className="h-4.5 w-4.5 text-primary" />
              <span>Modify Details</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs mt-4">
              {/* Avatar Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Profile Picture</label>
                <div className="flex flex-wrap gap-3 items-center pb-2">
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(avatar)}
                      className={`relative rounded-xl overflow-hidden h-14 w-14 border-2 transition-all hover:scale-105 ${
                        avatarUrl === avatar ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <img src={avatar} alt={`Avatar Preset ${idx + 1}`} className="h-full w-full object-cover" />
                      {avatarUrl === avatar && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                        </div>
                      )}
                    </button>
                  ))}

                  {/* Render custom upload item if present */}
                  {avatarUrl && !PRESET_AVATARS.includes(avatarUrl) && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(avatarUrl)}
                      className="relative rounded-xl overflow-hidden h-14 w-14 border-2 border-primary ring-2 ring-primary/20 scale-105"
                    >
                      <img src={avatarUrl} alt="Custom Local Upload" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      </div>
                    </button>
                  )}

                  {/* Upload button trigger */}
                  <label className="relative rounded-xl overflow-hidden h-14 w-14 border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Merchant Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Login Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover shadow transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isUpdatingProfile ? 'Saving Details...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
            <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800 flex items-center gap-1.5">
              <Key className="h-4.5 w-4.5 text-primary" />
              <span>Update Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs mt-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover shadow transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isUpdatingPassword ? 'Saving Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Active Browser sessions list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-4">
            <h3 className="text-sm font-bold border-b border-slate-100 pb-2.5 dark:border-slate-800 flex items-center gap-1.5">
              <Shield className="h-4.5 w-4.5 text-primary" />
              <span>Active Sessions</span>
            </h3>

            <div className="space-y-4 text-xs">
              {sessions.map((sess) => (
                <div key={sess.id} className="flex items-start justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
                  <div className="flex gap-2.5 items-start">
                    {sess.device.toLowerCase().includes('phone') || sess.device.toLowerCase().includes('iphone') ? (
                      <Smartphone className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                    ) : (
                      <Laptop className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                    )}
                    
                    <div className="text-left">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{sess.device}</span>
                      <div className="text-[10px] text-slate-450 mt-1 font-semibold">
                        IP: {sess.ip} • {sess.location}
                      </div>
                      {sess.isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 mt-1">
                          Current Session
                        </span>
                      )}
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => triggerKillSession(sess.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-950/20"
                      title="Terminate Session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ================================================================== */}
      {/* CONFIRM TERMINATE SESSION MODAL */}
      {/* ================================================================== */}
      <ConfirmationModal
        isOpen={sessionToKill !== null}
        title="Terminate Browser Session?"
        message="This action will immediately log out the target device from their merchant account workspace."
        confirmText="Terminate Session"
        cancelText="Keep Session"
        type="danger"
        onConfirm={confirmKillSession}
        onCancel={() => setSessionToKill(null)}
      />
    </div>
  );
};
export default ProfilePage;
