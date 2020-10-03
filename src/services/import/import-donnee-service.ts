import { format } from "date-fns";
import * as _ from "lodash";
import { Age } from "ouca-common/age.object";
import { Classe } from "ouca-common/classe.object";
import { Commune } from "ouca-common/commune.model";
import { Comportement } from "ouca-common/comportement.object";
import {
  areCoordinatesCustomized,
  CoordinatesSystem,
  CoordinatesSystemType,
  COORDINATES_SYSTEMS_CONFIG
} from "ouca-common/coordinates-system";
import { Coordinates } from "ouca-common/coordinates.object";
import { Departement } from "ouca-common/departement.object";
import { Donnee } from "ouca-common/donnee.object";
import { Espece } from "ouca-common/espece.model";
import { EstimationDistance } from "ouca-common/estimation-distance.object";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { Lieudit } from "ouca-common/lieudit.model";
import { Meteo } from "ouca-common/meteo.object";
import { Milieu } from "ouca-common/milieu.object";
import { Observateur } from "ouca-common/observateur.object";
import { Sexe } from "ouca-common/sexe.object";
import { ImportedDonnee } from "../../objects/imported-donnee.object";
import { findAllAges } from "../../sql-api/sql-api-age";
import { findAllClasses } from "../../sql-api/sql-api-classe";
import { findAllCommunes } from "../../sql-api/sql-api-commune";
import { findAllComportements } from "../../sql-api/sql-api-comportement";
import { findCoordinatesSystem } from "../../sql-api/sql-api-configuration";
import { findAllDepartements } from "../../sql-api/sql-api-departement";
import {
  findExistingDonneeId,
  persistDonnee
} from "../../sql-api/sql-api-donnee";
import { findAllEspeces } from "../../sql-api/sql-api-espece";
import { findAllEstimationsDistance } from "../../sql-api/sql-api-estimation-distance";
import { findAllEstimationsNombre } from "../../sql-api/sql-api-estimation-nombre";
import {
  findExistingInventaireId,
  persistInventaire
} from "../../sql-api/sql-api-inventaire";
import { findAllLieuxDits } from "../../sql-api/sql-api-lieudit";
import { findAllMeteos } from "../../sql-api/sql-api-meteo";
import { findAllMilieux } from "../../sql-api/sql-api-milieu";
import { findAllObservateurs } from "../../sql-api/sql-api-observateur";
import { findAllSexes } from "../../sql-api/sql-api-sexe";
import { DATE_PATTERN } from "../../utils/constants";
import {
  getFormattedDate,
  getFormattedTime,
  isIdInListIds,
  isTimeValid
} from "../../utils/utils";
import { ImportService } from "./import-service";

export class ImportDoneeeService extends ImportService {
  private readonly OBSERVATEUR_INDEX = 0;
  private readonly ASSOCIES_INDEX = 1;
  private readonly DATE_INDEX = 2;
  private readonly HEURE_INDEX = 3;
  private readonly DUREE_INDEX = 4;
  private readonly DEPARTEMENT_INDEX = 5;
  private readonly COMMUNE_INDEX = 6;
  private readonly LIEUDIT_INDEX = 7;
  private readonly LATITUDE_INDEX = 8;
  private readonly LONGITUDE_INDEX = 9;
  private readonly ALTITUDE_INDEX = 10;
  private readonly TEMPERATURE_INDEX = 11;
  private readonly METEOS_INDEX = 12;
  private readonly ESPECE_INDEX = 13;
  private readonly NOMBRE_INDEX = 14;
  private readonly ESTIMATION_NOMBRE_INDEX = 15;
  private readonly SEXE_INDEX = 16;
  private readonly AGE_INDEX = 17;
  private readonly ESTIMATION_DISTANCE_INDEX = 18;
  private readonly DISTANCE_INDEX = 19;
  private readonly REGROUPEMENT_INDEX = 20;
  private readonly COMP_1_INDEX = 21;
  private readonly COMP_6_INDEX = 26;
  private readonly MILIEU_1_INDEX = 27;
  private readonly MILIEU_4_INDEX = 30;
  private readonly COMMENTAIRE_INDEX = 31;

