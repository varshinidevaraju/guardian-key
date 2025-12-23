export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  isParent: boolean;
}

export interface UserSettings {
  isSetupComplete: boolean;
  deactivationCode: string;
  triggerSequence: string;
  emergencyContacts: EmergencyContact[];
  userName: string;
  userPhone: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export interface EmergencyState {
  isActive: boolean;
  isRecording: boolean;
  triggerTime: number | null;
  escalationLevel: number;
  location: LocationData | null;
  mediaStream: MediaStream | null;
  recordedChunks: Blob[];
}

export type AppMode = 'calculator' | 'setup' | 'emergency' | 'deactivate';
