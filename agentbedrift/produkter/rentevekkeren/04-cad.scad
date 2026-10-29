// Rentevekkeren - hus til skrivebordsklokke. Mål i mm.
bredde = 120;
dybde = 70;
hoyde = 45;
vegg = 3;

difference() {
    cube([bredde, dybde, hoyde]);
    translate([vegg, vegg, vegg]) cube([bredde - 2 * vegg, dybde - 2 * vegg, hoyde]);
    translate([15, -1, 15]) cube([90, vegg + 2, 22]);  // skjermvindu
}
