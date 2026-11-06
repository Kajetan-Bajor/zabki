# Supabase i Vercel

1. Utwórz projekt Supabase, najlepiej w regionie bliskim użytkownikom. Zachowaj hasło bazy w menedżerze haseł.
2. W panelu **Connect** skopiuj adres PostgreSQL z **Transaction pooler** (port 6543). Uzupełnij hasło zgodnie z instrukcją panelu; znaki specjalne w haśle muszą być zakodowane jako część URL. Połączenie ma wymagać TLS (`sslmode=require`).
3. Zapisz ten adres jako sekretną zmienną `DATABASE_URL` w Vercelu i lokalnym `.env`. Nigdy nie używaj prefiksu `NEXT_PUBLIC_`.
4. Opcjonalnie ustaw lokalnie `DATABASE_MIGRATION_URL` na adres **Session pooler** (5432) z TLS. Migrator użyje go zamiast `DATABASE_URL`.
5. Uruchom `npm ci` i `npm run db:migrate`. Skrypt tworzy tabele tylko raz i zapisuje numer migracji. Można go uruchomić ponownie.
6. Przygotuj dane administratora według README. Dodaj do Vercela `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SECRET_KEY` i `SITE_ORIGIN=https://zabki.vercel.app` (lub właściwy adres domeny).
7. Wdróż aplikację ponownie, otwórz `/admin` i skonfiguruj TOTP. Dodaj wpis testowy, sprawdź publikację, edycję i zdjęcie, a następnie usuń wpis.

Kod używa `pg` z niewielką pulą połączeń i zapytań parametryzowanych bez nazwanych prepared statements, zgodnie z wymaganiami Transaction pooler. Wszystkie dane aplikacji, również zdjęcia do 3 MB, przechowywane są w PostgreSQL. Supabase Auth i Storage nie są wymagane. Używamy własnego logowania administratora.

Migracja włącza RLS i odbiera rolom przeglądarkowym `anon` oraz `authenticated` dostęp do tabel aplikacji. Dostęp odbywa się wyłącznie przez serwer i jego poufne połączenie. Adres połączenia skopiowany z panelu powinien korzystać z roli właściciela bazy, która może wykonać migrację i obsługiwać serwer.

Nowy projekt Supabase nie zawiera danych wcześniejszego hostingu. Przed jego wyłączeniem wyeksportuj wpisy i media oraz zaimportuj je do nowych tabel. Nie kasuj starych danych przed sprawdzeniem kopii. Ten commit nie tworzy projektu Supabase i nie ustawia sekretów w Vercelu.

Dokumentacja: https://supabase.com/docs/guides/database/connecting-to-postgres oraz https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers
