// «Stille vakt» SV-1 – kantmodul for sengeramme + sensorstrimmel under madrass.
// Ingen kamera, ingen mikrofon. Kantmodulen har batteri, radio, prosessor og rav gulvlys som tennes
// når beboeren setter seg opp. Strimmelen måler trykk/bevegelse (BCG-prinsipp, som Nemuri SCAN).
// Variant SV-1R har i tillegg en 60 GHz radar bak et radarvindu (RADAR = true).
// Verdier fra beste.json (fokus «livskvalitet_per_krone»), avrundet. Alle mål i mm.
//   DEL = "alt" | "hus" | "lokk" | "brakett" | "lysleder" | "strimmel"
DEL   = "alt";
RADAR = false;          // SV-1R

// --- fra beste.json ---
BATTERIER = 4;          // 18650-celler (12,2 Wh hver) -> 260 dager per lading [modell]
LYS_LUX   = 10;         // gulvbelysning, rav ≤ 2200 K, 0,5 m² ved siden av sengen
// --- avledet ---
LED_LM     = 6;                                      // lm per LED ved lav strøm [antakelse]
N_LED      = max(2, ceil(LYS_LUX * 0.5 / 0.5 / LED_LM));   // E·A / optisk virkningsgrad / lm per LED
CELLE_D    = 18.6;  CELLE_L = 65.5;
RADER      = BATTERIER > 2 ? 2 : 1;                 // 2×2 stabel ved 3–4 celler
KOL        = ceil(BATTERIER / RADER);
// Radarvindu: halv bølgelengde i PC ved 60,5 GHz, εr = 2,75 -> λ0 / (2√εr) [fysikk]
RADOME_T   = 299.792458 / 60.5 / (2 * sqrt(2.75));  // = 1,49 mm

// --- hus ---
L = 176;  B = 46;  H = 58;  R = 6;  V = 2.5;          // lengde (langs sengen), dybde, høyde, kantradius, vegg
SKINNE_D = 30;  SKINNE_H = 40;  SKINNE_Z = 64;        // typisk sengeramme (spenn 15–30 mm dyp) [antakelse]
LYS_X0 = CELLE_L + 22;                                 // lysleder til høyre for batteriluken (ingen kollisjon)
assert(LYS_X0 + N_LED * 25 <= L - 8, "for mange LED-er for huslengden");
$fn = 48;

module avrundet(l, b, h, r) {
    hull() for (x = [r, l - r], y = [r, b - r]) {
        translate([x, y, r]) sphere(r);
        translate([x, y, h - r]) sphere(r);
    }
}

module hus() {
    difference() {
        avrundet(L, B, H, R);
        translate([V, V, V]) avrundet(L - 2 * V, B - 2 * V, H - 2 * V, R - V);
        // batteriluke i bunnen (verktøy-skruer, beboer kan ikke åpne)
        translate([8, 6, -1]) cube([CELLE_L + 10, B - 12, V + 2]);
        // spor for lysleder i bunnen, ytterkant
        translate([LYS_X0, B - 14, -1]) cube([N_LED * 25, 9, V + 2]);
        // statuslys (grønt, svakt) på toppen – bare synlig for pleier som står
        translate([L - 20, B / 2, H - V - 1]) cylinder(d = 3, h = V + 2);
        // radarvindu på utsiden, skrått nedover mot sengekant og gulv
        if (RADAR) translate([L - 52, B - V - 0.5, 14]) cube([30, V + 1, 26]);
        // ventilasjon/trykkutjevning (IPX4: labyrint, ikke gjennomgående hull) – markeres med spor
        for (i = [0:3]) translate([96 + i * 8, B - 0.6, 40]) cube([4, 1, 10]);
    }
    if (RADAR) translate([L - 52, B - V, 14]) color("SkyBlue") cube([30, RADOME_T, 26]);
    // skrueposter for luken
    for (x = [12, CELLE_L + 14]) translate([x, B / 2, V]) difference() {
        cylinder(d = 7, h = 8); cylinder(d = 2.5, h = 9);
    }
    // PCB-skinner
    for (y = [V, B - V - 2]) translate([CELLE_L + 24, y, 10]) cube([70, 2, 3]);
}

