const NBR_JOCKER   = 3     ; // max 52
const COUPER       = true  ; // true | false : sert de réponse au confirm(...)
const NBR_CARTES   = 2     ; // max 40
const ARRET_URGENT = 2000  ; // max 2000

let jeu = [];      // le jeu de cartes
let joueurA = [];  // le jeu du joueur A
let joueurB = [];  // le jeu du joueur B

function afficheJeu(jeu,texte){
   console.log(texte, jeu)   ;
}

// ne pas toucher aux lignes du dessus
// Bonjour Mustafa HASANOV
let paquet = jeu;
function creeJeu(){
   let cartes = ["1","2","3","4","5","6","7","8","9","10","13","11","12"];
    let symb = ["♠️","💘️️️","🔶️","♣️"];
    const joker = "15";
    for (let i = 0; i < symb.length; i++) {
        for (let j = 0; j < cartes.length; j++) {
            paquet.push(cartes[j] + symb[i]);
        }
    }
    for (let k=0 ; k<NBR_JOCKER ; k++) {
        paquet.push(joker);
    }
}
function melangeJeu(){
    let melange = [];
    while(paquet.length != 0) {
        let stock = paquet.splice(Math.floor(Math.random() * (paquet.length)), 1);
        melange.push(stock.pop());
    }
    console.log("Vous avez melangé le jeu de carte");
    paquet = melange;
    jeu = paquet;
    console.log(jeu);
}
function coupeJeu(){
     if (COUPER == true) {
        let recep = Math.floor(Math.random() * paquet.length);
        console.log("Vous coupez le jeu au niveau de la " + recep + " ème cartes");
        for(let i=0 ; i < recep ; i++) {
            paquet.unshift(paquet.pop());
        }
     }
     else {
         console.log("Vous ne coupez pas le jeu");
     }
     console.log(paquet);
}
function distribueJeu(){
    while (paquet.length != 0) {  
        for(let i= 0 ; i<NBR_CARTES ; i++){     
            joueurA.push(paquet.pop());
        }
        for(let j= 0 ; j<NBR_CARTES ; j++){
            joueurB.push(paquet.pop());
        }
    }
    while(joueurA[joueurA.length -1] == undefined) {
        joueurA.pop();
    }
    while(joueurB[joueurB.length -1] == undefined) {
        joueurB.pop();
    }      
}
function affTour(){
    
}
function bataille(){
    let croup = []; // croup = stockage des cartes de bataille
    let affich = [];
    let carteA , carteB;
    console.log(carteA, carteB)
    for(var x=0 ; x < ARRET_URGENT ; x++){
         carteA = parseInt(joueurA[joueurA.length -1])
         carteB = parseInt(joueurB[joueurB.length -1])
         if (carteA == 1){
            carteA = 14
         }
         if (carteB == 1){
            carteB = 14
         }
        if (joueurA.length == 0){
            console.log("joueurB a gagné");
            break;
        }
        else if (joueurB.length == 0){
            console.log("joueurA a gagné");
            break;
        }
        else if (carteA == carteB) {
            croup.push(joueurA.pop(),joueurA.pop(),joueurB.pop(),joueurB.pop());
            affich = [...croup];
        }
        else if (carteA< carteB) {
            joueurB.unshift(joueurA.pop(),joueurB.pop());
            if (croup.length != 0){
                while(croup.length !=0 ){
                    joueurB.unshift(croup.pop());
                }
            }
            if (affich.length != 0){
                console.log("#" + (x + 1) + " B " + "[ '" + affich.join("', '") + "', '" + carteA + "', '" + carteB + "' ] " + joueurA.length + " " + joueurB.length);
                affich.length = 0;
            }
            else {
                console.log("#" + (x + 1) + " B " + "[ '"  + carteA+ "', '" + carteB + "' ] " + joueurA.length + " " + joueurB.length);    
            }
        } 
        else if (carteA> carteB) {
            joueurA.unshift(joueurA.pop(),joueurB.pop());
            if (croup.length != 0){
                while(croup.length !=0 ){
                    joueurA.unshift(croup.pop());
                }
            }
            if (affich.length != 0){
                console.log("#" + (x + 1) + " A " + "[ '" + affich.join("', '") + "', '" + carteA + "', '" + carteB + "' ] " + joueurA.length + " " + joueurB.length);
                affich.length = 0;
            }
            else {
                console.log("#" + (x + 1) + " A " + "[ '" +  carteA + "', '" + carteB + "' ] " + joueurA.length + " " + joueurB.length);    
            }
        }
    }       
}