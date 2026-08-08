export type PowerType = 'Combate' | 'Especialista' | 'Ocultista' | 'Paranormal' | 'Geral';

export interface Power {
  id: string;
  name: string;
  type: PowerType;
  element?: 'Sangue' | 'Morte' | 'Conhecimento' | 'Energia' | 'Medo';
  prerequisites?: string;
  description: string;
}

export const POWERS: Power[] = [
  // Combate (Base Tormenta/Beligerante)
  {
    id: 'pw_ataque_poderoso',
    name: 'Ataque Poderoso',
    type: 'Combate',
    prerequisites: 'Força 2',
    description: 'Antes de atacar corpo a corpo, você pode gastar 1 PE. Se fizer isso, sofre -2 no teste de ataque, mas recebe +5 na rolagem de dano.'
  },
  {
    id: 'pw_estilo_duas_armas',
    name: 'Estilo de Duas Armas',
    type: 'Combate',
    prerequisites: 'Agilidade 2',
    description: 'Se estiver empunhando duas armas (uma em cada mão, e uma delas deve ser Leve), você pode gastar 1 PE para desferir um ataque adicional com a segunda arma.'
  },
  {
    id: 'pw_reflexos_combate',
    name: 'Reflexos de Combate',
    type: 'Combate',
    prerequisites: 'Agilidade 2',
    description: 'Você tem olhos nas costas. Você ganha uma Ação de Movimento extra no seu primeiro turno do combate.'
  },
  {
    id: 'pw_golpe_demolidor',
    name: 'Golpe Demolidor',
    type: 'Combate',
    prerequisites: 'Combate com Armas de Duas Mãos',
    description: 'Ao usar uma arma de duas mãos (como um Montante), o multiplicador de crítico da sua arma aumenta em +1.'
  },

  // Especialista (Artífice/Sobrevivência)
  {
    id: 'pw_mochila_utilidades',
    name: 'Mochila de Utilidades',
    type: 'Especialista',
    description: 'Você sabe como empacotar perfeitamente seus suprimentos. A Categoria de um tipo de item (como Poções Alquímicas ou Munição) é reduzida em I, e seu custo de Espaço é reduzido pela metade.'
  },
  {
    id: 'pw_engenhosidade',
    name: 'Engenhosidade',
    type: 'Especialista',
    description: 'Você pode gastar 2 PE para adicionar seu Intelecto em qualquer teste de perícia que não o possua, explicando como você usa a lógica para superar o desafio.'
  },
  
  // Paranormais (Mutações do Flagelo)
  {
    id: 'pw_sangue_ferro',
    name: 'Sangue de Ferro',
    type: 'Paranormal',
    element: 'Sangue',
    description: 'O Egrégora alterou sua fisiologia. Você recebe +3 PV máximos. A cada nível ímpar, você ganha +1 PV máximo adicional.'
  },
  {
    id: 'pw_visao_escuro',
    name: 'Olhos da Podridão (Visão no Escuro)',
    type: 'Paranormal',
    element: 'Morte',
    description: 'Seus olhos tornaram-se completamente pretos. Você enxerga no escuro total, mas sofre -2 em testes de Percepção em ambientes muito iluminados.'
  },
  {
    id: 'pw_mente_fragmentada',
    name: 'Mente Fragmentada',
    type: 'Paranormal',
    element: 'Conhecimento',
    description: 'Vozes falam com você. Você pode gastar 1 PE para fazer uma pergunta ao Mestre sobre a cena, mas perde 1 ponto de Sanidade.'
  }
];
