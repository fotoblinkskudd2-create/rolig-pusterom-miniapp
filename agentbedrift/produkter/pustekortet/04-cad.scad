// Pustekortet - eske til 52 kort (ca. 0,3 mm per kort). Mål i mm.
kort_b = 62;
kort_h = 90;
kort_tykk = 16;
vegg = 2;
ytre_b = kort_b + 2 * vegg;
ytre_h = kort_h + 2 * vegg;
ytre_d = kort_tykk + 2 * vegg;

difference() {
    cube([ytre_b, ytre_d, ytre_h]);
    translate([vegg, vegg, vegg]) cube([kort_b, kort_tykk, kort_h]);
    translate([ytre_b / 2 - 20, -1, ytre_h - 12]) cube([40, vegg + 2, 5]);  // uttak
}
