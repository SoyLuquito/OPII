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

// CONSTANTE ADMIN
const ADMIN_EMAIL = 'contato.lucadesousa@gmail.com';

// ===== VARIÁVEIS GLOBAIS =====
let fichaId = null;
let fichaData = null;
let usuarioAtual = null;
let editMode = {
    atributos: false,
    pericias: false
};
let unsubscribeFicha = null;
let salvando = false;
let timeoutSalvar = null;

// Controle de Navegação das Abas
let abaAtual = 'atributos';
let isFirstLoad = true;

// ===== ELEMENTOS =====
const header = document.getElementById('header');
const perfilSelect = document.getElementById('perfilSelect');
const perfilWrapper = document.getElementById('perfilWrapper');
const ocupacaoSelect = document.getElementById('ocupacaoSelect');
const nomeInput = document.getElementById('nomeInput');
const nivelInput = document.getElementById('nivelInput');
const fotoContainer = document.getElementById('fotoContainer');
const fotoPreview = document.getElementById('fotoPreview');

// ===== VALORES DOS ATRIBUTOS =====
const valoresPermitidos = [4, 6, 8, 10, 12, 20];
let atributos = {
    fisico: 6,
    mente: 6,
    emocao: 6
};

// ===== PERÍCIAS =====
const periciasList = [
    { nome: 'Acrobacia', atributo: 'fisico', descricao: 'Movimentos de ginástica e parkour, andar de skate ou patins.' },
    { nome: 'Aptidão em Artes', atributo: 'mente', descricao: 'Conhecimento em formas de arte, como música, dança, escrita, pintura, atuação e outras.' },
    { nome: 'Aptidão em Atualidades', atributo: 'mente', descricao: 'Conhecimento em assuntos gerais, como esporte, entretenimento e cultura popular.' },
    { nome: 'Aptidão em Burocracia', atributo: 'mente', descricao: 'Conhecimento em direito, política, economia, contabilidade e estruturas governamentais e corporativas.' },
    { nome: 'Aptidão em Exatas', atributo: 'mente', descricao: 'Conhecimento em ciências exatas, como matemática, física, química, biologia, astronomia e geologia.' },
    { nome: 'Aptidão em Humanas', atributo: 'mente', descricao: 'Conhecimento em ciências humanas, como história, geografia, filosofia, sociologia, teologia e linguística.' },
    { nome: 'Aptidão em Tática', atributo: 'mente', descricao: 'Conhecimento em educação militar e estratégica.' },
    { nome: 'Atletismo', atributo: 'fisico', descricao: 'Correr, saltar, escalar, nadar, remar.' },
    { nome: 'Crime', atributo: 'fisico', descricao: 'Furtar objetos, abrir fechaduras, falsificar documentos.' },
    { nome: 'Disciplina', atributo: 'emocao', descricao: 'Estudar, meditar, resistir a traumas e sustos.' },
    { nome: 'Enganação', atributo: 'emocao', descricao: 'Mentir, disfarçar-se, seduzir.' },
    { nome: 'Furtividade', atributo: 'fisico', descricao: 'Esconder-se, andar sem ser visto ou ouvido.' },
    { nome: 'Intimidar', atributo: 'emocao', descricao: 'Assustar pessoas, coagir-las a fazerem o que você quer.' },
    { nome: 'Intuição', atributo: 'emocao', descricao: '"Sexto sentido" para analisar pessoas e ambientes.' },
    { nome: 'Luta', atributo: 'fisico', descricao: 'Atacar desarmado ou com armas corpo a corpo.' },
    { nome: 'Máquinas', atributo: 'mente', descricao: 'Operar e consertar máquinas, dirigir veículos motorizados.' },
    { nome: 'Medicina', atributo: 'mente', descricao: 'Primeiros socorros, tratamentos, necropsias.' },
    { nome: 'Ocultismo', atributo: 'mente', descricao: 'Conhecimento sobre o paranormal.' },
    { nome: 'Percepção', atributo: 'mente', descricao: 'Notar coisas através de visão, audição e olfato, revistar lugares.' },
    { nome: 'Persuasão', atributo: 'emocao', descricao: 'Convencer pessoas com argumentos e lábia.' },
    { nome: 'Pesquisar', atributo: 'mente', descricao: 'Pesquisar documentos e bancos de dados, analisar evidências.' },
    { nome: 'Pontaria', atributo: 'fisico', descricao: 'Atacar com armas de arremesso ou de disparo.' },
    { nome: 'Sobrevivência', atributo: 'mente', descricao: 'Montar acampamento, rastrear, acalmar animais ferozes.' },
    { nome: 'Tecnologia', atributo: 'mente', descricao: 'Operar dispositivos tecnológicos, hackear redes.' },
    { nome: 'Vigor', atributo: 'fisico', descricao: 'Manter o fôlego, resistir a venenos, suportar ferimentos.' }
];

// ===== VALORES DAS PERÍCIAS =====
let periciasValores = {};

// ===== HABILIDADES =====
let habilidades = [];

// ===== INVENTÁRIO =====
let inventario = [];

// ===== ANOTAÇÕES =====
let anotacoes = [];
let categorias = [];

// ===== MAPEAMENTO DE CORES =====
const cores = {
    verde: {
        nome: 'Vigilante',
        cor: '#4d7d2b',
        rgb: '77, 125, 43',
        classe: 'cor-verde',
        destaqueNome: 'destaque-verde',
        navClasse: 'cor-verde-btn',
        dadoCor: 'green'
    },
    azul: {
        nome: 'Analista',
        cor: '#387cdf',
        rgb: '56, 124, 223',
        classe: 'cor-azul',
        destaqueNome: 'destaque-azul',
        navClasse: 'cor-azul-btn',
        dadoCor: 'blue'
    },
    vermelho: {
        nome: 'Executor',
        cor: '#b12a14',
        rgb: '177, 42, 20',
        classe: 'cor-vermelho',
        destaqueNome: 'destaque-vermelho',
        navClasse: 'cor-vermelho-btn',
        dadoCor: 'red'
    }
};

