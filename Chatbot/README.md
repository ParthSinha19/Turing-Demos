# AI Lab — Build Your Own Chatbot (Year 5–6, 60 minutes)

A single self-contained web page (`index.html`) that runs an entire hands-on
AI lesson in the browser. No backend, no accounts, no database — everything
runs client-side with [Transformers.js](https://huggingface.co/docs/transformers.js)
and a small quantised model (`HuggingFaceTB/SmolLM2-360M-Instruct` by default,
loaded from the Hugging Face Hub CDN, not stored in this repo). The model ID
is a single constant (`MODEL_ID`) near the top of the `<script>` block —
swap it for a Qwen model if you want stronger general knowledge at the cost
of slower replies on weaker laptops.

## What's inside

- `index.html` — the entire activity (HTML/CSS/JS in one file): welcome →
  meet the AI → build your bot → teach your bot → chat → AI detective →
  challenges → reflection.
- Runs on **WebGPU** when available, falls back to **WASM/CPU** automatically
  (with a message telling the class which mode they're in).
- Student data (bot config, knowledge cards, chat log, reflection answers)
  lives only in `sessionStorage` — nothing is sent anywhere, and it disappears
  when the browser tab/session ends. A "Reset My Bot" button clears it early.

## Deploying to GitHub Pages

1. Create a new GitHub repository (public), e.g. `ai-lab-chatbot`.
2. Add `index.html` to the repository root (exactly as provided — don't
   rename it, GitHub Pages serves `index.html` by default).
3. Go to **Settings → Pages** in the repo.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   branch `main`, folder `/ (root)`. Save.
5. Wait 1–2 minutes. GitHub will show a URL like:
   `https://<your-username>.github.io/ai-lab-chatbot/`
6. Open that URL yourself first to confirm the model downloads and the chat
   works (first load fetches ~300–500MB of quantised model weights from the
   Hugging Face CDN, cached by the browser afterwards).

## Creating the Bitly link

1. Go to [bitly.com](https://bitly.com) and log in (or create a free account).
2. Paste the GitHub Pages URL from step 5 above.
3. Optionally customise the back-half, e.g. `bit.ly/ai-lab-2026`.
4. Share that short link with students (write it on the board, or put it in
   your classroom platform).

## Classroom notes (school Wi-Fi / Chromebooks)

- The model download happens once per browser session and needs internet
  access to `huggingface.co` and its CDN — check this isn't blocked by your
  school's web filter ahead of the lesson.
- If a school Chromebook doesn't support WebGPU, the page automatically
  switches to a slower CPU mode and tells the student — the lesson still
  works, just with slightly slower replies.
- Encourage students to keep their tab open for the full hour — refreshing
  keeps their bot (thanks to `sessionStorage`), but closing the tab/browser
  clears it, which is the intended "disposable session" design.
- A "🧑‍🏫 Teacher Info" button in the top-right of the page opens an
  in-app explanation of the AI/technical concepts, separate from the student
  view, for anyone observing or covering the lesson.

## Speed: why it's all client-side, and what that means

Every reply is generated on the *student's own device* — GitHub Pages just
serves the files, so hosting location has no effect on reply speed. Speed
depends on: WebGPU support (fast) vs. CPU/WASM fallback (slower), model size,
and how many tokens it's asked to generate. This build defaults to a small
360M-parameter model with short (60-token) greedy replies specifically to
keep things snappy on ordinary Chromebooks.

If you need even faster/steadier answers than that, or your class runs on
particularly weak hardware, the honest alternative is a small backend that
calls a hosted LLM API (e.g. Anthropic's or another provider's) instead of
running inference in the browser. That would be noticeably faster and more
consistent, but it reverses several of the original design goals: it needs a
server, an API key to protect, ongoing hosting/API cost, and every message
would depend on the school's live internet connection rather than a one-time
model download. Worth doing only if browser-side speed genuinely isn't
workable after testing on real classroom devices.

## Customising

Everything — built-in knowledge base, avatar emoji set, personality slider
labels, challenge text, timings — lives in plain HTML/JS inside `index.html`
and can be edited directly with any text editor; no build step is required.
