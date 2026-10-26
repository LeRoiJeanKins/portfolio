import serial
import keyboard
import time
from flask import Flask, request
from flask_cors import CORS
import threading

# Configuration
PORT_SERIE = 'COM3'
BAUDRATE = 115200


dernier_pv_recu = 4

# 1. Connexion au Pico
try:
    pico = serial.Serial(PORT_SERIE, BAUDRATE, timeout=0.1)
    print(f"Connexion réussie sur {PORT_SERIE} !")
except:
    print("Erreur de port COM. Ferme Thonny !")
    exit()

# 2. Création du serveur pour recevoir le score du JS
app = Flask(__name__)
CORS(app)

@app.route('/score')
def update_score():
    val = request.args.get('val')
    if val:
        # On envoie "S:15" par exemple au Pico
        pico.write(f"S:{val}\n".encode('utf-8'))
        print(f"Score envoyé au Pico : {val}")
    return "OK"

@app.route('/vie')
def update_vie():
    vie = request.args.get('vie')
    if vie:
        pico.write(f"V:{vie}\n".encode('utf-8'))
        print(f"Vie envoyé au Pico : {vie}")
    return "OK"

@app.route('/get_start_pv')
def get_start_pv():
    # Le JS appellera cette route pour savoir combien de PV il doit mettre
    return {"pv": dernier_pv_recu}

@app.route('/menu')
def set_menu_mode():
    print("Retour au menu : le Pico reprend le contrôle des LEDs")
    pico.write(b"M:menu\n") # On envoie "M" pour Menu
    return "OK"

# Lancement du serveur dans un thread séparé
threading.Thread(target=lambda: app.run(port=5000, debug=False, use_reloader=False), daemon=True).start()

# 3. Boucle principale (Lecture manette)
try:
    while True:
        if pico.in_waiting > 0:
            message = pico.readline().decode('utf-8').strip()
            if message.startswith("B:"):
                touche = message[2:]
                keyboard.press(touche)
                # Optionnel : relâcher après un court délai ou gérer via "R:"
                time.sleep(0.05)
                keyboard.release(touche)

            elif message.startswith("PV_START:"):
                dernier_pv_recu = int(message[9:])
                print(f"PV de départ réglés sur : {dernier_pv_recu}")

        time.sleep(0.01)

except KeyboardInterrupt:
    print("\nArrêt.")
finally:
    pico.close()