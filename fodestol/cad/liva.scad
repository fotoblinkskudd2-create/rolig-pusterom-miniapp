// LIVA Plattform — parametrisk konseptmodell (LOD 300)
// Mål i mm. X = lengde (hodeende 0), Y = bredde, Z = høyde.
// Bruk: openscad -D 'MODE="krakk"' liva.scad
// MODE: "seng" | "halvsittende" | "krakk" | "kne" | "side" | "gyn"

MODE = "krakk";
SHOW_MIDWIFE_STOOL = true;
SHOW_UBAR = true;
$fn = 48;

// ---------- hovedparametre (synk med 04-produktspesifikasjon.md) ----------
BASE_L   = 1400;  BASE_W = 760;  BASE_H = 110;
WHEEL_D  = 150;
SEAT_W   = 600;   SEAT_D = 450;  PAD_T = 90;
HOLE_W   = 260;   HOLE_D = 220;  HOLE_R = 90;
BACK_L   = 750;
LEG_L    = 580;
FOOT_D   = 300;
RAIL_W   = 900;
COL_W    = 140;   COL_GAP = 520;   // avstand mellom tvillingsøyler (X)
SEAT_X   = 820;   // setets fremkant-senter relativt hodeende-base

// modus → [setehøyde, ryggvinkel, benseksjon ute?, fotbrett-fall, setesplitt per side, tilt]
function mode_params(m) =
    m == "seng"         ? [600,   0, true,    0,  0,   0] :
    m == "halvsittende" ? [700,  55, true,    0,  0,   0] :
    m == "krakk"        ? [780,  75, false, 350,  0,   0] :
    m == "kne"          ? [700,  85, false,   0, 60,   0] :
    m == "side"         ? [650,  20, true,    0,  0,   0] :
    m == "gyn"          ? [950,  30, false,   0,  0,  -6] :
                          [600,   0, true,    0,  0,   0];

P        = mode_params(MODE);
SEAT_Z   = P[0];
BACK_ANG = P[1];
LEG_OUT  = P[2];
FOOT_DROP= P[3];
SPLIT    = P[4];
TILT     = P[5];

// ---------- farger ----------
C_FRAME = [0.42, 0.40, 0.38];   // varm grå RAL 7044-ish
C_PAD   = [0.82, 0.76, 0.64];   // havre
C_ACC   = [0.85, 0.20, 0.15];   // akutt-rød
C_METAL = [0.75, 0.76, 0.78];
C_TPE   = [0.25, 0.25, 0.27];

module rounded_box(s, r=15) {
    hull() for (x=[r, s[0]-r], y=[r, s[1]-r])
        translate([x, y, 0]) cylinder(r=r, h=s[2]);
}

// ---------- chassis ----------
module base() {
    color(C_FRAME) translate([0, -BASE_W/2, WHEEL_D*0.6]) rounded_box([BASE_L, BASE_W, BASE_H], 40);
    // hjul
    color(C_TPE) for (x=[90, BASE_L-90], y=[-BASE_W/2+60, BASE_W/2-60])
        translate([x, y, WHEEL_D/2]) rotate([90,0,0]) cylinder(d=WHEEL_D, h=45, center=true);
    // 5. hjul
    color(C_TPE) translate([BASE_L/2, 0, WHEEL_D/2]) rotate([90,0,0]) cylinder(d=WHEEL_D*0.8, h=40, center=true);
}

// ---------- tvillingsøyler ----------
COL_TOP = SEAT_Z - PAD_T - 60;  // toppen av søylene under seterammen
module columns() {
    z0 = WHEEL_D*0.6 + BASE_H;
    for (dx=[-COL_GAP/2, COL_GAP/2]) {
        h = COL_TOP - z0 + dx*tan(-TILT)*0.0;
        color(C_METAL) translate([SEAT_X - SEAT_D/2 + dx - COL_W/2, -COL_W/2, z0])
            // 3 trinn, synlig teleskop
            for (i=[0:2]) translate([i*6, i*6, i*h/3]) cube([COL_W-i*12, COL_W-i*12, h/3+1]);
    }
}

// ---------- sete (hestesko, delt) ----------
module seat_cut() {
    // hesteskoåpning: halvsirkel bak + rett kanal ut til fremkant (x = SEAT_D)
    translate([SEAT_D - HOLE_D + HOLE_R, 0, -1]) hull() {
        for (y=[-HOLE_W/2 + HOLE_R, HOLE_W/2 - HOLE_R]) translate([0, y, 0]) cylinder(r=HOLE_R, h=PAD_T+2);
        translate([HOLE_D - HOLE_R, -HOLE_W/2, 0]) cube([1, HOLE_W, PAD_T+2]);
    }
}
module seat_half(side) {
    // side = -1 (venstre) / +1 (høyre): halvparten av hesteskosetet
    intersection() {
        difference() { translate([0, -SEAT_W/2, 0]) rounded_box([SEAT_D, SEAT_W, PAD_T], 20); seat_cut(); }
        translate([-1, side < 0 ? -SEAT_W : 0, -1]) cube([SEAT_D+2, SEAT_W, PAD_T+2]);
    }
}
module seat() {
    color(C_PAD) {
        translate([0, -SPLIT, 0]) seat_half(-1);
        translate([0,  SPLIT, 0]) seat_half(1);
    }
    // seteramme
    color(C_FRAME) translate([0, -SEAT_W/2, -40]) rounded_box([SEAT_D, SEAT_W, 40], 10);
}

