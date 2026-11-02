# Aktualizacja z 27 października 2026

Zaktualizowano zestaw frameworka i zależności do wzajemnie zgodnych wersji: Vinext 1.3.1, Vite 8.3.5, React/React DOM/React Server DOM 19.3.1, Next 16.4.3, Cloudflare Vite Plugin 1.65.0, Wrangler 4.153.0, plugin RSC 0.5.38, Zod 4.6.7 i Drizzle Kit 0.31.11. Zależności pośrednie przeliczono w pliku blokady i sprawdzono czystą instalacją `npm ci`.

Wymuszenia wersji w `package.json` uzupełniają aktualizacje pakietów nadrzędnych:

- `miniflare > sharp` 0.35.5: poprawka biblioteki przetwarzania obrazów.
- `undici` 7.30.1: poprawki parserów i obsługi połączeń także w pakietach narzędziowych.
- `fflate` 0.7.5: poprawka ZIP64, zachowująca linię 0.7 używaną przez zależność Satori.
- `@esbuild-kit/core-utils > esbuild` 0.25.12: zastępuje podatny 0.18.20 w przejściowej zależności Drizzle Kit. `drizzle-kit --help` i budowanie projektu sprawdzają zgodność używanego narzędzia. Nie uruchamiano migracji bazy.

Po instalacji pełny `npm audit` i `npm audit --omit=dev` raportują 0 znanych podatności. Nie jest to gwarancja braku innych błędów; przy kolejnej aktualizacji należy ponownie sprawdzić zasadność wymuszeń wersji.

Kontrole funkcjonalne: 77 testów lokalnego bloga i zabezpieczeń, 268 kontroli treści i linków, 342 lokalne kontrole tras/zasobów/nagłówków, 224 widoki w przeglądarce na szerokościach 320–1536 px, dodatkowo pulpit i edytor panelu na 5 szerokościach. W przeglądarce sprawdzono własne logowanie, MFA, zapis szkicu, podgląd, publikację z przyszłą datą, filtr zaplanowanych wpisów, cofnięcie do szkiców, kosz i wylogowanie. Testowe wpisy powstały wyłącznie lokalnie i przeniesiono je do lokalnego kosza.

Panel nie wykorzystuje logowania przez ChatGPT. Konfigurację własnego loginu i hasła opisuje `ADMIN_CONFIGURATION.md`. W tym wdrożeniu nie ustawiano danych wybranych za użytkownika i nie zmieniano sekretów produkcyjnych.

W sekcji informacji homepage usunięto wysokość minimalną 494 px. Cztery teksty kart mają około 175–212 znaków (bez nagłówków i znaczników HTML), zachowują godziny i wyjątki. Karty dopasowują się do treści; akapity rozkładają dostępną przestrzeń, zachowując równy dolny odstęp.
