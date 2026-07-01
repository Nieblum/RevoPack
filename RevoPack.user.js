// ==UserScript==
// @name         RevoPack
// @version      2.0
// @author       Nieblum
// @match        https://*.margonem.pl/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PACK = {
        ADDONY: [
            { id: 'zestaw',      nazwa: 'Auto Zestaw (PvP)',       widgetEl: 'aze_widget',      onCb: 'aze_on',      ikona: '⚔️', brakOkna: false },
            { id: 'szybka',      nazwa: 'Auto Szybka Walka',       widgetEl: 'aszw_widget',     onCb: 'aszw_on',     ikona: '⚡', brakOkna: false },
            { id: 'antyduch',    nazwa: 'Anty Duch (anty-AFK)',    widgetEl: 'antyduch_widget', onCb: 'antyduch_on', ikona: '👻', brakOkna: false },
            { id: 'powalce',     nazwa: 'Zestaw Po Walce',         widgetEl: 'zpw_widget',      onCb: 'zpw_on',      ikona: '🔄', brakOkna: false },
            { id: 'grupa',       nazwa: 'Auto Dodawanie do Grupy', widgetEl: 'adg_widget',      onCb: 'adg_on',      ikona: '➕', brakOkna: false },
            { id: 'lista',       nazwa: 'Lista Graczy',            widgetEl: 'lg_widget',       onCb: 'lg_on',       ikona: '👥', brakOkna: false },
            { id: 'przywolanie', nazwa: 'Auto Przywołanie',        widgetEl: 'aprz_widget',      onCb: 'aprz_on',     ikona: '📨', brakOkna: false },
            { id: 'kopalnia',    nazwa: 'Auto Kopalnia',           widgetEl: 'akop_widget',     onCb: 'akop_on',     ikona: '⛏️', brakOkna: false },
            { id: 'wylogowanie', nazwa: 'Auto Wylogowanie',        widgetEl: null,              onCb: 'awyl_on',     ikona: '🚪', brakOkna: true  },
            { id: 'jebadlo',     nazwa: 'GoDowskie Jebadło',       widgetEl: 'aatk_widget',     onCb: 'aatk_on',     ikona: '💀', brakOkna: false },
            { id: 'tytan',       nazwa: 'Zestaw na Tytana',        widgetEl: 'aztyt_widget',    onCb: 'aztyt_on',    ikona: '🐲', brakOkna: false },
            { id: 'budowniczy',  nazwa: 'Budowniczy Grupy',        widgetEl: 'bgr_widget',      onCb: 'bgr_on',      ikona: '🧩', brakOkna: false },
        ],

        stan: null,

        loadStan() {
            let zapis = {};
            try { const s = localStorage.getItem('mpack_stan'); if (s) zapis = JSON.parse(s); } catch (e) {}
            const stan = {};
            for (const a of PACK.ADDONY) {
                const z = zapis[a.id] || {};
                stan[a.id] = {
                    enabled:  z.enabled  !== undefined ? z.enabled  : false,
                    widoczny: z.widoczny !== undefined ? z.widoczny : false,
                };
            }
            PACK.stan = stan;
        },
        saveStan() { try { localStorage.setItem('mpack_stan', JSON.stringify(PACK.stan)); } catch (e) {} },
        isEnabled(id) { return PACK.stan[id] && PACK.stan[id].enabled; },
        ustawEnabled(id, val) {
            PACK.stan[id].enabled = val;
            const def = PACK.ADDONY.find(a => a.id === id);
            const cb = document.getElementById(def.onCb);
            if (cb) { cb.checked = val; cb.dispatchEvent(new Event('change')); }
            PACK.saveStan();
        },
        ustawWidocznosc(id, val) {
            PACK.stan[id].widoczny = val;
            const def = PACK.ADDONY.find(a => a.id === id);
            if (def.brakOkna || !def.widgetEl) return;
            const el = document.getElementById(def.widgetEl);
            if (el) el.style.display = val ? '' : 'none';
            PACK.saveStan();
        },
        zastosujStan() {
            for (const a of PACK.ADDONY) {
                const cb = document.getElementById(a.onCb);
                if (cb) cb.checked = PACK.stan[a.id].enabled;
                if (!a.brakOkna && a.widgetEl) {
                    const el = document.getElementById(a.widgetEl);
                    if (el) el.style.display = PACK.stan[a.id].widoczny ? '' : 'none';
                }
            }
        },
    };

    function stworzGlowneGui() {
        if (document.getElementById('mpack_gui')) return;
        let zwiniety = false;
        try { if (localStorage.getItem('mpack_gui_zwiniety') === '1') zwiniety = true; } catch (e) {}

        const gui = document.createElement('div');
        gui.id = 'mpack_gui';
        let rows = '';
        for (const a of PACK.ADDONY) {
            const eyeBtn = a.brakOkna
                ? `<span class="mpack_noeye" title="Ten dodatek nie ma okna">—</span>`
                : `<button class="mpack_eye" data-id="${a.id}" title="Pokaż/ukryj okno">${PACK.stan[a.id].widoczny ? '👁' : '🚫'}</button>`;
            rows += `
            <div class="mpack_row" data-id="${a.id}">
                <label class="mpack_switch" title="Włącz/wyłącz dodatek">
                    <input type="checkbox" class="mpack_enable" data-id="${a.id}" ${PACK.stan[a.id].enabled ? 'checked' : ''}>
                    <span class="mpack_slider"></span>
                </label>
                <span class="mpack_name">${a.ikona} ${a.nazwa}</span>
                ${eyeBtn}
            </div>`;
        }
        gui.innerHTML = `
        <div id="mpack_header">
            <span id="mpack_title">🎮 RevoPack</span>
            <button id="mpack_collapse">${zwiniety ? '▲' : '▼'}</button>
        </div>
        <div id="mpack_body" style="display:${zwiniety ? 'none' : 'block'}">
            <div id="mpack_hint">⚙ przełącznik = włącz/wyłącz · 👁 = pokaż okno</div>
            ${rows}
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #mpack_gui {
            position: fixed; top: 60px; left: 12px;
            background: linear-gradient(180deg, rgba(20,12,40,.97), rgba(10,8,25,.97));
            border: 1px solid #b388ff99; border-radius: 12px;
            padding: 9px 11px; font-size: 12px; color: #e8ddff;
            z-index: 100000; width: 235px; user-select: none;
            font-family: sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,.5);
        }
        #mpack_header {
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold; font-size: 14px; color: #c8a4ff;
            cursor: move; margin-bottom: 4px;
        }
        #mpack_collapse {
            background: none; border: 1px solid #b388ff66; color: #c8a4ff;
            border-radius: 5px; cursor: pointer; padding: 1px 7px; font-size: 11px;
        }
        #mpack_hint { font-size: 10px; color: #9988bb; margin-bottom: 6px; text-align: center; line-height: 1.4; }
        .mpack_row { display: flex; align-items: center; gap: 8px; padding: 3px 2px; border-radius: 6px; }
        .mpack_row:hover { background: rgba(255,255,255,.05); }
        .mpack_name { flex: 1; font-size: 12px; }
        .mpack_switch { position: relative; display: inline-block; width: 32px; height: 17px; flex-shrink: 0; cursor: pointer; }
        .mpack_switch input { opacity: 0; width: 0; height: 0; }
        .mpack_slider { position: absolute; inset: 0; background: #443355; border-radius: 17px; transition: .2s; }
        .mpack_slider:before { content: ""; position: absolute; height: 13px; width: 13px; left: 2px; bottom: 2px; background: #ccc; border-radius: 50%; transition: .2s; }
        .mpack_switch input:checked + .mpack_slider { background: #8844ee; }
        .mpack_switch input:checked + .mpack_slider:before { transform: translateX(15px); background: #fff; }
        .mpack_eye { background: rgba(180,130,255,.12); border: 1px solid #b388ff44; border-radius: 5px; cursor: pointer; padding: 2px 6px; font-size: 13px; flex-shrink: 0; }
        .mpack_eye:hover { background: rgba(180,130,255,.3); }
        .mpack_noeye { color: #665577; font-size: 13px; flex-shrink: 0; padding: 2px 8px; }
        `;
        document.head.appendChild(style);
        document.body.appendChild(gui);

        gui.querySelectorAll('.mpack_enable').forEach(cb => {
            cb.addEventListener('change', () => { PACK.ustawEnabled(cb.dataset.id, cb.checked); });
        });
        gui.querySelectorAll('.mpack_eye').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const nowy = !PACK.stan[id].widoczny;
                PACK.ustawWidocznosc(id, nowy);
                btn.textContent = nowy ? '👁' : '🚫';
            });
        });
        document.getElementById('mpack_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            zwiniety = !zwiniety;
            document.getElementById('mpack_body').style.display = zwiniety ? 'none' : 'block';
            document.getElementById('mpack_collapse').textContent = zwiniety ? '▲' : '▼';
            try { localStorage.setItem('mpack_gui_zwiniety', zwiniety ? '1' : '0'); } catch (e) {}
        });
        const header = document.getElementById('mpack_header');
        let drag = false, ox = 0, oy = 0;
        header.addEventListener('mousedown', e => {
            if (e.target.tagName === 'BUTTON') return;
            drag = true; ox = e.clientX - gui.offsetLeft; oy = e.clientY - gui.offsetTop;
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            gui.style.left = (e.clientX - ox) + 'px';
            gui.style.top  = (e.clientY - oy) + 'px';
        });
        document.addEventListener('mouseup', () => drag = false);
    }

    function initModul_zestaw() {
        const addon = () => {

    const DOMYSLNE = {
        zestawy: { w:1, p:1, b:2, h:2, t:2, m:3, default:1 },
        maxKratki: 12,
        intervalMs: 1600,
        cooldownMs: 1100,
        pauzaPoKlikuMs: 900,
        ignorujPrzyjaciol: true,
        ignorujKlanowiczow: true,
        ignorujSojusznikow: true,
        pokazPowiadomienia: true,
        widgetPos: { x: 12, y: null, bottom: 12 },
        zwiniety: false,
    };

    const PROF_NAZWY = {
        w: 'Wojownik',
        p: 'Paladyn',
        b: 'Tancerz Ostrzy',
        h: 'Łowca',
        t: 'Tropiciel',
        m: 'Mag',
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('aze_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };

    const saveConfig = () => {
        localStorage.setItem('aze_config', JSON.stringify(CONFIG));
    };

    const CONFIG = loadConfig();

    const isNI = typeof Engine === 'object';
    let ostatniZestaw = -1;
    let ostatniaZmiana = 0;
    let ostatniKlikMapy = 0;

    document.addEventListener('mousedown', (e) => {
        if (e.target && e.target.closest && e.target.closest('#aze_widget')) return;
        ostatniKlikMapy = Date.now();
    }, true);

    const pauzaPoKliku = () => (Date.now() - ostatniKlikMapy) < CONFIG.pauzaPoKlikuMs;

    const wGrupie = () => document.querySelectorAll('.party-member').length > 0;

    const getHero   = () => isNI ? Engine.hero.d : window.hero;
    const getMapPvp = () => isNI ? Engine.map.d.pvp : window.map.pvp;

    const getOthers = () => {
        if (isNI) {
            return Engine.others.getDrawableList()
                .filter(o => o.d && o.d.nick && o.d.x !== undefined)
                .map(o => o.d);
        }
        return Object.values(window.g.other || {}).filter(o => o && o.nick);
    };

    const dystans = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    const czyWrog = (o, heroId, heroClanId) => {
        const rel = o.relation;
        const oClanId = (o.clan && o.clan.id) || 0;

        if (heroId && o.id && String(o.id) === String(heroId)) return false;

        if (CONFIG.ignorujKlanowiczow && heroClanId > 0 && oClanId === heroClanId) return false;

        if (CONFIG.ignorujKlanowiczow && (rel === 2 || rel === 4)) return false;

        if (CONFIG.ignorujPrzyjaciol && (rel === 2 || rel === 3)) return false;

        if (CONFIG.ignorujSojusznikow && rel === 5) return false;

        return true;
    };

    const aktualnyZestaw = () => {
        try {
            const el = Array.from(document.querySelectorAll('.builds-interface'))
                .filter(e => !e.closest('#aze_widget'))
                .find(e => e.offsetParent !== null);
            if (!el) return null;
            const txt = (el.querySelector('.choose-build.build-index') || el).textContent || '';
            const no = parseInt(txt.trim(), 10);
            return Number.isFinite(no) ? no : null;
        } catch (e) { return null; }
    };

    let oczekiwanyZestaw = null;
    let probaZmianyCzas = 0;

    const zmienZestaw = (nr) => {
        if (nr < 1 || nr > 9) return;

        const teraz = Date.now();
        if (teraz - ostatniaZmiana < CONFIG.cooldownMs) return;

        const aktualny = aktualnyZestaw();
        if (aktualny === nr) { ostatniZestaw = nr; oczekiwanyZestaw = null; return; }

        if (typeof _g !== 'function') return;

        ostatniaZmiana = teraz;
        ostatniZestaw = nr;
        oczekiwanyZestaw = nr;
        probaZmianyCzas = teraz;

        _g('builds&action=updateCurrent&id=' + encodeURIComponent(String(nr)));

        setTimeout(() => {
            if (oczekiwanyZestaw !== nr) return;
            const po = aktualnyZestaw();
            if (po === nr) {
                oczekiwanyZestaw = null;
            } else {
                ostatniZestaw = -1;
                oczekiwanyZestaw = null;
            }
        }, 700);
    };

    const pokazToast = (txt) => {
        if (!CONFIG.pokazPowiadomienia) return;
        let el = document.getElementById('aze_toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'aze_toast';
            Object.assign(el.style, {
                position: 'fixed', bottom: '80px', left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,.9)', color: '#ffe066',
                padding: '7px 18px', borderRadius: '8px', fontSize: '13px',
                zIndex: '99999', border: '1px solid #ffe06655',
                pointerEvents: 'none', transition: 'opacity .35s',
                fontFamily: 'sans-serif',
            });
            document.body.appendChild(el);
        }
        el.textContent = txt;
        el.style.opacity = '1';
        clearTimeout(el._t);
        el._t = setTimeout(() => el.style.opacity = '0', 2800);
    };

    const stworzWidget = () => {
        if (document.getElementById('aze_widget')) return;

        const w = document.createElement('div');
        w.id = 'aze_widget';

        let profRows = '';
        for (const [key, nazwa] of Object.entries(PROF_NAZWY)) {
            profRows += `
            <div class="aze_prof_row">
                <span class="aze_prof_name">${nazwa}</span>
                <input class="aze_prof_input" type="number" min="1" max="9"
                    data-prof="${key}" value="${CONFIG.zestawy[key] || 1}">
            </div>`;
        }

        w.innerHTML = `
        <div id="aze_header">
            <span id="aze_title">⚔️ Auto Zestaw</span>
            <div id="aze_header_btns">
                <label class="aze_toggle"><input type="checkbox" id="aze_on" ${CONFIG.enabled !== false ? 'checked' : ''}> ON</label>
                <button id="aze_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="aze_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="aze_status_map">🗺️ Czekam...</div>
            <div id="aze_status_enemy">👤 —</div>
            <div id="aze_status_set">🎒 Aktywny zestaw: —</div>
            <div id="aze_separator"></div>
            <div id="aze_prof_table">
                <div class="aze_prof_header">
                    <span>Profesja</span><span>Zestaw</span>
                </div>
                ${profRows}
                <div class="aze_prof_row">
                    <span class="aze_prof_name" style="color:#aaa">Domyślny</span>
                    <input class="aze_prof_input" type="number" min="1" max="9"
                        data-prof="default" value="${CONFIG.zestawy.default || 1}">
                </div>
            </div>
            <div id="aze_range_row">
                <span>Zasięg:</span>
                <input id="aze_range" type="number" min="1" max="30" value="${CONFIG.maxKratki}">
                <span>kr</span>
            </div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #aze_widget {
            position: fixed;
            background: rgba(8,8,20,.95);
            border: 1px solid #ffe06688;
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            color: #ffe066;
            z-index: 99999;
            width: 210px;
            user-select: none;
            font-family: sans-serif;
            line-height: 1.6;
            cursor: move;
        }
        #aze_header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 4px;
        }
        #aze_header_btns {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        #aze_collapse {
            background: none;
            border: 1px solid #ffe06666;
            color: #ffe066;
            border-radius: 4px;
            cursor: pointer;
            padding: 0 5px;
            font-size: 10px;
            line-height: 16px;
        }
        .aze_toggle {
            font-weight: normal;
            font-size: 11px;
            cursor: pointer;
        }
        #aze_separator {
            border-top: 1px solid #ffe06633;
            margin: 5px 0;
        }
        #aze_status_map, #aze_status_enemy, #aze_status_set {
            font-size: 11px;
        }
        .aze_prof_header {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #aaa;
            margin-bottom: 2px;
            padding: 0 2px;
        }
        .aze_prof_row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 2px 0;
        }
        .aze_prof_name {
            font-size: 11px;
            color: #ffdd88;
        }
        .aze_prof_input {
            width: 38px;
            background: rgba(255,220,100,.12);
            border: 1px solid #ffe06655;
            border-radius: 4px;
            color: #ffe066;
            text-align: center;
            font-size: 12px;
            padding: 1px 3px;
        }
        #aze_range_row {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 5px;
            font-size: 11px;
            color: #aaa;
        }
        #aze_range {
            width: 38px;
            background: rgba(255,220,100,.12);
            border: 1px solid #ffe06655;
            border-radius: 4px;
            color: #ffe066;
            text-align: center;
            font-size: 12px;
            padding: 1px 3px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left   = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) {
            w.style.top    = CONFIG.widgetPos.y + 'px';
        } else {
            w.style.bottom = CONFIG.widgetPos.bottom + 'px';
        }

        w.querySelectorAll('.aze_prof_input').forEach(input => {
            input.addEventListener('change', () => {
                const prof = input.dataset.prof;
                const val  = Math.max(1, Math.min(9, parseInt(input.value) || 1));
                input.value = val;
                CONFIG.zestawy[prof] = val;
                saveConfig();
            });
            input.addEventListener('mousedown', e => e.stopPropagation());
        });

        const rangeInput = document.getElementById('aze_range');
        rangeInput.addEventListener('change', () => {
            CONFIG.maxKratki = Math.max(1, Math.min(30, parseInt(rangeInput.value) || 12));
            rangeInput.value = CONFIG.maxKratki;
            saveConfig();
        });
        rangeInput.addEventListener('mousedown', e => e.stopPropagation());

        const cbOn = document.getElementById('aze_on');
        cbOn.addEventListener('change', () => {
            CONFIG.enabled = cbOn.checked;
            saveConfig();
        });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('aze_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('aze_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('aze_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 12));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left   = (e.clientX - ox) + 'px';
            w.style.top    = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            CONFIG.widgetPos.bottom = 12;
            saveConfig();
        });
    };

    const updateStatus = (pvp, wrog, zestaw) => {
        const mapEl  = document.getElementById('aze_status_map');
        const wrogEl = document.getElementById('aze_status_enemy');
        const setEl  = document.getElementById('aze_status_set');
        if (!mapEl || !wrogEl || !setEl) return;

        if (!pvp) {
            if (zestaw === '👥 grupa') {
                mapEl.style.color = '#88aaff'; mapEl.textContent = '👥 Jesteś w grupie – pauza';
            } else {
                mapEl.style.color = '#888'; mapEl.textContent = '🗺️ Nie-PvP – nieaktywny';
            }
            wrogEl.style.color = '#888'; wrogEl.textContent = '👤 —';
            setEl.textContent = '🎒 Aktywny zestaw: —';
            return;
        }
        mapEl.style.color = '#ff4444'; mapEl.textContent = '🗺️ Czerwona mapa – aktywny';
        if (wrog) {
            const h = getHero();
            const profKey = (wrog.prof || '').toLowerCase();
            const profNazwa = PROF_NAZWY[profKey] || wrog.prof || '?';
            const d = h ? dystans(h, wrog) : '?';
            const clanNazwa = (wrog.clan && wrog.clan.name) ? wrog.clan.name : (wrog.clanname || '');
            const clan = clanNazwa ? ` [${clanNazwa}]` : '';
            wrogEl.style.color = '#ff7755';
            wrogEl.textContent = `👤 ${wrog.nick || '???'}${clan} (${profNazwa}) ${d}kr`;
        } else {
            wrogEl.style.color = '#888'; wrogEl.textContent = '👤 Brak wrogów w zasięgu';
        }
        setEl.textContent = `🎒 Aktywny zestaw: ${zestaw}`;
    };

    const tick = () => {
        const cbOn = document.getElementById('aze_on');
        if (cbOn && !cbOn.checked) { updateStatus(false, null, '—'); return; }

        if (wGrupie()) { updateStatus(false, null, '👥 grupa'); return; }

        if (pauzaPoKliku()) return;

        const pvp = getMapPvp();
        if (pvp !== 2) {
            if (aktualnyZestaw() !== CONFIG.zestawy['default']) zmienZestaw(CONFIG.zestawy['default']);
            updateStatus(false, null, '—');
            return;
        }

        const hero   = getHero();
        const heroId = hero.id;
        const heroClanId = (hero.clan && hero.clan.id) || 0;
        const others = getOthers();
        let najblizszy = null, minD = Infinity;

        for (const o of others) {
            if (!o || o.x === undefined) continue;
            if (!czyWrog(o, heroId, heroClanId)) continue;
            const d = dystans(hero, o);
            if (d <= CONFIG.maxKratki && d < minD) { minD = d; najblizszy = o; }
        }

        const profKey  = najblizszy ? (najblizszy.prof || '').toLowerCase() : null;
        const docelowy = profKey
            ? (CONFIG.zestawy[profKey] ?? CONFIG.zestawy['default'])
            : CONFIG.zestawy['default'];

        updateStatus(true, najblizszy, docelowy);

        const aktualny = aktualnyZestaw();
        if (docelowy !== aktualny) {
            zmienZestaw(docelowy);
            if (najblizszy) {
                const profNazwa = PROF_NAZWY[profKey] || profKey || '?';
                pokazToast(`⚔️ ${najblizszy.nick || '???'} [${profNazwa}] → Zestaw ${docelowy}`);
            } else {
                pokazToast(`🛡️ Brak wrogów → Zestaw ${docelowy}`);
            }
        }
    };

    stworzWidget();
    setInterval(tick, CONFIG.intervalMs);
    console.log('[AutoZestaw v5.9] Uruchomiony.');
};
        addon();
    }

    function initModul_szybka() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: true,
        maxWrogow: 5,
        liczTylkoGraczy: true,
        intervalMs: 500,
        widgetPos: { x: 12, y: null, bottom: 70 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('aszw_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('aszw_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    let ostatniaWalka = null;
    let probowanoWTejWalce = false;

    const wWalce = () => {
        return Engine.battle
            && Engine.battle.isBattleShow
            && Engine.battle.isBattleShow()
            && !Engine.battle.endBattle;
    };

    const policzWrogow = () => {
        const lista = Engine.battle.warriorsList;
        if (!lista) return 0;
        const myteam = Engine.battle.myteam;
        let wrogowie = 0;
        for (const id in lista) {
            const w = lista[id];
            if (!w) continue;
            if (w.team === myteam) continue;
            if (CONFIG.liczTylkoGraczy && w.npc) continue;
            if (w.getHpp && w.getHpp() <= 0) continue;
            if (w.hasZeroHpp && w.hasZeroHpp()) continue;
            wrogowie++;
        }
        return wrogowie;
    };

    const klikajF = () => {
        if (!Engine.battle.canAutoFight || !Engine.battle.canAutoFight()) return;
        if (Engine.battle.isAutoFightActive && Engine.battle.isAutoFightActive()) return;
        Engine.battle.autoFight(true);
    };

    const stworzWidget = () => {
        if (document.getElementById('aszw_widget')) return;

        const w = document.createElement('div');
        w.id = 'aszw_widget';
        w.innerHTML = `
        <div id="aszw_header">
            <span id="aszw_title">⚡ Auto Szybka Walka</span>
            <div id="aszw_hbtns">
                <label class="aszw_toggle"><input type="checkbox" id="aszw_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="aszw_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="aszw_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="aszw_status">⚪ Poza walką</div>
            <div id="aszw_separator"></div>
            <div class="aszw_row">
                <span>Max wrogów do auto-F:</span>
                <input id="aszw_max" type="number" min="1" max="50" value="${CONFIG.maxWrogow}">
            </div>
            <label class="aszw_checkrow">
                <input type="checkbox" id="aszw_onlyplayers" ${CONFIG.liczTylkoGraczy ? 'checked' : ''}>
                <span>Licz tylko graczy (pomiń NPC)</span>
            </label>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #aszw_widget {
            position: fixed;
            background: rgba(8,8,20,.95);
            border: 1px solid #66ccff88;
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            color: #aee9ff;
            z-index: 99999;
            width: 215px;
            user-select: none;
            font-family: sans-serif;
            line-height: 1.6;
            cursor: move;
        }
        #aszw_header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 4px;
            color: #66ccff;
        }
        #aszw_hbtns { display: flex; align-items: center; gap: 5px; }
        #aszw_collapse {
            background: none; border: 1px solid #66ccff66;
            color: #66ccff; border-radius: 4px; cursor: pointer;
            padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .aszw_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        #aszw_separator { border-top: 1px solid #66ccff33; margin: 5px 0; }
        #aszw_status { font-size: 11px; }
        .aszw_row {
            display: flex; justify-content: space-between;
            align-items: center; margin: 4px 0; font-size: 11px;
        }
        .aszw_row input {
            width: 45px; background: rgba(100,200,255,.12);
            border: 1px solid #66ccff55; border-radius: 4px;
            color: #aee9ff; text-align: center; font-size: 12px; padding: 1px 3px;
        }
        .aszw_checkrow {
            display: flex; align-items: center; gap: 5px;
            font-size: 11px; cursor: pointer; margin-top: 4px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('aszw_on');
        cbOn.addEventListener('change', () => { CONFIG.enabled = cbOn.checked; saveConfig(); });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        const maxInput = document.getElementById('aszw_max');
        maxInput.addEventListener('change', () => {
            CONFIG.maxWrogow = Math.max(1, Math.min(50, parseInt(maxInput.value) || 5));
            maxInput.value = CONFIG.maxWrogow;
            saveConfig();
        });
        maxInput.addEventListener('mousedown', e => e.stopPropagation());

        const onlyP = document.getElementById('aszw_onlyplayers');
        onlyP.addEventListener('change', () => { CONFIG.liczTylkoGraczy = onlyP.checked; saveConfig(); });
        onlyP.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('aszw_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('aszw_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('aszw_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 70));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const updateStatus = (txt, kolor) => {
        const el = document.getElementById('aszw_status');
        if (!el) return;
        el.textContent = txt;
        el.style.color = kolor || '#aee9ff';
    };

    const tick = () => {
        const cbOn = document.getElementById('aszw_on');
        if (cbOn && !cbOn.checked) { updateStatus('⚪ Wyłączony', '#888'); return; }

        if (!wWalce()) {
            updateStatus('⚪ Poza walką', '#888');
            ostatniaWalka = null;
            probowanoWTejWalce = false;
            return;
        }

        const podpisWalki = Object.keys(Engine.battle.warriorsList || {}).sort().join(',');
        if (podpisWalki !== ostatniaWalka) {
            ostatniaWalka = podpisWalki;
            probowanoWTejWalce = false;
        }

        const wrogowie = policzWrogow();
        const aktywny = Engine.battle.isAutoFightActive && Engine.battle.isAutoFightActive();

        if (aktywny) {
            updateStatus(`🟢 Szybka walka aktywna (wrogów: ${wrogowie})`, '#66ff99');
            return;
        }

        if (probowanoWTejWalce) {
            updateStatus(`✋ Tryb ręczny (możesz zmieniać F)`, '#aee9ff');
            return;
        }

        if (wrogowie <= CONFIG.maxWrogow && wrogowie > 0) {
            updateStatus(`⚡ Klikam F raz (wrogów: ${wrogowie} ≤ ${CONFIG.maxWrogow})`, '#ffe066');
            klikajF();
            probowanoWTejWalce = true;
        } else if (wrogowie > CONFIG.maxWrogow) {
            updateStatus(`🔴 Za dużo wrogów (${wrogowie} > ${CONFIG.maxWrogow})`, '#ff7755');
            probowanoWTejWalce = true;
        } else {
            updateStatus(`🔍 Liczę wrogów...`, '#aee9ff');
        }
    };

    stworzWidget();
    setInterval(tick, CONFIG.intervalMs);
    console.log('[AutoSzybkaWalka v1.1] Uruchomiony.');
};
        addon();
    }

    function initModul_antyduch() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: true,
        minMinuty: 5,
        maxMinuty: 7,
        widgetPos: { x: 12, y: null, bottom: 130 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('antyduch_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('antyduch_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    let nastepnyRuch = 0;
    let timerInterval = null;

    const getHero = () => Engine.hero.d;

    const wWalce = () => {
        return Engine.battle
            && Engine.battle.isBattleShow
            && Engine.battle.isBattleShow()
            && !Engine.battle.endBattle;
    };

    const wolnePole = (x, y) => {
        try {
            if (Engine.map && Engine.map.col && Engine.map.col.check) {
                return Engine.map.col.check(x, y) === 0;
            }
        } catch(e) {}
        return false;
    };

    const zrobRuch = () => {
        const hero = getHero();
        if (!hero) return false;

        if (Engine.hero.rx !== hero.x || Engine.hero.ry !== hero.y) return false;
        if (Engine.lock && Engine.lock.check && Engine.lock.check()) return false;

        const kierunki = [
            { x: hero.x + 1, y: hero.y },
            { x: hero.x - 1, y: hero.y },
            { x: hero.x, y: hero.y + 1 },
            { x: hero.x, y: hero.y - 1 },
        ];

        const wolne = kierunki.filter(p => wolnePole(p.x, p.y));
        if (wolne.length === 0) return false;

        const cel = wolne[Math.floor(Math.random() * wolne.length)];

        try {
            Engine.hero.nextStep(cel.x, cel.y);
            return true;
        } catch(e) {
            console.error('[AntyDuch] Błąd ruchu:', e);
            return false;
        }
    };

    const losowyOdstep = () => {
        const min = CONFIG.minMinuty * 60 * 1000;
        const max = CONFIG.maxMinuty * 60 * 1000;
        return min + Math.random() * (max - min);
    };

    const zaplanujRuch = () => {
        nastepnyRuch = Date.now() + losowyOdstep();
    };

    const stworzWidget = () => {
        if (document.getElementById('antyduch_widget')) return;

        const w = document.createElement('div');
        w.id = 'antyduch_widget';
        w.innerHTML = `
        <div id="antyduch_header">
            <span id="antyduch_title">👻 Anty Duch</span>
            <div id="antyduch_hbtns">
                <label class="antyduch_toggle"><input type="checkbox" id="antyduch_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="antyduch_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="antyduch_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="antyduch_status">⚪ Czekam...</div>
            <div id="antyduch_separator"></div>
            <div class="antyduch_row">
                <span>Odstęp ruchów (min):</span>
            </div>
            <div class="antyduch_row">
                <span>od</span>
                <input id="antyduch_min" type="number" min="1" max="60" value="${CONFIG.minMinuty}">
                <span>do</span>
                <input id="antyduch_max" type="number" min="1" max="60" value="${CONFIG.maxMinuty}">
            </div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #antyduch_widget {
            position: fixed;
            background: rgba(8,8,20,.95);
            border: 1px solid #cc99ff88;
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            color: #e0ccff;
            z-index: 99999;
            width: 200px;
            user-select: none;
            font-family: sans-serif;
            line-height: 1.6;
            cursor: move;
        }
        #antyduch_header {
            display: flex; justify-content: space-between;
            align-items: center; font-weight: bold;
            font-size: 13px; margin-bottom: 4px; color: #cc99ff;
        }
        #antyduch_hbtns { display: flex; align-items: center; gap: 5px; }
        #antyduch_collapse {
            background: none; border: 1px solid #cc99ff66;
            color: #cc99ff; border-radius: 4px; cursor: pointer;
            padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .antyduch_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        #antyduch_separator { border-top: 1px solid #cc99ff33; margin: 5px 0; }
        #antyduch_status { font-size: 11px; }
        .antyduch_row {
            display: flex; align-items: center; gap: 5px;
            margin: 4px 0; font-size: 11px;
        }
        .antyduch_row input {
            width: 42px; background: rgba(200,150,255,.12);
            border: 1px solid #cc99ff55; border-radius: 4px;
            color: #e0ccff; text-align: center; font-size: 12px; padding: 1px 3px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('antyduch_on');
        cbOn.addEventListener('change', () => {
            CONFIG.enabled = cbOn.checked;
            if (CONFIG.enabled) zaplanujRuch();
            saveConfig();
        });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        const minInput = document.getElementById('antyduch_min');
        const maxInput = document.getElementById('antyduch_max');
        const aktualizujCzasy = () => {
            let mn = Math.max(1, Math.min(60, parseInt(minInput.value) || 5));
            let mx = Math.max(1, Math.min(60, parseInt(maxInput.value) || 7));
            if (mn > mx) mx = mn;
            minInput.value = mn; maxInput.value = mx;
            CONFIG.minMinuty = mn; CONFIG.maxMinuty = mx;
            zaplanujRuch();
            saveConfig();
        };
        minInput.addEventListener('change', aktualizujCzasy);
        maxInput.addEventListener('change', aktualizujCzasy);
        minInput.addEventListener('mousedown', e => e.stopPropagation());
        maxInput.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('antyduch_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('antyduch_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('antyduch_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 130));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const updateStatus = (txt, kolor) => {
        const el = document.getElementById('antyduch_status');
        if (!el) return;
        el.textContent = txt;
        el.style.color = kolor || '#e0ccff';
    };

    const tick = () => {
        const cbOn = document.getElementById('antyduch_on');
        if (cbOn && !cbOn.checked) { updateStatus('⚪ Wyłączony', '#888'); return; }

        if (wWalce()) {
            updateStatus('⚔️ Walka – wstrzymane', '#ff9966');
            return;
        }

        const teraz = Date.now();
        const pozostalo = Math.max(0, nastepnyRuch - teraz);

        if (pozostalo <= 0) {
            const ok = zrobRuch();
            zaplanujRuch();
            if (ok) updateStatus('✅ Wykonano ruch', '#66ff99');
            else    updateStatus('⚠️ Brak wolnego pola', '#ffcc66');
        } else {
            const min = Math.floor(pozostalo / 60000);
            const sek = Math.floor((pozostalo % 60000) / 1000);
            updateStatus(`⏳ Następny ruch za ${min}:${sek.toString().padStart(2,'0')}`, '#aee9ff');
        }
    };

    stworzWidget();
    zaplanujRuch();
    timerInterval = setInterval(tick, 1000);
    console.log('[AntyDuch v1.1] Uruchomiony.');
};
        addon();
    }

    function initModul_powalce() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: true,
        widgetPos: { x: 12, y: null, bottom: 190 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('zpw_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('zpw_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    let wybranyZestaw = null;

    const wWalce = () => {
        return Engine.battle
            && Engine.battle.isBattleShow
            && Engine.battle.isBattleShow()
            && !Engine.battle.endBattle;
    };

    const zmienZestaw = (nr) => {
        if (nr < 1 || nr > 9) return;
        if (typeof _g === 'function') {
            _g('builds&action=updateCurrent&id=' + encodeURIComponent(String(nr)));
        } else if (Engine.communication && Engine.communication.send2) {
            Engine.communication.send2(`builds&action=updateCurrent&id=${nr}`, undefined);
        }
    };

    const pokazToast = (txt) => {
        let el = document.getElementById('zpw_toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'zpw_toast';
            Object.assign(el.style, {
                position: 'fixed', bottom: '80px', left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,.9)', color: '#99ff99',
                padding: '7px 18px', borderRadius: '8px', fontSize: '13px',
                zIndex: '99999', border: '1px solid #99ff9955',
                pointerEvents: 'none', transition: 'opacity .35s',
                fontFamily: 'sans-serif',
            });
            document.body.appendChild(el);
        }
        el.textContent = txt;
        el.style.opacity = '1';
        clearTimeout(el._t);
        el._t = setTimeout(() => el.style.opacity = '0', 2800);
    };

    const stworzWidget = () => {
        if (document.getElementById('zpw_widget')) return;

        const w = document.createElement('div');
        w.id = 'zpw_widget';

        let btns = '';
        for (let i = 1; i <= 9; i++) {
            btns += `<button class="zpw_set_btn" data-set="${i}">${i}</button>`;
        }

        w.innerHTML = `
        <div id="zpw_header">
            <span id="zpw_title">🔄 Zestaw Po Walce</span>
            <div id="zpw_hbtns">
                <label class="zpw_toggle"><input type="checkbox" id="zpw_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="zpw_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="zpw_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="zpw_status">⚪ Poza walką</div>
            <div id="zpw_separator"></div>
            <div id="zpw_label">Zmień na zestaw po walce:</div>
            <div id="zpw_btns">${btns}</div>
            <button id="zpw_clear">✖ Anuluj wybór</button>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #zpw_widget {
            position: fixed;
            background: rgba(8,8,20,.95);
            border: 1px solid #99ff9988;
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            color: #ccffcc;
            z-index: 99999;
            width: 215px;
            user-select: none;
            font-family: sans-serif;
            line-height: 1.6;
            cursor: move;
        }
        #zpw_header {
            display: flex; justify-content: space-between;
            align-items: center; font-weight: bold;
            font-size: 13px; margin-bottom: 4px; color: #99ff99;
        }
        #zpw_hbtns { display: flex; align-items: center; gap: 5px; }
        #zpw_collapse {
            background: none; border: 1px solid #99ff9966;
            color: #99ff99; border-radius: 4px; cursor: pointer;
            padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .zpw_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        #zpw_separator { border-top: 1px solid #99ff9933; margin: 5px 0; }
        #zpw_status { font-size: 11px; }
        #zpw_label { font-size: 11px; color: #aaa; margin: 4px 0 3px; }
        #zpw_btns {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 4px;
            margin-bottom: 5px;
        }
        .zpw_set_btn {
            background: rgba(150,255,150,.1);
            border: 1px solid #99ff9955;
            color: #ccffcc;
            border-radius: 5px;
            cursor: pointer;
            padding: 4px 0;
            font-size: 13px;
            font-weight: bold;
            transition: all .15s;
        }
        .zpw_set_btn:hover { background: rgba(150,255,150,.25); }
        .zpw_set_btn.zpw_active {
            background: #44cc44;
            color: #fff;
            border-color: #88ff88;
            box-shadow: 0 0 6px #44cc4499;
        }
        #zpw_clear {
            width: 100%;
            background: rgba(255,100,100,.12);
            border: 1px solid #ff666655;
            color: #ffaaaa;
            border-radius: 5px;
            cursor: pointer;
            padding: 3px 0;
            font-size: 11px;
        }
        #zpw_clear:hover { background: rgba(255,100,100,.25); }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        w.querySelectorAll('.zpw_set_btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nr = parseInt(btn.dataset.set);
                if (wybranyZestaw === nr) {
                    wybranyZestaw = null;
                } else {
                    wybranyZestaw = nr;
                }
                odswiezPrzyciski();
            });
            btn.addEventListener('mousedown', e => e.stopPropagation());
        });

        const clearBtn = document.getElementById('zpw_clear');
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            wybranyZestaw = null;
            odswiezPrzyciski();
        });
        clearBtn.addEventListener('mousedown', e => e.stopPropagation());

        const cbOn = document.getElementById('zpw_on');
        cbOn.addEventListener('change', () => { CONFIG.enabled = cbOn.checked; saveConfig(); });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('zpw_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('zpw_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('zpw_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 190));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const odswiezPrzyciski = () => {
        document.querySelectorAll('.zpw_set_btn').forEach(btn => {
            const nr = parseInt(btn.dataset.set);
            btn.classList.toggle('zpw_active', nr === wybranyZestaw);
        });
    };

    const updateStatus = () => {
        const el = document.getElementById('zpw_status');
        if (!el) return;
        if (wWalce()) {
            if (wybranyZestaw) {
                el.textContent = `⚔️ Walka → po niej zestaw ${wybranyZestaw}`;
                el.style.color = '#ffe066';
            } else {
                el.textContent = '⚔️ W walce (wybierz zestaw)';
                el.style.color = '#aee9ff';
            }
        } else {
            if (wybranyZestaw) {
                el.textContent = `⏳ Czeka na walkę (zestaw ${wybranyZestaw})`;
                el.style.color = '#ccffcc';
            } else {
                el.textContent = '⚪ Poza walką';
                el.style.color = '#888';
            }
        }
    };

    const walkaSkonczona = () => {
        return Engine.battle && Engine.battle.endBattle === true;
    };

    const oknoWalkiOtwarte = () => {
        return Engine.battle
            && Engine.battle.isBattleShow
            && Engine.battle.isBattleShow();
    };

    let juzZmieniono = false;

    const tick = () => {
        const cbOn = document.getElementById('zpw_on');
        const wlaczony = !cbOn || cbOn.checked;

        const wOknie = oknoWalkiOtwarte();
        const skonczona = walkaSkonczona();

        if (wOknie && !skonczona) {
            juzZmieniono = false;
        }

        if (skonczona && !juzZmieniono) {
            if (wlaczony && wybranyZestaw) {
                const nr = wybranyZestaw;
                zmienZestaw(nr);
                pokazToast(`🔄 Walka skończona → Zestaw ${nr}`);
                wybranyZestaw = null;
                odswiezPrzyciski();
            }
            juzZmieniono = true;
        }

        if (!wOknie) {
            juzZmieniono = false;
        }

        updateStatus();
    };

    stworzWidget();
    setInterval(tick, 50);
    console.log('[ZestawPoWalce v2.1] Uruchomiony.');
};
        addon();
    }

    function initModul_grupa() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: true,
        maxOsob: 10,
        dodawajKlan: true,
        dodawajPrzyjaciol: true,
        dodawajSojusz: true,
        intervalMs: 2000,
        cooldownMs: 5000,
        widgetPos: { x: 12, y: null, bottom: 250 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('adg_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('adg_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    const ostatnieZaproszenia = {};

    const getHero = () => Engine.hero.d;

    const wielkoscGrupy = () => {
        const n = document.querySelectorAll('.party-member').length;
        return n === 0 ? 1 : n;
    };

    const jestesDowodca = () => {
        if (document.querySelectorAll('.party-member').length === 0) return true;
        return Array.from(document.querySelectorAll('.party__disband'))
            .some(e => e.style.display === 'block');
    };

    const czySwoj = (o, heroClanId) => {
        const rel = o.relation;
        const oClanId = (o.clan && o.clan.id) || 0;

        const klanPoId = (heroClanId > 0 && oClanId === heroClanId);
        const klanPoRel = (rel === 2 || rel === 4);
        const klan = klanPoId || klanPoRel;

        const przyjaciel = (rel === 2 || rel === 3);
        const sojusz = (rel === 5);

        if (CONFIG.dodawajKlan && klan) return true;
        if (CONFIG.dodawajPrzyjaciol && przyjaciel) return true;
        if (CONFIG.dodawajSojusz && sojusz) return true;
        return false;
    };

    const jestWGrupie = (id) => {
        return document.querySelector(`.party-member.other-party-id-${id}`) !== null;
    };

    const zapros = (id) => {
        if (typeof _g === 'function') {
            _g(`party&a=inv&id=${id}`);
        }
    };

    const stworzWidget = () => {
        if (document.getElementById('adg_widget')) return;

        const w = document.createElement('div');
        w.id = 'adg_widget';
        w.innerHTML = `
        <div id="adg_header">
            <span id="adg_title">➕ Auto Grupa</span>
            <div id="adg_hbtns">
                <label class="adg_toggle"><input type="checkbox" id="adg_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="adg_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="adg_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="adg_status">⚪ Czekam...</div>
            <div id="adg_separator"></div>
            <div class="adg_row">
                <span>Dodawaj gdy w grupie mniej niż:</span>
            </div>
            <div class="adg_row">
                <input id="adg_max" type="number" min="2" max="10" value="${CONFIG.maxOsob}">
                <span>osób</span>
            </div>
            <label class="adg_checkrow">
                <input type="checkbox" id="adg_klan" ${CONFIG.dodawajKlan ? 'checked' : ''}>
                <span>Klanowicze</span>
            </label>
            <label class="adg_checkrow">
                <input type="checkbox" id="adg_friends" ${CONFIG.dodawajPrzyjaciol ? 'checked' : ''}>
                <span>Przyjaciele</span>
            </label>
            <label class="adg_checkrow">
                <input type="checkbox" id="adg_sojusz" ${CONFIG.dodawajSojusz ? 'checked' : ''}>
                <span>Sojusznicy klanowi</span>
            </label>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #adg_widget {
            position: fixed;
            background: rgba(8,8,20,.95);
            border: 1px solid #ffaa6688;
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            color: #ffddbb;
            z-index: 99999;
            width: 210px;
            user-select: none;
            font-family: sans-serif;
            line-height: 1.6;
            cursor: move;
        }
        #adg_header {
            display: flex; justify-content: space-between;
            align-items: center; font-weight: bold;
            font-size: 13px; margin-bottom: 4px; color: #ffaa66;
        }
        #adg_hbtns { display: flex; align-items: center; gap: 5px; }
        #adg_collapse {
            background: none; border: 1px solid #ffaa6666;
            color: #ffaa66; border-radius: 4px; cursor: pointer;
            padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .adg_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        #adg_separator { border-top: 1px solid #ffaa6633; margin: 5px 0; }
        #adg_status { font-size: 11px; }
        .adg_row {
            display: flex; align-items: center; gap: 5px;
            margin: 4px 0; font-size: 11px;
        }
        .adg_row input {
            width: 45px; background: rgba(255,170,100,.12);
            border: 1px solid #ffaa6655; border-radius: 4px;
            color: #ffddbb; text-align: center; font-size: 12px; padding: 1px 3px;
        }
        .adg_checkrow {
            display: flex; align-items: center; gap: 5px;
            font-size: 11px; cursor: pointer; margin-top: 3px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('adg_on');
        cbOn.addEventListener('change', () => { CONFIG.enabled = cbOn.checked; saveConfig(); });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        const maxInput = document.getElementById('adg_max');
        maxInput.addEventListener('change', () => {
            CONFIG.maxOsob = Math.max(2, Math.min(10, parseInt(maxInput.value) || 10));
            maxInput.value = CONFIG.maxOsob;
            saveConfig();
        });
        maxInput.addEventListener('mousedown', e => e.stopPropagation());

        const cbKlan = document.getElementById('adg_klan');
        cbKlan.addEventListener('change', () => { CONFIG.dodawajKlan = cbKlan.checked; saveConfig(); });
        cbKlan.addEventListener('mousedown', e => e.stopPropagation());

        const cbFriends = document.getElementById('adg_friends');
        cbFriends.addEventListener('change', () => { CONFIG.dodawajPrzyjaciol = cbFriends.checked; saveConfig(); });
        cbFriends.addEventListener('mousedown', e => e.stopPropagation());

        const cbSojusz = document.getElementById('adg_sojusz');
        cbSojusz.addEventListener('change', () => { CONFIG.dodawajSojusz = cbSojusz.checked; saveConfig(); });
        cbSojusz.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('adg_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('adg_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('adg_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 250));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const updateStatus = (txt, kolor) => {
        const el = document.getElementById('adg_status');
        if (!el) return;
        el.textContent = txt;
        el.style.color = kolor || '#ffddbb';
    };

    const tick = () => {
        const cbOn = document.getElementById('adg_on');
        if (cbOn && !cbOn.checked) { updateStatus('⚪ Wyłączony', '#888'); return; }

        const wGrupie = wielkoscGrupy();

        if (wGrupie >= CONFIG.maxOsob) {
            updateStatus(`✅ Grupa pełna (${wGrupie}/${CONFIG.maxOsob})`, '#66ff99');
            return;
        }

        if (!jestesDowodca()) {
            updateStatus(`🚫 Brak dowództwa (${wGrupie}/${CONFIG.maxOsob})`, '#ff9966');
            return;
        }

        const hero = getHero();
        const heroId = String(hero.id);
        const heroClanId = (hero.clan && hero.clan.id) || 0;
        const others = Engine.others.getDrawableList()
            .filter(o => o.d && o.d.nick && o.d.id)
            .map(o => o.d);

        const teraz = Date.now();
        let zaproszono = null;

        for (const o of others) {
            const id = String(o.id);
            if (id === heroId) continue;
            if (!czySwoj(o, heroClanId)) continue;
            if (jestWGrupie(id)) continue;
            if (ostatnieZaproszenia[id] && (teraz - ostatnieZaproszenia[id]) < CONFIG.cooldownMs) continue;

            zapros(id);
            ostatnieZaproszenia[id] = teraz;
            zaproszono = o.nick;
            break;
        }

        if (zaproszono) {
            updateStatus(`➕ Zaproszono: ${zaproszono} (${wGrupie}/${CONFIG.maxOsob})`, '#ffe066');
        } else {
            updateStatus(`🔍 Szukam swoich (${wGrupie}/${CONFIG.maxOsob})`, '#aee9ff');
        }
    };

    stworzWidget();
    setInterval(tick, CONFIG.intervalMs);
    console.log('[AutoDodawanieGrupy v1.4] Uruchomiony.');
};
        addon();
    }

    function initModul_lista() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: true,
        intervalMs: 1000,
        pokazSwoich: true,
        pokazWrogow: true,
        widgetPos: { x: null, y: 60, right: 12 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('lg_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('lg_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    const PROF_NAZWY = {
        w: 'Wojownik', p: 'Paladyn', b: 'Tancerz', h: 'Łowca', t: 'Tropiciel', m: 'Mag',
    };
    const PROF_KOLORY = {
        w: '#ff6644', p: '#ffcc44', b: '#cc66ff', h: '#66cc66', t: '#66ccff', m: '#ff66cc',
    };

    const kolejka = new Map();
    const ostatnieZaproszenia = {};
    const COOLDOWN = 4000;

    const getHero = () => Engine.hero.d;

    const wWalce = () => Engine.battle && Engine.battle.isBattleShow
        && Engine.battle.isBattleShow() && !Engine.battle.endBattle;

    const walkaSkonczona = () => Engine.battle && Engine.battle.endBattle === true;

    const jestesDowodca = () => {
        if (document.querySelectorAll('.party-member').length === 0) return true;
        return Array.from(document.querySelectorAll('.party__disband'))
            .some(e => e.style.display === 'block');
    };

    const jestWGrupie = (id) => document.querySelector(`.party-member.other-party-id-${id}`) !== null;

    const klasyfikuj = (o, heroClanId) => {
        const rel = o.relation;
        const oClanId = (o.clan && o.clan.id) || 0;
        if (heroClanId > 0 && oClanId === heroClanId) return 'klan';
        if (rel === 4) return 'klan';
        if (rel === 2) return 'klan';
        if (rel === 3) return 'przyjaciel';
        if (rel === 5) return 'sojusz';
        return 'wrog';
    };

    const czySwoj = (kat) => kat === 'klan' || kat === 'przyjaciel' || kat === 'sojusz';

    const zapros = (id) => {
        if (typeof _g === 'function') _g(`party&a=inv&id=${id}`);
    };

    const stworzWidget = () => {
        if (document.getElementById('lg_widget')) return;

        const w = document.createElement('div');
        w.id = 'lg_widget';
        w.innerHTML = `
        <div id="lg_header">
            <span id="lg_title">👥 Gracze na mapie</span>
            <div id="lg_hbtns">
                <span id="lg_queue_badge" style="display:none;">0</span>
                <input type="checkbox" id="lg_on" checked style="display:none;">
                <button id="lg_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="lg_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="lg_battle_info"></div>
            <div id="lg_list"></div>
            <div id="lg_queue_actions" style="display:none;">
                <button id="lg_queue_clear">✖ Wyczyść kolejkę</button>
            </div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #lg_widget {
            position: fixed;
            background: rgba(8,8,20,.95);
            border: 1px solid #88aaff88;
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            color: #cdd9ff;
            z-index: 99999;
            width: 235px;
            max-height: 70vh;
            user-select: none;
            font-family: sans-serif;
            line-height: 1.5;
            display: flex;
            flex-direction: column;
        }
        #lg_header {
            display: flex; justify-content: space-between;
            align-items: center; font-weight: bold;
            font-size: 13px; margin-bottom: 4px; color: #88aaff;
            cursor: move;
        }
        #lg_hbtns { display: flex; align-items: center; gap: 6px; }
        #lg_queue_badge {
            background: #ffaa44; color: #000; font-weight: bold;
            border-radius: 10px; padding: 0 7px; font-size: 11px;
        }
        #lg_collapse {
            background: none; border: 1px solid #88aaff66;
            color: #88aaff; border-radius: 4px; cursor: pointer;
            padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        #lg_body { overflow-y: auto; flex: 1; }
        #lg_battle_info {
            font-size: 11px; text-align: center; margin-bottom: 4px;
            color: #ffcc66;
        }
        .lg_section_title {
            font-size: 10px; text-transform: uppercase;
            letter-spacing: .5px; color: #8899bb;
            margin: 6px 0 2px; border-bottom: 1px solid #ffffff15;
            padding-bottom: 2px;
        }
        .lg_player {
            display: flex; align-items: center; gap: 5px;
            padding: 2px 3px; border-radius: 4px; margin: 1px 0;
        }
        .lg_player:hover { background: rgba(255,255,255,.06); }
        .lg_player.lg_queued { background: rgba(255,170,68,.18); }
        .lg_prof {
            font-size: 9px; font-weight: bold; width: 16px;
            text-align: center; border-radius: 3px; padding: 1px 0;
            background: rgba(255,255,255,.08);
        }
        .lg_nick { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .lg_lvl { font-size: 10px; color: #888; }
        .lg_invite {
            background: rgba(100,200,100,.15);
            border: 1px solid #66cc6666;
            color: #88ee88; border-radius: 4px;
            cursor: pointer; padding: 1px 5px; font-size: 11px;
            white-space: nowrap;
        }
        .lg_invite:hover { background: rgba(100,200,100,.35); }
        .lg_invite.lg_queue_btn { background: rgba(255,170,68,.15); border-color: #ffaa4466; color: #ffcc88; }
        .lg_invite.lg_queue_btn.active { background: #ffaa44; color: #000; }
        .lg_empty { font-size: 11px; color: #666; text-align: center; padding: 6px 0; }
        #lg_queue_actions { margin-top: 5px; }
        #lg_queue_clear {
            width: 100%; background: rgba(255,100,100,.12);
            border: 1px solid #ff666655; color: #ffaaaa;
            border-radius: 5px; cursor: pointer; padding: 3px 0; font-size: 11px;
        }
        #lg_queue_clear:hover { background: rgba(255,100,100,.25); }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        if (CONFIG.widgetPos.x !== null) w.style.left = CONFIG.widgetPos.x + 'px';
        else w.style.right = (CONFIG.widgetPos.right || 12) + 'px';
        w.style.top = (CONFIG.widgetPos.y || 60) + 'px';

        document.getElementById('lg_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('lg_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('lg_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        document.getElementById('lg_queue_clear').addEventListener('click', (e) => {
            e.stopPropagation();
            kolejka.clear();
            odswiezListe();
        });

        const header = document.getElementById('lg_header');
        let drag = false, ox = 0, oy = 0;
        header.addEventListener('mousedown', e => {
            if (e.target.tagName === 'BUTTON' || e.target.id === 'lg_queue_badge') return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - w.offsetTop;
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || null;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || 60;
            saveConfig();
        });
    };

    const wierszGracza = (o, kat, wWalceTeraz) => {
        const prof = (o.prof || '?').toLowerCase();
        const profKolor = PROF_KOLORY[prof] || '#888';
        const id = String(o.id);
        const wKolejce = kolejka.has(id);
        const juzWGrupie = jestWGrupie(id);

        const row = document.createElement('div');
        row.className = 'lg_player' + (wKolejce ? ' lg_queued' : '');

        const profEl = document.createElement('span');
        profEl.className = 'lg_prof';
        profEl.style.color = profKolor;
        profEl.textContent = (o.prof || '?').toUpperCase();
        profEl.title = PROF_NAZWY[prof] || '?';
        row.appendChild(profEl);

        const nickEl = document.createElement('span');
        nickEl.className = 'lg_nick';
        nickEl.textContent = o.nick || '???';
        nickEl.title = (o.clan && o.clan.name) ? o.clan.name : '';
        row.appendChild(nickEl);

        const lvlEl = document.createElement('span');
        lvlEl.className = 'lg_lvl';
        lvlEl.textContent = o.lvl || '';
        row.appendChild(lvlEl);

        if (czySwoj(kat) && !juzWGrupie) {
            const btn = document.createElement('button');
            btn.className = 'lg_invite';
            if (wWalceTeraz) {
                btn.classList.add('lg_queue_btn');
                if (wKolejce) btn.classList.add('active');
                btn.textContent = wKolejce ? '✓ kolejka' : '+ kolejka';
                btn.title = 'Dodaj do kolejki - zaproszę po walce';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (kolejka.has(id)) kolejka.delete(id);
                    else kolejka.set(id, { nick: o.nick, prof: o.prof });
                    odswiezListe();
                });
            } else {
                btn.textContent = '+ zaproś';
                btn.title = 'Zaproś do grupy';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    zapros(id);
                    ostatnieZaproszenia[id] = Date.now();
                    btn.textContent = '✓';
                    setTimeout(() => odswiezListe(), 800);
                });
            }
            row.appendChild(btn);
        } else if (juzWGrupie) {
            const inGrp = document.createElement('span');
            inGrp.style.cssText = 'font-size:10px;color:#66cc66;';
            inGrp.textContent = '✓ w grp';
            row.appendChild(inGrp);
        }

        return row;
    };

    const odswiezListe = () => {
        const lista = document.getElementById('lg_list');
        if (!lista) return;

        const hero = getHero();
        const heroId = String(hero.id);
        const heroClanId = (hero.clan && hero.clan.id) || 0;
        const wWalceTeraz = wWalce();

        const battleInfo = document.getElementById('lg_battle_info');
        if (wWalceTeraz) {
            battleInfo.textContent = `⚔️ Walka - dodaj do kolejki (${kolejka.size})`;
        } else if (kolejka.size > 0) {
            battleInfo.textContent = `⏳ Kolejka: ${kolejka.size} - zaproszę po walce`;
        } else {
            battleInfo.textContent = '';
        }

        const badge = document.getElementById('lg_queue_badge');
        if (kolejka.size > 0) { badge.style.display = 'inline-block'; badge.textContent = kolejka.size; }
        else badge.style.display = 'none';

        document.getElementById('lg_queue_actions').style.display = kolejka.size > 0 ? 'block' : 'none';

        const others = Engine.others.getDrawableList()
            .filter(o => o.d && o.d.nick && o.d.id && String(o.d.id) !== heroId)
            .map(o => o.d);

        const mapaGraczy = {};
        others.forEach(o => { mapaGraczy[String(o.id)] = o; });

        const swoi = [];
        const wrogowie = [];
        for (const o of others) {
            const kat = klasyfikuj(o, heroClanId);
            if (czySwoj(kat)) swoi.push({ o, kat });
            else wrogowie.push({ o, kat });
        }

        const sortNick = (a, b) => (a.o.nick||'').localeCompare(b.o.nick||'');

        lista.innerHTML = '';

        if (kolejka.size > 0) {
            const t = document.createElement('div');
            t.className = 'lg_section_title';
            t.style.color = '#ffaa44';
            t.textContent = `⏳ Kolejka dodawania (${kolejka.size})`;
            lista.appendChild(t);

            for (const [id, dane] of kolejka) {
                const o = mapaGraczy[id];
                const row = document.createElement('div');
                row.className = 'lg_player lg_queued';

                const prof = ((o ? o.prof : dane.prof) || '?').toLowerCase();
                const profEl = document.createElement('span');
                profEl.className = 'lg_prof';
                profEl.style.color = PROF_KOLORY[prof] || '#888';
                profEl.textContent = ((o ? o.prof : dane.prof) || '?').toUpperCase();
                row.appendChild(profEl);

                const nickEl = document.createElement('span');
                nickEl.className = 'lg_nick';
                const nick = (o ? o.nick : dane.nick) || '???';
                nickEl.textContent = o ? nick : `${nick} (poza zasięgiem)`;
                if (!o) nickEl.style.color = '#999';
                row.appendChild(nickEl);

                const delBtn = document.createElement('button');
                delBtn.className = 'lg_invite';
                delBtn.style.cssText = 'background:rgba(255,100,100,.15);border-color:#ff666666;color:#ffaaaa;';
                delBtn.textContent = '✖';
                delBtn.title = 'Usuń z kolejki';
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    kolejka.delete(id);
                    odswiezListe();
                });
                row.appendChild(delBtn);

                lista.appendChild(row);
            }
        }

        const dodajSekcjeProfesji = (gracze, naglowekPrefix, naglowekKolor) => {
            const wgProf = {};
            for (const item of gracze) {
                const p = (item.o.prof || '?').toLowerCase();
                if (!wgProf[p]) wgProf[p] = [];
                wgProf[p].push(item);
            }
            const kolejnosc = ['w', 'p', 'b', 'h', 't', 'm'];
            const profKeys = Object.keys(wgProf).sort((a, b) => {
                const ia = kolejnosc.indexOf(a); const ib = kolejnosc.indexOf(b);
                return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
            });

            for (const p of profKeys) {
                const grupa = wgProf[p].sort(sortNick);
                const t = document.createElement('div');
                t.className = 'lg_section_title';
                t.style.color = naglowekKolor;
                const profNazwa = PROF_NAZWY[p] || p.toUpperCase();
                t.innerHTML = `<span style="color:${PROF_KOLORY[p] || '#888'}">●</span> ${naglowekPrefix} ${profNazwa} (${grupa.length})`;
                lista.appendChild(t);
                grupa.forEach(({o, kat}) => lista.appendChild(wierszGracza(o, kat, wWalceTeraz)));
            }
        };

        if (CONFIG.pokazSwoich) {
            const naglowek = document.createElement('div');
            naglowek.className = 'lg_section_title';
            naglowek.style.cssText = 'color:#66cc66;font-size:11px;margin-top:8px;';
            naglowek.textContent = `🟢 KLANOWICZE (${swoi.length})`;
            lista.appendChild(naglowek);
            if (swoi.length === 0) {
                const e = document.createElement('div'); e.className = 'lg_empty'; e.textContent = 'brak';
                lista.appendChild(e);
            } else {
                dodajSekcjeProfesji(swoi, '', '#88bb88');
            }
        }

        if (CONFIG.pokazWrogow) {
            const naglowek = document.createElement('div');
            naglowek.className = 'lg_section_title';
            naglowek.style.cssText = 'color:#ff6666;font-size:11px;margin-top:8px;';
            naglowek.textContent = `🔴 WROGOWIE (${wrogowie.length})`;
            lista.appendChild(naglowek);
            if (wrogowie.length === 0) {
                const e = document.createElement('div'); e.className = 'lg_empty'; e.textContent = 'brak';
                lista.appendChild(e);
            } else {
                dodajSekcjeProfesji(wrogowie, '', '#bb8888');
            }
        }
    };

    let juzZaproszonoZKolejki = false;

    const obslugaKolejki = () => {
        if (walkaSkonczona() && kolejka.size > 0 && !juzZaproszonoZKolejki) {
            if (jestesDowodca()) {
                const teraz = Date.now();
                let i = 0;
                for (const id of kolejka.keys()) {
                    if (jestWGrupie(id)) continue;
                    if (ostatnieZaproszenia[id] && (teraz - ostatnieZaproszenia[id]) < COOLDOWN) continue;
                    setTimeout(() => zapros(id), i * 150);
                    ostatnieZaproszenia[id] = teraz;
                    i++;
                }
                kolejka.clear();
            }
            juzZaproszonoZKolejki = true;
        }
        if (!wWalce() && !walkaSkonczona()) {
            juzZaproszonoZKolejki = false;
        }
    };

    const tick = () => {
        const cbOn = document.getElementById('lg_on');
        const wlaczony = !cbOn || cbOn.checked;
        if (!wlaczony) {
            const lista = document.getElementById('lg_list');
            if (lista) lista.innerHTML = '<div class="lg_empty">Wyłączony</div>';
            return;
        }
        odswiezListe();
        obslugaKolejki();
    };

    stworzWidget();
    setInterval(tick, CONFIG.intervalMs);
    setInterval(() => {
        const cbOn = document.getElementById('lg_on');
        if (cbOn && !cbOn.checked) return;
        obslugaKolejki();
    }, 100);
    console.log('[ListaGraczy v1.3] Uruchomiony.');
};
        addon();
    }

    function initModul_przywolanie() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: true,
        profilEnabled: false,
        kierunek: 'dol',
        kroki: 1,
        dialog: false,
        dialogRazy: 2,
        opoznienieMs: 500,
        widgetPos: { x: 12, y: null, bottom: 310 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('aprz_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('aprz_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    let ostatniaAkceptacja = 0;
    const SLOWO_KLUCZ = 'przyzywa';

    const KIERUNKI = {
        gora:  { dx: 0,  dy: -1, label: '⬆ Góra' },
        dol:   { dx: 0,  dy: 1,  label: '⬇ Dół' },
        lewo:  { dx: -1, dy: 0,  label: '⬅ Lewo' },
        prawo: { dx: 1,  dy: 0,  label: '➡ Prawo' },
    };

    const wlaczony = () => {
        const cb = document.getElementById('aprz_on');
        return !cb || cb.checked;
    };

    const stoi = () => {
        const h = Engine.hero.d;
        return Engine.hero.rx === h.x && Engine.hero.ry === h.y;
    };

    const krok = (dx, dy) => {
        try {
            const h = Engine.hero.d;
            const nx = h.x + dx, ny = h.y + dy;
            if (Engine.map.col.check(nx, ny) === 0) {
                Engine.hero.nextStep(nx, ny);
                return true;
            }
        } catch(e) {}
        return false;
    };

    const wykonajRuch = (dir, kroki, onDone) => {
        const k = KIERUNKI[dir];
        if (!k || kroki <= 0) { if (onDone) onDone(); return; }
        let zrobione = 0;
        const nastepny = () => {
            if (zrobione >= kroki) { if (onDone) onDone(); return; }
            krok(k.dx, k.dy);
            zrobione++;
            let czas = 0;
            const czekaj = setInterval(() => {
                czas += 80;
                if (stoi() || czas > 2000) {
                    clearInterval(czekaj);
                    setTimeout(nastepny, 130);
                }
            }, 80);
        };
        nastepny();
    };

    const wykonajDialog = (ileRazy) => {
        try { Engine.hero.talkNearMob(); } catch(e) {}
        setTimeout(() => {
            let i = 0;
            const klik = () => {
                if (i >= ileRazy) return;
                const opcja = document.querySelectorAll('.answer-text')[0];
                if (opcja) opcja.click();
                i++;
                setTimeout(klik, 320);
            };
            klik();
        }, 600);
    };

    const wykonajProfil = () => {
        if (!CONFIG.profilEnabled) return;
        setTimeout(() => {
            wykonajRuch(CONFIG.kierunek, CONFIG.kroki, () => {
                if (CONFIG.dialog) wykonajDialog(CONFIG.dialogRazy);
            });
        }, CONFIG.opoznienieMs);
    };

    const sprobujZaakceptowac = () => {
        if (!wlaczony()) return;
        const przycisk = document.querySelector('.alert-accept-hotkey');
        if (!przycisk || przycisk.offsetParent === null) return;
        const tekst = document.body.innerText || '';
        if (!new RegExp(SLOWO_KLUCZ, 'i').test(tekst)) return;

        const teraz = Date.now();
        if (teraz - ostatniaAkceptacja < 1500) return;
        ostatniaAkceptacja = teraz;

        przycisk.click();
        wykonajProfil();
    };

    const stworzWidget = () => {
        if (document.getElementById('aprz_widget')) return;

        const opcjeKier = Object.keys(KIERUNKI).map(k =>
            `<option value="${k}" ${CONFIG.kierunek === k ? 'selected' : ''}>${KIERUNKI[k].label}</option>`).join('');

        const w = document.createElement('div');
        w.id = 'aprz_widget';
        w.innerHTML = `
        <div id="aprz_header">
            <span id="aprz_title">📨 Auto Przywołanie</span>
            <div id="aprz_hbtns">
                <label class="aprz_toggle"><input type="checkbox" id="aprz_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="aprz_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="aprz_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <label class="aprz_check">
                <input type="checkbox" id="aprz_profil" ${CONFIG.profilEnabled ? 'checked' : ''}>
                <span>Wykonaj akcje po przywołaniu</span>
            </label>
            <div class="aprz_row">
                <span>Ruch:</span>
                <select id="aprz_kier">${opcjeKier}</select>
                <input id="aprz_kroki" type="number" min="0" max="20" value="${CONFIG.kroki}">
                <span>kr.</span>
            </div>
            <label class="aprz_check">
                <input type="checkbox" id="aprz_dialog" ${CONFIG.dialog ? 'checked' : ''}>
                <span>Zagadaj NPC + 1. opcja</span>
            </label>
            <div class="aprz_row">
                <span>Ile razy 1. opcja:</span>
                <input id="aprz_dialograzy" type="number" min="1" max="9" value="${CONFIG.dialogRazy}">
            </div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #aprz_widget {
            position: fixed; background: rgba(8,8,20,.95);
            border: 1px solid #66ddaa88; border-radius: 10px;
            padding: 8px 10px; font-size: 12px; color: #cceedd;
            z-index: 99999; width: 220px; user-select: none;
            font-family: sans-serif; line-height: 1.6; cursor: move;
        }
        #aprz_header {
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #66ddaa;
        }
        #aprz_hbtns { display: flex; align-items: center; gap: 5px; }
        #aprz_collapse {
            background: none; border: 1px solid #66ddaa66; color: #66ddaa;
            border-radius: 4px; cursor: pointer; padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .aprz_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        .aprz_check { display: flex; align-items: center; gap: 5px; font-size: 11px; cursor: pointer; margin: 4px 0; }
        .aprz_row { display: flex; align-items: center; gap: 5px; font-size: 11px; margin: 4px 0; }
        .aprz_row select {
            background: #0e2820; border: 1px solid #66ddaa55;
            border-radius: 4px; color: #cceedd; font-size: 11px; padding: 1px 3px; flex: 1;
        }
        .aprz_row select option {
            background: #0e2820; color: #cceedd;
        }
        .aprz_row input {
            width: 48px; background: rgba(100,220,170,.12); border: 1px solid #66ddaa55;
            border-radius: 4px; color: #cceedd; text-align: center; font-size: 11px; padding: 1px 3px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('aprz_on');
        cbOn.addEventListener('change', () => {
            CONFIG.enabled = cbOn.checked;
            saveConfig();
        });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        const bind = (id, fn) => {
            const el = document.getElementById(id);
            el.addEventListener('change', fn);
            el.addEventListener('mousedown', e => e.stopPropagation());
            return el;
        };

        const cbProfil = bind('aprz_profil', () => { CONFIG.profilEnabled = cbProfil.checked; saveConfig(); });
        const selKier = bind('aprz_kier', () => { CONFIG.kierunek = selKier.value; saveConfig(); });
        const inpKroki = bind('aprz_kroki', () => {
            CONFIG.kroki = Math.max(0, Math.min(20, parseInt(inpKroki.value) || 0)); inpKroki.value = CONFIG.kroki; saveConfig();
        });
        const cbDialog = bind('aprz_dialog', () => { CONFIG.dialog = cbDialog.checked; saveConfig(); });
        const inpRazy = bind('aprz_dialograzy', () => {
            CONFIG.dialogRazy = Math.max(1, Math.min(9, parseInt(inpRazy.value) || 1)); inpRazy.value = CONFIG.dialogRazy; saveConfig();
        });

        document.getElementById('aprz_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('aprz_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('aprz_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON','SELECT'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 310));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const uruchomObserwator = () => {
        let zaplanowane = null;
        const obs = new MutationObserver(() => {
            if (zaplanowane) return;
            zaplanowane = setTimeout(() => {
                zaplanowane = null;
                sprobujZaakceptowac();
            }, 120);
        });
        obs.observe(document.body, { childList: true, subtree: true });
    };

    stworzWidget();
    uruchomObserwator();
    console.log('[AutoPrzywolanie v4.1] Uruchomiony.');
};
        addon();
    }

    function initModul_kopalnia() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: false,
        nazwaZloza: 'Błękitne złoże',
        nazwaKilofa: 'Porzucony kilof',
        maxZasieg: 7,
        intervalMs: 600,
        widgetPos: { x: 12, y: null, bottom: 360 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('akop_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('akop_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    let tryb = 'zloza';
    let ostatniaAkcja = 0;
    let ostatniCelId = null;
    let ostatniCelCzas = 0;

    const getHero = () => Engine.hero.d;

    const wWalce = () => Engine.battle && Engine.battle.isBattleShow
        && Engine.battle.isBattleShow() && !Engine.battle.endBattle;

    const stoi = () => {
        const h = getHero();
        return Engine.hero.rx === h.x && Engine.hero.ry === h.y;
    };

    const dystans = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    const znajdzNpc = (nazwa) => {
        try {
            return Engine.npcs.getDrawableList()
                .filter(o => o.d && o.d.nick === nazwa)
                .map(o => o.d);
        } catch(e) { return []; }
    };

    const oknoBrakKilofa = () => {
        const txt = document.body.innerText || '';
        return /potrzebny jest odpowiedni kilof/i.test(txt);
    };

    const zamknijDialog = () => {
        try {
            const canvas = document.querySelector('#game-canvas, canvas, #map, .map-canvas')
                || document.body;
            const r = canvas.getBoundingClientRect();
            const x = r.left + r.width / 2;
            const y = r.top + r.height / 2;
            ['mousedown','mouseup','click'].forEach(typ => {
                canvas.dispatchEvent(new MouseEvent(typ, {
                    bubbles: true, cancelable: true, view: window,
                    clientX: x, clientY: y,
                }));
            });
        } catch(e) {}
    };

    const idzDo = (x, y) => { try { Engine.hero.autoGoTo({ x, y }); } catch(e) {} };
    const zbierz = () => { try { Engine.hero.talkNearMob(); } catch(e) {} };

    const stworzWidget = () => {
        if (document.getElementById('akop_widget')) return;

        const w = document.createElement('div');
        w.id = 'akop_widget';
        w.innerHTML = `
        <div id="akop_header">
            <span id="akop_title">⛏️ Auto Kopalnia</span>
            <div id="akop_hbtns">
                <label class="akop_toggle"><input type="checkbox" id="akop_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="akop_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="akop_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="akop_status">⚪ Wyłączony</div>
            <div id="akop_tryb" style="font-size:11px;"></div>
            <div id="akop_separator"></div>
            <div class="akop_row">
                <span>Złoże:</span>
                <input id="akop_nazwa" type="text" value="${CONFIG.nazwaZloza}">
            </div>
            <div class="akop_row">
                <span>Kilof:</span>
                <input id="akop_kilof" type="text" value="${CONFIG.nazwaKilofa}">
            </div>
            <div class="akop_row">
                <span>Zasięg:</span>
                <input id="akop_zasieg" type="number" min="1" max="20" value="${CONFIG.maxZasieg}" style="flex:0 0 50px;">
                <span style="min-width:auto;">kratek</span>
            </div>
            <div id="akop_count" style="font-size:11px;color:#aaa;"></div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #akop_widget {
            position: fixed; background: rgba(8,8,20,.95);
            border: 1px solid #ddaa6688; border-radius: 10px;
            padding: 8px 10px; font-size: 12px; color: #eeddcc;
            z-index: 99999; width: 215px; user-select: none;
            font-family: sans-serif; line-height: 1.6; cursor: move;
        }
        #akop_header {
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #ddaa66;
        }
        #akop_hbtns { display: flex; align-items: center; gap: 5px; }
        #akop_collapse {
            background: none; border: 1px solid #ddaa6666; color: #ddaa66;
            border-radius: 4px; cursor: pointer; padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .akop_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        #akop_separator { border-top: 1px solid #ddaa6633; margin: 5px 0; }
        #akop_status { font-size: 11px; }
        .akop_row { display: flex; align-items: center; gap: 5px; margin: 4px 0; font-size: 11px; }
        .akop_row span { min-width: 38px; }
        .akop_row input {
            flex: 1; background: rgba(220,170,100,.12); border: 1px solid #ddaa6655;
            border-radius: 4px; color: #eeddcc; font-size: 11px; padding: 2px 5px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('akop_on');
        cbOn.addEventListener('change', () => {
            CONFIG.enabled = cbOn.checked;
            if (cbOn.checked) { tryb = 'zloza'; }
            saveConfig();
        });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        const nazwaInput = document.getElementById('akop_nazwa');
        nazwaInput.addEventListener('change', () => {
            CONFIG.nazwaZloza = nazwaInput.value.trim() || 'Błękitne złoże';
            nazwaInput.value = CONFIG.nazwaZloza; saveConfig();
        });
        nazwaInput.addEventListener('mousedown', e => e.stopPropagation());

        const kilofInput = document.getElementById('akop_kilof');
        kilofInput.addEventListener('change', () => {
            CONFIG.nazwaKilofa = kilofInput.value.trim() || 'Porzucony kilof';
            kilofInput.value = CONFIG.nazwaKilofa; saveConfig();
        });
        kilofInput.addEventListener('mousedown', e => e.stopPropagation());

        const zasiegInput = document.getElementById('akop_zasieg');
        zasiegInput.addEventListener('change', () => {
            CONFIG.maxZasieg = Math.max(1, Math.min(20, parseInt(zasiegInput.value) || 7));
            zasiegInput.value = CONFIG.maxZasieg; saveConfig();
        });
        zasiegInput.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('akop_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('akop_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('akop_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 360));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const updateStatus = (txt, kolor) => {
        const el = document.getElementById('akop_status');
        if (el) { el.textContent = txt; el.style.color = kolor || '#eeddcc'; }
    };
    const updateTryb = (txt, kolor) => {
        const el = document.getElementById('akop_tryb');
        if (el) { el.textContent = txt; el.style.color = kolor || '#aaa'; }
    };
    const updateCount = (txt) => {
        const el = document.getElementById('akop_count');
        if (el) el.textContent = txt;
    };

    const obsluzCel = (lista, etykieta, kolorIdzie, kolorZbiera) => {
        const hero = getHero();
        const wZasiegu = lista.filter(n => dystans(hero, n) <= CONFIG.maxZasieg);
        if (wZasiegu.length === 0) return false;

        let cel = null, minD = Infinity;
        for (const n of wZasiegu) {
            const d = dystans(hero, n);
            if (d < minD) { minD = d; cel = n; }
        }
        if (!cel) return false;

        const teraz = Date.now();
        const d = dystans(hero, cel);

        if (cel.id === ostatniCelId) {
            if (teraz - ostatniCelCzas > 8000) {
                const inne = wZasiegu.filter(n => n.id !== cel.id);
                if (inne.length) {
                    let c2=null, m2=Infinity;
                    for (const n of inne){ const dd=dystans(hero,n); if(dd<m2){m2=dd;c2=n;} }
                    cel = c2; ostatniCelId = cel.id; ostatniCelCzas = teraz;
                }
            }
        } else {
            ostatniCelId = cel.id;
            ostatniCelCzas = teraz;
        }

        if (d <= 2) {
            if (teraz - ostatniaAkcja > 1100) {
                ostatniaAkcja = teraz;
                zbierz();
                updateStatus(`⛏️ Zbieram ${etykieta} (${d}kr)`, kolorZbiera);
            }
        } else {
            if (stoi() && teraz - ostatniaAkcja > 700) {
                ostatniaAkcja = teraz;
                idzDo(cel.x, cel.y);
            }
            updateStatus(`🚶 Idę do ${etykieta} (${d}kr)`, kolorIdzie);
        }
        return true;
    };

    const tick = () => {
        const cbOn = document.getElementById('akop_on');
        if (cbOn && !cbOn.checked) { updateStatus('⚪ Wyłączony', '#888'); updateTryb(''); updateCount(''); return; }

        if (wWalce()) { updateStatus('⚔️ Walka - czekam', '#ff9966'); return; }

        if (oknoBrakKilofa()) {
            zamknijDialog();
            tryb = 'kilofy';
            updateStatus('🚫 Brak kilofa - idę po kilof', '#ffcc44');
            return;
        }

        const hero = getHero();
        const zlozaAll  = znajdzNpc(CONFIG.nazwaZloza);
        const kilofyAll = znajdzNpc(CONFIG.nazwaKilofa);
        const zloza  = zlozaAll.filter(n => dystans(hero, n) <= CONFIG.maxZasieg);
        const kilofy = kilofyAll.filter(n => dystans(hero, n) <= CONFIG.maxZasieg);
        updateCount(`W zasięgu ${CONFIG.maxZasieg}kr — złóż: ${zloza.length} · kilofów: ${kilofy.length}`);

        if (tryb === 'kilofy') {
            updateTryb('🔧 Tryb: zbieranie kilofów', '#ffcc44');
            if (kilofy.length === 0) {
                updateStatus('⏳ Brak kilofów w zasięgu - czekam', '#aaa');
                tryb = 'zloza';
                return;
            }
            const ok = obsluzCel(kilofy, 'kilofa', '#aee9ff', '#66ff99');
            if (!ok) { tryb = 'zloza'; }
            if (kilofy.length <= 1) tryb = 'zloza';
            return;
        }

        updateTryb('💎 Tryb: zbieranie złóż', '#88ccff');
        if (zloza.length === 0) {
            updateStatus(`🔍 Brak złóż w zasięgu ${CONFIG.maxZasieg}kr`, '#aaa');
            return;
        }
        obsluzCel(zloza, 'złoża', '#aee9ff', '#66ff99');
    };

    stworzWidget();
    setInterval(tick, CONFIG.intervalMs);
    console.log('[AutoKopalnia v2.1] Uruchomiony.');
};
        addon();
    }

    function initModul_wylogowanie() {
        const addon = () => {

    let juzWylogowano = false;

    const stworzPrzelacznik = () => {
        if (document.getElementById('awyl_on')) return;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'awyl_on';
        cb.checked = true;
        cb.style.display = 'none';
        document.body.appendChild(cb);
    };

    const wlaczony = () => {
        const cb = document.getElementById('awyl_on');
        return !cb || cb.checked;
    };

    const martwy = () => {
        const ov = document.querySelector('.dead-overlay');
        return ov && ov.offsetParent !== null;
    };

    const wyloguj = () => {
        const labelki = Array.from(document.querySelectorAll('.button .label, .label'));
        for (const l of labelki) {
            if (/^\s*wyloguj\s*$/i.test(l.textContent)) {
                const btn = l.closest('.button') || l.parentElement;
                if (btn) { btn.click(); return true; }
            }
        }
        return false;
    };

    const sprobuj = () => {
        if (!wlaczony()) return;
        if (juzWylogowano) return;
        if (!martwy()) return;

        const ok = wyloguj();
        if (ok) {
            juzWylogowano = true;
            console.log('[AutoWylogowanie] Postać nieprzytomna - wylogowano.');
        }
    };

    const uruchomObserwator = () => {
        let zaplanowane = null;
        const obs = new MutationObserver(() => {
            if (zaplanowane) return;
            zaplanowane = setTimeout(() => {
                zaplanowane = null;
                sprobuj();
            }, 150);
        });
        obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    };

    stworzPrzelacznik();
    uruchomObserwator();
    console.log('[AutoWylogowanie v1.0] Uruchomiony (tryb obserwatora).');
};
        addon();
    }

    function initModul_jebadlo() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: false,
        lvlMin: 0,
        lvlMax: 500,
        intervalMs: 50,
        widgetPos: { x: 12, y: null, bottom: 410 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('aatk_config');
            if (saved) return Object.assign({}, DOMYSLNE, JSON.parse(saved));
        } catch(e) {}
        return Object.assign({}, DOMYSLNE);
    };
    const saveConfig = () => localStorage.setItem('aatk_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    let ostatniAtak = 0;

    const getHero = () => Engine.hero.d;
    const getMapPvp = () => { try { return Engine.map.d.pvp; } catch(e) { return null; } };

    const pozaWalka = () => {
        try {
            if (Engine.battle && Engine.battle.isBattleShow) {
                return !Engine.battle.isBattleShow();
            }
            return true;
        } catch(e) { return true; }
    };

    const czyWrog = (o, heroId, heroClanId) => {
        if (heroId && o.id && String(o.id) === String(heroId)) return false;
        const rel = o.relation;
        const oClanId = (o.clan && o.clan.id) || 0;
        if (heroClanId > 0 && oClanId === heroClanId) return false;
        if (rel === 2 || rel === 4) return false;
        if (rel === 2 || rel === 3) return false;
        if (rel === 5) return false;
        return true;
    };

    const wWalce = (o) => {
        try {
            const obj = Engine.others.getById(o.id);
            if (!obj || !obj.getOnSelfEmoList) return false;
            const emo = obj.getOnSelfEmoList()[0];
            return emo ? emo.type === 'battle' : false;
        } catch(e) { return false; }
    };

    const znajdzCele = () => {
        const hero = getHero();
        const heroId = String(hero.id);
        const heroClanId = (hero.clan && hero.clan.id) || 0;
        let lista;
        try {
            lista = Engine.others.getDrawableList().filter(o => o.d).map(o => o.d);
        } catch(e) { return []; }

        return lista
            .filter(o => o.nick && o.id)
            .filter(o => czyWrog(o, heroId, heroClanId))
            .filter(o => o.lvl >= CONFIG.lvlMin && o.lvl <= CONFIG.lvlMax)
            .filter(o => !wWalce(o));
    };

    const atakuj = (cel) => {
        const teraz = Date.now() / 1000;
        if (teraz - ostatniAtak < 0.3) return;
        if (typeof _g !== 'function') return;
        _g(`fight&a=attack&id=${cel.id}`);
        ostatniAtak = teraz;
    };

    const stworzWidget = () => {
        if (document.getElementById('aatk_widget')) return;

        const w = document.createElement('div');
        w.id = 'aatk_widget';
        w.innerHTML = `
        <div id="aatk_header">
            <span id="aatk_title">💀 GoDowskie Jebadło</span>
            <div id="aatk_hbtns">
                <label class="aatk_toggle"><input type="checkbox" id="aatk_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="aatk_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="aatk_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="aatk_status">⚪ Wyłączony</div>
            <div id="aatk_separator"></div>
            <div class="aatk_row">
                <span>Poziom wroga:</span>
            </div>
            <div class="aatk_row">
                <span>od</span>
                <input id="aatk_lvlmin" type="number" min="0" max="500" value="${CONFIG.lvlMin}">
                <span>do</span>
                <input id="aatk_lvlmax" type="number" min="0" max="500" value="${CONFIG.lvlMax}">
            </div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #aatk_widget {
            position: fixed; background: rgba(20,8,8,.95);
            border: 1px solid #ff665588; border-radius: 10px;
            padding: 8px 10px; font-size: 12px; color: #ffdddd;
            z-index: 99999; width: 215px; user-select: none;
            font-family: sans-serif; line-height: 1.6; cursor: move;
        }
        #aatk_header {
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #ff6655;
        }
        #aatk_hbtns { display: flex; align-items: center; gap: 5px; }
        #aatk_collapse {
            background: none; border: 1px solid #ff665566; color: #ff6655;
            border-radius: 4px; cursor: pointer; padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .aatk_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        #aatk_separator { border-top: 1px solid #ff665533; margin: 5px 0; }
        #aatk_status { font-size: 11px; }
        .aatk_row { display: flex; align-items: center; gap: 5px; margin: 4px 0; font-size: 11px; }
        .aatk_row input {
            width: 50px; background: rgba(255,100,90,.12); border: 1px solid #ff665555;
            border-radius: 4px; color: #ffdddd; text-align: center; font-size: 12px; padding: 1px 3px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('aatk_on');
        cbOn.addEventListener('change', () => { CONFIG.enabled = cbOn.checked; saveConfig(); });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        const lvlMin = document.getElementById('aatk_lvlmin');
        lvlMin.addEventListener('change', () => {
            CONFIG.lvlMin = Math.max(0, Math.min(500, parseInt(lvlMin.value) || 0));
            lvlMin.value = CONFIG.lvlMin; saveConfig();
        });
        lvlMin.addEventListener('mousedown', e => e.stopPropagation());

        const lvlMax = document.getElementById('aatk_lvlmax');
        lvlMax.addEventListener('change', () => {
            CONFIG.lvlMax = Math.max(0, Math.min(500, parseInt(lvlMax.value) || 500));
            lvlMax.value = CONFIG.lvlMax; saveConfig();
        });
        lvlMax.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('aatk_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('aatk_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('aatk_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 410));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const updateStatus = (txt, kolor) => {
        const el = document.getElementById('aatk_status');
        if (el) { el.textContent = txt; el.style.color = kolor || '#ffdddd'; }
    };

    const tick = () => {
        const cbOn = document.getElementById('aatk_on');
        if (cbOn && !cbOn.checked) { updateStatus('⚪ Wyłączony', '#888'); return; }

        if (getMapPvp() !== 2) { updateStatus('🟢 Włączony – poza czerwoną mapą', '#88cc88'); return; }

        if (!pozaWalka()) { updateStatus('🟢 Włączony – trwa walka', '#88cc88'); return; }

        const cele = znajdzCele();
        if (cele.length === 0) { updateStatus('🟢 Włączony – brak wrogów', '#88cc88'); return; }

        const hero = getHero();
        const cel = cele.find(t =>
            Math.abs(t.x - hero.x) <= 2 &&
            Math.abs(t.y - hero.y) <= 2);

        if (cel) {
            atakuj(cel);
            updateStatus(`🗡️ Atakuję: ${cel.nick} (${cel.lvl})`, '#ff7766');
        } else {
            updateStatus(`👀 Włączony – wrogowie w pobliżu: ${cele.length}`, '#aee9ff');
        }
    };

    stworzWidget();
    setInterval(tick, CONFIG.intervalMs);
    console.log('[GoDowskie Jebadło v1.5] Uruchomiony.');
};
        addon();
    }

    function initModul_tytan() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: false,
        zestaw: 1,
        progWt: 90,
        intervalMs: 100,
        widgetPos: { x: 12, y: null, bottom: 460 },
        zwiniety: false,
    };

    const idPostaci = () => {
        try { return String(window.getCookie('mchar_id') || 'x'); } catch(e) { return 'x'; }
    };
    const kluczZestawu = () => 'aztyt_zestaw_' + idPostaci();

    const loadZestawPostaci = () => {
        try {
            const v = parseInt(localStorage.getItem(kluczZestawu()), 10);
            if (Number.isFinite(v) && v >= 1 && v <= 9) return v;
        } catch(e) {}
        return null;
    };
    const saveZestawPostaci = (nr) => {
        try { localStorage.setItem(kluczZestawu(), String(nr)); } catch(e) {}
    };

    const loadConfig = () => {
        let c;
        try {
            const saved = localStorage.getItem('aztyt_config');
            c = saved ? Object.assign({}, DOMYSLNE, JSON.parse(saved)) : Object.assign({}, DOMYSLNE);
        } catch(e) { c = Object.assign({}, DOMYSLNE); }
        const perPost = loadZestawPostaci();
        if (perPost !== null) c.zestaw = perPost;
        return c;
    };
    const saveConfig = () => {
        const doZapisu = Object.assign({}, CONFIG);
        delete doZapisu.zestaw;
        localStorage.setItem('aztyt_config', JSON.stringify(doZapisu));
    };
    const CONFIG = loadConfig();

    let ostatniaZmiana = 0;
    let oczekiwany = null;

    const wWalce = () => {
        try { return Engine.battle && Engine.battle.isBattleShow && Engine.battle.isBattleShow(); }
        catch(e) { return false; }
    };

    const znajdzTytana = () => {
        try {
            return Engine.npcs.getDrawableList()
                .filter(o => o.d && o.d.nick)
                .map(o => o.d)
                .filter(n => (n.wt || 0) >= CONFIG.progWt)
                .sort((a, b) => (b.wt || 0) - (a.wt || 0))[0] || null;
        } catch(e) { return null; }
    };

    const aktualnyZestaw = () => {
        try {
            const el = Array.from(document.querySelectorAll('.builds-interface'))
                .filter(e => !e.closest('#aztyt_widget'))
                .find(e => e.offsetParent !== null);
            if (!el) return null;
            const txt = (el.querySelector('.choose-build.build-index') || el).textContent || '';
            const no = parseInt(txt.trim(), 10);
            return Number.isFinite(no) ? no : null;
        } catch (e) { return null; }
    };

    const zmienZestaw = (nr) => {
        if (nr < 1 || nr > 9) return;
        const teraz = Date.now();
        if (teraz - ostatniaZmiana < 800) return;
        const aktualny = aktualnyZestaw();
        if (aktualny === nr) { oczekiwany = null; return; }
        if (typeof _g !== 'function') return;
        ostatniaZmiana = teraz;
        oczekiwany = nr;
        _g('builds&action=updateCurrent&id=' + encodeURIComponent(String(nr)));
        setTimeout(() => {
            if (oczekiwany !== nr) return;
            if (aktualnyZestaw() === nr) oczekiwany = null;
            else oczekiwany = null;
        }, 700);
    };

    const stworzWidget = () => {
        if (document.getElementById('aztyt_widget')) return;

        const w = document.createElement('div');
        w.id = 'aztyt_widget';
        w.innerHTML = `
        <div id="aztyt_header">
            <span id="aztyt_title">🐲 Zestaw na Tytana</span>
            <div id="aztyt_hbtns">
                <label class="aztyt_toggle"><input type="checkbox" id="aztyt_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="aztyt_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="aztyt_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div id="aztyt_status">⚪ Wyłączony</div>
            <div class="aztyt_sep"></div>
            <div class="aztyt_row">
                <span>Zestaw na tytana:</span>
                <input id="aztyt_zestaw" type="number" min="1" max="9" value="${CONFIG.zestaw}">
            </div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #aztyt_widget {
            position: fixed; background: rgba(20,12,8,.95);
            border: 1px solid #ffaa4488; border-radius: 10px;
            padding: 8px 10px; font-size: 12px; color: #ffe6cc;
            z-index: 99999; width: 215px; user-select: none;
            font-family: sans-serif; line-height: 1.6; cursor: move;
        }
        #aztyt_header {
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #ffaa44;
        }
        #aztyt_hbtns { display: flex; align-items: center; gap: 5px; }
        #aztyt_collapse {
            background: none; border: 1px solid #ffaa4466; color: #ffaa44;
            border-radius: 4px; cursor: pointer; padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .aztyt_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        .aztyt_sep { border-top: 1px solid #ffaa4433; margin: 5px 0; }
        #aztyt_status { font-size: 11px; }
        .aztyt_row { display: flex; align-items: center; gap: 5px; font-size: 11px; margin: 4px 0; justify-content: space-between; }
        .aztyt_row input {
            width: 50px; background: rgba(255,170,68,.12); border: 1px solid #ffaa4455;
            border-radius: 4px; color: #ffe6cc; text-align: center; font-size: 12px; padding: 1px 3px;
        }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('aztyt_on');
        cbOn.addEventListener('change', () => { CONFIG.enabled = cbOn.checked; saveConfig(); });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        const inpZ = document.getElementById('aztyt_zestaw');
        inpZ.addEventListener('change', () => {
            CONFIG.zestaw = Math.max(1, Math.min(9, parseInt(inpZ.value) || 1));
            inpZ.value = CONFIG.zestaw;
            saveZestawPostaci(CONFIG.zestaw);
        });
        inpZ.addEventListener('mousedown', e => e.stopPropagation());

        document.getElementById('aztyt_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('aztyt_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('aztyt_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName)) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 460));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    const updateStatus = (txt, kolor) => {
        const el = document.getElementById('aztyt_status');
        if (el) { el.textContent = txt; el.style.color = kolor || '#ffe6cc'; }
    };

    const tick = () => {
        const cbOn = document.getElementById('aztyt_on');
        if (cbOn && !cbOn.checked) { updateStatus('⚪ Wyłączony', '#888'); return; }

        const tytan = znajdzTytana();
        if (!tytan) { updateStatus('🟢 Włączony – brak tytana', '#88cc88'); return; }

        if (wWalce()) { updateStatus(`⚔️ Tytan (${tytan.nick}) – czekam na koniec walki`, '#ffcc66'); return; }

        const aktualny = aktualnyZestaw();
        if (aktualny !== CONFIG.zestaw) {
            zmienZestaw(CONFIG.zestaw);
            updateStatus(`🐲 Tytan! Zakładam zestaw ${CONFIG.zestaw}`, '#ffaa44');
        } else {
            updateStatus(`✅ Tytan (${tytan.nick}) – zestaw ${CONFIG.zestaw}`, '#66ff99');
        }
    };

    stworzWidget();
    setInterval(tick, CONFIG.intervalMs);
    console.log('[AutoZestawTytan v1.3] Uruchomiony.');
};
        addon();
    }

    function initModul_budowniczy() {
        const addon = () => {

    const DOMYSLNE = {
        enabled: true,
        sklad: { w:0, p:0, b:0, h:0, t:0, m:0, dyst:0 },
        widgetPos: { x: 12, y: null, bottom: 510 },
        zwiniety: false,
    };

    const loadConfig = () => {
        try {
            const saved = localStorage.getItem('bgr_config');
            if (saved) {
                const c = Object.assign({}, DOMYSLNE, JSON.parse(saved));
                c.sklad = Object.assign({}, DOMYSLNE.sklad, c.sklad || {});
                return c;
            }
        } catch(e) {}
        return JSON.parse(JSON.stringify(DOMYSLNE));
    };
    const saveConfig = () => localStorage.setItem('bgr_config', JSON.stringify(CONFIG));
    const CONFIG = loadConfig();

    const PROF = [
        { k:'w', nazwa:'Wojownik',  kolor:'#ff6644' },
        { k:'p', nazwa:'Paladyn',   kolor:'#ffcc44' },
        { k:'b', nazwa:'Tancerz',   kolor:'#cc66ff' },
        { k:'h', nazwa:'Łowca',     kolor:'#66cc66' },
        { k:'t', nazwa:'Tropiciel', kolor:'#66ccff' },
        { k:'m', nazwa:'Mag',       kolor:'#ff66cc' },
    ];

    const DYSTANS_PROF = ['h', 't', 'm'];

    let zaproszeni = new Map();
    const loadZaproszeni = () => {
        try {
            const s = localStorage.getItem('bgr_zaproszeni');
            if (s) zaproszeni = new Map(Object.entries(JSON.parse(s)));
        } catch(e) {}
    };
    const saveZaproszeni = () => {
        try { localStorage.setItem('bgr_zaproszeni', JSON.stringify(Object.fromEntries(zaproszeni))); } catch(e) {}
    };
    loadZaproszeni();

    const getHero = () => Engine.hero.d;

    const jestesDowodca = () => {
        if (document.querySelectorAll('.party-member').length === 0) return true;
        return Array.from(document.querySelectorAll('.party__disband'))
            .some(e => e.style.display === 'block');
    };

    const idCzlonkowGrupy = () => {
        return Array.from(document.querySelectorAll('.party-member'))
            .map(el => {
                const m = String(el.className).match(/other-party-id-(\d+)/);
                return m ? m[1] : null;
            })
            .filter(Boolean);
    };

    const profGracza = (id, heroId, heroProf) => {
        if (String(id) === String(heroId)) return heroProf;
        try {
            const o = Engine.others.getById(parseInt(id, 10));
            if (o && o.d && o.d.prof) return o.d.prof.toLowerCase();
        } catch(e) {}
        if (zaproszeni.has(String(id))) return zaproszeni.get(String(id));
        return null;
    };

    const czySwoj = (o, heroClanId) => {
        const rel = o.relation;
        const oClanId = (o.clan && o.clan.id) || 0;
        if (heroClanId > 0 && oClanId === heroClanId) return true;
        return (rel === 2 || rel === 3 || rel === 4 || rel === 5);
    };

    const zapros = (id) => { if (typeof _g === 'function') _g(`party&a=inv&id=${id}`); };

    const zbierzSwoich = (heroId, heroClanId) => {
        try {
            return Engine.others.getDrawableList()
                .filter(o => o.d && o.d.nick && o.d.id).map(o => o.d)
                .filter(o => String(o.id) !== heroId)
                .filter(o => czySwoj(o, heroClanId));
        } catch(e) { return []; }
    };

    const budujZeSkladu = (sklad) => {
        const hero = getHero();
        const heroId = String(hero.id);
        const heroProf = (hero.prof || '').toLowerCase();
        const heroClanId = (hero.clan && hero.clan.id) || 0;

        const wGrupieIds = idCzlonkowGrupy();
        const wGrupieSet = new Set(wGrupieIds.map(String));
        wGrupieSet.add(heroId);

        const maszProf = {};
        for (const p of PROF) maszProf[p.k] = 0;
        for (const id of wGrupieSet) {
            const pk = profGracza(id, heroId, heroProf);
            if (pk && maszProf[pk] !== undefined) maszProf[pk]++;
        }

        const swoi = zbierzSwoich(heroId, heroClanId);
        const wgProf = {};
        for (const p of PROF) wgProf[p.k] = [];
        for (const o of swoi) {
            const pk = (o.prof || '').toLowerCase();
            if (wgProf[pk] && !wGrupieSet.has(String(o.id))) wgProf[pk].push(o);
        }

        const doZaproszenia = [];
        const zaproszeniTeraz = new Set();
        const raport = [];

        for (const p of PROF) {
            const chce = sklad[p.k] || 0;
            if (chce <= 0) continue;
            const masz = maszProf[p.k];
            const brakuje = Math.max(0, chce - masz);
            const dobierz = wgProf[p.k].slice(0, brakuje);
            for (const o of dobierz) {
                doZaproszenia.push(o);
                zaproszeniTeraz.add(String(o.id));
                zaproszeni.set(String(o.id), p.k);
            }
            raport.push(`${p.nazwa}: ${masz}/${chce}` + (dobierz.length ? ` +${dobierz.length}` : ''));
        }

        const chceDyst = sklad.dyst || 0;
        if (chceDyst > 0) {
            let maszDyst = 0;
            for (const k of DYSTANS_PROF) maszDyst += maszProf[k];
            const brakujeDyst = Math.max(0, chceDyst - maszDyst);
            const kandydaciDyst = [];
            for (const k of DYSTANS_PROF) {
                for (const o of wgProf[k]) {
                    if (!zaproszeniTeraz.has(String(o.id))) kandydaciDyst.push(o);
                }
            }
            const dobierzDyst = kandydaciDyst.slice(0, brakujeDyst);
            for (const o of dobierzDyst) {
                doZaproszenia.push(o);
                zaproszeniTeraz.add(String(o.id));
                zaproszeni.set(String(o.id), (o.prof || '').toLowerCase());
            }
            raport.push(`Dystans: ${maszDyst}/${chceDyst}` + (dobierzDyst.length ? ` +${dobierzDyst.length}` : ''));
        }

        saveZaproszeni();
        for (const o of doZaproszenia) zapros(String(o.id));
        return { ile: doZaproszenia.length, raport };
    };

    const budujAll = () => {
        const hero = getHero();
        const heroId = String(hero.id);
        const heroClanId = (hero.clan && hero.clan.id) || 0;

        const wGrupieSet = new Set(idCzlonkowGrupy().map(String));
        wGrupieSet.add(heroId);

        const ileWGrupie = wGrupieSet.size;
        const wolneMiejsca = Math.max(0, 10 - ileWGrupie);

        const swoi = zbierzSwoich(heroId, heroClanId)
            .filter(o => !wGrupieSet.has(String(o.id)));

        const dobierz = swoi.slice(0, wolneMiejsca);
        for (const o of dobierz) {
            zaproszeni.set(String(o.id), (o.prof || '').toLowerCase());
            zapros(String(o.id));
        }
        saveZaproszeni();
        return { ile: dobierz.length, raport: [`All: w grupie ${ileWGrupie}, zapraszam ${dobierz.length}`] };
    };

    const budujGrupe = () => budujZeSkladu(CONFIG.sklad);

    const stworzWidget = () => {
        if (document.getElementById('bgr_widget')) return;

        const wiersze = PROF.map(p => `
            <div class="bgr_prof">
                <span class="bgr_dot" style="background:${p.kolor}"></span>
                <span class="bgr_pname">${p.nazwa}</span>
                <input class="bgr_inp" data-prof="${p.k}" type="number" min="0" max="10" value="${CONFIG.sklad[p.k] || 0}">
            </div>`).join('') + `
            <div class="bgr_prof bgr_dyst">
                <span class="bgr_dot" style="background:linear-gradient(90deg,#66cc66,#66ccff,#ff66cc)"></span>
                <span class="bgr_pname">Dystans <span class="bgr_sub">(łow/trop/mag)</span></span>
                <input class="bgr_inp" data-prof="dyst" type="number" min="0" max="10" value="${CONFIG.sklad.dyst || 0}">
            </div>`;

        const w = document.createElement('div');
        w.id = 'bgr_widget';
        w.innerHTML = `
        <div id="bgr_header">
            <span id="bgr_title">🧩 Budowniczy Grupy</span>
            <div id="bgr_hbtns">
                <label class="bgr_toggle"><input type="checkbox" id="bgr_on" ${CONFIG.enabled ? 'checked' : ''}> ON</label>
                <button id="bgr_collapse">${CONFIG.zwiniety ? '▲' : '▼'}</button>
            </div>
        </div>
        <div id="bgr_body" style="display:${CONFIG.zwiniety ? 'none' : 'block'}">
            <div class="bgr_hint">Wpisz ilu kogo chcesz, potem kliknij Buduj.</div>
            ${wiersze}
            <button id="bgr_buduj">⚔️ Buduj grupę</button>
            <div class="bgr_presety">
                <button class="bgr_preset" id="bgr_normal">Normal</button>
                <button class="bgr_preset" id="bgr_wyj">Pod wyjebanie</button>
                <button class="bgr_preset" id="bgr_all">All</button>
            </div>
            <div id="bgr_reset">wyczyść pamięć zaproszeń</div>
            <div id="bgr_status"></div>
        </div>`;

        const style = document.createElement('style');
        style.textContent = `
        #bgr_widget {
            position: fixed; background: rgba(10,14,24,.96);
            border: 1px solid #66aaff88; border-radius: 10px;
            padding: 8px 10px; font-size: 12px; color: #d6e4ff;
            z-index: 99999; width: 215px; user-select: none;
            font-family: sans-serif; line-height: 1.5; cursor: move;
        }
        #bgr_header {
            display: flex; justify-content: space-between; align-items: center;
            font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #66aaff;
        }
        #bgr_hbtns { display: flex; align-items: center; gap: 5px; }
        #bgr_collapse {
            background: none; border: 1px solid #66aaff66; color: #66aaff;
            border-radius: 4px; cursor: pointer; padding: 0 5px; font-size: 10px; line-height: 16px;
        }
        .bgr_toggle { font-weight: normal; font-size: 11px; cursor: pointer; }
        .bgr_hint { font-size: 10px; color: #8899bb; margin-bottom: 5px; }
        .bgr_prof { display: flex; align-items: center; gap: 6px; margin: 3px 0; }
        .bgr_dyst { margin-top: 6px; padding-top: 6px; border-top: 1px solid #66aaff33; }
        .bgr_sub { font-size: 9px; color: #7788aa; }
        .bgr_dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .bgr_pname { flex: 1; font-size: 12px; }
        .bgr_inp {
            width: 42px; background: rgba(100,170,255,.12); border: 1px solid #66aaff55;
            border-radius: 4px; color: #d6e4ff; text-align: center; font-size: 12px; padding: 1px 3px;
        }
        #bgr_buduj {
            width: 100%; margin-top: 7px; padding: 5px 0;
            background: rgba(100,170,255,.2); border: 1px solid #66aaff88;
            border-radius: 6px; color: #d6e4ff; font-size: 12px; font-weight: bold; cursor: pointer;
        }
        #bgr_buduj:hover { background: rgba(100,170,255,.4); }
        .bgr_presety { display: flex; gap: 4px; margin-top: 5px; }
        .bgr_preset {
            flex: 1; padding: 4px 0; font-size: 10px; cursor: pointer;
            background: rgba(100,170,255,.1); border: 1px solid #66aaff55;
            border-radius: 5px; color: #aaccff;
        }
        .bgr_preset:hover { background: rgba(100,170,255,.28); color: #fff; }
        #bgr_reset {
            text-align: center; font-size: 10px; color: #7788aa;
            margin-top: 5px; cursor: pointer; text-decoration: underline;
        }
        #bgr_reset:hover { color: #aabbdd; }
        #bgr_status { font-size: 11px; margin-top: 5px; color: #aee9ff; line-height: 1.4; }
        `;
        document.head.appendChild(style);
        document.body.appendChild(w);

        w.style.left = CONFIG.widgetPos.x + 'px';
        if (CONFIG.widgetPos.y !== null) w.style.top = CONFIG.widgetPos.y + 'px';
        else w.style.bottom = CONFIG.widgetPos.bottom + 'px';

        const cbOn = document.getElementById('bgr_on');
        cbOn.addEventListener('change', () => { CONFIG.enabled = cbOn.checked; saveConfig(); });
        cbOn.addEventListener('mousedown', e => e.stopPropagation());

        w.querySelectorAll('.bgr_inp').forEach(inp => {
            inp.addEventListener('change', () => {
                const k = inp.dataset.prof;
                CONFIG.sklad[k] = Math.max(0, Math.min(10, parseInt(inp.value) || 0));
                inp.value = CONFIG.sklad[k];
                saveConfig();
            });
            inp.addEventListener('mousedown', e => e.stopPropagation());
        });

        const status = (txt, kolor) => {
            const el = document.getElementById('bgr_status');
            if (el) { el.textContent = txt; el.style.color = kolor || '#aee9ff'; }
        };

        document.getElementById('bgr_buduj').addEventListener('click', (e) => {
            e.stopPropagation();
            const on = document.getElementById('bgr_on');
            if (on && !on.checked) { status('⚪ Dodatek wyłączony', '#888'); return; }
            if (!jestesDowodca()) { status('🚫 Nie jesteś dowódcą grupy', '#ff9966'); return; }
            const suma = Object.values(CONFIG.sklad).reduce((a,b)=>a+b,0);
            if (suma === 0) { status('⚠️ Wpisz ilu kogo chcesz', '#ffcc66'); return; }
            const wynik = budujGrupe();
            const podsumowanie = wynik.raport.length ? ' · ' + wynik.raport.join(', ') : '';
            if (wynik.ile === 0) status('✅ Skład OK lub brak swoich na mapie' + podsumowanie, '#66ff99');
            else status(`📨 Wysłano ${wynik.ile} zaproszeń${podsumowanie}`, '#66ff99');
        });

        const odpalPreset = (fn) => {
            const on = document.getElementById('bgr_on');
            if (on && !on.checked) { status('⚪ Dodatek wyłączony', '#888'); return; }
            if (!jestesDowodca()) { status('🚫 Nie jesteś dowódcą grupy', '#ff9966'); return; }
            const wynik = fn();
            const podsumowanie = wynik.raport.length ? ' · ' + wynik.raport.join(', ') : '';
            if (wynik.ile === 0) status('✅ Skład OK lub brak swoich na mapie' + podsumowanie, '#66ff99');
            else status(`📨 Wysłano ${wynik.ile} zaproszeń${podsumowanie}`, '#66ff99');
        };

        document.getElementById('bgr_normal').addEventListener('click', (e) => {
            e.stopPropagation();
            odpalPreset(() => budujZeSkladu({ w:2, p:2, b:0, h:2, t:2, m:2, dyst:0 }));
        });
        document.getElementById('bgr_wyj').addEventListener('click', (e) => {
            e.stopPropagation();
            odpalPreset(() => budujZeSkladu({ w:1, p:0, b:0, h:0, t:0, m:0, dyst:9 }));
        });
        document.getElementById('bgr_all').addEventListener('click', (e) => {
            e.stopPropagation();
            odpalPreset(budujAll);
        });

        document.getElementById('bgr_reset').addEventListener('click', (e) => {
            e.stopPropagation();
            zaproszeni.clear();
            saveZaproszeni();
            status('🗑️ Wyczyszczono pamięć zaproszeń', '#aabbdd');
        });

        document.getElementById('bgr_collapse').addEventListener('click', (e) => {
            e.stopPropagation();
            CONFIG.zwiniety = !CONFIG.zwiniety;
            document.getElementById('bgr_body').style.display = CONFIG.zwiniety ? 'none' : 'block';
            document.getElementById('bgr_collapse').textContent = CONFIG.zwiniety ? '▲' : '▼';
            saveConfig();
        });

        let drag = false, ox = 0, oy = 0;
        w.addEventListener('mousedown', e => {
            if (['INPUT','BUTTON'].includes(e.target.tagName) || e.target.id === 'bgr_reset' || e.target.classList.contains('bgr_preset')) return;
            drag = true;
            ox = e.clientX - w.offsetLeft;
            oy = e.clientY - (w.style.top ? parseInt(w.style.top) : window.innerHeight - w.offsetHeight - parseInt(w.style.bottom || 510));
        });
        document.addEventListener('mousemove', e => {
            if (!drag) return;
            w.style.left = (e.clientX - ox) + 'px';
            w.style.top  = (e.clientY - oy) + 'px';
            w.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            if (!drag) return;
            drag = false;
            CONFIG.widgetPos.x = parseInt(w.style.left) || 12;
            CONFIG.widgetPos.y = parseInt(w.style.top)  || null;
            saveConfig();
        });
    };

    stworzWidget();
    console.log('[BudowniczyGrupy v1.3] Uruchomiony.');
};
        addon();
    }
    function startWszystko() {
        PACK.loadStan();
        try { initModul_zestaw(); }      catch (e) { console.error('[Pack] zestaw:', e); }
        try { initModul_szybka(); }      catch (e) { console.error('[Pack] szybka:', e); }
        try { initModul_antyduch(); }    catch (e) { console.error('[Pack] antyduch:', e); }
        try { initModul_powalce(); }     catch (e) { console.error('[Pack] powalce:', e); }
        try { initModul_grupa(); }       catch (e) { console.error('[Pack] grupa:', e); }
        try { initModul_lista(); }       catch (e) { console.error('[Pack] lista:', e); }
        try { initModul_przywolanie(); } catch (e) { console.error('[Pack] przywolanie:', e); }
        try { initModul_kopalnia(); }    catch (e) { console.error('[Pack] kopalnia:', e); }
        try { initModul_wylogowanie(); } catch (e) { console.error('[Pack] wylogowanie:', e); }
        try { initModul_jebadlo(); }     catch (e) { console.error('[Pack] jebadlo:', e); }
        try { initModul_tytan(); }       catch (e) { console.error('[Pack] tytan:', e); }
        try { initModul_budowniczy(); }  catch (e) { console.error('[Pack] budowniczy:', e); }

        stworzGlowneGui();
        setTimeout(() => PACK.zastosujStan(), 300);
        setTimeout(() => PACK.zastosujStan(), 1500);
        console.log('[RevoPack v2.0] Uruchomiony - 12 dodatków.');
    }

    function initPack() {
        try {
            if (window.Engine && window.Engine.hero && window.Engine.hero.d
                && window.Engine.hero.d.x !== undefined && window.Engine.map
                && window.Engine.map.d && window.Engine.others && window.Engine.npcs
                && window.Engine.communication && window.Engine.communication.send2) {
                return startWszystko();
            }
        } catch (e) {}
        setTimeout(initPack, 500);
    }

    window.addEventListener('load', initPack);
    if (document.readyState === 'complete') setTimeout(initPack, 500);

})();