  private readonly LIST_SEPARATOR = ",";

  private readonly ALTITUDE_MIN_VALUE = 0;
  private readonly ALTITUDE_MAX_VALUE = 65535;
  private readonly TEMPERATURE_MIN_VALUE = -128;
  private readonly TEMPERATURE_MAX_VALUE = 127;
  private readonly NOMBRE_MIN_VALUE = 1;
  private readonly NOMBRE_MAX_VALUE = 65535;
  private readonly DISTANCE_MIN_VALUE = 0;
  private readonly DISTANCE_MAX_VALUE = 65535;
  private readonly REGROUPEMENT_MIN_VALUE = 1;
  private readonly REGROUPEMENT_MAX_VALUE = 65535;

  private coordinatesSystemType: CoordinatesSystemType;
  private coordinatesSystem: CoordinatesSystem;
  private observateurs: Observateur[];
  private departements: Departement[];
  private communes: Commune[];
  private lieuxDits: Lieudit[];
  private classes: Classe[];
  private especes: Espece[];
  private ages: Age[];
  private sexes: Sexe[];
  private estimationsNombre: EstimationNombre[];
  private estimationsDistance: EstimationDistance[];
  private comportements: Comportement[];
  private milieux: Milieu[];
  private meteos: Meteo[];
  protected getNumberOfColumns = (): number => {
    return 32;
  };

  protected buildEntity = (
    inventaireId: number,
    especeId: number,
    sexeId: number,
    ageId: number,
    estimationNombreId: number,
    nombre: number | null,
    estimationDistanceId: number | null,
    distance: number | null,
    regroupement: number | null,
    comportementsIds: number[],
    milieuxIds: number[],
    commentaire: string | null
  ): Donnee => {
    return {
      id: null,
      inventaireId,
      especeId,
      sexeId,
      ageId,
      estimationNombreId,
      nombre,
      estimationDistanceId,
      distance,
      regroupement,
      comportementsIds,
      milieuxIds,
      commentaire
    };
  };

  protected init = async (): Promise<void> => {
    this.coordinatesSystemType = await findCoordinatesSystem();
    if (!this.coordinatesSystemType) {
      this.message =
        "Veuillez choisir le système de coordonnées de l'application dans la page de configuration";
      // return false;
    }
    this.coordinatesSystem =
      COORDINATES_SYSTEMS_CONFIG[this.coordinatesSystemType];

    this.observateurs = await findAllObservateurs();
    this.departements = await findAllDepartements();
    this.communes = await findAllCommunes();
    this.lieuxDits = await findAllLieuxDits();
    this.meteos = await findAllMeteos();
    this.classes = await findAllClasses();
    this.especes = await findAllEspeces();
    this.sexes = await findAllSexes();
    this.ages = await findAllAges();
    this.estimationsNombre = await findAllEstimationsNombre();
    this.estimationsDistance = await findAllEstimationsDistance();
    this.comportements = await findAllComportements();
    this.milieux = await findAllMilieux();
  };

