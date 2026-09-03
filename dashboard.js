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

// ===== MAPEAMENTO DE CORES DOS PERFIS =====
const coresPerfil = {
    verde: '#4d7d2b',
    azul: '#387cdf',
    vermelho: '#b12a14'
};

const nomesPerfil = {
    verde: 'Vigilante',
    azul: 'Analista',
    vermelho: 'Executor'
};

// ===== VARIÁVEIS =====
let fichas = [];
let usuarioAtual = null;
let unsubscribeFichas = null;

// ===== VERIFICAR AUTENTICAÇÃO =====
auth.onAuthStateChanged(async user => {
    if (user) {
        usuarioAtual = user;
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.displayName || user.email;
        }
        await carregarFichas();
    } else {
        window.location.href = 'index.html';
    }
});

// ===== CARREGAR FICHAS =====
async function carregarFichas() {
    const container = document.getElementById('fichasContainer');
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Carregando fichas...</p>
        </div>
    `;

    try {
        if (unsubscribeFichas) {
            unsubscribeFichas();
            unsubscribeFichas = null;
        }

        console.log('🔍 Buscando fichas do Firestore...');
        
        const snapshot = await db.collection('fichas')
            .where('userId', '==', usuarioAtual.uid)
            .get();

        fichas = [];
        snapshot.forEach(doc => {
            fichas.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Ordenar por data
        fichas.sort((a, b) => {
            const dataA = a.atualizadoEm?.toDate?.() || new Date(0);
            const dataB = b.atualizadoEm?.toDate?.() || new Date(0);
            return dataB - dataA;
        });

        localStorage.setItem(`fichas_${usuarioAtual.uid}`, JSON.stringify(fichas));
        renderizarFichas();
        console.log(`✅ ${fichas.length} fichas carregadas`);

        // Listener em tempo real
        unsubscribeFichas = db.collection('fichas')
            .where('userId', '==', usuarioAtual.uid)
            .onSnapshot((snapshot) => {
                console.log('🔄 Atualizando lista...');
                fichas = [];
                snapshot.forEach(doc => {
                    fichas.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                fichas.sort((a, b) => {
                    const dataA = a.atualizadoEm?.toDate?.() || new Date(0);
                    const dataB = b.atualizadoEm?.toDate?.() || new Date(0);
                    return dataB - dataA;
                });
                localStorage.setItem(`fichas_${usuarioAtual.uid}`, JSON.stringify(fichas));
                renderizarFichas();
            }, (error) => {
                console.error('❌ Erro no listener:', error);
            });

    } catch (error) {
        console.error('❌ Erro ao carregar fichas:', error);
        container.innerHTML = `
            <div class="loading" style="color: rgba(255,50,50,0.3);">
                <p>Erro ao carregar fichas: ${error.message}</p>
                <button onclick="carregarFichas()" style="margin-top: 12px; padding: 8px 24px; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2); border-radius: 6px; color: #8b5cf6; cursor: pointer; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 600;">Tentar novamente</button>
            </div>
        `;
    }
}

// ===== RENDERIZAR FICHAS =====
function renderizarFichas() {
    const container = document.getElementById('fichasContainer');
    
    if (fichas.length === 0) {
        container.innerHTML = `
            <div class="sem-fichas">
                <svg viewBox="0 0 24 24" width="48" height="48"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="currentColor"/></svg>
                <p>Nenhuma ficha criada</p>
                <p class="sub">Clique em "Nova Ficha" para começar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    fichas.forEach(ficha => {
        const card = document.createElement('div');
        card.className = 'ficha-card';
        card.dataset.nome = (ficha.nome || '').toLowerCase();
        card.dataset.fichaId = ficha.id;
        
        // Definir cor do perfil
        const perfilKey = ficha.perfil || 'verde';
        const corPerfil = coresPerfil[perfilKey] || '#8b5cf6';
        const nomePerfil = nomesPerfil[perfilKey] || 'Vigilante';
        
        card.style.setProperty('--cor-perfil', corPerfil);
        
        card.addEventListener('click', function(e) {
            if (e.target.closest('button')) return;
            abrirFichaConfirmacao(ficha.id, ficha.nome);
        });
        
        const nomePersonagem = ficha.nome || 'Sem nome';
        const ocupacao = ficha.ocupacao || 'Sem ocupação';
        const nivel = ficha.nivel || 1;
        
        let dataStr = 'Data desconhecida';
        if (ficha.atualizadoEm) {
            try {
                const data = ficha.atualizadoEm.toDate ? ficha.atualizadoEm.toDate() : new Date(ficha.atualizadoEm);
                dataStr = data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                dataStr = 'Data desconhecida';
            }
        }
        
        card.innerHTML = `
            <div class="ficha-header">
                <span class="ficha-nome">${nomePersonagem}</span>
                <span class="ficha-perfil">${nomePerfil}</span>
            </div>
            <div class="ficha-info">
                <span><strong>Ocupação:</strong> ${ocupacao}</span>
                <span><strong>Nível:</strong> ${nivel}</span>
            </div>
            <div class="ficha-acoes">
                <button class="excluir" onclick="event.stopPropagation(); excluirFicha('${ficha.id}')">
                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    Excluir
                </button>
            </div>
            <div class="ficha-data">
                Última alteração: ${dataStr}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== ABRIR FICHA COM CONFIRMAÇÃO =====
function abrirFichaConfirmacao(fichaId, nomePersonagem) {
    if (confirm(`Deseja abrir a ficha "${nomePersonagem}"?`)) {
        window.location.href = `ficha.html?id=${fichaId}`;
    }
}

// ===== FILTRAR FICHAS =====
function filtrarFichas() {
    const termo = document.getElementById('searchFicha').value.toLowerCase();
    const cards = document.querySelectorAll('.ficha-card');
    
    cards.forEach(card => {
        const nome = card.dataset.nome || '';
        card.style.display = nome.includes(termo) ? 'block' : 'none';
    });
}

// ===== CRIAR NOVA FICHA =====
function criarNovaFicha() {
    console.log('✅ Botão Nova Ficha clicado!');
    
    if (!usuarioAtual) {
        console.error('❌ Usuário não autenticado');
        alert('Usuário não autenticado. Faça login novamente.');
        return;
    }

    const btn = document.querySelector('.btn-criar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '⏳ Criando...';
    btn.disabled = true;

    const novaFicha = {
        userId: usuarioAtual.uid,
        nome: 'Novo Personagem',
        perfil: 'verde',
        ocupacao: '',
        nivel: 1,
        atributos: {
            fisico: 6,
            mente: 6,
            emocao: 6
        },
        periciasValores: {},
        habilidades: [],
        inventario: [],
        anotacoes: [],
        categorias: [],
        pvAtual: 10,
        pvMax: 10,
        pdAtual: 10,
        pdMax: 10,
        idade: '',
        genero: '',
        altura: '',
        peso: '',
        historia: '',
        foto: '',
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    const periciasList = [
        'Acrobacia', 'Aptidão em Artes', 'Aptidão em Atualidades', 
        'Aptidão em Burocracia', 'Aptidão em Exatas', 'Aptidão em Humanas',
        'Aptidão em Tática', 'Atletismo', 'Crime', 'Disciplina', 'Enganação',
        'Furtividade', 'Intimidar', 'Intuição', 'Luta', 'Máquinas', 'Medicina',
        'Ocultismo', 'Percepção', 'Persuasão', 'Pesquisar', 'Pontaria',
        'Sobrevivência', 'Tecnologia', 'Vigor'
    ];
    
    periciasList.forEach(p => {
        novaFicha.periciasValores[p] = 4;
    });

    console.log('📝 Criando nova ficha no Firestore...');

    db.collection('fichas').add(novaFicha)
        .then(docRef => {
            console.log('✅ Ficha criada com ID:', docRef.id);
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            mostrarToast('✅ Ficha criada com sucesso!');
        })
        .catch(error => {
            console.error('❌ Erro ao criar ficha:', error);
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            mostrarToast('Erro ao criar ficha: ' + error.message, 'erro');
        });
}

// ===== EXCLUIR FICHA =====
async function excluirFicha(fichaId) {
    if (!confirm('Tem certeza que deseja excluir esta ficha?')) return;

    try {
        await db.collection('fichas').doc(fichaId).delete();
        mostrarToast('🗑️ Ficha excluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao excluir ficha:', error);
        mostrarToast('Erro ao excluir ficha. Tente novamente.', 'erro');
    }
}

// ===== TOAST =====
function mostrarToast(mensagem, tipo = 'sucesso') {
    const toastAntigo = document.querySelector('.toast-flutuante');
    if (toastAntigo) toastAntigo.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-flutuante';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 14px 24px;
        background: ${tipo === 'erro' ? 'rgba(255,50,50,0.9)' : 'rgba(139,92,246,0.9)'};
        border-radius: 10px;
        color: #ffffff;
        font-family: 'Rajdhani', sans-serif;
        font-size: 15px;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        z-index: 9999;
        animation: slideInToast 0.4s ease;
        border: 1px solid rgba(255,255,255,0.1);
        max-width: 90%;
    `;
    toast.textContent = mensagem;

    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            @keyframes slideInToast {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .toast-flutuante { animation: slideInToast 0.4s ease; }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== LOGOUT =====
function fazerLogout() {
    if (unsubscribeFichas) {
        unsubscribeFichas();
        unsubscribeFichas = null;
    }
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => console.error('Erro ao fazer logout:', error));
}

window.addEventListener('online', () => {
    console.log('🟢 Conexão restaurada!');
    if (usuarioAtual) carregarFichas();
});

console.log('📊 Dashboard carregado!');