import React, { useState } from 'react';
import type { Character, Modifier } from '../App';

interface Props {
  activeChar: Character;
  updateActiveChar: (fields: Partial<Character>) => void;
  onClose: () => void;
}

export const AttributesModal: React.FC<Props> = ({ activeChar, updateActiveChar, onClose }) => {
  const [activeTab, setActiveTab] = useState<'base' | 'mods'>('base');

  const [modName, setModName] = useState('');
  const [modTarget, setModTarget] = useState<Modifier['target']>('hp_max');
  const [modType, setModType] = useState<Modifier['type']>('flat');
  const [modValue, setModValue] = useState(1);

  const handleAddMod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modName) return;

    const newMod: Modifier = {
      id: Date.now().toString(),
      name: modName,
      target: modTarget,
      type: modType,
      value: Number(modValue),
      isActive: true
    };

    updateActiveChar({
      modifiers: [...(activeChar.modifiers || []), newMod]
    });

    setModName('');
    setModValue(1);
  };

  const handleRemoveMod = (modId: string) => {
    updateActiveChar({
      modifiers: (activeChar.modifiers || []).filter(m => m.id !== modId)
    });
  };

  const handleToggleMod = (modId: string) => {
    const updatedMods = (activeChar.modifiers || []).map(m => 
      m.id === modId ? { ...m, isActive: !m.isActive } : m
    );
    updateActiveChar({ modifiers: updatedMods });
  };

  const attrLabels: Record<string, string> = {
    hp_max: 'Vida Max (HP)',
    sp_max: 'Sanidade Max (SP)',
    mp_max: 'Mana Max (PE)',
    agility: 'Agilidade',
    intellect: 'Intelecto',
    vigor: 'Vigor',
    presence: 'Presença',
    strength: 'Força'
  };

  const typeLabels: Record<string, string> = {
    flat: 'Valor Fixo',
    per_level: 'Por Nível',
    per_odd_level: 'Nível Ímpar',
    per_even_level: 'Nível Par'
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, backdropFilter: 'blur(5px)'
    }}>
      <div className="glass-panel" style={{ width: '500px', maxWidth: '95vw', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className="btn-primary" 
            style={{ flex: 1, opacity: activeTab === 'base' ? 1 : 0.5 }}
            onClick={() => setActiveTab('base')}
          >
            Atributos Base
          </button>
          <button 
            className="btn-primary" 
            style={{ flex: 1, opacity: activeTab === 'mods' ? 1 : 0.5 }}
            onClick={() => setActiveTab('mods')}
          >
            Modificadores
          </button>
        </div>

        {activeTab === 'base' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { key: 'agility', label: 'Agilidade' },
              { key: 'intellect', label: 'Intelecto' },
              { key: 'vigor', label: 'Vigor' },
              { key: 'presence', label: 'Presença' },
              { key: 'strength', label: 'Força' }
            ].map(attr => (
              <div key={attr.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px' }}>
                <strong>{attr.label}</strong>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button type="button" className="btn-primary" style={{ padding: '5px 15px' }} onClick={() => updateActiveChar({ [attr.key]: Math.max(0, (activeChar[attr.key as keyof Character] as number) - 1) })}>-</button>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{activeChar[attr.key as keyof Character] as number}</span>
                  <button type="button" className="btn-primary" style={{ padding: '5px 15px' }} onClick={() => updateActiveChar({ [attr.key]: Math.min(10, (activeChar[attr.key as keyof Character] as number) + 1) })}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mods' && (
          <div>
            <form onSubmit={handleAddMod} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '5px' }}>
              <input type="text" className="input-field" placeholder="Nome do Bônus (Ex: Anel de Intelecto)" value={modName} onChange={e => setModName(e.target.value)} required />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <select className="input-field" value={modTarget} onChange={e => setModTarget(e.target.value as any)}>
                  {Object.entries(attrLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select className="input-field" value={modType} onChange={e => setModType(e.target.value as any)}>
                  {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input type="number" className="input-field" style={{ width: '80px' }} value={modValue} onChange={e => setModValue(Number(e.target.value))} required />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Adicionar Bônus</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(activeChar.modifiers || []).length === 0 && (
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Nenhum bônus ativo.</p>
              )}
              {(activeChar.modifiers || []).map(mod => (
                <div key={mod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px', borderLeft: mod.isActive ? '3px solid var(--accent-gold)' : '3px solid #555', opacity: mod.isActive ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', color: mod.isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{mod.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {attrLabels[mod.target]} | {mod.value > 0 ? '+' : ''}{mod.value} ({typeLabels[mod.type]})
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '5px', fontSize: '11px', minWidth: '70px' }} onClick={() => handleToggleMod(mod.id)}>
                      {mod.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <button type="button" className="btn-primary" style={{ padding: '5px', fontSize: '11px', borderColor: 'var(--accent-red)' }} onClick={() => handleRemoveMod(mod.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'right' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>Fechar Janela</button>
        </div>
      </div>
    </div>
  );
};
