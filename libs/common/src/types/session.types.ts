export type LocationData = {
   country?: string;
   city?: string;
   latitude?: number;
   longitude?: number;
};

export type DeviceData = {
   client?: string;
   os?: string;
   device?: string;
};

export type SessionMetadata = {
   location: LocationData;
   device: DeviceData;
   ip: string;
};
