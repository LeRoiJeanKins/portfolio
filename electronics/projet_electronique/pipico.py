from machine import Pin, SPI, ADC, Timer
import sys
import select
import time

# ==========================================
# CONFIGURATION DES COMPOSANTS
# ==========================================
potentiometre = ADC(Pin(28))
leds = [Pin(0, Pin.OUT), Pin(1, Pin.OUT), Pin(2, Pin.OUT), Pin(3, Pin.OUT)]
trans_dizaine = Pin(5, Pin.OUT)
trans_unite = Pin(4, Pin.OUT)
dec_A, dec_B, dec_C, dec_D = Pin(9, Pin.OUT), Pin(8, Pin.OUT), Pin(7, Pin.OUT), Pin(6, Pin.OUT)

score_actuel = 0
pv_actuels = 0
pv_depart_prec = -1
digit_actif = 0
# --- NOUVEAU : Variable pour savoir si on est en jeu ---
mode_jeu = False 

# ==========================================
# GESTION DE L'AFFICHAGE (Multiplexage)
# ==========================================
def rafraichir_affichage(timer):
    global digit_actif
    trans_dizaine.value(0)
    trans_unite.value(0)
    if digit_actif == 0:
        chiffre = (score_actuel // 10) % 10
        trans_actuel = trans_dizaine
        digit_actif = 1
    else:
        chiffre = score_actuel % 10
        trans_actuel = trans_unite
        digit_actif = 0
    dec_A.value(chiffre & 0b0001)
    dec_B.value((chiffre & 0b0010) >> 1)
    dec_C.value((chiffre & 0b0100) >> 2)
    dec_D.value((chiffre & 0b1000) >> 3)
    trans_actuel.value(1)

tim = Timer()
tim.init(freq=100, mode=Timer.PERIODIC, callback=rafraichir_affichage)

# ==========================================
# CONFIGURATION SPI & BOUTONS
# ==========================================
spi = SPI(1, baudrate=1000000, polarity=0, phase=0, sck=Pin(10), mosi=Pin(11), miso=Pin(12))
cs = Pin(13, Pin.OUT)
cs.value(1)

btn_pins = [18, 19, 20, 21]
boutons = [Pin(p, Pin.IN, Pin.PULL_UP) for p in btn_pins]
etats_boutons = [1, 1, 1, 1]
noms_touches = ["B:x", "B:y", "B:enter", "B:b"]

def lire_joystick():
    cs.value(0)
    donnees = spi.read(3, 0x00)
    cs.value(1)
    return donnees

# ==========================================
# BOUCLE PRINCIPALE
# ==========================================
while True:
    # 1. ÉCOUTE DU PC
    if select.select([sys.stdin], [], [], 0)[0]:
        ligne = sys.stdin.readline().strip()
        
        # Commande de changement de mode
        if ligne.startswith("M:"):
            mode_jeu = False
            score_actuel = 0
            pv_actuels = 0
            print("Mode Menu Activé")
            
        elif ligne.startswith("S:"):
            mode_jeu = True
            try: score_actuel = int(ligne[2:])
            except: pass
            
        elif ligne.startswith("V:"):
            mode_jeu = True
            try: pv_actuels = int(ligne[2:])
            except: pass

    # 2. LECTURE POTENTIOMÈTRE (Toujours actif pour envoyer au PC)
    val_pot = potentiometre.read_u16()
    # On calcule pv_depart (1 à 4 pour tes 4 LEDs)
    pv_depart = 1 + int((val_pot / 65535) * 3) 
    
    if pv_depart != pv_depart_prec:
        print(f"PV_START:{pv_depart}")
        pv_depart_prec = pv_depart
        # Si on change le potard alors qu'on n'est pas en jeu, on reset le mode_jeu
        # (Pratique pour revenir au réglage des LEDs après une partie)
        if score_actuel == 0: mode_jeu = False

    # 3. MISE À JOUR DES LEDS (Logique conditionnelle)
    # Si on est en jeu, on affiche les PV envoyés par le PC
    # Sinon, on affiche le réglage du potentiomètre
    nombre_a_afficher = pv_actuels if mode_jeu else pv_depart
    
    for i in range(4):
        leds[i].value(1 if i < nombre_a_afficher else 0)

    # 4. JOYSTICK
    val_x = lire_joystick()[0]
    if 100 <= val_x <= 165: print("B:d")
    elif val_x >= 165: print("B:q")

    # 5. BOUTONS
    for i in range(4):
        lecture = boutons[i].value()
        if lecture == 0 and etats_boutons[i] == 1:
            print(noms_touches[i])
            if noms_touches[i] == "B:y": # Si on appuie sur Y (Arreter jeu)
                mode_jeu = False
                score_actuel = 0
        etats_boutons[i] = lecture

    time.sleep(0.08)
