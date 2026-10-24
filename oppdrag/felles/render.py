"""Rendrer STL/glTF-filer med Blender (bpy, Cycles på CPU). Kjøres som egen prosess:
    python3 render.py spec.json
spec: {"utfil": "x.png", "bredde": 1200, "hoyde": 900, "samples": 32,
       "objekter": [{"fil": "del.stl", "farge": [0.8,0.3,0.2], "posisjon": [0,0,0], "rotasjon_grader": [0,0,0], "metall": 0.0}],
       "kamera": {"retning": [1,-1.2,0.8], "orto": false, "avstandsfaktor": 2.2}, "bakgrunn": [0.95,0.95,0.95], "gulv": true}
Mål i filene tolkes som millimeter og skaleres til meter."""
import json
import math
import sys

import bpy
from mathutils import Vector

spec = json.load(open(sys.argv[1], encoding="utf-8"))
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
objekter = []
for o in spec["objekter"]:
    for x in list(bpy.context.selected_objects):
        x.select_set(False)
    if o["fil"].endswith(".stl"):
        bpy.ops.wm.stl_import(filepath=o["fil"])
    elif o["fil"].endswith((".glb", ".gltf")):
        bpy.ops.import_scene.gltf(filepath=o["fil"])
    ob = bpy.context.selected_objects[0]
    ob.scale = (0.001, 0.001, 0.001)
    ob.location = [v * 0.001 for v in o.get("posisjon", [0, 0, 0])]
    ob.rotation_euler = [math.radians(v) for v in o.get("rotasjon_grader", [0, 0, 0])]
    m = bpy.data.materials.new("m")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*o.get("farge", [0.7, 0.7, 0.7]), 1)
    b.inputs["Metallic"].default_value = o.get("metall", 0.0)
    b.inputs["Roughness"].default_value = o.get("ruhet", 0.45)
    ob.data.materials.append(m)
    if o.get("glatt", True):
        for p in ob.data.polygons:
            p.use_smooth = False
    objekter.append(ob)
bpy.context.view_layer.update()
pkt = [ob.matrix_world @ Vector(c) for ob in objekter for c in ob.bound_box]
mn = Vector((min(p.x for p in pkt), min(p.y for p in pkt), min(p.z for p in pkt)))
mx = Vector((max(p.x for p in pkt), max(p.y for p in pkt), max(p.z for p in pkt)))
senter, radius = (mn + mx) / 2, max((mx - mn).length / 2, 1e-4)
k = spec.get("kamera", {})
retning = Vector(k.get("retning", [1, -1.2, 0.8])).normalized()
bpy.ops.object.camera_add(location=senter + retning * radius * k.get("avstandsfaktor", 3.0))
kam = bpy.context.object
kam.rotation_euler = (senter - kam.location).to_track_quat("-Z", "Y").to_euler()
kam.data.clip_start, kam.data.clip_end = radius / 100, radius * 50
if k.get("orto"):
    kam.data.type = "ORTHO"
    kam.data.ortho_scale = radius * 2.3
sc.camera = kam
if spec.get("gulv", True):
    bpy.ops.mesh.primitive_plane_add(size=radius * 40, location=(senter.x, senter.y, mn.z - radius * 0.002))
    g = bpy.data.materials.new("g"); g.use_nodes = True
    g.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*spec.get("gulvfarge", [0.55, 0.56, 0.58]), 1)
    bpy.context.object.data.materials.append(g)
bpy.ops.object.light_add(type="SUN", location=senter + Vector((1, -1, 3)) * radius)
bpy.context.object.data.energy = spec.get("sol", 2.5)
bpy.context.object.rotation_euler = (math.radians(40), math.radians(15), math.radians(30))
bpy.ops.object.light_add(type="AREA", location=senter + Vector((-2, -2, 2)) * radius)
# Lysstyrke skaleres med avstand² slik at små og store scener får samme belysning
bpy.context.object.data.energy = spec.get("fyll", 25.0) * ((Vector((-2, -2, 2)) * radius).length) ** 2
bpy.context.object.data.size = radius * 3
bpy.context.object.rotation_euler = (senter - bpy.context.object.location).to_track_quat("-Z", "Y").to_euler()
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (*spec.get("bakgrunn", [0.95, 0.95, 0.95]), 1)
w.node_tree.nodes["Background"].inputs[1].default_value = spec.get("himmel", 0.35)
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = spec.get("samples", 32)
sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = spec.get("bredde", 1200), spec.get("hoyde", 900)
sc.render.filepath = spec["utfil"]
try:
    sc.view_settings.view_transform = "AgX"
except TypeError:
    sc.view_settings.view_transform = "Filmic"
bpy.ops.render.render(write_still=True)
print("rendret", spec["utfil"])
