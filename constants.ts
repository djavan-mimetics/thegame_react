
import { UserProfile, ChatPreview, Message, Payment, ReportTicket, NotificationItem } from './types';

export const TAGS_LIST = [
  'Chopinho gelado',
  'Litrão no pé sujo',
  'Encher a cara',
  'Uns bons drinks',
  'Vinho à dois',
  'Festa patrocinada',
  'Boate',
  'Sambinha e pagode',
  'Sertanejo e Forró',
  'Rock e Alterna',
  'Praia e água de côco',
  'Lancha e Jet',
  'Pedalinho na lagoa',
  'Passear com o totó',
  'Dar uma corrida',
  'Jantar à luz de velas',
  'Tomar um café',
  'Japa',
  'Podrão na pracinha',
  'Netflix',
  'Fumar',
  'Fazer um rala e rola',
  'Cinema e pipoca',
  'Rolezin no shopping',
  'Teatro',
  'Jogar videogame',
  'Jogar RPG'
];

export const LOCATIONS = {
  'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Guarulhos', 'Sorocaba', 'São José dos Campos'],
  'RJ': ['Rio de Janeiro', 'Niterói', 'Cabo Frio', 'Búzios', 'Petrópolis', 'Duque de Caxias', 'Nova Iguaçu'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Ouro Preto', 'Tiradentes', 'Juiz de Fora', 'Contagem', 'Betim'],
  'ES': ['Vitória', 'Vila Velha', 'Guarapari', 'Serra', 'Cariacica'],
  'BA': ['Salvador', 'Porto Seguro', 'Ilhéus'],
  'RS': ['Porto Alegre', 'Gramado', 'Caxias do Sul'],
  'SC': ['Florianópolis', 'Balneário Camboriú', 'Joinville'],
  'PR': ['Curitiba', 'Foz do Iguaçu', 'Londrina'],
  'PE': ['Recife', 'Olinda', 'Porto de Galinhas'],
  'CE': ['Fortaleza', 'Jericoacoara'],
  'DF': ['Brasília']
};

export const GENDER_OPTIONS = [
  'Homem Hétero',
  'Homem Bi',
  'Homem Gay',
  'Homem Trans',
  'Mulher Hétero',
  'Mulher Bi',
  'Mulher Lésbica',
  'Mulher Trans',
  'Outro'
];

export const LOOKING_FOR_OPTIONS = [...GENDER_OPTIONS];

