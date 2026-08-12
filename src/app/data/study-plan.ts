import { DayPlan, DayTask, Phase, Track } from '../models';

export const PLAN_START = '2026-08-12';
export const PLAN_END = '2028-08-11';

const phaseSeed: Array<[string, Track, string[]]> = [
  ['Lógica + Java básico','backend',['JDK/JVM e execução','main e saída','variáveis e tipos','operadores','if/else/switch','loops','métodos','arrays','Scanner','debug','exercícios de lógica','mini projeto console']],
  ['Java OOP + Git + HTML/CSS','backend',['classes e objetos','construtores/this','encapsulamento','herança','polimorfismo','interfaces','abstração','composição','SOLID inicial','Git commit/log','branch/merge','HTML/CSS','mini projeto OOP']],
  ['Java Core + SQL','backend',['List','Set','Map','Queue/Deque','Generics','Exceptions','Custom Exceptions','Enums','datas','Files/Paths','SQL SELECT','JOIN','GROUP BY','mini projeto']],
  ['JavaScript básico','frontend',['let/const','tipos','operadores','condicionais','loops','funções','arrays','objetos','map/filter/find','reduce/some/every','DOM','eventos','JSON','mini projeto JS']],
  ['JavaScript avançado','frontend',['scope','hoisting','closure','this','prototype','destructuring','spread/rest','modules','Promise','async/await','Event Loop','fetch/HTTP','erros','mini projeto API']],
  ['TypeScript','frontend',['tipos','type/interface','union/intersection','classes','generics','keyof/typeof','narrowing','Partial/Required','Pick/Omit/Record','readonly','modules','tsconfig','tipar API','mini projeto TS']],
  ['Angular fundamentos','frontend',['CLI/workspace','Standalone','templates','bindings','control flow','pipes','services/DI','router','lazy loading','HttpClient','forms','validação','componentização','mini CRUD']],
  ['Angular avançado','frontend',['Signals','computed','effect','Observable','Subjects','operadores RxJS','interceptors','guards','state','change detection','performance','defer','testes','arquitetura features']],
  ['HTTP/REST + Spring Boot','backend',['HTTP','REST','IoC/DI','Spring Boot','config/profiles','controller','service','repository','DTO','validation','exception handler','OpenAPI','Actuator','API CRUD']],
  ['JPA/Hibernate + PostgreSQL','backend',['modelagem','Entity','Repository','ManyToOne','OneToMany','ManyToMany','transactions','lazy/eager','N+1','JPQL','native query','índices','EXPLAIN','paginação']],
  ['Spring Security','backend',['authn/authz','filter chain','password hashing','JWT','refresh token','roles','CORS','CSRF','OAuth2','OIDC','auth code','client credentials','Keycloak','API segura']],
  ['Testes + Docker','backend',['JUnit 5','Mockito','AssertJ','MockMvc','SpringBootTest','integração','Testcontainers','Docker','Dockerfile','multi-stage','volumes/networks','Compose','healthcheck','pipeline']],
  ['Java avançado + JVM','backend',['Streams avançados','CompletableFuture','Threads','ExecutorService','synchronized','locks','virtual threads','Heap/Stack','GC','ClassLoader','profiling','memory leak','performance','diagnóstico']],
  ['Redis + performance','backend',['Redis','cache','TTL','cache-aside','invalidação','sessões','pub/sub','distributed lock','rate limit','stampede','serialização','Spring Cache','métricas','carga']],
  ['Kafka + Event Driven','backend',['conceitos','producer','consumer','topic/partition','offset','consumer group','ordering','retry','DLQ','idempotência','at-least-once','Outbox','Saga','consistência eventual']],
  ['Arquitetura + DDD','architecture',['SOLID','patterns','Clean Architecture','Hexagonal','Entity/VO','Aggregate','Repository','Domain Service','Bounded Context','Domain Events','CQRS','microservices trade-offs','modular monolith','ADR']],
  ['AWS fundamentos','cloud',['cloud','regions/AZ','IAM','EC2','S3','EBS/EFS','VPC','subnets','route tables','security groups','ALB/NLB','Route53','RDS','CloudWatch']],
  ['AWS arquitetura + SAA','cloud',['Auto Scaling','CloudFront','SQS','SNS','EventBridge','Lambda','ECS','EKS visão','DynamoDB','ElastiCache','Secrets','KMS','HA','DR','simulados SAA']],
  ['Kubernetes','cloud',['arquitetura','Pod','Deployment','ReplicaSet','Service','Ingress','ConfigMap','Secret','Namespace','requests/limits','readiness/liveness','PV','HPA','rolling update','Helm']],
  ['Terraform + CI/CD','cloud',['IaC','provider','resource','variables','state','remote state','modules','plan/apply','GitLab CI','build/test','Sonar','SAST','registry','deploy/rollback']],
  ['Observabilidade','architecture',['logs','métricas','tracing','Actuator','Micrometer','Prometheus','Grafana','OpenTelemetry','Jaeger/Tempo','Loki','correlation ID','SLI/SLO','alertas','troubleshooting']],
  ['System Design','architecture',['requisitos','capacidade','load balancing','cache','replication','sharding','SQL/NoSQL','queues','consistência','CAP','idempotência','rate limit','resiliência','e-commerce','chat']],
  ['Azure fundamentos','cloud',['estrutura/regiões','Entra ID','VNet','VM','Storage','App Service','Azure SQL','Functions','containers','Monitor','Key Vault','Service Bus','AKS','comparar AWS/Azure']],
  ['Projeto final + entrevistas','architecture',['arquitetura final','backlog','backend','frontend','segurança','testes','CI/CD','IaC','observabilidade','docs/ADR','system design interview','Java interview','Angular interview','inglês técnico']]
];

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function parse(value: string): Date {
  const [y,m,d] = value.split('-').map(Number);
  return new Date(y, m-1, d, 12);
}
function addMonths(value: string, months: number): string {
  const d = parse(value); d.setMonth(d.getMonth() + months); return iso(d);
}
function addDays(value: string, days: number): string {
  const d = parse(value); d.setDate(d.getDate() + days); return iso(d);
}

