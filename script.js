// entitetni razredi

class Gost_Ent {
  constructor(ime, email, jeGost) {
    this.ime = ime;
    this.email = email;
    this.jeGost = jeGost;
  }

  ustvariGosta() {
    console.log("Gost ustvarjen:", this.ime);
  }
}

class SmucarskaKarta_Ent {
  constructor(idKarte, vrsta, cena, medij) {
    this.idKarte = idKarte;
    this.vrsta = vrsta;
    this.cena = cena;
    this.medij = medij;
    this.aktivna = false;
    this.veljavna = false;
  }

  ustvariKarto() {
    console.log("Nova karta generirana:", this.idKarte);
  }

  posodobiStatus(aktivna, veljavna) {
    this.aktivna = aktivna;
    this.veljavna = veljavna;
  }
}

// zunanji sistem plačila


class Banka_SIM {
  obdelajTransakcijo() {
    // mala možnost zavrnitve
    let nakljucje = Math.random();
    if (nakljucje > 0.15) {
        return true;
    } else {
        return false;
    }
  }
}

// Kontrolni razred

class Nakup_Ctrl {
  constructor() {
    this.banka = new Banka_SIM();
    this.trenutniGost = null;
    this.karta = null;
    
    //hardcoded testni podatki ob zagonu
    this.zgodovinaKart = [
      new SmucarskaKarta_Ent("SKI-100", "Dnevna", 42, "RFID-TEST1"),
      new SmucarskaKarta_Ent("SKI-101", "Sezonska", 390, "RFID-TEST2")
    ];
  }

  pripraviNakup(vrsta, cena, medij) {
    let id = "SKI-" + Math.floor(Math.random() * 10000);
    this.karta = new SmucarskaKarta_Ent(id, vrsta, cena, medij);
    this.karta.ustvariKarto();
  }

  izvediPlacilo() {
    let uspesno = this.banka.obdelajTransakcijo();
    
    if (uspesno == true) {
      this.karta.posodobiStatus(true, true);
      this.zgodovinaKart.push(this.karta); // Dodamo karto v bazo testnih podatkov
      return true;
    } else {
      this.karta.posodobiStatus(false, false);
      return false;
    }
  }
}

// mejni razredi

class Zicnica_Bnd {
  prikaziStanjeZicnice(stanje) {
    if (stanje == "zaprta" || stanje == "nevarnost") {
      return false;
    }
    return true;
  }

  odpriRampo() {
    return "Rampa je odprta. Vstop dovoljen.";
  }
}

class SpletniVmesnik_Bnd {
  constructor() {
    this.ctrl = new Nakup_Ctrl();
    this.zicnica = new Zicnica_Bnd();
    
    // Predpogoj ob zagonu
    this.ctrl.trenutniGost = new Gost_Ent("Default Uporabnik", "test@test.si", false);
    this.ctrl.trenutniGost.ustvariGosta();
    
    this.prikaziStatus("prijavaStatus", "Predpogoj izpolnjen: Prijavljen je " + this.ctrl.trenutniGost.ime, "ok");
    this.dodajDogodek("Sistem zagnan, hardcoded podatki naloženi.");
  }

  prikaziPonudbo() {
    let select = document.getElementById("vrstaKarte");
    let izbrana = select.options[select.selectedIndex];
    document.getElementById("povzetek").textContent = izbrana.value + " - " + izbrana.dataset.cena + " €";
  }

  prikaziStatus(idHTML, sporocilo, cssRazred) {
    let element = document.getElementById(idHTML);
    element.textContent = sporocilo;
    element.className = "status " + cssRazred;
  }

  dodajDogodek(sporocilo) {
    let seznam = document.getElementById("dnevnik");
    let postavka = document.createElement("li");
    postavka.textContent = sporocilo;
    seznam.prepend(postavka);
  }
}

//povezava z HTML

let vmesnik;

window.onload = function() {
  vmesnik = new SpletniVmesnik_Bnd();
};

function posodobiCeno() {
  vmesnik.prikaziPonudbo();
}

function prijava() {
  let ime = document.getElementById("ime").value;
  let email = document.getElementById("email").value;
  
  if (ime == "" || email == "") {
    vmesnik.prikaziStatus("prijavaStatus", "Manjkajo podatki.", "error");
    return;
  }
  
  vmesnik.ctrl.trenutniGost = new Gost_Ent(ime, email, false);
  vmesnik.prikaziStatus("prijavaStatus", "Prijavljen uporabnik: " + ime, "ok");
  vmesnik.dodajDogodek("Nov uporabnik prijavljen.");
}

function gost() {
  vmesnik.ctrl.trenutniGost = new Gost_Ent("Gost", "", true);
  vmesnik.prikaziStatus("prijavaStatus", "Nadaljuješ kot gost.", "ok");
}

function pripraviNakup() {
  let medij = document.getElementById("medij").value;
  let select = document.getElementById("vrstaKarte");
  let izbrana = select.options[select.selectedIndex];
  
  if (medij == "") {
    vmesnik.prikaziStatus("nakupStatus", "Vnesi RFID medij.", "error");
    return;
  }
  
  vmesnik.ctrl.pripraviNakup(izbrana.value, Number(izbrana.dataset.cena), medij);
  vmesnik.prikaziStatus("nakupStatus", "Nakup pripravljen za karto: " + vmesnik.ctrl.karta.idKarte, "ok");
  vmesnik.dodajDogodek("Nakup pripravljen.");
}

function izvediPlacilo() {
  if (vmesnik.ctrl.karta == null) {
    vmesnik.prikaziStatus("placiloStatus", "Najprej pripravi nakup.", "error");
    return;
  }
  
  let rezultat = vmesnik.ctrl.izvediPlacilo();
  
  if (rezultat == true) {
    vmesnik.prikaziStatus("placiloStatus", "Plačilo sprejeto. Karta veljavna.", "ok");
    vmesnik.dodajDogodek("Banka_SIM: Transakcija uspešna.");
  } else {
    vmesnik.prikaziStatus("placiloStatus", "Zavrnjeno s strani banke.", "error");
    vmesnik.dodajDogodek("Banka_SIM: Transakcija zavrnjena.");
  }
}

function validirajKarto() {
  let stanjeZicnice = document.getElementById("zicnica").value;
  let karta = vmesnik.ctrl.karta;
  
  if (karta == null || karta.veljavna == false) {
    vmesnik.prikaziStatus("validacijaStatus", "Karta ni veljavna.", "error");
    return;
  }
  
  let zicnicaDela = vmesnik.zicnica.prikaziStanjeZicnice(stanjeZicnice);
  
  if (zicnicaDela == false) {
    vmesnik.prikaziStatus("validacijaStatus", "Žičnica ne obratuje ali nevarnost.", "warning");
  } else {
    let sporocilo = vmesnik.zicnica.odpriRampo();
    vmesnik.prikaziStatus("validacijaStatus", sporocilo, "ok");
    vmesnik.dodajDogodek("Smučar spuščen skozi rampo.");
  }
}