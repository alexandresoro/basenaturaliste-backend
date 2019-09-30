export interface FlatDonneeWithMinimalData {
  id: number;
  inventaireId: number;
  observateurId: number;
  date: Date;
  heure: string | null;
  duree: string | null;
  lieuditId: number;
  altitude: number | null;
  longitude: number | null;
  latitude: number | null;
  temperature: number | null;
  especeId: number;
  sexeId: number;
  ageId: number;
  estimationNombreId: number;
  nombre: number | null;
  estimationDistanceId: number | null;
  distance: number | null;
  regroupement: number | null;
  commentaire: string | null;
}