'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Download, Plus, Share, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'android' | 'ios' | 'desktop' | 'other';

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'other';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/macintosh|windows|linux/.test(ua)) return 'desktop';
  return 'other';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const matchStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return iosStandalone || matchStandalone;
}

const DISMISSED_KEY = 'influlab.install-dismissed';

// Rotas onde NÃO devemos mostrar prompt de instalação (admin, staff, login)
const HIDDEN_PREFIXES = ['/admin', '/staff', '/login'];

export function InstallPrompt() {
  const pathname = usePathname() ?? '';
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>('other');
  const [visible, setVisible] = useState(false);
  const [iosSheetOpen, setIosSheetOpen] = useState(false);

  const isHiddenRoute = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isHiddenRoute) return;
    if (isStandalone()) return;

    const p = detectPlatform();
    setPlatform(p);

    const dismissed = window.localStorage.getItem(DISMISSED_KEY);

    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (p === 'ios' && !dismissed) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isHiddenRoute]);

  // Esconder também se o pathname mudar para uma rota oculta enquanto visível
  useEffect(() => {
    if (isHiddenRoute) {
      setVisible(false);
      setIosSheetOpen(false);
    }
  }, [isHiddenRoute]);

  if (isHiddenRoute) return null;

  const installAndroid = async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setVisible(false);
    setEvent(null);
  };

  const openIosSheet = () => {
    setVisible(false);
    setIosSheetOpen(true);
  };

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(DISMISSED_KEY, '1');
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 lg:bottom-6 inset-x-4 md:left-auto md:right-6 md:w-96 z-50"
          >
            <div className="relative glass-strong rounded-2xl p-4 shadow-glow-violet">
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-text-primary"
                aria-label="Fechar"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3 mb-3">
                <Logo size="sm" showText={false} />
                <div className="flex-1 pr-6">
                  <h4 className="font-display font-bold text-sm">Instale o Influencers Lab.ia</h4>
                  <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                    Acesso mais rápido, notificações de novos produtos campeões e experiência de app nativo.
                  </p>
                </div>
              </div>

              {platform === 'ios' ? (
                <button
                  onClick={openIosSheet}
                  className="w-full h-11 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-brand active:brightness-110 inline-flex items-center justify-center gap-2"
                >
                  <Smartphone size={15} />
                  Como adicionar à tela de início
                </button>
              ) : (
                <button
                  onClick={installAndroid}
                  disabled={!event}
                  className="w-full h-11 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-brand active:brightness-110 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download size={15} />
                  Instalar como app
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <IosInstallSheet open={iosSheetOpen} onClose={() => setIosSheetOpen(false)} />
    </>
  );
}

function IosInstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Cleanup defensivo no unmount, garantindo que o body.overflow nunca fica preso.
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0, pointerEvents: 'auto' }}
            exit={{ y: '100%', pointerEvents: 'none' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed bottom-0 inset-x-0 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-strong rounded-t-3xl p-6 pb-10">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/15" />

              <div className="flex items-start gap-3 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
                  <Smartphone size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold leading-tight">
                    Adicione à <span className="text-gradient-brand">Tela de Início</span>
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    No iPhone, leva 3 segundos. Você terá o Influencers Lab.ia como app nativo.
                  </p>
                </div>
              </div>

              <ol className="space-y-3 mb-6">
                <li className="flex items-start gap-3 p-3 rounded-2xl bg-bg-elevated border border-border">
                  <div className="shrink-0 h-8 w-8 rounded-xl bg-gradient-brand-soft border border-brand-violet-400/40 flex items-center justify-center text-sm font-bold text-brand-violet-200">1</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Toque no botão <strong>Compartilhar</strong></p>
                    <p className="text-xs text-text-muted mt-0.5">Fica na barra inferior do Safari (ícone de quadrado com seta pra cima).</p>
                  </div>
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-bg border border-border flex items-center justify-center">
                    <Share size={18} className="text-brand-cyan-300" />
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-bg-elevated border border-border">
                  <div className="shrink-0 h-8 w-8 rounded-xl bg-gradient-brand-soft border border-brand-violet-400/40 flex items-center justify-center text-sm font-bold text-brand-violet-200">2</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Role e toque em <strong>Adicionar à Tela de Início</strong></p>
                    <p className="text-xs text-text-muted mt-0.5">Pode aparecer no meio ou final da lista de opções.</p>
                  </div>
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-bg border border-border flex items-center justify-center">
                    <Plus size={18} className="text-brand-cyan-300" />
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 rounded-2xl bg-bg-elevated border border-border">
                  <div className="shrink-0 h-8 w-8 rounded-xl bg-gradient-brand-soft border border-brand-violet-400/40 flex items-center justify-center text-sm font-bold text-brand-violet-200">3</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">Toque em <strong>Adicionar</strong> no canto superior direito</p>
                    <p className="text-xs text-text-muted mt-0.5">Pronto! O ícone do Influencers Lab.ia aparece na sua tela de início.</p>
                  </div>
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                    <ChevronRight size={18} className="text-white" />
                  </div>
                </li>
              </ol>

              <button
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-gradient-brand text-white font-semibold shadow-glow-brand active:brightness-110"
              >
                Entendi, vou fazer agora
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
