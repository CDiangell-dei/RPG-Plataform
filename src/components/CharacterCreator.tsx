import { useState } from 'react';
import { ORIGINS, CLASSES, SKILLS } from '../rules/rulesData';
import type { Character, SkillData } from '../App';

interface CharacterCreatorProps {
  onClose: () => void;
  onFinish: (newChar: Partial<Character>) => void;
}

export function CharacterCreator({ onClose, onFinish }: CharacterCreatorProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  
  // Atributos
  const [attributes, setAttributes] = useState({
    agility: 1, intellect: 1, vigor: 1, presence: 1, strength: 1
  });
  const maxPoints = 4;
  
  const getUsedPoints = () => {
    return Object.values(attributes).reduce((sum, val) => sum + (val - 1), 0);
  };
  const pointsLeft = maxPoints - getUsedPoints();

  const handleAttrChange = (attr: keyof typeof attributes, change: number) => {
    const current = attributes[attr];
    const next = current + change;
    
    // Limits: Min 0, Max 3 during creation. 
    if (next < 0 || next > 3) return;
    
    const cost = change;
    if (pointsLeft - cost < 0) return; // not enough points
    
    setAttributes({ ...attributes, [attr]: next });
  };

  // Origem
  const [origin, setOrigin] = useState(Object.keys(ORIGINS)[0]);
  
  // Classe (Caminho)
  const [charClass, setCharClass] = useState('Beligerante'); 

  const handleFinish = () => {
    const classData = CLASSES[charClass];
    const hp = classData.hpBase + attributes.vigor;
    const sp = classData.spBase + attributes.presence;
    const mp = classData.mpBase + attributes.presence;

    const defaultSkills: SkillData[] = Object.keys(SKILLS).map(name => ({
      name,
      training: 'none'
    }));

    const selectedOrigin = ORIGINS[origin];
    if (selectedOrigin) {
      selectedOrigin.skills.forEach(s => {
        const skill = defaultSkills.find(ds => ds.name === s);
        if (skill) skill.training = 'trained';
      });
    }

    const newChar: Partial<Character> = {
      name: name || 'Agente Desconhecido',
      origin: origin,
      class: charClass,
      level: 1,
      nex: 5,
      ...attributes,
      hp_max: hp,
      hp_current: hp,
      sp_max: sp,
      sp_current: sp,
      mp_max: mp,
      mp_current: mp,
      cobre: 0, prata: 0, ouro: 0, platina: 0, platina_real: 0,
      inventory: [],
      skills: defaultSkills,
      rituals: [],
      notes: `Origem: ${selectedOrigin?.name}\nPoder: ${selectedOrigin?.benefitName} - ${selectedOrigin?.benefitDescription}`
    };

    onFinish(newChar);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="wizard-step animation-fade-in">
            <h3 style={{ color: 'var(--accent-gold)' }}>Passo 1: Identidade</h3>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>Qual é o seu nome, viajante das brumas?</p>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Kael, o Errante" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{ width: '100%', fontSize: '18px', padding: '10px' }}
            />
          </div>
        );
      case 2:
        return (
          <div className="wizard-step animation-fade-in">
            <h3 style={{ color: 'var(--accent-gold)' }}>Passo 2: Atributos</h3>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>Distribua {maxPoints} pontos entre os 5 atributos. Todos começam em 1 (máximo 3).</p>
            <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', color: pointsLeft > 0 ? '#3f3' : '#f33' }}>
              Pontos Restantes: {pointsLeft}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { key: 'agility', label: 'Agilidade' },
                { key: 'intellect', label: 'Intelecto' },
                { key: 'vigor', label: 'Vigor' },
                { key: 'presence', label: 'Presença' },
                { key: 'strength', label: 'Força' }
              ].map(attr => (
                <div key={attr.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px' }}>
                  <strong style={{ width: '100px' }}>{attr.label}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button type="button" className="btn-primary" style={{ padding: '5px 15px' }} onClick={() => handleAttrChange(attr.key as any, -1)} disabled={attributes[attr.key as keyof typeof attributes] <= 0}>-</button>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{attributes[attr.key as keyof typeof attributes]}</span>
                    <button type="button" className="btn-primary" style={{ padding: '5px 15px' }} onClick={() => handleAttrChange(attr.key as any, 1)} disabled={pointsLeft === 0 || attributes[attr.key as keyof typeof attributes] >= 3}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="wizard-step animation-fade-in">
            <h3 style={{ color: 'var(--accent-gold)' }}>Passo 3: Origem</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px' }}>O que você fazia antes do Bellum engolir o mundo?</p>
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px' }}>
              {Object.keys(ORIGINS).map(key => {
                const o = ORIGINS[key];
                return (
                  <div 
                    key={key} 
                    onClick={() => setOrigin(key)}
                    style={{ 
                      padding: '12px', 
                      border: origin === key ? '2px solid var(--accent-gold)' : '1px solid #333',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: origin === key ? 'rgba(218, 165, 32, 0.1)' : 'rgba(0,0,0,0.4)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <strong>{o.name}</strong>
                    <div style={{ fontSize: '12px', color: '#ccc', margin: '5px 0' }}>{o.description}</div>
                    <div style={{ fontSize: '11px', color: '#ff8' }}>Perícias: {o.skills.join(', ')}</div>
                    <div style={{ fontSize: '11px', color: '#8f8' }}>Benefício: {o.benefitName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="wizard-step animation-fade-in">
            <h3 style={{ color: 'var(--accent-gold)' }}>Passo 4: O Seu Caminho (Classe)</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px' }}>Escolha a sua classe adaptada de Bellum Egrégora.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.keys(CLASSES).map(key => {
                const c = CLASSES[key];
                return (
                  <div 
                    key={key} 
                    onClick={() => setCharClass(key)}
                    style={{ 
                      padding: '15px', 
                      border: charClass === key ? '2px solid var(--accent-gold)' : '1px solid #333',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      background: charClass === key ? 'rgba(218, 165, 32, 0.1)' : 'rgba(0,0,0,0.4)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <strong style={{ fontSize: '18px' }}>{c.name}</strong>
                    <div style={{ fontSize: '12px', color: '#ccc', margin: '8px 0' }}>{c.description}</div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#88f' }}>
                      <span>PV: {c.hpBase} + Vigor</span>
                      <span>Sanidade: {c.spBase} + Presença</span>
                      <span>Mana: {c.mpBase} + Presença</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, backdropFilter: 'blur(5px)'
    }}>
      <div className="glass-panel" style={{ width: '500px', maxWidth: '90vw', padding: '30px', position: 'relative' }}>
        
        {/* Header Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ 
              width: '24%', textAlign: 'center', fontSize: '12px', 
              color: step === s ? 'var(--accent-gold)' : step > s ? '#8f8' : '#555',
              borderBottom: step === s ? '2px solid var(--accent-gold)' : 'none'
            }}>
              Passo {s}
            </div>
          ))}
        </div>

        {/* Content */}
        {renderStep()}

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          {step > 1 ? (
            <button type="button" className="btn-primary" style={{ background: '#444' }} onClick={() => setStep(step - 1)}>Voltar</button>
          ) : (
            <button type="button" className="btn-primary" style={{ background: '#511' }} onClick={onClose}>Cancelar</button>
          )}
          
          {step < 4 ? (
            <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>Próximo</button>
          ) : (
            <button type="button" className="btn-primary" style={{ background: 'var(--accent-gold)', color: '#000' }} onClick={handleFinish}>
              Finalizar Ficha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
