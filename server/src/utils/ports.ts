export interface PortInfo {
  code: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const PORTS_DATABASE: Record<string, PortInfo> = {
  CNSHA: { code: 'CNSHA', name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737 },
  CNNGB: { code: 'CNNGB', name: 'Ningbo', country: 'China', lat: 29.8683, lng: 121.5440 },
  INMAA: { code: 'INMAA', name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707 },
  INBOM: { code: 'INBOM', name: 'Mumbai', country: 'India', lat: 18.9438, lng: 72.8360 },
  INMUN: { code: 'INMUN', name: 'Mundra', country: 'India', lat: 22.8397, lng: 69.7042 },
  INKOK: { code: 'INKOK', name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639 },
  LKCMB: { code: 'LKCMB', name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  SGSIN: { code: 'SGSIN', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
  MYTPP: { code: 'MYTPP', name: 'Tanjung Pelepas', country: 'Malaysia', lat: 1.3633, lng: 103.5475 },
  AEJEA: { code: 'AEJEA', name: 'Jebel Ali', country: 'UAE', lat: 24.9857, lng: 55.0273 },
  DEHAM: { code: 'DEHAM', name: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937 },
  NLRTM: { code: 'NLRTM', name: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lng: 4.4777 },
  GBFXT: { code: 'GBFXT', name: 'Felixstowe', country: 'UK', lat: 51.9625, lng: 1.3514 },
  USLAX: { code: 'USLAX', name: 'Los Angeles', country: 'USA', lat: 33.7423, lng: -118.2706 },
  USNYC: { code: 'USNYC', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
};

export function resolvePortCode(input: string): string {
  if (!input) return 'INMAA';
  const clean = input.trim().toUpperCase();
  if (PORTS_DATABASE[clean]) return clean;

  const lower = input.toLowerCase();
  for (const [code, info] of Object.entries(PORTS_DATABASE)) {
    if (info.name.toLowerCase().includes(lower) || lower.includes(info.name.toLowerCase())) {
      return code;
    }
  }

  return 'INMAA';
}
