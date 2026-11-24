import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const VillageTerrain: React.FC = () => {
  const isUndergroundView = useGameStore((state) => state.isUndergroundView);

  return (
    <group>
      {/* Main Ground Mesh */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100, 64, 64]} />
        <meshStandardMaterial
          color={isUndergroundView ? '#334155' : '#7c9d64'}
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={isUndergroundView ? 0.25 : 1.0}
          wireframe={isUndergroundView}
        />
      </mesh>

      {/* Village Road Network - Main earthen village pathway */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, 80]} />
        <meshStandardMaterial
          color="#d4b483"
          roughness={0.95}
          transparent
          opacity={isUndergroundView ? 0.15 : 0.95}
        />
      </mesh>

      {/* Branching pathway to farms and well */}
      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 3]}
        position={[-15, 0.03, 5]}
        receiveShadow
      >
        <planeGeometry args={[4, 40]} />
        <meshStandardMaterial
          color="#c8a26e"
          roughness={0.95}
          transparent
          opacity={isUndergroundView ? 0.15 : 0.95}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
        position={[18, 0.03, -10]}
        receiveShadow
      >
        <planeGeometry args={[4, 45]} />
        <meshStandardMaterial
          color="#c8a26e"
          roughness={0.95}
          transparent
          opacity={isUndergroundView ? 0.15 : 0.95}
        />
      </mesh>

      {/* Village Common Square / Choupai Ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        receiveShadow
      >
        <circleGeometry args={[9, 32]} />
        <meshStandardMaterial
          color="#cbb086"
          roughness={0.9}
          transparent
          opacity={isUndergroundView ? 0.15 : 1.0}
        />
      </mesh>
    </group>
  );
};
