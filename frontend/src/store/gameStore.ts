import { create } from 'zustand';
import { InteractiveObjectData } from '../types/game';
import { VillageGroundwaterSummary } from '../types/groundwater';
import { UserProgression } from '../types/progression';
import { BackendSimulationResponse, SimulationLifecycleState } from '../types/simulation';
import { DEFAULT_VILLAGE_GROUNDWATER } from '../services/groundwater.service';
import { DEFAULT_USER_PROGRESSION, progressionService } from '../services/progression.service';

interface RewardToastState {
  id: number;
  amount: number;
  reason: string;
}

interface LevelUpModalState {
  newLevel: number;
  levelTitle: string;
  perks?: string;
}

interface GameState {
  // Visual & Inspection State
  selectedObject: InteractiveObjectData | null;
  isUndergroundView: boolean;
  isDayTime: boolean;
  cameraResetTrigger: number;
  isSimulationModalOpen: boolean;

  // Real-Time Socket Connection State
  isSocketConnected: boolean;

  // Simulation Lifecycle State
  simulationLifecycle: SimulationLifecycleState;
  latestSimulationResult: BackendSimulationResponse | null;

  // Hydrological & Simulation Data
  groundwaterData: VillageGroundwaterSummary;
  
  // Progression & Player State (Backend Authoritative)
  userProgression: UserProgression;
  activeMissionId: string | null;

  // Notification UI States
  rewardToast: RewardToastState | null;
  levelUpInfo: LevelUpModalState | null;

  // Actions
  selectObject: (object: InteractiveObjectData | null) => void;
  toggleUndergroundView: () => void;
  setUndergroundView: (enabled: boolean) => void;
  toggleDayNight: () => void;
  resetCamera: () => void;
  setSimulationModalOpen: (open: boolean) => void;
  setSocketConnected: (connected: boolean) => void;
  setSimulationLifecycle: (state: SimulationLifecycleState) => void;
  setLatestSimulation: (result: BackendSimulationResponse | null) => void;
  applySimulationResult: (result: BackendSimulationResponse) => void;
  setGroundwaterData: (data: VillageGroundwaterSummary) => void;
  updateGroundwaterMetrics: (metrics: Partial<VillageGroundwaterSummary['metrics']>) => void;
  setUserProgression: (progression: UserProgression) => void;
  setActiveMissionId: (missionId: string | null) => void;
  showRewardToast: (amount: number, reason: string) => void;
  dismissRewardToast: () => void;
  showLevelUpModal: (newLevel: number, levelTitle: string, perks?: string) => void;
  dismissLevelUpModal: () => void;
  refreshProgression: () => Promise<void>;
  applyAuthoritativeReward: (amount: number, reason: string, newProgression?: any) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  selectedObject: null,
  isUndergroundView: false,
  isDayTime: true,
  cameraResetTrigger: 0,
  isSimulationModalOpen: false,

  isSocketConnected: false,
  simulationLifecycle: 'IDLE',
  latestSimulationResult: null,

  groundwaterData: DEFAULT_VILLAGE_GROUNDWATER,
  userProgression: DEFAULT_USER_PROGRESSION,
  activeMissionId: 'm-101',

  rewardToast: null,
  levelUpInfo: null,

  selectObject: (object) => set({ selectedObject: object }),

  toggleUndergroundView: () => 
    set((state) => ({ isUndergroundView: !state.isUndergroundView })),

  setUndergroundView: (enabled) => 
    set({ isUndergroundView: enabled }),

  toggleDayNight: () => 
    set((state) => ({ isDayTime: !state.isDayTime })),

