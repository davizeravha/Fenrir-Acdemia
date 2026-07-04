/* ==========================================================================
   CONFIGURAÇÃO DO FIREBASE
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBa9KLqX-WsuqzSVGyF73jXujNmvz7QibA",
    authDomain: "academia-fenrir.firebaseapp.com",
    projectId: "academia-fenrir",
    storageBucket: "academia-fenrir.firebasestorage.app",
    messagingSenderId: "174772006900",
    appId: "1:174772006900:web:3a76ecdc3f1dea84a393a1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/* ==========================================================================
   CARREGAMENTO FACEAPI
   ========================================================================== */
const loadFaceAPI = () => {
    return new Promise((resolve) => {
        if (window.faceapi) return resolve();
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
        script.onload = resolve;
        document.head.appendChild(script);
    });
};

async function prepararBiometria() {
    await loadFaceAPI();
    const MODEL_URL = './models';
    
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        console.log("IA PRONTA!");
    } catch (err) {
        console.error("ERRO ao carregar IA:", err);
        alert("Erro ao carregar modelos de IA. Verifique a consola para detalhes.");
    }
}

/* ==========================================================================
   LÓGICA DE CADASTRO
   ========================================================================== */
const registerForm = document.querySelector('.register-form');
let currentUserUid = null;

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        currentUserUid = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: nome });

        alert("Cadastro inicial concluído! Vamos configurar o seu acesso facial.");
        
        // Alternar visualização
        registerForm.style.display = 'none';
        const scannerArea = document.getElementById('scanner-area');
        scannerArea.style.display = 'block';

        // Iniciar câmara e IA
        await iniciarScanner();
        await prepararBiometria();
        
    } catch (error) {
        alert("Erro no cadastro: " + error.message);
    }
});

async function iniciarScanner() {
    const video = document.getElementById('videoScanner');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert("Erro ao aceder à câmara: " + err);
    }
}

/* ==========================================================================
   SALVAR BIOMETRIA
   ========================================================================== */
document.getElementById('btn-save-face').addEventListener('click', async () => {
    const video = document.getElementById('videoScanner');
    
    try {
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                        .withFaceLandmarks()
                                        .withFaceDescriptor();

        if (!detection) {
            alert("Rosto não detetado! Aproxime-se e verifique a luz.");
            return;
        }

        await set(ref(db, 'alunos/' + currentUserUid), {
            nome: auth.currentUser.displayName,
            email: auth.currentUser.email,
            faceDescriptor: Array.from(detection.descriptor)
        });

        alert("Biometria salva com sucesso!");
        window.location.href = "index.html";
    } catch (err) {
        console.error("ERRO:", err);
        alert("Erro: " + err.message);
    }
});