// ===== HABILIDADES POR OCUPAÇÃO =====
const ocupacoesHabilidades = {
    artista: {
        nome: 'Artista',
        habilidade: 'Foco Emocional',
        descricao: 'Quando faz um teste emocional, você pode gastar 2 PD para receber + <span class="dado-icon d4-icon"><img src="dados/d4green.png" alt="d4"><span class="dado-numero">4</span></span> no teste.',
        detalhe: 'Você pode gastar 1 ponto de perícia para aumentar o custo da habilidade em +2 PD e a categoria do dado em um passo (máximo <span class="dado-icon d12-icon"><img src="dados/d12green.png" alt="d12"><span class="dado-numero">12</span></span>).'
    },
    artista_marcial: {
        nome: 'Artista Marcial',
        habilidade: 'Mão Pesada',
        descricao: 'Você recebe proficiência com armas brancas e seu dano com essas armas aumenta em +2.',
        detalhe: ''
    },
    assassino: {
        nome: 'Assassino',
        habilidade: 'Pronto pra Matar',
        descricao: 'Você recebe proficiência com armas brancas e, quando faz um teste de ataque com essas armas, pode gastar 3 PD para receber + <span class="dado-icon d8-icon"><img src="dados/d8green.png" alt="d8"><span class="dado-numero">8</span></span> no teste.',
        detalhe: 'Você pode gastar 1 ponto de perícia para aumentar o custo da habilidade em +1 PD, e a categoria do dado em um passo (máximo <span class="dado-icon d12-icon"><img src="dados/d12green.png" alt="d12"><span class="dado-numero">12</span></span>).'
    },
    atleta: {
        nome: 'Atleta',
        habilidade: 'Foco Físico',
        descricao: 'Quando faz um teste físico, você pode gastar 2 PD para receber + <span class="dado-icon d4-icon"><img src="dados/d4green.png" alt="d4"><span class="dado-numero">4</span></span> no teste.',
        detalhe: 'Você pode gastar 1 ponto de perícia para aumentar o custo da habilidade em +2 PD e a categoria do dado em um passo (máximo <span class="dado-icon d12-icon"><img src="dados/d12green.png" alt="d12"><span class="dado-numero">12</span></span>).'
    },
    cientista: {
        nome: 'Cientista',
        habilidade: 'Foco Mental',
        descricao: 'Quando faz um teste mental, você pode gastar 2 PD para receber + <span class="dado-icon d4-icon"><img src="dados/d4green.png" alt="d4"><span class="dado-numero">4</span></span> no teste.',
        detalhe: 'Você pode gastar 1 ponto de perícia para aumentar o custo da habilidade em +2 PD e a categoria do dado em um passo (máximo <span class="dado-icon d12-icon"><img src="dados/d12green.png" alt="d12"><span class="dado-numero">12</span></span>).'
    },
    desgarrado: {
        nome: 'Desgarrado',
        habilidade: 'Calejado',
        descricao: 'Você recebe +1 PV, e mais 1 PV adicional a cada Nível.',
        detalhe: ''
    },
    figura_religiosa: {
        nome: 'Figura Religiosa',
        habilidade: 'Poder da Fé',
        descricao: 'Escolha uma perícia emocional, o passo dela aumenta para <span class="dado-icon d6-icon"><img src="dados/d6green.png" alt="d6"><span class="dado-numero">6</span></span>.',
        detalhe: ''
    },
    medico: {
        nome: 'Médico',
        habilidade: 'Técnica Medicinal',
        descricao: 'Sempre que você usa um efeito que cura pontos de vida, seu efeito cura +1 PV (ou +1 PV por dado).',
        detalhe: ''
    },
    pistoleiro: {
        nome: 'Pistoleiro',
        habilidade: 'Para Bellum',
        descricao: 'Você recebe proficiência com armas de fogo e seu dano com essas armas aumenta em +2.',
        detalhe: ''
    },
    operario: {
        nome: 'Operário',
        habilidade: 'Esforço & Suor',
        descricao: 'Escolha uma perícia física, o passo dela aumenta para <span class="dado-icon d6-icon"><img src="dados/d6green.png" alt="d6"><span class="dado-numero">6</span></span>.',
        detalhe: ''
    },
    homem_da_lei: {
        nome: 'Homem da Lei',
        habilidade: 'Linha de Tiro',
        descricao: 'Você recebe proficiência com armas de fogo e, quando faz um teste de ataque com essas armas, pode gastar 3 PD para receber + <span class="dado-icon d8-icon"><img src="dados/d8green.png" alt="d8"><span class="dado-numero">8</span></span> no teste.',
        detalhe: 'Você pode gastar 1 ponto de perícia para aumentar o custo da habilidade em +1 PD, e a categoria do dado em um passo (máximo <span class="dado-icon d12-icon"><img src="dados/d12green.png" alt="d12"><span class="dado-numero">12</span></span>).'
    },
    professor: {
        nome: 'Professor',
        habilidade: 'Mentoria',
        descricao: 'Quando ajuda outro personagem, você pode fazer um teste de perícia que usou para ajudar contra DT 7. Se passar, o personagem ajudado pode substituir um dos dados rolados por ele pela sua rolagem alta.',
        detalhe: ''
    },
    profissional_escritorio: {
        nome: 'Profissional de Escritório',
        habilidade: 'Conhecimento Técnico',
        descricao: 'Escolha uma perícia mental, o passo dela aumenta para <span class="dado-icon d6-icon"><img src="dados/d6green.png" alt="d6"><span class="dado-numero">6</span></span>.',
        detalhe: ''
    },
    terapeuta: {
        nome: 'Terapeuta',
        habilidade: 'Técnica Terapêutica',
        descricao: 'Sempre que você usa um efeito que cura pontos de determinação, seu efeito cura +1 PD (ou +1 PD por dado).',
        detalhe: ''
    },
    universitario: {
        nome: 'Universitário',
        habilidade: 'Dedicação',
        descricao: 'Você recebe +1 PD, e mais 1 PD adicional a cada Nível.',
        detalhe: ''
    }
};

// ===== HABILIDADES POR PERFIL =====
const habilidadesPorPerfil = {
    verde: {
        nome: 'Prontidão',
        descricao: 'No início de qualquer conflito, você pode gastar 3 PD. Se fizer isso, ganha uma rodada na qual pode agir antes dos demais personagens e NPCs.',
        detalhe: 'Você pode gastar 1 ponto de perícia para reduzir o custo da habilidade em 1 PD para cada ponto gasto (mínimo 1).',
        perfilNome: 'Vigilante',
        cor: '#4d7d2b'
    },
    azul: {
        nome: 'Avaliação',
        descricao: 'Você pode gastar uma ação e 2 PD para observar um ser ou ambiente. Você recebe <span class="dado-icon d4-icon"><img src="dados/d4blue.png" alt="d4"><span class="dado-numero">4</span></span><span class="dado-icon d4-icon"><img src="dados/d4blue.png" alt="d4"><span class="dado-numero">4</span></span> que pode usar em testes relativos àquele ser ou ambiente (você pode usá-los como quiser, recebendo + <span class="dado-icon d4-icon"><img src="dados/d4blue.png" alt="d4"><span class="dado-numero">4</span></span><span class="dado-icon d4-icon"><img src="dados/d4blue.png" alt="d4"><span class="dado-numero">4</span></span> em um teste ou + <span class="dado-icon d4-icon"><img src="dados/d4blue.png" alt="d4"><span class="dado-numero">4</span></span> em dois testes). Você não pode acumular mais do que dois dados bônus por esta habilidade.',
        detalhe: 'Você pode gastar 1 ponto de perícia para aumentar o passo dos dados concedidos pela habilidade em uma categoria, cada ponto gasto aumenta o custo da habilidade em +2 PD.',
        perfilNome: 'Analista',
        cor: '#387cdf'
    },
    vermelho: {
        nome: 'Ímpeto',
        descricao: 'Você possui uma barra de ímpeto com três espaços. Sempre que falha em um teste, você preenche um espaço na barra. Você pode apagar espaços preenchidos para: <br><br> ● <span class="raio-icon"><img src="dados/d4red.png" alt="d4"><span class="dado-numero">4</span></span> : Receber + <span class="dado-icon d4-icon"><img src="dados/d4red.png" alt="d4"><span class="dado-numero">4</span></span> em um teste. <br> ● <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> : Aumentar um atributo em um passo até o fim da cena.',
        detalhe: 'Você pode gastar 1 ponto de perícia para receber 1 espaço a mais em sua barra de ímpeto e recebe uma das habilidades abaixo: <br><br> ● <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> : Receber + <span class="dado-icon d10-icon"><img src="dados/d10red.png" alt="d10"><span class="dado-numero">10</span></span> em um teste. <br> ● <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> <span class="raio-icon"><svg viewBox="0 0 24 24"><polygon points="12,2 4,14 11,14 9,22 17,10 10,10"/></svg></span> : Fazer uma ação extra na rodada.',
        perfilNome: 'Executor',
        cor: '#b12a14'
    }
};

// ===== FUNÇÕES DE NAVEGAÇÃO E AUTENTICAÇÃO =====
function voltarDashboard() {
    window.location.href = 'dashboard.html';
}

function sairDashboard() {
    window.location.href = 'dashboard.html';
}

