// Batterihylse med isolasjon og PCM-lomme (prototype, mm)
// Batteri-dimensjoner er eksempel (6S). Sett fra batteriets datablad.
$fn = 32;

BL     = 150;   // batterilengde
BW     = 75;    // batteribredde
BH     = 40;    // batterihøyde
INS    = 15;    // isolasjonstykkelse rundt
PCM_T  = 8;     // PCM-lomme over batteriet
R_CORN = 4;     // hjørneradius på ytterskall

module rbox(size, r = R_CORN) {
    hull()
        for (x = [r, size[0] - r], y = [r, size[1] - r])
            translate([x, y, 0]) cylinder(r = r, h = size[2]);
}

OUT_X = BL + 2 * INS;
OUT_Y = BW + 2 * INS;
OUT_Z = BH + 2 * INS + PCM_T;

difference() {
    rbox([OUT_X, OUT_Y, OUT_Z]);

    // batterikammer
    translate([INS, INS, INS]) cube([BL, BW, BH]);

    // PCM-lomme over batteriet
    translate([INS, INS, INS + BH]) cube([BL, BW, PCM_T]);

    // kontaktspor i ene kortside
    translate([-1, OUT_Y / 2 - 15, INS + 8]) cube([INS + 2, 30, 14]);
}

// TODO: lokk (separat del), varmeelement-kanal, kondens-ventil, temperatursensor-hull.
