import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useGameStore } from '../../store/gameStore';
import { VillageTerrain } from './VillageTerrain';
import { VillageHouses } from './VillageHouses';
import { AgriculturalFields } from './AgriculturalFields';
import { WaterBodies } from './WaterBodies';
import { ConservationStructures } from './ConservationStructures';
import { VillageInfrastructure } from './VillageInfrastructure';
import { Vegetation } from './Vegetation';
import { GroundwaterLayer } from './GroundwaterLayer';

export const VillageScene: React.FC = () => {
  const isDayTime = useGameStore((state) => state.isDayTime);
  const isUndergroundView = useGameStore((state) => state.isUndergroundView);
  const cameraResetTrigger = useGameStore((state) => state.cameraResetTrigger);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (controlsRef.current) {
      if (isUndergroundView) {
        // Perspective targeted down towards sub-surface aquifer
        controlsRef.current.target.set(0, -8, 0);
        controlsRef.current.object.position.set(25, -2, 35);
      } else {
        // Isometric village overview
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.object.position.set(30, 24, 34);
      }
      controlsRef.current.update();
    }
  }, [cameraResetTrigger, isUndergroundView]);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera
          makeDefault
          position={isUndergroundView ? [25, -2, 35] : [30, 24, 34]}
          fov={45}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={10}
          maxDistance={120}
          maxPolarAngle={isUndergroundView ? Math.PI : Math.PI / 2.05}
          target={isUndergroundView ? [0, -8, 0] : [0, 0, 0]}
        />

        {/* Ambient & Directional Environmental Lighting */}
        <ambientLight
          intensity={
            isUndergroundView
              ? 0.4
              : isDayTime
              ? 0.7
              : 0.2
          }
          color={isUndergroundView ? '#38bdf8' : isDayTime ? '#fff7ed' : '#93c5fd'}
        />

        <directionalLight
          position={isDayTime ? [40, 50, 30] : [-30, 40, -20]}
          intensity={isDayTime ? 1.6 : 0.4}
          color={isDayTime ? '#fef08a' : '#bae6fd'}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={140}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-45}
        />

        {/* Sub-surface accent point lights for aquifer illumination in Underground mode */}
        {isUndergroundView && (
          <>
            <pointLight position={[0, -12, 0]} intensity={1.5} color="#38bdf8" distance={60} />
            <pointLight position={[-16, -10, -12]} intensity={2.0} color="#f97316" distance={25} />
          </>
        )}

        {/* Background Fog & Color */}
        <color
          attach="background"
          args={[
            isUndergroundView
              ? '#020617'
              : isDayTime
              ? '#7dd3fc'
              : '#090d16',
          ]}
        />
        <fog
          attach="fog"
          args={[
            isUndergroundView
              ? '#020617'
              : isDayTime
              ? '#bae6fd'
              : '#090d16',
            25,
            125,
          ]}
        />

        {/* Scene Meshes */}
        <VillageTerrain />
        <VillageHouses />
        <AgriculturalFields />
        <WaterBodies />
        <ConservationStructures />
        <VillageInfrastructure />
        <Vegetation />
        <GroundwaterLayer />
      </Canvas>
    </div>
  );
};
