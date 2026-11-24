import React from 'react';
import { InteractiveObject } from './InteractiveObject';
import { InteractiveObjectData } from '../../types/game';

const DUG_WELL_DATA: InteractiveObjectData = {
  id: 'well-open-masonry-01',
  name: 'Community Open Dug Well',
  category: 'WELL',
  position: [-6, 0, 4],
  description: 'Traditional wide-diameter masonry well tapping into the shallow unconfined weathered zone aquifer.',
  educationalRole: 'Directly reflects water table fluctuations. When the shallow water table falls below 15 meters, open wells run completely dry.',
  waterStatus: {
    label: 'Water Level: 14.2 m',
    value: 'Active (3.2 m water column)',
    trend: 'stable',
    color: '#0284c7',
  },
  metrics: {
    extractionRate: '25 m³ / day',
    waterQuality: 'Tested Potable (Nitrates normal)',
  },
  recommendedActions: [
    'Install a protective parapet and mesh cover to prevent contamination',
    'Disinfect with bleaching powder after heavy monsoon washouts',
  ],
};

const BOREWELL_DATA: InteractiveObjectData = {
  id: 'borewell-electric-01',
  name: 'High-Capacity Agricultural Borewell',
  category: 'BOREWELL',
  position: [-16, 0, -12],
  description: 'Deep 150-meter motorized tube well with submersible pump connected to a 7.5 HP electric grid connection.',
  educationalRole: 'Exemplifies energy-water nexus and deep aquifer overdraft. Unregulated pumping causes deep drawdown cones that desiccate surrounding shallow wells.',
  waterStatus: {
    label: 'High Extraction Rate',
    value: '180 Liters / minute',
    trend: 'down',
    color: '#f97316',
  },
  metrics: {
    extractionRate: '85,000 L / day',
    efficiencyRating: '65% (Pumps 8 hrs/day)',
    waterQuality: 'High salinity (TDS 680 ppm)',
  },
  recommendedActions: [
    'Mandate digital flow meters to track volumetric pumping',
    'Install automated timers to prevent continuous overnight pumping',
    'Couple with nearby recharge pit to offset extracted volume',
  ],
};

export const VillageInfrastructure: React.FC = () => {
  return (
    <group>
      {/* 1. Open Dug Well */}
      <InteractiveObject data={DUG_WELL_DATA}>
        <group>
          {/* Circular Masonry Wall */}
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.5, 1.0, 24, 1, true]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.8} side={2} />
          </mesh>
          {/* Well Rim Coping */}
          <mesh position={[0, 1.0, 0]}>
            <torusGeometry args={[1.5, 0.12, 12, 24]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
          {/* Water Level inside Well */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.4, 24]} />
            <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.7} />
          </mesh>
          {/* Pulley Frame - Two vertical timber posts */}
          <mesh position={[-1.2, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 2.0]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[1.2, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 2.0]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Crossbeam */}
          <mesh position={[0, 2.45, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 2.6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Iron Pulley Wheel */}
          <mesh position={[0, 2.3, 0]}>
            <torusGeometry args={[0.2, 0.03, 8, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>
      </InteractiveObject>

      {/* 2. Deep Electric Borewell Pump Shed */}
      <InteractiveObject data={BOREWELL_DATA}>
        <group>
          {/* Pump Shed Base Slab */}
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <boxGeometry args={[3.2, 0.3, 3.2]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Pump Shed Small Building */}
          <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.4, 1.8, 2.4]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
          </mesh>
          {/* Corrugated Sloped Roof */}
          <mesh position={[0, 2.2, 0]} rotation={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[2.8, 0.15, 2.8]} />
            <meshStandardMaterial color="#0369a1" />
          </mesh>
          {/* Borewell Casing Pipe (Emerging from ground) */}
          <mesh position={[1.8, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Water Discharge Delivery Pipe */}
          <mesh position={[2.4, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 1.4, 16]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* Discharge Outflow Chamber */}
          <mesh position={[3.2, 0.2, 0]}>
            <boxGeometry args={[0.8, 0.4, 0.8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>
      </InteractiveObject>
    </group>
  );
};
