Check out the [demo here](https://react-google-map-viewer.vercel.app/).

### Project Structure

Our project consists of a main page (`app/page.tsx`) and four components located in the `components/maps` folder. Let's walk through these components and their functionalities in a logical order.

### 1. `map-utils.ts`

This utility module handles URL expansion and extraction of latitude and longitude coordinates from Google Maps links. It contains two main functions:

- `expandUrl`: Expands shortened URLs to their full version.
- `extractLatLong`: Extracts latitude and longitude coordinates from either DMS (Degrees, Minutes, Seconds) or decimal formats.

### 2. `map-provider.tsx`

The `MapProvider` component loads the Google Maps JavaScript API and provides it to the rest of the app. This component uses the `useJsApiLoader` hook from the `@react-google-maps/api` library to load the API asynchronously.

```tsx
"use client";

import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import { ReactNode } from "react";

const libraries = ["places", "drawing", "geometry"];

export function MapProvider({ children }: { children: ReactNode }) {
  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API as string,
    libraries: libraries as Libraries,
  });

  if (loadError) return <p>Encountered error while loading google maps</p>;

  if (!scriptLoaded) return <p>Map Script is loading ...</p>;

  return children;
}
```

### 3. `map-component.tsx`

The `MapComponent` is the core component that renders the map, marker, and info window. It also provides an input form for users to enter a Google Maps link, title, and address.

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Link from "next/link";
import { expandUrl, extractLatLong } from "./map-utils";

const defaultMapOptions = {
  zoomControl: true,
  tilt: 0,
  gestureHandling: "auto",
  mapTypeId: "roadmap",
};

const defaultMapZoom = 18;

const info = {
  title: "The Empire State Building",
  address: "20 W 34th St., New York, NY 10001, United States",
  link: "https://maps.app.goo.gl/qz2zoCrJpmjH7Pmk7",
};

export interface MapCenter {
  lat: number;
  lng: number;
}

export const defaultMapContainerStyle = {
  height: "300px",
  borderRadius: "15px 15px 15px 15px",
};

const MapComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapCenter>();
  const [mapInfo, setMapInfo] = useState(info);
  const [tempMapInfo, setTempMapInfo] = useState(info);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchCoordinates = async () => {
      const expandedUrl = await expandUrl(mapInfo.link);
      if (expandedUrl) {
        const coords = await extractLatLong(expandedUrl);
        if (coords) {
          setMapCenter(coords);
        }
      }
    };

    if (mapInfo.link) {
      fetchCoordinates();
    }
  }, [mapInfo.link]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);
    setMapInfo(tempMapInfo);
    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={mapCenter}
        zoom={defaultMapZoom}
        options={defaultMapOptions}
      >
        {mapCenter && (
          <>
            <Marker position={mapCenter} onClick={() => setIsOpen(true)} />
            {isOpen && (
              <InfoWindow
                position={mapCenter}
                onCloseClick={() => setIsOpen(false)}
              >
                <div>
                  <div className="text-black flex flex-col gap-1">
                    <div className="font-semibold text-lg -mb-1">
                      {mapInfo.title}
                    </div>
                    <div>{mapInfo.address}</div>
                    <Link
                      target="_blank"
                      href={mapInfo.link}
                      className="font-semibold text-blue-500 hover:underline"
                    >
                      View on Google Maps
                    </Link>
                  </div>
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div>
          <label htmlFor="mapLink" className="block text-sm p-1">
            Map Link
          </label>
          <input
            id="mapLink"
            type="text"
            value={tempMapInfo.link}
            onChange={(e) =>
              setTempMapInfo({ ...tempMapInfo, link: e.target.value })
            }
            placeholder="Enter the map link"
            className="border border-gray-300 rounded-md p-2 w-full text-black"
          />
        </div>
        <div>
          <label htmlFor="mapTitle" className="block text-sm p-1">
            Map Title
          </label>
          <input
            id="mapTitle"
            type="text"
            value={tempMapInfo.title}
            onChange={(e) =>
              setTempMapInfo({ ...tempMapInfo, title: e.target.value })
            }
            placeholder="Enter the map title"
            className="border border-gray-300 rounded-md p-2 w-full text-black"
          />
        </div>
        <div>
          <label htmlFor="mapAddress" className="block text-sm p-1">
            Map Address
          </label>
          <input
            id="mapAddress"
            type="text"
            value={tempMapInfo.address}
            onChange={(e) =>
              setTempMapInfo({ ...tempMapInfo, address: e.target.value })
            }
            placeholder="Enter the map address"
            className="border border-gray-300 rounded-md p-2 w-full text-black"
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded-md active:bg-blue-400"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
        {isSuccess && (
          <div className="text-green-500 mt-2">
            Map information updated successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export { MapComponent };
```

### 4. `google-map.tsx`

The `GoogleMap` component serves as a container for the `MapProvider` and `MapComponent`. It ensures that the Google Maps API is loaded before rendering the map.

```tsx
import React from "react";
import { MapProvider } from "@/components/maps/map-provider";
import { MapComponent } from "@/components/maps/map-component";

function GoogleMap() {
  return (
    <div>
      <MapProvider>
        <MapComponent />
      </MapProvider>
    </div>
  );
}

export default GoogleMap;
```

### Main Page (`app/page.tsx`)

Finally, the main page of our Next.js app (`app/page.tsx`) imports and uses the `GoogleMap` component.

```tsx
import GoogleMap from "@/components/maps/google-map";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full">
        <GoogleMap />
      </div>
    </main>
  );
}
```

Feel free to explore the [demo](https://react-google-map-viewer.vercel.app/) and try out different Google Maps links. Happy coding!
