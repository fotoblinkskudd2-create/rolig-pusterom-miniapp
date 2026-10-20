// STAFETT — kabinett v0.1, parametrisk. Mål i mm.
// Eksport per del:  openscad -D 'del="skall"' -o out/skall.stl stafett.scad
// Deler: "samlet" (farget sammenstilling), "eksplodert", "skall", "bunn", "hjul", "pcb", "panel", "vekt"
del = "samlet";
$fn = 72;

// ---------- hovedmål ----------
B = 132;          // bredde
D = 84;           // dybde
H = 86;           // høyde
LEPPE = 8;        // front-leppe før skjermflaten starter
VINKEL = 60;      // skjermflatens vinkel fra bordet
VEGG = 2.4;
RUND = 4;         // kantradius
TOPP_D = D - (H - LEPPE) / tan(VINKEL);  // flat topp, dybde

// ---------- e-blekk 4,2" (Good Display GDEY042T81 / Waveshare 4.2 raw) ----------
PANEL = [103.0, 78.5, 1.2];
AKTIV = [84.8, 63.6];
AKTIV_FORSKYV = [(103.0 - 84.8) / 2, 78.5 - 63.6 - 3.0];  // FPC-kant nederst: aktivt felt sitter høyt
SKRAA = (H - LEPPE) / sin(VINKEL);                         // lengde på skjermflaten
PANEL_Y = (SKRAA - PANEL[1]) / 2;                           // panelets nedre kant langs flaten

// ---------- hjul (EC11 + Ø32 knott) ----------
HJUL_D = 32;
HJUL_H = 16;
HJUL_POS = [B - 30, D - TOPP_D / 2];   // x, y på toppflaten
EC11_HULL = 7.4;                        // M7-bøssing

// ---------- bunn ----------
BUNN_T = 3.0;
VEKT = [80, 60, 4];      // stålplate, ~150 g (7,85 g/cm³)
FOT_D = 10;
SKRUE_POS = [[8, 8], [B - 8, 8], [8, D - 8], [B - 8, D - 8]];

// ---------- profiler ----------
module profil(inn = 0) {
  // YZ-profil (y = dybde, z = høyde)
  // Avrundede topp- og frontkanter; bunnkantene holdes skarpe så bunnplata sitter.
  offset(delta = -inn) union() {
    offset(r = RUND) offset(delta = -RUND) polygon([[0, 0], [D, 0], [D, H], [D - TOPP_D, H], [0, LEPPE]]);
    square([D, RUND + 1]);
  }
}

module flate_koord() {
  // lokalt: x på tvers, y oppover skjermflaten, z ut av flaten
  translate([0, 0, LEPPE]) rotate([VINKEL, 0, 0]) children();
}

module ytre() { rotate([90, 0, 90]) linear_extrude(B) profil(); }

module skall() {
  difference() {
    union() {
      difference() {
        ytre();
        // hul innside, åpen i bunnen
        translate([VEGG, 0, -1]) rotate([90, 0, 90]) linear_extrude(B - 2 * VEGG) translate([0, 1]) profil(VEGG);
        translate([VEGG, VEGG, -1]) cube([B - 2 * VEGG, D - 2 * VEGG, VEGG + 1.01]);
      }
      // skrue-tårn for bunnplate (M3 innpressmutter)
      for (p = SKRUE_POS) translate([p[0], p[1], 0]) difference() {
        cylinder(d = 8, h = 14);
        translate([0, 0, -1]) cylinder(d = 4.0, h = 7);
      }
      // ramme bak panelet (holder det mot fronten)
      flate_koord() for (sx = [0, 1]) translate([B / 2 - PANEL[0] / 2 - 3 + sx * (PANEL[0] + 3), PANEL_Y, -VEGG - 3]) cube([3, PANEL[1], 3]);
      // bøssing-sokkel for EC11 under toppen
      translate([HJUL_POS[0], HJUL_POS[1], H - VEGG - 4]) cylinder(d = 16, h = 4);
    }
    // skjermvindu
    flate_koord() translate([B / 2 - PANEL[0] / 2 + AKTIV_FORSKYV[0] - 0.5, PANEL_Y + AKTIV_FORSKYV[1] - 0.5, -10]) cube([AKTIV[0] + 1, AKTIV[1] + 1, 20]);
    // panel-lomme bak flaten (1,2 mm hud foran panelet)
    flate_koord() translate([B / 2 - PANEL[0] / 2 - 0.3, PANEL_Y - 0.3, -VEGG - 0.01]) cube([PANEL[0] + 0.6, PANEL[1] + 0.6, VEGG - 1.2]);
    // hjul-hull
    translate([HJUL_POS[0], HJUL_POS[1], H - 10]) cylinder(d = EC11_HULL, h = 20);
    // anti-rotasjonstapp for EC11
    translate([HJUL_POS[0] + 7.8 - 1.2, HJUL_POS[1] - 1.4, H - VEGG - 4.1]) cube([2.4, 2.8, 3.2]);
    // logo / NFC-felt, 0,6 mm preget
    translate([14, D - TOPP_D / 2 - 4, H - 0.6]) linear_extrude(1) text("STAFETT", size = 8, font = "Inter:style=Bold", spacing = 1.12);
    // USB-C bak
    translate([B / 2, D + 1, 11]) rotate([90, 0, 0]) hull() for (s = [-1, 1]) translate([s * 3.4, 0, 0]) cylinder(d = 3.8, h = VEGG + 2);
    // lufting / høyttaler-fri: små spalter bak for temperatursensor
    for (i = [0:4]) translate([B - 30 + i * 4, D - VEGG - 1, 30]) cube([1.6, VEGG + 2, 14]);
  }
}

