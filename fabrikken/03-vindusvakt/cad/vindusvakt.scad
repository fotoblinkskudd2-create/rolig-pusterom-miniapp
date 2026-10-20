// VINDUSVAKT — ramme v0.1. Mål i mm. X = bredde, Y = dybde (fronten mot rommet ved y=0), Z = høyde.
// Rammen står i vinduskarmen med skjermen mot rommet og kameraet bak, mot ruta.
// Deler: "samlet", "bak", "eksplodert", "front", "bakdeksel", "fot", "linsedeksel", "knapp"
del = "samlet";
maske = false;
linse_aapen = true;
$fn = 64;

PANEL = [170.2, 111.2, 1.2];         // 7,5" GDEY075T7 / Waveshare 7.5 V2-klasse
AKTIV = [163.2, 97.92];
AKTIV_OFF = [3.5, 9.6];              // fra panelets nedre venstre hjørne (FPC-kant nederst)
KANT = 12;                           // ramme sider/topp
HAKE = 26;                           // ramme nederst
B = PANEL[0] + 2 * KANT;             // 194,2
H = PANEL[1] + KANT + HAKE;          // 149,2
D = 18;                              // dybde på rammen
R = 5;
VEGG = 2.2;
TILT = 10;                           // grader bakover
LINSE = [B / 2, H - 18];             // kamera bak: x, z
KNAPP = [B - 22, 0];                 // knapp på toppen: x

module boks(b, d, h, r) {
  hull() for (x = [r, b - r], z = [r, h - r]) translate([x, 0, z]) rotate([-90, 0, 0]) cylinder(r = r, h = d);
}

module front() {
  difference() {
    boks(B, D, H, R);
    // hul innside, åpen bak
    translate([VEGG, VEGG, VEGG]) boks(B - 2 * VEGG, D, H - 2 * VEGG, R - VEGG);
    // vindu for aktivt felt
    translate([KANT + AKTIV_OFF[0] - 0.5, -1, HAKE + AKTIV_OFF[1] - 0.5]) cube([AKTIV[0] + 1, VEGG + 2, AKTIV[1] + 1]);
    // fas rundt vinduet
    translate([KANT + AKTIV_OFF[0] - 1.5, -0.01, HAKE + AKTIV_OFF[1] - 1.5]) cube([AKTIV[0] + 3, 0.8, AKTIV[1] + 3]);
    // navn i haka
    translate([B / 2, -0.01 + 0.6, HAKE / 2 - 3]) rotate([90, 0, 0]) linear_extrude(1) text("VINDUSVAKT", size = 5.6, font = "Inter:style=Bold", spacing = 1.3, halign = "center");
    // knapp
    translate([KNAPP[0], D / 2, H - 3]) cylinder(d = 9, h = 6);
  }
  // panelstøtter
  for (x = [KANT - 2, B - KANT + 0.5]) translate([x, VEGG, HAKE]) cube([1.5, 3, PANEL[1]]);
}

module bakdeksel() {
  difference() {
    translate([VEGG + 0.2, D - VEGG, VEGG + 0.2]) boks(B - 2 * VEGG - 0.4, VEGG, H - 2 * VEGG - 0.4, R - VEGG);
    // kameravindu
    translate([LINSE[0], D - VEGG - 1, LINSE[1]]) rotate([-90, 0, 0]) cylinder(d = 10, h = VEGG + 2);
    // USB-C nederst
    translate([B - 30, D - VEGG - 1, 12]) rotate([-90, 0, 0]) hull() for (s = [-1, 1]) translate([s * 3.4, 0, 0]) cylinder(d = 3.6, h = VEGG + 2);
    // tekst bak
    translate([B / 2, D + 0.01 - 0.5, 40]) rotate([90, 0, 180]) linear_extrude(1) text("DENNE SIDEN MOT VINDUET", size = 4.2, font = "Inter:style=Bold", halign = "center");
  }
  // skinne for linsedeksel
  for (dz = [-9, 7.6]) translate([LINSE[0] - 12, D - 0.2, LINSE[1] + dz]) cube([40, 1.8, 1.4]);  // 0,2 mm overlapp: vanntett
  // kameraring
  translate([LINSE[0], D - 0.2, LINSE[1]]) rotate([-90, 0, 0]) difference() { cylinder(d = 16, h = 1.4); translate([0, 0, -1]) cylinder(d = 10, h = 4); }
}

SOKKEL = [B + 10, 44, 9];            // sokkel med skrå spalt: rammen står 10° bakover i den
SPALT = 5;                           // hvor dypt rammen står nede i sokkelen

module fot() {
  difference() {
    translate([-5, -12, 0]) hull() for (x = [3, SOKKEL[0] - 3], y = [3, SOKKEL[1] - 3]) translate([x, y, 0]) cylinder(r = 3, h = SOKKEL[2]);
    translate([-0.3, 0, SOKKEL[2] - SPALT]) rotate([-TILT, 0, 0]) translate([0, -0.3, -2]) cube([B + 0.6, D + 0.6, H]);
    // kabelspor bak
    translate([B - 36, 20, -1]) cube([12, 30, 4]);
  }
}

module linsedeksel() {
  difference() {
    translate([-8, 0, -7.4]) cube([16, 1.4, 14.8]);
    for (i = [0:3]) translate([4 - i * 2, 0.8, -5]) cube([0.7, 1, 10]);
  }
}

module knapp() { cylinder(d = 8.2, h = 3.4); }

module panel() {
  color("#e6e4dc") cube([PANEL[0], PANEL[2], PANEL[1]]);
  color(maske ? "#ff00ff" : "#c9c6bc") translate([AKTIV_OFF[0], -0.05, AKTIV_OFF[1]]) cube([AKTIV[0], 0.1, AKTIV[1]]);
}

module plassert(eks = 0) {
  color("#d9dcd8") front();
  color("#cfd3cf") translate([0, eks * 1.6, 0]) bakdeksel();
  color("#2f5f7a") translate([LINSE[0] + (linse_aapen ? 16 : 0), D + 1.6 + eks * 2, LINSE[1]]) linsedeksel();
  color("#111") translate([LINSE[0], D + eks * 1.6 - 0.5, LINSE[1]]) rotate([-90, 0, 0]) cylinder(d = 7, h = 0.6);
  color("#2f5f7a") translate([KNAPP[0], D / 2, H - 1.2 + eks * 0.8]) knapp();
  translate([KANT, VEGG - 1.2 + 1.2 - eks * 1.2 + 0.01, HAKE]) panel();
}

module vippet(eks = 0) {
  translate([0, 0, SOKKEL[2] - SPALT + eks * 1.2]) rotate([-TILT, 0, 0]) plassert(eks);
  color("#b9bfba") translate([0, 0, -eks * 0.6]) fot();
}

if (del == "samlet" || del == "bak") vippet(0);
else if (del == "eksplodert") vippet(12);
else if (del == "front") front();
else if (del == "bakdeksel") bakdeksel();
else if (del == "fot") fot();
else if (del == "linsedeksel") linsedeksel();
else if (del == "knapp") knapp();
