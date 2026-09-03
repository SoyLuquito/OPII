// ===== CONFIGURAÇÃO DO FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyAWF3Q_PgL8fWHDWeoHow3DtFuQVGyUyrE",
    authDomain: "opii-ca11f.firebaseapp.com",
    projectId: "opii-ca11f",
    storageBucket: "opii-ca11f.firebasestorage.app",
    messagingSenderId: "851753210995",
    appId: "1:851753210995:web:b94ef013fa435012e40606",
    measurementId: "G-7GW41J2XG2"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== ELEMENTOS =====
const mensagem = document.getElementById('mensagem');

// ===== FUNÇÕES DE NAVEGAÇÃO =====
function mostrarLogin() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('recuperarForm').style.display = 'none';
    limparMensagem();
}

function mostrarRegistro() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'flex';
    document.getElementById('recuperarForm').style.display = 'none';
    limparMensagem();
}

function mostrarRecuperar() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('recuperarForm').style.display = 'flex';
    limparMensagem();
}

// ===== FUNÇÃO PARA MOSTRAR/ESCONDER SENHA =====
function toggleSenha(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.add('oculto');
        button.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        `;
    } else {
        input.type = 'password';
        button.classList.remove('oculto');
        button.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
        `;
    }
}

// ===== FUNÇÃO PARA EXIBIR MENSAGEM =====
function mostrarMensagem(texto, tipo = 'erro') {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
    mensagem.style.display = 'block';
}

function limparMensagem() {
    mensagem.style.display = 'none';
    mensagem.className = 'mensagem';
}

// ===== LOGIN =====
async function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;

    if (!email || !senha) {
        mostrarMensagem('Preencha todos os campos', 'erro');
        return;
    }

    try {
        mostrarMensagem('Fazendo login...', 'info');
        await auth.signInWithEmailAndPassword(email, senha);
        // Login bem-sucedido - redirecionar para a página de fichas
        window.location.href = 'dashboard.html';
    } catch (error) {
        let mensagemErro = 'Erro ao fazer login. Tente novamente.';
        if (error.code === 'auth/user-not-found') {
            mensagemErro = 'Usuário não encontrado. Verifique seu email.';
        } else if (error.code === 'auth/wrong-password') {
            mensagemErro = 'Senha incorreta. Tente novamente.';
        } else if (error.code === 'auth/invalid-email') {
            mensagemErro = 'Email inválido. Verifique o formato.';
        } else if (error.code === 'auth/too-many-requests') {
            mensagemErro = 'Muitas tentativas. Tente novamente mais tarde.';
        }
        mostrarMensagem(mensagemErro, 'erro');
        console.error('Erro no login:', error);
    }
}

// ===== REGISTRO =====
async function fazerRegistro() {
    const nome = document.getElementById('registerNome').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const senha = document.getElementById('registerSenha').value;
    const confirmarSenha = document.getElementById('registerConfirmarSenha').value;

    if (!nome || !email || !senha || !confirmarSenha) {
        mostrarMensagem('Preencha todos os campos', 'erro');
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem', 'erro');
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'erro');
        return;
    }

    try {
        mostrarMensagem('Criando conta...', 'info');
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        
        // Atualizar perfil do usuário com o nome
        await userCredential.user.updateProfile({
            displayName: nome
        });

        // Salvar dados adicionais no Firestore
        await db.collection('usuarios').doc(userCredential.user.uid).set({
            nome: nome,
            email: email,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            fichas: []
        });

        mostrarMensagem('Conta criada com sucesso!', 'sucesso');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        let mensagemErro = 'Erro ao criar conta. Tente novamente.';
        if (error.code === 'auth/email-already-in-use') {
            mensagemErro = 'Este email já está em uso. Faça login ou use outro email.';
        } else if (error.code === 'auth/invalid-email') {
            mensagemErro = 'Email inválido. Verifique o formato.';
        } else if (error.code === 'auth/weak-password') {
            mensagemErro = 'Senha muito fraca. Use pelo menos 6 caracteres.';
        }
        mostrarMensagem(mensagemErro, 'erro');
        console.error('Erro no registro:', error);
    }
}

// ===== LOGIN COM GOOGLE =====
async function loginGoogle() {
    try {
        mostrarMensagem('Conectando com Google...', 'info');
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        // Verificar se é a primeira vez que o usuário loga com Google
        const user = result.user;
        const docRef = await db.collection('usuarios').doc(user.uid).get();
        
        if (!docRef.exists) {
            // Salvar dados do usuário no Firestore
            await db.collection('usuarios').doc(user.uid).set({
                nome: user.displayName || 'Usuário Google',
                email: user.email,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                fichas: []
            });
        }
        
        window.location.href = 'dashboard.html';
    } catch (error) {
        let mensagemErro = 'Erro ao conectar com Google. Tente novamente.';
        if (error.code === 'auth/popup-closed-by-user') {
            mensagemErro = 'Popup fechado. Tente novamente.';
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            mensagemErro = 'Já existe uma conta com este email usando outro método.';
        }
        mostrarMensagem(mensagemErro, 'erro');
        console.error('Erro no login com Google:', error);
    }
}

// ===== RECUPERAR SENHA =====
async function recuperarSenha() {
    const email = document.getElementById('recuperarEmail').value.trim();

    if (!email) {
        mostrarMensagem('Digite seu email', 'erro');
        return;
    }

    try {
        mostrarMensagem('Enviando link de recuperação...', 'info');
        await auth.sendPasswordResetEmail(email);
        mostrarMensagem('Link de recuperação enviado para seu email!', 'sucesso');
        document.getElementById('recuperarEmail').value = '';
    } catch (error) {
        let mensagemErro = 'Erro ao enviar link de recuperação.';
        if (error.code === 'auth/user-not-found') {
            mensagemErro = 'Usuário não encontrado com este email.';
        }
        mostrarMensagem(mensagemErro, 'erro');
        console.error('Erro na recuperação:', error);
    }
}

// ===== VERIFICAR ESTADO DE AUTENTICAÇÃO =====
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuário está logado, redirecionar para dashboard
        const currentPath = window.location.pathname;
        if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '') {
            window.location.href = 'dashboard.html';
        }
    } else {
        // Usuário não está logado
        const currentPath = window.location.pathname;
        if (!currentPath.includes('index.html') && !currentPath.includes('login')) {
            // Se não estiver na página de login, redirecionar
            if (!currentPath.includes('index.html') && currentPath !== '/') {
                window.location.href = 'index.html';
            }
        }
    }
});

// ===== DETECTAR ENTER PARA SUBMIT =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const recuperarForm = document.getElementById('recuperarForm');
        
        if (loginForm.style.display !== 'none' && loginForm.style.display !== '') {
            fazerLogin();
        } else if (registerForm.style.display !== 'none' && registerForm.style.display !== '') {
            fazerRegistro();
        } else if (recuperarForm.style.display !== 'none' && recuperarForm.style.display !== '') {
            recuperarSenha();
        }
    }
});

console.log('Ordem Paranormal 2 - Sistema de Login carregado!');
console.log('🔐 Autenticação com Firebase configurada!');