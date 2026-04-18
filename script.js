// Variáveis Globais
let bancoJogadores = JSON.parse(localStorage.getItem('banco_jogadores')) || [];
let jogadorAtivoIndex = null;
let historicoAcoes = [];

// --- NAVEGAÇÃO ---
function mudarTela(idDaTela) {
    const telas = document.querySelectorAll('.tela');
    telas.forEach(t => t.classList.remove('ativa'));
    document.getElementById(idDaTela).classList.add('ativa');
    
    // Se voltar para a tela de partida, atualiza os botões (caso tenha add jogador novo)
    if(idDaTela === 'tela-partida') renderizarJogadoresPartida();
}

// --- GERENCIAMENTO DE JOGADORES ---
function adicionarJogador() {
    const nomeInput = document.getElementById('inputNome');
    const nome = nomeInput.value.trim();

    if (nome === "") {
        alert("Por favor, digite o nome do jogador.");
        return;
    }

    const novoJogador = {
        id: Date.now(),
        nome: nome,
        stats: {
                ataque_ponto: 0,
                ataque_erro: 0,
                ataque_bloqueado: 0,
                ataque_trabalhado: 0,
                saque_ace: 0,
                saque_erro: 0,
                saque_normal: 0,
                bloqueio_ponto: 0,
                bloqueio_amortecido: 0,
                bloqueio_erro: 0,
                recepcao_excelente: 0,
                recepcao_positiva: 0,
                recepcao_erro: 0,
                levantamento_preciso: 0,
                levantamento_erro: 0,
                levantamento_atacavel: 0
        }
    };

    bancoJogadores.push(novoJogador);
    salvarDados();
    nomeInput.value = "";
    atualizarListaBase();
    alert(`${nome} adicionado com sucesso!`);
}

function atualizarListaBase() {
    const lista = document.getElementById('lista-base-jogadores');
    if(!lista) return;
    lista.innerHTML = bancoJogadores.map(j => `
        <div class="item-jogador">
            <span>👤 ${j.nome}</span>
            <button class="btn-delete" onclick="removerJogador(${j.id})">❌</button>
        </div>
    `).join('');
}

// --- LÓGICA DA PARTIDA ---
function renderizarJogadoresPartida() {
    const quadra = document.getElementById('quadra-jogadores');
    quadra.innerHTML = '';

    // AGORA USAMOS A LISTA FILTRADA
    jogadoresNaPartida.forEach((jogador) => {
        // Precisamos achar o index REAL dele no banco principal para salvar os pontos certo
        const indexNoBanco = bancoJogadores.findIndex(j => j.id === jogador.id);
        
        const btn = document.createElement('button');
        btn.className = 'btn-jogador-quadra';
        btn.innerHTML = `${jogador.nome}<br><small>Pts: ${calcularTotalPontos(jogador)}</small>`;
        btn.onclick = () => abrirAcoes(indexNoBanco); // Passa o index correto
        quadra.appendChild(btn);
    });
}

function abrirAcoes(index) {
    jogadorAtivoIndex = index;
    const jogador = bancoJogadores[index];
    document.getElementById('titulo-acoes').innerText = `Ação de ${jogador.nome}`;
    mudarTela('tela-acoes');
}

function registrarAcao(tipo) {
    if (jogadorAtivoIndex !== null) {
        let jogador = bancoJogadores[jogadorAtivoIndex];

        // CORREÇÃO DO NaN: Se a estatística não existir ou for nula, vira 0
        if (!jogador.stats[tipo]) {
            jogador.stats[tipo] = 0;
        }

        jogador.stats[tipo]++;
        
        historicoAcoes.push({
            jogadorIndex: jogadorAtivoIndex,
            tipoAcao: tipo
        });

        salvarDados();
        mudarTela('tela-partida');
    }
}
// --- UTILITÁRIOS ---
function salvarDados() {
    localStorage.setItem('banco_jogadores', JSON.stringify(bancoJogadores));
}

function calcularTotalPontos(jogador) {
    return jogador.stats.ataque_ponto + jogador.stats.saque_ace + jogador.stats.bloqueio_ponto;
}

function removerJogador(id) {
    if(confirm("Deseja remover este jogador?")) {
        bancoJogadores = bancoJogadores.filter(j => j.id !== id);
        salvarDados();
        atualizarListaBase();
    }
}

// Inicialização
atualizarListaBase();

function zerarEstatisticas() {
    if(confirm("Isso vai zerar todos os pontos da partida atual. Confirmar?")) {
        bancoJogadores.forEach(j => {
            for(let key in j.stats) j.stats[key] = 0;
        });
        salvarDados();
        renderizarJogadoresPartida();
    }
}

