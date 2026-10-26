function addCou(id){
    document.getElementById(id).style.backgroundColor = "lightblue"
}
document.addEventListener('mousedown', function(event) {
  if (event.button === 1 || event.button === 0) { // clic molette
    // Vérifie si la cible ou un parent est un <a>
    let element = event.target;
    while (element && element !== document) {
      if (element.tagName === 'A' && element.id) {
        addCou(element.id)
        // Ici tu peux faire ce que tu veux avec ce lien
        break;
      }
      element = element.parentNode;
    }
  }
});

function creeConcours(){
  fetch("concours.json")
  .then(reponse => reponse.json())
  .then(donnees => {
    let tabFinal = [];
    for (let i in donnees) {
        const key2 = Object.keys(donnees[i])[0];
        const valeur = donnees[i][key2];

        if (typeof valeur === "string" && valeur.lastIndexOf("-") >= 33 && valeur !== 'https://www.instant-gaming.com/fr/giveaway/INFOPOINT-ITALIA' && valeur !== "https://www.instant-gaming.com/fr/giveaway/me5rine-lab" && valeur !== "https://www.instant-gaming.com/fr/giveaway/kiasims-be91a") {
            tabFinal.push({
                [key2]: valeur.substring(0, valeur.lastIndexOf("-"))
            });
        } else if (typeof valeur === "string" && valeur.lastIndexOf("#") >= 0) {
          tabFinal.push({
                [key2]: valeur.substring(0, valeur.lastIndexOf("#"))
            });
        } else {
            tabFinal.push(donnees[i]);
        }
    }
    const sansDoublons = tabFinal.filter((obj, index, self) => {
        const valeur = Object.values(obj)[0].toLowerCase(); // prend la 1re valeur
        return index === self.findIndex(o => Object.values(o)[0].toLowerCase() === valeur);
        });
      let key
      let compt = 1
      sansDoublons.sort((a, b) => {
        const keyA = Object.keys(a)[0];
        const keyB = Object.keys(b)[0];
        return keyA.localeCompare(keyB);
      });
        for(let i in sansDoublons){
            compt ++
            key = Object.keys(sansDoublons[i])
            document.getElementById("resultat").innerHTML +=
                `<a href="${sansDoublons[i][key[0]]}?igr=LeRoiJeanKins"  target="_blank" id="${compt}" class="giveaway" >
                     <img src=${key[0]} width="50px" loading="lazy" alt="Giveway button number ${compt}"/>
                 </a>`
        }
        document.getElementById("titre").innerHTML = "There are " +sansDoublons.length+ " giveaways"
      }
  );
}
function buttonChangePage(idDuBout){
    let mesSec = document.querySelectorAll("section")
    mesSec.forEach(e => {
        if(e.id !== idDuBout){
            e.style.display = "none";
        }
        else{
            e.style.display = "contents";
        }
    })
}

