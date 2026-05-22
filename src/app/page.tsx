import { redirect } from 'next/navigation';

export default function Home() {
  // Por padrão direciona para o login. Quando integrar auth, redireciona logados para /app.
  redirect('/login');
}
