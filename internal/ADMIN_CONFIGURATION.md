# Panel administratora

Panel dostępny jest pod `/admin`. Panel obsługuje konto właściciela i odrębne konta administratorów. Każde konto ma własne hasło, sesje i MFA. Wymagane jest także TOTP albo kod odzyskiwania. Ustawienie zmiennych i migrację PostgreSQL opisuje README.

Hasło przechowujemy jako PBKDF2-SHA256 (600 000 iteracji, losowa sól), sekrety MFA są szyfrowane kluczem `ADMIN_SECRET_KEY`. Nie zmieniaj tego klucza bez migracji MFA. Sesje korzystają z ciasteczek HttpOnly, Secure i SameSite=Strict. Operacje zapisu wymagają poprawnego Origin i tokenu CSRF. Zapytania SQL używają parametrów. Ograniczenia prób logowania są trwałe i wspólne dla instancji.

Brak konfiguracji bazy lub poświadczeń blokuje logowanie. Nie umieszczaj `.env` ani `.env.admin` w Git. Przesłane zdjęcia (do 3 MB) są przechowywane w PostgreSQL.


## Dodanie odrębnego administratora

1. Zastosuj migracje z tej gałęzi w bazie używanej przez panel, przed wdrożeniem kodu logowania. Migracja zachowuje istniejące poświadczenia i MFA właściciela.
2. W bezpiecznym środowisku operatora ustaw `DATABASE_URL`, dotychczasowy `ADMIN_USERNAME` oraz `ADMIN_ACCOUNT_USERNAME` i `ADMIN_ACCOUNT_PASSWORD` nowego konta. Skorzystaj z menedżera haseł lub lokalnego ignorowanego przez Git pliku `.env` z uprawnieniami tylko dla właściciela. Zmienne `ADMIN_ACCOUNT_*` służą do jednorazowego utworzenia konta.
3. Uruchom `npm run admin:add-account`. Polecenie odrzuca duplikaty. Hasło zapisuje się w bazie jako hash.
4. Przekaż dane logowania bezpiecznym kanałem. Użytkownik loguje się do `/admin`, konfiguruje własną aplikację TOTP i zapisuje kody odzyskiwania. Konto ma dostęp do tego samego panelu, w tym do tworzenia, edycji, zdjęć i publikacji wpisów.