module bunn() {
  difference() {
    union() {
      translate([VEGG + 0.2, VEGG + 0.2, 0]) cube([B - 2 * VEGG - 0.4, D - 2 * VEGG - 0.4, BUNN_T]);
      // vektlomme-kant
      translate([B / 2 - VEKT[0] / 2 - 1.6, 14 - 1.6, BUNN_T]) difference() {
        cube([VEKT[0] + 3.2, VEKT[1] + 3.2, VEKT[2]]);
        translate([1.6, 1.6, -1]) cube([VEKT[0], VEKT[1], VEKT[2] + 2]);
      }
      // PCB-avstandsstykker (PCB 100 × 60 står bak vekten, vinklet ikke nødvendig)
    }
    for (p = SKRUE_POS) translate([p[0], p[1], -1]) {
      cylinder(d = 3.4, h = 10);
      cylinder(d1 = 6.4, d2 = 3.4, h = 1.6 + 1);
    }
    // gummiføtter
    for (p = [[18, 14], [B - 18, 14], [18, D - 14], [B - 18, D - 14]]) translate([p[0], p[1], -0.01]) cylinder(d = FOT_D + 0.4, h = 1.0);
    // gravering under
    translate([B / 2, D / 2 + 10, 0.5]) mirror([1, 0, 0]) rotate([180, 0, 0]) linear_extrude(1) text("STAFETT v0.1 · lokal · ingen sky", size = 4, halign = "center", font = "Inter:style=Medium");
  }
}

module hjul() {
  difference() {
    union() {
      cylinder(d = HJUL_D, h = HJUL_H - 1.5);
      translate([0, 0, HJUL_H - 1.5]) cylinder(d1 = HJUL_D, d2 = HJUL_D - 3, h = 1.5);
    }
    // riller
    for (i = [0:47]) rotate([0, 0, i * 7.5]) translate([HJUL_D / 2 + 0.2, 0, -1]) cylinder(d = 1.6, h = HJUL_H - 2.5, $fn = 12);
    // fingerskål
    translate([0, 0, HJUL_H + 22]) sphere(r = 23.2, $fn = 120);
    // D-aksel 6 mm (EC11)
    translate([0, 0, -1]) difference() { cylinder(d = 6.15, h = 13); translate([1.65 + 0.05, -5, -1]) cube([10, 10, 20]); }
    // markeringsprikk
    translate([0, HJUL_D / 2 - 4.5, HJUL_H - 2]) cylinder(d = 2.2, h = 5);
  }
}

module pcb() {
  color("#2f6b3e") cube([100, 50, 1.6]);
  color("#cfcfcf") translate([4, 18, 1.6]) cube([13.2, 16.6, 2.4]);           // ESP32-C3-MINI-1
  color("#333") translate([50 - 4.5, 50 - 7.5, 1.6]) cube([9, 7.5, 3.2]);     // USB-C
  color("#c9a227") translate([30, 5, 1.6]) cube([34, 50 - 10, 5]);            // LiPo 1200 mAh (503450)
}

maske = false;  // true: aktivt felt i magenta, for å legge skjermbildet inn i renderen
module panel() {
  color("#e6e4dc") cube(PANEL);
  color(maske ? "#ff00ff" : "#bdbab0") translate([AKTIV_FORSKYV[0], AKTIV_FORSKYV[1], PANEL[2]]) cube([AKTIV[0], AKTIV[1], 0.05]);
  color("#c58a2b") translate([PANEL[0] / 2 - 12, 0.5, -12]) cube([24, 0.2, 12]);  // FPC, brettet bakover
}

module vekt() { color("#7d8085") cube(VEKT); }

module ec11() {
  color("#555") translate([-6, -6.5, 0]) cube([12, 13, 6.5]);
  color("#aaa") translate([0, 0, 6.5]) cylinder(d = 7, h = 7);
  color("#ccc") translate([0, 0, 13.5]) cylinder(d = 6, h = 11);
}

module plassert(eks = 0) {
  color("#ecebe6") translate([0, 0, eks * 1.0]) skall();
  color("#d8d6cf") translate([0, 0, -eks * 1.2]) bunn();
  color("#1e1e1c") translate([HJUL_POS[0], HJUL_POS[1], H + 0.6 + eks * 1.4]) hjul();
  translate([HJUL_POS[0], HJUL_POS[1], H - VEGG - 4 - 6.5 + eks * 0.6]) ec11();
  flate_koord() translate([B / 2 - PANEL[0] / 2, PANEL_Y, -VEGG + 1.2 - PANEL[2] + eks * 1.2]) mirror([0, 0, 0]) panel();
  translate([B / 2 - VEKT[0] / 2, 14, BUNN_T + 0.01 - eks * 0.6]) vekt();
  translate([B / 2 - 50, D - 50 - VEGG - 2, BUNN_T + VEKT[2] + 6 + eks * 0.3]) pcb();
}

if (del == "samlet") plassert(0);
else if (del == "eksplodert") plassert(30);
else if (del == "snitt") difference() { plassert(0); translate([-1, -1, -1]) cube([HJUL_POS[0] + 1, D + 2, H + 40]); }
else if (del == "skall") skall();
else if (del == "bunn") bunn();
else if (del == "hjul") hjul();
else if (del == "pcb") pcb();
else if (del == "panel") panel();
else if (del == "vekt") vekt();

echo(str("TOPP_D=", TOPP_D, " SKRAA=", SKRAA, " PANEL_Y=", PANEL_Y));
