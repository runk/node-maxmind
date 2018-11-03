export interface IOpenOpts {
  cache?: {
    max: number,
  };
  watchForUpdates?: boolean;
  watchForUpdatesNonPersistent?: boolean;
  watchForUpdatesHook?: () => void;
}

export interface INames {
  de?: string;
  en: string;
  es?: string;
  fr?: string;
  ja?: string;
  'pt-BR'?: string;
  ru?: string;
  'zh-CN'?: string;
}

export interface ICity {
  confidence?: number;
  geoname_id: number;
  names: INames;
}

export interface IContinent {
  code: 'AF' | 'AN' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA';
  geoname_id: number;
  names: INames;
}

export interface IBaseCountry {
  geoname_id: number;
  is_in_european_union?: boolean;
  iso_code: string;
  names: INames;
}

export interface ICountry extends IBaseCountry {
  confidence?: number;
}

export interface ILocation {
  accuracy_radius?: number;
  average_income?: number;
  latitude?: number;
  longitude?: number;
  metro_code?: number;
  population_density?: number;
  time_zone?: string;
}

export interface IPostal {
  code?: string;
  confidence?: number;
}

export interface IRepresentedCountry extends IBaseCountry {
  type: string;
}

export interface ISubdivisions {
  confidence?: number;
  geoname_id?: number;
  iso_code?: string;
  names?: INames;
}

export interface ITraits {
  autonomous_system_number?: number;
  autonomous_system_organization?: string;
  domain?: string;
  ip_address: string;
  is_anonymous?: boolean;
  is_anonymous_proxy?: boolean;
  is_anonymous_vpn?: boolean;
  is_hosting_provider?: boolean;
  is_public_proxy?: boolean;
  is_satellite_provider?: boolean;
  is_tor_exit_node?: boolean;
  isp?: string;
  organization?: string;
  user_type?: 'business'
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

export interface ICountryResponse {
  continent?: IContinent;
  country?: ICountry;
  registered_country?: IBaseCountry;
  represented_country?: IRepresentedCountry;
  traits?: ITraits;
}

export interface ICityResponse extends ICountryResponse {
  city?: ICity;
  location?: ILocation;
  postal?: IPostal;
  subdivisions?: ISubdivisions[];
}

export interface IAnonymousIPResponse {
  ip_address: string;
  is_anonymous?: boolean;
  is_anonymous_proxy?: boolean;
  is_anonymous_vpn?: boolean;
  is_hosting_provider?: boolean;
  is_public_proxy?: boolean;
  is_tor_exit_node?: boolean;
}

export interface IAsnResponse {
  autonomous_system_number: number;
  autonomous_system_organization: string;
  ip_address: string;
}

export interface IConnectionTypeResponse {
  connection_type: string;
  ip_address: string;
}

export interface IDomainResponse {
  domain: string;
  ip_address: string;
}

export interface IIspResponse extends IAsnResponse {
  isp: string;
  organization: string;
}

export interface IReader<T> {
  get: (ipAddress: string) => T | null;
  metadata: {
    binaryFormatMajorVersion: number;
    binaryFormatMinorVersion: number;
    buildEpoch: Date;
    databaseType: string;
    languages: string[];
    description: any;
    ipVersion: number;
    nodeCount: number;
    recordSize: number;
    nodeByteSize: number;
    searchTreeSize: number;
    treeDepth: number;
  };
}

export type openCb<T> = (err: Error, cb: IReader<T>) => void;

export function open<T>(filepath: string, opts?: IOpenOpts | openCb<T>, cb?: openCb<T>): void;

export function openSync<T>(filepath: string, opts?: IOpenOpts): IReader<T>;

export function validate(ipAddress: string): boolean;
