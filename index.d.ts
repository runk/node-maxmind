export interface OpenOpts {
  cache?: {
    max: number,
  };
  watchForUpdates?: boolean;
  watchForUpdatesNonPersistent?: boolean;
  watchForUpdatesHook?: () => void;
}

export interface Names {
  readonly de?: string;
  readonly en: string;
  readonly es?: string;
  readonly fr?: string;
  readonly ja?: string;
  readonly 'pt-BR'?: string;
  readonly ru?: string;
  readonly 'zh-CN'?: string;
}

export interface CityRecord {
  readonly confidence?: number;
  readonly geoname_id: number;
  readonly names: Names;
}

export interface ContinentRecord {
  readonly code: 'AF' | 'AN' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA';
  readonly geoname_id: number;
  readonly names: Names;
}

export interface RegisteredCountryRecord {
  readonly geoname_id: number;
  readonly is_in_european_union?: boolean;
  readonly iso_code: string;
  readonly names: Names;
}

export interface CountryRecord extends RegisteredCountryRecord {
  readonly confidence?: number;
}

export interface LocationRecord {
  readonly accuracy_radius: number;
  readonly average_income?: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly metro_code?: number;
  readonly population_density?: number;
  readonly time_zone?: string;
}

export interface PostalRecord {
  readonly code: string;
  readonly confidence?: number;
}

export interface RepresentedCountryRecord extends RegisteredCountryRecord {
  readonly type: string;
}

export interface SubdivisionsRecord {
  readonly confidence?: number;
  readonly geoname_id: number;
  readonly iso_code: string;
  readonly names: Names;
}

export interface TraitsRecord {
  readonly autonomous_system_number?: number;
  readonly autonomous_system_organization?: string;
  readonly domain?: string;
  ip_address?: string;
  readonly is_anonymous?: boolean;
  readonly is_anonymous_proxy?: boolean;
  readonly is_anonymous_vpn?: boolean;
  readonly is_hosting_provider?: boolean;
  readonly is_legitimate_proxy?: boolean;
  readonly is_public_proxy?: boolean;
  readonly is_satellite_provider?: boolean;
  readonly is_tor_exit_node?: boolean;
  readonly isp?: string;
  readonly organization?: string;
  readonly user_type?: 'business'
  | 'cafe'
  | 'cellular'
  | 'college'
  | 'content_delivery_network'
  | 'dialup'
  | 'government'
  | 'hosting'
  | 'library'
  | 'military'
  | 'residential'
  | 'router'
  | 'school'
  | 'search_engine_spider'
  | 'traveler';
}

export interface CountryResponse {
  readonly continent?: ContinentRecord;
  readonly country?: CountryRecord;
  readonly registered_country?: RegisteredCountryRecord;
  readonly represented_country?: RepresentedCountryRecord;
  readonly traits?: TraitsRecord;
}

export interface CityResponse extends CountryResponse {
  readonly city?: CityRecord;
  readonly location?: LocationRecord;
  readonly postal?: PostalRecord;
  readonly subdivisions?: SubdivisionsRecord[];
}

export interface AnonymousIPResponse {
  ip_address?: string;
  readonly is_anonymous?: boolean;
  readonly is_anonymous_proxy?: boolean;
  readonly is_anonymous_vpn?: boolean;
  readonly is_hosting_provider?: boolean;
  readonly is_public_proxy?: boolean;
  readonly is_tor_exit_node?: boolean;
}

export interface AsnResponse {
  readonly autonomous_system_number: number;
  readonly autonomous_system_organization: string;
  ip_address?: string;
}

export interface ConnectionTypeResponse {
  readonly connection_type: string;
  ip_address?: string;
}

export interface DomainResponse {
  readonly domain: string;
  ip_address?: string;
}

export interface IspResponse extends AsnResponse {
  readonly isp: string;
  readonly organization: string;
}

export type Response = CountryResponse
  | CityResponse
  | AnonymousIPResponse
  | AsnResponse
  | ConnectionTypeResponse
  | DomainResponse
  | IspResponse;

export interface Metadata {
  readonly binaryFormatMajorVersion: number;
  readonly binaryFormatMinorVersion: number;
  readonly buildEpoch: Date;
  readonly databaseType: string;
  readonly languages: string[];
  readonly description: any;
  readonly ipVersion: number;
  readonly nodeCount: number;
  readonly recordSize: number;
  readonly nodeByteSize: number;
  readonly searchTreeSize: number;
  readonly treeDepth: number;
}

export class Reader<T extends Response = any> {
  public metadata: Metadata;
  public get: (ipAddress: string) => T | null;
  constructor(buffer: Buffer, opts?: OpenOpts);
}

export type openCb<T extends Response = any> = (err: Error, cb: Reader<T>) => void;

export function open<T extends Response = any>(filepath: string, opts?: OpenOpts | openCb<T>, cb?: openCb<T>): void;

export function openSync<T extends Response = any>(filepath: string, opts?: OpenOpts): Reader<T>;

export function validate(ipAddress: string): boolean;
