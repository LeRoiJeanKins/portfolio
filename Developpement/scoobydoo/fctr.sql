CREATE TABLE episode (
    titre long VARCHAR,
    dateDiffu DATE,
    dureeEpi INTEGER,
    formId varChar(6),
    voixVelma varChar(15),
    voixFred varChar(15),
    voixDaphnee varChar(15),
    voixScooby varChar(15),
    voixShaggy varChar(15),
    monstreId varChar(15),
    chaineId varChar(10),
    saisonId varChar(10),
    serieId varChar(20),
    terrainId varChar(10),
    zoneGeoId varChar(10),
    nbSnack varChar(2),

)
CREATE table snack(
    id INTEGER IDENTITY PRIMARY KEY,
    nb varChar(25)
)
INSERT INTO snack(nb)
    SELECT DISTINCT numberOfSnacks 
    FROM R0_

ALTER TABLE episode
ADD CONSTRAINT fk_episode_terrain
FOREIGN KEY (terrainId)
REFERENCES terrain(id);



CREATE TABLE 
INSERT INTO episode(titre,dateDiffu,dureeEpi,formId,
            voixVelma,voixFred,voixDaphnee,voixScooby,voixShaggy
            ,chaineId,saisonId,serieId,terrainId,zoneGeoId,nbSnack)
    SELECT DISTINCT title ,
    CAST(SUBSTRING(dateAired,7,4) || '-' ||
   SUBSTRING(dateAired,4,2) || '-' || 
   SUBSTRING(dateAired,1,2) as DATE),
   runTime,
   format.id,
   (SELECT id FROM acteur WHERE nom = velmaVa AND perso = 'velma') ,
   (SELECT id FROM acteur WHERE nom = fredVa AND perso = 'fred') ,
   (SELECT id FROM acteur WHERE nom = daphnieVa AND perso = 'daphne') ,
   (SELECT id FROM acteur WHERE nom = scoobyVa AND perso = 'scooby') ,
   (SELECT id FROM acteur WHERE nom = shaggyVa AND perso = 'shaggy')  ,
   chaineDiffu.id,
   saison.id,
   serie.id,
   terrain.id,
   zoneGeographique.id,
   snack.id
   FROM R0_ 
   JOIN format ON format = formatEp
   JOIN chaineDiffu ON chaineDiffu.nom = network
   JOIN saison ON season = saison.nom
   JOIN serie ON seriesName = serie.nom
   JOIN terrain ON settingTerrain = terrain.nom
   JOIN zoneGeographique ON settingCountryOrState = zoneGeographique.nom
   JOIN snack ON nb = numberOfSnacks


CREATE TABLE saison(
    nom varChar(35),
    id varChar(10)
)
CREATE TABLE serie (
    nom long VARCHAR,
    id INTEGER PRIMARY KEY AUTOINCREMENT
);
INSERT INTO serie(nom)
    SELECT DISTINCT DBA.R0_.seriesName
FROM R0_
CREATE TABLE saison1 (
    titre varChar(100),
    dateCrea DATE,
    dureeEpi INT,
    terrainId INT,
    zoneId varChar(3),
    formatId varChar(3),
    chaineId varChar(10),
    casting varChar(15),
    nbSnack INT
);
CREATE TABLE saison2 (
    titre varChar(100),
    dateCrea DATE,
    dureeEpi INT,
    terrainId INT,
    zoneId varChar(3),
    formatId varChar(3),
    chaineId varChar(10),
    casting varChar(15),
    nbSnack INT
);
CREATE TABLE saison3 (
    titre varChar(100),
    dateCrea DATE,
    dureeEpi INT,
    terrainId INT,
    zoneId varChar(3),
    formatId varChar(3),
    chaineId varChar(10),
    casting varChar(15),
    nbSnack INT
);
CREATE TABLE saison4 (
    titre varChar(100),
    dateCrea DATE,
    dureeEpi INT,
    terrainId INT,
    zoneId varChar(3),
    formatId varChar(3),
    chaineId varChar(10),
    casting varChar(15),
    nbSnack INT
);
CREATE TABLE saisonFilm (
    titre varChar(100),
    dateCrea DATE,
    dureeEpi INT,
    terrainId INT,
    zoneId varChar(3),
    formatId varChar(3),
    chaineId varChar(10),
    casting varChar(15),
    nbSnack INT
);
CREATE TABLE saisonEpSpeciaux (
    titre varChar(100),
    dateCrea DATE,
    dureeEpi INT,
    terrainId INT,
    zoneId varChar(3),
    formatId varChar(3),
    chaineId varChar(10),
    casting varChar(15),
    nbSnack INT
);
CREATE TABLE saisonCrossover (
    titre varChar(100),
    dateCrea DATE,
    dureeEpi INT,
    terrainId INT,
    zoneId varChar(3),
    formatId varChar(3),
    chaineId varChar(10),
    casting varChar(15),
    nbSnack INT
);
CREATE TABLE chaineDiffu (
    id varChar(10),
    nom varChar(40)
)
CREATE TABLE monstre (
    genre varChar(1) NULL ,
    nom varChar(255),
    typeMonstre varChar(255),
    sousTypeMonstre varChar(255),
    specimen varChar(255)
)
CREATE TABLE acteur (
    id varChar(4),
    nom varChar(50)
)
CREATE TABLE format (
    id varChar(4),
    formatEp varChar(50)
)
CREATE TABLE terrain (
    id INT,
    varChar(20)
)
CREATE TABLE zoneGeographique (
    id varChar(3),
    nom varChar(25)
)
CREATE TABLE terrain(
    id varChar(10)
    nom varChar(25)
)

