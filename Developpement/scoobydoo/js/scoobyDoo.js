/*********************************** scoobyDoo.js ********
* Nom prénom 1 : .......................
* Nom prénom 2 : .......................
* Groupe       : 1T..
*
*********************************************************/
window.addEventListener('DOMContentLoaded',function(){
	//document.querySelector('.centre h1').innerHTML='Scoobydoo bydoooooooo';
});

let titreDeLEpisode ;

function afficheDonneeSerie(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET',"getSerie" , true);
    xhr.onload = afficheSerie;
    xhr.send();
}

    afficheDonneeSerie();

function afficheSerie() {
    var donnee = JSON.parse(this.responseText);
    for(let i in donnee){
        document.getElementById("listeSe").innerHTML += "<option>" +donnee[i].nom+ "</option>";
    }
    afficherDonneeEpSerie();
}

function afficherDonneeEpSerie(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET',"getEpSerie" , true);
    xhr.onload = afficherEpSerie;
    xhr.send();
}

function afficherEpSerie(){
    let donneeSerie = JSON.parse(this.responseText);
    let serie = document.getElementById("listeSe").value;
    document.getElementById("listEp").innerHTML = ""
    let tab = []
    for(let i in donneeSerie){
        if(donneeSerie[i].nom === serie) {
            tab.push(donneeSerie[i].titre)
        }
    }
    for(let i in tab){
        document.getElementById("listEp").innerHTML += "<a onclick='chargerInfoEp(this)'>"+tab[i]+"</a><br>"
    }
}

function chargerInfoEp(titreEp){
    titreDeLEpisode  = titreEp.innerText;
    let xhr = new XMLHttpRequest();
    xhr.open('GET',"getInfoEp" , true);
    xhr.onload = function(){
        let monstres = [];
        let nbPersos = [];
        let donnees = JSON.parse(this.responseText);
        document.getElementById("bulleTp10").innerHTML = "";
        for(let i in donnees){
            if(donnees[i].titre === titreEp.innerText&& donnees[i].etat === "actif"){
                monstres.push(donnees[i].nomMonstre);
            }
            if(donnees[i].titre === titreEp.innerText){
                nbPersos = [];
                if(donnees[i].voix_velma != null){nbPersos.push(donnees[i].voix_velma)}
                if(donnees[i].voix_fred != null){nbPersos.push(donnees[i].voix_fred)}
                if(donnees[i].voix_daphnee != null){nbPersos.push(donnees[i].voix_daphnee)}
                if(donnees[i].voix_shaggy != null){nbPersos.push(donnees[i].voix_shaggy)}
                if(donnees[i].voix_scooby != null){nbPersos.push(donnees[i].voix_scooby)}
            }
        }

        document.getElementById("bulleTp10").innerHTML += '<a onClick="afficherPersos(`' + titreEp.innerText +'`)"> persos : '+nbPersos.length+ '</a> <br>';

        document.getElementById("bulleTp10").innerHTML += '<a onClick="afficherMonstre(`' + titreEp.innerText +'`)"> monstres : '+ monstres.length + '</a>';

            quelEstEpisode();
        }
    xhr.send();
}

function afficherPersos(titreEp){
    let xhr = new XMLHttpRequest();
    xhr.open('GET',"getInfoEp" , true);
    xhr.onload = function(){
        let donnees = JSON.parse(this.responseText);
        document.getElementById("bulleTp10").innerHTML = "";
        for(let i in donnees){
            if (donnees[i].titre === titreEp && donnees[i].length === undefined ){
                document.getElementById("bulleTp10").innerHTML = ""
                if(donnees[i].voix_velma != null){document.getElementById("bulleTp10").innerHTML += "velma : "+ donnees[i].voix_velma +"<br>"}
                if(donnees[i].voix_fred != null){document.getElementById("bulleTp10").innerHTML += "fred : "+ donnees[i].voix_fred +"<br>"}
                if(donnees[i].voix_daphnee != null){document.getElementById("bulleTp10").innerHTML += "daphnee : "+ donnees[i].voix_daphnee +"<br>"}
                if(donnees[i].voix_shaggy != null){document.getElementById("bulleTp10").innerHTML += "shaggy : "+ donnees[i].voix_shaggy +"<br>"}
                if(donnees[i].voix_scooby != null){document.getElementById("bulleTp10").innerHTML += "scooby : "+ donnees[i].voix_scooby}
            }
        }
    };
    xhr.send();
}

function afficherMonstre(titreEp){
    let xhr = new XMLHttpRequest();
    xhr.open('GET',"getInfoEp" , true);
    xhr.onload = function(){
        let monstres = [];
        let donnees = JSON.parse(this.responseText);
        document.getElementById("bulleTp10").innerHTML = "";
        for(let i in donnees){
            if (donnees[i].titre === titreEp && donnees[i].etat === "actif"){
                monstres.push(donnees[i].nomMonstre);
            }
        }
        for(let e in monstres){
            document.getElementById("bulleTp10").innerHTML += monstres[e] +"<br>"
        }
    };
    xhr.send();
}

