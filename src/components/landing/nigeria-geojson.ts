import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";

export interface NigeriaStateProperties {
  name: string;
  stateId: string;
}

export type NigeriaGeoJSON = FeatureCollection<
  Polygon | MultiPolygon,
  NigeriaStateProperties
>;

export async function loadNigeriaGeoJSON(): Promise<NigeriaGeoJSON> {
  const res = await fetch("/nigeria-states.geojson");
  return res.json();
}
