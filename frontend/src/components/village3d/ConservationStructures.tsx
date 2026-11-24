import React from 'react';
import { InteractiveObject } from './InteractiveObject';
import { InteractiveObjectData } from '../../types/game';

const CHECK_DAM_DATA: InteractiveObjectData = {
  id: 'struct-check-dam-01',
  name: 'Masonry Check Dam (Anicut)',
  category: 'CHECK_DAM',
  position: [-18, 0, -32],
  description: 'Small barrier constructed across the village seasonal stream to impede water flow, enhance surface retention, and recharge surrounding aquifer zones.',
  educationalRole: 'Check dams slow monsoon water velocity, allowing sediments to settle while facilitating deep percolation into surrounding aquifers over 4-6 months.',
  waterStatus: {
    label: 'Impounding Active',
    value: 'Water column: 1.8 m head',
    trend: 'up',
    color: '#10b981',
  },
  metrics: {
    storageCapacity: '18,000 m³ pondage',
    rechargeContribution: '45,000 m³ seasonal recharge',
    efficiencyRating: '86% retained runoff',
  },
  recommendedActions: [
    'Annual pre-monsoon desilting to maintain maximum holding capacity',
    'Inspect downstream apron for scouring and erosion',
  ],
};

const PERCOLATION_TANK_DATA: InteractiveObjectData = {
  id: 'struct-percolation-tank-01',
  name: 'Percolation Tank with Recharge Shaft',
  category: 'PERCOLATION_TANK',
  position: [26, 0, -4],
  description: 'Artificially created surface water body in permeable strata designed specifically to recharge unconfined aquifers without direct surface extraction.',
  educationalRole: 'Unlike irrigation ponds, percolation tanks are purely recharge instruments, transferring monsoon deluge into subterranean storage where zero evaporation occurs.',
  waterStatus: {
    label: 'High Infiltration',
    value: 'Infiltration rate: 45 mm/hr',
    trend: 'up',
    color: '#06b6d4',
  },
  metrics: {
    storageCapacity: '25,000 m³',
    rechargeContribution: '60,000 m³ annually',
    efficiencyRating: '94% recharge yield',
  },
  recommendedActions: [
    'Clear silt deposit layers using rotavators before first rains',
    'Ensure recharge shaft filter casing is free of debris',
  ],
};

export const ConservationStructures: React.FC = () => {
  return (
    <group>
      {/* 1. Masonry Check Dam across River */}
      <InteractiveObject data={CHECK_DAM_DATA}>
        <group>
          {/* Dam Masonry Wall */}
          <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.5, 1.6, 9.2]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.8} />
          </mesh>
          {/* Spillway Crest (lower middle section) */}
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[2.55, 0.4, 4.5]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* Upstream Water Pool */}
          <mesh position={[-3, 0.4, 0]}>
            <boxGeometry args={[4.5, 0.4, 8.8]} />
            <meshStandardMaterial
              color="#0284c7"
              roughness={0.2}
              metalness={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      </InteractiveObject>

      {/* 2. Percolation Tank with Recharge Shaft */}
      <InteractiveObject data={PERCOLATION_TANK_DATA}>
        <group>
          {/* Tank Basin Basin Bund */}
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <cylinderGeometry args={[6.5, 5.0, 0.6, 28]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.9} />
          </mesh>
          {/* Sand & Gravel Filter Bed */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[5.8, 5.8, 0.2, 28]} />
            <meshStandardMaterial color="#d6d3d1" roughness={0.95} />
          </mesh>
          {/* Water Infiltration Layer */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[5.4, 5.4, 0.2, 28]} />
            <meshStandardMaterial
              color="#0ea5e9"
              roughness={0.1}
              metalness={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Central Recharge Shaft Pipe leading to deep aquifer */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 1.6, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} />
          </mesh>
          {/* Mesh Filter Cap on Shaft */}
          <mesh position={[0, 1.65, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.15, 16]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
        </group>
      </InteractiveObject>
    </group>
  );
};