  protected createEntity = async (entityTab: string[]): Promise<boolean> => {
    const rawDonnee: ImportedDonnee = this.getRawDonnee(entityTab);

    // First check the format of the fields
    // Return an error if some of the attributes are missing wrongly formatted
    if (
      !this.areInventaireAttributesValid(rawDonnee, this.coordinatesSystem) ||
      !this.areDonneeAttributesValid(rawDonnee)
    ) {
      return false;
    }

    // Then start getting the requested sub-objects to create the new "Donnee"

    // Get the "Observateur" or return an error if it doesn't exist
    const observateur: Observateur = this.observateurs.find((obs) => {
      return obs.libelle === rawDonnee.observateur;
    });

    if (!observateur) {
      this.message =
        "L'observateur  " + rawDonnee.observateur + " n'existe pas";
      return false;
    }

    // Get the "Observateurs associes" or return an error if some of them doesn't exist
    const associesIds: number[] = [];
    for (const associeLibelle of rawDonnee.associes) {
      const associe: Observateur = this.observateurs.find((a) => {
        return a.libelle === associeLibelle;
      });

      if (!associe) {
        this.message =
          "L'observateur associé " + associeLibelle + " n'existe pas";
        return false;
      }

      if (!isIdInListIds(associesIds, associe.id)) {
        associesIds.push(associe.id);
      }
    }

    // Get the "Date"
    // TODO for 01/01/2020 it returns 31/12/2020
    const date = format(getFormattedDate(rawDonnee.date.trim()), DATE_PATTERN);

    // Get the "Heure"
    const heure: string = getFormattedTime(rawDonnee.heure.trim());

    // Get the "Duree"
    const duree: string = getFormattedTime(rawDonnee.duree.trim());

    // Get the "Departement" or return an error if it doesn't exist
    const departement: Departement = this.departements.find((dept) => {
      return dept.code === rawDonnee.departement;
    });
    if (!departement) {
      this.message =
        "Le département " + rawDonnee.departement + " n'existe pas";
      return false;
    }

    // Get the "Commune" or return an error if it does not exist
    let commune: Commune = this.communes.find((com) => {
      return (
        com.departementId === departement.id &&
        ("" + com.code === rawDonnee.commune || com.nom === rawDonnee.commune)
      );
    });

    if (!commune) {
      this.message =
        "La commune avec pour code ou nom " +
        rawDonnee.commune +
        " n'existe pas dans le département " +
        departement.code;
      return false;
    }

    // Get the "Lieu-dit" or return an error if it does not exist
    const lieudit = this.lieuxDits.find((lieu) => {
      return lieu.communeId === commune.id && lieu.nom === rawDonnee.lieudit;
    });

    if (!lieudit) {
      this.message =
        "Le lieu-dit " +
        rawDonnee.lieudit +
        " n'existe pas dans la commune " +
        commune.code +
        " - " +
        commune.nom +
        " du département " +
        departement.code;
      return false;
    }

    // Get the customized coordinates
    let altitude: number = +rawDonnee.altitude;
    let coordinates: Coordinates = {
      longitude: +rawDonnee.longitude,
      latitude: +rawDonnee.latitude,
      system: this.coordinatesSystemType
    };
    if (
      !areCoordinatesCustomized(
        lieudit,
        altitude,
        coordinates.longitude,
        coordinates.latitude,
        this.coordinatesSystemType
      )
    ) {
      altitude = null;
      coordinates = null;
    }

    // Get the "Temperature"
    const temperature: number =
      _.isNil(rawDonnee.temperature) || rawDonnee.temperature === ""
        ? null
        : +rawDonnee.temperature;

    // Get the "Meteos" or return an error if some of them doesn't exist
    const meteosIds: number[] = [];
    for (const meteoLibelle of rawDonnee.meteos) {
      const meteo: Meteo = this.meteos.find((m) => {
        return m.libelle === meteoLibelle;
      });
      if (!meteo) {
        this.message = "La météo " + meteoLibelle + " n'existe pas";
        return false;
      }
      if (!isIdInListIds(meteosIds, meteo.id)) {
        meteosIds.push(meteo.id);
      }
    }

    // Get the "Espece" or return an error if it doesn't exist
    let espece: Espece = this.especes.find((e) => {
      return (
        e.code === rawDonnee.espece ||
        e.nomFrancais === rawDonnee.espece ||
        e.nomLatin === rawDonnee.espece
      );
    });

    if (!espece) {
      this.message =
        "L'espèce avec pour code, nom français ou nom scientifique " +
        rawDonnee.espece +
        " n'existe pas";
      return false;
    }

    // Get the "Sexe" or return an error if it doesn't exist
    const sexe = this.sexes.find((s) => {
      return s.libelle === rawDonnee.sexe;
    });
    if (!sexe) {
      this.message = "Le sexe " + rawDonnee.sexe + " n'existe pas";
      return false;
    }

    // Get the "Age" or return an error if it doesn't exist
    const age = this.ages.find((a) => {
      return a.libelle === rawDonnee.age;
    });
    if (!age) {
      this.message = "L'âge " + rawDonnee.age + " n'existe pas";
      return false;
    }

    // Get the "Estimation du nombre" or return an error if it doesn't exist
    const estimationNombre = this.estimationsNombre.find((e) => {
      return e.libelle === rawDonnee.estimationNombre;
    });
    if (!estimationNombre) {
      this.message =
        "L'estimation du nombre " +
        rawDonnee.estimationNombre +
        " n'existe pas";
      return false;
    }

    // Get the "Nombre"
    // TODO check that 0 is OK
    const nombre: number = rawDonnee.nombre ? +rawDonnee.nombre : null;

    if (!estimationNombre.nonCompte && !nombre) {
      // If "Estimation du nombre" is of type "Compté" then "Nombre" should not be empty
      this.message =
        "Le nombre ne doit pas être vide quand l'estimation du nombre est de type Compté";
      return false;
    } else if (!!estimationNombre.nonCompte && !!nombre) {
      // If "Estimation du nombre" is of type "Non-compté" then "Nombre" should be empty
      this.message =
        "L'estimation du nombre " +
        estimationNombre.libelle +
        " est de type Non-compté donc le nombre devrait être vide";
      return false;
    }

    // Get the "Estimation de la distance" or return an error if it doesn't exist
    let estimationDistance: EstimationDistance = null;
    if (rawDonnee.estimationDistance) {
      estimationDistance = this.estimationsDistance.find((e) => {
        return e.libelle === rawDonnee.estimationDistance;
      });
      if (!estimationDistance) {
        this.message =
          "L'estimation de la distance " +
          rawDonnee.estimationDistance +
          " n'existe pas";
        return false;
      }
    }

    // Get the "Distance"
    const distance: number = rawDonnee.distance ? +rawDonnee.distance : null;

    // Get the "Regroupement"
    const regroupement: number = rawDonnee.regroupement
      ? +rawDonnee.regroupement
      : null;

    // Get the "Comportements" or return an error if some of them does not exist
    const comportementsIds: number[] = [];
    for (const comportementStr of rawDonnee.comportements) {
      let comportement = this.comportements.find((c) => {
        return c.code === comportementStr || c.libelle === comportementStr;
      });

      if (!comportement) {
        this.message =
          "Le comportement avec pour code ou libellé " +
          comportementStr +
          " n'existe pas";
        return false;
      }

      if (!isIdInListIds(comportementsIds, comportement.id)) {
        comportementsIds.push(comportement.id);
      }
    }

    // Get the "Milieux" or return an error if some of them does not exist
    const milieuxIds: number[] = [];
    for (const milieuStr of rawDonnee.milieux) {
      let milieu: Milieu = this.milieux.find((m) => {
        return m.code === milieuStr || m.libelle === milieuStr;
      });

      if (!milieu) {
        this.message =
          "Le milieu avec pour code ou libellé " + milieuStr + " n'existe pas";
        return false;
      }

      if (!isIdInListIds(milieuxIds, milieu.id)) {
        milieuxIds.push(milieu.id);
      }
    }

    // Get the "Commentaire" and replace forbidden character
    const commentaire: string = rawDonnee.commentaire
      ? rawDonnee.commentaire.replace(";", ",")
      : null;

    // Create the "Inventaire" to save
    const inventaireToSave: Inventaire = this.buildInventaire(
      observateur.id,
      associesIds,
      date,
      heure,
      duree,
      lieudit.id,
      temperature,
      meteosIds,
      altitude,
      coordinates
    );

    // Save the inventaire
    const existingInventaireId: number = await findExistingInventaireId(
      inventaireToSave
    );
    if (!existingInventaireId) {
      const inventaireSaveResponse = await persistInventaire(inventaireToSave);
      inventaireToSave.id = inventaireSaveResponse.insertId;
    } else {
      inventaireToSave.id = existingInventaireId;
    }

    // Create the "Donnee" to save
    const donneeToSave: Donnee = this.buildEntity(
      inventaireToSave.id,
      espece.id,
      sexe.id,
      age.id,
      estimationNombre.id,
      nombre,
      estimationDistance ? estimationDistance.id : null,
      distance,
      regroupement,
      comportementsIds,
      milieuxIds,
      commentaire
    );

    // Save the "Donnee" or return an error if it does not exist
    const existingDonneeId: number = await findExistingDonneeId(donneeToSave);
    if (!existingDonneeId) {
      const saveDonneeResponse = await persistDonnee(donneeToSave);
      return !!saveDonneeResponse?.insertId;
    } else {
      this.message =
        "Une donnée similaire existe déjà (voir ID=" + existingDonneeId + ")";
      return false;
    }
  };