// ===== FUNÇÃO PARA SALVAR NO FIRESTORE =====
function salvarNoFirestore() {
    if (salvando || !fichaId) return;
    
    if (timeoutSalvar) {
        clearTimeout(timeoutSalvar);
        timeoutSalvar = null;
    }
    
    timeoutSalvar = setTimeout(() => {
        salvarDadosFirestore();
    }, 500);
}

function salvarDadosFirestore() {
    if (!fichaId || !fichaData) return;
    
    salvando = true;
    
    const dados = {
        nome: nomeInput ? nomeInput.value : '',
        perfil: perfilSelect ? perfilSelect.value : 'verde',
        ocupacao: ocupacaoSelect ? ocupacaoSelect.value : '',
        nivel: parseInt(nivelInput ? nivelInput.value : 1) || 1,
        idade: document.getElementById('idadeInput') ? document.getElementById('idadeInput').value : '',
        genero: document.getElementById('generoInput') ? document.getElementById('generoInput').value : '',
        altura: document.getElementById('alturaInput') ? document.getElementById('alturaInput').value : '',
        peso: document.getElementById('pesoInput') ? document.getElementById('pesoInput').value : '',
        historia: document.getElementById('historiaInput') ? document.getElementById('historiaInput').value : '',
        foto: fotoPreview ? fotoPreview.src || '' : '',
        atributos: atributos,
        periciasValores: periciasValores,
        habilidades: habilidades,
        inventario: inventario,
        anotacoes: anotacoes,
        categorias: categorias,
        pvAtual: parseInt(document.getElementById('pv-atual') ? document.getElementById('pv-atual').value : 10) || 0,
        pvMax: parseInt(document.getElementById('pv-max') ? document.getElementById('pv-max').value : 10) || 1,
        pdAtual: parseInt(document.getElementById('pd-atual') ? document.getElementById('pd-atual').value : 10) || 0,
        pdMax: parseInt(document.getElementById('pd-max') ? document.getElementById('pd-max').value : 10) || 1,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('fichas').doc(fichaId).update(dados)
        .then(() => {
            salvando = false;
            if (fichaData) fichaData.atualizadoEm = new Date();
        })
        .catch(error => {
            console.error('❌ Erro ao salvar ficha:', error);
            salvando = false;
            setTimeout(() => {
                if (!salvando) {
                    salvarDadosFirestore();
                }
            }, 2000);
        });
}

// ===== CARREGAR FICHA DO FIRESTORE =====
function carregarFichaDoFirestore(id) {
    fichaId = id;
    
    if (unsubscribeFicha) {
        unsubscribeFicha();
        unsubscribeFicha = null;
    }
    
    unsubscribeFicha = db.collection('fichas').doc(id)
        .onSnapshot((doc) => {
            if (doc.exists) {
                fichaData = doc.data();
                
                // Validação de Permissão (Dono da Ficha ou Admin)
                const isOwner = usuarioAtual && fichaData.userId === usuarioAtual.uid;
                const isAdmin = usuarioAtual && usuarioAtual.email && usuarioAtual.email.toLowerCase() === ADMIN_EMAIL;
                
                if (!isOwner && !isAdmin && fichaData.userId) {
                    console.warn('⚠️ Acesso não autorizado a esta ficha.');
                    alert('Você não tem permissão para acessar esta ficha.');
                    window.location.href = 'dashboard.html';
                    return;
                }
                
                preencherFicha(fichaData);
                console.log('✅ Ficha carregada:', fichaData.nome);
            } else {
                console.error('❌ Ficha não encontrada');
                alert('Ficha não encontrada. Redirecionando para o dashboard.');
                window.location.href = 'dashboard.html';
            }
        }, (error) => {
            console.error('❌ Erro ao carregar ficha:', error);
        });
}

// ===== PREENCHER FICHA COM DADOS =====
function preencherFicha(dados) {
    try {
        if (nomeInput) nomeInput.value = dados.nome || '';
        
        if (perfilSelect) {
            perfilSelect.value = dados.perfil || 'verde';
            atualizarCores(dados.perfil || 'verde');
        }
        
        if (ocupacaoSelect) ocupacaoSelect.value = dados.ocupacao || '';
        if (nivelInput) nivelInput.value = dados.nivel || 1;
        
        if (dados.atributos) {
            atributos = dados.atributos;
        }
        
        if (dados.periciasValores) {
            periciasValores = dados.periciasValores;
        }
        
        if (dados.habilidades) {
            habilidades = dados.habilidades;
        }
        
        if (dados.inventario) {
            inventario = dados.inventario;
        }
        
        if (dados.anotacoes) {
            anotacoes = dados.anotacoes;
        }
        
        if (dados.categorias) {
            categorias = dados.categorias;
        }
        
        const pvAtual = document.getElementById('pv-atual');
        const pvMax = document.getElementById('pv-max');
        const pdAtual = document.getElementById('pd-atual');
        const pdMax = document.getElementById('pd-max');
        
        if (pvAtual) pvAtual.value = dados.pvAtual !== undefined ? dados.pvAtual : 10;
        if (pvMax) pvMax.value = dados.pvMax !== undefined ? dados.pvMax : 10;
        if (pdAtual) pdAtual.value = dados.pdAtual !== undefined ? dados.pdAtual : 10;
        if (pdMax) pdMax.value = dados.pdMax !== undefined ? dados.pdMax : 10;
        
        atualizarBarrinhasSemSalvar('pv');
        atualizarBarrinhasSemSalvar('pd');

        const idadeInput = document.getElementById('idadeInput');
        const generoInput = document.getElementById('generoInput');
        const alturaInput = document.getElementById('alturaInput');
        const pesoInput = document.getElementById('pesoInput');
        const historiaInput = document.getElementById('historiaInput');
        
        if (idadeInput) idadeInput.value = dados.idade || '';
        if (generoInput) generoInput.value = dados.genero || '';
        if (alturaInput) alturaInput.value = dados.altura || '';
        if (pesoInput) pesoInput.value = dados.peso || '';
        if (historiaInput) historiaInput.value = dados.historia || '';
        
        // TRATAMENTO DA FOTO
        if (fotoPreview && fotoContainer) {
            if (dados.foto && typeof dados.foto === 'string' && dados.foto.trim() !== '') {
                fotoPreview.src = dados.foto;
                fotoContainer.classList.add('has-image');
            } else {
                fotoPreview.removeAttribute('src');
                fotoContainer.classList.remove('has-image');
            }
        }
        
        // RENDERIZAR TODAS AS ABAS IMEDIATAMENTE
        renderizarAtributos();
        renderizarPericias();
        renderizarHabilidades();
        renderizarInventario();
        renderizarAnotacoes();
        
        if (isFirstLoad) {
            const primeiraAba = document.querySelector('.aba');
            if (primeiraAba) {
                const id = primeiraAba.id.replace('aba-', '');
                selecionarAba(id);
            }
            isFirstLoad = false;
        } else {
            selecionarAba(abaAtual);
        }
        
        console.log('✅ Ficha preenchida com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao preencher ficha:', error);
    }
}

// ===== SELECIONAR ABA =====
function selecionarAba(abaId) {
    abaAtual = abaId;

    // Remover classe ativa de todas as abas
    document.querySelectorAll('.aba').forEach(aba => {
        if (aba) aba.classList.remove('ativa');
    });
    
    // Remover classe ativa de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn) {
            btn.classList.remove('ativo');
            btn.classList.remove('cor-verde-btn', 'cor-azul-btn', 'cor-vermelho-btn');
        }
    });

    // Ativar aba
    const abaAlvo = document.getElementById(`aba-${abaId}`);
    if (abaAlvo) abaAlvo.classList.add('ativa');

    // Ativar botão
    const botaoAlvo = document.querySelector(`.nav-btn[data-aba="${abaId}"]`);
    if (botaoAlvo) {
        const perfilAtual = perfilSelect ? perfilSelect.value : 'verde';
        const config = cores[perfilAtual];
        if (config) botaoAlvo.classList.add('ativo', config.navClasse);
    }
    
    // Renderizar conteúdo da aba selecionada
    setTimeout(() => {
        switch(abaId) {
            case 'atributos':
                renderizarAtributos();
                break;
            case 'pericias':
                renderizarPericias();
                break;
            case 'habilidades':
                renderizarHabilidades();
                break;
            case 'inventario':
                renderizarInventario();
                break;
            case 'anotacoes':
                renderizarAnotacoes();
                break;
            case 'informacoes':
                break;
        }
    }, 50);
}

