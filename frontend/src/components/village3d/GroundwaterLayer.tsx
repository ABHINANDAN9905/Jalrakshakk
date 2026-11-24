import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

export const GroundwaterLayer: React.FC = () => {
  const isUndergroundView = useGameStore((state) => state.isUndergroundView);
  const groundwaterData = useGameStore((state) => state.groundwaterData);
  const metrics = groundwaterData.metrics;

  const waterSurfaceRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Dynamic calculation of water table height (Y coordinate in 3D world)
  // At 100% storage: Y = -4.0m (near surface)
  // At 0% storage: Y = -18.0m (severely depleted)
  const targetWaterY = -18.0 + (metrics.storagePercentage / 100) * 14.0;

  // Condition color mapping
  let aquiferColor = '#0ea5e9'; // SAFE
  if (metrics.conditionCategory === 'CRITICAL') aquiferColor = '#ef4444';
  else if (metrics.conditionCategory === 'SEMI_CRITICAL') aquiferColor = '#f97316';
  else if (metrics.conditionCategory === 'OPTIMAL') aquiferColor = '#06b6d4';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (waterSurfaceRef.current) {
      // Smooth interpolation towards target water table height
      waterSurfaceRef.current.position.y += (targetWaterY - waterSurfaceRef.current.position.y) * 0.05;
      // Gentle aquifer wave oscillation
      waterSurfaceRef.current.position.y += Math.sin(t * 1.2) * 0.02;
    }

    if (particlesRef.current) {
      // Slowly rotate or translate recharge particles downward
      particlesRef.current.rotation.y = t * 0.05;
    }
  });

  if (!isUndergroundView) {
    return null;
  }

  // Generate recharge infiltration particle positions
  const particleCount = 120;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 60; // X
    particlePositions[i * 3 + 1] = -1.0 - Math.random() * 14.0; // Y (infiltrating)
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60; // Z
  }

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Topsoil & Weathered Regolith Layer Box */}
      <mesh position={[0, -2.5, 0]}>
        <boxGeometry args={[80, 5, 80]} />
        <meshStandardMaterial
          color="#78350f"
          roughness={0.9}
          transparent
          opacity={0.35}
          wireframe
        />
      </mesh>

      {/* 2. Weathered Rock / Fractured Basalt Strata */}
      <mesh position={[0, -8.0, 0]}>
        <boxGeometry args={[82, 6, 82]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.8}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>

      {/* 3. Dynamic Water Table Saturated Zone */}
      <mesh
        ref={waterSurfaceRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, targetWaterY, 0]}
      >
        <planeGeometry args={[84, 84, 32, 32]} />
        <meshStandardMaterial
          color={aquiferColor}
          emissive={aquiferColor}
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 4. Deep Saturated Aquifer Mass (Below the Water Table) */}
      <mesh position={[0, -18, 0]}>
        <boxGeometry args={[84, 12, 84]} />
        <meshStandardMaterial
          color={aquiferColor}
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* 5. Cone of Depression under Agricultural Borewell [-16, 0, -12] */}
      <group position={[-16, targetWaterY - 1.5, -12]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[4.5, 3.5, 24, 1, true]} />
          <meshStandardMaterial
            color="#ef4444"
            transparent
            opacity={0.65}
            wireframe
          />
        </mesh>
      </group>

      {/* 6. Borewell Deep Extraction Shaft Column */}
      <mesh position={[-16, -10, -12]}>
        <cylinderGeometry args={[0.2, 0.2, 20, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
      </mesh>

      {/* 7. Open Well Shallow Shaft Column [-6, 0, 4] */}
      <mesh position={[-6, -6, 4]}>
        <cylinderGeometry args={[1.2, 1.2, 12, 16, 1, true]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} side={2} />
      </mesh>

      {/* 8. Downward Rainwater Infiltration Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.25}
          color="#38bdf8"
          transparent
          opacity={0.7}
        />
      </points>

      {/* 9. Impermeable Bedrock Base */}
      <mesh position={[0, -24.5, 0]}>
        <boxGeometry args={[86, 2, 86]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>
    </group>
  );
};
