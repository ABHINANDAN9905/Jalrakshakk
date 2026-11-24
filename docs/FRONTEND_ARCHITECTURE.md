# JalRakshak Frontend Architecture

## 1. Overview
The JalRakshak frontend is a high-performance, browser-based 3D educational game and hydrological intelligence interface built using:
- **React 18** & **TypeScript**
- **Vite** bundler
- **Three.js** & **React Three Fiber (R3F)** for WebGL 3D rendering
- **@react-three/drei** for camera controls, HTML overlays, and billboard helpers
- **Tailwind CSS** for modern glassmorphic UI components
- **Zustand** for centralized game and simulation state management
- **Recharts** for scientific water balance charts and trend graphs
- **React Router v6** for multi-view navigation

---

## 2. Architecture & Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── game-hud/              # Floating HUD elements
│   │   │   ├── BottomControls.tsx  # Underground toggle, day/night, simulation trigger
│   │   │   ├── LeftNav.tsx         # Route navigation
│   │   │   ├── RightContextPanel.tsx # Object inspection and conservation actions
│   │   │   ├── SimulationModal.tsx # Interactive parameter slider modal
│   │   │   └── TopHUD.tsx          # Village stats, water table depth, student XP & Level
│   │   └── village3d/             # 3D Scene procedural components
│   │       ├── AgriculturalFields.tsx # Flood vs drip irrigation plots
│   │       ├── ConservationStructures.tsx # Check dams, percolation tanks, RWH
│   │       ├── GroundwaterLayer.tsx   # Subterranean strata & dynamic water table mesh
│   │       ├── InteractiveObject.tsx  # Raycasting, hover badge, selection indicator
│   │       ├── Vegetation.tsx         # Indian neem, banyan, and palm trees
│   │       ├── VillageHouses.tsx      # Kutcha huts, pucca RWH house, Gram Panchayat
│   │       ├── VillageInfrastructure.tsx # Open masonry well, borewell pump shed
│   │       ├── VillageScene.tsx       # Canvas container, lights, fog, OrbitControls
│   │       └── VillageTerrain.tsx     # Stylized landscape mesh & village roads
│   ├── pages/
│   │   ├── AchievementsPage.tsx   # Badges & honors
│   │   ├── AnalyticsPage.tsx      # Scientific water budget graphs
│   │   ├── ChallengesPage.tsx     # Daily conservation quests
│   │   ├── LeaderboardPage.tsx    # State ranking
│   │   ├── MissionsPage.tsx       # Sequential learning directives
│   │   └── VillagePage.tsx        # Main 3D game screen
│   ├── services/
│   │   ├── api.ts                 # Axios instance with bearer token interceptor
│   │   ├── groundwater.service.ts # Real-time village aquifer metrics
│   │   ├── progression.service.ts # Missions, XP, and badges
│   │   └── simulation.service.ts  # Scientific simulation run runner & fallback model
│   ├── store/
│   │   └── gameStore.ts           # Central Zustand store
│   ├── types/                     # TypeScript type contracts
│   ├── App.tsx                    # Route definitions
│   └── main.tsx                   # App bootstrap
```

---

## 3. State Management with Zustand (`useGameStore`)
The Zustand store encapsulates:
1. **Interactive Selection**: `selectedObject` (active clicked 3D object details).
2. **View Modes**:
   - `isUndergroundView`: Toggles between surface Indian village and subterranean geological strata.
   - `isDayTime`: Toggles diurnal lighting (sunlight vs moonlight).
3. **Simulation Data**: `groundwaterData` reflecting water table elevation, storage %, annual recharge, extraction draft, and WQI.
4. **Student Progression**: `userProgression` maintaining XP, level titles, sustainability scores, and badge collections.

---

## 4. Performance Optimizations for Standard Laptops
- **Procedural Low-Poly Meshes**: Custom Three.js geometries avoid heavy multi-megabyte GLTF downloads, ensuring sub-second initial load times.
- **Dynamic Lighting**: Clamped directional shadows with soft ambient fill light.
- **Wireframe Strata in Underground Mode**: Geological layers render transparently with wireframes, reducing overdraw while emphasizing the saturated aquifer mesh.
- **Responsive Canvas**: `dpr={[1, 2]}` automatically throttles pixel ratio on high-density mobile and laptop screens.