// ===== RENDERIZAR ATRIBUTOS =====
function renderizarAtributos() {
    const perfilKey = perfilSelect ? perfilSelect.value : 'verde';
    const dadoCor = cores[perfilKey] ? cores[perfilKey].dadoCor : 'green';
    
    ['fisico', 'mente', 'emocao'].forEach(key => {
        const img = document.getElementById(`dado-${key}`);
        const numeroCentral = document.getElementById(`numero-central-${key}`);
        
        if (!img || !numeroCentral) return;
        
        const valor = atributos[key] || 6;
        
        img.src = `dados/d${valor}${dadoCor}.png`;
        numeroCentral.textContent = valor;
        
        if (valor === 4) {
            numeroCentral.classList.add('d4-ajuste');
        } else {
            numeroCentral.classList.remove('d4-ajuste');
        }
        
        if (valor === 6) {
            img.classList.add('d6-ajuste');
        } else {
            img.classList.remove('d6-ajuste');
        }
    });
}

// ===== RENDERIZAR PERÍCIAS =====
function renderizarPericias() {
    const grid = document.getElementById('periciasGrid');
    if (!grid) {
        console.warn('periciasGrid não encontrado');
        return;
    }
    
    const perfilKey = perfilSelect ? perfilSelect.value : 'verde';
    const dadoCor = cores[perfilKey] ? cores[perfilKey].dadoCor : 'green';
    
    grid.innerHTML = '';
    
    periciasList.forEach((pericia) => {
        const valorPericia = periciasValores && periciasValores[pericia.nome] ? periciasValores[pericia.nome] : 4;
        const valorAtributo = atributos && atributos[pericia.atributo] ? atributos[pericia.atributo] : 6;
        const atributoCor = dadoCor;
        const isDestaque = valorPericia > 4;
        
        const div = document.createElement('div');
        div.className = `pericia-item${isDestaque ? ' destaque' : ''}`;
        
        if (isDestaque) {
            const config = cores[perfilKey];
            if (config) div.style.borderColor = config.cor;
        }
        
        div.innerHTML = `
            <span class="pericia-nome" onclick="abrirModal('${pericia.nome}')">${pericia.nome}</span>
            <div class="pericia-dados">
                <button class="pericia-btn menos ${editMode.pericias ? '' : 'hidden'}" onclick="mudarPericia('${pericia.nome}', -1)">−</button>
                <div class="pericia-dado-container">
                    <div class="pericia-dado-wrapper">
                        <img src="dados/d${valorPericia}${dadoCor}.png" alt="${pericia.nome}" class="${valorPericia === 6 ? 'd6-ajuste' : ''}">
                        <span class="numero-central ${valorPericia === 4 ? 'd4-ajuste' : ''}">${valorPericia}</span>
                    </div>
                </div>
                <button class="pericia-btn mais ${editMode.pericias ? '' : 'hidden'}" onclick="mudarPericia('${pericia.nome}', 1)">+</button>
                <div class="pericia-dado-container">
                    <div class="pericia-dado-wrapper" style="width: 32px; height: 32px; opacity: 0.6; cursor: default;">
                        <img src="dados/d${valorAtributo}${atributoCor}.png" alt="${pericia.atributo}" class="${valorAtributo === 6 ? 'd6-ajuste' : ''}">
                        <span class="numero-central ${valorAtributo === 4 ? 'd4-ajuste' : ''}" style="font-size: 13px;">${valorAtributo}</span>
                    </div>
                </div>
                <span class="pericia-atributo-label">${pericia.atributo}</span>
            </div>
        `;
        
        grid.appendChild(div);
    });
}

// ===== RENDERIZAR HABILIDADES =====
function renderizarHabilidades() {
    const container = document.getElementById('habilidadesContainer');
    if (!container) {
        console.warn('habilidadesContainer não encontrado');
        return;
    }
    
    const perfilKey = perfilSelect ? perfilSelect.value : 'verde';
    const config = cores[perfilKey] || cores.verde;
    
    const habPerfil = habilidadesPorPerfil[perfilKey] || habilidadesPorPerfil.verde;
    const habPerfilObj = {
        nome: habPerfil.nome,
        descricao: habPerfil.descricao + (habPerfil.detalhe ? `<span class="italico">${habPerfil.detalhe}</span>` : ''),
        isPerfil: true,
        perfilNome: habPerfil.perfilNome,
        cor: habPerfil.cor
    };
    
    const ocupacaoKey = ocupacaoSelect ? ocupacaoSelect.value : '';
    let habOcupacaoObj = null;
    if (ocupacaoKey && ocupacoesHabilidades[ocupacaoKey]) {
        const ocup = ocupacoesHabilidades[ocupacaoKey];
        habOcupacaoObj = {
            nome: ocup.habilidade,
            descricao: ocup.descricao + (ocup.detalhe ? `<span class="italico">${ocup.detalhe}</span>` : ''),
            isPerfil: false,
            isOcupacao: true,
            perfilNome: ocup.nome,
            cor: config.cor
        };
    }
    
    let todasHabilidades = [habPerfilObj];
    if (habOcupacaoObj) {
        todasHabilidades.push(habOcupacaoObj);
    }
    if (habilidades && habilidades.length > 0) {
        todasHabilidades = [...todasHabilidades, ...habilidades];
    }
    
    container.innerHTML = '';
    
    if (todasHabilidades.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.2);">Nenhuma habilidade disponível</div>';
        return;
    }
    
    todasHabilidades.forEach((hab, index) => {
        const div = document.createElement('div');
        const isPerfil = hab.isPerfil;
        const isOcupacao = hab.isOcupacao || false;
        let classeExtra = '';
        let cor = hab.cor || 'var(--cor-destaque)';
        
        if (isPerfil) {
            classeExtra = ' perfil-habilidade';
            cor = hab.cor;
        } else if (isOcupacao) {
            classeExtra = ' ocupacao-habilidade';
            cor = config.cor;
        }
        
        div.className = `habilidade-item${classeExtra}`;
        
        if (isPerfil && hab.cor) {
            div.style.borderColor = hab.cor;
        } else if (isOcupacao) {
            div.style.borderColor = config.cor;
        }
        
        const titulo = hab.nome;
        const badgeText = isPerfil ? hab.perfilNome : (isOcupacao ? hab.perfilNome : '');
        const badgeClasse = isPerfil ? 'badge-perfil' : (isOcupacao ? 'badge-ocupacao' : '');
        const isCustom = !isPerfil && !isOcupacao;
        const customIndex = isCustom ? (habOcupacaoObj ? index - 2 : index - 1) : -1;
        
        div.innerHTML = `
            <div class="habilidade-titulo" onclick="toggleHabilidade(this)" style="${isPerfil && hab.cor ? `color: ${hab.cor};` : (isOcupacao ? `color: ${config.cor};` : '')}">
                <span>${titulo}</span>
                <div style="display:flex;align-items:center;gap:12px;">
                    ${badgeText ? `<span class="${badgeClasse}" style="${isPerfil && hab.cor ? `color: ${hab.cor}; border-color: ${hab.cor};` : (isOcupacao ? `color: ${config.cor}; border-color: ${config.cor};` : '')}">${badgeText}</span>` : ''}
                    <span class="seta">▼</span>
                </div>
            </div>
            <div class="habilidade-corpo" style="${(isPerfil && hab.cor) ? `--cor-destaque: ${hab.cor};` : (isOcupacao ? `--cor-destaque: ${config.cor};` : '')}">
                ${hab.descricao}
                ${isCustom ? `
                    <div class="habilidade-acoes">
                        <button onclick="editarHabilidadeCustom(${customIndex})">✎ Editar</button>
                        <button class="excluir" onclick="excluirHabilidade(${customIndex})">✕ Excluir</button>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(div);
    });
}

