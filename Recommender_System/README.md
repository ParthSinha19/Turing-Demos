# Recommendation Lab

**Can you build an algorithm that knows what you like?**

A classroom demo for students aged 13 to 16. Students rate movies, add their own, and watch a simple recommendation algorithm reshape their feed. They also see what their classmates have rated, and can rate those movies too.

This is a simple content-based recommendation system. Real systems such as Netflix, Spotify, YouTube and Amazon are far more sophisticated.

---

## How it works

1. Every movie is described by four numbers (0 to 5): Action, Comedy, Sci-Fi, Animation.
2. A student rates movies from 1 to 5 stars.
3. Their **taste vector** is the rating-weighted average of the movies they rated.
4. Every unrated movie is ranked by **Euclidean distance** to that vector. Smaller distance means more similar.
5. Similarity is shown as "% SIMILAR". It is not a probability of liking something.
6. Each recommendation has a **WHY?** panel that compares the student's vector with the movie's numbers and shows the distance.
7. In a classroom, every rating is shared. Classmates see "Name rated this, you might like it" in the **From the class** row, and any movie a student adds joins everyone's pool.

The recommendation calculation runs entirely in the browser. Firebase is only used for classroom sharing.

---

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Student page |
| `teacher.html` | Teacher page (creates a classroom code) |
| `app.js` | Student logic: ratings, algorithm, feed, classroom |
| `firebase.js` | Firebase configuration (shared by both pages) |
| `styles.css` | Styling |

---

## Setup

### 1. Firebase

1. Create a project in the [Firebase console](https://console.firebase.google.com) and add a **Realtime Database** (the project here uses the `europe-west1` region).
2. Go to **Project settings > Your apps**, register a web app, and copy the config values.
3. Paste them into `firebase.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Do not use Firebase Hosting or Firebase Authentication. Students need no account.

### 2. Database rules

Go to **Realtime Database > Rules**, paste the following and click **Publish**. Do not leave the database in open Test Mode.

```json
{
  "rules": {
    "classrooms": {
      "$c": {
        ".read": true,
        "createdAt": { ".write": "!data.exists()" },
        "status": { ".write": "!data.exists() || newData.val()==='ended'" },
        "students": {
          "$s": { ".write": "root.child('classrooms/'+$c+'/status').val()==='active'" }
        },
        "activity": {
          "$a": { ".write": "root.child('classrooms/'+$c+'/status').val()==='active' && !data.exists()" }
        }
      }
    }
  }
}
```

These rules are deliberately simple and suit a short demo. Anyone who knows a classroom code can read that classroom. Classroom data is temporary and the teacher can end the session.

### 3. Teacher password

The teacher login is a dummy password set at the top of the script in `teacher.html`:

```js
const PASSWORD = "teacher123";
```

Change it before use. It is visible in the page source, so it only protects the code generator and is not real security.

---

## Deploying to GitHub Pages

1. Put all five files in the root of a public GitHub repository.
2. Go to **Settings > Pages**.
3. Set **Source** to *Deploy from a branch*, **Branch** to `main`, folder `/ (root)`, then save.
4. After a minute or two the site is live at:

```
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

All paths are relative and there is no build step.

To test locally first:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Running a session

**Teacher**

1. Open `teacher.html` and log in.
2. Click **New classroom code** and share the six-digit code with the class.
3. Optionally click **Join as a student** to take part alongside the class.
4. Click **End session** when finished. This closes the classroom for new activity.

**Students**

1. Open the site and enter the classroom code and a nickname (a first name or nickname only, no personal information).
2. Rate movies from the feed, add their own movies, and watch the recommendations change.
3. Check the **From the class** row to see what classmates have rated.

---

## Discussion prompts

- Which movie did your top pick change to after one rating?
- Can you make a film you dislike become your number one recommendation?
- Why did a classmate's favourite appear in your feed?
- What is missing from only four numbers? What would a real system know that this one does not?

---

## Privacy

- No emails, passwords, photos, locations or dates of birth are collected.
- Students use temporary nicknames.
- Ratings, movies and the student ID are stored in the browser's `localStorage`. Nothing sensitive is stored.
- Shared Firebase data is minimal: nickname, movie title, genre numbers and star rating.
- Classroom data is temporary and the teacher can end the session.

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "Live classroom sharing is temporarily unavailable" | Wrong Firebase config, rules not published, or the school network blocking `gstatic.com` or `firebasedatabase.app`. Open the browser console (F12) and look for `PERMISSION_DENIED` or `firebase is not defined`. |
| Teacher cannot create a code | Rules not published, or the config still contains placeholder values. |
| "Classroom not found" | Typo in the code, or the teacher has ended the session. |
| 404 on GitHub Pages | The file must be named `index.html` and sit at the repository root. |
| Old version showing | Hard refresh with Ctrl+Shift+R. |

---

## Limitations

- Four fixed genres only.
- Similarity is based on genre numbers alone, with no viewing behaviour or other signals.
- The teacher login is a demo placeholder, not real authentication.
- The recommender is an educational simplification and should not be presented as how any commercial service works.
