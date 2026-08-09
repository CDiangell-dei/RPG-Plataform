import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { 
  ATTRIBUTES, 
  SKILLS, 
  ORIGINS, 
  CLASSES, 
  rollOrdemTest, 
  DICE_LOG_ACTIONS 
} from './rules/rulesData';
import { WEAPONS, ARMORS } from './rules/itemsData';
import { RITUALS } from './rules/ritualsData';
import { POWERS } from './rules/powersData';
import { CharacterCreator } from './components/CharacterCreator';
import { AttributesModal } from './components/AttributesModal';

// Types
interface InventoryItem {
  id: string;
  name: string;
  spaces: number;
  desc: string;
}

export interface SkillData {
  name: string;
  training: 'none' | 'trained' | 'veteran' | 'expert';
}

interface RitualData {
  id: string;
  name: string;
  element: 'Sangue' | 'Morte' | 'Conhecimento' | 'Energia' | 'Medo';
  cost: number; // Cost in SP
  desc: string;
}

export interface Modifier {
  id: string;
  name: string;
  target: 'hp_max' | 'sp_max' | 'mp_max' | 'agility' | 'intellect' | 'vigor' | 'presence' | 'strength';
  type: 'flat' | 'per_level' | 'per_odd_level' | 'per_even_level';
  value: number;
  isActive: boolean;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  origin: string;
  class: string;
  level: number;
  nex: number;
  agility: number;
  intellect: number;
  vigor: number;
  presence: number;
  strength: number;
  hp_max: number;
  hp_current: number;
  sp_max: number;
  sp_current: number;
  mp_max: number;
  mp_current: number;
  cobre: number;
  prata: number;
  ouro: number;
  platina: number;
  platina_real: number;
  inventory: InventoryItem[];
  skills: SkillData[];
  rituals: RitualData[];
  modifiers: Modifier[];
  notes: string;
}

interface DbLog {
  id: string;
  created_at: string;
  action_type: string;
  description: string;
}

