// Drikkeunderlag: teller slurker med vektcelle og påminner med mykt lys.
// Maskinvare: Arduino Nano, HX711 (DT, SCK), LED-ring på PWM-pin.
// Bibliotek: HX711 (bogde). Kalibrer SCALE_FACTOR med kjent vekt.
#include <HX711.h>

const uint8_t HX_DT_PIN  = 3;
const uint8_t HX_SCK_PIN = 4;
const uint8_t LED_PIN    = 9;

const float SCALE_FACTOR = 420.0;   // [verifiser] kalibrer med kjent vekt
const float CUP_MIN_G    = 80.0;    // under dette: ingen kopp
const float SIP_MIN_G    = 5.0;     // minst så mye vekt-reduksjon regnes som en slurk
const float BIG_CHANGE_G = 50.0;    // større endringer er flytting, ikke drikking
const float SIP_MAX_G    = 400.0;   // grense for en enkelt hendelse (ved retur av kopp)

const unsigned long SAMPLE_MS   = 2000;
const unsigned long REMIND_MS   = 120UL * 60UL * 1000UL;  // 2 timer uten væske

HX711 scale;

bool cupOn = false;
float baseline = 0;        // stabil vekt med kopp
float lastCupW = 0;        // siste vekt før kopp ble tatt bort
float totalMl  = 0;        // væske registrert siden oppstart
unsigned long lastDrinkMs = 0;
unsigned long lastSampleMs = 0;

// Median av 5 målinger, for å dempe støy
float readStable() {
  float v[5];
  for (int i = 0; i < 5; i++) v[i] = scale.get_units(1);
  // enkel sortering
  for (int i = 0; i < 4; i++)
    for (int j = i + 1; j < 5; j++)
      if (v[j] < v[i]) { float t = v[i]; v[i] = v[j]; v[j] = t; }
  return v[2];
}

void registerSip(float ml) {
  totalMl += ml;
  lastDrinkMs = millis();
  Serial.print("slurk: "); Serial.print(ml, 1);
  Serial.print(" ml, totalt: "); Serial.println(totalMl, 1);
}

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  analogWrite(LED_PIN, 0);
  scale.begin(HX_DT_PIN, HX_SCK_PIN);
  scale.set_scale(SCALE_FACTOR);
  scale.tare();
  lastDrinkMs = millis();
}

void loop() {
  unsigned long now = millis();

  if (now - lastSampleMs >= SAMPLE_MS) {
    lastSampleMs = now;
    float w = readStable();

    if (w < CUP_MIN_G) {
      // Koppen er borte
      if (cupOn) {
        cupOn = false;
        lastCupW = baseline;   // husk vekten for når den settes tilbake
        Serial.println("kopp fjernet");
      }
    } else {
      if (!cupOn) {
        // Kopp satt tilbake. Sammenlign med forrige vekt.
        float diff = lastCupW - w;
        if (lastCupW > 0 && diff >= SIP_MIN_G && diff <= SIP_MAX_G) {
          registerSip(diff);
        }
        cupOn = true;
        baseline = w;
      } else {
        float change = w - baseline;
        if (fabs(change) > BIG_CHANGE_G) {
          baseline = w;                       // flytting, ikke drikking
        } else if (change <= -SIP_MIN_G) {
          registerSip(-change);               // vekten har gått ned: slurk
          baseline = w;
        } else {
          // Liten drift: følg baseline sakte
          baseline = 0.95 * baseline + 0.05 * w;
        }
      }
    }
  }

  // Påminnelse: mykt puls-lys når det har gått for lenge
  if (now - lastDrinkMs > REMIND_MS) {
    float phase = (now % 6000UL) / 6000.0f;          // 6 s puls
    float x = 0.5f - 0.5f * cos(2.0f * PI * phase);  // myk sinus
    analogWrite(LED_PIN, (uint8_t)(60.0f * x));
  } else {
    analogWrite(LED_PIN, 0);
  }

  delay(20);
}
