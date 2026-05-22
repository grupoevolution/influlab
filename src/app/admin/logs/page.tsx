'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import type { AccessLogEntry } from '@/lib/db/types';

export default function AdminLogsPage() {
  const [items, setItems] = useState<AccessLogEntry[]>([]);

  useEffect(() => {
    fetch('/api/admin/access-log?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setItems(j.data ?? []));
  }, []);

  return (
    <>
      <AdminHeader
        title="Log de acessos"
        description="Histórico de todos os acessos ao sistema (admins, staff, alunos)."
      />
      <section className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <Card variant="glass" className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-elevated/50 text-left">
              <tr>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Tipo</th>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Email</th>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Role</th>
                <th className="px-3 py-2 text-[10px] uppercase font-semibold tracking-widest text-text-muted">Quando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-text-muted">Sem registros.</td></tr>
              )}
              {items.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <span className={`inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                      l.type === 'login' ? 'bg-emerald-500/15 text-emerald-300' :
                      l.type === 'blocked' ? 'bg-red-500/15 text-red-300' :
                      'bg-bg-elevated text-text-muted'
                    }`}>{l.type}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{l.email}</td>
                  <td className="px-3 py-2 text-xs text-text-muted">{l.role}</td>
                  <td className="px-3 py-2 text-xs text-text-muted">{new Date(l.at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </>
  );
}
