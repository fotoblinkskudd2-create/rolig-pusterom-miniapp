// MØRKEROM — kamerahus v0.1, parametrisk. Mål i mm. X = bredde, Y = dybde (front ved y=0), Z = høyde.
// Deler: "samlet", "eksplodert", "bak" (bakfra), "front", "bakdel", "deksel", "utloser", "bla", "snitt"
del = "samlet";
maske = false;     // true: e-blekk-feltet i magenta (for å legge inn ekte skjermbilde)
deksel_aapen = true;
$fn = 64;

B = 110; D = 34; H = 62; R = 6;          // kropp og hjørneradius
DELING = 20;                              // front/bak-skillet (y)
VEGG = 2.0;

OBJ = [-14, 30];                          // objektiv (x fra midten, z)
OBJ_D = 24; OBJ_UT = 5; GLASS_D = 12;
SOKER_F = [-38, 50, 16, 11];              // søker front: x, z, b, h
SOKER_B = [-38, 50, 9, 6.5];              // søker bak
UTL = [36, 0];                            // utløser: x fra midten
EPD = [27.6, 27.6];                       // 1,54" aktivt felt
EPD_MOD = [31.8, 37.3, 1.0];              // modul (panel + FPC-kant)
EPD_POS = [6, 30];                        // midt på bakskjermen: x fra midten, z
BLA = [32, 30];                           // bla-knapp bak
DEKSEL = [32, 30, 1.6];                   // skyvedeksel

module kropp(inn = 0) {
  r = R - inn;
  hull() for (x = [r + inn, B - r - inn], y = [r + inn, D - r - inn], z = [r + inn, H - r - inn]) translate([x, y, z]) sphere(r = r, $fn = 32);
}

module grep() {
  // Lite grep foran til høyre: halv sylinder
  translate([B - 22, 0.6, 6]) scale([1, 0.28, 1]) cylinder(d = 26, h = H - 12, $fn = 64);
}

module objektiv() {
  translate([B / 2 + OBJ[0], 0, OBJ[1]]) rotate([90, 0, 0]) difference() {
    cylinder(d = OBJ_D, h = OBJ_UT);
    translate([0, 0, OBJ_UT - 1.5]) cylinder(d1 = GLASS_D, d2 = GLASS_D + 4, h = 1.6);
    translate([0, 0, -1]) cylinder(d = GLASS_D, h = OBJ_UT + 2);
  }
}

module hus() {
  difference() {
    union() {
      kropp();
      objektiv();
      // deksel-skinner
      for (dz = [-DEKSEL[1] / 2 - 1.8, DEKSEL[1] / 2 + 0.2])
        translate([B / 2 + OBJ[0] - DEKSEL[0] / 2 - 2, -1.2, OBJ[1] + dz]) cube([DEKSEL[0] * 2 + 4, 1.4, 1.6]);
      // reimfeste
      translate([B - 1, D / 2 - 5, H - 16]) difference() { cube([4, 10, 10]); translate([-1, 3, 3]) cube([4, 4, 4]); }
    }
    kropp(VEGG);
    // søker (rett gjennom)
    hull() {
      translate([B / 2 + SOKER_F[0] - SOKER_F[2] / 2, -1, SOKER_F[1] - SOKER_F[3] / 2]) cube([SOKER_F[2], 0.1, SOKER_F[3]]);
      translate([B / 2 + SOKER_B[0] - SOKER_B[2] / 2, D + 0.9, SOKER_B[1] - SOKER_B[3] / 2]) cube([SOKER_B[2], 0.1, SOKER_B[3]]);
    }
    // objektivhull
    translate([B / 2 + OBJ[0], 3, OBJ[1]]) rotate([90, 0, 0]) cylinder(d = GLASS_D, h = 20);
    // utløser
    translate([B / 2 + UTL[0], D / 2, H - 3]) cylinder(d = 11, h = 6);
    // e-blekk-vindu bak
    translate([B / 2 + EPD_POS[0] - EPD[0] / 2 - 0.4, D - 3, EPD_POS[1] - EPD[1] / 2 - 0.4]) cube([EPD[0] + 0.8, 4, EPD[1] + 0.8]);
    // bla-knapp
    translate([B / 2 + BLA[0], D - 3, BLA[1]]) rotate([-90, 0, 0]) cylinder(d = 9, h = 5);
    // lagre-LED ved søkeren bak
    translate([B / 2 + SOKER_B[0] + 9, D - 3, SOKER_B[1]]) rotate([-90, 0, 0]) cylinder(d = 2.2, h = 5);
    // USB-C på venstre side
    translate([-1, D / 2, 12]) rotate([0, 90, 0]) hull() for (s = [-1, 1]) translate([0, s * 3.4, 0]) cylinder(d = 3.6, h = VEGG + 2);
    // navn på toppen
    translate([B / 2 - 6, D / 2 - 2.8, H - 0.6]) linear_extrude(1) text("MØRKEROM", size = 5.4, font = "Inter:style=Bold", spacing = 1.18, halign = "center");
    // delingslinje (skygge-spor)
    translate([-1, DELING - 0.3, -1]) cube([B + 2, 0.6, 0.6]);
    translate([-1, DELING - 0.3, H + 0.4]) cube([B + 2, 0.6, 0.6]);
  }
}

