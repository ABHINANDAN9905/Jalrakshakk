import React from 'react';
import { InteractiveObject } from './InteractiveObject';
import { InteractiveObjectData } from '../../types/game';

const RWH_HOUSE_DATA: InteractiveObjectData = {
  id: 'house-rwh-01',
  name: 'Rooftop RWH Pucca House',
  category: 'RAINWATER_HARVESTING',
  position: [12, 0, 10],
  description: 'Modern brick dwelling equipped with rooftop rainwater catchment pipes, a first-flush diverter, and a dual-chamber filtration sump.',
  educationalRole: 'Demonstrates how residential roofs (120 m²) can capture over 70,000 liters of monsoon runoff annually, recharging local groundwater aquifers instead of letting water wash away as surface runoff.',
  waterStatus: {
    label: 'Active Catchment',
    value: '72,000 L / year harvested',
    trend: 'up',
    color: '#10b981',
  },
  metrics: {
    storageCapacity: '15,000 L sump',
    rechargeContribution: '57,000 L to aquifer',
    efficiencyRating: '88% capture efficiency',
  },
  recommendedActions: [
    'Clean roof surface and gutters before the onset of monsoon',
    'Flush the first 15 minutes of rainfall using the first-flush diverter',
    'Replace sand-gravel filter media once every two seasons',
  ],
};

const TRADITIONAL_HUT_DATA: InteractiveObjectData = {
  id: 'house-traditional-01',
  name: 'Traditional Kutcha Hut & Homestead',
  category: 'HOUSE',
  position: [-10, 0, 12],
  description: 'Eco-friendly rural home constructed with sun-dried earthen clay bricks, local timber, and thatched coconut frond roof.',
  educationalRole: 'Illustrates traditional low-embodied carbon Indian architecture. Natural thatched eaves shed water directly into perimeter trench soak pits.',
  waterStatus: {
    label: 'Low Extraction',
    value: '80 L / day domestic demand',
    trend: 'stable',
    color: '#0284c7',
  },
  metrics: {
    extractionRate: '80 L/day (Hand Pump)',
    waterQuality: 'Potable (TDS 240 ppm)',
  },
  recommendedActions: [
    'Direct greywater from washing area into backyard nutrition garden',
    'Install a biosand filter for drinking water potability',
  ],
};

const PANCHAYAT_DATA: InteractiveObjectData = {
  id: 'house-panchayat-01',
  name: 'Gram Panchayat & Village Water Committee',
  category: 'HOUSE',
  position: [2, 0, -8],
  description: 'The administrative heart of the village where the Jal Samiti (Water Committee) meets to monitor groundwater budgets, borewell permits, and watershed projects.',
  educationalRole: 'Teaches participatory groundwater governance. Community consensus ensures equitable water sharing and prevents predatory deep borewell drilling.',
  waterStatus: {
    label: 'Equitable Governance',
    value: 'Water Budget Approved',
    trend: 'stable',
    color: '#6366f1',
  },
  metrics: {
    efficiencyRating: '92% compliance',
    waterQuality: 'District Jal Jeevan Certified',
  },
  recommendedActions: [
    'Organize monthly groundwater level public disclosures',
    'Enforce ban on new borewells deeper than 200 feet',
    'Subsidize micro-irrigation kits for smallholder farmers',
  ],
};

export const VillageHouses: React.FC = () => {
  return (
    <group>
      {/* 1. Rooftop Rainwater Harvesting Pucca House */}
      <InteractiveObject data={RWH_HOUSE_DATA}>
        <group>
          {/* Main Walls */}
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[5, 3, 4]} />
            <meshStandardMaterial color="#e2d4c0" roughness={0.7} />
          </mesh>
          {/* Roof Slab */}
          <mesh position={[0, 3.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[5.4, 0.2, 4.4]} />
            <meshStandardMaterial color="#a855f7" roughness={0.5} />
          </mesh>
          {/* Parapet walls to catch water */}
          <mesh position={[0, 3.3, 2.1]} castShadow>
            <boxGeometry args={[5.4, 0.3, 0.15]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          <mesh position={[0, 3.3, -2.1]} castShadow>
            <boxGeometry args={[5.4, 0.3, 0.15]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          {/* Door */}
          <mesh position={[0, 1.0, 2.01]}>
            <planeGeometry args={[1.2, 2.0]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Windows */}
          <mesh position={[-1.6, 1.6, 2.01]}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} />
          </mesh>
          <mesh position={[1.6, 1.6, 2.01]}>
            <planeGeometry args={[0.9, 0.9]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} />
          </mesh>
          {/* Rainwater Gutters and Downpipe (Blue) */}
          <mesh position={[2.6, 1.6, 2.1]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 3.2, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* First Flush Diverter & Filter Drum */}
          <mesh position={[2.6, 0.6, 2.1]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 1.0, 16]} />
            <meshStandardMaterial color="#0369a1" />
          </mesh>
          {/* Underground Recharge Pit Indicator */}
          <mesh position={[2.6, 0.05, 3.2]}>
            <circleGeometry args={[0.8, 24]} />
            <meshStandardMaterial color="#10b981" roughness={0.4} />
          </mesh>
        </group>
      </InteractiveObject>

      {/* 2. Traditional Kutcha Hut */}
      <InteractiveObject data={TRADITIONAL_HUT_DATA}>
        <group>
          {/* Mud Walls */}
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 2.2, 3.5]} />
            <meshStandardMaterial color="#c29b74" roughness={0.9} />
          </mesh>
          {/* Thatched Roof (Cone/Pyramid style) */}
          <mesh position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[3.2, 1.8, 4]} />
            <meshStandardMaterial color="#b45309" roughness={0.95} />
          </mesh>
          {/* Wooden Door */}
          <mesh position={[0, 0.8, 1.76]}>
            <planeGeometry args={[1.0, 1.6]} />
            <meshStandardMaterial color="#543310" />
          </mesh>
          {/* Verandah wooden pillars */}
          <mesh position={[-1.8, 0.9, 2.2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 1.8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[1.8, 0.9, 2.2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 1.8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Verandah roof extension */}
          <mesh position={[0, 1.9, 2.0]} rotation={[Math.PI / 8, 0, 0]}>
            <boxGeometry args={[4.2, 0.1, 1.2]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
        </group>
      </InteractiveObject>

      {/* 3. Gram Panchayat & Jal Samiti Building */}
      <InteractiveObject data={PANCHAYAT_DATA}>
        <group>
          {/* Base Plinth */}
          <mesh position={[0, 0.25, 0]} receiveShadow>
            <boxGeometry args={[8.4, 0.5, 6.4]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Main Hall */}
          <mesh position={[0, 2.0, -0.5]} castShadow receiveShadow>
            <boxGeometry args={[7.8, 3.0, 5.0]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.7} />
          </mesh>
          {/* Pillar Verandah Columns */}
          {[-3.2, -1.1, 1.1, 3.2].map((x, idx) => (
            <mesh key={idx} position={[x, 1.75, 2.2]} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 2.5, 16]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          ))}
          {/* Verandah Roof */}
          <mesh position={[0, 3.1, 0.8]} castShadow>
            <boxGeometry args={[8.2, 0.3, 3.0]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {/* Indian National Flag Mast */}
          <mesh position={[3.4, 2.5, 2.4]}>
            <cylinderGeometry args={[0.04, 0.04, 4.5]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
          </mesh>
          {/* Flag Tricolor */}
          <mesh position={[3.8, 4.2, 2.4]}>
            <boxGeometry args={[0.8, 0.5, 0.02]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
        </group>
      </InteractiveObject>
    </group>
  );
};
