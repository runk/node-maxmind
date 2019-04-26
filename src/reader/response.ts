interface Names {
  readonly de?: string;
  readonly en: string;
  readonly es?: string;
  readonly fr?: string;
  readonly ja?: string;
  readonly 'pt-BR'?: string;
  readonly ru?: string;
  readonly 'zh-CN'?: string;
}

interface CityRecord {
  readonly confidence?: number;
  readonly geoname_id: number;
  readonly names: Names;
}

interface ContinentRecord {
  readonly code: 'AF' | 'AN' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA';
  readonly geoname_id: number;
  readonly names: Names;
}

interface RegisteredCountryRecord {
  readonly geoname_id: number;
  readonly is_in_european_union?: boolean;
  readonly iso_code: string;
  readonly names: Names;
}

interface CountryRecord extends RegisteredCountryRecord {
  readonly confidence?: number;
}

interface LocationRecord {
  readonly accuracy_radius: number;
  readonly average_income?: number;
  readonly latitude: number;
  readonly longitude: number;
  readonly metro_code?: number;
  readonly population_density?: number;
  readonly time_zone?: string;
}

interface PostalRecord {
  readonly code: string;
  readonly confidence?: number;
}

interface RepresentedCountryRecord extends RegisteredCountryRecord {
  readonly type: string;
}

interface SubdivisionsRecord {
  readonly confidence?: number;
  readonly geoname_id: number;
  readonly iso_code: string;
  readonly names: Names;
}

interface TraitsRecord {
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
  readonly user_type?:
    | 'business'
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

export type Response =
  | CountryResponse
  | CityResponse
  | AnonymousIPResponse
  | AsnResponse
  | ConnectionTypeResponse
  | DomainResponse
  | IspResponse;
