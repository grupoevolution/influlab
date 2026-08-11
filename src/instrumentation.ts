/**
 * Guarda global do processo (roda uma vez no boot do servidor Next).
 *
 * Por quê: em produção, uma exceção não tratada em QUALQUER ponto derruba o
 * processo Node inteiro — e com tráfego real isso vira crash-loop (o container
 * reinicia, os usuários voltam, cai de novo). Foi exatamente o que aconteceu
 * com o abort de streams de vídeo.
 *
 * Com estes handlers registrados, o Node NÃO encerra mais por
 * uncaughtException/unhandledRejection: o erro é logado em destaque (com stack)
 * e o servidor continua de pé. O log vira o diagnóstico.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('===================================================');
    // eslint-disable-next-line no-console
    console.error('[FATAL-GUARD] uncaughtException capturada — o processo NÃO foi derrubado:');
    // eslint-disable-next-line no-console
    console.error(err);
    // eslint-disable-next-line no-console
    console.error('===================================================');
  });

  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('[FATAL-GUARD] unhandledRejection capturada — o processo NÃO foi derrubado:', reason);
  });
}
