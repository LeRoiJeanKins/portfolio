var tab = []
function recuperer(boutton) {
    document.getElementById("champ").innerText += document.getElementById(boutton).innerText // recupere la valeure du boutton sur lequel l'ut a appuyer et l affiche
    tab.push(document.getElementById(boutton).innerText);
    console.log(tab);
}
function supprimer() {
    tab.pop();
    document.getElementById("champ").innerText = tab.join("");
}
function reinitialiser() {
    tab.length = 0;
    document.getElementById("champ").innerText = tab;
}
function calculer() {
        try {
            var reponse = eval(tab.join(""));
        }
        catch (e) {
            document.getElementById("champ").innerText = "erreur";
        }
        if (reponse == Infinity || reponse == undefined) {
            document.getElementById("champ").innerText = "erreur";
        }
        else {
            document.getElementById("champ").innerText = reponse;
        }
        tab.length = 0;
        tab.push(document.getElementById("champ").innerText);
}