function desfazerUltimaAcao() {
    if (historicoAcoes.length === 0) {
        alert("Nenhuma ação para desfazer!");
        return;
    }

    // Pega a última ação da lista e remove ela de lá
    const ultimaAcao = historicoAcoes.pop();
    const jogador = bancoJogadores[ultimaAcao.jogadorIndex];

    // Subtrai o ponto (Garante que não fique menor que zero)
    if (jogador.stats[ultimaAcao.tipoAcao] > 0) {
        jogador.stats[ultimaAcao.tipoAcao]--;
    }

    salvarDados();
    renderizarJogadoresPartida(); // Atualiza os pontos na tela
    alert(`Desfeito: ${ultimaAcao.tipoAcao} de ${jogador.nome}`);
}

// Atualize sua função de atualizarListaBase para os nomes serem clicáveis
function atualizarListaBase() {
    const lista = document.getElementById('lista-base-jogadores');
    if(!lista) return;
    lista.innerHTML = bancoJogadores.map((j, index) => `
        <div class="item-jogador" onclick="verDetalhesJogador(${index})" style="cursor:pointer">
            <span>👤 ${j.nome}</span>
            <button class="btn-delete" onclick="event.stopPropagation(); removerJogador(${j.id})">❌</button>
        </div>
    `).join('');
}

function verDetalhesJogador(index) {
    const jogador = bancoJogadores[index];
    document.getElementById('detalhe-nome-jogador').innerText = jogador.nome;
    
    let htmlStats = "<ul>";
    // Esse loop percorre todas as ações que o jogador já fez
    for (let acao in jogador.stats) {
        let nomeFormatado = acao.replace('_', ' ').toUpperCase();
        htmlStats += `<li><strong>${nomeFormatado}:</strong> ${jogador.stats[acao]}</li>`;
    }
    htmlStats += "</ul>";
    
    document.getElementById('corpo-estatisticas').innerHTML = htmlStats;
    mudarTela('tela-detalhes');
}

function calcularTotalPontos(jogador) {
    // O "|| 0" garante que se o valor não existir, ele use o número zero
    let p1 = jogador.stats['ataque_ponto'] || 0;
    let p2 = jogador.stats['saque_ace'] || 0;
    let p3 = jogador.stats['bloqueio_ponto'] || 0;
    
    return p1 + p2 + p3;
}

// Variável global para os jogadores que aparecerão na tela de jogo
let jogadoresNaPartida = []; 

function prepararEReiniciarPartida() {
    // 1. Alerta logo de cara
    const confirmar = confirm("Deseja iniciar os preparativos? Isso zerará as estatísticas de TODOS os jogadores da base agora!");

    if (!confirmar) return; // Se cancelar, não faz nada

    // 2. RESET TOTAL: Zera os pontos de todo mundo na base
    bancoJogadores.forEach(jogador => {
        jogador.stats = {
            ataque_ponto: 0, ataque_erro: 0, ataque_bloqueado: 0,
            saque_ace: 0, saque_erro: 0, saque_positivo: 0,
            bloqueio_ponto: 0, bloqueio_amortecido: 0,
            recepcao_excelente: 0, recepcao_positiva: 0, recepcao_erro: 0,
            levantamento_preciso: 0, levantamento_erro: 0
        };
    });

    // 3. Salva o reset e limpa o histórico de "Desfazer"
    salvarDados();
    historicoAcoes = [];

    // 4. Monta a lista de seleção (Checkboxes)
    const container = document.getElementById('selecao-jogadores-partida');
    container.innerHTML = '';

    if (bancoJogadores.length === 0) {
        alert("Cadastre jogadores na base primeiro!");
        return mudarTela('tela-jogadores');
    }

    bancoJogadores.forEach((jogador) => {
        container.innerHTML += `
            <div class="item-selecao">
                <input type="checkbox" class="check-jogador" id="check-${jogador.id}" value="${jogador.id}">
                <label for="check-${jogador.id}"> ${jogador.nome}</label>
            </div>
        `;
    });

    // 5. Muda para a tela de escolher quem vai pro jogo
    alert("Estatísticas zeradas! Agora selecione quem vai para a partida.");
    mudarTela('tela-selecao-elenco');
}

// Função simples para confirmar quem foi marcado e ir para o jogo
function confirmarEscalacao() {
    const checkboxes = document.querySelectorAll('.check-jogador:checked');
    
    if (checkboxes.length === 0) {
        alert("Selecione pelo menos um jogador!");
        return;
    }

    jogadoresNaPartida = [];
    checkboxes.forEach(check => {
        const id = parseInt(check.value);
        const jogador = bancoJogadores.find(j => j.id === id);
        if (jogador) jogadoresNaPartida.push(jogador);
    });

    renderizarJogadoresPartida();
    mudarTela('tela-partida');
}

function confirmarEscalacao() {
    const checkboxes = document.querySelectorAll('#selecao-jogadores-partida input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        return alert("Selecione pelo menos um jogador para a partida!");
    }

    // Limpa a lista da partida anterior e adiciona os selecionados
    jogadoresNaPartida = [];
    checkboxes.forEach(cb => {
        const id = parseInt(cb.value);
        const jogadorEncontrado = bancoJogadores.find(j => j.id === id);
        if (jogadorEncontrado) jogadoresNaPartida.push(jogadorEncontrado);
    });

    renderizarJogadoresPartida();
    mudarTela('tela-partida');
}