// ---------- ryggstøtte med topprulle ----------
module backrest() {
    color(C_PAD) {
        translate([-BACK_L, -SEAT_W/2, 0]) rounded_box([BACK_L, SEAT_W, PAD_T], 25);
        translate([-BACK_L, 0, PAD_T/2]) rotate([90,0,0]) cylinder(d=120, h=SEAT_W, center=true);
    }
    color(C_FRAME) translate([-BACK_L, -SEAT_W/2, -30]) cube([BACK_L, SEAT_W, 30]);
}

// ---------- benseksjon (uttrekk) ----------
module legsection() {
    color(C_PAD) translate([0, -SEAT_W/2, 0]) rounded_box([LEG_L, SEAT_W, PAD_T*0.8], 25);
}

// ---------- fotbrett (parallellogram) ----------
module footboard() {
    color(C_FRAME) for (y=[-SEAT_W/2+20, SEAT_W/2-40]) translate([SEAT_D-20, y, -FOOT_DROP+PAD_T]) cube([20, 20, FOOT_DROP-PAD_T]);
    color(C_TPE) translate([SEAT_D-20, -SEAT_W/2, -FOOT_DROP+PAD_T-25]) rounded_box([FOOT_D, SEAT_W, 25], 10);
}

// ---------- QBL-trakt og veieskuff ----------
module qbl() {
    color([0.9,0.9,0.92,0.7]) translate([SEAT_D - HOLE_D/2 - 20, 0, -260])
        cylinder(d1=140, d2=280, h=200);
    color(C_METAL) translate([SEAT_D - HOLE_D/2 - 110, -110, -300]) cube([220, 220, 40]); // lastcelle-plate
}

// ---------- AKUTT-spak ----------
module emergency_levers() {
    color(C_ACC) for (s=[-1,1]) translate([-120, s*(RAIL_W/2 + 20), -220]) rotate([0, 20, 0]) cylinder(d=28, h=180);
}

// ---------- sideskinner ----------
module rails() {
    color(C_METAL) for (s=[-1,1]) translate([-200, s*RAIL_W/2 - 12, -50]) cube([SEAT_D + 200, 25, 10]);
    color(C_FRAME) for (s=[-1,1]) translate([SEAT_D/2, s*(SEAT_W/2 + (RAIL_W-SEAT_W)/4), -45]) cube([60, (RAIL_W-SEAT_W)/2, 20], center=true);
}

// ---------- U-bøyle ----------
module ubar() {
    color(C_METAL) {
        for (s=[-1,1]) translate([SEAT_D*0.35, s*(RAIL_W/2-12), -50]) cylinder(d=32, h=950);
        translate([SEAT_D*0.35, 0, 900]) rotate([90,0,0]) cylinder(d=32, h=RAIL_W-24, center=true);
    }
    color(C_PAD) translate([SEAT_D*0.35, 0, 900]) rotate([90,0,0]) cylinder(d=60, h=400, center=true);
}

// ---------- LED-list ----------
module led() {
    color([1,0.95,0.8]) translate([SEAT_D-5, -150, -PAD_T+10-60]) cube([8, 300, 12]);
}

// ---------- jordmors sadelstol ----------
module midwife_stool() {
    h = max(SEAT_Z - 180, 500);
    translate([SEAT_X + SEAT_D/2 + 650, 0, 0]) {
        color(C_TPE) cylinder(d=550, h=40);
        color(C_METAL) cylinder(d=50, h=h);
        color(C_PAD) translate([0,0,h]) scale([1, 0.8, 0.35]) sphere(d=380);
    }
}

// ---------- montering ----------
base();
columns();
translate([SEAT_X - SEAT_D, 0, SEAT_Z - PAD_T]) rotate([0, TILT, 0]) {
    seat();
    rails();
    led();
    emergency_levers();
    // rygg pivoterer om setets bakkant
    rotate([0, BACK_ANG, 0]) backrest();
    if (LEG_OUT) translate([SEAT_D, 0, 0]) rotate([0, MODE=="halvsittende" ? 15 : 0, 0]) legsection();
    if (FOOT_DROP > 0) footboard();
    if (MODE == "krakk" || MODE == "kne") qbl();
    if (SHOW_UBAR && MODE == "krakk") ubar();
}
if (SHOW_MIDWIFE_STOOL && (MODE == "krakk" || MODE == "halvsittende" || MODE == "kne")) midwife_stool();