module deksel() {
  difference() {
    translate([-DEKSEL[0] / 2, -DEKSEL[2], -DEKSEL[1] / 2]) cube([DEKSEL[0], DEKSEL[2], DEKSEL[1]]);
    for (i = [0:5]) translate([DEKSEL[0] / 2 - 4 - i * 2, -DEKSEL[2] - 0.5, -DEKSEL[1] / 2 + 3]) cube([0.8, 0.8, DEKSEL[1] - 6]);
  }
}

module utloser() {
  cylinder(d = 10.2, h = 3.2);
  translate([0, 0, 3.2]) cylinder(d1 = 10.2, d2 = 9.4, h = 0.6);
}

module bla() { rotate([-90, 0, 0]) cylinder(d = 8.2, h = 2.4); }

module epd() {
  color("#e6e4dc") translate([-EPD_MOD[0] / 2, 0, -EPD_MOD[1] / 2 + 3]) cube([EPD_MOD[0], EPD_MOD[2], EPD_MOD[1]]);
  color(maske ? "#ff00ff" : "#c9c6bc") translate([-EPD[0] / 2, EPD_MOD[2] - 0.02, -EPD[1] / 2]) cube([EPD[0], 0.1, EPD[1]]);  // aktiv flate vender bakover
}

module plassert(eks = 0) {
  color("#2b2a28") hus();
  color("#0b0b0c") translate([B / 2 + OBJ[0], 0.8, OBJ[1]]) rotate([90, 0, 0]) cylinder(d = GLASS_D - 0.2, h = 0.4);  // glass
  color("#3d3b38") translate([B / 2 + OBJ[0], -OBJ_UT + 1.4, OBJ[1]]) rotate([90, 0, 0]) difference() { cylinder(d = OBJ_D - 3, h = 0.5); translate([0, 0, -1]) cylinder(d = GLASS_D + 2, h = 3); }
  color("#8a8780") translate([B / 2 + OBJ[0] + (deksel_aapen ? DEKSEL[0] + 1 : 0), -1.4 - eks, OBJ[1]]) deksel();
  color("#c8402f") translate([B / 2 + UTL[0], D / 2, H - 1.2 + eks * 0.5]) utloser();
  color("#e7e5de") translate([B / 2 + BLA[0], D - 0.6 + eks * 0.3, BLA[1]]) bla();
  translate([B / 2 + EPD_POS[0], D - 1.2 + eks * 0.2, EPD_POS[1]]) epd();
  color("#f5b25a") translate([B / 2 + SOKER_B[0] + 9, D - 0.8, SOKER_B[1]]) rotate([-90, 0, 0]) cylinder(d = 2, h = 0.6);
}

if (del == "samlet" || del == "bak") plassert(0);
else if (del == "eksplodert") plassert(14);
else if (del == "snitt") difference() { plassert(0); translate([-1, -10, H / 2 + 0]) cube([B + 2, D + 20, H]); }
else if (del == "front") intersection() { hus(); translate([-1, -10, -1]) cube([B + 2, DELING + 10, H + 2]); }
else if (del == "bakdel") intersection() { hus(); translate([-1, DELING, -1]) cube([B + 2, D, H + 2]); }
else if (del == "deksel") deksel();
else if (del == "utloser") utloser();
else if (del == "bla") bla();
