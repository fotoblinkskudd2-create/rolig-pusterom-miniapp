// Barnekniv K1 «Spikkevenn» – parametrisk modell for OpenSCAD. Alle mål i mm.
// Verdiene kommer fra maskinen (beste_trygghet.json). Endre og rendre på nytt (F6).
// DEL = "alt" | "blad" | "skaft"  (eksporter hver for seg til STL)

DEL = "alt";

blad_lengde   = 67;
blad_hoyde    = 18;
rygg          = 2.7;
eggvinkel     = 23;     // inkludert vinkel, scandi-slip
spiss_radius  = 8;      // avrundet spiss (0 = spiss)
usleipet      = 12;     // usleipet sone ved skaftet
fingervern    = 7.5;    // hvor mye vernet stikker ut under skaftet
skaft_lengde  = 95;
skaft_hoyde   = 22;
skaft_bredde  = 19;
blad_fall     = 7;      // grader, bladet peker litt ned
tange_lengde  = 70;     // del av bladstålet inne i skaftet

$fn = 64;
slip_hoyde = (rygg / 2) / tan(eggvinkel / 2);   // ca. 6,7 mm ved 23°

module blad_profil() {
    // Egg langs y = 0, rygg på y = blad_hoyde. Ryggen faller mot avrundet spiss.
    r = max(spiss_radius, 0.01);
    hull() {
        square([0.01, blad_hoyde]);
        translate([blad_lengde - r, r]) circle(r = r);
        translate([blad_lengde - r - 6, blad_hoyde - 2]) square([0.01, 2]);
        square([blad_lengde - r, 0.01]);
    }
    translate([-tange_lengde, blad_hoyde * 0.2]) square([tange_lengde, blad_hoyde * 0.6]);
}

module blad() {
    intersection() {
        translate([0, 0, -rygg / 2]) linear_extrude(rygg) blad_profil();
        union() {
            // Scandi: fasett fra egg (0,2 mm) opp til slip_hoyde, full tykkelse over.
            hull() {
                translate([-tange_lengde, 0, -0.1]) cube([blad_lengde + tange_lengde + 1, 0.01, 0.2]);
                translate([-tange_lengde, slip_hoyde, -rygg / 2]) cube([blad_lengde + tange_lengde + 1, 0.01, rygg]);
            }
            translate([-tange_lengde, slip_hoyde, -rygg / 2]) cube([blad_lengde + tange_lengde + 1, blad_hoyde, rygg]);
            // Usleipet sone: full tykkelse og avrundet egg nær skaftet.
            translate([-tange_lengde, 0, -rygg / 2]) cube([tange_lengde + usleipet, blad_hoyde, rygg]);
        }
    }
    // Tommelrampe: riller i ryggen rett foran skaftet
    for (i = [0:5]) color("silver") translate([3 + i * 2.2, blad_hoyde - 0.2, -rygg / 2]) cube([1, 0.6, rygg]);
}

module skaft() {
    color("orange") {
        // Organisk, ovalt skaft: litt smalere midje, fyldigere bak for godt grep
        difference() {
            hull() {
                translate([-skaft_lengde + 10, 0, 0]) scale([10, skaft_hoyde / 2 + 0.5, skaft_bredde / 2]) sphere(r = 1);
                translate([-skaft_lengde * 0.5, 0, 0]) scale([20, skaft_hoyde / 2 - 1, skaft_bredde / 2 - 0.8]) sphere(r = 1);
                translate([-10, 0, 0]) scale([8, skaft_hoyde / 2, skaft_bredde / 2]) sphere(r = 1);
            }
            translate([-skaft_lengde + 7, 0, -20]) cylinder(h = 40, d = 4);   // hull for snor
        }
        // Fingervern: stikker ut under (eggsiden) og litt over
        translate([-6, 0, 0]) hull() {
            translate([0, -skaft_hoyde / 2 - fingervern + 3, 0]) rotate([0, 90, 0]) cylinder(h = 5, r = 3);
            translate([0, skaft_hoyde / 2 + 1, 0]) rotate([0, 90, 0]) cylinder(h = 5, r = 3);
            rotate([0, 90, 0]) scale([skaft_bredde / skaft_hoyde, 1, 1]) cylinder(h = 5, d = skaft_hoyde);
        }
    }
}

// Bladet festes med senterlinjen i skaftets senter og vinkles ned med blad_fall.
module montert_blad() {
    // Tangen ligger rett i skaftet; selve bladet knekkes ned med blad_fall rett foran vernet.
    color("silver") {
        intersection() {
            translate([0, -blad_hoyde / 2, 0]) blad();
            translate([-200, -50, -10]) cube([200, 100, 20]);
        }
        rotate([0, 0, -blad_fall]) intersection() {
            translate([0, -blad_hoyde / 2, 0]) blad();
            translate([0, -50, -10]) cube([200, 100, 20]);
        }
    }
}

if (DEL == "alt") { skaft(); montert_blad(); }
if (DEL == "blad") montert_blad();   // bladet bøyes 7° ved vernet (varmt, før herding)
if (DEL == "skaft") difference() { skaft(); montert_blad(); }
