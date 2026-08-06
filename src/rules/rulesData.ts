export interface Origin {
  name: string;
  skills: string[];
  description: string;
  benefitName: string;
  benefitDescription: string;
}

export interface ClassOption {
  name: string;
  subclasses: string[];
  hpBase: number;
  hpPerLevel: number;
  spBase: number;
  spPerLevel: number;
  mpBase: number; // Mana/PE
  mpPerLevel: number;
  description: string;
}

export interface Skill {
  name: string;
  attribute: 'agility' | 'intellect' | 'vigor' | 'presence' | 'strength';
  description: string;
}

export const ATTRIBUTES = {
  agility: { name: 'Agilidade', short: 'AGI', desc: 'Velocidade, coordenação motora, reflexos e destreza manual.' },
  intellect: { name: 'Intelecto', short: 'INT', desc: 'Raciocínio, memória, instrução, lógica e percepção mental.' },
  vigor: { name: 'Vigor', short: 'VIG', desc: 'Saúde, resistência física, força vital e constituição.' },
  presence: { name: 'Presença', short: 'PRE', desc: 'Força de vontade, carisma, percepção social e magnetismo pessoal.' },
  strength: { name: 'Força', short: 'FOR', desc: 'Poder físico, capacidade muscular e aplicação de força bruta.' }
};

export const SKILLS: Record<string, Skill> = {
  Acrobacia: { name: 'Acrobacia', attribute: 'agility', description: 'Equilíbrio, saltos, amortecimento de quedas e contorcionismo.' },
  Adestramento: { name: 'Adestramento', attribute: 'presence', description: 'Treinar, acalmar ou comandar animais e criaturas domesticáveis.' },
  Bardo: { name: 'Bardo', attribute: 'presence', description: 'Performance artística, música, poesia e inspiração para aliados.' },
  Atletismo: { name: 'Atletismo', attribute: 'strength', description: 'Correr, nadar, escalar e aplicar esforço físico bruto.' },
  Heráldica: { name: 'Heráldica', attribute: 'intellect', description: 'Conhecimento da nobreza, linhagens, brasões e política feudal.' },
  Erudição: { name: 'Erudição', attribute: 'intellect', description: 'Estudo de línguas antigas, textos sagrados, história e leis naturais.' },
  Ladinagem: { name: 'Ladinagem', attribute: 'agility', description: 'Furtar bolsas, arrombar trancas de madeira e agir sorrateiramente.' },
  Diplomacia: { name: 'Diplomacia', attribute: 'presence', description: 'Negociação, oratória fina e persuasão pacífica.' },
  Enganação: { name: 'Enganação', attribute: 'presence', description: 'Mentiras, disfarces, falsificação de documentos e blefes.' },
  Fortitude: { name: 'Fortitude', attribute: 'vigor', description: 'Resistência a fadiga, venenos, doenças e impactos brutais.' },
  Furtividade: { name: 'Furtividade', attribute: 'agility', description: 'Mover-se sem fazer ruído e ocultar-se nas sombras do cenário.' },
  Iniciativa: { name: 'Iniciativa', attribute: 'agility', description: 'Velocidade de reação para definir a ordem de ação em combate.' },
  Intimidação: { name: 'Intimidação', attribute: 'presence', description: 'Forçar obediência ou extrair confissões por ameaça física/psicológica.' },
  Intuição: { name: 'Intuição', attribute: 'presence', description: 'Perceber mentiras, intenções ocultas e prever reações sociais.' },
  Investigação: { name: 'Investigação', attribute: 'intellect', description: 'Encontrar pistas ocultas e analisar cenas de crime ou mistérios.' },
  Luta: { name: 'Luta', attribute: 'strength', description: 'Combate corpo a corpo usando espadas, machados, escudos ou punhos.' },
  Medicina: { name: 'Medicina', attribute: 'intellect', description: 'Tratar ferimentos, estancar sangramentos e curar enfermidades ou infecções.' },
  Navegação: { name: 'Navegação', attribute: 'agility', description: 'Manejar cavalos, carruagens, botes, navios e ler mapas e bússolas.' },
  Ocultismo: { name: 'Ocultismo', attribute: 'intellect', description: 'Decifrar símbolos paranormais, rituais e entender o Egrégora.' },
  Percepção: { name: 'Percepção', attribute: 'presence', description: 'Notar detalhes visuais e auditivos sutis no ambiente.' },
  Pontaria: { name: 'Pontaria', attribute: 'agility', description: 'Ataques à distância com balestras, arcos ou arremessos.' },
  Profissão: { name: 'Profissão', attribute: 'intellect', description: 'Ofício de carpintaria, culinária, ferreiro ou alquimia.' },
  Reflexos: { name: 'Reflexos', attribute: 'agility', description: 'Esquivar-se de armadilhas, desmoronamentos e projéteis rápidos.' },
  Religião: { name: 'Religião', attribute: 'presence', description: 'Doutrinas eclesiásticas, orações de expurgo e ritos de fé.' },
  Sobrevivência: { name: 'Sobrevivência', attribute: 'intellect', description: 'Caçar, rastrear, acampar e resistir a climas severos (frio/neve).' },
  Tática: { name: 'Tática', attribute: 'intellect', description: 'Análise militar de terreno, posicionamento estratégico de combate.' },
  Engenhosidade: { name: 'Engenhosidade', attribute: 'intellect', description: 'Uso de engrenagens, catapultas, moinhos, polias e fechaduras complexas.' },
  Vontade: { name: 'Vontade', attribute: 'presence', description: 'Resistência mental contra medo, pavor e a influência do Egrégora.' }
};

