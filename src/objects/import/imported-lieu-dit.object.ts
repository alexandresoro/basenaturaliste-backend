import { CoordinatesSystem } from "../../model/coordinates-system/coordinates-system.object";
import { Lieudit } from "../../model/types/lieudit.model";
import { CoordinatesValidatorHelper } from "./coordinates-validation.helper";

const DEPARTEMENT_INDEX = 0;
const COMMUNE_INDEX = 1;
const NOM_INDEX = 2;
const LATITUDE_INDEX = 3;
const LONGITUDE_INDEX = 4;
const ALTITUDE_INDEX = 5;

const LIEUDIT_MAX_LENGTH = 150;

export class ImportedLieuDit {

  departement: string;
  commune: string;
  nom: string;
  latitude: string;
  altitude: string;
  longitude: string;
  coordinatesSystem: CoordinatesSystem;

  constructor(lieuDitTab: string[], coordinatesSystem: CoordinatesSystem) {
    this.departement = lieuDitTab[DEPARTEMENT_INDEX].trim();
    this.commune = lieuDitTab[COMMUNE_INDEX].trim();
    this.nom = lieuDitTab[NOM_INDEX].trim();
    this.latitude = lieuDitTab[LATITUDE_INDEX].trim().replace(",", ".");
    this.longitude = lieuDitTab[LONGITUDE_INDEX].trim().replace(",", ".");
    this.altitude = lieuDitTab[ALTITUDE_INDEX].trim().replace(",", ".");
    this.coordinatesSystem = coordinatesSystem;
  }

  buildLieudit = (
    communeId: number
  ): Lieudit => {
    return {
      id: null,
      communeId,
      nom: this.nom,
      altitude: +this.altitude,
      coordinates: {
        longitude: +(+this.longitude).toFixed(this.coordinatesSystem.decimalPlaces),
        latitude: +(+this.latitude).toFixed(this.coordinatesSystem.decimalPlaces),
        system: this.coordinatesSystem.code
      }
    };
  };

  checkValidity = (): string => {
    const departementError = this.checkDepartementValidity();
    if (departementError) {
      return departementError;
    }

    const communeError = this.checkCommuneValidity();
    if (communeError) {
      return communeError;
    }

    const nomLieuditError = this.checkNomValidity();
    if (nomLieuditError) {
      return nomLieuditError;
    }

    const latitudeError = CoordinatesValidatorHelper.checkLatitudeValidity(this.latitude, this.coordinatesSystem);
    if (latitudeError) {
      return latitudeError;
    }

    const longitudeError = CoordinatesValidatorHelper.checkLongitudeValidity(this.longitude, this.coordinatesSystem);
    if (longitudeError) {
      return longitudeError;
    }

    const altitudeError = CoordinatesValidatorHelper.checkAltitudeValidity(this.altitude);
    if (altitudeError) {
      return altitudeError;
    }
  }


  private checkDepartementValidity = (): string => {
    return this.departement ? null : "Le département du lieu-dit ne peut pas être vide";
  };

  private checkCommuneValidity = (): string => {
    return this.commune ? null : "La commune du lieu-dit ne peut pas être vide";
  };

  private checkNomValidity = (): string => {
    if (!this.nom) {
      return "Le nom du lieu-dit ne peut pas être vide";
    }

    if (this.nom.length > LIEUDIT_MAX_LENGTH) {
      return `La longueur maximale du nom du lieu-dit est de ${LIEUDIT_MAX_LENGTH} caractères`;
    }

    return null;
  };


}