function exportarParaTXT() {
    if (bancoJogadores.length === 0) {
        alert("Não há dados para exportar!");
        return;
    }

    let conteudo = "--- RELATÓRIO DE SCOUT VÔLEI ---\n";
    conteudo += "Data: " + new Date().toLocaleDateString() + "\n\n";

    bancoJogadores.forEach(j => {
    conteudo += `JOGADOR: ${j.nome.toUpperCase()}\n`;
    
    // Lista completa com os 13 fundamentos solicitados:
    conteudo += `- Ataque Ponto: ${j.stats.ataque_ponto}\n`;
    conteudo += `- Ataque Erro: ${j.stats.ataque_erro}\n`;
    conteudo += `- Ataque Bloqueado: ${j.stats.ataque_bloqueado}\n`;
    
    conteudo += `- Saque Ace: ${j.stats.saque_ace}\n`;
    conteudo += `- Saque Erro: ${j.stats.saque_erro}\n`;
    conteudo += `- Saque Normal: ${j.stats.saque_normal}\n`;
    
    conteudo += `- Bloqueio Ponto: ${j.stats.bloqueio_ponto}\n`;
    conteudo += `- Bloqueio Amortecido: ${j.stats.bloqueio_amortecido}\n`;
    conteudo += `- Bloqueio Erro: ${j.stats.bloqueio_erro}\n`;
    
    conteudo += `- Recepção Excelente: ${j.stats.recepcao_excelente}\n`;
    conteudo += `- Recepção Positiva: ${j.stats.recepcao_positiva}\n`;
    conteudo += `- Recepção Erro: ${j.stats.recepcao_erro}\n`;
    
    conteudo += `- Levantamento Preciso: ${j.stats.levantamento_preciso}\n`;
    conteudo += `- Levantamento Erro: ${j.stats.levantamento_erro}\n`;
    conteudo += `- Levantamento Atacável: ${j.stats.levantamento_atacavel}\n`;
    conteudo += `--------------------------\n`;
});

    // Criando o arquivo para baixar
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_scout.txt"; // Nome do arquivo que será baixado
    link.click();
}

// 1. Mostra a lista de quem pode entrar no relatório
function prepararSelecaoRelatorio() {
    const container = document.getElementById('lista-selecao-relatorio');
    container.innerHTML = '';

    if (bancoJogadores.length === 0) {
        alert("Não há jogadores cadastrados!");
        return;
    }

    bancoJogadores.forEach(j => {
        container.innerHTML += `
            <div class="item-selecao">
                <input type="checkbox" class="check-relatorio" id="rel-${j.id}" value="${j.id}" checked>
                <label for="rel-${j.id}"> ${j.nome}</label>
            </div>
        `;
    });

    mudarTela('tela-selecao-relatorio');
}

// 2. Gera o TXT apenas com os marcados
function gerarRelatorioFiltrado() {
    const selecionados = document.querySelectorAll('.check-relatorio:checked');
    
    if (selecionados.length === 0) {
        alert("Selecione ao menos um jogador para o relatório!");
        return;
    }

    let conteudo = "=== RELATÓRIO DE SCOUT SELECIONADO ===\n";
    conteudo += "Data: " + new Date().toLocaleString() + "\n";
    conteudo += "------------------------------------------\n\n";

    selecionados.forEach(checkbox => {
        const id = parseInt(checkbox.value);
        const j = bancoJogadores.find(jogador => jogador.id === id);

        if (j) {
            conteudo += `JOGADOR: ${j.nome.toUpperCase()}\n`;
            conteudo += `- Ataque Ponto: ${j.stats.ataque_ponto}\n`;
            conteudo += `- Ataque Erro: ${j.stats.ataque_erro}\n`;
            conteudo += `- Ataque Bloqueado: ${j.stats.ataque_bloqueado}\n`;
            conteudo += `- Saque Ace: ${j.stats.saque_ace}\n`;
            conteudo += `- Saque Erro: ${j.stats.saque_erro}\n`;
            conteudo += `- Saque Positivo: ${j.stats.saque_positivo}\n`;
            conteudo += `- Bloqueio Ponto: ${j.stats.bloqueio_ponto}\n`;
            conteudo += `- Bloqueio Amortecido: ${j.stats.bloqueio_amortecido}\n`;
            conteudo += `- Recepção Excelente: ${j.stats.recepcao_excelente}\n`;
            conteudo += `- Recepção Positiva: ${j.stats.recepcao_positiva}\n`;
            conteudo += `- Recepção Erro: ${j.stats.recepcao_erro}\n`;
            conteudo += `- Levantamento Preciso: ${j.stats.levantamento_preciso}\n`;
            conteudo += `- Levantamento Erro: ${j.stats.levantamento_erro}\n`;
            conteudo += `------------------------------------------\n`;
        }
    });

    // Código de baixar o arquivo
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `relatorio_personalizado_${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    
    alert("Relatório gerado com sucesso!");
    mudarTela('tela-menu');
}