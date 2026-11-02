// Pusteklokke: hus for rav-lampe (prototype, skala 1:1, mm)
$fn = 96;

D_BASE   = 100;   // basens diameter
H_BASE   = 25;    // basens høyde
D_DOME   = 90;    // kuppelens ytre diameter
H_DOME   = 70;    // kuppelens høyde over base
WALL     = 2.5;   // veggtykkelse

module base() {
    difference() {
        cylinder(d = D_BASE, h = H_BASE);
        // lomme til elektronikk og batteri
        translate([0, 0, 3]) cylinder(d = D_BASE - 2 * 12, h = H_BASE);
        // knapp-hull i siden
        translate([D_BASE / 2, 0, H_BASE / 2])
            rotate([0, 90, 0]) cylinder(d = 8, h = 10, center = true);
    }
}

// Halv-ellipsoide som diffusor. Yttervegg og innervegg har lik tykkelse.
module dome() {
    translate([0, 0, H_BASE])
    difference() {
        scale([1, 1, H_DOME / (D_DOME / 2)]) sphere(d = D_DOME);
        scale([1, 1, (H_DOME - WALL) / (D_DOME / 2 - WALL)]) sphere(d = D_DOME - 2 * WALL);
        // kapp bunnen, så kuppelen står åpen mot basen
        translate([-D_DOME, -D_DOME, -D_DOME]) cube([2 * D_DOME, 2 * D_DOME, D_DOME]);
    }
}

base();
dome();

// TODO: plass til knappens PCB, LED-holder i midten, batteri (18650 ca. 65 mm).
