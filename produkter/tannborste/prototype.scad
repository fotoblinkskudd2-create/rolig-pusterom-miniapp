// Tannbørste-prototype P1 "Ren" – parametrisk modell for OpenSCAD.
// Åpne i OpenSCAD (gratis, openscad.org), F6 for å rendre, File > Export > STL.
// Alle mål i mm. Endre parametrene under og rendre på nytt.
// Sett DEL = "hode" eller "skaft" for å eksportere delene hver for seg til 3D-print.

DEL = "alt";            // "alt" | "hode" | "skaft"

// Skaft (motorhus)
skaft_lengde   = 130;
skaft_diam     = 26;    // plass til motor og batteri
midje_diam     = 23;    // grepsmidje
midje_pos      = 60;    // fra bunnen
knapp_diam     = 9;

// Utskiftbart hode
nakke_lengde   = 60;
nakke_diam_bunn = 9;
nakke_diam_topp = 6.5;
nakke_knekk    = 12;    // grader, gir rekkevidde bakerst
hode_lengde    = 20;
hode_bredde    = 9.5;
hode_tykkelse  = 5;

// Buster
bust_hoyde     = 10;
tip_hoyde      = 12;    // lange tanntråd-tuster i tuppen
tust_diam      = 1.6;
skive_diam     = 9;     // roterende skive foran
bak_vinkel     = 45;    // vinkel på faste tuster bak (Bass)

$fn = 48;

module skaft() {
    // Hull av kuler gir myk, grepvennlig form med smalere midje.
    hull() {
        translate([0, 0, 4]) sphere(d = skaft_diam);
        translate([0, 0, midje_pos]) sphere(d = midje_diam);
    }
    hull() {
        translate([0, 0, midje_pos]) sphere(d = midje_diam);
        translate([0, 0, skaft_lengde - 8]) sphere(d = skaft_diam - 2);
    }
    // Overgang til hodet (drivaksel-feste)
    translate([0, 0, skaft_lengde - 8]) cylinder(h = 12, d1 = skaft_diam - 2, d2 = 12);
    // Av/på-knapp med LED-ring for trykksensor
    translate([skaft_diam / 2 - 1.5, 0, 85]) rotate([0, 90, 0]) {
        cylinder(h = 2.5, d = knapp_diam);
        color("red") difference() {
            cylinder(h = 2, d = knapp_diam + 4);
            translate([0, 0, -1]) cylinder(h = 4, d = knapp_diam + 1);
        }
    }
}

module tust(h, d = tust_diam) {
    color("white") cylinder(h = h, d = d, $fn = 12);
}

module hodeplate() {
    hull() {
        translate([0, hode_lengde / 2 - hode_bredde / 2, 0])
            cylinder(h = hode_tykkelse, d = hode_bredde);
        translate([0, -hode_lengde / 2 + hode_bredde / 2, 0])
            cylinder(h = hode_tykkelse, d = hode_bredde * 0.85);
    }
}

module buster() {
    skive_y = hode_lengde / 2 - skive_diam / 2 - 0.5;
    // Roterende-oscillerende skive: 24 tuster i 3 ringer (1 + 8 + 15).
    translate([0, skive_y, hode_tykkelse]) {
        color("steelblue") cylinder(h = 1.2, d = skive_diam);
        translate([0, 0, 1.2]) {
            tust(bust_hoyde);
            for (i = [0:7])  rotate([0, 0, i * 45])   translate([2.3, 0, 0]) tust(bust_hoyde);
            for (i = [0:14]) rotate([0, 0, i * 24])   translate([3.8, 0, 0]) tust(bust_hoyde);
        }
    }
    // 4 lange tanntråd-tuster i tverrgående rad mellom faste tuster og skiva.
    for (x = [-1.8, -0.6, 0.6, 1.8])
        translate([x, -hode_lengde / 2 + 10, hode_tykkelse]) tust(tip_hoyde, 1.1);
    // 14 faste tuster bak, vinklet annenhver vei (X-mønster).
    for (r = [0:6]) for (s = [-1, 1])
        translate([s * 2.2, -hode_lengde / 2 + 1.6 + r * 1.2, hode_tykkelse])
            rotate([s * (90 - bak_vinkel) * 0.35, 0, 0]) tust(bust_hoyde * 0.9, 1.1);
}

module tungerenser() {
    // Riflet TPE-pute på baksiden av hodet.
    for (i = [0:5])
        color("teal") translate([-3.5, -hode_lengde / 2 + 3 + i * 2.6, -0.8]) cube([7, 1.2, 0.8]);
}

module hode() {
    // Nakke med knekk, deretter hodet.
    cylinder(h = nakke_lengde * 0.75, d1 = nakke_diam_bunn, d2 = nakke_diam_topp + 0.5);
    translate([0, 0, nakke_lengde * 0.75]) rotate([nakke_knekk, 0, 0]) {
        cylinder(h = nakke_lengde * 0.25, d1 = nakke_diam_topp + 0.5, d2 = nakke_diam_topp);
        translate([0, 0, nakke_lengde * 0.25 + hode_lengde / 2 - 2])
            rotate([-90, 0, 0]) translate([0, 0, -hode_tykkelse / 2])
                rotate([0, 0, 180]) { hodeplate(); buster(); tungerenser(); }
    }
}

if (DEL == "alt" || DEL == "skaft") color("burlywood") skaft();
if (DEL == "alt" || DEL == "hode")  translate([0, 0, DEL == "hode" ? 0 : skaft_lengde + 4]) color("ivory") hode();
