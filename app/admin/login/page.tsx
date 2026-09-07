'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft, AlertCircle, Lock, Eye, EyeOff, KeyRound, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [serverAdmin, setServerAdmin] = useState<string | null>(null);
  const [hasServerToken, setHasServerToken] = useState(false);

  // Check if already authenticated or if server credentials exist
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace('/admin');
        } else {
          if (data.configuredAdmin) setServerAdmin(data.configuredAdmin);
          if (data.hasServerToken) setHasServerToken(data.hasServerToken);
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        setCheckingAuth(false);
      });
  }, [router]);

  // Handle Login using Environment Config (GITHUB_TOKEN & GITHUB_USERNAME)
  const handleServerConfigLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useServerConfig: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Autentikasi gagal. Pastikan GITHUB_TOKEN & GITHUB_USERNAME valid.');
      }

      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autentikasi gagal.');
      setLoading(false);
    }
  };

  // Handle Login using Manually Inputted GitHub Personal Access Token
  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Silakan masukkan GitHub Personal Access Token Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Autentikasi gagal. Periksa token Anda.');
      }

      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autentikasi gagal');
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Memverifikasi sesi admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c] flex flex-col justify-center items-center p-4 sm:p-6 text-zinc-200">
      <div className="w-full max-w-md space-y-6">
        {/* Back link */}
        <Link
          id="link-return-home"
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke SANN TOOLS</span>
        </Link>

        {/* Card */}
        <div className="p-6 sm:p-8 bg-[#0d0f17] border border-zinc-800 rounded-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 mx-auto flex items-center justify-center text-emerald-400 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Admin Authentication
            </h1>
            <p className="text-xs text-zinc-400">
              Masuk ke konsol pengelolaan katalog SANN TOOLS dengan kredensial GitHub Anda.
            </p>
          </div>

          {error && (
            <div
              id="auth-error-banner"
              className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-start gap-2 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* If GITHUB_TOKEN & GITHUB_USERNAME are already set in environment */}
          {hasServerToken && serverAdmin ? (
            <div className="space-y-3 p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Kredensial Server Terdeteksi
                </span>
                <span className="font-mono bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded text-[11px]">
                  @{serverAdmin}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Token dan username sudah diatur di environment server. Anda dapat langsung masuk hanya dengan sekali klik.
              </p>
              <button
                type="button"
                id="btn-login-server-admin"
                onClick={handleServerConfigLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-98 shadow-sm disabled:opacity-50 min-h-[42px]"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Akun @{serverAdmin}...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Masuk sebagai Admin (@{serverAdmin})</span>
                  </>
                )}
              </button>
            </div>
          ) : null}

          {/* Manual Token input (optional fallback) */}
          <div className="space-y-4">
            {hasServerToken && serverAdmin && (
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-zinc-500 uppercase tracking-wider">
                  atau masukkan token
                </span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>
            )}

            <form onSubmit={handleManualTokenSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="token-input" className="block text-xs font-medium text-zinc-300">
                  GitHub Personal Access Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="token-input"
                    name="githubToken"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    disabled={loading}
                    className="w-full pl-9 pr-10 py-2.5 bg-zinc-900/90 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition"
                  />
                  <button
                    type="button"
                    id="btn-toggle-token-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Token diproses langsung di server untuk validasi dan tidak disimpan di browser.
                </p>
              </div>

              <button
                type="submit"
                id="btn-submit-login"
                disabled={loading || !tokenInput.trim()}
                className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-98 shadow-sm disabled:opacity-40 min-h-[40px]"
              >
                {loading && tokenInput.trim() ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Token...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verifikasi Token & Masuk</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security policy note */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl space-y-1.5 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Autentikasi Aman Tanpa OAuth App</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Tidak membutuhkan <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_ID</code> atau <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded font-mono">GITHUB_CLIENT_SECRET</code>. Hanya akun yang cocok dengan <code className="text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded font-mono">GITHUB_USERNAME</code> yang diberikan hak akses admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
