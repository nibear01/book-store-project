import React, { useState } from 'react';

const Settings = () => {
  // Admin profile
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatarFile: null,
    avatarPreview: '',
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password
  const [pwd, setPwd] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [savingPwd, setSavingPwd] = useState(false);

  // Platform settings
  const [platform, setPlatform] = useState({
    siteName: '',
    logoFile: null,
    logoPreview: '',
    socials: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    },
  });
  const [platformMsg, setPlatformMsg] = useState(null);
  const [savingPlatform, setSavingPlatform] = useState(false);

  const emailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const onAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProfile((p) => ({
      ...p,
      avatarFile: f,
      avatarPreview: URL.createObjectURL(f),
    }));
  };

  const onLogoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPlatform((p) => ({
      ...p,
      logoFile: f,
      logoPreview: URL.createObjectURL(f),
    }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!profile.name.trim()) return setProfileMsg({ type: 'error', text: 'Name is required.' });
    if (!emailValid(profile.email)) return setProfileMsg({ type: 'error', text: 'Enter a valid email.' });
    setSavingProfile(true);
    try {
      // TODO: replace with API call
      // const formData = new FormData();
      // formData.append('name', profile.name);
      // formData.append('email', profile.email);
      // if (profile.avatarFile) formData.append('avatar', profile.avatarFile);
      await new Promise((r) => setTimeout(r, 600));
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (e) {
      setProfileMsg({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);
    if (!pwd.current || !pwd.next || !pwd.confirm) return setPwdMsg({ type: 'error', text: 'All fields are required.' });
    if (pwd.next.length < 8) return setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
    if (pwd.next !== pwd.confirm) return setPwdMsg({ type: 'error', text: 'Passwords do not match.' });
    setSavingPwd(true);
    try {
      // TODO: replace with API call
      // await api.changePassword({ current: pwd.current, next: pwd.next });
      await new Promise((r) => setTimeout(r, 600));
      setPwd({ current: '', next: '', confirm: '' });
      setPwdMsg({ type: 'success', text: 'Password changed.' });
    } catch (e) {
      setPwdMsg({ type: 'error', text: 'Failed to change password.' });
    } finally {
      setSavingPwd(false);
    }
  };

  const submitPlatform = async (e) => {
    e.preventDefault();
    setPlatformMsg(null);
    if (!platform.siteName.trim()) return setPlatformMsg({ type: 'error', text: 'Site name is required.' });
    setSavingPlatform(true);
    try {
      // TODO: replace with API call
      // const formData = new FormData();
      // formData.append('siteName', platform.siteName);
      // if (platform.logoFile) formData.append('logo', platform.logoFile);
      // Object.entries(platform.socials).forEach(([k, v]) => formData.append(k, v));
      await new Promise((r) => setTimeout(r, 700));
      setPlatformMsg({ type: 'success', text: 'Platform settings saved.' });
    } catch (e) {
      setPlatformMsg({ type: 'error', text: 'Failed to save platform settings.' });
    } finally {
      setSavingPlatform(false);
    }
  };

  const Msg = ({ msg }) =>
    msg ? (
      <p className={`${msg.type === 'error' ? 'text-red-600' : 'text-green-600'} text-sm`}>
        {msg.text}
      </p>
    ) : null;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-10">
      {/* Admin Profile */}
      <section className="bg-white rounded-md border p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Admin Profile</h2>
        <form onSubmit={submitProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border">
              {profile.avatarPreview ? (
                <img src={profile.avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Img</div>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="px-3 py-2 border rounded-md text-sm">Upload Avatar</span>
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Admin Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-6 py-3 rounded-[2px] hover:bg-gray-800 transition"
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
            <Msg msg={profileMsg} />
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="bg-white rounded-md border p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <form onSubmit={submitPassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Current Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={pwd.current}
                onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={pwd.next}
                onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                placeholder="At least 8 chars"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={pwd.confirm}
                onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-6 py-3 rounded-[2px] hover:bg-gray-800 transition"
              disabled={savingPwd}
            >
              {savingPwd ? 'Updating...' : 'Update Password'}
            </button>
            <Msg msg={pwdMsg} />
          </div>
        </form>
      </section>

      {/* Platform Settings */}
      <section className="bg-white rounded-md border p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-semibold">Platform Settings</h2>
        <form onSubmit={submitPlatform} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-sm mb-1">Site Name</label>
              <input
                className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                value={platform.siteName}
                onChange={(e) => setPlatform((p) => ({ ...p, siteName: e.target.value }))}
                placeholder="Book Store"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-12 border rounded bg-white flex items-center justify-center overflow-hidden">
                {platform.logoPreview ? (
                  <img src={platform.logoPreview} alt="Logo preview" className="max-h-12" />
                ) : (
                  <span className="text-xs text-gray-400">No Logo</span>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="px-3 py-2 border rounded-md text-sm">Upload Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'].map((k) => (
                <div key={k}>
                  <label className="block text-sm mb-1 capitalize">{k}</label>
                  <input
                    className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
                    value={platform.socials[k]}
                    onChange={(e) =>
                      setPlatform((p) => ({ ...p, socials: { ...p.socials, [k]: e.target.value } }))
                    }
                    placeholder={`https://${k}.com/your-handle`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-6 py-3 rounded-[2px] hover:bg-gray-800 transition"
              disabled={savingPlatform}
            >
              {savingPlatform ? 'Saving...' : 'Save Settings'}
            </button>
            <Msg msg={platformMsg} />
          </div>
        </form>
      </section>
    </div>
  );
};

export default Settings;
