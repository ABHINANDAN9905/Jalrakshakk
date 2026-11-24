import React from 'react';
import { VillageScene } from '../components/village3d/VillageScene';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { RightContextPanel } from '../components/game-hud/RightContextPanel';
import { BottomControls } from '../components/game-hud/BottomControls';
import { SimulationModal } from '../components/game-hud/SimulationModal';
import { useSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';

export const VillagePage: React.FC = () => {
  const villageId = useGameStore((state) => state.groundwaterData.villageId);
  useSocket(villageId);

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-950">
      {/* 3D Village & Aquifer Scene */}
      <VillageScene />

      {/* Floating Game HUD Overlays */}
      <TopHUD />
      <LeftNav />
      <RightContextPanel />
      <BottomControls />
      <SimulationModal />
    </main>
  );
};