export const ORIGINS: Record<string, Origin> = {
  'Recruta Forçado': {
    name: 'Recruta Forçado',
    skills: ['Fortitude', 'Luta'],
    description: 'Você era um camponês ou aprendiz que foi arrancado de sua vida pelo Bellum. Serviu na infantaria e viu os horrores da guerra de perto.',
    benefitName: 'Cicatrizes de Batalha',
    benefitDescription: 'Você recebe +2 em Defesa quando estiver usando uma proteção (escudo ou armadura).'
  },
  'Médico de Peste': {
    name: 'Médico de Peste',
    skills: ['Medicina', 'Intuição'],
    description: 'Em um mundo assolado pelo Flagelo e por pestes, você tratava os enfermos com máscara de bico e ervas. Você não teme cadáveres.',
    benefitName: 'Imunidade de Rebanho',
    benefitDescription: 'Bônus de +5 em testes de Fortitude contra doenças e venenos. Além disso, não perde Sanidade ao encontrar cadáveres comuns.'
  },
  'Inquisidor / Zelador da Fé': {
    name: 'Inquisidor / Zelador da Fé',
    skills: ['Religião', 'Vontade'],
    description: 'Você serviu a uma igreja que busca expurgar o paranormal. Para você, o Egrégora é um pecado abominável.',
    benefitName: 'Palavras de Conforto',
    benefitDescription: 'Uma vez por cena, gaste uma ação padrão para encorajar um aliado. Ele recupera 1d4 de Sanidade ao ouvir sua fé.'
  },
  'Nobre Decadente': {
    name: 'Nobre Decadente',
    skills: ['Diplomacia', 'Heráldica'],
    description: 'Sua família tinha terras que foram devoradas pelo Bellum. Você reteve as maneiras da corte, mas não o castelo.',
    benefitName: 'Língua de Prata',
    benefitDescription: 'Você recebe +5 em testes de Diplomacia com outros nobres e clérigos, e começa com uma Moeda de Prata Real.'
  },
  'Mercador de Estrada': {
    name: 'Mercador de Estrada',
    skills: ['Sobrevivência', 'Enganação'],
    description: 'Você passou a vida viajando e vendendo recursos sob ameaça de bandoleiros e Flagelos.',
    benefitName: 'Olho para o Lucro',
    benefitDescription: 'Você vende tesouros com +10% de lucro. Recebe +5 em testes de Sobrevivência para encontrar comida em viagens.'
  },
  'Sobrevivente de Vilarejo': {
    name: 'Sobrevivente de Vilarejo',
    skills: ['Furtividade', 'Percepção'],
    description: 'Sua vila foi consumida pelo Flagelo. Você foi um dos únicos sobreviventes que escaparam da loucura total.',
    benefitName: 'Instinto de Presa',
    benefitDescription: 'Quando sofrer dano de um Flagelo pela primeira vez no combate, sua velocidade aumenta em +3 metros por 2 rodadas.'
  },
  'Alquimista Herético': {
    name: 'Alquimista Herético',
    skills: ['Profissão', 'Ocultismo'],
    description: 'Você estudou segredos da natureza e misturas proibidas. A igreja o chama de bruxo; seus aliados o chamam de salvação.',
    benefitName: 'Mistura Instável',
    benefitDescription: 'Começa o jogo com 2 itens alquímicos simples (Bálsamo Curativo ou Bomba de Fumaça) e os fabrica por metade do preço.'
  },
  'Acólito': {
    name: 'Acólito',
    skills: ['Religião', 'Medicina'],
    description: 'Dedicou seus anos formativos à igreja. Conhece textos antigos e liturgia eclesiástica.',
    benefitName: 'Membro da Igreja',
    benefitDescription: 'Você tem abrigo e refeições em templos de sua fé. Recebe +2 em testes de Vontade (Vontade de Ferro).'
  },
  'Adestrador': {
    name: 'Adestrador',
    skills: ['Adestramento', 'Navegação'],
    description: 'Você cresceu em estábulos e canis, tendo facilidade em se comunicar com bestas de carga ou cães de guerra.',
    benefitName: 'Amigo Especial',
    benefitDescription: 'Você começa com um animal fiel (Cão de Guarda ou Cavalo) que não ocupa espaços no seu inventário.'
  },
  'Aristocrata': {
    name: 'Aristocrata',
    skills: ['Diplomacia', 'Heráldica'],
    description: 'Você nasceu cercado por riquezas e linhagens. Sua autoridade e seu nome abrem portas e comandam plebeus.',
    benefitName: 'Sangue Azul',
    benefitDescription: 'Você recebe o poder Comandar (ação para conceder ação a aliado) e sua palavra tem peso legal em terras aliadas.'
  },
  'Aprendiz Alquimista': {
    name: 'Aprendiz Alquimista',
    skills: ['Profissão', 'Ocultismo'],
    description: 'Exposto a resíduos do paranormal em porões úmidos ao misturar substâncias para seu antigo mestre.',
    benefitName: 'Mutações do Flagelo',
    benefitDescription: 'Devido à exposição, você recebe um Poder Paranormal inicial de nível 0 concedido pelo Mestre.'
  },
  'Batedor': {
    name: 'Batedor',
    skills: ['Furtividade', 'Sobrevivência'],
    description: 'Mestre em rastreamento militar. Treinado para cruzar florestas e pântanos prevendo emboscadas inimigas.',
    benefitName: 'À Prova de Tudo',
    benefitDescription: 'Você ignora penalidades de movimento causadas por terrenos difíceis (lama, neve ou mato fechado).'
  },
  'Braço Forte': {
    name: 'Braço Forte',
    skills: ['Luta', 'Intimidação'],
    description: 'Defensor de caravanas ou cobrador de taverna. Você aprendeu a bater primeiro e perguntar depois.',
    benefitName: 'Confissão Inevitável',
    benefitDescription: 'Você recebe +5 em testes de Intimidação para extrair informações de prisioneiros ou suspeitos.'
  },
  'Camponês': {
    name: 'Camponês',
    skills: ['Adestramento', 'Sobrevivência'],
    description: 'O trabalhador da terra. Possui resistência calejada e sabe como esticar as provisões sob a miséria do Bellum.',
    benefitName: 'Água no Feijão',
    benefitDescription: 'Durante acampamentos, você pode preparar 1 unidade de ração alimentar para alimentar duas pessoas.'
  },
  'Curandeiro': {
    name: 'Curandeiro',
    skills: ['Medicina', 'Vontade'],
    description: 'O médico prático das vilas. Cauteriza ferimentos e fecha cortes com agulha e ervas sem apelar a rituais.',
    benefitName: 'Médico de Campo',
    benefitDescription: 'Ao realizar testes de Medicina para curar aliados no descanso, você cura +1d6 PV adicionais.'
  },
  'Erudito': {
    name: 'Erudito',
    skills: ['Erudição', 'Heráldica'],
    description: 'Um dos raros alfabetizados do reino. Frequentou bibliotecas antigas e conhece estratégias históricas.',
    benefitName: 'Palpite Fundamentado',
    benefitDescription: 'Você pode realizar qualquer teste de Intelecto usando a perícia Erudição.'
  },
  'Estrangeiro': {
    name: 'Estrangeiro',
    skills: ['Sobrevivência', 'Erudição'],
    description: 'Você veio de terras distantes além do mar ou de desertos. Traz costumes e perspectivas exóticas.',
    benefitName: 'Cultura Exótica',
    benefitDescription: 'Você possui um item de sua terra natal e recebe +5 em interações sociais com outros estrangeiros.'
  },
  'Fora Da Lei': {
    name: 'Fora Da Lei',
    skills: ['Furtividade', 'Ladinagem'],
    description: 'O reino falhou com você. Sobreviveu nos becos úmidos assaltando carruagens de nobres ou roubando feiras.',
    benefitName: 'Punguista veloz',
    benefitDescription: 'Uma vez por cena, você pode tentar bater a carteira de alguém como uma Ação Livre.'
  },
  'Herdeiro': {
    name: 'Herdeiro',
    skills: ['Heráldica', 'Profissão'],
    description: 'Você carrega um legado familiar importante (uma arma ancestral ou título perdido).',
    benefitName: 'Herança Importante',
    benefitDescription: 'Você começa o jogo com um item de Categoria II (como uma Espada de Aço excelente ou um Cavalo de Guerra).'
  },
  'Mercador': {
    name: 'Mercador',
    skills: ['Diplomacia', 'Intuição'],
    description: 'Dono de tendas e balcões de troca. Você conhece o valor de cada moeda de cobre nas transações.',
    benefitName: 'Negociação Feudal',
    benefitDescription: 'Compra qualquer item de tabela com 10% de desconto e vende tesouros com bônus de 10%.'
  },
  'Refugiado': {
    name: 'Refugiado',
    skills: ['Reflexos', 'Vontade'],
    description: 'Sua província foi arrasada e você caminhou quilômetros sem nada. Sua mente aprendeu a resistir à ruína.',
    benefitName: 'Mente Estoica',
    benefitDescription: 'Sua mente calejada lhe confere Resistência a Dano Mental 2 contra efeitos do Egrégora.'
  },
  'Soldado Do Bellum': {
    name: 'Soldado Do Bellum',
    skills: ['Tática', 'Luta'],
    description: 'Militar de carreira de um dos exércitos reais. Acostumado com a rigidez das marchas e batalhas campais.',
    benefitName: 'Influência Militar',
    benefitDescription: 'Você possui patente. Guardas e recrutas de nível baixo acatam ordens simples desde que não corram perigo.'
  },
  'Sobrevivente': {
    name: 'Sobrevivente',
    skills: ['Percepção', 'Furtividade'],
    description: 'Você presenciou um ataque devastador de criaturas paranormais e seu instinto de vida foi aguçado a níveis extremos.',
    benefitName: 'Sentidos de Alerta',
    benefitDescription: 'Você nunca pode ser surpreendido no início do combate por criaturas do Flagelo.'
  },
  'Taverneiro': {
    name: 'Taverneiro',
    skills: ['Diplomacia', 'Profissão'],
    description: 'Dono de hospedaria. Ouviu boatos nas mesas e aprendeu a apaziguar ânimos com boa comida e bebida.',
    benefitName: 'Gororoba de Descanso',
    benefitDescription: 'Ao preparar comida no acampamento, todos os aliados recebem +2 PV temporários no dia seguinte.'
  }
};

