## Publikacja wersji z instrukcją Kuby

Użytkownik zlecił publikację przygotowanego szkicu na dotychczasowej publicznej stronie ChatGPT Sites. Historia parafii i polityka prywatności pozostają niepublicznymi szkicami; lista braków merytorycznych jest zachowana w `internal/CONTENT_REVIEW.md`. Poniższe wpisy dokumentują wcześniejszy etap lokalnego odbioru.

## Szkic do odbioru — 26 października 2026

Zmiany z instrukcji Kuby przygotowano lokalnie, bez publikacji. Pełna lista braków i zakres kontroli: `internal/CONTENT_REVIEW.md`. Podgląd: `npm run dev -- --host 127.0.0.1 --port 4173`. Obecna publiczna wersja pozostaje bez zmian. Poniższe starsze notatki opisują wcześniejsze etapy projektu.

# Parafia Świętej Trójcy w Ząbkach

Publiczna strona w Sites z trwałym blogiem D1, zdjęciami R2 i panelem `/admin`. Sekcja na stronie głównej zachowuje dotychczasowy układ i dwie zakładki: Ogłoszenia parafialne oraz Słowo na dziś. Trzy dotychczasowe wpisy są zachowane. Wpisy drugiej kategorii dodaje administrator.

## Administracja
Panel umożliwia tworzenie i edycję wpisów, publikację, szkice, zmianę kategorii, zdjęcia JPG/PNG/WebP do 5 MB oraz kosz z przywracaniem jako szkic. Logowanie znajduje się wyłącznie pod `/admin`. Na publicznych stronach nie ma odsyłacza do logowania.

Wymagane zmienne środowiskowe: `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_SECRET_KEY`, `SITE_ORIGIN`. Trzy pierwsze przechowuj jako sekrety Sites. Nie zapisuj hasła ani klucza w źródłach. Format hasha: `pbkdf2-sha256$600000$<16-bajtowa sól hex>$<32-bajtowy hash hex>`. Klucz ma 32 losowe bajty zapisane jako hex. Pierwsze logowanie wymaga konfiguracji aplikacji TOTP i zapisania jednorazowych kodów odzyskiwania.

Sesje są losowe, przechowywane po stronie serwera jako hash, wygasają po 30 minutach bezczynności lub maksymalnie 8 godzinach. Produkcyjne ciasteczka mają Secure, HttpOnly, SameSite=Strict i prefiks __Host-. Zmiana hasha hasła unieważnia sesje. Nie wymieniaj klucza szyfrującego bez procedury migracji konfiguracji TOTP.

Ochrona obejmuje limity prób hasła i TOTP, blokowanie ponownego użycia kodu, CSRF i kontrolę Origin, autoryzację każdej operacji, parametryzowane SQL, kodowanie treści przeciw XSS, CSP i weryfikację przesyłanych zdjęć. Nie jest to gwarancja absolutnego bezpieczeństwa.

## Źródła i lokalny podgląd
- `public/`: oryginalne grafiki, czcionki, wygląd i skrypty strony oraz panelu.
- `lib/blog/`: obsługa bloga, uwierzytelniania, renderowanie i zachowane szablony.
- `db/schema.ts` i `drizzle/`: schemat oraz migracje bez danych.
- `app/`: serwerowe trasy Vinext.
- `.openai/hosting.json`: tożsamość witryny i powiązania DB/BUCKET.

Zainstaluj zależności, zbuduj przez helper Sites, zastosuj migracje do lokalnej bazy i uruchom `npm run dev -- --host 127.0.0.1 --port 4173`. Lokalne sekrety umieść w ignorowanym `.dev.vars`. Lokalna baza jest oddzielna od produkcyjnej.

`tests/blog-security.mjs` to integracyjny test uruchamiany jednorazowo na nowej lokalnej bazie, z lokalnym plikiem danych startowych administratora. Sprawdza pełny przebieg logowania, TOTP, odzyskiwanie, CRUD, CSRF, SQL injection/XSS, szkice, kategorie i zdjęcia. Nie uruchamiaj przeciw bazie produkcyjnej.

Źródło wyglądu: https://nemeris-studio.wixstudio.com/parafia-zabki

## Podstrony po migracji z Wix

`lib/blog/pages-data.json` przechowuje treści podstron oraz przekierowania starych nazw. `pages.ts` renderuje trzy zaakceptowane układy: szczegóły sakramentu/wspólnoty, katalog i informacje. Kalendarium korzysta z układu informacyjnego. Usunięto 32 wydarzenia pochodzące z warszawskiej parafii; lista jest pusta do czasu publikacji zweryfikowanych wydarzeń z Ząbek.

`chrome.ts` tworzy wspólny nagłówek, menu i stopkę każdej publicznej strony. Cały znak parafii (krzyż i nazwa) jest jednym linkiem `/`. Stopka ma naturalną wysokość i przechodzi z czterech do trzech, dwóch i jednej kolumny. Panel `/admin` zachowuje oddzielny widok bez linków logowania na publicznych stronach.

Usunięto treści dotyczące św. Marka na Targówku: wydarzenia, 14 niepotwierdzonych lokalnych wspólnot, historię, patrona, listę ulic, nazwiska i zdjęcia duszpasterzy oraz lokalne harmonogramy sakramentalne. Historię Ząbek opisano na podstawie miejskiego biuletynu jubileuszowego i materiałów miasta o ks. Jerzym Popiełuszce. Szczegóły wspólnot i bieżąca obsada duszpasterska wymagają informacji z parafii. Nieedytowane przykładowe wpisy original-1/2/3 wycofano z publikacji; przy wejściu administratora trafiają do odzyskiwalnego kosza. Wpisy wcześniej zmienione przez administratora zachowano. Źródłowa treść polityki prywatności pozostaje angielskim szablonem Wix i wymaga przygotowania przez właściciela. Jej polski nagłówek i URL to Polityka prywatności /polityka-prywatnosci.

Stare ścieżki zachowanych stron przekierowują statusem 308, z zachowaniem parametrów. Obsługiwany jest również prefiks /parafia-zabki, wielkość liter oraz polskie/ASCII warianty dawnych nazw. Usunięte wydarzenia i obce wspólnoty zwracają 404. Przekierowania domeny Wix wymagają ustawień po stronie Wix.
