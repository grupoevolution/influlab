'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calculator } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { CircuitDecor } from '@/components/brand/CircuitDecor';

export function CalculatorTeaser() {
  return (
    <section className="px-4 md:px-8 pt-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/app/calculadora" className="block group">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              variant="gradient"
              hoverable
              className="relative overflow-hidden border-brand-violet-400/40 shadow-glow-violet bg-gradient-to-br from-brand-violet-500/25 via-brand-violet-600/15 to-brand-cyan-500/20"
            >
              <CircuitDecor className="absolute inset-0 w-full h-full opacity-30" />

              <div className="relative p-5 md:p-7 flex items-center gap-4 md:gap-6">
                <div className="shrink-0">
                  <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
                    <Calculator size={24} className="text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-50 blur-xl" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan-300 mb-1.5">
                    Defina sua meta
                  </p>
                  <h3 className="text-lg md:text-2xl font-display font-bold leading-tight mb-1">
                    Quanto você quer <span className="text-gradient-cyan">faturar?</span>
                  </h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed hidden md:block">
                    Defina sua meta mensal e descubra quantos vídeos por dia precisa criar pra chegar lá.
                  </p>
                </div>

                <div className="shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-4 h-10 md:h-11 rounded-xl bg-gradient-brand text-white text-xs md:text-sm font-semibold shadow-glow-brand group-hover:gap-2.5 transition-all">
                    <span className="hidden sm:inline">Calcular</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
