# Panel administratora

Panel dostępny jest pod `/admin`. Własny login i hasło są weryfikowane po stronie serwera. Wymagane jest także TOTP albo kod odzyskiwania. Ustawienie zmiennych i migrację PostgreSQL opisuje README.

Hasło przechowujemy jako PBKDF2-SHA256 (600 000 iteracji, losowa sól), sekrety MFA są szyfrowane kluczem `ADMIN_SECRET_KEY`. Nie zmieniaj tego klucza bez migracji MFA. Sesje korzystają z ciasteczek HttpOnly, Secure i SameSite=Strict. Operacje zapisu wymagają poprawnego Origin i tokenu CSRF. Zapytania SQL używają parametrów. Ograniczenia prób logowania są trwałe i wspólne dla instancji.

Brak konfiguracji bazy lub poświadczeń blokuje logowanie. Nie umieszczaj `.env` ani `.env.admin` w Git. Przesłane zdjęcia (do 3 MB) są przechowywane w PostgreSQL.
