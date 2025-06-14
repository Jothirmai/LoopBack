// src/pages/Scan.js
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useDispatch, useSelector } from 'react-redux';
import {
  processScan,
  clearScanStatus,
  setUserLocation,
  setHasCameraAccess,
  setLocalError,
  clearAllScannerErrors,
} from '../features/scanner/scannerSlice';
import { colors, fonts } from '../styles/theme';
import toast from 'react-hot-toast';

const qrcodeRegionId = "qr-code-reader";

const Scan = () => {
  const dispatch = useDispatch();
  const { userLocation, hasCameraAccess, loading, scanResult, scanError, localError } = useSelector((state) => state.scanner);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeScanner = useRef(null);

  // Show toasts when scan is processed
  useEffect(() => {
    if (scanResult) toast.success(scanResult);
    if (scanError) toast.error(scanError);
    if (localError) toast.error(localError);
  }, [scanResult, scanError, localError]);

  useEffect(() => {
    dispatch(clearAllScannerErrors());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch(setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }));
        },
        (err) => {
          console.error('Geolocation error:', err);
          dispatch(setLocalError('Failed to get your location. Please enable location services.'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      dispatch(setLocalError('Geolocation is not supported by your browser.'));
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => dispatch(setHasCameraAccess(true)))
      .catch(() => dispatch(setLocalError('Failed to get camera access. Please enable camera permissions.')));
  }, [dispatch]);

  useEffect(() => {
    if (!html5QrCodeScanner.current) {
      html5QrCodeScanner.current = new Html5Qrcode(qrcodeRegionId);
    }

    const qrCodeSuccessCallback = async (decodedText) => {
      if (html5QrCodeScanner.current.isScanning) {
        try {
          await html5QrCodeScanner.current.stop();
          setIsScanning(false);
        } catch (err) {
          console.error('Failed to stop QR scanner:', err);
        }
      }

      dispatch(clearAllScannerErrors());

      if (!userLocation) {
        dispatch(setLocalError('Your location is not available. Cannot process scan.'));
        return;
      }

      dispatch(processScan({
        qrCode: decodedText,
        userLat: userLocation.lat,
        userLon: userLocation.lon,
      }));
    };

    const qrCodeErrorCallback = (error) => {
      if (error && error.name !== 'Html5QrcodeScanner' && !error.message?.includes('No QR code found')) {
        console.warn(`QR scan error: ${error}`);
      }
    };

    if (isScanning && hasCameraAccess && userLocation) {
      if (!html5QrCodeScanner.current.isScanning) {
        html5QrCodeScanner.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        ).catch((err) => {
          console.error('Failed to start QR scanner:', err);
          dispatch(setLocalError('Failed to start camera. Please ensure camera is available and permissions are granted.'));
          setIsScanning(false);
        });
      }
    } else if (!isScanning && html5QrCodeScanner.current.isScanning) {
      html5QrCodeScanner.current.stop().catch((err) => {
        console.error('Failed to stop QR scanner:', err);
      });
    }

    return () => {
      if (html5QrCodeScanner.current && html5QrCodeScanner.current.isScanning) {
        html5QrCodeScanner.current.stop().catch((err) => {
          console.error('Failed to stop QR scanner on cleanup:', err);
        });
      }
    };
  }, [isScanning, hasCameraAccess, userLocation, dispatch]);

  const renderQrScanner = () => (
    <div id={qrcodeRegionId} style={{
      width: '100%',
      maxWidth: '400px',
      minHeight: '250px',
      border: `2px solid ${colors.primaryColor}`,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      marginTop: '1rem',
      display: isScanning ? 'block' : 'none'
    }} />
  );

  const handleStartScanning = () => {
    dispatch(clearAllScannerErrors());
    dispatch(clearScanStatus());

    if (!isAuthenticated) {
      dispatch(setLocalError('You must be logged in to scan QR codes.'));
      return;
    }
    if (!hasCameraAccess) {
      dispatch(setLocalError('Camera access is required to scan QR codes.'));
      return;
    }
    if (!userLocation) {
      dispatch(setLocalError('Please wait while we get your location, or enable location services.'));
      return;
    }

    toast.loading('Initializing scanner...');
    setTimeout(() => {
      toast.dismiss();
      setIsScanning(true);
    }, 500); // small delay for user feedback
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    toast('Scanner stopped', { icon: '🛑' });
  };

  return (
    <div style={{
      padding: '2rem',
      fontFamily: fonts.main,
      backgroundColor: colors.backgroundColor,
      color: colors.textColor,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1 style={{ color: colors.primaryColor, marginBottom: '1.5rem', textAlign: 'center' }}>
        Scan QR Code for Points
      </h1>

      <div style={{
        background: 'white',
        maxWidth: '500px',
        width: '100%',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        {!isAuthenticated ? (
          <p style={{ color: colors.textColor, fontSize: '1.1rem' }}>🔐 Please login to scan QR codes and earn points.</p>
        ) : (
          <>
            {!isScanning && (
              <button
                onClick={handleStartScanning}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '1.1rem',
                  backgroundColor: colors.primaryColor,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                disabled={loading || !hasCameraAccess || !userLocation}
              >
                {loading ? 'Processing...' : '🚀 Start Scanning'}
              </button>
            )}

            {renderQrScanner()}

            {isScanning && (
              <button
                onClick={handleStopScanning}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '1.1rem',
                  backgroundColor: colors.errorColor,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
                disabled={loading}
              >
                Stop Scanning
              </button>
            )}

            {loading && (
              <p style={{ color: colors.textColor, marginTop: '1rem' }}>Processing scan...</p>
            )}

            {scanResult && (
              <p style={{ color: 'green', fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>{scanResult}</p>
            )}

            {userLocation && (
              <p style={{ color: colors.textMutedColor, fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center' }}>
                Your current location: Lat {userLocation.lat.toFixed(4)}, Lon {userLocation.lon.toFixed(4)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Scan;
