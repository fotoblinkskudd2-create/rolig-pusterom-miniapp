import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SafetyCategory, SafetyLevel } from "../model/provider.js";
import { levelAtLeast } from "./screener.js";

const here = path.dirname(fileURLToPath(import.meta.url));

export interface Resource {
  id: string;
  name: string;
  phone: string;
  chatUrl?: string;
  hours: string;
  description: string;
  categories: SafetyCategory[];
  minLevel: SafetyLevel;
  source: string;
}

export interface ResourceConfig {
  country: string;
  checkedDate: string;
  verifiedBy: string | null;
  outsideNorway: string;
  resources: Resource[];
}

export const RESOURCE_CONFIG: ResourceConfig = JSON.parse(
  readFileSync(path.resolve(here, "../../config/hjelpetilbud.no.json"), "utf8"),
);

/** Velger hjelpetilbud for et sikkerhetsnivå og kategorier. Tom liste under «concern». */
export function resourcesFor(level: SafetyLevel, categories: SafetyCategory[]): Resource[] {
  if (!levelAtLeast(level, "concern")) return [];
  const cats = categories.length ? categories : (["self_harm", "violence_victim"] as SafetyCategory[]);
  return RESOURCE_CONFIG.resources.filter(
    (r) => levelAtLeast(level, r.minLevel) && r.categories.some((c) => cats.includes(c)),
  );
}