// ===== RENDERIZAR INVENTÁRIO =====
function renderizarInventario() {
    const container = document.getElementById('inventarioContainer');
    if (!container) {
        console.warn('inventarioContainer não encontrado');
        return;
    }
    
    container.innerHTML = '';
    
    if (inventario.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.08);">
                <svg viewBox="0 0 24 24" width="36" height="36" style="margin-bottom: 12px; opacity: 0.2; fill: currentColor;"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                <p style="font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 300; letter-spacing: 1px;">Nenhum item no inventário</p>
                <p style="font-family: 'Rajdhani', sans-serif; font-size: 13px; margin-top: 4px; opacity: 0.3;">Clique em "Adicionar Item" para criar um</p>
            </div>
        `;
        return;
    }
    
    inventario.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-card';
        
        const infoResumo = `
            ${item.dano ? `<span class="icon-tag">⚔︎ ${item.dano}</span>` : ''}
            ${item.critico ? `<span class="icon-tag">𖦏 ${item.critico}</span>` : ''}
        `;
        
        div.innerHTML = `
            <div class="item-titulo" onclick="toggleItem(this)">
                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                    <span>${item.nome}</span>
                    <div class="item-info-resumo">
                        ${infoResumo}
                    </div>
                </div>
                <span class="seta">▼</span>
            </div>
            <div class="item-corpo">
                <div class="item-detalhes">
                    ${item.tipo ? `<div class="detalhe"><strong>Tipo:</strong> ${item.tipo}</div>` : ''}
                    ${item.tipoDano ? `<div class="detalhe"><strong>Tipo de Dano:</strong> ${item.tipoDano}</div>` : ''}
                    ${item.proficiencia ? `<div class="detalhe"><strong>Proficiência:</strong> ${item.proficiencia}</div>` : ''}
                    ${item.alcance ? `<div class="detalhe"><strong>Alcance:</strong> ${item.alcance}</div>` : ''}
                </div>
                ${item.descricao ? `<div class="item-descricao">${item.descricao}</div>` : ''}
                <div class="item-acoes">
                    <button onclick="editarItem(${index})">✎ Editar</button>
                    <button class="excluir" onclick="excluirItem(${index})">✕ Excluir</button>
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

// ===== RENDERIZAR ANOTAÇÕES =====
function renderizarAnotacoes() {
    const container = document.getElementById('anotacoesContainer');
    if (!container) {
        console.warn('anotacoesContainer não encontrado');
        return;
    }
    
    atualizarFiltroCategorias();
    container.innerHTML = '';
    
    if (anotacoes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.08);">
                <svg viewBox="0 0 24 24" width="36" height="36" style="margin-bottom: 12px; opacity: 0.2; fill: currentColor;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                <p style="font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 300; letter-spacing: 1px;">Nenhuma nota criada</p>
                <p style="font-family: 'Rajdhani', sans-serif; font-size: 13px; margin-top: 4px; opacity: 0.3;">Clique em "Nova Nota" para começar</p>
            </div>
        `;
        return;
    }
    
    anotacoes.forEach((nota, index) => {
        const div = document.createElement('div');
        div.className = 'nota-card';
        div.dataset.categoria = nota.categoria || '';
        
        div.innerHTML = `
            <div class="nota-titulo" onclick="toggleNota(this)" style="--nota-cor: ${nota.cor || '#4d7d2b'};">
                <div class="nota-info">
                    <span>${nota.titulo}</span>
                    ${nota.categoria ? `<span class="nota-categoria">${nota.categoria}</span>` : ''}
                </div>
                <span class="seta">▼</span>
            </div>
            <div class="nota-corpo">
                <div class="nota-conteudo">${nota.conteudo || '<span style="color: rgba(255,255,255,0.2); font-style: italic;">Nota vazia</span>'}</div>
                <div class="nota-acoes">
                    <button onclick="editarNota(${index})">✎ Editar</button>
                    <button class="excluir" onclick="excluirNota(${index})">✕ Excluir</button>
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

// ===== MUDAR VALOR DA PERÍCIA =====
function mudarPericia(nome, direcao) {
    const valorAtual = periciasValores[nome] || 4;
    const indexAtual = valoresPermitidos.indexOf(valorAtual);
    let novoIndex = indexAtual + direcao;
    
    if (novoIndex < 0) novoIndex = 0;
    if (novoIndex >= valoresPermitidos.length) novoIndex = valoresPermitidos.length - 1;
    
    periciasValores[nome] = valoresPermitidos[novoIndex];
    renderizarPericias();
    salvarNoFirestore();
}

// ===== MUDAR VALOR DO ATRIBUTO =====
function mudarValor(atributo, direcao) {
    const indexAtual = valoresPermitidos.indexOf(atributos[atributo]);
    let novoIndex = indexAtual + direcao;
    
    if (novoIndex < 0) novoIndex = 0;
    if (novoIndex >= valoresPermitidos.length) novoIndex = valoresPermitidos.length - 1;
    
    atributos[atributo] = valoresPermitidos[novoIndex];
    renderizarAtributos();
    salvarNoFirestore();
}

// ===== ATUALIZAR BARRINHAS =====
function atualizarBarrinhasSemSalvar(tipo) {
    const atualInput = document.getElementById(`${tipo}-atual`);
    const maxInput = document.getElementById(`${tipo}-max`);
    const container = document.getElementById(`barrinhas-${tipo}`);
    
    if (!atualInput || !maxInput || !container) return;
    
    const atual = parseInt(atualInput.value) || 0;
    const max = parseInt(maxInput.value) || 1;
    
    container.innerHTML = '';
    
    for (let i = 0; i < max; i++) {
        const barrinha = document.createElement('div');
        barrinha.className = 'barrinha';
        if (i < atual) {
            barrinha.classList.add('preencher');
            barrinha.classList.add(`preencher-${tipo}`);
        }
        container.appendChild(barrinha);
    }
}

function atualizarBarrinhas(tipo) {
    atualizarBarrinhasSemSalvar(tipo);
    salvarNoFirestore();
}

// ===== FUNÇÕES DE EDIÇÃO =====
function toggleEdit(tipo) {
    editMode[tipo] = !editMode[tipo];
    const btn = document.getElementById(`edit${tipo.charAt(0).toUpperCase() + tipo.slice(1)}Btn`);
    
    if (!btn) return;
    
    if (editMode[tipo]) {
        btn.textContent = '✓ Salvar';
        btn.classList.add('salvar');
        const perfilKey = perfilSelect ? perfilSelect.value : 'verde';
        const config = cores[perfilKey];
        if (config) {
            btn.style.borderColor = config.cor;
            btn.style.color = config.cor;
        }
        if (tipo === 'atributos') {
            document.querySelectorAll('.atributo-btn').forEach(el => {
                if (el) el.classList.remove('hidden');
            });
            document.querySelectorAll('.max-input').forEach(el => {
                if (el) {
                    el.classList.add('editable');
                    el.removeAttribute('readonly');
                    if (config) el.style.borderColor = config.cor;
                }
            });
        } else {
            document.querySelectorAll('.pericia-btn').forEach(el => {
                if (el) el.classList.remove('hidden');
            });
        }
    } else {
        btn.textContent = '✎ Editar';
        btn.classList.remove('salvar');
        btn.style.borderColor = '';
        btn.style.color = '';
        if (tipo === 'atributos') {
            document.querySelectorAll('.atributo-btn').forEach(el => {
                if (el) el.classList.add('hidden');
            });
            document.querySelectorAll('.max-input').forEach(el => {
                if (el) {
                    el.classList.remove('editable');
                    el.setAttribute('readonly', 'readonly');
                    el.style.borderColor = '';
                }
            });
        } else {
            document.querySelectorAll('.pericia-btn').forEach(el => {
                if (el) el.classList.add('hidden');
            });
        }
        salvarNoFirestore();
    }
}

// ===== FUNÇÕES PV E PD =====
function mudarPV(direcao) {
    const atualInput = document.getElementById('pv-atual');
    const maxInput = document.getElementById('pv-max');
    if (!atualInput || !maxInput) return;
    
    const atual = parseInt(atualInput.value) || 0;
    const max = parseInt(maxInput.value) || 1;
    let novo = atual + direcao;
    if (novo < 0) novo = 0;
    if (novo > max) novo = max;
    atualInput.value = novo;
    atualizarBarrinhas('pv');
}

function mudarPD(direcao) {
    const atualInput = document.getElementById('pd-atual');
    const maxInput = document.getElementById('pd-max');
    if (!atualInput || !maxInput) return;
    
    const atual = parseInt(atualInput.value) || 0;
    const max = parseInt(maxInput.value) || 1;
    let novo = atual + direcao;
    if (novo < 0) novo = 0;
    if (novo > max) novo = max;
    atualInput.value = novo;
    atualizarBarrinhas('pd');
}

// ===== MODAL DESCRIÇÃO PERÍCIA =====
function abrirModal(nome) {
    const pericia = periciasList.find(p => p.nome === nome);
    if (!pericia) return;
    
    const titulo = document.getElementById('modalTitulo');
    const descricao = document.getElementById('modalDescricaoTexto');
    const modal = document.getElementById('modalDescricao');
    
    if (titulo) titulo.textContent = pericia.nome;
    if (descricao) descricao.textContent = pericia.descricao;
    if (modal) modal.style.display = 'flex';
    
    const perfilKey = perfilSelect ? perfilSelect.value : 'verde';
    const config = cores[perfilKey];
    if (titulo && config) titulo.style.color = config.cor;
}

function fecharModal() {
    const modal = document.getElementById('modalDescricao');
    if (modal) modal.style.display = 'none';
}

// ===== MODAL HABILIDADE =====
let editandoHabilidadeIndex = -1;

function abrirModalHabilidade(index = -1) {
    editandoHabilidadeIndex = index;
    const modal = document.getElementById('modalHabilidade');
    const titulo = document.getElementById('modalHabilidadeTitulo');
    const nomeInput = document.getElementById('habilidadeNomeInput');
    const descInput = document.getElementById('habilidadeDescInput');
    
    if (!modal) return;
    
    if (index >= 0 && index < habilidades.length) {
        if (titulo) titulo.textContent = 'Editar Habilidade';
        if (nomeInput) nomeInput.value = habilidades[index].nome;
        if (descInput) descInput.value = habilidades[index].descricao;
    } else {
        if (titulo) titulo.textContent = 'Nova Habilidade';
        if (nomeInput) nomeInput.value = '';
        if (descInput) descInput.value = '';
    }
    
    modal.classList.add('ativo');
}

function fecharModalHabilidade() {
    const modal = document.getElementById('modalHabilidade');
    if (modal) modal.classList.remove('ativo');
    editandoHabilidadeIndex = -1;
}

function salvarHabilidade() {
    const nomeInput = document.getElementById('habilidadeNomeInput');
    const descInput = document.getElementById('habilidadeDescInput');
    
    if (!nomeInput || !descInput) return;
    
    const nome = nomeInput.value.trim();
    const descricao = descInput.value.trim();
    
    if (!nome || !descricao) {
        mostrarToast('Preencha nome e descrição', '#ff4444');
        return;
    }
    
    const descFormatada = processarFormatacao(descricao);
    
    if (editandoHabilidadeIndex >= 0) {
        habilidades[editandoHabilidadeIndex] = { nome, descricao: descFormatada };
    } else {
        habilidades.push({ nome, descricao: descFormatada });
    }
    
    fecharModalHabilidade();
    renderizarHabilidades();
    salvarNoFirestore();
    mostrarToast('Habilidade salva!', '#4d7d2b');
}

function processarFormatacao(texto) {
    let processado = texto.replace(/\*\*(.*?)\*\*/g, '<span class="negrito">$1</span>');
    processado = processado.replace(/\*(.*?)\*/g, '<span class="italico">$1</span>');
    return processado;
}

function excluirHabilidade(index) {
    if (confirm('Tem certeza que deseja excluir esta habilidade?')) {
        habilidades.splice(index, 1);
        renderizarHabilidades();
        salvarNoFirestore();
        mostrarToast('Habilidade removida', '#ff4444');
    }
}

function toggleHabilidade(elemento) {
    const corpo = elemento ? elemento.nextElementSibling : null;
    const seta = elemento ? elemento.querySelector('.seta') : null;
    
    if (!corpo || !seta) return;
    
    if (corpo.classList.contains('aberta')) {
        corpo.classList.remove('aberta');
        seta.classList.remove('aberta');
    } else {
        corpo.classList.add('aberta');
        seta.classList.add('aberta');
    }
}

function editarHabilidadeCustom(index) {
    if (index >= 0 && index < habilidades.length) {
        abrirModalHabilidade(index);
    }
}

// ===== FUNÇÃO PARA ATUALIZAR CORES =====
function atualizarCores(perfilKey) {
    const config = cores[perfilKey];
    if (!config) return;

    if (header) header.className = `header ${config.classe}`;
    if (nomeInput) nomeInput.className = `destaque-${perfilKey}`;
    if (perfilWrapper) perfilWrapper.className = `perfil-select-wrapper ${config.classe}`;
    if (nivelInput) nivelInput.className = `nivel-input ${config.classe}`;

    document.querySelectorAll('.edit-btn.salvar').forEach(btn => {
        if (btn) {
            btn.style.borderColor = config.cor;
            btn.style.color = config.cor;
        }
    });

    document.querySelectorAll('.habilidades-btn.ativo').forEach(btn => {
        if (btn) {
            btn.style.borderColor = config.cor;
            btn.style.color = config.cor;
        }
    });

    const ativo = document.querySelector('.nav-btn.ativo');
    if (ativo) {
        ativo.className = `nav-btn ativo ${config.navClasse}`;
    }

    const btnSair = document.getElementById('btnSair') || document.querySelector('.btn-sair');
    if (btnSair) {
        btnSair.style.borderColor = config.cor;
        btnSair.style.color = config.cor;
        btnSair.style.backgroundColor = `rgba(${config.rgb}, 0.15)`;
    }

    renderizarAtributos();
    renderizarPericias();
    renderizarHabilidades();
}

// ===== FOTO (COMPRESSÃO BASE64 REDIMENSIONADA) =====
function uploadFoto(event) {
    const file = event.target.files[0];
    if (!file || !fotoPreview || !fotoContainer) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Configuração do tamanho máximo (400px x 400px)
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            // Redimensionar via Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Converter para Base64 leve (JPEG com 70% de qualidade)
            const base64Leve = canvas.toDataURL('image/jpeg', 0.7);

            fotoPreview.src = base64Leve;
            fotoContainer.classList.add('has-image');
            salvarNoFirestore();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removerFoto(event) {
    if (event) event.stopPropagation();
    if (fotoPreview) {
        fotoPreview.removeAttribute('src');
    }
    if (fotoContainer) {
        fotoContainer.classList.remove('has-image');
    }
    const input = document.getElementById('fotoInput');
    if (input) input.value = '';
    salvarNoFirestore();
}

// ===== INVENTÁRIO =====
let editandoItemIndex = -1;

function abrirModalItem(index = -1) {
    editandoItemIndex = index;
    const modal = document.getElementById('modalItem');
    const titulo = document.getElementById('modalItemTitulo');
    
    if (!modal) return;
    
    if (index >= 0 && index < inventario.length) {
        if (titulo) titulo.textContent = 'Editar Item';
        const item = inventario[index];
        const nomeInput = document.getElementById('itemNomeInput');
        const danoInput = document.getElementById('itemDanoInput');
        const criticoInput = document.getElementById('itemCriticoInput');
        const tipoInput = document.getElementById('itemTipoInput');
        const tipoDanoInput = document.getElementById('itemTipoDanoInput');
        const profInput = document.getElementById('itemProficienciaInput');
        const alcanceInput = document.getElementById('itemAlcanceInput');
        const descInput = document.getElementById('itemDescInput');
        
        if (nomeInput) nomeInput.value = item.nome || '';
        if (danoInput) danoInput.value = item.dano || '';
        if (criticoInput) criticoInput.value = item.critico || 'x3';
        if (tipoInput) tipoInput.value = item.tipo || 'Corpo a Corpo';
        if (tipoDanoInput) tipoDanoInput.value = item.tipoDano || 'impacto';
        if (profInput) profInput.value = item.proficiencia || 'simples';
        if (alcanceInput) alcanceInput.value = item.alcance || '-';
        if (descInput) descInput.value = item.descricao || '';
    } else {
        if (titulo) titulo.textContent = 'Novo Item';
        const nomeInput = document.getElementById('itemNomeInput');
        const danoInput = document.getElementById('itemDanoInput');
        const criticoInput = document.getElementById('itemCriticoInput');
        const tipoInput = document.getElementById('itemTipoInput');
        const tipoDanoInput = document.getElementById('itemTipoDanoInput');
        const profInput = document.getElementById('itemProficienciaInput');
        const alcanceInput = document.getElementById('itemAlcanceInput');
        const descInput = document.getElementById('itemDescInput');
        
        if (nomeInput) nomeInput.value = '';
        if (danoInput) danoInput.value = '';
        if (criticoInput) criticoInput.value = 'x3';
        if (tipoInput) tipoInput.value = 'Corpo a Corpo';
        if (tipoDanoInput) tipoDanoInput.value = 'impacto';
        if (profInput) profInput.value = 'simples';
        if (alcanceInput) alcanceInput.value = '-';
        if (descInput) descInput.value = '';
    }
    
    modal.classList.add('ativo');
}

function fecharModalItem() {
    const modal = document.getElementById('modalItem');
    if (modal) modal.classList.remove('ativo');
    editandoItemIndex = -1;
}

function salvarItem() {
    const nomeInput = document.getElementById('itemNomeInput');
    const danoInput = document.getElementById('itemDanoInput');
    const criticoInput = document.getElementById('itemCriticoInput');
    const tipoInput = document.getElementById('itemTipoInput');
    const tipoDanoInput = document.getElementById('itemTipoDanoInput');
    const profInput = document.getElementById('itemProficienciaInput');
    const alcanceInput = document.getElementById('itemAlcanceInput');
    const descInput = document.getElementById('itemDescInput');
    
    if (!nomeInput) return;
    
    const nome = nomeInput.value.trim();
    if (!nome) {
        mostrarToast('Preencha o nome do item', '#ff4444');
        return;
    }
    
    const item = {
        nome: nome,
        dano: danoInput ? danoInput.value.trim() : '',
        critico: criticoInput ? criticoInput.value : 'x3',
        tipo: tipoInput ? tipoInput.value : 'Corpo a Corpo',
        tipoDano: tipoDanoInput ? tipoDanoInput.value : 'impacto',
        proficiencia: profInput ? profInput.value : 'simples',
        alcance: alcanceInput ? alcanceInput.value : '-',
        descricao: descInput ? descInput.value.trim() : ''
    };
    
    if (editandoItemIndex >= 0) {
        inventario[editandoItemIndex] = item;
    } else {
        inventario.push(item);
    }
    
    fecharModalItem();
    renderizarInventario();
    salvarNoFirestore();
    mostrarToast('Item salvo!', '#4d7d2b');
}

function excluirItem(index) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        inventario.splice(index, 1);
        renderizarInventario();
        salvarNoFirestore();
        mostrarToast('Item removido', '#ff4444');
    }
}

function editarItem(index) {
    abrirModalItem(index);
}

function toggleItem(elemento) {
    const corpo = elemento ? elemento.nextElementSibling : null;
    const seta = elemento ? elemento.querySelector('.seta') : null;
    
    if (!corpo || !seta) return;
    
    if (corpo.classList.contains('aberta')) {
        corpo.classList.remove('aberta');
        seta.classList.remove('aberta');
    } else {
        corpo.classList.add('aberta');
        seta.classList.add('aberta');
    }
}

// ===== ANOTAÇÕES =====
let editandoNotaIndex = -1;

function selecionarCor(elemento, cor) {
    document.querySelectorAll('.nota-cores-grid .cor-btn').forEach(btn => {
        if (btn) btn.classList.remove('selecionada');
    });
    if (elemento) elemento.classList.add('selecionada');
    const input = document.getElementById('notaCorInput');
    if (input) input.value = cor;
}

function criarNovaCategoria() {
    const container = document.getElementById('novaCategoriaContainer');
    if (!container) return;
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        const input = document.getElementById('notaCategoriaNova');
        if (input) {
            input.value = '';
            input.focus();
        }
    } else {
        container.style.display = 'none';
    }
}

