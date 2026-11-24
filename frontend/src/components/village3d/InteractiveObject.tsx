import React, { useState } from 'react';
import { InteractiveObjectData } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { Html } from '@react-three/drei';

interface InteractiveObjectProps {
  data: InteractiveObjectData;
  children: React.ReactNode;
  position?: [number, number, number];
}

export const InteractiveObject: React.FC<InteractiveObjectProps> = ({ data, children, position }) => {
  const [hovered, setHovered] = useState(false);
  const selectObject = useGameStore((state) => state.selectObject);
  const selectedObject = useGameStore((state) => state.selectedObject);

  const isSelected = selectedObject?.id === data.id;

  return (
    <group
      position={position || data.position}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(data);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Visual selection indicator ring */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#38bdf8' : '#fbbf24'}
            transparent
            opacity={isSelected ? 0.8 : 0.4}
          />
        </mesh>
      )}

      {/* Floating Mini-Badge on Hover */}
      {hovered && !isSelected && (
        <Html position={[0, 2.4, 0]} center distanceFactor={15}>
          <div className="bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-full border border-sky-400 shadow-lg whitespace-nowrap pointer-events-none flex items-center gap-1.5 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-semibold">{data.name}</span>
          </div>
        </Html>
      )}

      {children}
    </group>
  );
};
