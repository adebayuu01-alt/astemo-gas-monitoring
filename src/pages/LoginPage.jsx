import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import astemoLogo from '../assets/astemo_logo.png';
import Toast from '../components/Toast';
import { INITIAL_USERS } from '../data/mockData';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);

  const handleLogin = (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMsg('Please input your username.');
      return;
    }
    if (!password) {
      setErrorMsg('Please input your password.');
      return;
    }

    const foundUser = INITIAL_USERS.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        u.idCard.toLowerCase() === cleanUsername ||
        (cleanUsername === 'affan' && u.username === 'affan_astemo') ||
        (cleanUsername === 'kevin' && u.username === 'kevin_astemo') ||
        (cleanUsername === 'suep' && u.username === 'suep_astemo')
    );

    if (!foundUser) {
      setErrorMsg('Username or password incorrect.');
      setToast({
        type: 'error',
        title: 'Login Failed',
        message: 'Invalid username or password.'
      });
      return;
    }

    setToast({
      type: 'success',
      title: 'Login Successful',
      message: `Welcome back, ${foundUser.name} (${foundUser.role})!`
    });

    setTimeout(() => {
      onLoginSuccess(foundUser);
    }, 700);
  };

  const handleQuickLogin = (u) => {
    setUsername(u.username);
    setPassword(u.password);
    setToast({
      type: 'success',
      title: 'Login Successful',
      message: `Welcome, ${u.name} (${u.role})!`
    });
    setTimeout(() => {
      onLoginSuccess(u);
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#F0F2F5] overflow-hidden select-none">
      {/* Background Geometric Polygonal accents matching Figma */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-white/40 rotate-45 transform skew-x-12" />
        <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] bg-white/50 -rotate-12 transform skew-y-6" />
        <div className="absolute -bottom-40 left-1/3 w-[800px] h-[800px] bg-white/30 rotate-12" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl border border-gray-100 p-8 xl:p-10 flex flex-col items-center text-center">
          {/* Astemo Brand */}
          <div className="mb-6 flex flex-col items-center">
            <img
              src={astemoLogo}
              alt="Astemo"
              className="h-10 object-contain mb-2"
            />
            <h2 className="text-base font-bold tracking-wider text-gray-900 uppercase">
              ASTEMO GAS MONITORING
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your username and password to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full text-left space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Input username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-xs transition-colors focus:outline-none focus:border-emerald-500 bg-[#FAFAFA]"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Input Password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-xs transition-colors focus:outline-none focus:border-emerald-500 bg-[#FAFAFA]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#00A854] hover:bg-[#008C45] text-white font-bold tracking-wider uppercase rounded-lg text-xs transition-all shadow-sm active:scale-[0.99]"
            >
              LOG IN
            </button>
          </form>

          {/* Quick Login Simulation Badges */}
          <div className="w-full mt-6 pt-5 border-t border-gray-100 text-left">
            <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center justify-between">
              <span>Quick Login (Demo):</span>
              <span className="text-[10px] text-gray-400 font-normal">Click to login</span>
            </p>

            <div className="grid grid-cols-3 gap-2">
              {INITIAL_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  className={`p-2 rounded-lg border text-left transition-all group shadow-xs active:scale-[0.98] ${
                    u.role === 'Superadmin'
                      ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50'
                      : u.role === 'Admin'
                      ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/50'
                      : 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/50'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {u.name.split(' ')[0]}
                  </p>
                  <span className="text-[9px] font-bold uppercase tracking-wider block text-gray-600 mt-0.5">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-gray-400 z-10 border-t border-gray-200 bg-white">
        Copyright © 2026 PT. Electrindo Inti Dinamika
      </footer>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
