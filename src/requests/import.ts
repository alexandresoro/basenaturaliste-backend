import { HttpParameters } from "../http/httpParameters";
import { ImportAgeService } from "../services/import/import-age-service";
import { ImportClasseService } from "../services/import/import-classe-service";
import { ImportCommuneService } from "../services/import/import-commune-service";
import { ImportComportementService } from "../services/import/import-comportement-service";
import { ImportDepartementService } from "../services/import/import-departement-service";
import { ImportDoneeeService } from "../services/import/import-donnee-service";
import { ImportEspeceService } from "../services/import/import-espece-service";
import { ImportEstimationDistanceService } from "../services/import/import-estimation-distance-service";
import { ImportEstimationNombreService } from "../services/import/import-estimation-nombre-service";
import { ImportLieuxditService } from "../services/import/import-lieudit-service";
import { ImportMeteoService } from "../services/import/import-meteo-service";
import { ImportMilieuService } from "../services/import/import-milieu-service";
import { ImportObservateurService } from "../services/import/import-observateur-service";
import { ImportSexeService } from "../services/import/import-sexe-service";

export const importObservateurs = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportObservateurService();
  return importService.importFile(httpParameters.postData);
};

export const importDepartements = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportDepartementService();
  return importService.importFile(httpParameters.postData);
};

export const importCommunes = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportCommuneService();
  return importService.importFile(httpParameters.postData);
};

export const importLieuxdits = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportLieuxditService();
  return importService.importFile(httpParameters.postData);
};

export const importMeteos = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportMeteoService();
  return importService.importFile(httpParameters.postData);
};

export const importClasses = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportClasseService();
  return importService.importFile(httpParameters.postData);
};

export const importEspeces = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportEspeceService();
  return importService.importFile(httpParameters.postData);
};

export const importAges = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportAgeService();
  return importService.importFile(httpParameters.postData);
};

export const importSexes = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportSexeService();
  return importService.importFile(httpParameters.postData);
};

export const importEstimationsNombre = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportEstimationNombreService();
  return importService.importFile(httpParameters.postData);
};

export const importEstimationsDistance = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportEstimationDistanceService();
  return importService.importFile(httpParameters.postData);
};

export const importComportements = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportComportementService();
  return importService.importFile(httpParameters.postData);
};

export const importMilieux = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportMilieuService();
  return importService.importFile(httpParameters.postData);
};

export const importDonnees = async (
  httpParameters: HttpParameters
): Promise<string> => {
  const importService = new ImportDoneeeService();
  return importService.importFile(httpParameters.postData);
};
