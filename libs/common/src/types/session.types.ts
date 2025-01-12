export interface LocationData {
   country?: string;
   city?: string;
   latitude?: number;
   longitude?: number;
}

export interface DeviceData {
   client?: string;
   os?: string;
   device?: string;
}

export interface SessionMetadata {
   location: LocationData;
   device: DeviceData;
   ip: string;
}
