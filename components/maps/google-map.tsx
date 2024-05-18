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
