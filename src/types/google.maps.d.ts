// Type definitions for Google Maps JavaScript API
// Project: https://developers.google.com/maps/

declare namespace google.maps {
  // Define basic types
  export type LatLngLiteral = {
    lat: number;
    lng: number;
  };

  export interface LatLngBounds {
    contains(latLng: LatLng | LatLngLiteral): boolean;
    equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    extend(point: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    isEmpty(): boolean;
    toJSON(): LatLngBoundsLiteral;
    toSpan(): LatLng;
    toString(): string;
    toUrlValue(precision?: number): string;
    union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
  }

  export interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  export class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    equals(other: LatLng): boolean;
    lat(): number;
    lng(): number;
    toString(): string;
    toUrlValue(precision?: number): string;
    toJSON(): LatLngLiteral;
  }

  export interface MapsEventListener {
    remove(): void;
  }

  export namespace places {
    export interface AutocompleteOptions {
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
      strictBounds?: boolean;
      types?: string[];
    }

    export interface PlaceResult {
      formatted_address?: string;
      name?: string;
      place_id?: string;
      geometry?: {
        location: LatLng;
        viewport: LatLngBounds;
      };
      [key: string]: unknown;
    }

    export class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      getPlace(): PlaceResult;
      addListener(eventName: string, handler: (event: Event) => void): MapsEventListener;
      setFields(fields: string[]): void;
      setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      setComponentRestrictions(restrictions: { country: string | string[] }): void;
      setOptions(options: AutocompleteOptions): void;
      setTypes(types: string[]): void;
    }
  }

  export namespace event {
    export function addListener(
      instance: object,
      eventName: string,
      handler: (...args: unknown[]) => void
    ): MapsEventListener;
    
    export function addListenerOnce(
      instance: object,
      eventName: string,
      handler: (...args: unknown[]) => void
    ): MapsEventListener;
    
    export function removeListener(listener: MapsEventListener): void;
    export function clearInstanceListeners(instance: object): void;
    export function clearListeners(instance: object, eventName: string): void;
    export function trigger(instance: object, eventName: string, ...args: unknown[]): void;
  }
}
