// 1. Importa o núcleo do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// 2. Importa a parte de Login (que você já tinha)
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ==========================================
// 3. NOVA LINHA: Importa o Banco de Dados (Realtime Database)
// ==========================================
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Suas chaves secretas do Firebase (Mantenha as suas aqui!)
const firebaseConfig = {
   apiKey: "AIzaSyBa9KLqX-WsuqzSVGyF73jXujNmvz7QibA",
  authDomain: "academia-fenrir.firebaseapp.com",
  projectId: "academia-fenrir",
  storageBucket: "academia-fenrir.firebasestorage.app",
  messagingSenderId: "174772006900",
  appId: "1:174772006900:web:3a76ecdc3f1dea84a393a1"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Login
const auth = getAuth(app);

// ==========================================
// 4. NOVA LINHA: Inicializa o Banco de Dados
// ==========================================
const db = getDatabase(app);

// ... (Daqui para baixo continua o seu código de login normal) ...

// Instância do áudio do uivo (pré-carrega para reprodução rápida)
const somDoLobo = new Audio('audio/uivo.mp3');
somDoLobo.preload = 'auto';

/* ==========================================================================
   LÓGICA DE LOGIN DA FENRIR ACADEMIA
   ========================================================================== */

// 1. Capturamos o formulário do HTML
const loginForm = document.querySelector('.login-form');

// 2. Criamos um "ouvinte" que avisa quando o botão ENTRAR for clicado
loginForm.addEventListener('submit', (e) => {
    
    // Isso impede a página de recarregar (o padrão do HTML)
    e.preventDefault(); 

    // Tentativa rápida para "desbloquear" reprodução (aproveita o gesto do usuário)
    // Tocamos e pausamos imediatamente para que o navegador permita plays posteriores.
    somDoLobo.play().then(() => {
        somDoLobo.pause();
        somDoLobo.currentTime = 0;
    }).catch(() => {
        // Ignora falha aqui: se o navegador não permitir agora, vamos tentar novamente depois.
    });

    // 3. Pegamos o que o usuário digitou nos campos
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

  // 4. Mandamos os dados para o Firebase verificar
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // SE A SENHA ESTIVER CERTA:
            const user = userCredential.user;
            
            let nomeParaExibir = "";

            // Verifica se o usuário tem um nome real cadastrado no Firebase
            if (user.displayName) {
                // Se tiver nome completo, pega apenas o primeiro nome
                nomeParaExibir = user.displayName.split(' ')[0];
            } else {
                // Se for uma conta antiga sem nome, pega o começo do e-mail
                nomeParaExibir = user.email.split('@')[0];
            }
            
            // salva o nome correto no navegador (localStorage)
            localStorage.setItem('nomeUsuarioFenrir', nomeParaExibir);
            
            // redireciona o usuário para o painel inicial somente após o áudio terminar.
            const redirectToDashboard = () => { window.location.href = "dashboard.html"; };

            // tenta rodar a musica, se não, joga sozinho
            const playPromise = somDoLobo.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // redirecionamento
                    somDoLobo.addEventListener('ended', () => {
                        redirectToDashboard();
                    }, { once: true });

                    // Safety fallback: caso o evento 'ended' não dispare, redireciona após 7s
                    const fallback = setTimeout(() => {
                        redirectToDashboard();
                    }, 7000);
                    somDoLobo.addEventListener('ended', () => clearTimeout(fallback), { once: true });
                }).catch((err) => {
                    console.warn('Não foi possível reproduzir o áudio antes do redirect:', err);
                    redirectToDashboard();
                });
            } else {
                // 
                redirectToDashboard();
            }
        })
        .catch((error) => {
            // caso a senha for errada ou o user tiver cpf cancelado:
            const errorCode = error.code;
            
            if (errorCode === 'auth/invalid-credential') {
                alert("Erro: E-mail ou senha incorretos.");
            } else if (errorCode === 'auth/invalid-email') {
                alert("Erro: O formato do e-mail é inválido.");
            } else {
                alert("Falha no login. Tente novamente.");
            }
        });

});