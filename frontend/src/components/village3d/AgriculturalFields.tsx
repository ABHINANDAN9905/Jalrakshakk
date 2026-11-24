import React from 'react';
import { InteractiveObject } from './InteractiveObject';
import { InteractiveObjectData } from '../../types/game';

const FLOOD_FARM_DATA: InteractiveObjectData = {
  id: 'farm-sugarcane-01',
  name: 'Flood-Irrigated Cash Crop Field (Sugarcane)',
  category: 'FARM',
  position: [-22, 0, -18],
  description: 'Water-intensive sugarcane plantation irrigated via conventional furrow flood irrigation without moisture meters.',
  educationalRole: 'Exemplifies high water extraction demand. Flood irrigation suffers up to 50% water loss from evaporation, runoff, and unneeded deep percolation below root zones.',
  waterStatus: {
    label: 'High Depletion Risk',
    value: '22,000 m³ / hectare / season',
    trend: 'down',
    color: '#ef4444',
  },
  metrics: {
    extractionRate: '22,000 m³/ha',
    efficiencyRating: '38% (High losses)',
    waterQuality: 'Fertilizer runoff detected',
  },
  recommendedActions: [
    'Switch from furrow flooding to subsurface drip irrigation',
    'Adopt crop diversification: rotate with legumes or millets',
    'Install soil tensiometers to irrigate only when root moisture drops',
  ],
};

const DRIP_FARM_DATA: InteractiveObjectData = {
  id: 'farm-drip-millet-02',
  name: 'Micro-Irrigated Millet & Pulses Field',
  category: 'FARM',
  position: [24, 0, -18],
  description: 'Drought-resilient pearl millet (Bajra) and pigeon pea farm utilizing automated solar-powered drip lateral lines.',
  educationalRole: 'Demonstrates climate-smart agriculture. Drip irrigation delivers water directly to plant root zones, saving 55–65% water compared to flood irrigation.',
  waterStatus: {
    label: 'High Efficiency',
    value: '4,200 m³ / hectare / season',
    trend: 'up',
    color: '#10b981',
  },
  metrics: {
    extractionRate: '4,200 m³/ha',
    efficiencyRating: '92% (Optimal efficiency)',
    waterQuality: 'Nil chemical runoff',
  },
  recommendedActions: [
    'Apply organic straw mulching to conserve topsoil moisture',
    'Maintain drip emitters every month to prevent calcification clogs',
  ],
};

export const AgriculturalFields: React.FC = () => {
  return (
    <group>
      {/* 1. Flood-Irrigated Sugarcane Field */}
      <InteractiveObject data={FLOOD_FARM_DATA}>
        <group>
          {/* Farm Soil Plot */}
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[14, 0.1, 14]} />
            <meshStandardMaterial color="#5c433b" roughness={0.9} />
          </mesh>

          {/* Flooding Furrows (Water shimmer in ditches) */}
          {[-5, -2.5, 0, 2.5, 5].map((z, idx) => (
            <mesh key={idx} position={[0, 0.11, z]}>
              <boxGeometry args={[13.5, 0.02, 0.8]} />
              <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.4} />
            </mesh>
          ))}

          {/* Tall Sugarcane Crop Stalks (Dense green stalks) */}
          {[-5, -2.5, 0, 2.5, 5].map((z, rowIdx) =>
            [-5, -3, -1, 1, 3, 5].map((x, colIdx) => (
              <mesh key={`${rowIdx}-${colIdx}`} position={[x, 1.2, z + 0.6]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 2.2, 8]} />
                <meshStandardMaterial color="#4d7c0f" roughness={0.6} />
              </mesh>
            ))
          )}

          {/* Farm Boundary Ridge (Bund) */}
          <mesh position={[0, 0.2, 7.1]} castShadow>
            <boxGeometry args={[14.4, 0.3, 0.4]} />
            <meshStandardMaterial color="#846358" />
          </mesh>
        </group>
      </InteractiveObject>

      {/* 2. Drip-Irrigated Millet Field */}
      <InteractiveObject data={DRIP_FARM_DATA}>
        <group>
          {/* Farm Soil Plot */}
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[14, 0.1, 14]} />
            <meshStandardMaterial color="#846358" roughness={0.8} />
          </mesh>

          {/* Drip Irrigation Lateral Black Pipes */}
          {[-5, -2.5, 0, 2.5, 5].map((z, idx) => (
            <mesh key={idx} position={[0, 0.12, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 13.5, 8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} />
            </mesh>
          ))}

          {/* Millet Bushes / Crops with Golden Grain heads */}
          {[-5, -2.5, 0, 2.5, 5].map((z, rowIdx) =>
            [-5, -3, -1, 1, 3, 5].map((x, colIdx) => (
              <group key={`${rowIdx}-${colIdx}`} position={[x, 0, z]}>
                <mesh position={[0, 0.6, 0]} castShadow>
                  <coneGeometry args={[0.4, 1.1, 6]} />
                  <meshStandardMaterial color="#65a30d" />
                </mesh>
                <mesh position={[0, 1.25, 0]}>
                  <sphereGeometry args={[0.15, 6, 6]} />
                  <meshStandardMaterial color="#eab308" />
                </mesh>
              </group>
            ))
          )}
        </group>
      </InteractiveObject>
    </group>
  );
};
