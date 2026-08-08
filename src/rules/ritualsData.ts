export type RitualElement = 'Sangue' | 'Morte' | 'Conhecimento' | 'Energia' | 'Medo';

export interface Ritual {
  id: string;
  name: string;
  element: RitualElement;
  circle: 1 | 2 | 3 | 4;
  execution: 'Ação Padrão' | 'Ação de Movimento' | 'Ação Livre' | 'Reação';
  range: 'Toque' | 'Curto' | 'Médio' | 'Longo' | 'Pessoal';
  target: string;
  duration: string;
  cost: number; // Cost in PE (Pontos de Esforço / Mana)
  description: string;
}

export const RITUALS: Ritual[] = [
  // 1º Círculo
  {
    id: 'rit_cauterizacao',
    name: 'Cauterização Sanguínea',
    element: 'Sangue',
    circle: 1,
    execution: 'Ação Padrão',
    range: 'Toque',
    target: '1 ser',
    duration: 'Instantânea',
    cost: 1,
    description: 'Você acelera violentamente o metabolismo do alvo através do sangue. Cura 2d8+2 PV, mas a dor do processo deixa o alvo ofegante.'
  },
  {
    id: 'rit_toque_podridao',
    name: 'Toque da Podridão',
    element: 'Morte',
    circle: 1,
    execution: 'Ação Padrão',
    range: 'Toque',
    target: '1 ser',
    duration: 'Instantânea',
    cost: 1,
    description: 'Sua mão apodrece tudo que toca. Você faz um ataque corpo a corpo. Se acertar, causa 2d8+2 pontos de dano de Morte. A carne do alvo escurece e necrosa temporariamente.'
  },
  {
    id: 'rit_centelha',
    name: 'Centelha Caótica',
    element: 'Energia',
    circle: 1,
    execution: 'Ação Padrão',
    range: 'Curto',
    target: '1 ser',
    duration: 'Instantânea',
    cost: 1,
    description: 'Canaliza as forças instáveis da natureza, disparando um arco de pura energia que causa 3d6 pontos de dano de Energia.'
  },
  {
    id: 'rit_sussurros',
    name: 'Sussurros dos Antigos',
    element: 'Conhecimento',
    circle: 1,
    execution: 'Ação Padrão',
    range: 'Pessoal',
    target: 'Você',
    duration: 'Cena',
    cost: 1,
    description: 'Vozes espectrais sussurram os significados do mundo para você. Você ganha +5 em testes de Erudição, Investigação e Intuição, e compreende línguas desconhecidas.'
  },
  {
    id: 'rit_lamina_sedenta',
    name: 'Lâmina Sedenta',
    element: 'Sangue',
    circle: 1,
    execution: 'Ação Padrão',
    range: 'Toque',
    target: '1 arma corpo a corpo',
    duration: 'Cena',
    cost: 1,
    description: 'A arma banhada no poder do sangue causa +1 dado de dano do mesmo tipo e pulsa como um coração.'
  },
  {
    id: 'rit_encantar_lamina',
    name: 'Encantar Lâmina',
    element: 'Conhecimento', // Can be any, but defining base
    circle: 1,
    execution: 'Ação Padrão',
    range: 'Toque',
    target: '1 arma',
    duration: 'Cena',
    cost: 1,
    description: 'Você imbuí uma arma com a energia de uma Entidade. A arma causa +1d6 de dano do elemento escolhido (Sangue, Morte, Energia ou Conhecimento).'
  },
  {
    id: 'rit_furia',
    name: 'Fúria do Bellum',
    element: 'Sangue',
    circle: 1,
    execution: 'Ação Padrão',
    range: 'Curto',
    target: '1 ser',
    duration: 'Cena',
    cost: 2,
    description: 'Você inflama a agressividade natural do alvo. Ele recebe +2 em testes de ataque e dano corpo a corpo, mas não pode usar habilidades que exijam concentração (como rituais) e sempre atacará o inimigo mais próximo.'
  }
];