update terrain
 SET nom = settingTerrain
 FROM R0_

INSERT INTO acteur (nom , perso)
SELECT DISTINCT daphnieVA , 'daphne'
FROM R0_

SELECT substring(nom , 1, 1) || 
       CASE
            WHEN CHARINDEX(' ', nom) > 0 THEN 
            substring(nom, CHARINDEX(' ',nom) +1 , 1)
            ELSE ' '
        END ||
        CASE
            WHEN substring(nom, CHARINDEX(' ', CHARINDEX(' ' , nom) +1)) > 0 THEN 
            substring(nom, CHARINDEX(' ', CHARINDEX(' ' , nom) +1)+1 , 1)
            ELSE ' '
        END
FROM acteur;

CREATE PROCEDURE "DBA" . "concatAct" ()
BEGIN

SELECT substring(nom , 1, 2) || 
       CASE
            WHEN CHARINDEX(' ', nom) > 0 THEN 
            substring(nom, CHARINDEX(' ',nom) +1 , 2)
            ELSE ' '
        END ||
        CASE
            WHEN CHARINDEX(' ' ,SUBSTRING(nom , CHARINDEX(' ', nom)+1, LEN(nom) - CHARINDEX(' ', nom)+1)) > 0  THEN 
            substring(nom, CHARINDEX(' ', CHARINDEX(' ' , nom) +1) +1 , 2)
            ELSE ' '
        END as initiale
FROM acteur
WHERE nom IS NOT NULL AND NOM <> '';
END;

CREATE PROCEDURE "DBA" . "suppNull" (
    IN @nomTable varChar(20),
    IN @nomLigne varChar(35)
)
BEGIN 

    DECLARE @suppression LONG varChar;

    SET @suppression = 'DELETE FROM "' || @nomTable || '" WHERE "' || @nomLigne || '" = ''NULL'''

    EXECUTE IMMEDIATE @suppression

END

CREATE PROCEDURE "DBA"."suppNull" (
    IN @nomTable VARCHAR(20),
    IN @nomLigne VARCHAR(35)
)
BEGIN
    DECLARE @suppression LONG VARCHAR;

    SET @suppression = 'DELETE FROM "' || @nomTable || '" WHERE "' || @nomLigne || '" = ''NULL''';
    
    EXECUTE IMMEDIATE @suppression;
END;


SELECT * INTO acteur_test
        FROM acteur

UPDATE zoneGeographique 
SET id = substring(nom , 1, 2) || 
       CASE
            WHEN CHARINDEX(' ', nom) > 0 THEN 
            substring(nom, CHARINDEX(' ',nom) +1 , 2)
            ELSE ' '
        END ||
        CASE
            WHEN CHARINDEX(' ' ,SUBSTRING(nom , CHARINDEX(' ', nom)+1, LEN(nom) - CHARINDEX(' ', nom)+1)) > 0  THEN 
            substring(nom, CHARINDEX(' ', CHARINDEX(' ' , nom) +1) +1 , 2)
            ELSE ' '
        END
WHERE nom IS NOT NULL AND NOM <> '';

