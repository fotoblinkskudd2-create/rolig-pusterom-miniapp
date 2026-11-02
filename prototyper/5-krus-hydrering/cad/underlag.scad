// Drikkeunderlag med vektcelle-lomme og lysring (prototype, mm)
$fn = 96;

D      = 110;    // underlagets diameter
H      = 14;     // tykkelse
LC_L   = 80;     // vektcelle, lengde [verifiser mot datablad]
LC_W   = 12.7;   // vektcelle, bredde
LC_H   = 12.7;   // vektcelle, høyde
RING_R = 40;     // radius for lysring
RING_W = 4;      // bredde på lysring-spor
KAB_W  = 6;      // kabelkanal

difference() {
    cylinder(d = D, h = H);

    // lomme for vektcelle, midt i underlaget
    translate([-LC_L / 2, -LC_W / 2, H - LC_H - 1])
        cube([LC_L, LC_W, LC_H + 1]);

    // lysring-spor i overflaten, rundt koppområdet
    translate([0, 0, H - 3])
        difference() {
            cylinder(r = RING_R + RING_W / 2, h = 4);
            translate([0, 0, -1]) cylinder(r = RING_R - RING_W / 2, h = 6);
        }

    // kabelkanal fra vektcelle til kant
    translate([0, -KAB_W / 2, 0])
        cube([D / 2, KAB_W, H - LC_H - 3]);
}

// TODO: lokk for batteri/elektronikk, LED-ring montering, lysdiffusor.
