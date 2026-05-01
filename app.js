import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    addDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 CONFIG FIREBASE (REMPLACE PAR LA TIENNE)
const firebaseConfig = {
    apiKey: "AIzaSyAkCMF1LIVGZDZ0GV2lY3fwaPzzRENbA",
    authDomain: "bien-etre-pour-tous.firebaseapp.com",
    projectId: "bien-etre-pour-tous"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= VARIABLES =================
let personalChart = null;
let globalChart = null;

// ================= IA =================
function computeHealthScore(sport, hospital) {
    let score = 0;

    if (sport >= 5) score += 3;
    else if (sport >= 2) score += 2;
    else score += 1;

    if (hospital === 0) score += 3;
    else if (hospital <= 2) score += 2;
    else score += 1;

    return score;
}

// ================= FORM =================
document.getElementById("healthForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    let age = Number(document.getElementById("age").value);
    let sport = Number(document.getElementById("sport").value);
    let disease = document.getElementById("disease").value;
    let hospital = Number(document.getElementById("hospital").value);

    let score = computeHealthScore(sport, hospital);

    let level =
        score >= 5 ? "🟢 Bonne santé" :
        score >= 3 ? "🟡 Santé moyenne" :
        "🔴 Risque élevé";

    let user = { age, sport, disease, hospital, score };

    // 👤 RESULTAT
    document.getElementById("result").innerHTML = `
        <h3>👤 Résultat Personnel</h3>
        <p>Score santé : ${score}/6</p>
        <p>${level}</p>
        <p>Maladie : ${disease}</p>
    `;

    // 💾 SAUVEGARDE FIREBASE
    await addDoc(collection(db, "sante"), user);

    // 📊 DASHBOARD
    renderPersonalChart(user);
    loadGlobalData();
});

// ================= DASHBOARD PERSONNEL =================
function renderPersonalChart(user) {

    if (personalChart) personalChart.destroy();

    personalChart = new Chart(document.getElementById("personalChart"), {
        type: "bar",
        data: {
            labels: ["Âge", "Sport", "Hôpital", "Score"],
            datasets: [{
                label: "Profil personnel",
                data: [user.age, user.sport, user.hospital, user.score]
            }]
        }
    });
}

// ================= GLOBAL =================
async function loadGlobalData() {

    const snapshot = await getDocs(collection(db, "sante"));

    let count = 0;
    let totalSport = 0;
    let totalScore = 0;

    snapshot.forEach(doc => {
        let d = doc.data();
        count++;

        totalSport += d.sport;
        totalScore += d.score;
    });

    document.getElementById("userCount").innerText =
        "Nombre d’utilisateurs : " + count;

    if (globalChart) globalChart.destroy();

    globalChart = new Chart(document.getElementById("globalChart"), {
        type: "bar",
        data: {
            labels: ["Sport moyen", "Score moyen"],
            datasets: [{
                label: "Statistiques globales",
                data: [
                    totalSport / count || 0,
                    totalScore / count || 0
                ]
            }]
        }
    });
}

// 🚀 LOAD AU DÉMARRAGE
loadGlobalData();