export const CLASSES: Record<string, ClassOption> = {
  'Combatente': {
    name: 'Combatente',
    description: 'O braço armado da Seita. Focado em força, táticas e resistir aos golpes físicos do Flagelo.',
    subclasses: ['Executor', 'Marechal de Ferro', 'Pugilista de Sangue', 'Espreitador de Guerra', 'Muralha Viva'],
    hpBase: 20,
    hpPerLevel: 4,
    spBase: 12,
    spPerLevel: 3,
    mpBase: 3,
    mpPerLevel: 3
  },
  'Especialista': {
    name: 'Especialista',
    description: 'O artífice da sobrevivência. Focado em perícias, medicina, engenhosidade e táticas indiretas.',
    subclasses: ['Besteiro de Elite', 'Infiltrador de Guilda', 'Boticário de Campo', 'Diplomata das Coroas', 'Artífice de Guerra'],
    hpBase: 16,
    hpPerLevel: 3,
    spBase: 16,
    spPerLevel: 4,
    mpBase: 4,
    mpPerLevel: 4
  },
  'Ocultista': {
    name: 'Ocultista',
    description: 'O canalizador do paranormal. Conjura rituais do Egrégora sacrificando sua própria sanidade.',
    subclasses: ['Teurgo', 'Flagelado'],
    hpBase: 12,
    hpPerLevel: 2,
    spBase: 20,
    spPerLevel: 5,
    mpBase: 5,
    mpPerLevel: 5
  }
};

