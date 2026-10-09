const firebaseConfig = {
  apiKey: "AIzaSyAiE-bOa_K64t8YiQ5sJ8HQSN4QQo-nQA4",
  authDomain: "recommendation-lab-e4977.firebaseapp.com",
  databaseURL: "https://recommendation-lab-e4977-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "recommendation-lab-e4977",
  storageBucket: "recommendation-lab-e4977.firebasestorage.app",
  messagingSenderId: "498389897479",
  appId: "1:498389897479:web:884c40cf0ac197278975a2"
};
let db = null;
try { firebase.initializeApp(firebaseConfig); db = firebase.database(); } catch (e) { db = null; }