INSERT INTO saison1 (titre,dateCrea,dureeEpi,nbSnack)
SELECT DISTINCT seriesName ,
  CAST(SUBSTRING(dateAired,7,4) || '-' ||
   SUBSTRING(dateAired,4,2) || '-' || 
   SUBSTRING(dateAired,1,2) as DATE), 
   runTime ,
   numberOfSnacks
FROM R0_
WHERE season = '1'

UPDATE saison1
    SET terrainId = 

ALTER TABLE id 
FROM

update format
    SET id = 'TVSe(s'
WHERE formatEp = 'TV Series (segmented)'

ALTER TABLE saison1 
ALTER nbSnack varChar(20)

INSERT INTO terrain(nom)
    SELECT DISTINCT settingTerrain
    FROM R0_

INSERT INTO episodes(formId)
    SELECT DISTINCT id
    FROM dba.format join R0_ ON format = formatEp

update episode 
    set id = 'Wrestle Maniacs (1990)'
    WHERE nom = 'Wrestle Maniacs' AND dateDiffu = '1990-11-03'

ALTER TABLE episode
ADD CONSTRAINT fk_episode_acteur
FOREIGN KEY (serieId)
REFERENCES serie(id);

ALTER TABLE episode 
RENAME nbSnack SnackId

CREATE PROCEDURE get_Serie()
BEGIN
--
    SELECT nom
    FROM DBA.serie
    order BY nom asc
--
END

CREATE SERVICE "getSerie"
TYPE 'JSON'
AUTHORIZATION OFF
USER "DBA"
URL ON
METHODS 'GET'
AS CALl get_Serie()


    ALTER PROCEDURE "DBA"."sp_getActeurs"()
    begin
      select actId as id,actPrenom || ' ' || actNom as identité
        from DBA.tbActeurs
        order by actNom asc
    end

CREATE TABLE testMonstre(
    donnees long varchar
);
CREATE PROCEDURE page_addMonstre(IN test LONG VARCHAR)
BEGIN
--
    INSERT INTO DBA.test(donnees)
        values (test)
--
END;

CREATE SERVICE "addMonstre"
TYPE 'JSON'
AUTHORIZATION OFF
USER "DBA"
URL ON
METHODS 'POST'
AS CALl page_addMonstre(:monMonstre);

CREATE PROCEDURE "DBA"."prendreInfo"()
BEGIN
--
INSERT INTO test (donnees)
    SELECT monsterName
    FROM R0_
    WHERE monsterName LIKE '%|' OR
          monsterName LIKE '|%|' OR
          monsterName LIKE '|%'
--
END

CREATE PROCEDURE "DBA" . "infoEp"()
BEGIN
--
SELECT
    e.titre,
    v.nom AS voix_velma,
    f.nom AS voix_fred,
    d.nom AS voix_daphnee,
    s.nom AS voix_shaggy,
    sc.nom AS voix_scooby
FROM episode e
         JOIN acteur v  ON e.voixVelma   = v.id
         JOIN acteur f  ON e.voixFred    = f.id
         JOIN acteur d  ON e.voixDaphnee = d.id
         JOIN acteur s  ON e.voixShaggy  = s.id
         JOIN acteur sc ON e.voixScooby  = sc.id;
--
END;










CREATE SERVICE "getInfoEp"
    TYPE 'JSON'
    AUTHORIZATION OFF
    USER "DBA"
    URL ON
    METHODS 'GET'
    AS CALL infoEp()

CREATE SERVICE "getSerie"
TYPE 'JSON'
AUTHORIZATION OFF
USER "DBA"
URL ON
METHODS 'GET'
AS CALl get_Serie()

CREATE TABLE lienEpMonstre (
    monstre LONG VARCHAR,
    episode LONG VARCHAR,
    id INT identity PRIMARY KEY
)

INSERT INTO lienEpMonstre(monstre, episode)
SELECT name , épi
FROM monsterSplit()

ALTER TABLE lienEpMonstre
    ADD CONSTRAINT fk_monstre_epi
        FOREIGN KEY (monstre)
            REFERENCES monstre(nom);

ALTER TABLE lienEpMonstre
    ADD CONSTRAINT fk_epi_monstre
        FOREIGN KEY (episode)
            REFERENCES episode(titre);

CREATE TABLE lienSousTypeMonstre(
    nomMonstre varChar(255),
    sousType varChar(255),
    id int
)

INSERT INTO lienSousTypeMonstre(
    sousType , nomMonstre
)
SELECT DISTINCT monstre.sousTypeMonstre , monstre.nom
FROM monstre

