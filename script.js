(() => {
    "use strict";

    const $  = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const items   = $$(".item");
    const buttons = $$(".filter");
    const search  = $("#search");
    const readout = $("#readout");
    const empty   = $("#empty");
    const preview = $("#preview");
    const stage   = $("#stage");
    const plate   = $("#plate");

    const state = { cat: "all", q: "" };
    let current = null;

    const cats = el => el.dataset.cat.split(" ");

    /* ---------- Static counts ---------- */
    $("#total").textContent = items.length;
    buttons.forEach(b => {
        const f = b.dataset.filter;
        const n = f === "all" ? items.length : items.filter(i => cats(i).includes(f)).length;
        $("sup", b).textContent = n;
    });

    /* ---------- Preview plate ---------- */
    function show(item) {
        if (!item || item === current) return;
        current = item;

        stage.replaceChildren($("template", item).content.cloneNode(true));
        if (reduce) $$("animateMotion", stage).forEach(n => n.remove());

        $("#fig-no").textContent    = "Lab " + $(".num", item).textContent;
        $("#fig-cat").textContent   = $(".meta", item).textContent;
        $("#fig-title").textContent = $(".title", item).textContent;
        plate.setAttribute("href", $(".row", item).getAttribute("href"));
    }

    items.forEach(item => {
        const row = $(".row", item);
        row.addEventListener("pointerenter", () => show(item));
        row.addEventListener("focus", () => show(item));
    });

    /* ---------- Search + filter ---------- */
    function apply() {
        const q = state.q.trim().toLowerCase();
        let n = 0;

        items.forEach(item => {
            const hay = [
                item.dataset.tags,
                $(".title", item).textContent,
                $(".desc", item).textContent,
                $(".meta", item).textContent
            ].join(" ").toLowerCase();

            const ok = (state.cat === "all" || cats(item).includes(state.cat)) &&
                       (!q || hay.includes(q));

            item.hidden = !ok;
            if (ok) item.style.setProperty("--i", n++);
        });

        readout.textContent = `Showing ${n} of ${items.length} labs`;
        empty.hidden = n !== 0;
        preview.hidden = n === 0;

        if (!current || current.hidden) {
            current = null;
            show(items.find(i => !i.hidden));
        }
    }

    function setFilter(value) {
        state.cat = value;
        buttons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === value)));
    }

    buttons.forEach(b => b.addEventListener("click", () => {
        setFilter(b.dataset.filter);
        apply();
    }));

    search.addEventListener("input", () => {
        state.q = search.value;
        apply();
    });

    $("#reset").addEventListener("click", () => {
        search.value = "";
        state.q = "";
        setFilter("all");
        apply();
    });

    /* ---------- Surprise me ---------- */
    $("#surprise").addEventListener("click", () => {
        const pick = items[Math.floor(Math.random() * items.length)];
        location.href = $(".row", pick).getAttribute("href");
    });

    /* ---------- Robot: eyes follow the pointer, click to chat ---------- */
    const bot    = $("#bot");
    const pupils = $("#pupils");
    const say    = $("#bot-say");

    if (!reduce) {
        addEventListener("pointermove", e => {
            const r  = bot.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d  = Math.hypot(dx, dy) || 1;
            const k  = Math.min(1, d / 280) * 6;
            pupils.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
        });
    }

    const lines = [
        "Hi! I'm Turing. Pick a lab!",
        "I learn from examples, just like you do.",
        "Try the Surprise me button!",
        "Computers aren't magic. They spot patterns.",
        "Ready to train a model?"
    ];
    let line = 0;
    bot.addEventListener("click", () => {
        line = (line + 1) % lines.length;
        say.textContent = lines[line];
    });

    /* ---------- Keyboard ---------- */
    document.addEventListener("keydown", e => {
        const active = document.activeElement;
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);

        if (e.key === "/" && !typing) {
            e.preventDefault();
            search.focus();
            return;
        }

        if (e.key === "Escape" && active === search) {
            search.value = "";
            state.q = "";
            apply();
            search.blur();
            return;
        }

        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            const rows = items.filter(i => !i.hidden).map(i => $(".row", i));
            const idx = rows.indexOf(active);
            if (!rows.length || (idx === -1 && active !== search)) return;

            e.preventDefault();
            const next = e.key === "ArrowDown"
                ? rows[idx + 1] || rows[rows.length - 1]
                : (idx <= 0 ? search : rows[idx - 1]);
            next.focus();
        }
    });

    apply();
})();