module lokk() {
    translate([8.3, 6.3, 0]) difference() {
        cube([CELLE_L + 9.4, B - 12.6, V]);
        for (x = [3.7, CELLE_L + 5.7]) translate([x, (B - 12.6) / 2, -1]) cylinder(d = 3, h = V + 2);
    }
}

module lysleder() {
    // Prisme: LED-ene lyser ned, utgangsflaten er skrå 20° mot gulvet utenfor sengen
    translate([LYS_X0 + 0.3, B - 13.7, 0])
        color("Orange", 0.8) hull() {
            translate([0, 0, 2]) cube([N_LED * 25 - 0.6, 8.4, 4]);
            translate([0, 2, -3]) cube([N_LED * 25 - 0.6, 8.4, 0.1]);
        }
}

module brakett() {
    // Henger over sengerammen; tommelskrue (M6, TPE-pute) klemmer mot rammen fra baksiden
    t = 4;
    color("DimGray") {
        translate([20, -t, 18]) cube([L - 40, t, SKINNE_Z + SKINNE_H - 18 + t]);             // frontplate
        translate([20, -t - SKINNE_D - 2 - t, SKINNE_Z + SKINNE_H])
            cube([L - 40, SKINNE_D + 2 + 2 * t, t]);                                          // over rammen
        translate([20, -t - SKINNE_D - 2 - t, SKINNE_Z + 8]) cube([L - 40, t, SKINNE_H - 8 + t]);  // bakleppe
        for (x = [40, L - 40]) translate([x, -t - SKINNE_D - 2 - t - 12, SKINNE_Z + 22])
            rotate([-90, 0, 0]) cylinder(d = 14, h = 10);                                     // tommelskruehode
        for (x = [40, L - 40]) translate([x, -t - SKINNE_D - 4, SKINNE_Z + 22])
            rotate([-90, 0, 0]) cylinder(d = 6, h = 10);                                      // skruestamme
    }
}

module strimmel() {
    // 700 × 60 × 4 mm, 4 sensorsoner (hofte/skulder), legges tvers under madrassen, kabel langs rammen
    color("LightSteelBlue") hull() for (x = [30, 670]) translate([x, 30, 0]) cylinder(r = 30, h = 4);
    for (i = [0:3]) color("SteelBlue") translate([110 + i * 160, 30, 4]) cylinder(r = 18, h = 0.6);
}

module celler() {
    for (k = [0:KOL - 1], r = [0:RADER - 1])
        if (k * RADER + r < BATTERIER)
            translate([10, V + 1.5 + k * (CELLE_D + 1) + CELLE_D / 2, V + 1 + r * (CELLE_D + 1) + CELLE_D / 2])
                rotate([0, 90, 0]) color("Green", 0.6) cylinder(d = CELLE_D, h = CELLE_L);
}

module montert() {
    color("#e9e4da") hus(); translate([0, 0, -0.01]) color("Gainsboro") lokk(); lysleder(); brakett(); celler();
    %translate([-60, -4 - SKINNE_D - 2, SKINNE_Z]) cube([L + 120, SKINNE_D, SKINNE_H]);     // sengeramme (illustrasjon)
}
// "alt": sett fra rommet (utsiden av sengen). "undersiden": snudd, viser batteriluke og lysleder.
if (DEL == "alt") rotate([0, 0, 180]) translate([-L / 2, -B / 2, 0]) montert();
if (DEL == "undersiden") rotate([180, 0, 180]) translate([-L / 2, -B / 2, 0]) montert();
if (DEL == "hus") color("#e9e4da") hus();
if (DEL == "lokk") lokk();
if (DEL == "brakett") brakett();
if (DEL == "lysleder") lysleder();
if (DEL == "strimmel") strimmel();
