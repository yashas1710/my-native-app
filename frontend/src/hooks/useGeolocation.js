import { useCallback, useEffect, useState } from "react";

const initialState = {
  latitude: null,
  longitude: null,
  status: "idle",
  error: null,
};

export default function useGeolocation({ autoRequest = true } = {}) {
  const [location, setLocation] = useState(initialState);

  const requestLocation = useCallback(() => new Promise((resolve) => {
    if (!navigator.geolocation) {
      const result = { ...initialState, status: "unsupported", error: "Geolocation is not supported by this browser." };
      setLocation(result);
      resolve(null);
      return;
    }

    setLocation((previous) => ({ ...previous, status: "loading", error: null }));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const result = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          status: "granted",
          error: null,
        };
        setLocation(result);
        resolve(result);
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        const result = {
          ...initialState,
          status: denied ? "denied" : "unsupported",
          error: error.message || (denied ? "Location permission was denied." : "Unable to determine your location."),
        };
        setLocation(result);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }), []);

  useEffect(() => {
    if (autoRequest) requestLocation();
  }, [autoRequest, requestLocation]);

  return { ...location, requestLocation, retry: requestLocation };
}
