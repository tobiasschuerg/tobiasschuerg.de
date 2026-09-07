(function () {
    /* Injected by layouts/ueber.html as JSON in a data attribute, so this
       file stays plain JavaScript: no template syntax, directly testable,
       and loadable as an external script (which is what lets the CSP drop
       'unsafe-inline' from script-src). */
    var DATA     = JSON.parse(document.getElementById('term-data').dataset.terminal);
    var PROJECTS = DATA.projects;
    var GITHUB   = DATA.github;
    var MAIL     = DATA.mailUser + String.fromCharCode(64) + DATA.mailHost;

    var input   = document.getElementById('term-input');
    var typed   = document.getElementById('term-typed');
    var history = document.getElementById('term-history');
    var prompt  = document.getElementById('term-prompt');
    var panic   = document.getElementById('panic');
    var reboot  = document.getElementById('panic-reboot');
    if (!input) return;

    var MAX_LINES = 12;
    var entered = [];

    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }

    /* ---- command implementations ---------------------------------- */

    var HELP = [
        'Verfügbare Befehle:',
        '  help              diese Liste',
        '  whoami            wer hier schreibt',
        '  ls [pfad]         Verzeichnis anzeigen',
        '  open <projekt>    Projekt öffnen',
        '  cat <datei>       Datei ausgeben (kontakt.txt, staub.txt)',
        '  neofetch          Systeminfo',
        '  top               laufende Prozesse',
        '  date              aktuelles Datum',
        '  echo <text>       Text ausgeben',
        '  pwd               aktuelles Verzeichnis',
        '  history           bisherige Befehle',
        '  fortune           Weisheit des Tages',
        '  ping <host>       Host anpingen',
        '  clear             Bildschirm leeren',
        '  exit              Sitzung beenden',
        '',
        'Nicht alles steht hier drin. Probier ruhig was aus.'
    ].join('\n');

    var CLAUDE = [
        'claude: läuft bereits.',
        '',
        'Geheimer Befehl gefunden. Feuerwerk als Belohnung.'
    ].join('\n');

    var FORTUNES = [
        'Es gibt zwei schwierige Dinge: Cache-Invalidierung, Benennung — und Off-by-one-Fehler.',
        'Das Projekt ist zu 90 % fertig. Die zweiten 90 % kommen noch.',
        'Jede Zeile Code, die du nicht schreibst, hat keine Bugs.',
        'Funktioniert auf meinem Gerät.',
        '„Kurz mal eben“ ist die teuerste Zeiteinheit der Softwareentwicklung.',
        'Backups hat jeder. Restores sind seltener.',
        'Ein Side-Project ist nie fertig, es wird nur veröffentlicht.'
    ];

    function neofetch() {
        var right = [
            'tobias@tobiasschuerg.de',
            '-----------------------',
            'OS:        HugoOS (statisch)',
            'Shell:     bash (so ungefähr)',
            'Projekte:  ' + PROJECTS.length,
            'Sprache:   Kotlin, meistens',
            'Uptime:    seit ein paar Jahren',
            'Staub:     reichlich'
        ];
        var art = [
            '   ▄▄▄▄▄▄▄▄▄   ',
            ' ▄███████████▄ ',
            ' ███▀▀▀▀▀▀▀███ ',
            ' ███ ▄▄▄▄▄ ███ ',
            ' ███ ▀▀▀▀▀ ███ ',
            ' ▀███████████▀ ',
            '   ▀▀▀▀▀▀▀▀▀   ',
            '               '
        ];
        var out = [];
        for (var i = 0; i < Math.max(art.length, right.length); i++) {
            out.push(pad(art[i] || '', 16) + (right[i] || ''));
        }
        return out.join('\n');
    }

    function top() {
        var rows = ['  PID USER    %CPU  %MEM  COMMAND',
                    '    1 root     0.0   0.1  init'];
        PROJECTS.forEach(function (p, i) {
            rows.push(pad(' ' + (100 + i * 7), 5)
                + ' tobias '
                + pad((Math.random() * 9).toFixed(1), 5)
                + ' ' + pad((Math.random() * 20 + 2).toFixed(1), 5)
                + ' ' + p.slug);
        });
        rows.push(' 9999 tobias  99.9  87.2  staubsammler');
        return rows.join('\n');
    }

    function ls(arg) {
        var a = (arg || '').replace(/^~\//, '').replace(/\/$/, '').toLowerCase();
        if (a === '' || a === '~' || a === '.') {
            return ['projekte/\nkontakt.txt\nstaub.txt', 'res'];
        }
        if (a === 'projekte') {
            return [PROJECTS.map(function (p) { return p.slug; }).join('\n'), 'res'];
        }
        return ['ls: ' + arg + ': Datei oder Verzeichnis nicht gefunden', 'err'];
    }

    function open(arg) {
        if (!arg) return ['open: kein Projekt angegeben. „ls“ zeigt die Auswahl.', 'err'];
        var q = arg.toLowerCase();
        var hit = null;
        PROJECTS.forEach(function (p) {
            if (!hit && (p.slug.indexOf(q) === 0 || p.name.toLowerCase().indexOf(q) === 0)) hit = p;
        });
        if (!hit) return ['open: ' + arg + ': kein solches Projekt', 'err'];
        if (!hit.url) return ['open: ' + hit.name + ': kein Link hinterlegt', 'err'];
        window.open(hit.url, '_blank', 'noopener');
        return ['Öffne ' + hit.name + ' → ' + hit.url, 'res'];
    }

    function cat(arg) {
        var f = (arg || '').toLowerCase();
        if (f === 'kontakt.txt') {
            return ['github:  github.com/' + GITHUB + '\nmail:    ' + MAIL, 'res'];
        }
        if (f === 'staub.txt') {
            return ['Sammelt digitalen Staub.\n\n' + PROJECTS.length
                + ' Projekte, alle noch online. Das ist schon die halbe Miete.', 'res'];
        }
        if (!f) return ['cat: fehlender Dateiname', 'err'];
        return ['cat: ' + arg + ': Datei oder Verzeichnis nicht gefunden', 'err'];
    }

    function pingFor(cmd) {
        var host = cmd.split(/\s+/)[1] || 'tobiasschuerg.de';
        var t = function () { return (Math.random() * 30 + 8).toFixed(1); };
        return 'PING ' + host + ' (127.0.0.1): 56 data bytes\n'
            + '64 bytes: icmp_seq=0 ttl=64 time=' + t() + ' ms\n'
            + '64 bytes: icmp_seq=1 ttl=64 time=' + t() + ' ms\n'
            + '64 bytes: icmp_seq=2 ttl=64 time=' + t() + ' ms\n'
            + '--- ' + host + ' ping statistics ---\n'
            + '3 packets transmitted, 3 received, 0.0% packet loss';
    }

    var SL = [
        '      ====        ________                ___________',
        '  _D _|  |_______/        \\__I_I_____===__|_________|',
        '   |(_)---  |   H\\________/ |   |        =|___ ___|  ',
        '   /     |  |   H  |  |     |   |         ||_| |_||  ',
        '  |      |  |   H  |__--------------------| [___] |  ',
        '  | ________|___H__/__|_____/[][]~\\_______|       |  ',
        '  |/ |   |-----------I_____I [][] []  D   |=======|__'
    ].join('\n');

    var hintShown = false;

    function unknown(cmd) {
        var c = cmd.split(/\s+/)[0];
        var msg = pick([
            'zsh: command not found: ' + c,
            c + ': Segmentation fault (core dumped)',
            c + ': Permission denied — nice try.',
            'ERROR 418: I’m a teapot.',
            c + ': kernel panic!'
        ]);
        if (!hintShown) {
            hintShown = true;
            msg += '\n(„help" zeigt, was hier geht.)';
        }
        return msg;
    }

    /* ---- fireworks --------------------------------------------------
       Chunky fillRect particles snapped to a grid, so the bursts read as
       8-bit sprites rather than smooth confetti. */

    var fx       = document.getElementById('fx');
    var fxCanvas = document.getElementById('fx-canvas');
    var fxRaf    = null;
    var fxTimer  = null;
    var fxResize = null;

    var FX_COLORS = ['#ffcd75', '#41a6f6', '#38b764', '#ef7d57', '#ff8a9e', '#a684e8'];
    var FX_GRID   = 5;

    function fireworks() {
        if (!fx || !fxCanvas || !fxCanvas.getContext) return;
        if (!fx.hidden) closeFx();

        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        fx.hidden = false;

        var ctx = fxCanvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var w = 0, h = 0;
        var parts = [];

        function size() {
            w = fx.clientWidth;
            h = fx.clientHeight;
            fxCanvas.width  = Math.max(1, Math.floor(w * dpr));
            fxCanvas.height = Math.max(1, Math.floor(h * dpr));
            fxCanvas.style.width  = w + 'px';
            fxCanvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        size();

        function burst(x, y) {
            var color = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
            var n = 44;
            for (var i = 0; i < n; i++) {
                var a = (Math.PI * 2 * i) / n + Math.random() * 0.25;
                var s = 1.5 + Math.random() * 3.4;
                parts.push({
                    x: x, y: y,
                    vx: Math.cos(a) * s,
                    vy: Math.sin(a) * s,
                    life: 1,
                    color: Math.random() < 0.18 ? '#f4f4f0' : color
                });
            }
        }

        function seed() {
            burst(w * (0.15 + Math.random() * 0.7), h * (0.18 + Math.random() * 0.4));
        }

        function draw(p) {
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x / FX_GRID) * FX_GRID,
                         Math.round(p.y / FX_GRID) * FX_GRID,
                         FX_GRID, FX_GRID);
        }

        if (reduced) {
            /* One frozen burst, no animation. */
            seed(); seed();
            parts.forEach(function (p) {
                p.x += p.vx * 14;
                p.y += p.vy * 14;
                draw(p);
            });
        } else {
            var start = null;
            var next  = -1;
            fxRaf = requestAnimationFrame(function frame(now) {
                if (start === null) start = now;
                var t = now - start;
                if (t > next && t < 5200) { seed(); next = t + 430; }

                /* Translucent wash instead of clearRect: leaves CRT trails. */
                ctx.fillStyle = 'rgba(26, 28, 44, 0.3)';
                ctx.fillRect(0, 0, w, h);

                for (var i = parts.length - 1; i >= 0; i--) {
                    var p = parts[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.055;
                    p.vx *= 0.992;
                    p.vy *= 0.992;
                    p.life -= 0.0105;
                    if (p.life <= 0) { parts.splice(i, 1); continue; }
                    ctx.globalAlpha = p.life;
                    draw(p);
                }
                ctx.globalAlpha = 1;
                fxRaf = requestAnimationFrame(frame);
            });
        }

        fxResize = size;
        window.addEventListener('resize', fxResize);
        clearTimeout(fxTimer);
        fxTimer = setTimeout(closeFx, reduced ? 5000 : 8000);
    }

    function closeFx() {
        if (!fx || fx.hidden) return;
        if (fxRaf) { cancelAnimationFrame(fxRaf); fxRaf = null; }
        clearTimeout(fxTimer);
        if (fxResize) { window.removeEventListener('resize', fxResize); fxResize = null; }
        fx.hidden = true;
        input.focus({ preventScroll: true });
    }

    if (fx) { fx.addEventListener('click', closeFx); }

    /* ---- dispatch --------------------------------------------------- */

    function run(cmd) {
        var parts = cmd.split(/\s+/);
        var head  = parts[0].toLowerCase();
        var rest  = cmd.slice(parts[0].length).trim();

        if (/^rm\s+(-rf|-fr)\b/.test(cmd)) return ['__panic__', ''];
        if (head === 'clear') return ['__clear__', ''];

        switch (head) {
            case 'help': case '?': case 'man':      return [HELP, 'res'];
            case 'whoami':                          return ['Tobias Schürg — Entwickler, baut kleine Apps.', 'res'];
            case 'ls': case 'dir':                  return ls(rest);
            case 'open': case 'xdg-open': case 'start': return open(rest);
            case 'cat': case 'less': case 'more':   return cat(rest);
            case 'neofetch': case 'screenfetch':    return [neofetch(), 'art'];
            case 'top': case 'htop': case 'ps':     return [top(), 'art'];
            case 'sl':                              return [SL, 'art'];
            case 'date':                            return [new Date().toLocaleString('de-DE'), 'res'];
            case 'echo':                            return [rest, 'res'];
            case 'pwd':                             return ['/home/tobias/projekte', 'res'];
            case 'history':
                return [entered.length
                    ? entered.map(function (c, i) { return pad(i + 1, 4) + '  ' + c; }).join('\n')
                    : '(noch nichts)', 'res'];
            case 'fortune':                         return [pick(FORTUNES), 'res'];
            case 'ping':                            return [pingFor(cmd), 'res'];
            case 'uname':                           return ['HugoOS 0.148.1 static x86_64 GNU/Staub', 'res'];
            case 'sudo':
                return [rest
                    ? 'tobias ist nicht in der sudoers-Datei. Dieser Vorfall wird gemeldet.'
                    : 'usage: sudo <befehl>', 'err'];
            case 'vim': case 'vi': case 'emacs': case 'nano':
                return [head + ': gestartet. Zum Beenden bitte den Rechner neu starten.', 'err'];
            case 'kaffee': case 'coffee': case 'brew':
                return ['ERROR 418: I’m a teapot. Kaffee gibt es in der Küche.', 'err'];
            case 'exit': case 'logout': case 'quit':
                return ['Es gibt kein Entkommen. (Aber oben ist ein Menü.)', 'res'];
            case 'staub': case 'dust': case 'du':
                return ['4,0K\t./projekte\n2,3T\t./staub\n\nSammelt digitalen Staub. Wie versprochen.', 'res'];
            case 'claude': case 'claude-code':
                fireworks();
                return [CLAUDE, 'res'];
            case 'konami':
                return ['↑ ↑ ↓ ↓ ← → ← → B A — 30 Leben freigeschaltet.', 'res'];
            default:
                return [unknown(cmd), 'err'];
        }
    }

    /* ---- rendering -------------------------------------------------- */

    /* textContent throughout: whatever is typed is data, never markup. */
    function push(cmd, out, kind) {
        var line = document.createElement('div');
        line.className = 'term-line term-gap';
        var sig = document.createElement('span');
        sig.className = 'term-sig';
        sig.textContent = '$';
        line.appendChild(sig);
        var c = document.createElement('span');
        c.className = 'term-out';
        c.textContent = cmd;
        line.appendChild(c);
        history.appendChild(line);

        if (out !== '') {
            var res = document.createElement('div');
            res.className = kind === 'err' ? 'term-err'
                          : kind === 'art' ? 'term-art' : 'term-res';
            res.textContent = out;
            history.appendChild(res);
        }

        while (history.children.length > MAX_LINES * 2) {
            history.removeChild(history.children[0]);
        }
    }

    function clearHistory() {
        while (history.firstChild) history.removeChild(history.firstChild);
    }

    function setPanic(on) {
        panic.hidden = !on;
        document.body.style.overflow = on ? 'hidden' : '';
        if (on) { reboot.focus(); } else { input.focus({ preventScroll: true }); }
    }

    input.addEventListener('input', function () { typed.textContent = input.value; });

    /* Shell-style recall: histIdx === entered.length means "new line". */
    var histIdx = 0;

    function recall(value) {
        input.value = value;
        typed.textContent = value;
        /* Put the caret at the end, after the value has landed. */
        requestAnimationFrame(function () {
            input.setSelectionRange(input.value.length, input.value.length);
        });
    }

    input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!entered.length || histIdx === 0) return;
            histIdx--;
            recall(entered[histIdx]);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx >= entered.length) return;
            histIdx++;
            recall(histIdx === entered.length ? '' : entered[histIdx]);
            return;
        }
        if (e.key !== 'Enter') return;
        e.preventDefault();
        var cmd = input.value.trim();
        input.value = '';
        typed.textContent = '';
        if (!cmd) return;

        entered.push(cmd);
        histIdx = entered.length;

        var r = run(cmd);
        if (r[0] === '__panic__') { setPanic(true); return; }
        if (r[0] === '__clear__') { clearHistory(); return; }
        push(cmd, r[0], r[1]);
    });

    prompt.addEventListener('click', function () { input.focus(); });

    reboot.addEventListener('click', function () {
        clearHistory();
        setPanic(false);
    });

    /* Konami code — it is an arcade, after all. */
    var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var kpos = 0;

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && fx && !fx.hidden) { closeFx(); return; }
        if (e.key === 'Escape' && !panic.hidden) { clearHistory(); setPanic(false); return; }

        var want = KONAMI[kpos];
        if (e.key === want || e.key.toLowerCase() === want) {
            kpos++;
            if (kpos === KONAMI.length) {
                kpos = 0;
                /* The arrows also drove history recall on the way here. */
                input.value = '';
                typed.textContent = '';
                histIdx = entered.length;
                push('konami', '↑ ↑ ↓ ↓ ← → ← → B A\n30 Leben freigeschaltet. Viel Erfolg.', 'res');
            }
        } else {
            kpos = (e.key === KONAMI[0]) ? 1 : 0;
        }
    });

    /* Focus only where there is a real keyboard: on touch this would throw
       up the on-screen keyboard the moment the page opens. */
    if (window.matchMedia('(pointer:fine)').matches) {
        input.focus({ preventScroll: true });
    }
}());
