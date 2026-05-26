'use client';

import { Crown, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

/** Card de produto PRO bloqueado pra usuários do plano básico. */
export function LockedProductCard({ onClick, delay = 0 }: { onClick?: () => void; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <button onClick={onClick} className="block w-full text-left group">
        <Card variant="glass" hoverable className="overflow-hidden relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-bg-elevated">
            {/* Mosaico abstrato (gradient + ruído) substituindo a imagem */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-violet-700/40 via-bg-card to-brand-cyan-700/40" />
            <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 8px, transparent 8px 16px)',
              }}
            />

            {/* Cadeado central com glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-brand blur-2xl opacity-60" />
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
                  <Lock size={22} className="text-white" />
                </div>
              </div>
            </div>

            {/* Badge PRO no topo */}
            <div className="absolute top-2 left-2 right-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-brand text-white text-[10px] font-bold uppercase tracking-widest shadow-glow-brand">
                <Crown size={11} />
                Exclusivo PRO
              </span>
            </div>

            {/* Mensagem inferior */}
            <div className="absolute bottom-0 inset-x-0 p-3 text-center">
              <p className="text-[11px] font-semibold text-white drop-shadow">
                Liberado no plano PRO
              </p>
              <p className="text-[10px] text-white/70 mt-0.5">Toque pra desbloquear</p>
            </div>
          </div>

          <div className="p-3">
            <div className="h-3 w-3/4 rounded bg-white/10 mb-2" />
            <div className="flex items-center justify-between">
              <div className="h-2 w-1/3 rounded bg-white/5" />
              <div className="h-2 w-1/4 rounded bg-white/5" />
            </div>
          </div>
        </Card>
      </button>
    </motion.div>
  );
}
