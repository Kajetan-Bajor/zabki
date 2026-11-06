# Vercel

Aplikacja działa bezpośrednio jako Next.js w środowisku Node.js. Publiczne pliki obsługuje katalog `public/`. Trasy serwerowe obsługują strony, blog, media i panel.

Ustaw `DATABASE_URL`, `SITE_ORIGIN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` i `ADMIN_SECRET_KEY`. Uruchom migrację bazy według README. Po zmianie zmiennych wdroż aplikację ponownie. Usuń wcześniejsze nadpisania komend i katalogu wyjściowego z ustawień projektu Vercel; obowiązuje konfiguracja Next.js z repozytorium.

Nie usuwaj starej bazy ani plików przed ich eksportem i sprawdzeniem migracji. Migracja SQL tworzy schemat, nie kopiuje automatycznie danych z poprzedniego hostingu.