  private areInventaireAttributesValid = (
    donneeToImport: ImportedDonnee,
    coordinatesSystem: CoordinatesSystem
  ): boolean => {
    if (
      !this.isObservateurValid(donneeToImport.observateur) ||
      !this.isDateValid(donneeToImport.date) ||
      !this.isHeureValid(donneeToImport.heure) ||
      !this.isDureeValid(donneeToImport.duree) ||
      !this.isDepartementValid(donneeToImport.departement) ||
      !this.isCommuneValid(donneeToImport.commune) ||
      !this.isLieuditValid(donneeToImport.lieudit) ||
      !this.isAltitudeValid(donneeToImport.altitude) ||
      !this.isLongitudeValid(donneeToImport.longitude, coordinatesSystem) ||
      !this.isLatitudeValid(donneeToImport.latitude, coordinatesSystem) ||
      !this.isTemperatureValid(donneeToImport.temperature)
    ) {
      return false;
    }
    return true;
  };

  private areDonneeAttributesValid = (
    donneeToImport: ImportedDonnee
  ): boolean => {
    if (
      !this.isEspeceValid(donneeToImport.espece) ||
      !this.isSexeValid(donneeToImport.sexe) ||
      !this.isAgeValid(donneeToImport.age) ||
      !this.isNombreValid(donneeToImport.nombre) ||
      !this.isEstimationNombreValid(donneeToImport.estimationNombre) ||
      !this.isDistanceValid(donneeToImport.distance) ||
      !this.isRegroupementValid(donneeToImport.regroupement)
    ) {
      return false;
    }
    return true;
  };

