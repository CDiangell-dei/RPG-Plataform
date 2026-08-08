export type ItemCategory = '0' | 'I' | 'II' | 'III' | 'IV';

export interface BaseItem {
  id: string;
  name: string;
  spaces: number;
  category: ItemCategory;
  description: string;
}

export interface Weapon extends BaseItem {
  type: 'weapon';
  weaponType: 'Simples' | 'Marcial' | 'Exótica';
  grip: 'Leve' | 'Uma Mão' | 'Duas Mãos';
  damage: string;
  critical: string;
  damageType: 'Corte' | 'Perfuração' | 'Impacto' | 'Balístico' | 'Paranormal';
  range?: 'Curto' | 'Médio' | 'Longo' | 'Extremo';
}

export interface Armor extends BaseItem {
  type: 'armor';
  armorType: 'Leve' | 'Pesada' | 'Escudo';
  defenseBonus: number;
  penalty: number;
}

export const WEAPONS: Weapon[] = [
  // Armas Simples
  { id: 'wp_adaga', type: 'weapon', name: 'Adaga', weaponType: 'Simples', grip: 'Leve', damage: '1d4', critical: '19/x2', damageType: 'Perfuração', spaces: 1, category: 'I', range: 'Curto', description: 'Uma faca de combate ágil. Pode ser arremessada.' },
  { id: 'wp_espada_curta', type: 'weapon', name: 'Espada Curta', weaponType: 'Simples', grip: 'Leve', damage: '1d6', critical: '19/x2', damageType: 'Corte', spaces: 1, category: 'I', description: 'Uma lâmina curta comum entre guardas e batedores.' },
  { id: 'wp_lanca', type: 'weapon', name: 'Lança', weaponType: 'Simples', grip: 'Uma Mão', damage: '1d6', critical: 'x2', damageType: 'Perfuração', spaces: 1, category: 'I', range: 'Curto', description: 'Haste de madeira com ponta de metal. Pode ser arremessada.' },
  { id: 'wp_maca', type: 'weapon', name: 'Maça', weaponType: 'Simples', grip: 'Uma Mão', damage: '1d8', critical: 'x2', damageType: 'Impacto', spaces: 1, category: 'I', description: 'Cabo de madeira ou ferro com uma cabeça pesada.' },
  { id: 'wp_arco_curto', type: 'weapon', name: 'Arco Curto', weaponType: 'Simples', grip: 'Duas Mãos', damage: '1d6', critical: 'x3', damageType: 'Perfuração', spaces: 2, category: 'I', range: 'Médio', description: 'Arco simples de caça. Exige uso de flechas.' },
  { id: 'wp_besta_leve', type: 'weapon', name: 'Besta Leve', weaponType: 'Simples', grip: 'Duas Mãos', damage: '1d8', critical: '19/x2', damageType: 'Perfuração', spaces: 2, category: 'I', range: 'Médio', description: 'Arma de disparo por gatilho. Recarga exige ação de movimento.' },
  
  // Armas Marciais
  { id: 'wp_espada_longa', type: 'weapon', name: 'Espada Longa', weaponType: 'Marcial', grip: 'Uma Mão', damage: '1d8', critical: '19/x2', damageType: 'Corte', spaces: 1, category: 'II', description: 'Arma padrão de cavaleiros e soldados treinados.' },
  { id: 'wp_machado_batalha', type: 'weapon', name: 'Machado de Batalha', weaponType: 'Marcial', grip: 'Uma Mão', damage: '1d8', critical: 'x3', damageType: 'Corte', spaces: 1, category: 'II', description: 'Machado robusto, devasta escudos e ossos.' },
  { id: 'wp_montante', type: 'weapon', name: 'Montante (Espadão)', weaponType: 'Marcial', grip: 'Duas Mãos', damage: '2d6', critical: '19/x2', damageType: 'Corte', spaces: 2, category: 'II', description: 'Espada gigantesca que exige as duas mãos e força extrema.' },
  { id: 'wp_alabarda', type: 'weapon', name: 'Alabarda', weaponType: 'Marcial', grip: 'Duas Mãos', damage: '1d10', critical: 'x3', damageType: 'Corte', spaces: 2, category: 'II', description: 'Arma de haste longa, permite atingir inimigos mais longe.' },
  { id: 'wp_arco_longo', type: 'weapon', name: 'Arco Longo', weaponType: 'Marcial', grip: 'Duas Mãos', damage: '1d8', critical: 'x3', damageType: 'Perfuração', spaces: 2, category: 'II', range: 'Longo', description: 'Arco grande de guerra, exige força para puxar a corda.' },
  { id: 'wp_besta_pesada', type: 'weapon', name: 'Besta Pesada', weaponType: 'Marcial', grip: 'Duas Mãos', damage: '1d12', critical: '19/x2', damageType: 'Perfuração', spaces: 2, category: 'II', range: 'Médio', description: 'Atira virotes devastadores. Recarga exige ação padrão.' },

  // Armas Exóticas
  { id: 'wp_mosquete', type: 'weapon', name: 'Mosquete de Pólvora Negra', weaponType: 'Exótica', grip: 'Duas Mãos', damage: '2d8', critical: '19/x3', damageType: 'Balístico', spaces: 2, category: 'III', range: 'Médio', description: 'Tecnologia brutal e rara. Barulhenta e atrai o Flagelo.' },
  { id: 'wp_foice_medo', type: 'weapon', name: 'Foice do Cultista', weaponType: 'Exótica', grip: 'Duas Mãos', damage: '1d10', critical: '18/x2', damageType: 'Corte', spaces: 2, category: 'III', description: 'Forjada em rituais sombrios. Adiciona +1d6 dano de Medo.' }
];

export const ARMORS: Armor[] = [
  { id: 'ar_gibao', type: 'armor', name: 'Gibão de Couro', armorType: 'Leve', defenseBonus: 2, penalty: 0, spaces: 2, category: 'I', description: 'Roupa grossa de couro fervido.' },
  { id: 'ar_brunea', type: 'armor', name: 'Brunea (Couro Batido)', armorType: 'Leve', defenseBonus: 3, penalty: -1, spaces: 2, category: 'I', description: 'Couro reforçado com anéis e cravos de metal.' },
  { id: 'ar_cota_malha', type: 'armor', name: 'Cota de Malha', armorType: 'Pesada', defenseBonus: 5, penalty: -2, spaces: 3, category: 'II', description: 'Malha de anéis de aço que protege contra cortes.' },
  { id: 'ar_placas', type: 'armor', name: 'Armadura de Placas', armorType: 'Pesada', defenseBonus: 10, penalty: -5, spaces: 5, category: 'III', description: 'Traje completo de aço forjado. Exige treinamento marcial pesado.' },
  { id: 'ar_escudo_leve', type: 'armor', name: 'Escudo Leve (Broquel)', armorType: 'Escudo', defenseBonus: 1, penalty: 0, spaces: 1, category: 'I', description: 'Pequeno escudo de madeira presa ao antebraço.' },
  { id: 'ar_escudo_pesado', type: 'armor', name: 'Escudo Pesado', armorType: 'Escudo', defenseBonus: 2, penalty: -2, spaces: 2, category: 'II', description: 'Escudo grande de aço ou carvalho.' },
];