export const DICE_LOG_ACTIONS = {
  DADO_ROLADO: 'DADO_ROLADO',
  STATUS_ALTERADO: 'STATUS_ALTERADO',
  CONJURACAO: 'CONJURACAO',
  ITEM_ADICIONADO: 'ITEM_ADICIONADO',
  DINHEIRO_ALTERADO: 'DINHEIRO_ALTERADO',
  XP_ALTERADO: 'XP_ALTERADO'
};

// Core Dice Roller logic for Ordem Paranormal rules
// Number of dice = attribute (if 0, roll 2 and take lowest)
// Result = highest die + flat bonus (like training)
export function rollOrdemTest(attributeVal: number, bonus: number = 0): {
  rolls: number[];
  finalResult: number;
  notation: string;
} {
  const rolls: number[] = [];
  let finalResult = 0;
  let notation = '';

  if (attributeVal <= 0) {
    // Attribute 0: roll 2d20, keep lowest
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    rolls.push(r1, r2);
    const chosen = Math.min(r1, r2);
    finalResult = chosen + bonus;
    notation = `2d20 (desvantagem de atributo 0, escolhendo menor: ${chosen}) + ${bonus}`;
  } else {
    // Attribute > 0: roll Xd20, keep highest
    for (let i = 0; i < attributeVal; i++) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
    }
    const chosen = Math.max(...rolls);
    finalResult = chosen + bonus;
    notation = `${attributeVal}d20 (escolhendo maior: ${chosen}) + ${bonus}`;
  }

  return { rolls, finalResult, notation };
}