export const PHASES: Phase[] = phaseSeed.map(([label,track,topics], index) => ({
  id: index + 1,
  label,
  track,
  start: addMonths(PLAN_START,index),
  end: addDays(addMonths(PLAN_START,index+1),-1),
  topics
}));

export function phaseFor(date: string): Phase {
  return PHASES.find(p => date >= p.start && date <= p.end) ?? (date < PLAN_START ? PHASES[0] : PHASES.at(-1)!);
}

const vacation: Record<string, [number, number, string]> = {
  '2026-12-22':[45,180,'JavaScript: fundamentos + exercícios'],
  '2026-12-23':[45,180,'JavaScript: arrays, objetos e funções'],
  '2026-12-24':[30,60,'Revisão leve + inglês'],
  '2026-12-25':[0,0,'Descanso'],
  '2026-12-26':[45,180,'JavaScript: map/filter/reduce'],
  '2026-12-27':[45,150,'Projeto JS simples'],
  '2026-12-28':[45,180,'Promises + async/await'],
  '2026-12-29':[45,180,'HTTP/fetch/JSON'],
  '2026-12-30':[45,180,'Projeto JS consumindo API'],
  '2026-12-31':[30,60,'Revisão e retrospectiva'],
  '2027-01-01':[0,0,'Descanso'],
  '2027-01-02':[30,120,'Projeto + organizar janeiro']
};

function englishActivity(date: string, phaseId: number): string {
  const wd = parse(date).getDay(); // 0 dom .. 6 sáb
  const base = [
    'Revisar 20 palavras + escrever/falar 5 frases',
    'Curso principal + anotar 5 palavras',
    'Duolingo 10 min + revisar 10 palavras + 5 frases em voz alta',
    'Gramática do nível + exercícios',
    'Listening curto + repetir cada frase em voz alta',
    'Revisão da semana + 10 palavras técnicas',
    'Curso principal + pronúncia'
  ];
  if (phaseId >= 4 && wd === 4) return 'British Council/VOA: listening do nível + repetição';
  if (phaseId >= 13 && wd === 1) return 'Leitura técnica curta em inglês + 5 expressões';
  if (phaseId >= 19 && wd === 0) return '5 minutos de fala técnica + revisão de vocabulário';
  return base[wd];
}

function careerMinutes(date: string): number {
  const wd = parse(date).getDay();
  return ({0:30,1:90,2:0,3:90,4:0,5:60,6:180} as Record<number,number>)[wd] ?? 0;
}
function adsMinutes(date: string): number {
  const wd = parse(date).getDay();
  return ({0:90,1:0,2:90,3:0,4:90,5:0,6:0} as Record<number,number>)[wd] ?? 0;
}

function topicIndexFor(date: string, phase: Phase): number {
  let d = parse(phase.start);
  const target = parse(date);
  let count = 0;
  while (d < target) {
    const value = iso(d);
    if (!vacation[value] && careerMinutes(value) > 0) count++;
    d.setDate(d.getDate() + 1);
  }
  return count % phase.topics.length;
}

export function buildDayPlan(date: string): DayPlan {
  const phase = phaseFor(date);
  const tasks: DayTask[] = [];
  if (vacation[date]) {
    const [eng, career, focus] = vacation[date];
    if (eng) tasks.push({ key:'english', category:'english', track:'english', label:'Kultivi + vocabulário + repetição em voz alta', minutes:eng });
    if (career) tasks.push({ key:'career', category:'career', track:phase.track, label:focus, minutes:career });
    return { date, phase, mode: eng + career === 0 ? 'Descanso' : 'Férias coletivas', tasks };
  }
  const eng = 30;
  tasks.push({ key:'english', category:'english', track:'english', label:englishActivity(date, phase.id), minutes:eng });
  const cm = careerMinutes(date);
  if (cm > 0) {
    const topic = phase.topics[topicIndexFor(date,phase)];
    const wd = parse(date).getDay();
    const prefix = wd === 6 ? 'Projeto prático' : wd === 5 ? 'Exercícios/revisão' : wd === 0 ? 'Revisão leve' : 'Estudo';
    tasks.push({ key:'career', category:'career', track:phase.track, label:`${prefix}: ${phase.label} — ${topic}`, minutes:cm });
  }
  const am = adsMinutes(date);
  if (am > 0) tasks.push({ key:'ads', category:'ads', track:'ads', label:'Faculdade ADS — aula, atividade, prova ou revisão do conteúdo da semana', minutes:am });
  return { date, phase, mode:'Normal', tasks };
}

export function allPlanDates(): string[] {
  const out: string[] = [];
  const d = parse(PLAN_START), end = parse(PLAN_END);
  while (d <= end) { out.push(iso(d)); d.setDate(d.getDate()+1); }
  return out;
}
