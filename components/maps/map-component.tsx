"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import Link from "next/link";
import { expandUrl, extractLatLong } from "./map-utils";

// Default map options
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

// Define the interface for the map center
export interface MapCenter {
  lat: number;
  lng: number;
}

// Map's styling
export const defaultMapContainerStyle = {
  height: "300px",
  borderRadius: "15px 15px 15px 15px",
};

const MapComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapCenter>();
  const [mapInfo, setMapInfo] = useState(info);
  const [tempMapInfo, setTempMapInfo] = useState(info); // Temporary state for input
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isSuccess, setIsSuccess] = useState(false); // Success message state

  useEffect(() => {
    const fetchCoordinates = async () => {
      console.log("Fetching coordinates...");
      console.log("Shortened URL:", mapInfo.link);
      const expandedUrl = await expandUrl(mapInfo.link);
      console.log("Expanded URL:", expandedUrl);
      if (expandedUrl) {
        const coords = await extractLatLong(expandedUrl);
        if (coords) {
          console.log("Coordinates:", coords);
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
    setTimeout(() => setIsSuccess(false), 1500); // Hide success message after 3 seconds
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
                      href={info.link}
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
        {/* Label and input field for the map link */}
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

        {/* Label and input field for the map title */}
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

        {/* Label and input field for the map address */}
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
