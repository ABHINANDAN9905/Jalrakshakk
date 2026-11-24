import { useEffect } from 'react';
import { socketService } from '../services/socket.service';
import { useGameStore } from '../store/gameStore';

export const useSocket = (villageId?: string) => {
  const setSocketConnected = useGameStore((state) => state.setSocketConnected);
  const updateGroundwaterMetrics = useGameStore((state) => state.updateGroundwaterMetrics);
  const setLatestSimulation = useGameStore((state) => state.setLatestSimulation);

  useEffect(() => {
    // 1. Establish socket connection
    const socket = socketService.connect();

    // 2. Listen to connection state
    const unsubscribeConn = socketService.onConnectionChange((connected) => {
      setSocketConnected(connected);
    });

    // 3. Subscribe to the active village room
    const targetVillageId = villageId || 'v-sangamner-01';
    socketService.subscribeVillage(targetVillageId);

    // 4. Handle real-time simulation updates
    const unsubscribeSim = socketService.onSimulationCompleted((data) => {
      if (data && data.waterBalance) {
        setLatestSimulation(data);
        updateGroundwaterMetrics({
          storagePercentage: data.waterBalance.storagePercentage,
          conditionCategory: data.waterBalance.conditionCategory,
          annualRechargeM3: data.waterBalance.rechargeM3,
          annualExtractionM3: data.waterBalance.extractionM3,
          waterQualityIndex: data.waterQuality?.finalWQI || 80,
          rainfallMm: data.waterBalance.rainfallMm || 700,
        });
      }
    });

    // 5. Handle village-wide broadcast updates
    const unsubscribeVillage = socketService.onVillageUpdated((payload) => {
      if (payload && payload.storagePercentage !== undefined) {
        updateGroundwaterMetrics({
          storagePercentage: payload.storagePercentage,
          conditionCategory: payload.conditionCategory,
          annualRechargeM3: payload.rechargeM3,
          annualExtractionM3: payload.extractionM3,
          waterQualityIndex: payload.waterQualityIndex || 80,
        });
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConn();
      unsubscribeSim();
      unsubscribeVillage();
      socketService.unsubscribeVillage(targetVillageId);
    };
  }, [villageId, setSocketConnected, updateGroundwaterMetrics, setLatestSimulation]);
};

export default useSocket;
