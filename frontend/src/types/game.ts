export type ObjectCategory = 
  | 'HOUSE' 
  | 'FARM' 
  | 'WELL' 
  | 'BOREWELL' 
  | 'POND' 
  | 'CHECK_DAM' 
  | 'PERCOLATION_TANK' 
  | 'RAINWATER_HARVESTING' 
  | 'COMMUNITY_TANK' 
  | 'RIVER';

export interface InteractiveObjectData {
  id: string;
  name: string;
  category: ObjectCategory;
  position: [number, number, number];
  description: string;
  educationalRole: string;
  waterStatus: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    color: string;
  };
  metrics: {
    extractionRate?: string;
    rechargeContribution?: string;
    storageCapacity?: string;
    waterQuality?: string;
    efficiencyRating?: string;
  };
  recommendedActions: string[];
}

export interface VillageObjectItem {
  id: string;
  name: string;
  category: ObjectCategory;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  customData?: Record<string, any>;
}
