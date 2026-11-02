## Korekta odwzorowania homepage

Na wyraźną prośbę użytkownika przywrócono oryginalną sekcję „Wikariusz naszej parafii…” wraz z tekstami z Wix. Zachowano treści Kuby w hero oraz harmonogramach. Przycisk pełnej historii prowadzi do strony zawierającej wyłącznie przywrócone teksty biograficzne z homepage; wcześniejszy status draft historii został zastąpiony tym zakresem. Polityka prywatności pozostaje szkicem. Nie przywrócono fikcyjnych wpisów bloga ani wydarzeń.

## Aktualizacja

Po odbiorze lokalnego szkicu użytkownik polecił publikację na ChatGPT Sites. Nie zmieniono statusu draft historii i polityki prywatności. Pozostałe braki poniżej nadal wymagają informacji od parafii; nie zastąpiono ich domysłami.

# Odbiór treści — instrukcja Kuby, 26 października 2026

Status: lokalny szkic do podglądu. Bez publikacji, synchronizacji z hostingiem, zmiany domeny lub serwera. Publiczna witryna zachowuje dotychczasową wersję.

Źródło wdrożenia: przekazana instrukcja „Uzupełnienie treści strony parafii w Ząbkach”. Pięć dokumentów Word wymienionych w instrukcji nie zostało osobno dostarczonych w tym zadaniu. Do treści nie dodano faktów z istniejącej witryny ani z wyników wyszukiwania. Zewnętrzne strony sprawdzono tylko jako docelowe odnośniki.

## Do potwierdzenia przed publikacją

- Pełna formalna nazwa parafii. W szkicu: „Parafia pw. Świętej Trójcy w Ząbkach”; bez zmiany na Świętego Krzyża.
- Adres kościoła/kancelarii, e-mail i pozycja mapy. Zachowano konfigurację 46 / parafiazabki@gmail.com wyłącznie w szkicu. Adres Saloniku Piłsudskiego 27 opisuje Salonik.
- Dokładne godziny lub zamknięcie kancelarii w pierwsze piątki miesiąca. W szkicu widoczny jest wskazany przez Kubę komunikat o wyjątku; nie podano 9:00–10:30 jako dyżuru pierwszopiątkowego.
- Czy Roraty zastępują Mszę o 7:00 i kiedy dokładnie obowiązuje porządek wakacyjny. Nie dopisano odpowiedzi ani zawężenia do lipca/sierpnia.
- Stałe godziny spowiedzi, pierwszy piątek i dodatkowe terminy.
- Pełna obsada duszpasterska i funkcje. Podano tylko ks. Dariusza Korbika jako proboszcza, na podstawie opisu chóru.
- Zatwierdzona historia parafii oraz opis posługi ks. Jerzego Popiełuszki. Dotychczasową stronę historii zachowano w danych ze statusem draft; nie ma jej w nawigacji ani katalogu publicznych stron.
- Opis wezwania i informacje o odpuście; aktualne granice parafii lub lista ulic.
- Zatwierdzony krótki opis parafii. Strona „O naszej parafii” prowadzi do gotowych informacji.
- Kompletność wykazu wspólnot. W szkicu dokładnie cztery opisane pozycje, bez zapewnienia, że wykaz jest pełny.
- Domowy Kościół: potwierdzenie ewentualnej organizacji lokalnej, spotkań, opiekuna i zapisów. Opublikowany w podglądzie opis dotyczy ruchu ogólnie.
- Salonik: ewentualne godziny i kontakt; warunki zaliczenia wolontariatu wymagają osobnego potwierdzenia. Nie zadeklarowano prowadzenia Saloniku przez parafię ani punktów rekrutacyjnych.
- Wieczory Uwielbienia: miejsce, profil społecznościowy oraz konkretne najbliższe daty i wyjątki. Pokazano wyłącznie termin cykliczny, bez automatycznego tworzenia wydarzeń.
- Chór Carmina: wyjaśnienie chronologii koncertu na 25-lecie kapłaństwa kard. Stefana Wyszyńskiego. Ten wątek pominięto; nie dopisano godziny niedzielnej Mszy z chórem.
- Prawdziwe ogłoszenia, aktualności, relacje oraz decyzja i źródło treści „Słowa na dziś”. W szkicu nie ma testowych wpisów; narzędzia bloga i dwa działy pozostają dostępne.
- Właściwa polityka prywatności i zasady obsługi danych przed uruchomieniem formularzy. Angielski szablon zachowano jako draft, poza publiczną nawigacją i listą podstron. Nie dodano formularza zbierającego dane.

