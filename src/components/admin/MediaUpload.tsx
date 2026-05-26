'use client';

import { Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Kind = 'image' | 'video';

interface MediaUploadProps {
  accept: Kind | 'both';
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function MediaUpload({
  accept,
  value,
  onChange,
  label,
  hint,
  className,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptAttr =
    accept === 'image'
      ? 'image/*'
      : accept === 'video'
      ? 'video/mp4,video/webm,video/quicktime'
      : 'image/*,video/mp4,video/webm';

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Falha no upload');
        return;
      }
      onChange(json.data.url);
    } catch (e) {
      setError((e as Error)?.message ?? 'Falha no upload');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const isVideo = value?.toLowerCase().match(/\.(mp4|webm|mov|m4v)$/);

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Preview */}
        {value ? (
          <div className="relative group shrink-0">
            {isVideo ? (
              <video
                src={value}
                className="h-24 w-24 rounded-xl object-cover bg-bg-elevated border border-border"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="preview"
                className="h-24 w-24 rounded-xl object-cover bg-bg-elevated border border-border"
              />
            )}
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition"
              aria-label="Remover"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="h-24 w-24 rounded-xl bg-bg-elevated border border-dashed border-border flex items-center justify-center shrink-0">
            <Upload size={18} className="text-text-muted" />
          </div>
        )}

        {/* Botão e ações */}
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition',
              'bg-gradient-brand text-white shadow-glow-brand hover:brightness-110',
              uploading && 'opacity-60 cursor-wait',
            )}
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Enviando...' : value ? 'Trocar arquivo' : 'Selecionar arquivo'}
          </button>

          {hint && <p className="text-[11px] text-text-subtle mt-2">{hint}</p>}
          {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}
          {value && (
            <p className="text-[10px] text-text-muted mt-1 truncate font-mono" title={value}>
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
