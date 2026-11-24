import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InteractiveObject } from './InteractiveObject';
import { InteractiveObjectData } from '../../types/game';

const RIVER_DATA: InteractiveObjectData = {
  id: 'river-gangapur-01',
  name: 'Seasonal River / Drainage Stream',
  category: 'RIVER',
  position: [0, 0, -32],
  description: 'Natural monsoon drainage stream that flows through the village watershed, feeding downstream aquifers and community water reservoirs.',
  educationalRole: 'Highlights watershed connectivity. Upstream soil conservation and vegetation slow runoff velocity, turning flash floods into steady sub-surface recharge.',
  waterStatus: {
    label: 'Seasonal Flow',
    value: 'Monsoon discharge active',
    trend: 'stable',
    color: '#0284c7',
  },
  metrics: {
    rechargeContribution: '180,000 m³ / season',
    waterQuality: 'Clear, low turbidity',
  },
  recommendedActions: [
    'Plant vetiver grass along river embankments to stop siltation',
    'Enforce zero untreated sewage dumping into the stream',
  ],
};

const POND_DATA: InteractiveObjectData = {
  id: 'pond-village-talab',
  name: 'Village Community Pond (Talab)',
  category: 'POND',
  position: [-16, 0, -6],
  description: 'Centuries-old community pond with stone steps (ghat) and earthen bunds, acting as a perennial surface water buffer and groundwater recharge sink.',
  educationalRole: 'Shows the vital role of traditional surface water bodies. A healthy, de-silted pond elevates water tables in nearby agricultural wells by up to 4 meters.',
  waterStatus: {
    label: 'Good Infiltration',
    value: 'Capacity: 35,000 m³ (78% filled)',
    trend: 'up',
    color: '#0ea5e9',
  },
  metrics: {
    storageCapacity: '35,000 m³',
    rechargeContribution: '1,200 m³ / day percolation',
    waterQuality: 'Good (Fish stocked)',
  },
  recommendedActions: [
    'Annual pre-monsoon community desilting (Shramdaan)',
    'Construct catch trenches to trap silt before runoff enters pond',
  ],
};

const TANK_DATA: InteractiveObjectData = {
  id: 'tank-overhead-community',
  name: 'Elevated Community Water Reservoir (Overhead Tank)',
  category: 'COMMUNITY_TANK',
  position: [14, 0, -4],
  description: 'Overhead concrete distribution tank supplying piped drinking water to all village households under the Jal Jeevan Mission.',
  educationalRole: 'Teaches piped drinking water logistics, pressure maintenance, chlorinated disinfection, and reducing household transport burden.',
  waterStatus: {
    label: 'Supply Active',
    value: '55 Liters Per Capita per Day',
    trend: 'stable',
    color: '#06b6d4',
  },
  metrics: {
    storageCapacity: '50,000 Liters',
    waterQuality: 'Chlorinated, Potable (TDS 180)',
    efficiencyRating: '95% pipeline integrity',
  },
  recommendedActions: [
    'Bi-weekly water quality testing with Field Test Kits (FTK)',
    'Acoustic leak detection on underground distribution pipes',
  ],
};

export const WaterBodies: React.FC = () => {
  const waterMeshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (waterMeshRef.current) {
      // Subtle water shimmer/oscillation
      const t = clock.getElapsedTime();
      waterMeshRef.current.position.y = -0.15 + Math.sin(t * 1.5) * 0.04;
    }
  });

  return (
    <group>
      {/* 1. Meandering River Stream */}
      <InteractiveObject data={RIVER_DATA}>
        <group>
          {/* Stream Bed Cut */}
          <mesh position={[0, -0.25, 0]} receiveShadow>
            <boxGeometry args={[90, 0.4, 9]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          {/* River Water Surface */}
          <mesh ref={waterMeshRef} position={[0, -0.15, 0]}>
            <boxGeometry args={[90, 0.1, 8.4]} />
            <meshStandardMaterial
              color="#0284c7"
              roughness={0.1}
              metalness={0.8}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* River Banks Stones */}
          {[-35, -20, -5, 10, 25, 40].map((x, i) => (
            <mesh key={i} position={[x, -0.05, 4.2]} castShadow>
              <dodecahedronGeometry args={[0.5, 0]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.8} />
            </mesh>
          ))}
        </group>
      </InteractiveObject>

      {/* 2. Village Community Pond (Talab) */}
      <InteractiveObject data={POND_DATA}>
        <group>
          {/* Pond Basin Excavation Rim */}
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <cylinderGeometry args={[7.2, 5.5, 0.8, 32]} />
            <meshStandardMaterial color="#78716c" roughness={0.9} />
          </mesh>
          {/* Pond Water Layer */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[6.8, 6.8, 0.4, 32]} />
            <meshStandardMaterial
              color="#0891b2"
              roughness={0.15}
              metalness={0.6}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Stone Steps (Ghat) */}
          {[0, 1, 2].map((step) => (
            <mesh key={step} position={[0, 0.2 + step * 0.15, 6.4 - step * 0.5]} castShadow>
              <boxGeometry args={[4.5, 0.15, 0.6]} />
              <meshStandardMaterial color="#a8a29e" />
            </mesh>
          ))}
        </group>
      </InteractiveObject>

      {/* 3. Elevated Overhead Tank */}
      <InteractiveObject data={TANK_DATA}>
        <group>
          {/* Concrete Tank Cylinder */}
          <mesh position={[0, 8.5, 0]} castShadow>
            <cylinderGeometry args={[3, 3, 3.2, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          {/* Tank Conical Roof */}
          <mesh position={[0, 10.5, 0]} castShadow>
            <coneGeometry args={[3.2, 0.9, 24]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          {/* 4 Concrete Pillars */}
          {[
            [-1.8, -1.8],
            [1.8, -1.8],
            [-1.8, 1.8],
            [1.8, 1.8],
          ].map(([px, pz], idx) => (
            <mesh key={idx} position={[px, 3.5, pz]} castShadow>
              <cylinderGeometry args={[0.22, 0.25, 7.0, 12]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
          ))}
          {/* Inflow / Outflow Center Pipe */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 7.0, 12]} />
            <meshStandardMaterial color="#0369a1" metalness={0.7} />
          </mesh>
          {/* Foundation Slab */}
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[5.2, 0.2, 5.2]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        </group>
      </InteractiveObject>
    </group>
  );
};
