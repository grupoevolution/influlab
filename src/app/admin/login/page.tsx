'use client';

import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatedBackground } from '@/components/brand/AnimatedBackground';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/brand/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Erro no login.');
        return;
      }
      router.push(json.role === 'admin' ? '/admin' : '/staff');
    } catch {
      setError('Falha de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <AnimatedBackground variant="intense" />

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Logo size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative glass-strong rounded-3xl p-7 md:p-9 shadow-glow-violet"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand">
              <KeyRound size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-cyan-300">
                Painel administrativo
              </p>
              <h1 className="text-2xl font-display font-bold leading-tight">Acesso restrito</h1>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted focus:border-brand-violet-400 outline-none"
                  placeholder="admin@influlab.io"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted focus:border-brand-violet-400 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight size={16} />}
              className="w-full mt-2"
            >
              Entrar
            </Button>
          </form>

          <p className="text-[11px] text-text-subtle text-center mt-5 leading-relaxed">
            Credenciais configuradas via variáveis de ambiente no EasyPanel.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