function gidV(x){
    return document.getElementById(x).value;
}
function quelEstEpisode(){
        document.getElementById('epi?').innerText = "épisode actuel : "+ titreDeLEpisode;

}
function envoieInfo() {
    let monstre = {
        nom: gidV("formTxt0"),
        type: gidV("formTxt1"),
        sousType: gidV("formTxt2"),
        espece: gidV("formTxt3")
    };
    let xhr = new XMLHttpRequest();
    xhr.open('POST', "addMonstre?nom="+monstre.nom+"&type="+monstre.type+"&sousType="+monstre.sousType+"&espece="+monstre.espece + "&epi="+titreDeLEpisode, true)
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.onload = function () {
        console.log(xhr.responseText);
        if (xhr.status === 200 && xhr.responseText === "Ajout effectué avec succès!") {
            document.getElementById("msg").innerText = "Succès :" + xhr.responseText;
        } else {
            document.getElementById("msg").innerText = "Erreur : le monstre n'a pas pu etre ajouté";
        }
    };
    xhr.send();
    return false;
}

function suppInfo(){
    let vari = gidV("formTxtSupp");
    let xhr = new XMLHttpRequest();
    xhr.open('POST', "suppMonstre?nom="+vari, true)
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText === "Suppression effectué avec succès!") {
            document.getElementById("msg").innerText = "Succès :"+xhr.responseText;
        } else {
            document.getElementById("msg").innerText = "Erreur : le monstre n'a pas pu etre supprimer";
        }
    };
    xhr.send();
    return false;
}

function enleveDupli(contenant){     // necessite un tableau

    for(let i=0 ; i < contenant.length ; i++){
        for(let j= i + 1 ; j < contenant.length ; j++){
            if(contenant[i] === contenant[j]){
                contenant.splice(j,1);
                j--;
            }
        }
    }
    return contenant;
}

function series(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET',"getTout" , true)
    xhr.onload = function(){
        let donnee = JSON.parse(xhr.responseText)
        let tabSe = [];
        document.getElementById("bulleTp12").innerHTML = "";
        for(let i in donnee){
            if(donnee[i].serieNom !== null){
                tabSe.push(donnee[i].serieNom)
            }
        }

        enleveDupli(tabSe);

        document.getElementById("bulleTp12").innerHTML += '<label for="boutSerie">nombres de séries : '+tabSe.length+  '</label><button type="button" id="boutSerie" onClick="affSerie()"> list </button>';
    }
    xhr.send()
    return false;

}

function affSerie(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET',"getTout" , true)
    xhr.onload = function(){
        document.getElementById("textEnv").innerHTML = ""
        let donnee = JSON.parse(xhr.responseText)
        let tabSe = [];
        for(let i in donnee){
            if(donnee[i].serieNom !== null){
                tabSe.push(donnee[i].serieNom)
            }

        }
        enleveDupli(tabSe);
        document.getElementById("textEnv").innerHTML += "<hr>"


        for(let i in tabSe){
            let tabEp = [];
            for(let j in donnee){
                if(donnee[j].titre !== null && donnee[j].serieNom === tabSe[i]){
                    tabEp.push(donnee[j].titre)
                }
            }

            enleveDupli(tabEp);

            document.getElementById("textEnv").innerHTML +=  '<label for="bouttonEpi">'+tabSe[i]+'</label><button type="button" id="bouttonEpi" onClick="affEpisodes(`'+tabEp+'`)">'+ tabEp.length +'</button> <br>' ;
        }



    }
    xhr.send()
    return false;
}

function affEpisodes(str){
    document.getElementById("textEnv").innerHTML = ""
    document.getElementById("textEnv").innerHTML += "<hr>"
    let tab = str.split(",");
    for(let i in tab){
        document.getElementById("textEnv").innerHTML += tab[i] + '<br>'
    }
}
function nonNull(x){
    return x !== null;
}
function acteur(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET',"getInfoEp" , true)
    xhr.onload = function(){
        let donnees = JSON.parse(xhr.responseText);
        let fred = [];
        let daphn = [];
        let scooby = [];
        let velma = [];
        let shaggy = [];
        let ep = [];
        for(let i in donnees){
            if(ep.indexOf(donnees[i].titre) === -1){
                console.log(donnees[i].voix_fred);
                fred.push(donnees[i].voix_fred);
                scooby.push(donnees[i].voix_scooby);
                daphn.push(donnees[i].voix_daphnee);
                velma.push(donnees[i].voix_velma);
                shaggy.push(donnees[i].voix_shaggy);
            }
            ep.push(donnees[i].titre);
        }

    }
    xhr.send()
    return false;
}
