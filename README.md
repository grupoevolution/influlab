# InfluLab — Sistema completo para alunos do TikTok Shop

PWA + 3 áreas:

- **`/login` + `/app`** — sistema do aluno (PWA instalável)
- **`/admin`** — painel administrativo completo (acesso total)
- **`/staff`** — painel de operação (apenas conteúdo, não toca em acessos/avisos/notificações/logs)

---

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind 3.4 + Framer Motion + lucide-react
- Auth próprio HMAC-SHA256 (sem dependências externas)
- DB JSON file persistente (`/app/data/db.json`) — fácil de migrar pro Postgres depois
- PWA: manifest + service worker + install prompt + suporte iOS

---

## Configuração no EasyPanel

### 1. Variáveis de ambiente (Settings → Environment)

```bash
AUTH_SECRET=cole-aqui-32-caracteres-aleatorios
ADMIN_EMAIL=admin@influlab.io
ADMIN_PASSWORD=sua-senha-forte
STAFF_EMAIL=staff@influlab.io
STAFF_PASSWORD=senha-do-funcionario
DATA_DIR=/app/data
```

> Gere `AUTH_SECRET` com: `openssl rand -base64 32`

### 2. Volume persistente (CRÍTICO!)

No EasyPanel, vá em **Mounts** e adicione:

| Mount Path | Volume Name |
|---|---|
| `/app/data` | `influlab-data` |

**Sem isso, os dados são perdidos a cada redeploy!**

### 3. Deploy

EasyPanel detecta automaticamente o Dockerfile. Build inicial: ~3 min. Builds seguintes: ~40s.

### 4. Backup do JSON

Recomendo configurar um cron no EasyPanel pra fazer backup do volume `influlab-data` diariamente — vou ajudar a montar isso quando você quiser.

---

## Como funciona

### Aluno

1. Aluno digita o email em `/login`
2. Backend verifica se o email está na **whitelist** (`/admin/acessos`)
3. Se estiver: entra com tudo liberado
4. Se não: entra mas vê o `BlurLock` por cima do conteúdo (gera desejo de compra)

### Admin

1. Acessa `/admin/login`
2. Login com `ADMIN_EMAIL` + `ADMIN_PASSWORD`
3. Vê o dashboard com estatísticas e log de acessos
4. Pode gerenciar tudo:
   - **Produtos campeões** (CRUD)
   - **Prompts de vídeo / imagem** (CRUD)
   - **Vídeos virais** (CRUD)
   - **Top criadores** (CRUD)
   - **Avisos do dia** (banner que aparece na home)
   - **Liberar acessos** (whitelist de emails compradores)
   - **Notificações broadcast** (envia push pra todos)
   - **Log de acessos**

### Staff

1. Acessa `/staff/login` (mesma tela do admin)
2. Login com `STAFF_EMAIL` + `STAFF_PASSWORD`
3. Vê o mesmo painel **sem** as opções de admin (acessos, notificações, logs, avisos)
4. Só adiciona/edita produtos, prompts, virais e criadores

---

## Estrutura

```
src/
├── app/
│   ├── login/                  # login do aluno
│   ├── app/                    # sistema do aluno (PWA)
│   ├── admin/                  # painel administrativo
│   │   ├── login/
│   │   ├── page.tsx            # dashboard
│   │   ├── produtos/
│   │   ├── prompts-video/
│   │   ├── prompts-imagem/
│   │   ├── virais/
│   │   ├── criadores/
│   │   ├── avisos/             # admin-only
│   │   ├── acessos/            # admin-only (whitelist)
│   │   ├── notificacoes/       # admin-only
│   │   └── logs/               # admin-only
│   ├── staff/                  # mesmas telas do admin filtradas
│   └── api/
│       ├── auth/               # login/logout/me
│       ├── admin/              # CRUDs protegidos
│       ├── public/             # leitura sem auth (alunos)
│       └── student/login/      # valida email contra whitelist
├── lib/
│   ├── auth/session.ts         # HMAC, cookies, roles
│   ├── db/
│   │   ├── index.ts            # JSON file persistente
│   │   ├── seed.ts             # dados iniciais
│   │   └── types.ts            # schemas
│   └── api/
│       ├── crud.ts             # handlers genéricos
│       └── client.ts           # hooks de leitura no cliente
├── components/
│   ├── admin/                  # AdminShell, AdminHeader, EntityManager
│   ├── access/AccessGate.tsx   # BlurLock para não-compradores
│   └── notifications/BroadcastListener.tsx  # toast em tempo real
└── middleware.ts               # protege /admin /staff e /api/admin
```

---

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrir <http://localhost:3000>.

- Aluno: <http://localhost:3000/login>
- Admin: <http://localhost:3000/admin/login>
- Staff: <http://localhost:3000/staff/login>

Os dados ficam em `./data/db.json` (gitignored).

---

## Próximos passos previstos

- [ ] Web Push real (chaves VAPID + endpoint de subscription)
- [ ] Webhook receivers das plataformas (Hotmart, Kiwify, Cakto) → auto-adicionar email na whitelist
- [ ] Migração para PostgreSQL + Prisma (estrutura já está pronta para suportar)
- [ ] Backup automático do volume para S3/R2
- [ ] Upload de mídias (imagens/vídeos) direto pelo painel (hoje usa URL externa)
- [ ] CAPTCHA invisível no login (Cloudflare Turnstile)

---

## Licença

Proprietário © InfluLab. Todos os direitos reservados.
