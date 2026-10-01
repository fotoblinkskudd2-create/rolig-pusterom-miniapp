# Claude Code: utfør oppgaven

Start Claude Code i pakkens rotmappe. Les CLAUDE.md, FELLES-KONTRAKT.md, KVALITET.md og valgt oppgave. Bruk den definerte app-builder til avgrenset implementering og app-reviewer til uavhengig review når prosjektagenter er tilgjengelige.

Hovedagenten eier planen, felles filvalg, integrasjon, testkjøring og endelig status. Builder får full spesifikasjon, arbeidsmappe, testeksempel og ferdigkrav. Reviewer får samme krav, den faktiske diffen og testbevis. Review skal gi avvik med fil, konsekvens og konkret retting. Hovedagenten retter og kjører relevante kontroller igjen.

Ingen to skrivende agenter får samme appmappe. Ikke la underagenter endre felles pakkeoppsett uten hovedagentens integrasjon. Bruk sekvensiell gjennomføring dersom underagenter ikke finnes i installasjonen; ikke stopp hele oppgaven av den grunn.

Hold fremdrift i rapporter/<app-id>/STATUS.md og KJOEREPLAN.md. Bevar brukerens prosjekt dersom et eksisterende repo er gitt. Ikke påstå at en utestet native funksjon virker fordi den er beskrevet i README. Avslutt med faktisk kode, kjørt testbevis og eksplisitt iOS-status.

Les FELLES-KONTRAKT.md, KVALITET.md og oppgaver/<app-id>.md. Behold selvstendige appmapper. Status og bevis er obligatorisk.
