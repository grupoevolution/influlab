'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { AnimatedBackground } from '@/components/brand/AnimatedBackground';
import { CircuitDecor } from '@/components/brand/CircuitDecor';
import { Button } from '@/components/ui/Button';
import type { SiteSettings } from '@/lib/db/types';

const DEFAULT_LABEL = 'Conheça o InfluLab';
const DEFAULT_HELPER =
  'Seu acesso é validado automaticamente pelo email da compra. Ainda não tem acesso? Conheça o InfluLab no link abaixo.';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [site, setSite] = useState<SiteSettings>({});

  useEffect(() => {
    fetch('/api/public/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setSite(j.data ?? {}))
      .catch(() => {});
  }, []);

  const purchaseUrl = site.purchaseUrl?.trim() || '';
  const purchaseLabel = site.purchaseLabel?.trim() || DEFAULT_LABEL;
  const helperText = site.loginHelperText?.trim() || DEFAULT_HELPER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setLoading(true);
    setError(null);
    try {
      // Backend valida contra whitelist. Se OK, seta cookie e libera /app.
      // Se NÃO está na whitelist, retorna 403 com mensagem — bloqueio real.
      const r = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(
          j?.error ??
            'Esse email não tem acesso liberado. Verifique se digitou o mesmo email da compra ou fale com o suporte.',
        );
        return;
      }
      router.push('/app');
    } catch {
      setError('Não foi possível conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <AnimatedBackground variant="intense" />
      <CircuitDecor className="absolute top-0 left-0 right-0 w-full h-[400px] opacity-50" />
      <CircuitDecor className="absolute bottom-0 left-0 right-0 w-full h-[400px] opacity-30 rotate-180" />

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <Logo size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative glass-strong rounded-3xl p-7 md:p-9 shadow-glow-violet"
        >
          <div className="absolute -top-3 -right-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand-cyan-400 blur-md opacity-70" />
              <div className="relative h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan-300 mb-2">
              Bem-vindo de volta
            </p>
            <h1 className="text-3xl md:text-[2rem] font-display font-bold mb-3 leading-tight">
              Entre no <span className="text-gradient-brand">laboratório</span>
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">
              Digite o email que você usou na sua compra para acessar o sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-secondary mb-2">
                Seu email de compra
              </label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-cyan-300 transition-colors"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full h-14 pl-12 pr-4 text-base rounded-2xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted focus:border-brand-violet-400 focus:bg-bg-card transition-colors outline-none"
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
              rightIcon={<ArrowRight size={20} />}
              className="w-full h-14 text-base"
            >
              Acessar o sistema
            </Button>
          </form>

          <div className="mt-7 pt-5 border-t border-border-subtle">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <ShieldCheck size={18} className="text-brand-cyan-300" />
              </div>
              <div className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                {helperText}
              </div>
            </div>
          </div>
        </motion.div>

        {purchaseUrl && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-text-subtle mt-6"
          >
            Ainda não é aluno?{' '}
            <a
              href={purchaseUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-cyan-300 hover:text-brand-cyan-200 font-medium inline-flex items-center gap-1"
            >
              {purchaseLabel}
              <ArrowRight size={12} />
            </a>
          </motion.p>
        )}
      </div>
    </div>
  );
}
