# Wdrożenie na Vercelu

Vercel buduje publiczną część witryny z repozytorium. Pliki z `public/` trafiają do katalogu wynikowego, a `api/vercel-site.ts` renderuje strony z tych samych szablonów i danych, których używa wariant Cloudflare Workers. Linki kanoniczne publicznych stron odpowiadają adresowi używanemu przez odwiedzającego.

Publiczne wpisy bloga, dodane w panelu zdjęcia i panel administracyjny korzystają z dotychczasowego backendu Sites. Gdy API wpisów jest chwilowo niedostępne, strona główna, katalog podstron i mapa witryny nadal pokazują treści z repozytorium. Wdrożenie Vercela nie wymaga publikowania nowej wersji projektu w Sites ani migracji jego danych.

Panel dostępny jest pod `/admin`. Funkcja sprawdza Origin przy żądaniach zmieniających dane, a następnie przekazuje je do istniejącego serwera, który nadal sprawdza sesję, MFA i token CSRF. Nie należy wyłączać tych zabezpieczeń. Hasła i klucze pozostają wyłącznie w konfiguracji Sites; nie dodawaj ich do repozytorium ani konfiguracji Vercela.

Vercel nakłada limit 4,5 MB na treść żądania i odpowiedzi funkcji. Dlatego przez adres Vercela zdjęcia zbliżone do 5 MB mogą zostać odrzucone pomimo dotychczasowego limitu panelu; takie pliki należy zmniejszyć lub dodać przez oryginalny adres w Sites.

Po połączeniu repozytorium z Vercel projekt powinien użyć `vercel.json` z głównego katalogu. Jeśli w ustawieniach projektu ustawiono ręczne nadpisanie poleceń budowania lub katalogu wyjściowego, trzeba usunąć te nadpisania. Weryfikacja lokalna: `node --test tests/vercel-proxy.test.mjs` i `node scripts/build-vercel-proxy.mjs`. Sama weryfikacja lokalna nie potwierdza poprawnego wdrożenia i routingu na koncie Vercela.