  private buildInventaire = (
    observateurId: number,
    associesIds: number[],
    date: string,
    heure: string | null,
    duree: string | null,
    lieuditId: number,
    temperature: number | null,
    meteosIds: number[],
    altitude: number | null,
    coordinates: Coordinates
  ): Inventaire => {
    const inventaire: Inventaire = {
      id: null,
      observateurId,
      associesIds,
      date: date,
      heure: heure,
      duree: duree,
      lieuditId,
      customizedAltitude: altitude,
      coordinates,
      temperature,
      meteosIds
    };

    return inventaire;
  };

  private isObservateurValid = (observateur: string): boolean => {
    return this.isNotEmptyString(observateur, "L'observateur");
  };

  private isDateValid = (dateStr: string): boolean => {
    if (!dateStr) {
      this.message = "La date ne peut pas être vide";
      return false;
    }

    const date = getFormattedDate(dateStr.trim());

    if (!date) {
      this.message = "La date ne respecte pas le format demandé: JJ/MM/AAAA";
      return false;
    }

    return true;
  };

  private isHeureValid = (heure: string): boolean => {
    if (heure && !isTimeValid(heure)) {
      this.message = "L'heure ne respecte pas le format demandé: HH:MM";
      return false;
    }
    return true;
  };

  private isDureeValid = (duree: string): boolean => {
    if (duree && !isTimeValid(duree)) {
      this.message = "La durée ne respecte pas le format demandé: HH:MM";
      return false;
    }
    return true;
  };

  private isDepartementValid = (departement: string): boolean => {
    return this.isNotEmptyString(departement, "Le département");
  };

  private isCommuneValid = (code: string): boolean => {
    code = code.trim();

    if (!code) {
      this.message = "La commune du lieu-dit ne peut pas être vide";
      return false;
    }

    return true;
  };