function confirmarNovaCategoria() {
    const input = document.getElementById('notaCategoriaNova');
    if (!input) return;
    
    const nome = input.value.trim();
    if (!nome) {
        mostrarToast('Digite um nome para a categoria', '#ff4444');
        return;
    }
    
    if (!categorias.includes(nome)) {
        categorias.push(nome);
    }
    
    atualizarSelectCategorias();
    const select = document.getElementById('notaCategoriaSelect');
    if (select) select.value = nome;
    const container = document.getElementById('novaCategoriaContainer');
    if (container) container.style.display = 'none';
    input.value = '';
    salvarNoFirestore();
    mostrarToast('Categoria criada!', '#4d7d2b');
}

function cancelarNovaCategoria() {
    const container = document.getElementById('novaCategoriaContainer');
    if (container) container.style.display = 'none';
    const input = document.getElementById('notaCategoriaNova');
    if (input) input.value = '';
}

function abrirModalNota(index = -1) {
    editandoNotaIndex = index;
    const modal = document.getElementById('modalNota');
    const titulo = document.getElementById('modalNotaTitulo');
    const tituloInput = document.getElementById('notaTituloInput');
    const editor = document.getElementById('notaConteudoEditor');
    const select = document.getElementById('notaCategoriaSelect');
    
    if (!modal) return;
    
    document.querySelectorAll('.nota-cores-grid .cor-btn').forEach(btn => {
        if (btn) btn.classList.remove('selecionada');
    });
    const primeiraCor = document.querySelector('.nota-cores-grid .cor-btn');
    if (primeiraCor) primeiraCor.classList.add('selecionada');
    
    const corInput = document.getElementById('notaCorInput');
    if (corInput) corInput.value = '#4d7d2b';
    
    const container = document.getElementById('novaCategoriaContainer');
    if (container) container.style.display = 'none';
    
    atualizarSelectCategorias();
    
    if (index >= 0 && index < anotacoes.length) {
        if (titulo) titulo.textContent = 'Editar Nota';
        const nota = anotacoes[index];
        if (tituloInput) tituloInput.value = nota.titulo || '';
        if (select) {
            if (nota.categoria && categorias.includes(nota.categoria)) {
                select.value = nota.categoria;
            } else {
                select.value = '';
            }
        }
        if (editor) editor.innerHTML = nota.conteudo || '';
    } else {
        if (titulo) titulo.textContent = 'Nova Nota';
        if (tituloInput) tituloInput.value = '';
        if (editor) editor.innerHTML = '';
        if (select) select.value = '';
    }
    
    modal.classList.add('ativo');
}

