# Panel administratora

Panel bloga działa wyłącznie pod `/admin`. Nie wymaga konta ChatGPT. Wymaga własnego loginu i hasła oraz kodu TOTP lub jednorazowego kodu odzyskiwania. Obsługuje dwie kategorie, szkice, publikację natychmiastową i zaplanowaną, edycję, zdjęcia, podgląd treści, wyszukiwanie i kosz z przywracaniem jako szkic.

## Własne dane

1. Otwórz lokalny `.env`, wpisz `ADMIN_USERNAME` i `ADMIN_PASSWORD` (minimum 16 znaków hasła). Wartości można ująć w podwójne cudzysłowy; znaki `$` są traktowane dosłownie przez skrypt.
2. Uruchom `npm run admin:prepare`. Skrypt odrzuci puste dane, przygotuje solony hash PBKDF2 i zapisze go do lokalnego `.dev.vars`. Zachowa istniejący `ADMIN_SECRET_KEY`, dzięki czemu dotychczasowy authenticator nadal działa. Nie wypisuje sekretów. Nie zmienia publicznej strony.
3. Zastosuj przygotowane wartości z `.sites-runtime/admin-secrets.json` przez narzędzie Sites do zmiennych środowiskowych; login i hash muszą mieć `is_secret: true`. Eksport pomija istniejący klucz MFA, aby go nie nadpisać na produkcji; zawiera nowy klucz wyłącznie przy pierwszej konfiguracji. Opublikuj wersję strony, aby aktywować nową konfigurację. Można zlecić ten krok w bieżącym czacie po uzupełnieniu pliku, bez wklejania hasła do wiadomości.

Na produkcji używane są `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SECRET_KEY` i `SITE_ORIGIN`. Zwykłe hasło z `ADMIN_PASSWORD` jest tylko wejściem lokalnego przygotowania; nie jest umieszczane w kodzie, wysyłane do przeglądarki ani zapisywane w publicznym archiwum. `.env`, `.dev.vars` i `.sites-runtime/` są wyłączone z Git i publikacji.

Nie usuwaj istniejącego klucza MFA podczas zmiany hasła. Jego zmiana wymaga osobnej migracji lub odzyskania MFA. Wartości w `.env.example` są puste i same nie umożliwiają logowania. Zmiana loginu lub hasha unieważnia dotychczasowe sesje.

Po pierwszej konfiguracji MFA zapisz kody odzyskiwania w bezpiecznym miejscu. Nie ma publicznego formularza rejestracji ani odzyskiwania hasła, który mógłby zmienić dane administratora.
