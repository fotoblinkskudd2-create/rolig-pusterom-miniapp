// Brevkniven - blad og håndtak. Mål i mm.
blad_lengde = 150;
blad_bredde = 14;
tykkelse = 2;

difference() {
    union() {
        linear_extrude(height = tykkelse)
            polygon([[0, 0], [blad_lengde, blad_bredde / 2], [0, blad_bredde]]);
        translate([-40, -5, 0]) cube([42, 24, 8]);  // håndtak
    }
    translate([-41, 8, -1]) cylinder(h = 10, r = 2);  // hengehull
}