export const getEffectiveAttribute = (char: Character, attrName: 'agility' | 'intellect' | 'vigor' | 'presence' | 'strength') => {
  const baseValue = char[attrName];
  if (!char.modifiers) return baseValue;
  
  const activeMods = char.modifiers.filter(m => m.isActive && m.target === attrName);
  let eff = baseValue;
  activeMods.forEach(m => {
    if (m.type === 'flat') eff += m.value;
    else if (m.type === 'per_level') eff += (m.value * char.level);
    else if (m.type === 'per_odd_level') eff += (m.value * Math.ceil(char.level / 2));
    else if (m.type === 'per_even_level') eff += (m.value * Math.floor(char.level / 2));
  });
  return eff;
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');

  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeChar, setActiveChar] = useState<Character | null>(null);
  const autoSaveTimerRef = useRef<any>(null);
  const [loadingChars, setLoadingChars] = useState(false);
  const [savingChar, setSavingChar] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  // Tab state for right panelDice roll state
  const [rollResult, setRollResult] = useState<{
    title: string;
    rolls: number[];
    highest: number;
    bonus: number;
    finalResult: number;
    notation: string;
  } | null>(null);

  // Change Logs state
  const [logs, setLogs] = useState<DbLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Compendium open state
  const [compendiumOpen, setCompendiumOpen] = useState(false);
  const [isEditingAttributes, setIsEditingAttributes] = useState(false);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }
      if (!session) {
        setCharacters([]);
        setActiveChar(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch characters when session changes
  const fetchCharacters = useCallback(async () => {
    if (!session?.user) return;
    setLoadingChars(true);
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCharacters(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar personagens:', err.message);
    } finally {
      setLoadingChars(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchCharacters();
    }
  }, [session, fetchCharacters]);

  // Fetch logs when active character changes
  const fetchLogs = useCallback(async (charId: string) => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('character_logs')
        .select('*')
        .eq('character_id', charId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar logs:', err.message);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeChar?.id) {
      fetchLogs(activeChar.id);
    }
  }, [activeChar?.id, fetchLogs]);

  // Helper to add log action
  const addLog = async (charId: string, actionType: string, description: string) => {
    if (!session?.user) return;
    try {
      const newLog = {
        character_id: charId,
        user_id: session.user.id,
        action_type: actionType,
        description
      };
      
      const { data, error } = await supabase
        .from('character_logs')
        .insert(newLog)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        setLogs(prev => [data[0], ...prev]);
      }
    } catch (err: any) {
      console.error('Erro ao criar log:', err.message);
    }
  };

  // Auth triggers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              username: authUsername || authEmail.split('@')[0]
            }
          }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro de autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleResetPassword = async () => {
    if (!authEmail) {
      setAuthError('Digite seu e-mail acima para recuperar a senha.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;
      alert('Se o e-mail existir, um link de recuperação foi enviado para sua caixa de entrada!');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
      if (error) throw error;
      alert('Senha atualizada com sucesso!');
      setIsRecoveringPassword(false);
      setRecoveryPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setAuthLoading(false);
    }
  };

  const createCharacter = () => {
    setShowCreator(true);
  };

  const handleFinishCreator = async (newCharData: Partial<Character>) => {
    if (!session?.user) return;
    setLoadingChars(true);
    setShowCreator(false);
    try {
      const newChar = {
        ...newCharData,
        user_id: session.user.id
      };

      const { data, error } = await supabase
        .from('characters')
        .insert(newChar)
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const created = data[0] as Character;
        setCharacters(prev => [created, ...prev]);
        setActiveChar(created);
        addLog(created.id, 'STATUS_ALTERADO', 'Personagem forjado e pronto para o combate.');
      }
    } catch (err: any) {
      console.error('Erro ao forjar personagem:', err.message);
      alert('Erro ao forjar personagem.');
    } finally {
      setLoadingChars(false);
    }
  };

  // Delete character
  const deleteCharacter = async (charId: string) => {
    if (!window.confirm('Tem certeza que deseja APAGAR esta ficha para sempre? Esta ação não pode ser desfeita.')) return;
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', charId);

      if (error) throw error;
      
      setCharacters(prev => prev.filter(c => c.id !== charId));
      if (activeChar?.id === charId) {
        setActiveChar(null);
      }
    } catch (err: any) {
      console.error('Erro ao apagar ficha:', err.message);
      alert('Erro ao apagar a ficha.');
    }
  };

  // Save character
  const saveCharacter = async (charToSave: Character, isAutoSave: boolean = false) => {
    setSavingChar(true);
    setSaveMessage(null);
    try {
      const { error } = await supabase
        .from('characters')
        .update({
          name: charToSave.name,
          origin: charToSave.origin,
          class: charToSave.class,
          level: charToSave.level,
          nex: charToSave.nex,
          agility: charToSave.agility,
          intellect: charToSave.intellect,
          vigor: charToSave.vigor,
          presence: charToSave.presence,
          strength: charToSave.strength,
          hp_max: charToSave.hp_max,
          hp_current: charToSave.hp_current,
          sp_max: charToSave.sp_max,
          sp_current: charToSave.sp_current,
          mp_max: charToSave.mp_max,
          mp_current: charToSave.mp_current,
          cobre: charToSave.cobre,
          prata: charToSave.prata,
          ouro: charToSave.ouro,
          platina: charToSave.platina,
          platina_real: charToSave.platina_real,
          inventory: charToSave.inventory,
          skills: charToSave.skills,
          rituals: charToSave.rituals,
          notes: charToSave.notes
        })
        .eq('id', charToSave.id);

      if (error) throw error;
      if (!isAutoSave) {
        setSaveMessage('Ficha salva nas brumas do Supabase!');
        setTimeout(() => setSaveMessage(null), 3000);
      }
      fetchCharacters();
    } catch (err: any) {
      console.error('Erro ao salvar ficha:', err.message);
      setSaveMessage('Falha ao salvar a ficha.');
    } finally {
      setSavingChar(false);
    }
  };

  // Update active character fields locally
  const updateActiveChar = (fields: Partial<Character>) => {
    if (!activeChar) return;
    
    let updated = { ...activeChar, ...fields };
    
    // Auto-calculate derived stats if relevant fields changed
    if (fields.vigor !== undefined || fields.presence !== undefined || fields.level !== undefined || fields.class !== undefined || fields.modifiers !== undefined) {
      const classRules = CLASSES[updated.class];
      if (classRules) {
        // Effective attributes
        const effVigor = getEffectiveAttribute(updated as Character, 'vigor');
        const effPresence = getEffectiveAttribute(updated as Character, 'presence');
        const level = updated.level;
        
        // Em Ordem Paranormal, Vigor e Presença multiplicam pelo nível para HP e PE.
        let newHpMax = classRules.hpBase + (classRules.hpPerLevel * (level - 1)) + (effVigor * level);
        let newSpMax = classRules.spBase + (level - 1) * classRules.spPerLevel;
        let newMpMax = classRules.mpBase + (classRules.mpPerLevel * (level - 1)) + (effPresence * level);

        // Modificadores diretos de Recursos
        const activeResourceMods = (updated.modifiers || []).filter(m => m.isActive && ['hp_max', 'sp_max', 'mp_max'].includes(m.target));
        activeResourceMods.forEach(m => {
          let bonus = 0;
          if (m.type === 'flat') bonus = m.value;
          else if (m.type === 'per_level') bonus = (m.value * level);
          else if (m.type === 'per_odd_level') bonus = (m.value * Math.ceil(level / 2));
          else if (m.type === 'per_even_level') bonus = (m.value * Math.floor(level / 2));

          if (m.target === 'hp_max') newHpMax += bonus;
          if (m.target === 'sp_max') newSpMax += bonus;
          if (m.target === 'mp_max') newMpMax += bonus;
        });

        updated = {
          ...updated,
          hp_max: newHpMax,
          hp_current: updated.hp_current > newHpMax ? newHpMax : updated.hp_current,
          sp_max: newSpMax,
          sp_current: updated.sp_current > newSpMax ? newSpMax : updated.sp_current,
          mp_max: newMpMax,
          mp_current: updated.mp_current > newMpMax ? newMpMax : updated.mp_current,
        };
      }
    }

    setActiveChar(updated);

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveCharacter(updated, true);
    }, 2000);
  };

  // Apply Origin Skill training
  const applyOriginTraining = () => {
    if (!activeChar) return;
    const originRules = ORIGINS[activeChar.origin];
    if (!originRules) return;

    const currentSkills = [...activeChar.skills];
    originRules.skills.forEach(skillName => {
      const idx = currentSkills.findIndex(s => s.name === skillName);
      if (idx !== -1) {
        currentSkills[idx].training = 'trained';
      }
    });

    updateActiveChar({ skills: currentSkills });
    addLog(
      activeChar.id,
      DICE_LOG_ACTIONS.STATUS_ALTERADO,
      `Origem modificada para ${activeChar.origin}: Treinamento aplicado em ${originRules.skills.join(' e ')}.`
    );
  };

  // Roll d20 Attribute roll
  const triggerAttributeRoll = (attrKey: 'agility' | 'intellect' | 'vigor' | 'presence' | 'strength', name: string) => {
    if (!activeChar) return;
    const val = getEffectiveAttribute(activeChar, attrKey);
    const { rolls, finalResult, notation } = rollOrdemTest(val, 0);

    setRollResult({
      title: `Teste de ${name}`,
      rolls,
      highest: Math.max(...rolls),
      bonus: 0,
      finalResult,
      notation
    });

    addLog(activeChar.id, DICE_LOG_ACTIONS.DADO_ROLADO, `Rolou Atributo ${name}: Resultado = ${finalResult} (Rolagens: [${rolls.join(', ')}])`);
  };

  // Roll Skill roll
  const triggerSkillRoll = (skillName: string) => {
    if (!activeChar) return;
    const skill = SKILLS[skillName];
    if (!skill) return;

    const attrVal = activeChar[skill.attribute];
    const skillObj = activeChar.skills.find(s => s.name === skillName);
    const training = skillObj?.training || 'none';

    let bonus = 0;
    if (training === 'trained') bonus = 5;
    else if (training === 'veteran') bonus = 10;
    else if (training === 'expert') bonus = 15;

    const { rolls, finalResult, notation } = rollOrdemTest(attrVal, bonus);

    setRollResult({
      title: `Teste de ${skillName} (${training.toUpperCase()})`,
      rolls,
      highest: Math.max(...rolls),
      bonus,
      finalResult,
      notation
    });

    addLog(
      activeChar.id, 
      DICE_LOG_ACTIONS.DADO_ROLADO, 
      `Rolou Perícia ${skillName}: Resultado = ${finalResult} (Bônus: +${bonus}, Rolagens: [${rolls.join(', ')}])`
    );
  };

  // Conjure Ritual (automatic SP depletion & Logging)
  const castRitual = (ritual: RitualData) => {
    if (!activeChar) return;
    
    if (activeChar.sp_current < ritual.cost) {
      alert('Sua mente está cansada demais! Não possui Sanidade suficiente para conjurar este ritual.');
      return;
    }

    const prevSp = activeChar.sp_current;
    const newSp = activeChar.sp_current - ritual.cost;
    
    updateActiveChar({ sp_current: newSp });
    
    addLog(
      activeChar.id,
      DICE_LOG_ACTIONS.CONJURACAO,
      `Conjurou ritual ${ritual.name} (${ritual.element}): Sanidade reduzida de ${prevSp} para ${newSp} (-${ritual.cost} SP).`
    );
  };

  // Add Item to Inventory
  const [newItemName, setNewItemName] = useState('');
  const [newItemSpaces, setNewItemSpaces] = useState(1);
  const [newItemDesc, setNewItemDesc] = useState('');

  const addItemToInventory = () => {
    if (!activeChar || !newItemName) return;
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: newItemName,
      spaces: Number(newItemSpaces),
      desc: newItemDesc
    };
    
    updateActiveChar({
      inventory: [...activeChar.inventory, newItem]
    });

    addLog(activeChar.id, DICE_LOG_ACTIONS.ITEM_ADICIONADO, `Item adicionado ao inventário: ${newItemName} (${newItemSpaces} Espaços)`);
    
    // Clear inputs
    setNewItemName('');
    setNewItemSpaces(1);
    setNewItemDesc('');
  };

  // Remove Item from Inventory
  const removeItemFromInventory = (itemId: string, itemName: string) => {
    if (!activeChar) return;
    updateActiveChar({
      inventory: activeChar.inventory.filter(item => item.id !== itemId)
    });
    addLog(activeChar.id, DICE_LOG_ACTIONS.ITEM_ADICIONADO, `Item removido do inventário: ${itemName}`);
  };

  // Add Custom Ritual
  const [newRitName, setNewRitName] = useState('');
  const [newRitElement, setNewRitElement] = useState<'Sangue' | 'Morte' | 'Conhecimento' | 'Energia' | 'Medo'>('Sangue');
  const [newRitCost, setNewRitCost] = useState(1);
  const [newRitDesc, setNewRitDesc] = useState('');

  const addCustomRitual = () => {
    if (!activeChar || !newRitName) return;
    const newRit: RitualData = {
      id: Date.now().toString(),
      name: newRitName,
      element: newRitElement,
      cost: Number(newRitCost),
      desc: newRitDesc
    };

    updateActiveChar({
      rituals: [...activeChar.rituals, newRit]
    });

    addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `Ritual adicionado: ${newRitName} (Custo: ${newRitCost} SP)`);

    setNewRitName('');
    setNewRitCost(1);
    setNewRitDesc('');
  };

  // Remove Ritual
  const removeRitual = (ritId: string, ritName: string) => {
    if (!activeChar) return;
    updateActiveChar({
      rituals: activeChar.rituals.filter(r => r.id !== ritId)
    });
    addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `Ritual removido: ${ritName}`);
  };

  // Calculate Coin Weight & Total Inventory Weight
  const totalCoins = activeChar ? (
    activeChar.cobre + activeChar.prata + activeChar.ouro + activeChar.platina + activeChar.platina_real
  ) : 0;
  const coinSpaces = Math.floor(totalCoins / 100);

  const inventorySpaces = activeChar ? (
    activeChar.inventory.reduce((sum, item) => sum + item.spaces, 0)
  ) : 0;

  const totalWeight = coinSpaces + inventorySpaces;
  const maxWeight = activeChar ? (5 + getEffectiveAttribute(activeChar, 'strength')) : 5;

  return (
    <div className="app-container">
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid var(--border-muted)' }}>
        <div>
          <h1 style={{ fontSize: '32px', margin: 0, textTransform: 'uppercase' }}>Bellum Egrégora</h1>
          <p style={{ color: 'var(--accent-gold)', fontSize: '13px', fontStyle: 'italic' }}>"O aço mata o soldado, mas o pavor alimenta o monstro"</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setCompendiumOpen(!compendiumOpen)}>
            {compendiumOpen ? 'Fechar Compêndio' : 'Compêndio de Regras'}
          </button>
          {session && (
            <button className="btn-secondary" style={{ borderColor: 'var(--accent-red)', color: 'var(--text-primary)' }} onClick={handleLogout}>
              Sair
            </button>
          )}
        </div>
      </header>

      {/* COMPENDIUM SLIDE OUT */}
      {compendiumOpen && (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px', position: 'relative', border: '1px solid var(--accent-gold)', animation: 'scaleIn 0.3s' }}>
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '15px' }}>Compêndio Bellum Egrégora</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left', fontSize: '14px', lineHeight: '1.6', paddingRight: '10px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '15px 0 8px' }}>História do Mundo</h3>
            <p>No ano de 1202, o mundo não gemia sob as garras de bestas, mas sob o jugo da cobiça humana. Enquanto soberanos digladiavam-se por glória vã, o pavor tornou-se tão denso nas vilas fronteiriças que o ar ficou espesso, com um gosto metálico de sangue e suor frio. Foi nesse solo de desespero absoluto que o Egrégora se banquetou. Ele não atravessou portais vindo de fora; ele brotou das entranhas do sofrimento e do medo humano.</p>
            
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '15px 0 8px' }}>Sistema de Moedas</h3>
            <p>100 Moedas de Cobre (MC) = 1 Moeda de Prata (MP)</p>
            <p>100 Moedas de Prata (MP) = 1 Moeda de Ouro (MO)</p>
            <p>100 Moedas de Ouro (MO) = 1 Moeda de Platina (MPT)</p>
            <p>100 Moedas de Platina (MPT) = 1 Moeda de Platina Real (MPR)</p>
            <p><strong>Carga Monetária:</strong> Cada lote de 100 moedas (de qualquer tipo) ocupa 1 Espaço de carga no inventário.</p>

            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '15px 0 8px' }}>Adaptações de Perícias Medievais</h3>
            <p>• Tecnologia → <strong>Engenhosidade:</strong> Catapultas, fechaduras e polias.</p>
            <p>• Ciências → <strong>Erudição:</strong> Estudo de textos antigos, filosofia.</p>
            <p>• Atualidades → <strong>Heráldica:</strong> Conhecimento de brasões, nobreza e linhagens.</p>
            <p>• Crime → <strong>Ladinagem:</strong> Furtar bolsas, arrombar portas e ação sorrateira.</p>
            <p>• Pilotagem → <strong>Navegação:</strong> Condução de cavalos, carroças e barcos.</p>
            <p>• Artes → <strong>Bardo:</strong> Performances de inspiração nas cenas.</p>

            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '15px 0 8px' }}>Ações e Recursos Universais</h3>
            <p>• <strong>Movimento de Emergência:</strong> Por 2 PE, ganhe 1 Ação de Movimento adicional na rodada.</p>
            <p>• <strong>Surto de Adrenalina:</strong> Gaste PE igual ao seu nível e ganhe 1 Ação Padrão extra (não aplicável para Ocultistas lançando rituais).</p>
            <p>• <strong>Contra-Ataque de Oportunidade:</strong> Se esquivar e o inimigo errar, gaste 2 PE para atacar com metade do dano como Reação.</p>
            <p>• <strong>Defesa Fortuita (Defletir):</strong> Gaste 2 PE para disputar 1d20+Força contra a jogada do atacante e defletir seu golpe usando um escudo.</p>

            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '20px 0 8px', color: '#ff3333' }}>Armas Adaptadas (Tormenta)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {WEAPONS.map(w => (
                <div key={w.id} style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', border: '1px solid #333', borderRadius: '4px' }}>
                  <strong>{w.name}</strong> ({w.weaponType} / {w.category})<br/>
                  <span style={{ fontSize: '12px', color: '#ccc' }}>Dano: {w.damage} | Crítico: {w.critical} | {w.damageType}</span><br/>
                  <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{w.description}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '20px 0 8px', color: '#ddaa33' }}>Armaduras e Escudos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {ARMORS.map(a => (
                <div key={a.id} style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', border: '1px solid #333', borderRadius: '4px' }}>
                  <strong>{a.name}</strong> ({a.armorType} / {a.category})<br/>
                  <span style={{ fontSize: '12px', color: '#ccc' }}>Defesa: +{a.defenseBonus} | Penalidade: {a.penalty}</span><br/>
                  <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{a.description}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '20px 0 8px', color: '#33ff33' }}>Rituais e Magias Adaptados</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {RITUALS.map(r => (
                <div key={r.id} style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', border: '1px solid #333', borderRadius: '4px' }}>
                  <strong>{r.name}</strong> <span style={{ color: r.element === 'Sangue' ? '#f55' : r.element === 'Morte' ? '#888' : r.element === 'Conhecimento' ? '#dd5' : '#5df' }}>({r.element})</span><br/>
                  <span style={{ fontSize: '12px', color: '#ccc' }}>Custo: {r.cost} PE | Exec.: {r.execution} | Alcance: {r.range}</span><br/>
                  <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{r.description}</span>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glow)', margin: '20px 0 8px', color: '#5555ff' }}>Poderes Místicos e Marciais</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {POWERS.map(p => (
                <div key={p.id} style={{ background: 'rgba(0,0,0,0.4)', padding: '8px', border: '1px solid #333', borderRadius: '4px' }}>
                  <strong>{p.name}</strong> ({p.type})<br/>
                  {p.prerequisites && <span style={{ fontSize: '11px', color: '#f80' }}>Pré-requisito: {p.prerequisites}<br/></span>}
                  <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{p.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AUTH VIEW */}
      {!session || isRecoveringPassword ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, padding: '40px 0' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px', border: '1px solid var(--accent-gold)' }}>
            
            {isRecoveringPassword ? (
              <>
                <h2 style={{ textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center', color: 'var(--accent-gold)' }}>
                  Redefinir Senha
                </h2>
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', textAlign: 'left' }}>Nova Senha</label>
                    <input 
                      type="password" 
                      className="input-field" 
                      placeholder="Sua nova senha..."
                      value={recoveryPassword} 
                      onChange={(e) => setRecoveryPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                  </div>
                  {authError && <p style={{ color: '#ff4d4d', fontSize: '12px', textAlign: 'left' }}>{authError}</p>}
                  <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={authLoading}>
                    {authLoading ? 'Salvando...' : 'Atualizar Senha'}
                  </button>
                  <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <span 
                      style={{ color: 'var(--accent-gold)', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setIsRecoveringPassword(false)}
                    >
                      Voltar ao aplicativo
                    </span>
                  </p>
                </form>
              </>
            ) : (
              <>
                <h2 style={{ textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center', color: 'var(--accent-gold)' }}>
                  {isSignUp ? 'Registrar na Seita' : 'Entrar no Egrégora'}
                </h2>
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {isSignUp && (
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', textAlign: 'left' }}>Nome de Usuário (Apelido)</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Ex: CDiangell-dei"
                        value={authUsername} 
                        onChange={(e) => setAuthUsername(e.target.value)} 
                        required={isSignUp}
                      />
                    </div>
                  )}
                  <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', textAlign: 'left' }}>E-mail</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="E-mail"
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px', textAlign: 'left' }}>Chave Criptográfica (Senha)</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  required 
                />
              </div>
              {authError && <p style={{ color: '#ff4d4d', fontSize: '12px', textAlign: 'left' }}>{authError}</p>}
              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={authLoading}>
                {authLoading ? 'Verificando...' : isSignUp ? 'Registrar' : 'Entrar'}
              </button>
              {!isSignUp && (
                <p style={{ margin: 0, textAlign: 'center' }}>
                  <span 
                    style={{ color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={handleResetPassword}
                  >
                    Esqueci a senha
                  </span>
                </p>
              )}
            </form>
            <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {isSignUp ? 'Já faz parte do círculo?' : 'Primeira missão?'} {' '}
              <span 
                style={{ color: 'var(--accent-gold)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Conecte-se' : 'Cadastre-se'}
              </span>
            </p>
              </>
            )}
          </div>
        </div>
      ) : (
        /* APP MAIN VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
          {/* DASHBOARD BAR */}
          <div className="glass-panel" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Agente Autenticado:</span>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {session.user.user_metadata?.username || session.user.email}
                </p>
              </div>
              {activeChar && (
                <div style={{ borderLeft: '1px solid var(--border-muted)', paddingLeft: '15px', textAlign: 'left' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ficha Ativa:</span>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{activeChar.name}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {activeChar && (
                <>
                  <button 
                    className="btn-primary" 
                    style={{ background: 'linear-gradient(135deg, #2e8b57 0%, #1e5c38 100%)', borderColor: '#2e8b57' }}
                    onClick={() => saveCharacter(activeChar)}
                    disabled={savingChar}
                  >
                    {savingChar ? 'Salva nas Brumas...' : 'Gravar Ficha'}
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ background: 'linear-gradient(135deg, #8b2e2e 0%, #5c1e1e 100%)', borderColor: '#8b2e2e' }}
                    onClick={() => deleteCharacter(activeChar.id)}
                  >
                    Apagar Ficha
                  </button>
                </>
              )}
              <button className="btn-primary" onClick={createCharacter} disabled={loadingChars}>
                Forjar Nova Ficha
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className="glass-panel" style={{ padding: '10px', textAlign: 'center', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', fontWeight: 'bold', animation: 'scaleIn 0.3s' }}>
              {saveMessage}
            </div>
          )}

          {showCreator && (
            <CharacterCreator 
              onClose={() => setShowCreator(false)} 
              onFinish={handleFinishCreator} 
            />
          )}

          {isEditingAttributes && activeChar && (
            <AttributesModal 
              activeChar={activeChar}
              updateActiveChar={updateActiveChar}
              onClose={() => setIsEditingAttributes(false)}
            />
          )}

          {/* MAIN COLUMN SYSTEM */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>
            
            {/* LEFT BAR: CHARACTERS LIST */}
            <div className="glass-panel" style={{ padding: '20px', minHeight: '400px' }}>
              <h3 style={{ textTransform: 'uppercase', fontSize: '14px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '10px', marginBottom: '15px', color: 'var(--accent-gold)', textAlign: 'left' }}>
                Suas Fichas
              </h3>
              {loadingChars ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Buscando fichas...</p>
              ) : characters.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', textAlign: 'left' }}>Nenhuma ficha forjada ainda nas estradas do Bellum.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {characters.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => setActiveChar(c)}
                      className="glass-panel" 
                      style={{ 
                        padding: '12px', 
                        cursor: 'pointer', 
                        background: activeChar?.id === c.id ? 'rgba(139, 0, 0, 0.15)' : 'rgba(30, 30, 38, 0.2)',
                        borderColor: activeChar?.id === c.id ? 'var(--accent-red)' : 'var(--border-muted)',
                        textAlign: 'left',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <h4 style={{ fontSize: '14px', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nível {c.level} • {c.class}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MAIN PORTION: CHARACTER SHEET */}
            {!activeChar ? (
              <div className="glass-panel" style={{ padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <h2 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '15px' }}>Sem Ficha Ativa</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '14px', lineHeight: '1.6' }}>
                  Selecione uma ficha da sua lista lateral para começar a rolar testes, monitorar sanidade, gerenciar seu ouro e registrar suas ações contra as crias de Metus, ou forje uma nova ficha agora!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* CHARACTER BASICS CARD */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Nome do Personagem</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={activeChar.name} 
                        onChange={(e) => updateActiveChar({ name: e.target.value })}
                        style={{ fontFamily: 'var(--font-gothic)', fontSize: '16px', fontWeight: 'bold' }}
                      />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Origem</label>
                      <select 
                        className="input-field"
                        value={activeChar.origin}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Set origin, then apply trainings
                          updateActiveChar({ origin: val });
                          setTimeout(applyOriginTraining, 100);
                        }}
                      >
                        {Object.keys(ORIGINS).map(origin => (
                          <option key={origin} value={origin}>{origin}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Classe</label>
                      <select 
                        className="input-field"
                        value={activeChar.class}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateActiveChar({ class: val });
                        }}
                      >
                        {Object.keys(CLASSES).map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Nível</label>
                        <input 
                          type="number" 
                          className="input-field" 
                          min={1}
                          max={20}
                          value={activeChar.level}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateActiveChar({ level: val });
                          }}
                        />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>NEX (%)</label>
                        <input 
                          type="number" 
                          className="input-field" 
                          step={5}
                          min={5}
                          max={99}
                          value={activeChar.nex}
                          onChange={(e) => updateActiveChar({ nex: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATUS BARS & ATRIBUTES */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
                  
                  {/* ATTRIBUTES HEX PANEL */}
                  <div className="glass-panel" style={{ padding: '20px', minHeight: '275px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '5px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--accent-gold)', margin: 0 }}>
                        Atributos de Ordem Paranormal
                      </h3>
                      <button type="button" className="btn-primary" style={{ padding: '2px 10px', fontSize: '11px' }} onClick={() => setIsEditingAttributes(true)}>Editar</button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '10px 0' }}>
                      {Object.entries(ATTRIBUTES).map(([key, attr]) => (
                        <div 
                          key={key} 
                          className="glass-panel" 
                          style={{ 
                            width: '95px', 
                            padding: '12px 6px', 
                            textAlign: 'center', 
                            borderColor: 'var(--border-muted)', 
                            position: 'relative',
                            background: 'rgba(25, 25, 30, 0.6)'
                          }}
                        >
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '2px', fontFamily: 'var(--font-gothic)' }}>
                            {attr.short}
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '4px 0' }}>
                            <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-gothic)', color: 'var(--text-primary)' }}>
                              {getEffectiveAttribute(activeChar, key as any)}
                            </span>
                          </div>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '9px', width: '100%', marginTop: '6px' }}
                            onClick={() => triggerAttributeRoll(key as any, attr.name)}
                          >
                            Rolar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STATUS TRACKER */}
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '15px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '5px', textAlign: 'left' }}>
                      Pontos de Recurso
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {/* HP BAR */}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-gothic)' }}>Vida (HP)</span>
                          <span>{activeChar.hp_current} / {activeChar.hp_max}</span>
                        </div>
                        <div style={{ height: '14px', background: 'rgba(0,0,0,0.5)', borderRadius: '7px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${(activeChar.hp_current / activeChar.hp_max) * 100}%`, 
                              background: 'linear-gradient(90deg, #1e5c38, #2e8b57)', 
                              transition: 'width 0.3s' 
                            }} 
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.max(0, activeChar.hp_current - 5);
                              updateActiveChar({ hp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `HP reduzido para ${val}.`);
                            }}>-5</button>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '14px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.max(0, activeChar.hp_current - 1);
                              updateActiveChar({ hp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `HP reduzido para ${val}.`);
                            }}>-</button>
                            <div style={{ padding: '4px 12px', fontSize: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', color: '#fff', minWidth: '40px' }}>
                              {activeChar.hp_current}
                            </div>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '14px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.min(activeChar.hp_max, activeChar.hp_current + 1);
                              updateActiveChar({ hp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `HP aumentado para ${val}.`);
                            }}>+</button>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.min(activeChar.hp_max, activeChar.hp_current + 5);
                              updateActiveChar({ hp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `HP aumentado para ${val}.`);
                            }}>+5</button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Máx</span>
                            <div style={{ padding: '4px 12px', fontSize: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', color: '#ddd', minWidth: '40px' }}>
                              {activeChar.hp_max}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SP BAR */}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-gothic)' }}>Sanidade (SP)</span>
                          <span>{activeChar.sp_current} / {activeChar.sp_max}</span>
                        </div>
                        <div style={{ height: '14px', background: 'rgba(0,0,0,0.5)', borderRadius: '7px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${(activeChar.sp_current / activeChar.sp_max) * 100}%`, 
                              background: 'linear-gradient(90deg, #4b0082, #800080)', 
                              transition: 'width 0.3s' 
                            }} 
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.max(0, activeChar.sp_current - 5);
                              updateActiveChar({ sp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `SP reduzido para ${val}.`);
                            }}>-5</button>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '14px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.max(0, activeChar.sp_current - 1);
                              updateActiveChar({ sp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `SP reduzido para ${val}.`);
                            }}>-</button>
                            <div style={{ padding: '4px 12px', fontSize: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', color: '#fff', minWidth: '40px' }}>
                              {activeChar.sp_current}
                            </div>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '14px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.min(activeChar.sp_max, activeChar.sp_current + 1);
                              updateActiveChar({ sp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `SP aumentado para ${val}.`);
                            }}>+</button>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.min(activeChar.sp_max, activeChar.sp_current + 5);
                              updateActiveChar({ sp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `SP aumentado para ${val}.`);
                            }}>+5</button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Máx</span>
                            <div style={{ padding: '4px 12px', fontSize: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', color: '#ddd', minWidth: '40px' }}>
                              {activeChar.sp_max}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* MP/PE BAR */}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-gothic)' }}>Esforço/Mana (PE)</span>
                          <span>{activeChar.mp_current} / {activeChar.mp_max}</span>
                        </div>
                        <div style={{ height: '14px', background: 'rgba(0,0,0,0.5)', borderRadius: '7px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '5px' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${(activeChar.mp_current / activeChar.mp_max) * 100}%`, 
                              background: 'linear-gradient(90deg, #997300, #cca43b)', 
                              transition: 'width 0.3s' 
                            }} 
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.max(0, activeChar.mp_current - 5);
                              updateActiveChar({ mp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `PE reduzido para ${val}.`);
                            }}>-5</button>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '14px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.max(0, activeChar.mp_current - 1);
                              updateActiveChar({ mp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `PE reduzido para ${val}.`);
                            }}>-</button>
                            <div style={{ padding: '4px 12px', fontSize: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', color: '#fff', minWidth: '40px' }}>
                              {activeChar.mp_current}
                            </div>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '14px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.min(activeChar.mp_max, activeChar.mp_current + 1);
                              updateActiveChar({ mp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `PE aumentado para ${val}.`);
                            }}>+</button>
                            <button type="button" className="btn-primary" style={{ padding: '2px 8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }} onClick={() => {
                              const val = Math.min(activeChar.mp_max, activeChar.mp_current + 5);
                              updateActiveChar({ mp_current: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `PE aumentado para ${val}.`);
                            }}>+5</button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Máx</span>
                            <div style={{ padding: '4px 12px', fontSize: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', color: '#ddd', minWidth: '40px' }}>
                              {activeChar.mp_max}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM MULTI-TAB PORTION */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
                  
                  {/* LEFT DETAILED CARDS: PERÍCIAS / INVENTÁRIO / RITUAIS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* PERÍCIAS TAB */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '15px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '5px', textAlign: 'left' }}>
                        Perícias Treinadas
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                        {Object.keys(SKILLS).map(skillName => {
                          const skillInfo = SKILLS[skillName];
                          const charSkill = activeChar.skills.find(s => s.name === skillName);
                          const training = charSkill?.training || 'none';
                          const attrVal = activeChar[skillInfo.attribute];
                          
                          let bonus = 0;
                          if (training === 'trained') bonus = 5;
                          else if (training === 'veteran') bonus = 10;
                          else if (training === 'expert') bonus = 15;

                          return (
                            <div 
                              key={skillName} 
                              className="glass-panel" 
                              style={{ 
                                padding: '8px 12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                background: 'rgba(20, 20, 25, 0.4)',
                                borderColor: training !== 'none' ? 'var(--accent-gold)' : 'var(--border-muted)'
                              }}
                            >
                              <div style={{ textAlign: 'left', flexGrow: 1 }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}>{skillName}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                  {ATTRIBUTES[skillInfo.attribute].short} (d{attrVal}) {bonus > 0 ? `+${bonus}` : ''}
                                </span>
                              </div>
                              <select 
                                value={training}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  const updatedSkills = activeChar.skills.map(s => 
                                    s.name === skillName ? { ...s, training: val } : s
                                  );
                                  updateActiveChar({ skills: updatedSkills });
                                  addLog(activeChar.id, DICE_LOG_ACTIONS.STATUS_ALTERADO, `Graduação de ${skillName} alterada para ${val.toUpperCase()}`);
                                }}
                                style={{ 
                                  background: 'var(--bg-darker)', 
                                  border: '1px solid var(--border-muted)', 
                                  color: 'var(--text-primary)', 
                                  fontSize: '10px', 
                                  padding: '2px',
                                  borderRadius: '4px' 
                                }}
                              >
                                <option value="none">NÃO</option>
                                <option value="trained">TREINADO (+5)</option>
                                <option value="veteran">VET (+10)</option>
                                <option value="expert">EXP (+15)</option>
                              </select>
                              <button 
                                className="btn-primary" 
                                style={{ padding: '6px', borderRadius: '4px', fontSize: '10px' }}
                                onClick={() => triggerSkillRoll(skillName)}
                              >
                                🎲
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* INVENTÁRIO & RIQUEZA */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-muted)', paddingBottom: '5px', marginBottom: '15px' }}>
                        <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--accent-gold)' }}>
                          Inventário de Viagem
                        </h3>
                        <span style={{ fontSize: '12px', color: totalWeight > maxWeight ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                          Carga: {totalWeight} / {maxWeight} Espaços
                        </span>
                      </div>

                      {/* Coin grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Cobre (MC)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            value={activeChar.cobre}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateActiveChar({ cobre: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.DINHEIRO_ALTERADO, `Cobre alterado de ${activeChar.cobre} para ${val}`);
                            }}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Prata (MP)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            value={activeChar.prata}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateActiveChar({ prata: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.DINHEIRO_ALTERADO, `Prata alterada de ${activeChar.prata} para ${val}`);
                            }}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Ouro (MO)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            value={activeChar.ouro}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateActiveChar({ ouro: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.DINHEIRO_ALTERADO, `Ouro alterado de ${activeChar.ouro} para ${val}`);
                            }}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Platina (MPT)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            value={activeChar.platina}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateActiveChar({ platina: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.DINHEIRO_ALTERADO, `Platina alterada de ${activeChar.platina} para ${val}`);
                            }}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Platina Real (MPR)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            value={activeChar.platina_real}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateActiveChar({ platina_real: val });
                              addLog(activeChar.id, DICE_LOG_ACTIONS.DINHEIRO_ALTERADO, `Platina Real alterada de ${activeChar.platina_real} para ${val}`);
                            }}
                            style={{ padding: '6px' }}
                          />
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '15px' }}>
                        * 100 Moedas = 1 Espaço de Carga. Espaços ocupados por moedas atualmente: {coinSpaces}.
                      </p>

                      {/* Items List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                        {activeChar.inventory.map(item => (
                          <div 
                            key={item.id} 
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}
                          >
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{item.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '10px' }}>({item.spaces} Espaços)</span>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</p>
                            </div>
                            <button 
                              className="btn-secondary" 
                              style={{ borderColor: 'var(--accent-red)', color: 'var(--text-primary)', padding: '4px 8px', fontSize: '10px' }}
                              onClick={() => removeItemFromInventory(item.id, item.name)}
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Form to add item */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr auto', gap: '10px', alignItems: 'end' }}>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Novo Item</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Espada de Aço" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Espaços</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            min={1} 
                            value={newItemSpaces}
                            onChange={(e) => setNewItemSpaces(Number(e.target.value))}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Descrição</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Dano 1d10, corte" 
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <button className="btn-primary" style={{ padding: '6px 12px' }} onClick={addItemToInventory}>
                          Adicionar
                        </button>
                      </div>
                    </div>

                    {/* RITUAIS / MAGIAS */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '15px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '5px', textAlign: 'left' }}>
                        Rituais de Canalizador
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {activeChar.rituals.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', textAlign: 'left' }}>Nenhum ritual clamado neste personagem ainda.</p>
                        ) : (
                          activeChar.rituals.map(rit => (
                            <div 
                              key={rit.id}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-muted)' }}
                            >
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{rit.name}</span>
                                  <span style={{ fontSize: '10px', background: 'rgba(139,0,0,0.2)', border: '1px solid var(--accent-red)', padding: '1px 4px', borderRadius: '3px', color: 'var(--text-primary)' }}>
                                    {rit.element}
                                  </span>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{rit.desc}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{rit.cost} SP</span>
                                <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '10px' }} onClick={() => castRitual(rit)}>
                                  Conjurar
                                </button>
                                <button 
                                  className="btn-secondary" 
                                  style={{ borderColor: 'var(--accent-red)', padding: '4px 8px', fontSize: '10px', color: 'var(--text-primary)' }}
                                  onClick={() => removeRitual(rit.id, rit.name)}
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Form to add ritual */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr auto', gap: '10px', alignItems: 'end' }}>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Nome do Ritual</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Cicatrização" 
                            value={newRitName}
                            onChange={(e) => setNewRitName(e.target.value)}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Elemento</label>
                          <select 
                            className="input-field"
                            value={newRitElement}
                            onChange={(e) => setNewRitElement(e.target.value as any)}
                            style={{ padding: '6px' }}
                          >
                            <option value="Sangue">Sangue</option>
                            <option value="Morte">Morte</option>
                            <option value="Conhecimento">Conhecimento</option>
                            <option value="Energia">Energia</option>
                            <option value="Medo">Medo</option>
                          </select>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Custo SP</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            min={1} 
                            value={newRitCost}
                            onChange={(e) => setNewRitCost(Number(e.target.value))}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Efeito</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Recupera 1d10 PV" 
                            value={newRitDesc}
                            onChange={(e) => setNewRitDesc(e.target.value)}
                            style={{ padding: '6px' }}
                          />
                        </div>
                        <button className="btn-primary" style={{ padding: '6px 12px' }} onClick={addCustomRitual}>
                          Aprender
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: ACTION CHANGE LOGS & NOTES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* SYSTEM LOG (ANTI-CHEAT) */}
                    <div className="glass-panel" style={{ padding: '20px', minHeight: '350px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--accent-red)', marginBottom: '15px', borderBottom: '1px solid var(--border-glow)', paddingBottom: '5px', textAlign: 'left' }}>
                        Registro de Ações (Mestre Log)
                      </h3>

                      {loadingLogs ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Buscando rolagens...</p>
                      ) : logs.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic', textAlign: 'left' }}>Nenhum log gravado ainda.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                          {logs.map(log => (
                            <div 
                              key={log.id} 
                              style={{ 
                                padding: '8px', 
                                background: 'rgba(0,0,0,0.3)', 
                                borderLeft: `3px solid ${
                                  log.action_type === DICE_LOG_ACTIONS.DADO_ROLADO ? 'var(--accent-gold)' : 
                                  log.action_type === DICE_LOG_ACTIONS.CONJURACAO ? 'var(--accent-red)' : 'var(--text-muted)'
                                }`,
                                borderRadius: '4px',
                                textAlign: 'left',
                                fontSize: '11px',
                                lineHeight: '1.4'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '9px', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 'bold' }}>{log.action_type}</span>
                                <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                              </div>
                              <p style={{ color: 'var(--text-primary)' }}>{log.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* NOTES SECTION */}
                    <div className="glass-panel" style={{ padding: '20px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '10px', borderBottom: '1px solid var(--border-muted)', paddingBottom: '5px', textAlign: 'left' }}>
                        Anotações Narrativas
                      </h3>
                      <textarea 
                        className="input-field" 
                        rows={6}
                        value={activeChar.notes}
                        onChange={(e) => updateActiveChar({ notes: e.target.value })}
                        placeholder="Escreva sobre a lore do seu herói..."
                        style={{ fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* DICE RESULT DIALOG OVERLAY */}
      {rollResult && (
        <div className="dice-overlay">
          <div className="glass-panel dice-result-card">
            <h2 style={{ color: 'var(--accent-gold)', marginBottom: '10px', textTransform: 'uppercase' }}>
              {rollResult.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '15px' }}>
              {rollResult.notation}
            </p>
            
            <div className="dice-pool-container">
              {rollResult.rolls.map((roll, idx) => {
                const isHighest = roll === rollResult.highest;
                return (
                  <div key={idx} className={`dice-item ${isHighest ? 'highest' : ''}`}>
                    {roll}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-muted)', paddingTop: '15px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resultado Final</span>
              <p style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'var(--font-gothic)', color: 'var(--text-primary)', textShadow: '0 0 15px rgba(255,255,255,0.2)', margin: '5px 0' }}>
                {rollResult.finalResult}
              </p>
            </div>

            <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={() => setRollResult(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