  resetCamera: () => 
    set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 })),

  setSimulationModalOpen: (open) => 
    set({ 
      isSimulationModalOpen: open,
      simulationLifecycle: open ? 'CONFIGURING' : 'IDLE'
    }),

  setSocketConnected: (connected) => 
    set({ isSocketConnected: connected }),

  setSimulationLifecycle: (lifecycle) => 
    set({ simulationLifecycle: lifecycle }),

  setLatestSimulation: (result) => 
    set({ latestSimulationResult: result }),

  applySimulationResult: (result) =>
    set((state) => {
      const wb = result.waterBalance;
      const depthMeters = Number((22.0 - (wb.storagePercentage / 100.0) * 12.0).toFixed(1));

      return {
        simulationLifecycle: 'COMPLETED',
        latestSimulationResult: result,
        groundwaterData: {
          ...state.groundwaterData,
          metrics: {
            ...state.groundwaterData.metrics,
            storagePercentage: wb.storagePercentage,
            depthToWaterTableMeters: depthMeters,
            conditionCategory: wb.conditionCategory,
            annualRechargeM3: wb.rechargeM3,
            annualExtractionM3: wb.extractionM3,
            waterQualityIndex: result.waterQuality.finalWQI,
            rainfallMm: wb.rainfallMm,
            lastSimulatedDate: result.executedAt || new Date().toISOString(),
          },
        },
        userProgression: {
          ...state.userProgression,
          sustainabilityScore: result.sustainability.overallScore,
        },
      };
    }),

  setGroundwaterData: (data) => 
    set({ groundwaterData: data }),

  updateGroundwaterMetrics: (metrics) =>
    set((state) => ({
      groundwaterData: {
        ...state.groundwaterData,
        metrics: {
          ...state.groundwaterData.metrics,
          ...metrics,
        },
      },
    })),

  setUserProgression: (progression) => 
    set({ userProgression: progression }),

  setActiveMissionId: (missionId) =>
    set({ activeMissionId: missionId }),

  showRewardToast: (amount, reason) =>
    set({
      rewardToast: {
        id: Date.now(),
        amount,
        reason
      }
    }),

  dismissRewardToast: () =>
    set({ rewardToast: null }),

  showLevelUpModal: (newLevel, levelTitle, perks) =>
    set({
      levelUpInfo: {
        newLevel,
        levelTitle,
        perks
      }
    }),

  dismissLevelUpModal: () =>
    set({ levelUpInfo: null }),

  refreshProgression: async () => {
    try {
      const data = await progressionService.getMyProgression();
      const currentLevel = get().userProgression.currentLevel;

      set((state) => ({
        userProgression: {
          ...state.userProgression,
          totalXP: data.currentXP,
          currentLevel: data.currentLevel,
          levelTitle: data.levelTitle,
          xpToNextLevel: data.minXPForNextLevel || data.currentXP,
          xpCurrentLevelProgress: data.currentXP - (data.minXPForCurrentLevel || 0),
          completedMissionsCount: data.completedMissionsCount ?? state.userProgression.completedMissionsCount,
          earnedAchievementsCount: data.achievementsCount ?? state.userProgression.earnedAchievementsCount,
        }
      }));

      // Trigger level-up modal if level increased
      if (data.currentLevel > currentLevel) {
        get().showLevelUpModal(data.currentLevel, data.levelTitle, data.perks);
      }
    } catch (err) {
      console.error('Failed to sync progression from server:', err);
    }
  },

  applyAuthoritativeReward: (amount, reason, newProgression) => {
    if (amount > 0) {
      get().showRewardToast(amount, reason);
    }
    if (newProgression) {
      const oldLevel = get().userProgression.currentLevel;
      set((state) => ({
        userProgression: {
          ...state.userProgression,
          totalXP: newProgression.totalXP ?? state.userProgression.totalXP,
          currentLevel: newProgression.currentLevel ?? state.userProgression.currentLevel,
          levelTitle: newProgression.levelTitle ?? state.userProgression.levelTitle,
          xpToNextLevel: newProgression.minXPForNextLevel ?? state.userProgression.xpToNextLevel,
        }
      }));
      if (newProgression.currentLevel > oldLevel) {
        get().showLevelUpModal(newProgression.currentLevel, newProgression.levelTitle, newProgression.perks);
      }
    } else {
      get().refreshProgression();
    }
  }
}));
