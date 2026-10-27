// Kaffekopp «Tretimer» P1 – vakuumkopp med PCM-kappe, vakuumlokk med kantskjørt.
// Verdier fra beste.json (fokus «varme»), avrundet. Alle mål i mm.
//   DEL = "alt" (halvt snitt) | "innerbeholder" | "ytterbeholder" | "lokk" | "hank"
// Stålveggene er 0,35 mm i ekte produkt. Med PRINT = true blir alle vegger minst 1,2 mm,
// så STL-ene kan 3D-printes som form-/ergonomiprototype (ikke termisk prototype).
DEL = "alt";
PRINT = true;

// --- fra beste.json ---
D_INN     = 70.3;   // indre diameter
H_INN     = 85.0;   // indre dybde under lokkpluggen (330 ml)
H_FYLL    = 77.3;   // 300 ml kaffe
VEGG      = 0.35;   // stålplate
HALS      = 20.0;   // ledningsvei i halsen (rullet kant + nedtrekk)
PCM_T     = 5.1;    // tykkelse PCM-kappe (73 g, smelter ved 64 °C)
SPALTE    = 3.0;    // vakuumspalte
KAPPE_V   = 0.5;    // vegg i PCM-kappen
BUNN      = 12.0;   // bunn: vakuum + fot
SKJORT    = 12.0;   // lokkskjørtet dekker øverste 12 mm av ytterveggen
D_UT      = 88.8;
H_TOT     = 115.0;

v   = PRINT ? max(VEGG, 1.2) : VEGG;
kv  = PRINT ? max(KAPPE_V, 1.2) : KAPPE_V;
R_I = D_INN / 2;
R_P = R_I + v + PCM_T;              // utsiden av PCM
R_K = R_P + kv;                     // utsiden av kappen
R_U = D_UT / 2;                     // utsiden av ytterveggen
Z_B = BUNN;                         // innvendig bunn
PLUGG = HALS - 6;                   // lokkpluggen går ned i halsen
Z_KANT = Z_B + H_INN + PLUGG;       // toppen av drikkekanten
NEDTREKK = 6;                       // den rullede kanten går ned på utsiden før sveisen
$fn = 120;

module ring(r1, r2, z1, z2) {        // hult sylinderskall
    translate([0, 0, z1]) difference() {
        cylinder(r = r2, h = z2 - z1);
        translate([0, 0, -0.01]) cylinder(r = r1, h = z2 - z1 + 0.02);
    }
}

module innerbeholder() {
    color("Silver") {
        ring(R_I, R_I + v, Z_B, Z_KANT);                 // innervegg, helt opp til kanten
        translate([0, 0, Z_B - v]) cylinder(r = R_I + v, h = v);   // innerbunn
        // rullet drikkekant: over toppen og ned på utsiden (del av HALS-ledningsveien)
        translate([0, 0, Z_KANT]) rotate_extrude() translate([R_I + 2.2, 0]) difference() {
            circle(r = 2.2); circle(r = 2.2 - v); translate([-3, -3]) square([6, 3]);
        }
    }
    color("SandyBrown") ring(R_K - kv, R_K, Z_B + 2, Z_B + H_FYLL);        // PCM-kappe (vegg)
    color("Gold", 0.8) ring(R_I + v, R_P, Z_B + 2 + kv, Z_B + H_FYLL - kv); // PCM
}

module ytterbeholder() {
    color("DimGray") {
        ring(R_U - v, R_U, 0, Z_KANT - NEDTREKK);        // yttervegg, sveises til rullet kant
        cylinder(r = R_U, h = v + 0.6);                    // bunnplate
        ring(R_U - 6, R_U - 3, 0, 3);                      // fotring med silikon
    }
    color("Peru") translate([0, 0, Z_B - 6]) cylinder(r = 3, h = 2); // getter (indikasjon)
}

module lokk() {
    color("SteelBlue") {
        // topp-plate (vakuum-dobbelvegg i ekte produkt)
        translate([0, 0, Z_KANT]) cylinder(r = R_U + 1.5, h = H_TOT - Z_KANT);
        // kantskjørt over ytterveggen
        ring(R_U + 0.2, R_U + 1.5, Z_KANT - SKJORT, Z_KANT);
        // plugg ned i halsen med pakning
        translate([0, 0, Z_KANT - PLUGG]) cylinder(r = R_I - 0.4, h = PLUGG);
    }
    color("Black") translate([0, 0, Z_KANT - PLUGG + 2]) ring(R_I - 0.6, R_I, 0, 2.5);  // silikonpakning
    // drikkeåpning med skyvelukke (ventil 6 x 18 mm)
    color("White") translate([R_I - 14, -9, H_TOT - 0.01]) cube([6, 18, 1.2]);
}

module hank() {
    color("DimGray") translate([R_U - 1, 0, 0]) rotate([90, 0, 0])
        linear_extrude(height = 12, center = true) difference() {
            translate([0, 30]) offset(r = 4) square([22, 50]);
            translate([5, 37]) offset(r = 3) square([12, 36]);
            translate([-30, 0]) square([30, 120]);
        }
}

module snitt() { difference() { children(); translate([-200, -400, -10]) cube([400, 400, 300]); } }

if (DEL == "innerbeholder") innerbeholder();
else if (DEL == "ytterbeholder") ytterbeholder();
else if (DEL == "lokk") lokk();
else if (DEL == "hank") hank();
else snitt() { innerbeholder(); ytterbeholder(); lokk(); hank(); }