function fecharModalNota() {
    const modal = document.getElementById('modalNota');
    if (modal) modal.classList.remove('ativo');
    editandoNotaIndex = -1;
    const container = document.getElementById('novaCategoriaContainer');
    if (container) container.style.display = 'none';
}

function atualizarSelectCategorias() {
    const select = document.getElementById('notaCategoriaSelect');
    if (!select) return;
    
    const valorAtual = select.value;
    
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
    
    if (valorAtual && categorias.includes(valorAtual)) {
        select.value = valorAtual;
    }
}

function salvarNota() {
    const tituloInput = document.getElementById('notaTituloInput');
    const corInput = document.getElementById('notaCorInput');
    const select = document.getElementById('notaCategoriaSelect');
    const editor = document.getElementById('notaConteudoEditor');
    
    if (!tituloInput || !editor) return;
    
    const titulo = tituloInput.value.trim();
    if (!titulo) {
        mostrarToast('Digite um título para a nota', '#ff4444');
        return;
    }
    
    const nota = {
        titulo: titulo,
        cor: corInput ? corInput.value : '#4d7d2b',
        categoria: select ? select.value || '' : '',
        conteudo: editor.innerHTML
    };
    
    if (editandoNotaIndex >= 0) {
        anotacoes[editandoNotaIndex] = nota;
    } else {
        anotacoes.push(nota);
    }
    
    fecharModalNota();
    renderizarAnotacoes();
    salvarNoFirestore();
    mostrarToast('Nota salva!', '#4d7d2b');
}

