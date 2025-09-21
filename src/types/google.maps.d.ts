// Type definitions for Google Maps JavaScript API
// Project: https://developers.google.com/maps/

declare namespace google.maps {
  namespace places {
    interface AutocompleteOptions {
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      componentRestrictions?: { country: string | string[] };
      fields?: string[];
      strictBounds?: boolean;
      types?: string[];
    }

    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      getPlace(): { formatted_address?: string };
      addListener(eventName: string, handler: Function): MapsEventListener;
    }
  }

  interface MapsEventListener {
    remove(): void;
  }

  interface LatLngBounds {
    // Add necessary methods if needed
  }

  interface LatLngBoundsLiteral {
    // Add necessary properties if needed
  }

  namespace event {
    function addListener(instance: any, eventName: string, handler: Function): MapsEventListener;
    function removeListener(listener: MapsEventListener): void;
  }
}
