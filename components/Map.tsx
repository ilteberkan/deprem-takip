import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";

interface MapProps {
  location: [number, number];
  title: string;
}

const MapComponent: React.FC<MapProps> = ({ location, title }) => {
  // Koordinatları kontrol et
  const validLocation: [number, number] = [
    isNaN(location[0]) ? 39.9334 : location[0],
    isNaN(location[1]) ? 32.8597 : location[1]
  ];

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapContainer 
        center={validLocation} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={validLocation}>
          <Popup>
            <div>
              <h3 className="font-semibold">Deprem Bölgesi</h3>
              <p>{title}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent; 