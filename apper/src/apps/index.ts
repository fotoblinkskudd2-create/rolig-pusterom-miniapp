import type { ComponentType } from 'react'
import Gjeldsknuser from './Gjeldsknuser'
import Delene from './Delene'
import Impulsbrems from './Impulsbrems'
import Skiftsovn from './Skiftsovn'
import Tinnitusro from './Tinnitusro'
import Surdeigsvakt from './Surdeigsvakt'
import Gjaering from './Gjaering'
import Vinylhylla from './Vinylhylla'
import Dagstripe from './Dagstripe'
import Hyttebygger from './Hyttebygger'
import Klatrelogg from './Klatrelogg'
import Korsband from './Korsband'
import Bekkenbunn from './Bekkenbunn'
import Samvaer from './Samvaer'
import Feberlogg from './Feberlogg'
import Humorvaer from './Humorvaer'
import Tankefelle from './Tankefelle'
import Edru from './Edru'
import Ringerunde from './Ringerunde'
import Snekkerkalk from './Snekkerkalk'
import Boligkalk from './Boligkalk'
import Frilanskalk from './Frilanskalk'
import Besluttet from './Besluttet'
import Sekkevekt from './Sekkevekt'
import Snakkebrett from './Snakkebrett'

/** id i concepts.json → komponent */
export const APPS: Record<string, ComponentType> = {
  gjeldsknuser: Gjeldsknuser,
  delene: Delene,
  impulsbrems: Impulsbrems,
  skiftsovn: Skiftsovn,
  tinnitusro: Tinnitusro,
  surdeigsvakt: Surdeigsvakt,
  gjaering: Gjaering,
  vinylhylla: Vinylhylla,
  dagstripe: Dagstripe,
  hyttebygger: Hyttebygger,
  klatrelogg: Klatrelogg,
  korsband: Korsband,
  bekkenbunn: Bekkenbunn,
  samvaer: Samvaer,
  feberlogg: Feberlogg,
  humorvaer: Humorvaer,
  tankefelle: Tankefelle,
  edru: Edru,
  ringerunde: Ringerunde,
  snekkerkalk: Snekkerkalk,
  boligkalk: Boligkalk,
  frilanskalk: Frilanskalk,
  besluttet: Besluttet,
  sekkevekt: Sekkevekt,
  snakkebrett: Snakkebrett,
}