CREATE TABLE lienSousTypeMonstre(
    nomMonstre varChar(255),
    sousType varChar(255),
    id INT IDENTITY primary key
    )

CREATE TABLE lienTypeMonstre(
                                typeMonstre varChar(255),
                                nomEpi VARCHAR(255),
                                id INT Identity PRIMARY KEY
)

    INSERT INTO lienTypeMonstre(typeMonstre,nomEpi)
SELECT DISTINCT typeMonstreId, nom
FROM monstre

         TRUNCATE table lienTypeMonstre

ALTER TABLE monstre
DELETE typeMonstreId

CREATE TABLE lienSpecimenMonstre(
                                    specimenMonstre varChar(255),
                                    nomEpi VARCHAR(255),
                                    id INT Identity PRIMARY KEY
)

    INSERT INTO lienTypeMonstre(typeMonstre,nomEpi)
SELECT DISTINCT typeMonstreId, nom
FROM monstre

         TRUNCATE table monstre

ALTER TABLE monstre
DELETE typeMonstreId

insert into monstre(nom , genreId)
SELECT DISTINCT nom , genreId
FROM tbMonstre

    INSERT INTO lienSpecimenMonstre(specimenMonstre,nomEpi)
SELECT DISTINCT nom , specimenId
FROM monstre

CREATE TABLE lienGenreMonstre(
                                 genre varChar(1),
                                 nomMonstre varChar(255),
                                 id INT IDENTITY PRIMARY KEY
)
DROP TABLE lienGenreMonstre
    INSERT INTO lienGenreMonstre(genre,nomMonstre)
SELECT DISTINCT genreId , nom
FROM monstre

    truncate table lienGenreMonstre

INSERT INTO lienGenreMonstre(nom, genre)
SELECT DISTINCT name , gender
FROM monsterSplit()

ALTER TABLE lienSpecimenMonstre RENAME  nomEpi TO nom;

alter table

    DELETE FROM lienTypeMonstre WHERE nom = 'NULL' OR nom = 'Big Foot' OR nom = 'Swamp monster'
    ALTER TABLE lienSousTypeMonstre
    ADD CONSTRAINT fk_sousType_Monstre
    FOREIGN KEY (nomMonstre)
    REFERENCES monstre(nom);




CREATE PROCEDURE info_monstre_epi()
BEGIN
--
SELECT lienEpMonstre.episode , monstre.nom as nomMonstre , lienSousTypeMonstre.sousType , lienTypeMonstre.typeMonstre as type,
       genre.nom as genre
FROM monstre join lienEpMonstre
             join lienTypeMonstre as t
             join lienSousTypeMonstre
             join lienTypeMonstre
             join lienGenreMonstre
             join genre
--
END

CREATE SERVICE "infoMonstreEpi"
TYPE 'JSON'
AUTHORIZATION OFF
USER "DBA"
URL ON
METHODS 'POST'
AS CALL info_monstre_epi();

CREATE SERVICE "addMonstre"
TYPE 'RAW'
AUTHORIZATION OFF
USER "DBA"
URL ON
METHODS 'POST'
AS CALl add_monstre(:valeur);


CREATE PROCEDURE add_monstre(
    IN nom LONG VARCHAR,
    IN type LONG VARCHAR,
    IN sousType LONG VARCHAR,
    IN espece LONG VARCHAR
    )
BEGIN
--
    INSERT INTO test(nom,type,sousType,espece)
    values(nom , type , sousType , espece)
--
END;

CREATE TABLE test(
    nom LONG VARCHAR,
    type LONG VARCHAR,
    sousType LONG VARCHAR,
    sousType LONG VARCHAR
)

ALTER PROCEDURE "DBA"."add_monstre"(
    IN nom LONG VARCHAR,
    IN type LONG VARCHAR,
    IN sousType LONG VARCHAR,
    IN espece LONG VARCHAR
    )
BEGIN
--
INSERT INTO test ( sousType, espece)
VALUES(sousType, espece);

--
END
CREATE SERVICE "addMonstre"
TYPE 'RAW'
AUTHORIZATION OFF
USER "DBA"
URL ON
METHODS 'POST'
AS CALL add_monstre(:nom, :type, :sousType, :espece);