export const RELATIONSHIP_OPTIONS = [
  'Casamento',
  'Namoro',
  'Amizade colorida',
  'Peguete',
  'Um pente e rala',
  'Trisal',
  'Suruba',
  'Nem eu sei o que quero'
];

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Jessica',
    age: 24,
    bio: 'Designer de dia, gamer à noite. Procurando alguém para me carregar nas rankeadas.',
    distance: 3,
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80'
    ],
    tags: ['Jogar videogame', 'Rock e Alterna', 'Japa'],
    currentTag: 'Jogar videogame',
    classification: 'Pobre Premium',
    billSplit: 'Racho a conta',
    availableToday: true,
    rankingScore: 9.2,
    job: 'Designer UX',
    sign: 'Áries',
    height: '165 cm',
    education: 'Superior completo',
    intention: 'Um relacionamento sério',
    relationship: 'Monogamia',
    family: 'Talvez um dia',
    communication: 'Mensagens longas',
    loveLanguage: 'Tempo de qualidade',
    drink: 'Socialmente',
    smoke: 'Não fumo',
    pets: 'Gato',
    exercise: 'Às vezes',
    food: 'Onívoro',
    sleep: 'Coruja noturna',
    personality: ['Criativa', 'Introvertida'],
    lookingFor: ['Homens']
  },
  {
    id: '2',
    name: 'Amanda',
    age: 27,
    bio: 'Viciada em café e entusiasta de viagens. Vamos planejar nossa próxima trip!',
    distance: 12,
    images: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80'
    ],
    tags: ['Tomar um café', 'Praia e água de côco', 'Vinho à dois'],
    currentTag: 'Tomar um café',
    classification: 'Rica',
    billSplit: 'Sou uma princesa, meu date paga a conta',
    availableToday: false,
    rankingScore: 8.5,
    job: 'Gerente de Marketing',
    sign: 'Libra',
    height: '170 cm',
    education: 'Pós-graduação',
    intention: 'Novas amizades',
    drink: 'Frequentemente',
    smoke: 'Fumo socialmente',
    relationship: 'Monogamia',
    family: 'Não quero filhos',
    communication: 'Chamada de vídeo',
    loveLanguage: 'Atos de serviço',
    pets: 'Gosta de gatos',
    exercise: 'Às vezes',
    food: 'Vegetariana',
    sleep: 'Madrugadora',
    personality: ['Extrovertida', 'Aventureira'],
    lookingFor: ['Homens', 'Mulheres']
  },
  {
    id: '3',
    name: 'Camila',
    age: 22,
    bio: 'Só pelas vibes. Rio de Janeiro ☀️',
    distance: 5,
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
    ],
    tags: ['Praia e água de côco', 'Boate', 'Sambinha e pagode'],
    currentTag: 'Sambinha e pagode',
    classification: 'Dublê de rica',
    billSplit: 'Pago a conta',
    availableToday: true,
    rankingScore: 9.8,
    job: 'Estudante',
    sign: 'Leão',
    education: 'Cursando Graduação',
    intention: 'Algo casual',
    relationship: 'Aberto',
    drink: 'Aos fins de semana',
    smoke: 'Fumo quando bebo',
    exercise: 'Todo dia',
    family: 'Talvez um dia',
    communication: 'Áudio',
    loveLanguage: 'Presentes',
    pets: 'Amo todos',
    food: 'Carnívoro',
    sleep: 'Coruja noturna',
    personality: ['Festeira', 'Carismática'],
    lookingFor: ['Todos']
  },
  {
    id: '4',
    name: 'Sophia',
    age: 25,
    bio: 'Arquiteta. Amo brutalismo e gatos.',
    distance: 8,
    images: [
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=400&q=80'
    ],
    tags: ['Cinema e pipoca', 'Passear com o totó', 'Teatro'],
    currentTag: 'Cinema e pipoca',
    classification: 'Zilionária',
    billSplit: 'Racho a conta',
    availableToday: false,
    rankingScore: 7.9,
    job: 'Arquiteta',
    sign: 'Virgem',
    height: '172 cm',
    pets: 'Cachorro',
    education: 'Mestrado',
    intention: 'Um relacionamento sério',
    relationship: 'Monogamia',
    family: 'Quero filhos',
    communication: 'Pessoalmente',
    loveLanguage: 'Toque físico',
    drink: 'Socialmente',
    smoke: 'Não fumo',
    exercise: 'Às vezes',
    food: 'Vegetariana',
    sleep: 'Dorme cedo',
    personality: ['Criativa', 'Romântica'],
    lookingFor: ['Homens']
  }
];

export const MOCK_CHATS: ChatPreview[] = [
  {
    id: 'c1',
    userId: '2',
    name: 'Amanda',
    image: 'https://picsum.photos/400/600?random=2',
    lastMessage: 'Haha, isso é muito engraçado! 😂',
    timestamp: '10:42',
    unread: 1
  },
  {
    id: 'c2',
    userId: '5',
    name: 'Beatriz',
    image: 'https://picsum.photos/400/600?random=5',
    lastMessage: 'Ainda vamos sair na sexta?',
    timestamp: 'Ontem',
    unread: 0
  }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: '2', text: 'Oi! Tudo bem?', timestamp: '10:30', isMe: false, variant: 'icebreaker' },
  { id: 'm2', senderId: 'me', text: 'Tudo ótimo, só trabalhando em um app novo.', timestamp: '10:32', isMe: true },
  { id: 'm3', senderId: '2', text: 'Ah legal! Que tipo de app?', timestamp: '10:35', isMe: false },
  { id: 'm4', senderId: 'me', text: 'É um app de relacionamento chamado The Game.', timestamp: '10:40', isMe: true },
  { id: 'm5', senderId: '2', text: 'Haha, isso é muito engraçado! 😂', timestamp: '10:42', isMe: false },
];

