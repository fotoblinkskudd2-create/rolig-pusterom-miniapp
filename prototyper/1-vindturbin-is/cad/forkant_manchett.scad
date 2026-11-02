// Forkant-manchett med tuberkler (prototype, skala-modell)
// Enheter: mm. Lengdeaksen (spenn) er z. Forkanten peker mot +x.
$fn = 64;

L  = 300;   // segmentlengde langs spennet
R  = 15;    // innvendig forkant-radius
T  = 2;     // veggtykkelse
A  = 6;     // tuberkkel-amplitude (fremover/bakover)
W  = 40;    // bølgelengde langs spennet
N  = 60;    // antall snitt (lofting-steg)

// Forskyvning av forkanten langs x, som funksjon av spennposisjon z
function dx(z) = A * sin(360 * z / W);

// Halvsirkel-skive med flat bakside ved x = 0. Konveks, så hull() er trygt.
module half_disk(r) {
    intersection() {
        circle(r = r, $fn = 96);
        translate([0, -r - 1]) square([r + 1, 2 * r + 2]);
    }
}

module slab(r, z) {
    translate([dx(z), 0, z]) linear_extrude(height = 0.1) half_disk(r);
}

// Loft av halvsirkler langs z, fra z0 til z1
module loft(r, z0, z1) {
    for (i = [0 : N - 1]) {
        za = z0 + (z1 - z0) * i / N;
        zb = z0 + (z1 - z0) * (i + 1) / N;
        hull() { slab(r, za); slab(r, zb); }
    }
}

// Skall = ytre loft minus indre loft. Indre går litt utover endene for ren kutt.
difference() {
    loft(R + T, 0, L);
    loft(R, -1, L + 1);
}

// TODO: klemmehull i endene (M5), ikke modellert ennå.