CREATE PROCEDURE add_monstre(
    IN nom LONG VARCHAR,
    IN type LONG VARCHAR,
    IN sousType LONG VARCHAR,
    IN espece LONG VARCHAR
)
BEGIN
--
    INSERT INTO test(nom, type, sousType, espece)
        VALUES(:nom, :type, :sousType, :espece);

    SELECT 'ok' AS status, nom AS nomAjoute;
--
END;

alter table test
add etat long VARCHAR

ALTER PROCEDURE "DBA"."supp_MONSTRE"(
    IN nomM LONG VARCHAR
    )
BEGIN
--
SELECT
    CASE
        WHEN etat = 'inactif'
            THEN 'Suppression impossible'
        ELSE 'Suppression effectué'
        END
FROM test
WHERE nom = nomM;

update test
SET etat = 'inactif'
WHERE nom = nomM
--
END;


CREATE SERVICE suppMonstre
type 'RAW'
AUTHORIZATION OFF
user "DBA"
URL ON
METHODS 'POST'
as CALL supp_MONSTRE(:nom);





ALTER PROCEDURE "DBA"."add_monstre"(
    IN p_nom LONG VARCHAR,
    IN p_type LONG VARCHAR,
    IN p_sousType LONG VARCHAR,
    IN p_espece LONG VARCHAR
    )
BEGIN
--

DECLARE maVar LONG VARCHAR;

SELECT
    CASE
        WHEN nom = p_nom AND etat = 'inactif'
            THEN 'bon'
        ELSE  'pasBon'
        END
INTO maVar
FROM test
WHERE nom = p_nom;

IF maVar = 'bon'
            THEN
update DBA.monstre
SET etat = 'actif'
WHERE nom = p_nom;

update lienTypeMonstre
SET typeMonstre = p_type
WHERE nom = p_nom;

update lienSousTypeMonstre
SET sousType = p_sousType
WHERE nomMonstre = p_nom;

update lienSpecimenMonstre
SET specimenMonstre = p_sousType
WHERE nom = p_nom;

    ELSE
INSERT INTO monstre(nom, etat)
VALUES(p_nom, 'actif');

INSERT INTO lienTypeMonstre(nom, typeMonstre)
VALUES(p_nom, p_type,);

INSERT INTO lienSousTypeMonstre(nomMonstre, sousType,)
VALUES(p_nom, p_sousType);

INSERT INTO lienSpecimenMonstre(nom, specimenMonstre, )
VALUES(p_nom, p_espece);

END IF;
SELECT 'Ajout effectué avec succès!' AS status;

--
END;







ALTER PROCEDURE "DBA"."add_monstre"(
    IN p_nom LONG VARCHAR,
    IN p_type LONG VARCHAR,
    IN p_sousType LONG VARCHAR,
    IN p_espece LONG VARCHAR
    )
BEGIN
--

    DECLARE maVar LONG VARCHAR;

SELECT
    CASE
        WHEN nom = p_nom AND etat = 'inactif'
            THEN 'bon'
        ELSE  'pasBon'
        END
INTO maVar
FROM test
WHERE nom = p_nom;

IF maVar = 'bon'
            THEN
update test
SET "type" = p_type ,sousType = p_sousType ,espece = p_espece, etat = 'actif'
WHERE nom = p_nom;
ELSE
                INSERT INTO test(nom, "type", sousType, espece, etat)
                VALUES(p_nom, p_type, p_sousType, p_espece, 'actif');
END IF;
SELECT 'Ajout effectué avec succès!' AS status;

--
END;

ALTER table lienSpecimenMonstre
ADD CONSTRAINT fk_specimen_monstre
FOREIGN KEY (nom)
REFERENCES monstre(nom);


CREATE PROCEDURE "DBA". "prendre_tout"()
BEGIN
--
    SELECT serie.nom , episode.titre ,
           monstre.nom , lienTypeMonstre.typeMonstre ,
           lienSousTypeMonstre.sousType, lienGenreMonstre.genre,
           lienSpecimenMonstre.specimenMonstre
    FROM monstre
        FULL JOIN lienSpecimenMonstre
        FULL JOIN lienGenreMonstre
        FULL JOIN lienSousTypeMonstre
        FULL JOIN lienTypeMonstre
        FULL JOIN lienEpMonstre
        FULL JOIN episode
        FULL JOIN serie
--
END

CREATE SERVICE getTout
TYPE 'JSON'
AUTHORIZATION off
user "DBA"
URL ON
METHODS 'GET'
AS CALL prendre_tout()