export const RANKING_DATA = [
  { id: '1', name: 'Jessica', score: 9.8, image: 'https://picsum.photos/100/100?random=1' },
  { id: '3', name: 'Camila', score: 9.7, image: 'https://picsum.photos/100/100?random=3' },
  { id: '5', name: 'Beatriz', score: 9.5, image: 'https://picsum.photos/100/100?random=5' },
  { id: '2', name: 'Amanda', score: 9.2, image: 'https://picsum.photos/100/100?random=2' },
  { id: '6', name: 'Julia', score: 8.9, image: 'https://picsum.photos/100/100?random=6' },
  { id: '7', name: 'Fernanda', score: 8.8, image: 'https://picsum.photos/100/100?random=7' },
  { id: '4', name: 'Sophia', score: 8.5, image: 'https://picsum.photos/100/100?random=4' },
];

export const MOCK_PAYMENTS: Payment[] = [
    { id: 'p1', date: '24/05/2025', plan: 'Plano Mensal', amount: 'R$ 19,90', status: 'Pago', cardLast4: '4242' },
    { id: 'p2', date: '24/04/2025', plan: 'Plano Mensal', amount: 'R$ 19,90', status: 'Pago', cardLast4: '4242' },
    { id: 'p3', date: '24/03/2025', plan: 'Plano Mensal', amount: 'R$ 19,90', status: 'Falha', cardLast4: '4242' },
];

export const MOCK_REPORTS: ReportTicket[] = [
    {
        id: 'r-4812',
        offenderName: 'Ricardo',
        date: '24/05/2025',
        reason: 'Assédio Verbal / Ofensas',
        description: 'O usuário começou a me ofender após eu dizer que não estava interessada em sair com ele hoje.',
        status: 'Em Análise',
        updates: [
            {
                id: 'u1',
                sender: 'support',
                text: 'Olá. Recebemos sua denúncia e já iniciamos a análise do perfil reportado. Nossa equipe de segurança prioriza casos de assédio.',
                timestamp: '24/05/2025 14:30'
            },
            {
                id: 'u2',
                sender: 'support',
                text: 'Você poderia nos enviar capturas de tela da conversa, se houver? Isso ajuda a acelerar o processo.',
                timestamp: '24/05/2025 14:35'
            },
            {
                id: 'u3',
                sender: 'user',
                text: 'Claro, tenho os prints salvos. Como faço para enviar por aqui?',
                timestamp: '24/05/2025 14:40'
            },
             {
                id: 'u4',
                sender: 'support',
                text: 'Por enquanto, mantenha os arquivos com você. Se necessário, entraremos em contato via email cadastrado para solicitar as evidências.',
                timestamp: '24/05/2025 14:45'
            }
        ]
    }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'match',
    title: 'Novo match com Amanda!',
    description: 'Ela curtiu seu perfil e abriu o chat. Que tal mandar um oi? 😊',
    timestamp: 'Hoje, 09:12'
  },
  {
    id: 'n2',
    type: 'message',
    title: 'Camila enviou uma mensagem',
    description: '"Curti demais suas fotos na praia, bora marcar algo?"',
    timestamp: 'Ontem, 22:47'
  },
  {
    id: 'n3',
    type: 'superlike',
    title: 'Você recebeu um Superlike',
    description: 'Beatriz destacou você no ranking dela. Abra para descobrir mais.',
    timestamp: 'Ontem, 18:05'
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Lembrete de perfil',
    description: 'Adicione mais fotos para aumentar suas chances de match em 40%.',
    timestamp: '02/12, 11:30',
    seen: true
  }
];
