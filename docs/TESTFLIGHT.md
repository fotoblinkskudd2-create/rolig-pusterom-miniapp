# Signering og TestFlight

Ingenting av dette er gjort eller testet i byggemiljøet (Linux, ingen Xcode, ingen Apple-konto).
Stegene er for deg på en Mac.

## Du trenger

- Mac med Xcode 16 eller nyere (prosjektet bruker filsystem-synkroniserte grupper, `objectVersion = 77`).
- Apple Developer Program-medlemskap (betalt) for TestFlight.
- En backend tilgjengelig over **HTTPS** (TestFlight-bygg kan ikke snakke med `localhost`).

## 1. Åpne og kjør i simulator

```bash
cd ios
open Antipsykologen.xcodeproj
```

Velg skjemaet **Antipsykologen** og en iPhone-simulator. `Debug.xcconfig` peker på `http://localhost:8080`,
så start backend først (se README). Kjør testene med ⌘U eller:

```bash
xcodebuild test -project ios/Antipsykologen.xcodeproj -scheme Antipsykologen \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

(Hvis Xcode-versjonen din ikke åpner prosjektfilen: installer XcodeGen og kjør `xcodegen` i `ios/`;
`ios/project.yml` beskriver samme prosjekt.)

## 2. Signering

1. Xcode → prosjektet → target **Antipsykologen** → *Signing & Capabilities*.
2. Velg ditt *Team*. La «Automatically manage signing» stå på.
3. Endre *Bundle Identifier* fra `no.antipsykologen.app` til en ID du eier (f.eks. `no.dittfirma.antipsykologen`).
   Gjør det samme for testmålet (`…Tests`).
4. Kjør på en tilkoblet iPhone én gang for å bekrefte signeringen.

## 3. (Valgfritt) Sign in with Apple

1. *Signing & Capabilities* → **+ Capability** → *Sign in with Apple*.
2. Sett `APPLE_SIGN_IN_ENABLED = YES` i `ios/Support/Release.xcconfig` (og `Debug.xcconfig` om ønsket).
3. Sett `APPLE_BUNDLE_ID=<din bundle-ID>` i backendens miljø.

Uten dette bruker appen en anonym konto knyttet til enheten (Keychain).

## 4. Produksjonsbackend

1. Driftsett backend med PostgreSQL bak HTTPS (Dockerfile i `backend/`). Sett `NODE_ENV=production`,
   `MODEL_PROVIDER=anthropic`, `ANTHROPIC_API_KEY`, `DATABASE_URL`, og `TRUST_PROXY=true` bak en proxy.
2. Kontroller `GET https://<din-host>/readyz` → `{"ok":true,"db":"ok","provider":"anthropic"}`.
3. Sett `API_BASE_URL = https:/$()/<din-host>` i `ios/Support/Release.xcconfig`.

## 5. App Store Connect

1. <https://appstoreconnect.apple.com> → *Apper* → **+** → *Ny app*. Plattform iOS, samme bundle-ID.
2. Fyll inn personvernerklæring-URL (basert på `docs/PRIVACY.md`) og App Privacy-skjemaet:
   «Brukerinnhold – andre brukerinnhold», brukt til appfunksjonalitet, knyttet til en (anonym) bruker-ID, ikke sporing.
3. Eksportsamsvar: appen bruker bare standard HTTPS. Sett `ITSAppUsesNonExemptEncryption = NO` i Info.plist
   hvis det stemmer for din distribusjon (ikke satt i repoet, siden det er ditt juridiske valg).
4. Appikon: legg inn et 1024×1024-ikon i `Assets.xcassets/AppIcon` (mangler i repoet; arkivering feiler uten).

## 6. Arkiver og last opp

1. Xcode: velg *Any iOS Device (arm64)* → *Product* → *Archive*.
2. *Organizer* → *Distribute App* → *App Store Connect* → *Upload*.
3. Vent på behandling (typisk 10–30 min), så: App Store Connect → *TestFlight*.
4. Interne testere: legg dem til direkte. Eksterne: krever Beta App Review.

Kommandolinje (alternativ):

```bash
xcodebuild -project ios/Antipsykologen.xcodeproj -scheme Antipsykologen -configuration Release \
  -archivePath build/Antipsykologen.xcarchive archive
xcodebuild -exportArchive -archivePath build/Antipsykologen.xcarchive \
  -exportOptionsPlist ExportOptions.plist -exportPath build/export
# Skann den bygde bundlen for nøkler før opplasting:
cd backend && npm run scan:secrets -- ../build/Antipsykologen.xcarchive/Products/Applications/Antipsykologen.app
```

## 7. Før eksterne testere

- Kontroller hjelpetilbudene manuelt (`docs/SAFETY.md`).
- Kjør samtaleevalueringene mot ekte modell (`npm run evals`) og les svarene, ikke bare tallet.
- Test på en liten iPhone (SE) med største tekststørrelse og VoiceOver.
