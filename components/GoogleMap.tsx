import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

interface MapProps {
  location: [number, number];
  title: string;
}

const GoogleMapComponent: React.FC<MapProps> = ({ location, title }) => {
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(true);

  const mapStyles = {
    height: "400px",
    width: "100%"
  };

  const defaultCenter = {
    lat: location[0],
    lng: location[1]
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={defaultCenter}
      >
        <Marker
          position={defaultCenter}
          onClick={() => setIsInfoWindowOpen(true)}
        >
          {isInfoWindowOpen && (
            <InfoWindow
              position={defaultCenter}
              onCloseClick={() => setIsInfoWindowOpen(false)}
            >
              <div>
                <h3 className="font-semibold">Deprem Bölgesi</h3>
                <p>{title}</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent; 