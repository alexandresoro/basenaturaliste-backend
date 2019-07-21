import { HttpParameters } from "./http/httpParameters";
import {
  configurationInit,
  configurationUpdate
} from "./requests/configuration";
import {
  creationInit,
  deleteDonnee,
  getDonneeByIdWithContext,
  getInventaireById,
  getNextDonnee,
  getNextRegroupement,
  getPreviousDonnee,
  saveDonnee,
  saveInventaire
} from "./requests/creation";
import {
  deleteAge,
  deleteClasse,
  deleteCommune,
  deleteComportement,
  deleteDepartement,
  deleteEspece,
  deleteEstimationDistance,
  deleteEstimationNombre,
  deleteLieudit,
  deleteMeteo,
  deleteMilieu,
  deleteObservateur,
  deleteSexe,
  getAges,
  getClasses,
  getCommunes,
  getComportements,
  getDepartements,
  getEspeces,
  getEstimationsDistance,
  getEstimationsNombre,
  getLieuxdits,
  getMeteos,
  getMilieux,
  getObservateurs,
  getSexes,
  saveAge,
  saveClasse,
  saveCommune,
  saveComportement,
  saveDepartement,
  saveEspece,
  saveEstimationDistance,
  saveEstimationNombre,
  saveLieudit,
  saveMeteo,
  saveMilieu,
  saveObservateur,
  saveSexe
} from "./requests/gestion";
import {
  importAges,
  importClasses,
  importCommunes,
  importComportements,
  importDepartements,
  importDonnees,
  importEspeces,
  importEstimationsDistance,
  importEstimationsNombre,
  importLieuxdits,
  importMeteos,
  importMilieux,
  importObservateurs,
  importSexes
} from "./requests/import";
import { saveDatabase, saveDatabaseFileName } from "./requests/save";
import { getDonnees, getDonneesByCustomizedFilters } from "./requests/view";

export const REQUEST_MAPPING: {
  [path: string]: (
    httpParameters: HttpParameters,
    isDockerMode?: boolean
  ) => Promise<any>;
} = {
  "/api/creation/init": creationInit,
  "/api/inventaire/save": saveInventaire,
  "/api/inventaire/find": getInventaireById,
  "/api/donnee/all": getDonnees,
  "/api/donnee/search": getDonneesByCustomizedFilters,
  "/api/donnee/save": saveDonnee,
  "/api/donnee/delete": deleteDonnee,
  "/api/donnee/next_donnee": getNextDonnee,
  "/api/donnee/previous_donnee": getPreviousDonnee,
  "/api/donnee/next_regroupement": getNextRegroupement,
  "/api/donnee/find_with_context": getDonneeByIdWithContext,
  "/api/donnee/import": importDonnees,
  "/api/observateur/all": getObservateurs,
  "/api/observateur/save": saveObservateur,
  "/api/observateur/delete": deleteObservateur,
  "/api/observateur/import": importObservateurs,
  "/api/departement/all": getDepartements,
  "/api/departement/save": saveDepartement,
  "/api/departement/delete": deleteDepartement,
  "/api/departement/import": importDepartements,
  "/api/commune/all": getCommunes,
  "/api/commune/save": saveCommune,
  "/api/commune/delete": deleteCommune,
  "/api/commune/import": importCommunes,
  "/api/lieudit/all": getLieuxdits,
  "/api/lieudit/save": saveLieudit,
  "/api/lieudit/delete": deleteLieudit,
  "/api/lieudit/import": importLieuxdits,
  "/api/meteo/all": getMeteos,
  "/api/meteo/save": saveMeteo,
  "/api/meteo/delete": deleteMeteo,
  "/api/meteo/import": importMeteos,
  "/api/classe/all": getClasses,
  "/api/classe/save": saveClasse,
  "/api/classe/delete": deleteClasse,
  "/api/classe/import": importClasses,
  "/api/espece/all": getEspeces,
  "/api/espece/save": saveEspece,
  "/api/espece/delete": deleteEspece,
  "/api/espece/import": importEspeces,
  "/api/sexe/all": getSexes,
  "/api/sexe/save": saveSexe,
  "/api/sexe/delete": deleteSexe,
  "/api/sexe/import": importSexes,
  "/api/age/all": getAges,
  "/api/age/save": saveAge,
  "/api/age/delete": deleteAge,
  "/api/age/import": importAges,
  "/api/estimation-nombre/all": getEstimationsNombre,
  "/api/estimation-nombre/save": saveEstimationNombre,
  "/api/estimation-nombre/delete": deleteEstimationNombre,
  "/api/estimation-nombre/import": importEstimationsNombre,
  "/api/estimation-distance/all": getEstimationsDistance,
  "/api/estimation-distance/save": saveEstimationDistance,
  "/api/estimation-distance/delete": deleteEstimationDistance,
  "/api/estimation-distance/import": importEstimationsDistance,
  "/api/comportement/all": getComportements,
  "/api/comportement/save": saveComportement,
  "/api/comportement/delete": deleteComportement,
  "/api/comportement/import": importComportements,
  "/api/milieu/all": getMilieux,
  "/api/milieu/save": saveMilieu,
  "/api/milieu/delete": deleteMilieu,
  "/api/milieu/import": importMilieux,
  "/api/configuration/init": configurationInit,
  "/api/configuration/update": configurationUpdate,
  "/api/database/save": saveDatabase
};

// Mapping between the api requested and the media type (MIME) of the response
export const REQUEST_MEDIA_TYPE_RESPONSE_MAPPING = {
  "/api/database/save": "application/sql",
  "/api/observateur/import": "text/csv",
  "/api/departement/import": "text/csv",
  "/api/commune/import": "text/csv",
  "/api/lieudit/import": "text/csv",
  "/api/meteo/import": "text/csv",
  "/api/classe/import": "text/csv",
  "/api/espece/import": "text/csv",
  "/api/sexe/import": "text/csv",
  "/api/age/import": "text/csv",
  "/api/estimation-nombre/import": "text/csv",
  "/api/estimation-distance/import": "text/csv",
  "/api/milieu/import": "text/csv",
  "/api/comportement/import": "text/csv",
  "/api/donnee/import": "text/csv"
};

// List of api requests that expect to return a response as file attachment
// The value is actually a function that will return the file name to be used
export const REQUESTS_WITH_ATTACHMENT_FILE_NAME_RESPONSES: {
  [path: string]: () => string;
} = {
  "/api/database/save": saveDatabaseFileName
};