## Lokalne procedury sakramentalne do pozyskania

| Podstrona | Informacje |
|---|---|
| Chrzest | Zgłoszenie, terminy, dokumenty, przygotowanie rodziców i chrzestnych, kontakt |
| Bierzmowanie | Odbiorcy, zapisy, harmonogram, dokumenty, prowadzący |
| Eucharystia | Pierwsza Komunia, zapisy, spotkania, dokumenty, kontakt |
| Pokuta i pojednanie | Stałe godziny, pierwszy piątek, terminy dodatkowe |
| Kapłaństwo | Właściwy kontakt dla osób rozeznających powołanie |
| Małżeństwo | Zgłoszenie, dokumenty, przygotowanie, poradnia, kontakt |
| Namaszczenie chorych | Zgłoszenie wizyty, regularne odwiedziny, kontakt w nagłych sytuacjach |
| Pogrzeb | Zgłoszenie, dokumenty, kontakt i ustalenie liturgii |

## Co przygotowano

- Cztery karty z pełnymi podstronami: Chór Carmina, Domowy Kościół, Salonik Dobrego Słowa i Wieczory Uwielbienia. Istniejący adres /domowy-kosciol wykorzystano ponownie.
- Jedno wspólne źródło treści godzin i numerów (lib/blog/content.ts), używane na głównej, w harmonogramie, kontakcie i stopce.
- Skróty z hero prowadzą do odpowiednich sekcji harmonogramu.
- Rachunek pozostawiono dokładnie w brzmieniu instrukcji; przycisk przekazuje do Clipboard API 26 cyfr bez spacji i obsługuje odmowę uprawnienia. Interfejs przeglądarki testowej zgłosił sukces, ale odczyt schowka przez narzędzie automatyzacji zwrócił pusty bufor — niezależny odczyt schowka nie został potwierdzony.
- Historia i polityka mają status draft; adresy pozostają w danych. Nie są dostępne jako publiczne strony podglądu ani linkowane w menu.
- Zdjęć nie usunięto, nie wymieniono ani nie modyfikowano; porównano sumy kontrolne plików. Zachowano wszystkie 31 obrazów w układzie strony głównej.
- Zewnętrzne odnośniki Domowego Kościoła zostały otwarte i sprawdzone.

## Wynik kontroli

- 260 kontroli treści, linków i kotwic: bez błędów; 26 dostępnych widoków podglądu.
- 78 widoków w przeglądarce (390, 820, 1280 px): bez poziomego przepełnienia. Obejrzano karty, godziny i sekcję wsparcia.
- 69 plików graficznych: sumy kontrolne bez zmian.
- Kontrola TypeScript i budowanie aplikacji: zakończone powodzeniem.
- Cztery zewnętrzne odnośniki Domowego Kościoła: strony dostępne podczas kontroli.
- Brak publikacji i brak zmian w danych produkcyjnych. Lokalny serwer podglądu pozostawiono uruchomiony do odbioru.

## Dopasowanie sekcji wsparcia i ruchu

Biała karta ma normalną wysokość wynikającą z treści, a zdjęcie otacza ją osobno: po 60 px nad i pod kartą na komputerze, 48 px na tablecie i 32 px na telefonie. Zachowano tekst i przycisk kopiowania rachunku. Nie zmieniono plików graficznych. Kadr zdjęcia ustawiono według danych źródłowych Wix (73% / 38%). W zapisanych danych Wix zdjęcia mają scrollEffect:none; nie dodano sztucznej paralaksy. Dodano delikatne wejścia elementów przy przewijaniu z wyłączeniem dla prefers-reduced-motion. Animacje menu, galerii i przejść między stronami pozostają aktywne.