  private isLieuditValid = (lieudit: string): boolean => {
    return this.isNotEmptyString(lieudit, "Le lieu-dit");
  };

  private isAltitudeValid(altitudeStr: string): boolean {
    if (!altitudeStr) {
      this.message = "L'altitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const altitude = Number(altitudeStr);

    if (!Number.isInteger(altitude)) {
      this.message = "L'altitude du lieu-dit doit être un entier";
      return false;
    }

    if (
      altitude < this.ALTITUDE_MIN_VALUE ||
      altitude > this.ALTITUDE_MAX_VALUE
    ) {
      this.message =
        "L'altitude du lieu-dit doit être un entier compris entre " +
        this.ALTITUDE_MIN_VALUE +
        " et " +
        this.ALTITUDE_MAX_VALUE;
      return false;
    }

    return true;
  }

  private isLongitudeValid(
    longitudeStr: string,
    coordinatesSystem: CoordinatesSystem
  ): boolean {
    if (!longitudeStr) {
      this.message = "La longitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const longitude = Number(longitudeStr);

    if (
      isNaN(longitude) ||
      longitude < coordinatesSystem.longitudeRange.min ||
      longitude > coordinatesSystem.longitudeRange.max
    ) {
      this.message =
        "La longitude du lieu-dit doit être un nombre compris entre " +
        coordinatesSystem.longitudeRange.min +
        " et " +
        coordinatesSystem.longitudeRange.max;
      return false;
    }

    return true;
  }

  private isLatitudeValid(
    latitudeStr: string,
    coordinatesSystem: CoordinatesSystem
  ): boolean {
    if (!latitudeStr) {
      this.message = "La latitude du lieu-dit ne peut pas être vide";
      return false;
    }

    const latitude = Number(latitudeStr);

    if (
      isNaN(latitude) ||
      latitude < coordinatesSystem.latitudeRange.min ||
      latitude > coordinatesSystem.latitudeRange.max
    ) {
      this.message =
        "La latitude du lieu-dit doit être un nombre compris entre " +
        coordinatesSystem.latitudeRange.min +
        " et " +
        coordinatesSystem.latitudeRange.max +
        " " +
        latitude;
      return false;
    }

    return true;
  }

  private isTemperatureValid = (temperatureStr: string): boolean => {
    if (temperatureStr) {
      const temperature = Number(temperatureStr);

      if (!Number.isInteger(temperature)) {
        this.message = "La température doit être un entier";
        return false;
      }

      if (
        temperature < this.TEMPERATURE_MIN_VALUE ||
        temperature > this.TEMPERATURE_MAX_VALUE
      ) {
        this.message =
          "La temperature doit être un entier compris entre " +
          this.TEMPERATURE_MIN_VALUE +
          " et " +
          this.TEMPERATURE_MAX_VALUE;
        return false;
      }
    }
    return true;
  };

  private isEspeceValid = (code: string): boolean => {
    return this.isNotEmptyString(code, "L'espèce");
  };

  private isSexeValid = (sexe: string): boolean => {
    return this.isNotEmptyString(sexe, "Le sexe");
  };

  private isAgeValid = (age: string): boolean => {
    return this.isNotEmptyString(age, "L'âge");
  };

  private isEstimationNombreValid = (estimation: string): boolean => {
    return this.isNotEmptyString(estimation, "L'estimation du nombre");
  };

  private isNombreValid = (nombreStr: string): boolean => {
    if (nombreStr) {
      const nombre = Number(nombreStr);

      if (!Number.isInteger(nombre)) {
        this.message = "Le nombre d'individus doit être un entier";
        return false;
      }

      if (nombre < this.NOMBRE_MIN_VALUE || nombre > this.NOMBRE_MAX_VALUE) {
        this.message =
          "Le nombre d'individus doit être un entier compris entre " +
          this.NOMBRE_MIN_VALUE +
          " et " +
          this.NOMBRE_MAX_VALUE;
        return false;
      }
    }
    return true;
  };

  private isDistanceValid = (distanceStr: string): boolean => {
    if (distanceStr) {
      const distance = Number(distanceStr);

      if (!Number.isInteger(distance)) {
        this.message = "La distance de contact doit être un entier";
        return false;
      }

      if (
        distance < this.DISTANCE_MIN_VALUE ||
        distance > this.DISTANCE_MAX_VALUE
      ) {
        this.message =
          "La distance de contact doit être un entier compris entre " +
          this.DISTANCE_MIN_VALUE +
          " et " +
          this.DISTANCE_MAX_VALUE;
        return false;
      }
    }
    return true;
  };

  private isRegroupementValid = (regroupementStr: string): boolean => {
    if (regroupementStr) {
      const regroupement = Number(regroupementStr);

      if (!Number.isInteger(regroupement)) {
        this.message = "La numéro de regroupement doit être un entier";
        return false;
      }

      if (
        regroupement < this.REGROUPEMENT_MIN_VALUE ||
        regroupement > this.REGROUPEMENT_MAX_VALUE
      ) {
        this.message =
          "Le numéro de regroupement doit être un entier compris entre " +
          this.REGROUPEMENT_MIN_VALUE +
          " et " +
          this.REGROUPEMENT_MAX_VALUE;
        return false;
      }
    }
    return true;
  };

  private isNotEmptyString = (str: string, attributeType: string): boolean => {
    str = str.trim();

    if (!str) {
      this.message = attributeType + " ne peut pas être vide";
      return false;
    }

    return true;
  };

  private getRawDonnee = (attributes: string[]): ImportedDonnee => {
    const comportements: string[] = [];
    for (
      let comportementIndex = this.COMP_1_INDEX;
      comportementIndex <= this.COMP_6_INDEX;
      comportementIndex++
    ) {
      const comportement: string = attributes[comportementIndex].trim();
      if (comportement) {
        comportements.push(comportement);
      }
    }

    const milieux: string[] = [];
    for (
      let milieuIndex = this.MILIEU_1_INDEX;
      milieuIndex <= this.MILIEU_4_INDEX;
      milieuIndex++
    ) {
      const milieu: string = attributes[milieuIndex].trim();
      if (milieu) {
        milieux.push(milieu);
      }
    }

    return {
      observateur: attributes[this.OBSERVATEUR_INDEX].trim(),
      associes: attributes[this.ASSOCIES_INDEX]
        ? attributes[this.ASSOCIES_INDEX].trim().split(this.LIST_SEPARATOR)
        : [],
      date: attributes[this.DATE_INDEX].trim(),
      heure: attributes[this.HEURE_INDEX].trim(),
      duree: attributes[this.DUREE_INDEX].trim(),
      departement: attributes[this.DEPARTEMENT_INDEX].trim(),
      commune: attributes[this.COMMUNE_INDEX].trim(),
      lieudit: attributes[this.LIEUDIT_INDEX].trim(),
      altitude: attributes[this.ALTITUDE_INDEX].trim().replace(",", "."),
      longitude: attributes[this.LONGITUDE_INDEX].trim().replace(",", "."),
      latitude: attributes[this.LATITUDE_INDEX].trim().replace(",", "."),
      temperature: attributes[this.TEMPERATURE_INDEX].trim().replace(",", "."),
      meteos: attributes[this.METEOS_INDEX]
        ? attributes[this.METEOS_INDEX].trim().split(this.LIST_SEPARATOR)
        : [],
      espece: attributes[this.ESPECE_INDEX].trim(),
      age: attributes[this.AGE_INDEX].trim(),
      sexe: attributes[this.SEXE_INDEX].trim(),
      nombre: attributes[this.NOMBRE_INDEX].trim().replace(",", "."),
      estimationNombre: attributes[this.ESTIMATION_NOMBRE_INDEX].trim(),
      distance: attributes[this.DISTANCE_INDEX].trim().replace(",", "."),
      estimationDistance: attributes[this.ESTIMATION_DISTANCE_INDEX].trim(),
      regroupement: attributes[this.REGROUPEMENT_INDEX].trim(),
      comportements,
      milieux,
      commentaire: attributes[this.COMMENTAIRE_INDEX].trim()
    };
  };
}
