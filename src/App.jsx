
import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

const centerDefault = { lat: 10.776530, lng: 106.700981 };

function App () {
  const [marker, setMarker] = useState(centerDefault);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const onClick = useCallback((e) => {
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={marker}
      zoom={13}
      onClick={onClick}
    >
      <Marker position={marker} />
    </GoogleMap>
  ) : (
    <p>Đang tải bản đồ...</p>
  );
}

export default App;