function excluirNota(index) {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
        anotacoes.splice(index, 1);
        renderizarAnotacoes();
        salvarNoFirestore();
        mostrarToast('Nota removida', '#ff4444');
    }
}

function editarNota(index) {
    abrirModalNota(index);
}

function toggleNota(elemento) {
    const corpo = elemento ? elemento.nextElementSibling : null;
    const seta = elemento ? elemento.querySelector('.seta') : null;
    
    if (!corpo || !seta) return;
    
    if (corpo.classList.contains('aberta')) {
        corpo.classList.remove('aberta');
        seta.classList.remove('aberta');
    } else {
        corpo.classList.add('aberta');
        seta.classList.add('aberta');
    }
}

function formatarNota(comando) {
    const editor = document.getElementById('notaConteudoEditor');
    if (!editor) return;
    
    if (comando === 'removeFormat') {
        document.execCommand('removeFormat', false, null);
    } else {
        document.execCommand(comando, false, null);
    }
    window.getSelection().removeAllRanges();
    editor.focus();
}

function filtrarAnotacoes() {
    const pesquisaInput = document.getElementById('pesquisaAnotacao');
    const categoriaSelect = document.getElementById('filtroCategoria');
    
    if (!pesquisaInput || !categoriaSelect) return;
    
    const pesquisa = pesquisaInput.value.toLowerCase();
    const categoria = categoriaSelect.value;
    const cards = document.querySelectorAll('.nota-card');
    
    cards.forEach(card => {
        if (!card) return;
        const titulo = card.querySelector('.nota-titulo .nota-info span:first-child')?.textContent?.toLowerCase() || '';
        const cat = card.dataset.categoria || '';
        const matchNome = titulo.includes(pesquisa);
        const matchCategoria = !categoria || cat === categoria;
        card.style.display = (matchNome && matchCategoria) ? 'block' : 'none';
    });
}

function atualizarFiltroCategorias() {
    const select = document.getElementById('filtroCategoria');
    if (!select) return;
    
    const valorAtual = select.value;
    
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
    
    if (valorAtual && categorias.includes(valorAtual)) {
        select.value = valorAtual;
    }
}

// ===== MOSTRAR TOAST =====
function mostrarToast(mensagem, cor = '#4d7d2b') {
    const toastAntigo = document.querySelector('.toast');
    if (toastAntigo) toastAntigo.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        background: rgba(0,0,0,0.9);
        color: ${cor};
        border: 1px solid ${cor}22;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Rajdhani', sans-serif;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
        backdrop-filter: blur(20px);
        animation: fadeOut 2s forwards;
        z-index: 1000;
        position: fixed;
        bottom: 20px;
        right: 20px;
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ===== CONFIGURAR NAVEGAÇÃO =====
function configurarNavegacao() {
    const botoes = document.querySelectorAll('.nav-btn');
    
    botoes.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const abaId = this.dataset.aba;
            if (abaId) {
                selecionarAba(abaId);
            }
        });
    });
}

// ===== EVENTOS PARA SALVAMENTO AUTOMÁTICO =====
function configurarEventos() {
    if (nomeInput) nomeInput.addEventListener('input', salvarNoFirestore);
    
    if (perfilSelect) {
        perfilSelect.addEventListener('change', function() {
            atualizarCores(this.value);
            salvarNoFirestore();
        });
    }
    
    if (ocupacaoSelect) {
        ocupacaoSelect.addEventListener('change', function() {
            renderizarHabilidades();
            salvarNoFirestore();
        });
    }
    
    if (nivelInput) nivelInput.addEventListener('input', salvarNoFirestore);

    ['idadeInput', 'generoInput', 'alturaInput', 'pesoInput', 'historiaInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', salvarNoFirestore);
    });

    ['pv-atual', 'pv-max', 'pd-atual', 'pd-max'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                const tipo = id.split('-')[0];
                atualizarBarrinhas(tipo);
            });
        }
    });
}

// ===== VERIFICAR AUTENTICAÇÃO =====
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    usuarioAtual = user;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        carregarFichaDoFirestore(id);
    } else {
        alert('ID da ficha não encontrado. Redirecionando para o dashboard.');
        window.location.href = 'dashboard.html';
    }
});

// ===== ATALHO CTRL+S =====
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        salvarDadosFirestore();
        mostrarToast('💾 Salvo!', '#4d7d2b');
    }
});

// ===== SALVAR AO FECHAR A PÁGINA =====
window.addEventListener('beforeunload', function() {
    if (fichaId && !salvando) {
        salvarDadosFirestore();
    }
    if (unsubscribeFicha) {
        unsubscribeFicha();
    }
});

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    configurarNavegacao();
    configurarEventos();
    
    if (fotoPreview) {
        fotoPreview.onerror = function() {
            this.removeAttribute('src');
            if (fotoContainer) fotoContainer.classList.remove('has-image');
        };
    }
    
    if (fichaData) {
        renderizarAtributos();
        renderizarPericias();
        renderizarHabilidades();
        renderizarInventario();
        renderizarAnotacoes();
    }
    
    console.log('📋 Ficha carregada!');
    console.log('💾 Salvamento automático ativado!');
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    configurarNavegacao();
    configurarEventos();
}