"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature } from "geojson";
import {
  loadNigeriaGeoJSON,
  type NigeriaGeoJSON,
  type NigeriaStateProperties,
} from "./nigeria-geojson";
import "leaflet/dist/leaflet.css";

type ActivityFilter = "all" | "commits" | "content";

interface Props {
  data: Record<string, { users: number; commits: number; content: number }>;
  filter: ActivityFilter;
}

function getCount(
  d: { commits: number; content: number },
  filter: ActivityFilter
): number {
  if (filter === "commits") return d.commits;
  if (filter === "content") return d.content;
  return d.commits + d.content;
}

function getColor(count: number): string {
  if (count === 0) return "#1e293b";
  if (count < 5) return "#064e3b";
  if (count < 20) return "#047857";
  if (count < 50) return "#10b981";
  return "#34d399";
}

function getFilterLabel(filter: ActivityFilter): string {
  if (filter === "commits") return "commit";
  if (filter === "content") return "content item";
  return "contribution";
}

export default function NigeriaLeafletMap({ data, filter }: Props) {
  const [geojson, setGeojson] = useState<NigeriaGeoJSON | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    loadNigeriaGeoJSON().then(setGeojson);
  }, []);

  // Update styles when filter changes
  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer) => {
      const geoLayer = layer as L.GeoJSON & { feature?: Feature };
      const props = geoLayer.feature?.properties as
        | NigeriaStateProperties
        | undefined;
      if (!props) return;
      const stateData = data[props.stateId] || {
        users: 0,
        commits: 0,
        content: 0,
      };
      const count = getCount(stateData, filter);
      const label = getFilterLabel(filter);
      (layer as L.Path).setStyle({
        fillColor: getColor(count),
        fillOpacity: 0.85,
      });
      (layer as L.Path).unbindTooltip();
      (layer as L.Path).bindTooltip(
        `<strong>${props.name}</strong><br/>${stateData.users} developer${stateData.users !== 1 ? "s" : ""}<br/><span style="color:#34d399">${count} ${label}${count !== 1 ? "s" : ""}</span>`,
        { sticky: true, className: "nigeria-tooltip" }
      );
    });
  }, [filter, data]);

  const style = useCallback(
    (feature: Feature | undefined): PathOptions => {
      const props = feature?.properties as NigeriaStateProperties | undefined;
      const stateData = props
        ? data[props.stateId] || { users: 0, commits: 0, content: 0 }
        : { users: 0, commits: 0, content: 0 };
      const count = getCount(stateData, filter);
      return {
        fillColor: getColor(count),
        fillOpacity: 0.85,
        color: "#334155",
        weight: 1.5,
      };
    },
    [data, filter]
  );

  const onEachFeature = useCallback(
    (feature: Feature, layer: Layer) => {
      const props = feature.properties as NigeriaStateProperties;
      const stateData = data[props.stateId] || {
        users: 0,
        commits: 0,
        content: 0,
      };
      const count = getCount(stateData, filter);
      const label = getFilterLabel(filter);

      (layer as L.Path).bindTooltip(
        `<strong>${props.name}</strong><br/>${stateData.users} developer${stateData.users !== 1 ? "s" : ""}<br/><span style="color:#34d399">${count} ${label}${count !== 1 ? "s" : ""}</span>`,
        { sticky: true, className: "nigeria-tooltip" }
      );

      layer.on({
        mouseover: (e) => {
          (e.target as L.Path).setStyle({
            fillOpacity: 1,
            weight: 2.5,
            color: "#10b981",
          });
        },
        mouseout: (e) => {
          (e.target as L.Path).setStyle({
            fillOpacity: 0.85,
            weight: 1.5,
            color: "#334155",
          });
        },
      });
    },
    [data, filter]
  );

  if (!geojson) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-xl bg-slate-900">
        <p className="text-slate-500">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[9.05, 7.49]}
      zoom={6}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
      className="h-[500px] w-full rounded-xl bg-slate-900"
      style={{ background: "#0f172a" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution=""
      />
      <GeoJSON
        ref={geoJsonRef}
        key={filter}
        data={geojson}
        style={style}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}
