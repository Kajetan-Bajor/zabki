# Parafia Świętej Trójcy w Ząbkach

Samodzielna aplikacja Next.js uruchamiana na Vercelu z kodu w tym repozytorium. Strony, przekierowania, blog i panel `/admin` obsługiwane są przez aplikację. Zdjęcia i fonty strony znajdują się w `public/`.

## Uruchomienie

Wymagany Node.js 22.13 lub nowszy. Uruchom `npm ci`, następnie `npm run dev`. Produkcyjny build: `npm run build`, start: `npm start`.

Strony publiczne można uruchomić bez bazy; blog używa wówczas wyłącznie treści startowych z repozytorium. Panel i zapis danych wymagają PostgreSQL. Przy skonfigurowanej bazie błędy połączenia nie są ukrywane przez przełączenie na treści startowe.

## Baza i panel

1. Utwórz bazę PostgreSQL w Supabase, ustaw jej poufny adres połączenia jako `DATABASE_URL` lokalnie w `.env` i w Vercelu. Używaj szyfrowanego połączenia wymaganego przez dostawcę.
2. Uruchom `npm run db:migrate` ze zmienną bazy. Migracja zakłada tabele i jest bezpieczna do ponownego uruchomienia.
3. Wpisz własne `ADMIN_USERNAME`, `ADMIN_PASSWORD` i `SITE_ORIGIN` do lokalnego `.env`, następnie `npm run admin:prepare`.
4. Przenieś `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SECRET_KEY` i `SITE_ORIGIN` z `.env.admin` do zmiennych Vercela. Hasła jawnego nie umieszczaj w repozytorium. Wdróż ponownie aplikację po zmianach zmiennych.
5. Pierwsze logowanie pod `/admin` konfiguruje TOTP i kody odzyskiwania. Zachowaj `ADMIN_SECRET_KEY` przy zmianie hasła.

Baza przechowuje wpisy, sesje, ograniczenia prób logowania, MFA i przesłane zdjęcia. Pliki zdjęć mają limit 3 MB, zgodny z limitem żądań funkcji Vercela. Dysk funkcji nie służy jako trwały magazyn.

Przed zmianą dotychczasowego hostingu wyeksportuj istniejące wpisy i media z dotychczasowej bazy i zaimportuj do nowej. Repozytorium nie zawiera danych produkcyjnych, sekretów ani sesji. Nowa baza jest początkowo pusta; poprzednie konta MFA wymagają migracji wraz z kluczem lub ponownej konfiguracji.

## Wdrożenie

Podłącz to repozytorium do projektu Vercel jako Next.js. `vercel.json` deklaruje `npm ci` i `npm run build`. Usuń w ustawieniach projektu stare nadpisania katalogu wyjściowego; używaj domyślnego `.next`. Ustaw `SITE_ORIGIN` na właściwy publiczny adres HTTPS, np. `https://zabki.vercel.app`.

Konfiguracja Supabase: `internal/SUPABASE.md`.

Przegląd treści do potwierdzenia: `internal/CONTENT_REVIEW.md`.
