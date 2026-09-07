(function () {
    /* Pizza-Service — das Spiel auf /pizzeria/.
       Eigene Datei statt inline, weil die CSP in layouts/baseof.html
       script-src auf 'self' ohne 'unsafe-inline' hält.
       Kein localStorage: /datenschutz/ sagt zu, dass die Seite nichts
       speichert. Der Rekord lebt deshalb nur in dieser Variable, also bis
       zum Neuladen. Die Spiellogik ist bewusst frei von DOM-Zugriffen —
       tools/pizza_test.mjs fährt sie direkt an. */

    /* Acht Zutaten, vier je Kasten. Die Farbe ist nie die einzige Auskunft:
       daneben steht immer der Name. */
    var TOPPINGS = [
        { key: 'salami',    name: 'Salami',      color: '#b13e53' },
        { key: 'schinken',  name: 'Schinken',    color: '#ff8a9e' },
        { key: 'pilze',     name: 'Champignons', color: '#94b0c2' },
        { key: 'paprika',   name: 'Paprika',     color: '#a7f070' },
        { key: 'oliven',    name: 'Oliven',      color: '#333c57' },
        { key: 'ananas',    name: 'Ananas',      color: '#f4f4f0' },
        { key: 'basilikum', name: 'Basilikum',   color: '#38b764' },
        { key: 'zwiebeln',  name: 'Zwiebeln',    color: '#c4a8f5' }
    ];

    /* Die Karte. Auf dem Bon steht nur der Name — das Rezept muss man wissen
       oder im Kochbuch nachschlagen. Nach Zutatenzahl gestaffelt: daran
       hängt der Schwierigkeitsgrad in makeOrder(). */
    var MENU = [
        { name: 'Margherita',       want: ['basilikum'] },
        { name: 'Salame',           want: ['salami'] },
        { name: 'Funghi',           want: ['pilze'] },
        { name: 'Prosciutto',       want: ['schinken'] },

        { name: 'Hawaii',           want: ['schinken', 'ananas'] },
        { name: 'Napoli',           want: ['oliven', 'basilikum'] },
        { name: 'Diavolo',          want: ['salami', 'paprika'] },
        { name: 'Cipolla',          want: ['salami', 'zwiebeln'] },

        { name: 'Vegetariana',      want: ['paprika', 'pilze', 'oliven'] },
        { name: 'Capricciosa',      want: ['schinken', 'pilze', 'oliven'] },
        { name: 'Rustica',          want: ['salami', 'paprika', 'zwiebeln'] },
        { name: 'Mediterranea',     want: ['oliven', 'basilikum', 'paprika'] },

        { name: 'Quattro Stagioni', want: ['salami', 'schinken', 'pilze', 'oliven'] },
        { name: 'Contadina',        want: ['pilze', 'paprika', 'zwiebeln', 'basilikum'] },
        { name: 'Speciale',         want: ['salami', 'schinken', 'paprika', 'zwiebeln'] },
        { name: 'Tropicale',        want: ['schinken', 'ananas', 'paprika', 'oliven'] }
    ];

    var NAMES = [
        'Tisch 4', 'Familie Bauer', 'Büro, 2. Stock', 'Die Nachbarn',
        'Oma Herta', 'WG Küchenstraße', 'Baustelle Nord', 'Abholer',
        'Herr Kowalski', 'Späte Schicht'
    ];

    var TIME_START = 60000;   /* Schichtlänge */
    var TIME_BONUS =  5000;   /* pro korrekter Lieferung */
    var TIME_MISS  =  4000;   /* Abzug bei Reklamation */
    var BAKE_MS    =   900;   /* Backzeit */
    var MAX_FRAME  =   250;   /* Obergrenze für einen Zeitschritt, s. tick() */
    var COMBO_MAX  =     5;

    /* ---- Spiellogik (ohne DOM, siehe tools/pizza_test.mjs) --------- */

    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    function topping(key) {
        for (var i = 0; i < TOPPINGS.length; i++) {
            if (TOPPINGS[i].key === key) return TOPPINGS[i];
        }
        return null;
    }

    function label(key) {
        var t = topping(key);
        return t ? t.name : key;
    }

    /* Bestellung Nr. `no`: eine Zutat zum Aufwärmen, ab Bon 3 zwei, ab 6
       drei, ab 9 die volle Karte. */
    function makeOrder(no) {
        var size = no < 3 ? 1 : (no < 6 ? 2 : (no < 9 ? 3 : 4));
        var pool = [];
        for (var i = 0; i < MENU.length; i++) {
            if (MENU[i].want.length === size) pool.push(MENU[i]);
        }
        var p = pick(pool);
        return {
            no: no,
            customer: pick(NAMES),
            pizza: p.name,
            want: p.want.slice()
        };
    }

    /* Reihenfolge egal, doppelt liegt nichts — eine Zutat lässt sich nur
       einmal auflegen. */
    function check(want, have) {
        var missing = [], extra = [], i;
        for (i = 0; i < want.length; i++) {
            if (have.indexOf(want[i]) < 0) missing.push(want[i]);
        }
        for (i = 0; i < have.length; i++) {
            if (want.indexOf(have[i]) < 0) extra.push(have[i]);
        }
        return { ok: !missing.length && !extra.length, missing: missing, extra: extra };
    }

    function scoreFor(order, combo) {
        return (60 + 40 * order.want.length) * Math.min(combo, COMBO_MAX);
    }

    /* ---- DOM ------------------------------------------------------- */

    function id(name) { return document.getElementById(name); }

    var root = id('pg');
    if (!root) return;

    var el = {
        score:    id('pg-score'),
        time:     id('pg-time'),
        combo:    id('pg-combo'),
        best:     id('pg-best'),
        bar:      id('pg-bar'),
        no:       id('pg-no'),
        customer: id('pg-customer'),
        pizza:    id('pg-pizza'),
        binL:     id('pg-bin-l'),
        binR:     id('pg-bin-r'),
        stage:    id('pg-stage'),
        have:     id('pg-have'),
        msg:      id('pg-msg'),
        oven:     id('pg-oven'),
        canvas:   id('pg-canvas'),
        nojs:     id('pg-nojs'),
        undo:     id('pg-undo'),
        action:   id('pg-action'),
        start:    id('pg-start'),
        startBtn: id('pg-start-btn'),
        over:     id('pg-over'),
        final:    id('pg-final'),
        again:    id('pg-again'),
        book:     id('pg-book'),
        bookBtn:  id('pg-book-btn'),
        bookList: id('pg-book-list'),
        bookOut:  id('pg-book-close')
    };

    var ctx = el.canvas.getContext('2d');

    var phase   = 'idle';   /* idle | belegen | ofen | liefern | ende */
    var order   = null;
    var have    = [];
    var score   = 0;
    var combo   = 1;
    var left    = TIME_START;
    var served  = 0;
    var best    = 0;
    var tiles   = [];
    var raf     = 0;
    var lastTs  = null;
    var bakeAt  = 0;

    /* ---- Zeichnen -------------------------------------------------- */

    var CX = 48, CY = 48;

    /* Kreise Zeile für Zeile, damit die Kanten auf dem 96er-Raster sitzen —
       ein arc() käme weichgezeichnet heraus und der Pixel-Look wäre hin. */
    function disc(cx, cy, r, color) {
        ctx.fillStyle = color;
        for (var y = -r; y <= r; y++) {
            var w = Math.floor(Math.sqrt(r * r - y * y));
            ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1);
        }
    }

    /* Fester Platz für Stück j der Belagsorte i: drei außen, zwei innen, pro
       Sorte um 23° gedreht. So verzahnen sich die Sorten, statt sich auf
       einer Seite zu stapeln — und es liegt bei jedem Neuzeichnen gleich. */
    function spot(i, j) {
        var outer = j < 3;
        var a = (outer ? j / 3 : (j - 3) / 2) * 6.28318 + i * 0.4;
        var r = outer ? 22 : 10;
        return [Math.round(CX + Math.cos(a) * r), Math.round(CY + Math.sin(a) * r)];
    }

    /* Röstflecken auf dem Käse, alle innerhalb des Käserands (r = 31). */
    var CHAR = [[30, 40], [62, 36], [48, 26], [40, 62], [64, 58], [52, 52]];

    function piece(key, x, y, cheese) {
        if (key === 'salami') {
            disc(x, y, 6, '#b13e53');
            ctx.fillStyle = '#5d275d';
            ctx.fillRect(x - 3, y - 2, 2, 2);
            ctx.fillRect(x + 1, y + 1, 2, 2);
        } else if (key === 'schinken') {
            ctx.fillStyle = '#ff8a9e';
            ctx.fillRect(x - 6, y - 4, 12, 8);
            ctx.fillStyle = '#b13e53';
            ctx.fillRect(x - 6, y - 1, 12, 2);
        } else if (key === 'pilze') {
            disc(x, y, 5, '#94b0c2');
            ctx.fillStyle = '#566c86';
            ctx.fillRect(x - 1, y, 3, 5);
        } else if (key === 'paprika') {
            disc(x, y, 6, '#a7f070');
            disc(x, y, 3, cheese);
        } else if (key === 'oliven') {
            disc(x, y, 5, '#333c57');
            disc(x, y, 2, '#b13e53');
        } else if (key === 'ananas') {
            ctx.fillStyle = '#f4f4f0';
            ctx.fillRect(x - 5, y - 5, 10, 10);
            ctx.fillStyle = cheese;
            ctx.fillRect(x - 5, y - 5, 2, 2);
            ctx.fillRect(x + 3, y - 5, 2, 2);
            ctx.fillRect(x - 5, y + 3, 2, 2);
            ctx.fillRect(x + 3, y + 3, 2, 2);
        } else if (key === 'zwiebeln') {
            disc(x, y, 6, '#c4a8f5');
            disc(x, y, 4, cheese);
            disc(x, y, 2, '#c4a8f5');
        } else {
            disc(x - 2, y - 1, 3, '#38b764');
            disc(x + 2, y + 2, 3, '#257179');
        }
    }

    /* Roh und gebacken unterscheiden sich am Rand, nicht am Käse: bliebe der
       Käse roh blass, verschwämme er mit dem hellen Teigrand zu einer Scheibe. */
    function draw(baked) {
        var cheese = '#ffcd75';
        var i, j, p;

        ctx.clearRect(0, 0, 96, 96);
        disc(CX, CY, 44, baked ? '#ef7d57' : '#f4f4f0');   /* Rand */
        disc(CX, CY, 38, '#b13e53');                       /* Sauce */
        disc(CX, CY, 31, cheese);                          /* Käse */

        if (baked) {
            ctx.fillStyle = '#ef7d57';
            for (i = 0; i < CHAR.length; i++) {
                ctx.fillRect(CHAR[i][0], CHAR[i][1], 2, 2);
            }
        }

        for (i = 0; i < have.length; i++) {
            for (j = 0; j < 5; j++) {
                p = spot(TOPPINGS.indexOf(topping(have[i])), j);
                piece(have[i], p[0], p[1], cheese);
            }
        }
    }

    /* ---- Anzeige --------------------------------------------------- */

    function say(text, kind) {
        el.msg.textContent = text;
        el.msg.className = 'pg-msg' + (kind ? ' pg-msg-' + kind : '');
    }

    function renderHud() {
        el.score.textContent = score;
        el.time.textContent = Math.ceil(left / 1000);
        el.combo.textContent = 'x' + Math.min(combo, COMBO_MAX);
        el.best.textContent = best;
        el.bar.style.width = Math.min(100, left / TIME_START * 100) + '%';
    }

    function dot(key) {
        var s = document.createElement('span');
        s.className = 'pg-dot';
        s.style.background = topping(key).color;
        return s;
    }

    function renderTicket() {
        el.no.textContent = order.no;
        el.customer.textContent = order.customer;
        el.pizza.textContent = order.pizza;
    }

    function renderHave() {
        var i, li;
        el.have.textContent = '';
        if (!have.length) {
            li = document.createElement('li');
            li.className = 'pg-have-empty';
            li.textContent = 'noch nichts drauf';
            el.have.appendChild(li);
        }
        for (i = 0; i < have.length; i++) {
            li = document.createElement('li');
            li.appendChild(dot(have[i]));
            li.appendChild(document.createTextNode(label(have[i])));
            el.have.appendChild(li);
        }
        for (i = 0; i < tiles.length; i++) {
            var on = have.indexOf(tiles[i].dataset.key) >= 0;
            tiles[i].className = 'pg-tile'
                + (on ? ' is-on' : '')
                + (phase === 'belegen' ? '' : ' is-off');
        }
    }

    function renderBook() {
        var groups = ['Eine Zutat', 'Zwei Zutaten', 'Drei Zutaten', 'Vier Zutaten'];
        var i, j, size, head, row, names;

        el.bookList.textContent = '';
        for (size = 1; size <= 4; size++) {
            head = document.createElement('div');
            head.className = 'pg-book-group';
            head.textContent = groups[size - 1];
            el.bookList.appendChild(head);

            for (i = 0; i < MENU.length; i++) {
                if (MENU[i].want.length !== size) continue;
                names = [];
                for (j = 0; j < MENU[i].want.length; j++) names.push(label(MENU[i].want[j]));
                row = document.createElement('div');
                row.className = 'pg-recipe';
                var b = document.createElement('b');
                b.textContent = MENU[i].name;
                row.appendChild(b);
                row.appendChild(document.createTextNode(' — ' + names.join(', ')));
                el.bookList.appendChild(row);
            }
        }
    }

    function showBook(open) {
        el.book.hidden = !open;
        if (open) el.bookOut.focus(); else el.bookBtn.focus();
    }

    /* ---- Ablauf ---------------------------------------------------- */

    function setPhase(next) {
        phase = next;
        el.undo.disabled = next !== 'belegen' || !have.length;
        el.oven.hidden = next !== 'ofen';

        if (next === 'belegen') {
            el.action.disabled = !have.length;
            el.action.textContent = '▶ In den Ofen';
        } else if (next === 'ofen') {
            el.action.disabled = true;
            el.action.textContent = 'Bäckt …';
        } else if (next === 'liefern') {
            el.action.disabled = false;
            el.action.textContent = '▶ Ausliefern';
        } else {
            el.action.disabled = true;
        }
        renderHave();
    }

    function nextOrder() {
        order = makeOrder(served + 1);
        have = [];
        renderTicket();
        draw(false);
        setPhase('belegen');
    }

    function put(key) {
        if (phase !== 'belegen') return;
        if (have.indexOf(key) >= 0) {
            say(label(key) + ' liegt schon drauf.');
            return;
        }
        have.push(key);
        say(label(key) + ' aufgelegt.');
        draw(false);
        setPhase('belegen');
    }

    /* Der Tastaturweg: dieselbe Zahl legt auf und nimmt wieder ab. */
    function toggle(key) {
        if (phase !== 'belegen') return;
        var at = have.indexOf(key);
        if (at < 0) { put(key); return; }
        have.splice(at, 1);
        say(label(key) + ' wieder runter.');
        draw(false);
        setPhase('belegen');
    }

    function undo() {
        if (phase !== 'belegen' || !have.length) return;
        say(label(have.pop()) + ' wieder runter.');
        draw(false);
        setPhase('belegen');
    }

    /* Der Ofen läuft auf der Spieluhr weiter: Backen kostet Zeit. */
    function bake() {
        setPhase('ofen');
        say('Ofen läuft …');
        bakeAt = left - BAKE_MS;
    }

    function deliver() {
        var res = check(order.want, have);
        var parts = [], gained, i;
        served++;

        if (res.ok) {
            gained = scoreFor(order, combo);
            score += gained;
            left += TIME_BONUS;
            combo++;
            say(order.pizza + ', genau so. +' + gained + ' Punkte, +'
                + (TIME_BONUS / 1000) + ' Sekunden.', 'good');
        } else {
            for (i = 0; i < res.missing.length; i++) parts.push(label(res.missing[i]) + ' fehlt');
            for (i = 0; i < res.extra.length; i++) parts.push(label(res.extra[i]) + ' zu viel');
            combo = 1;
            left -= TIME_MISS;
            say('Das war keine ' + order.pizza + ': ' + parts.join(', ') + '. −'
                + (TIME_MISS / 1000) + ' Sekunden.', 'bad');
        }

        renderHud();
        if (left <= 0) { left = 0; gameOver(); return; }
        nextOrder();
    }

    function action() {
        if (phase === 'belegen' && have.length) bake();
        else if (phase === 'liefern') deliver();
    }

    function gameOver() {
        setPhase('ende');
        if (score > best) best = score;
        renderHud();
        el.book.hidden = true;
        el.final.textContent = served + ' Pizzen raus, ' + score + ' Punkte. Rekord: ' + best + '.';
        el.over.hidden = false;
        el.again.focus();
        say('Feierabend.');
    }

    function startGame() {
        score = 0;
        combo = 1;
        served = 0;
        left = TIME_START;
        el.start.hidden = true;
        el.over.hidden = true;
        el.book.hidden = true;
        renderHud();
        say('Zutaten auf den Teig ziehen. Rezept unbekannt? Kochbuch.');
        nextOrder();
        lastTs = null;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
    }

    /* Die Uhr läuft über requestAnimationFrame, und das steht in einem
       Hintergrund-Tab still. Ohne die Deckelung käme beim Zurückschalten die
       gesamte Abwesenheit als ein Frame an und fräße die Schicht auf — so
       pausiert die Schicht stattdessen. */
    function tick(ts) {
        if (lastTs === null) lastTs = ts;
        left -= Math.min(ts - lastTs, MAX_FRAME);
        lastTs = ts;

        if (phase === 'ofen' && left <= bakeAt) {
            draw(true);
            setPhase('liefern');
            say('Fertig gebacken. Raus damit.');
        }

        if (left <= 0) { left = 0; renderHud(); gameOver(); return; }

        renderHud();
        raf = requestAnimationFrame(tick);
    }

    /* ---- Ziehen und Fallenlassen ----------------------------------- */

    /* Pointer-Events, nicht die HTML5-Drag-API: die gibt es auf dem Handy
       nicht, und der Kasten soll dort genauso funktionieren wie am Rechner. */
    var held = null;

    function overStage(x, y) {
        var r = el.stage.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    function ghostAt(x, y) {
        held.ghost.style.left = x + 'px';
        held.ghost.style.top = y + 'px';
    }

    function grab(e, tile, t) {
        if (phase !== 'belegen' || held) return;
        e.preventDefault();

        var ghost = document.createElement('div');
        ghost.className = 'pg-ghost';
        ghost.appendChild(dot(t.key));
        ghost.appendChild(document.createTextNode(t.name));
        document.body.appendChild(ghost);

        held = { key: t.key, tile: tile, ghost: ghost, id: e.pointerId };
        tile.className = 'pg-tile is-held';
        ghostAt(e.clientX, e.clientY);

        /* Ohne Capture blieben pointermove und pointerup an der Kachel
           hängen, sobald der Zeiger sie verlässt — die Zutat käme nie auf
           dem Teig an. Klappt das nicht, lieber sauber abbrechen als mit
           einem Geist am Zeiger weitermachen. */
        try {
            tile.setPointerCapture(e.pointerId);
        } catch (err) {
            document.body.removeChild(ghost);
            held = null;
            renderHave();
        }
    }

    function drag(e) {
        if (!held || e.pointerId !== held.id) return;
        ghostAt(e.clientX, e.clientY);
        el.stage.className = 'pg-stage' + (overStage(e.clientX, e.clientY) ? ' is-target' : '');
    }

    /* Auch pointercancel landet hier — der Zeiger geht verloren, die Zutat
       muss trotzdem vom Bildschirm und die Kachel zurück in den Kasten. */
    function drop(e, key) {
        if (!held || e.pointerId !== held.id) return;
        var hit = e.type === 'pointerup' && overStage(e.clientX, e.clientY);
        document.body.removeChild(held.ghost);
        el.stage.className = 'pg-stage';
        held = null;
        renderHave();
        if (hit) put(key);
    }

    /* ---- Verdrahtung ----------------------------------------------- */

    for (var n = 0; n < TOPPINGS.length; n++) {
        (function (t, i) {
            var tile = document.createElement('div');
            tile.className = 'pg-tile';
            tile.dataset.key = t.key;

            var num = document.createElement('span');
            num.className = 'pg-tile-key';
            num.textContent = i + 1;

            tile.appendChild(num);
            tile.appendChild(dot(t.key));
            tile.appendChild(document.createTextNode(t.name));

            tile.addEventListener('pointerdown', function (e) { grab(e, tile, t); });
            tile.addEventListener('pointermove', drag);
            tile.addEventListener('pointerup', function (e) { drop(e, t.key); });
            tile.addEventListener('pointercancel', function (e) { drop(e, t.key); });

            (i < 4 ? el.binL : el.binR).appendChild(tile);
            tiles.push(tile);
        }(TOPPINGS[n], n));
    }

    el.nojs.hidden = true;
    el.action.addEventListener('click', action);
    el.undo.addEventListener('click', undo);
    el.startBtn.addEventListener('click', startGame);
    el.again.addEventListener('click', startGame);
    el.bookBtn.addEventListener('click', function () { showBook(true); });
    el.bookOut.addEventListener('click', function () { showBook(false); });

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key >= '1' && e.key <= String(TOPPINGS.length)) {
            toggle(TOPPINGS[Number(e.key) - 1].key);
            return;
        }
        if (e.key === 'k' || e.key === 'K') { showBook(el.book.hidden); return; }
        if (e.key === 'Escape') { showBook(false); return; }
        if (e.key === 'Backspace') { e.preventDefault(); undo(); return; }
        if (e.key === 'Enter') {
            /* Liegt der Fokus auf einem Knopf, hat der das Enter schon in
               einen Klick verwandelt — sonst zählte es doppelt. */
            if (e.target && e.target.tagName === 'BUTTON') return;
            e.preventDefault();
            if (phase === 'idle' || phase === 'ende') startGame();
            else action();
        }
    });

    renderBook();
    el.start.hidden = false;
    setPhase('idle');
    renderHud();
    draw(false);
    say('Acht Zutaten, sechzehn Rezepte, sechzig Sekunden.');
}());
