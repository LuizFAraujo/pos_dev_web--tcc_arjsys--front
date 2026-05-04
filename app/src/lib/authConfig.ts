/**
 * authConfig.ts - Configurações de autenticação.
 *
 * Centraliza tempos relacionados à sessão. Mude os valores aqui pra
 * ajustar o comportamento sem caçar pelo código.
 *
 * Convenção: todos os valores em MILISSEGUNDOS (ms).
 *   1 segundo  =          1.000 ms
 *   1 minuto   =         60.000 ms
 *   1 hora     =      3.600.000 ms
 */

/**
 * Tempo total de uma sessão sem reautenticação.
 *
 * Comportamento: a sessão expira N tempo depois do último loggedInAt
 * (login ou renovação por atividade). Atividade do user (mouse/teclado/
 * scroll) reseta esse cronômetro pra N novamente (sliding expiration).
 *
 * Valor atual: 10 horas
 *
 * Sugestões pra outros cenários:
 *   - ferramenta interna (uso o dia todo):    10 * 60 * 60 * 1000  (10h)
 *   - sistema corporativo padrão:              8 * 60 * 60 * 1000  (8h)
 *   - turno único:                             4 * 60 * 60 * 1000  (4h)
 *   - dados sensíveis (compliance):           30 * 60 * 1000       (30 min)
 *   - banking-like:                           15 * 60 * 1000       (15 min)
 *
 * Exemplos de teste rápido (descomentar a linha desejada):
 *   export const SESSION_TTL_MS = 1 * 60 * 1000;   // 1 min
 *   export const SESSION_TTL_MS = 3 * 60 * 1000;   // 3 min
 */
export const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

/**
 * Tempo antes da expiração em que o aviso modal aparece.
 *
 * Quando msUntilExpiry() <= este valor, abre o SessionExpiringDialog
 * com countdown e botão "Continuar conectado". A barra de progresso
 * dura exatamente este tempo (do 100% ao 0%).
 *
 * Valor atual: 1 minuto
 *
 * Recomendação: dar tempo razoável pro user notar e decidir, sem ser
 * tão longo que vire spam. 5 min é equilibrado pra TTL de 8-10h.
 * Se baixar o TTL pra 30 min, considere baixar o aviso pra 2-3 min.
 *
 * Cuidado: SESSION_WARNING_MS NÃO pode ser maior que SESSION_TTL_MS
 * (o aviso apareceria já no login).
 */
export const SESSION_WARNING_MS = 1 * 60 * 1000;

/**
 * Frequência da verificação periódica de expiração.
 *
 * A cada N tempo o app checa se a sessão expirou ou se entrou na
 * janela de aviso. Não é o tempo "real" de expiração - é só a
 * granularidade da checagem (a expiração de fato é calculada por
 * msUntilExpiry() em tempo real).
 *
 * Valor atual: 2 minutos
 *
 * Compromisso: muito frequente desperdiça CPU; muito esparso atrasa
 * o aviso/logout em até este intervalo. 1 min é padrão.
 */
export const SESSION_CHECK_INTERVAL_MS = 2 * 60 * 1000;

/**
 * Limite de frequência entre renovações de sessão por atividade.
 *
 * O rastreador de atividade ouve mousemove/keydown/click/scroll.
 * Esses eventos disparam dezenas de vezes por segundo. Pra não
 * atualizar o store na mesma cadência, só renova no máximo 1x a
 * cada N tempo.
 *
 * Valor atual: 10 segundos
 *
 * Não precisa muito ajuste. 5s é suficiente.
 */
export const SESSION_ACTIVITY_THROTTLE_MS = 10 * 1000;
