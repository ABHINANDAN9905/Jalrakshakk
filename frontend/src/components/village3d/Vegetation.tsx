import React from 'react';

interface TreeProps {
  position: [number, number, number];
  scale?: number;
  type?: 'NEEM' | 'BANYAN' | 'PALM';
}

const SingleTree: React.FC<TreeProps> = ({ position, scale = 1, type = 'NEEM' }) => {
  if (type === 'PALM') {
    return (
      <group position={position} scale={[scale, scale, scale]}>
        {/* Slender curved trunk */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.22, 5.0, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {/* Palm frond canopy */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[0, 5.0, 0]}
            rotation={[0.4, (i * Math.PI * 2) / 5, 0.4]}
            castShadow
          >
            <boxGeometry args={[0.3, 0.05, 2.8]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>
        ))}
      </group>
    );
  }

  if (type === 'BANYAN') {
    return (
      <group position={position} scale={[scale, scale, scale]}>
        {/* Massive Trunk */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.9, 4, 10]} />
          <meshStandardMaterial color="#573a2e" roughness={0.9} />
        </mesh>
        {/* Aerial Prop Roots */}
        {[-1.2, 1.2].map((x, i) => (
          <mesh key={i} position={[x, 1.5, 0.8]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 3]} />
            <meshStandardMaterial color="#442a20" />
          </mesh>
        ))}
        {/* Sprawling Canopy */}
        <mesh position={[0, 4.5, 0]} castShadow>
          <sphereGeometry args={[3.2, 8, 8]} />
          <meshStandardMaterial color="#166534" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  // Default: Neem Tree
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 3.0, 8]} />
        <meshStandardMaterial color="#654321" roughness={0.85} />
      </mesh>
      {/* Foliage Layers */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <dodecahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.5, 0]} castShadow>
        <dodecahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} />
      </mesh>
    </group>
  );
};

export const Vegetation: React.FC = () => {
  const treePositions: TreeProps[] = [
    // Sacred Banyan near Panchayat / Choupai
    { position: [8, 0, -8], scale: 1.2, type: 'BANYAN' },
    // Neem Trees along pathways
    { position: [-12, 0, 3], scale: 1.0, type: 'NEEM' },
    { position: [-4, 0, 14], scale: 0.9, type: 'NEEM' },
    { position: [18, 0, 8], scale: 1.1, type: 'NEEM' },
    { position: [6, 0, 16], scale: 0.85, type: 'NEEM' },
    // Palm Trees along River Bank and Pond
    { position: [-26, 0, -28], scale: 1.1, type: 'PALM' },
    { position: [-8, 0, -28], scale: 1.2, type: 'PALM' },
    { position: [12, 0, -28], scale: 1.0, type: 'PALM' },
    { position: [30, 0, -28], scale: 1.3, type: 'PALM' },
    { position: [-22, 0, -4], scale: 0.95, type: 'PALM' },
  ];

  return (
    <group>
      {treePositions.map((t, idx) => (
        <SingleTree key={idx} {...t} />
      ))}
    </group>
  );
};
