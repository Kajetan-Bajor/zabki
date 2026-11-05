# Wdrożenie na Vercelu

Repozytorium zawiera dwa warianty uruchomienia. ChatGPT Sites buduje aplikację dla Cloudflare Workers. Konfiguracja `vercel.json` uruchamia na Vercelu niewielką funkcję pośredniczącą, która przekazuje żądania do istniejącej opublikowanej strony parafii w Sites. Vercel nie buduje projektu jako Next.js, więc nie wymaga `.next/routes-manifest.json`.

Adres Vercela działa jako dodatkowy adres tej samej strony: treści, blog, zdjęcia i panel administratora korzystają z tej samej bazy i konfiguracji konta w Sites. Działanie adresu Vercela zależy więc od dostępności strony w Sites. To nie jest niezależna migracja bazy i plików na Vercel. Kanoniczne adresy w HTML pozostają adresami Sites.

Panel dostępny jest pod `/admin`. Funkcja sprawdza Origin przy żądaniach zmieniających dane, a następnie przekazuje je do istniejącego serwera, który nadal sprawdza sesję, MFA i token CSRF. Nie należy wyłączać tych zabezpieczeń. Hasła i klucze pozostają wyłącznie w konfiguracji Sites; nie dodawaj ich do repozytorium ani konfiguracji Vercela.

Vercel nakłada limit 4,5 MB na treść żądania i odpowiedzi funkcji. Dlatego przez adres Vercela zdjęcia zbliżone do 5 MB mogą zostać odrzucone pomimo dotychczasowego limitu panelu; takie pliki należy zmniejszyć lub dodać przez oryginalny adres w Sites.

Po połączeniu repozytorium z Vercel projekt powinien użyć `vercel.json` z głównego katalogu. Jeśli w ustawieniach projektu ustawiono ręczne nadpisanie poleceń budowania lub katalogu wyjściowego, trzeba usunąć te nadpisania. Weryfikacja lokalna: `node --test tests/vercel-proxy.test.mjs` i `node scripts/build-vercel-proxy.mjs`. Sama weryfikacja lokalna nie potwierdza poprawnego wdrożenia i routingu na koncie Vercela.
