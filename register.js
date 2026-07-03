/* ==========================================================================
   CONFIGURAÇÃO DO FIREBASE
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// Aqui importamos as ferramentas exclusivas para criar conta e atualizar perfil
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    // COLE SUAS CHAVES REAIS AQUI DENTRO NOVAMENTE
    apiKey: "AIzaSyBa9KLqX-WsuqzSVGyF73jXujNmvz7QibA",
  authDomain: "academia-fenrir.firebaseapp.com",
  projectId: "academia-fenrir",
  storageBucket: "academia-fenrir.firebasestorage.app",
  messagingSenderId: "174772006900",
  appId: "1:174772006900:web:3a76ecdc3f1dea84a393a1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ==========================================================================
   LÓGICA DE CADASTRO
   ========================================================================== */
const registerForm = document.querySelector('.register-form');

registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede a página de recarregar

    // Pegamos o que foi digitado
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    // 1º Passo: O Firebase cria o usuário com e-mail e senha
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // 2º Passo: Conta criada! Agora usamos o updateProfile para carimbar o nome nela
            return updateProfile(user, {
                displayName: nome
            });
        })
        .then(() => {
            // 3º Passo: Se deu tudo certo, avisamos o aluno e mandamos ele pro Login
            alert("Cadastro realizado com sucesso! Faça seu login.");
            window.location.href = "index.html"; 
        })
        .catch((error) => {
            // Tratamento de erros comuns no cadastro
            const errorCode = error.code;
            
            if (errorCode === 'auth/email-already-in-use') {
                alert("Erro: Este e-mail já está cadastrado na Fenrir.");
            } else if (errorCode === 'auth/weak-password') {
                alert("Erro: A senha é muito fraca. Use pelo menos 6 caracteres.");
            } else {
                alert("Erro ao cadastrar: " + error.message);
            }
        });
});