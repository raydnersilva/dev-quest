import { CertificationItem, EnglishResource, EnglishStage } from '../models';

export const ENGLISH_STAGES: EnglishStage[] = [
  {
    period: 'M01–M03', level: 'A0 → A1', title: 'Primeiras palavras', tools: 'Kultivi + Duolingo',
    topics: ['alfabeto e sons', 'números e horários', 'pronomes', 'verbo to be', 'have / do / can', 'simple present', 'perguntas básicas', 'vocabulário de trabalho e tecnologia'],
    target: 'Se apresentar, entender frases muito simples e escrever pequenas frases.'
  },
  {
    period: 'M04–M06', level: 'A1', title: 'Base funcional', tools: 'Kultivi + British Council A1',
    topics: ['present simple', 'present continuous', 'there is/are', 'artigos', 'preposições', 'adjetivos', 'reading A1', 'listening A1'],
    target: 'Entender textos curtos e descrever rotina, objetos e ações simples.'
  },
  {
    period: 'M07–M09', level: 'A1 → A2', title: 'Começando a conversar', tools: 'British Council + VOA',
    topics: ['past simple', 'future', 'comparatives', 'modal verbs', 'pronúncia', 'listening lento', 'frases sobre código', 'vocabulário de reunião'],
    target: 'Falar sobre rotina de trabalho e explicar código com frases simples.'
  },
  {
    period: 'M10–M12', level: 'A2', title: 'Inglês técnico básico', tools: 'British Council A2 + VOA',
    topics: ['reading A2', 'listening A2', 'writing A2', 'speaking guiado', 'phrasal verbs básicos', 'explicar endpoint', 'explicar erros', 'descrever banco e API'],
    target: 'Entender conversas lentas e explicar tarefas técnicas cotidianas.'
  },
  {
    period: 'M13–M15', level: 'A2 → B1', title: 'Documentação sem medo', tools: 'British Council + VOA + BBC',
    topics: ['documentação Java em inglês', 'e-mails técnicos', 'present perfect', 'conditionals', 'vocabulário de incidentes', 'resumo oral', 'listening sem legenda PT'],
    target: 'Ler documentação com menos tradução e relatar problemas técnicos.'
  },
  {
    period: 'M16–M18', level: 'B1', title: 'Conversação técnica', tools: 'British Council B1 + BBC/VOA',
    topics: ['arquitetura', 'trade-offs', 'cloud vocabulary', 'daily meeting', 'README em inglês', 'reuniões', 'fala de 5 minutos'],
    target: 'Sustentar uma conversa técnica simples e apresentar decisões.'
  },
  {
    period: 'M19–M21', level: 'B1 → B2', title: 'Comunicação profissional', tools: 'British Council B1/B2 + BBC',
    topics: ['Kubernetes e deploy', 'incident response', 'apresentação técnica', 'listening normal', 'reading B2', 'writing técnico', 'fluidez e pronúncia'],
    target: 'Participar de reuniões técnicas e consumir conteúdo sem depender de tradução.'
  },
  {
    period: 'M22–M24', level: 'B2', title: 'Entrevista internacional', tools: 'British Council B2 + BBC + mock interviews',
    topics: ['Tell me about yourself', 'behavioral interview', 'system design', 'Java interview', 'Angular interview', 'negociação de requisitos', 'apresentação de projeto'],
    target: 'Conduzir uma entrevista técnica e conversação profissional com autonomia.'
  }
];

export const ENGLISH_RESOURCES: EnglishResource[] = [
  { name: 'Kultivi — Inglês Online', description: 'Curso principal em português para sair do absoluto zero. Use como trilha estruturada nos primeiros meses.', url: 'https://kultivi.com/curso/ingles', recommendedFrom: 'A0' },
  { name: 'Duolingo', description: 'Use somente como hábito curto de vocabulário e revisão. Não substitui o curso principal.', url: 'https://pt.duolingo.com/', recommendedFrom: 'A0' },
  { name: 'British Council LearnEnglish', description: 'Reading, listening, speaking, grammar e vocabulary organizados por nível CEFR.', url: 'https://learnenglish.britishcouncil.org/', recommendedFrom: 'A1' },
  { name: 'British Council — Level Test', description: 'Faça a cada 3 ou 4 meses para acompanhar a evolução de nível.', url: 'https://learnenglish.britishcouncil.org/english-levels/online-english-level-test', recommendedFrom: 'A1' },
  { name: 'VOA Learning English', description: 'Áudios e vídeos em ritmo mais acessível; excelente ponte para listening real.', url: 'https://learningenglish.voanews.com/', recommendedFrom: 'A1/A2' },
  { name: 'BBC Learning English', description: 'Pronúncia, vocabulário e listening em inglês real para a fase intermediária.', url: 'https://www.bbc.co.uk/learningenglish', recommendedFrom: 'A2/B1' }
];

export const TECHNICAL_PHRASES = [
  ['The application is running.', 'A aplicação está executando.'],
  ['The request failed because the database is offline.', 'A requisição falhou porque o banco está offline.'],
  ['This endpoint creates a new user.', 'Este endpoint cria um novo usuário.'],
  ['The service validates the request before saving the data.', 'O serviço valida a requisição antes de salvar os dados.'],
  ['We use a queue to process the task asynchronously.', 'Usamos uma fila para processar a tarefa de forma assíncrona.'],
  ['This change improves performance but increases complexity.', 'Esta mudança melhora performance, mas aumenta a complexidade.'],
  ['I would add monitoring before deploying this to production.', 'Eu adicionaria monitoramento antes de colocar isso em produção.'],
  ['The main trade-off is consistency versus availability.', 'O principal trade-off é consistência versus disponibilidade.'],
  ['I need more context about the expected traffic.', 'Preciso de mais contexto sobre o tráfego esperado.'],
  ['Let me explain how I would design this system.', 'Deixe-me explicar como eu projetaria este sistema.']
] as const;

export const CERTIFICATIONS: CertificationItem[] = [
  { order: 1, title: 'Base técnica primeiro', moment: 'Meses 1–12', status: 'base', description: 'Sem pressa para prova: Java, SQL, JavaScript, TypeScript, Angular, Spring e testes vêm antes.' },
  { order: 2, title: 'Oracle Java Developer', moment: 'Meses 12–16', status: 'priority', description: 'Faça quando Java Core e JVM estiverem sólidos. A versão exata deve ser escolhida perto da prova.' },
  { order: 3, title: 'AWS Solutions Architect — Associate', moment: 'Meses 17–20', status: 'priority', description: 'Primeira certificação cloud recomendada para arquitetura e fundamentos AWS.' },
  { order: 4, title: 'AWS Developer — Associate', moment: 'Meses 20–24', status: 'priority', description: 'Complementa a SAA com foco em desenvolvimento e operação de aplicações AWS.' },
  { order: 5, title: 'CKAD', moment: 'Após 24 meses', status: 'later', description: 'Certificação prática para desenvolvimento e operação de aplicações Kubernetes.' },
  { order: 6, title: 'Terraform Associate', moment: 'Após 24 meses', status: 'later', description: 'Valida Infrastructure as Code quando Terraform já fizer parte da sua rotina.' },
  { order: 7, title: 'Azure', moment: 'Conforme vaga/empresa', status: 'later', description: 'Estude Azure depois de AWS ou quando a empresa-alvo usar a plataforma.' }
];
