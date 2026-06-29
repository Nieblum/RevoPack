// ==UserScript==
// @name         RevoPack Loader
// @namespace    Nieblum
// @version      1.0
// @author       Nieblum
// @description  Loader - pobiera RevoPack z GitHuba. Wgrywasz RAZ na konto, potem edytujesz tylko plik na GitHubie.
// @match        https://*.margonem.pl/
// @grant        none
// @require      https://raw.githubusercontent.com/Nieblum/RevoPack/main/RevoPack.user.js?v=1
// ==/UserScript==

// ───────────────────────────────────────────────────────────────
//  JAK TO DZIAŁA
// ───────────────────────────────────────────────────────────────
// Ten loader sam nic nie robi poza pobraniem RevoPack z linijki @require powyżej.
// RevoPack ładuje się z Twojego GitHuba przy każdym uruchomieniu gry.
//
// ABY ZAKTUALIZOWAĆ DODATKI NA WSZYSTKICH KONTACH:
//   1. Zmień plik RevoPack.user.js u siebie i wgraj go na GitHub
//      (w repo: plik -> ołówek (Edit) -> wklej nowy kod -> Commit changes)
//   2. WAŻNE: Tampermonkey cache'uje @require. Żeby wymusić pobranie nowej
//      wersji, MUSISZ zmienić znacznik na końcu linku @require oraz @version
//      tego loadera, a potem zaktualizować loader na kontach.
//
//      Najprościej: przy każdej aktualizacji podbij liczbę w DWÓCH miejscach:
//        - w @version (np. 1.0 -> 1.1)
//        - w "?v=1" na końcu @require (np. ?v=1 -> ?v=2)
//      Zapisz loader w Tampermonkey - on pobierze świeży RevoPack.
//
//   Uwaga: jeśli loader też trzymasz na GitHubie z auto-update, to zmiana
//   tych dwóch liczb wystarczy raz - reszta kont pobierze go sama.
// ───────────────────────────────────────────────────────────────
