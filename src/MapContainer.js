import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polygon,
  InfoWindow,
  HeatmapLayer,
} from "@react-google-maps/api";
import { Button, Input } from "antd";
import "./MapContainer.css";

const MapContainer = () => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  const mapStyles = {
    height: "85vh",
    width: "100%",
  };

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleSearch = () => {
    if (searchAddress.trim() !== "") {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchAddress }, (results, status) => {
        if (status === "OK" && results.length > 0) {
          const { geometry } = results[0];
          if (geometry && geometry.location) {
            const latLng = {
              lat: geometry.location.lat(),
              lng: geometry.location.lng(),
            };
            setCenter(latLng);
            setMarkerPosition(latLng);
          }
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    }
  };

  const handleGeoJsonUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsedData = JSON.parse(content);
      setGeoJsonData(parsedData);
    };
    reader.readAsText(file);
  };

  const handleMapClick = (event) => {
    setClickedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  const toggleHeatmap = () => {
    if (heatmapData.length === 0) {
      setHeatmapData(getHeatmapData());
    } else {
      setHeatmapData([]);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const getHeatmapData = () => {
    return [
      new window.google.maps.LatLng(37.782, -122.447),
      new window.google.maps.LatLng(20.755, 81.0728),
      new window.google.maps.LatLng(21.755, 75.0728),
    ];
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyAALjj2ZXjR-gdiTImzMgjA_qjbWgm8Yd4"
      libraries={["visualization"]}
    >
      <div>
        <h1
          style={{
            fontFamily: "GamjaFlower-Regular",
            fontSize: "50px",
            height: "40px",
            marginTop: "5px",
          }}
        >
          Maps
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",

            paddingLeft: "20px",
          }}
        >
          <Input
            type="text"
            placeholder="Enter address"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            style={{ marginRight: "8px", width: "90%" }}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <br />
        GeoJson:&nbsp;
        <Input
          type="file"
          accept=".geojson"
          onChange={handleGeoJsonUpload}
          style={{ width: "20%" }}
        />
        &nbsp;&nbsp;
        <Button onClick={toggleHeatmap}>
          {heatmapData.length ? "Hide Heatmap" : "Show Heatmap"}
        </Button>
      </div>
      <br />
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={4}
        center={center}
        onClick={handleMapClick}
        onLoad={onLoad}
      >
        {markerPosition && <Marker position={markerPosition} />}
        {geoJsonData &&
          geoJsonData.features.map((feature, index) => {
            switch (feature.geometry.type) {
              case "Point":
                return (
                  <Marker
                    key={index}
                    position={{
                      lat: feature.geometry.coordinates[1],
                      lng: feature.geometry.coordinates[0],
                    }}
                  />
                );
              case "Polygon":
                return (
                  <Polygon
                    key={index}
                    paths={feature.geometry.coordinates[0].map((coords) => ({
                      lat: coords[1],
                      lng: coords[0],
                    }))}
                  />
                );
              default:
                return null;
            }
          })}
        {clickedLocation && (
          <InfoWindow
            position={clickedLocation}
            onCloseClick={() => setClickedLocation(null)}
          >
            <div>
              <h3>Location Coordinates:</h3>
              <p>Latitude: {clickedLocation.lat}</p>
              <p>Longitude: {clickedLocation.lng}</p>
            </div>
          </InfoWindow>
        )}
        {heatmapData.length > 0 && (
          <HeatmapLayer data={heatmapData} options={{ radius: 20 }} />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapContainer;
