import React, { useState, useEffect, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  fetchNearestCenters,
  fetchDirections,
  setUserLocation,
  setSelectedCenter,
  clearError,
  clearDirections,
} from '../features/locator/locatorSlice';

// Fix for default marker icon issues with Webpack (important for marker display)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const colors = {
  primaryColor: '#4CAF50',
  secondaryBackgroundColor: '#2196F3',
  backgroundColor: '#f8f9fa',
  textColor: '#333',
};

const fonts = {
  main: 'Arial, sans-serif',
};

const Locator = () => {
  const dispatch = useDispatch();
  const {
    centers,
    userLocation,
    selectedCenter,
    directions,
    loading,
    error,
  } = useSelector((state) => state.locator);

  const [postcode, setPostcode] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const mapContainerRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const centerMarkers = useRef([]);
  const userLocationMarker = useRef(null);
  const routeLayer = useRef(null);

  // Debounce function (pure function, no need for useCallback here)
  const debounce = (func, delay) => {
    let timeout;
    return function executed(...args) {
      const context = this;
      const later = () => {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, delay);
    };
  };

  // Effect for window resize listener
  useEffect(() => {
    // Create the debounced function directly within the effect,
    // so it has access to the current `isMobile` and `leafletMapInstance.current` without
    // causing exhaustive-deps issues with useCallback.
    const debouncedHandleResize = debounce(() => {
      const newIsMobile = window.innerWidth < 768;
      // Only update state if it actually changes to prevent unnecessary renders
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
      // Always invalidate map size on window resize, regardless of isMobile state change
      if (leafletMapInstance.current) {
        leafletMapInstance.current.invalidateSize();
      }
    }, 200);

    window.addEventListener('resize', debouncedHandleResize);
    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps


  // Effect to invalidate map size when `isMobile` state changes (which implies a major layout change)
  useEffect(() => {
    if (leafletMapInstance.current) {
      // Small timeout to allow CSS transition/layout to settle
      setTimeout(() => {
        leafletMapInstance.current.invalidateSize();
      }, 50); // Adjust timeout if needed
    }
  }, [isMobile]); // Trigger this effect when isMobile changes


  // 1. Initialize Map on Mount
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapInstance.current) {
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [51.505, -0.09], // Default London center
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    leafletMapInstance.current = map;

    // IMPORTANT: Call invalidateSize immediately after map initialization.
    // This helps Leaflet correctly size itself based on its container's current dimensions.
    map.invalidateSize();


    dispatch(fetchNearestCenters({ postcode: 'NW1 6XE' }));

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [dispatch]); // Dependency array includes dispatch to avoid lint warnings

  // 2. Add pins for centers
  const addMarkers = (map, centersData) => {
    centerMarkers.current.forEach((m) => {
      if (map.hasLayer(m)) {
        map.removeLayer(m);
      }
    });
    centerMarkers.current = [];

    const newMarkers = centersData.map((center) => {
      const marker = L.marker([center.lat, center.lon]).addTo(map);
      marker.bindPopup(
        `<b>${center.name}</b><br>${center.postcode}<br>Distance: ${
          typeof center.distance === 'number' ? center.distance.toFixed(2) + ' km' : 'N/A'
        }`
      );
      return marker;
    });
    centerMarkers.current = newMarkers;
  };

  // 3. Manage All Centers Markers (for map display) and initial load
  useEffect(() => {
    if (leafletMapInstance.current && centers.length > 0) {
      addMarkers(leafletMapInstance.current, centers);

      if (!userLocation && centers.length > 0) {
        const latLngs = centers.map((center) => [center.lat, center.lon]);
        if (latLngs.length > 0) {
          const bounds = L.latLngBounds(latLngs);
          leafletMapInstance.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [centers, userLocation]);

  // 4. Manage User Location Marker and Map View
  useEffect(() => {
    if (leafletMapInstance.current) {
      if (userLocationMarker.current) {
        leafletMapInstance.current.removeLayer(userLocationMarker.current);
        userLocationMarker.current = null;
      }

      if (userLocation) {
        const newUserMarker = L.marker([userLocation.lat, userLocation.lon], {
          icon: L.icon({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        })
          .bindPopup('Your Current Location')
          .addTo(leafletMapInstance.current);
        userLocationMarker.current = newUserMarker;
        leafletMapInstance.current.setView([userLocation.lat, userLocation.lon], 13);
        // It's good practice to invalidateSize after major map operations like setView,
        // especially if the container size might have changed or been initially indeterminate.
        leafletMapInstance.current.invalidateSize();
      }
    }
  }, [userLocation]);

  // 5. Manage Directions Polyline
  useEffect(() => {
    if (leafletMapInstance.current) {
      if (routeLayer.current) {
        leafletMapInstance.current.removeLayer(routeLayer.current);
        routeLayer.current = null;
      }

      if (directions && directions.features && directions.features.length > 0) {
        const coords = directions.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        const newRouteLayer = L.polyline(coords, { color: colors.primaryColor, weight: 5 }).addTo(
          leafletMapInstance.current
        );
        leafletMapInstance.current.fitBounds(newRouteLayer.getBounds(), { padding: [50, 50] });
        leafletMapInstance.current.invalidateSize(); // Invalidate after fitting bounds too
        routeLayer.current = newRouteLayer;
      }
    }
  }, [directions]);

  const handleSearch = async () => {
    dispatch(clearError());
    dispatch(clearDirections());
    dispatch(setUserLocation(null));

    if (routeLayer.current) {
      leafletMapInstance.current.removeLayer(routeLayer.current);
      routeLayer.current = null;
    }

    if (!postcode.trim()) {
      // Replaced alert with a custom message box or similar UI element in a real app
      // For this example, keep it as is, but note the general guideline.
      alert('Please enter a postcode');
      return;
    }

    dispatch(fetchNearestCenters({ postcode }));
  };

  const handleUseMyLocation = () => {
    dispatch(clearError());
    dispatch(clearDirections());
    setPostcode('');

    if (routeLayer.current) {
      leafletMapInstance.current.removeLayer(routeLayer.current);
      routeLayer.current = null;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lon: longitude }));
          dispatch(fetchNearestCenters({ lat: latitude, lon: longitude }));

          if (leafletMapInstance.current) {
            leafletMapInstance.current.setView([latitude, longitude], 13);
            leafletMapInstance.current.invalidateSize();
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          dispatch(clearError());
          // Replaced alert with a custom message box or similar UI element in a real app
          alert('Error getting your location: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      dispatch(clearError());
      // Replaced alert with a custom message box or similar UI element in a real app
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleGetDirections = (center) => {
    dispatch(setSelectedCenter(center));
    dispatch(clearDirections());

    let originLat = userLocation?.lat;
    let originLon = userLocation?.lon;
    let originPostcode = postcode.trim();

    if ((!originLat && !originLon) && !originPostcode) {
      // Replaced alert with a custom message box or similar UI element in a real app
      alert('Please enter your postcode or allow location access to get directions.');
      return;
    }

    dispatch(fetchDirections({
      postcode: originPostcode,
      userLat: originLat,
      userLon: originLon,
      centerId: center.id,
    }));
  };

  const getGoogleMapsDirectionsUrl = (centerLat, centerLon) => {
    const origin = userLocation
      ? `${userLocation.lat},${userLocation.lon}`
      : postcode ? postcode : '';

    const destination = centerLat && centerLon
      ? `${centerLat},${centerLon}`
      : '';

    if (origin && destination) {
      // CORRECTED: Use ${} for embedding expressions within template literals
      return `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
    }
    return '#';
  };

  return (
    <div style={{
      padding: '2rem',
      fontFamily: fonts.main,
      backgroundColor: colors.backgroundColor,
      color: colors.textColor,
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>
      {/* Global styles for button hover effects */}
      <style>
        {`
          .locator-button, .google-maps-link {
            transition: all 0.3s ease-in-out;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* Base shadow */
          }
          .locator-button:hover, .google-maps-link:hover {
            transform: translateY(-2px); /* Slight lift */
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Larger shadow */
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <h1 style={{ color: colors.primaryColor, marginBottom: '1.5rem', textAlign: 'center' }}>
        📍 Find a Recycling Centre
      </h1>

      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        <input
          type="text"
          placeholder="Enter your postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: `1px solid #cbd5e0`,
            fontSize: '1rem',
            width: isMobile ? '100%' : '300px',
            maxWidth: '300px',
            color: colors.textColor,
            backgroundColor: 'white',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleSearch}
          className="locator-button" // Add class for hover effect
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            backgroundColor: colors.primaryColor,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
          }}
        >
          🔍 Search
        </button>
        <button
          onClick={handleUseMyLocation}
          className="locator-button" // Add class for hover effect
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            backgroundColor: colors.secondaryBackgroundColor,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            width: isMobile ? '100%' : 'auto',
            boxSizing: 'border-box',
          }}
        >
          📡 Use My Location
        </button>
      </div>

      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="30" height="30" style={{
            animation: 'spin 1s linear infinite',
          }}>
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p>Loading centers...</p>
        </div>
      )}
      {error && <p style={{ textAlign: 'center', color: 'red', marginBottom: '1rem' }}>Error: {error}</p>}

      <div style={{
        display: 'flex',
        gap: '2rem',
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        {/* Map Container */}
        <div
          ref={mapContainerRef}
          id="map"
          style={{
            flex: 2,
            height: isMobile ? '400px' : '600px', // Ensure height is always defined
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%', // Use 100% width, flex will handle distribution
            minHeight: '300px', // Ensure a minimum height even if flex bugs out
          }}
        >
        </div>

        <div style={{
          flex: 1,
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          width: isMobile ? '100%' : 'auto',
          boxSizing: 'border-box',
        }}>
          <h2 style={{ color: colors.secondaryBackgroundColor, marginBottom: '1rem' }}>🗺 Nearby Centres</h2>
          {centers.length === 0 && !loading && !error && (
            <p style={{ color: colors.textColor }}>No centers found. Try entering a postcode or using your location.</p>
          )}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {centers.map((center) => (
              <li
                key={center.id}
                onClick={() => handleGetDirections(center)}
                style={{
                  padding: '0.75rem',
                  borderBottom: `1px solid #edf2f7`,
                  cursor: 'pointer',
                  backgroundColor: selectedCenter?.id === center.id ? '#e2e8f0' : 'transparent',
                  borderRadius: '0.375rem',
                  marginBottom: '0.5rem',
                  transition: 'background-color 0.2s ease',
                  // Note: Inline styles don't directly support :hover.
                  // For hover, you'd typically use CSS modules, styled-components, or a CSS file.
                }}
              >
                <h4 style={{ margin: 0, color: colors.primaryColor }}>🏛 {center.name}</h4>
                <p style={{ margin: '0.25rem 0', color: colors.textColor }}>📫 Postcode: {center.postcode}</p>
                {typeof center.distance === 'number' && (
                  <p style={{ margin: 0, color: colors.textColor, fontSize: '0.875rem' }}>
                    📏 Distance: {center.distance.toFixed(2)} km
                  </p>
                )}
                <a
                  href={getGoogleMapsDirectionsUrl(center.lat, center.lon)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="google-maps-link" // Add class for hover effect
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    backgroundColor: colors.secondaryBackgroundColor,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  🧭 Google Maps
                </a>
              </li>
            ))}
          </ul>

          {selectedCenter && (
            <div style={{ marginTop: '2rem', borderTop: `1px solid #edf2f7`, paddingTop: '1.5rem' }}>
              <h3 style={{ color: colors.secondaryBackgroundColor, marginBottom: '1rem' }}>Selected Centre Details: {selectedCenter.name}</h3>
              <p style={{ color: colors.textColor }}>Postcode: {selectedCenter.postcode}</p>
              {directions && directions.features && directions.features.length > 0 ? (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ color: colors.primaryColor }}>Route Information:</h4>
                  <p style={{ color: colors.textColor }}>
                    Total Distance: {(directions.features[0].properties.summary.distance / 1000).toFixed(2)} km
                  </p>
                  <p style={{ color: colors.textColor }}>
                    Estimated Time: {new Date(directions.features[0].properties.summary.duration * 1000).toISOString().substr(11, 8)}
                  </p>
                  <h5 style={{ color: colors.secondaryBackgroundColor, marginTop: '1rem' }}>Directions Steps:</h5>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: `1px solid #eee`, padding: '0.5rem', borderRadius: '0.25rem' }}>
                    <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
                      {directions.features[0].properties.segments[0].steps.map((step, index) => (
                        <li key={index} style={{ marginBottom: '0.25rem', color: colors.textColor }}>
                          {step.instruction} ({step.distance.toFixed(0)}m)
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <p style={{ color: colors.textColor }}>You will be directed to GMaps.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Locator;
