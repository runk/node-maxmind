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

export interface IFields {
  city?: ICity;
  continent?: IContinent;
  country?: ICountry;
  location?: ILocation;
  postal?: IPostal;
  registered_country?: IBaseCountry;
  represented_country?: IRepresentedCountry;
  subdivisions?: ISubdivisions[];
  traits?: ITraits;
}

export interface IReader {
  get: (ipAddress: string) => IFields | null;
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

export type openCb = (err: Error, cb: IReader) => void;

export function open(filepath: string, opts?: IOpenOpts | openCb, cb?: openCb): void;

export function openSync(filepath: string, opts?: IOpenOpts): IReader;

export function validate(ipAddress: string): boolean;
