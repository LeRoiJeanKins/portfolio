//Script pour gérer le changement de tab
"use strict";
/* ******* CONSTANTES ET VARIABLES GLOBALES ******** */

// mémorise la tab actuelle : initialisée à "tabAffichageResume" par défaut
let idTabActuel = "sommaire";

/* ******* main ***************** */
// Une fois la page chargée, initialise les tabs
document.addEventListener("DOMContentLoaded", initTabs);

/**
 * Sert à initialiser l'onglet par défaut.
 * Se base sur la variable globale "idTabActuel", dont la valeur initiale sert de valeur par défaut
 * Pas de paramètres.
 * Pas de retour.
 */
function initTabs() { console.log('in initTabs')
    _gebi('aff_'+idTabActuel).style.display = "block";
    _gebi(idTabActuel).classList.add("active");
}
/**
 * Entraine un changement d'onglet
 * Le contenu de l'onglet précédent sera caché et l'onglet précédent ne sera plus actif.
 * Le contenu du nouvel onglet sera affiché et le nouvel onglet sera actif (pour le mettre en évidence en couleur).
 * La variabe globale "idTabActuel" est utilisée pour savoir quel onglet ne plus afficher, puis elles est mise à jour avec le nouveau.
 * L'onglet actuel est reçu en paramètre et son id est utilisé.
 * La constante LIENS_TAB_SECTION est utilisée pour retrouver les id des contenu des onglets, sur base des id des onglets.
 * 
 * Pas de retour
 * @param {HTMLElement} tabButton - le bouton qui a enclenché le changement de tab
 */
function changerTab(tabButton) {  console.log('in changerTab ',tabButton);
    // cache le tab actuel
    _gebi('aff_'+idTabActuel).style.display = "none";
    _gebi(idTabActuel).classList.remove("active");
    // affiche le tab demandé
    _gebi('aff_'+tabButton.id).style.display = "block";
    _gebi(tabButton.id).classList.add("active");
    // mémorise le nouveau tab actuel
    idTabActuel = tabButton.id;
}