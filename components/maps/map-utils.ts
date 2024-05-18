"use server";

import axios from "axios";

export const expandUrl = async (shortUrl: string): Promise<string | null> => {
  try {
    const response = await axios.get(shortUrl, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302, // Handle redirect
    });
    return response.headers.location; // This contains the expanded URL
  } catch (error) {
    console.error("Error expanding URL:", error);
    return null;
  }
};

const dmsToDecimal = (
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
): number => {
  const decimal = degrees + minutes / 60 + seconds / 3600;
  return direction === "S" || direction === "W" ? -decimal : decimal;
};

export const extractLatLong = (
  url: string
): { lat: number; lng: number } | null => {
  // Decode the URL to handle URL-encoded characters
  const decodedUrl = decodeURIComponent(url);
  // console.log("Decoded URL:", decodedUrl);

  // Regex to match DMS coordinates
  const dmsPattern = /(\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)"?([NSEW])/g;
  // Regex to match decimal coordinates
  const decimalPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  // Regex to match accurate 3d/4d coordinates
  const accurateDecimalPattern = /3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;

  let match;
  let lat, lng;

  // Try to extract accurate 3d/4d coordinates
  match = accurateDecimalPattern.exec(decodedUrl);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }

  // Try to extract DMS coordinates for latitude and longitude
  const dmsMatches = decodedUrl.match(dmsPattern);
  if (dmsMatches && dmsMatches.length >= 2) {
    const latMatch = dmsMatches[0].match(
      /(\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)"?([NSEW])/
    );
    const lngMatch = dmsMatches[1].match(
      /(\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)"?([NSEW])/
    );

    if (latMatch && lngMatch) {
      lat = dmsToDecimal(
        parseInt(latMatch[1]),
        parseInt(latMatch[2]),
        parseFloat(latMatch[3]),
        latMatch[4]
      );
      lng = dmsToDecimal(
        parseInt(lngMatch[1]),
        parseInt(lngMatch[2]),
        parseFloat(lngMatch[3]),
        lngMatch[4]
      );

      return { lat, lng };
    }
  }

  // Fallback to extract decimal coordinates if accurate coordinates are not found
  match = decimalPattern.exec(decodedUrl);
  if (match) {
    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  }

  return null;
};
