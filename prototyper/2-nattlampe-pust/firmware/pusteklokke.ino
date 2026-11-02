// Pusteklokke: rav-lampe med rolig pust-rytme. Ingen skjerm, ingen lyd.
// Maskinvare: Arduino Nano, MOSFET på LED_PIN, knapp mot GND på BTN_PIN (INPUT_PULLUP).

const uint8_t LED_PIN = 9;          // PWM-pinne mot MOSFET -> rav-LED
const uint8_t BTN_PIN = 2;          // knapp til GND

const unsigned long HALF_CYCLE_MS = 5000;   // 5 s inn, 5 s ut = 6 pust/min
const unsigned long CYCLE_MS      = 2 * HALF_CYCLE_MS;
const unsigned long AUTO_OFF_MS   = 15UL * 60UL * 1000UL;  // 15 min
const unsigned long LONG_PRESS_MS = 1500;
const unsigned long DEBOUNCE_MS   = 40;

uint8_t brightSteps[3] = {15, 40, 80};   // 0..255, lav. Mål med luxmeter.
uint8_t stepIndex = 1;

bool running = false;
unsigned long startT = 0;

bool lastBtn = HIGH;
unsigned long pressStart = 0;
unsigned long lastChange = 0;

float easeInOut(float x) {          // x i [0, 1], myk start og slutt
  return 0.5f - 0.5f * cos(PI * x);
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  analogWrite(LED_PIN, 0);
  Serial.begin(9600);
}

void loop() {
  unsigned long now = millis();
  bool btn = digitalRead(BTN_PIN);

  // Debounce: endring må vare DEBOUNCE_MS før den telles
  if (btn != lastBtn && now - lastChange > DEBOUNCE_MS) {
    lastChange = now;
    if (lastBtn == HIGH && btn == LOW) {
      pressStart = now;                       // trykk startet
    } else if (lastBtn == LOW && btn == HIGH) {
      unsigned long held = now - pressStart;  // slipp
      if (held >= LONG_PRESS_MS) {
        stepIndex = (stepIndex + 1) % 3;      // langt trykk: lysstyrke
        Serial.print("lysstyrke-steg: "); Serial.println(stepIndex);
      } else {
        running = !running;                   // kort trykk: av/på
        startT = now;
        Serial.println(running ? "start" : "stopp");
      }
    }
    lastBtn = btn;
  }

  if (running) {
    unsigned long t = now - startT;
    if (t >= AUTO_OFF_MS) {
      running = false;
      Serial.println("auto-av");
    } else {
      unsigned long phase = t % CYCLE_MS;
      float x;
      if (phase < HALF_CYCLE_MS) {
        x = phase / (float)HALF_CYCLE_MS;                 // inn
      } else {
        x = 1.0f - (phase - HALF_CYCLE_MS) / (float)HALF_CYCLE_MS;  // ut
      }
      analogWrite(LED_PIN, (uint8_t)(brightSteps[stepIndex] * easeInOut(x)));
    }
  }

  if (!running) analogWrite(LED_PIN, 0);
  delay(10);
}
