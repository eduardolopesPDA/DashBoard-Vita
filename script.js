//imports do firebase
import { db } from './core.js';
import { 
    doc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.ouvirDadosDoBanco = function(nomeContrato) {
    // teste para ver se o nome da cidade está chegando certo
    console.log("Conectando ao banco para buscar cidade:", nomeContrato.trim()); 

    if (!db) {  
        console.error("Erro: Conexão 'db' não encontrada!");
        return;
    }

    // Referência exata: Banco, Nome da Coleção (string), ID do Documento (variável)
    const docRef = doc(db, "contratos", nomeContrato);

    onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log(`Dados recebidos de ${nomeContrato}:`, snapshot.data());
            
            // Salva no objeto (Garante que o objeto exista)
            window.contratosIndividuais[nomeContrato] = snapshot.data();
            
            // Atualiza a tela
            window.atualizarDashboard(nomeContrato);
        } else {
            console.error(`O documento '${nomeContrato}' não existe na coleção 'contratos' no Firebase!`);
        }
    }, (error) => {
        console.error("Erro na comunicação com Firebase:", error);
    });
    
};

//Lista de Contratos Individuais
window.contratosIndividuais = {};


let meuGrafico;

document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('metaChart');
  if (ctx) {
    meuGrafico = new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Atingida', 'Faltante'],
        datasets: [
          {
            data: [0, 100],
            backgroundColor: ['#3498db', '#e74c3c'],
            borderWidth: 0,
            cutout: '75%',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        let value = context.raw || 0;
                        return label + ': ' + value + '%'; // Adiciona o % aqui
                    }
                }
            }
        }
    }
    });
  }
  // Inici carregando a soma de todos
  atualizarDashboard('Geral');
});

// Função que gera os dados do "Geral" somando os outros contratos
function gerarDadosGerais() {
  const chaves = Object.keys(window.contratosIndividuais);
  if (chaves.length === 0) {
      return { faltaAgua: 0, faltaEsgoto: 0, agua: 0, esgoto: 0, status: [0,0,0,0] };
  }

  const geral = { faltaAgua: 0, faltaEsgoto: 0, agua: 0, esgoto: 0, status: [0,0,0,0] };

  let totalAtingidoAbsoluto = 0;

  chaves.forEach(chave => {
      const c = contratosIndividuais[chave];
      
      // Soma os detalhes primeiro
      geral.faltaAgua += (c.faltaAgua || 0);
      geral.faltaEsgoto += (c.faltaEsgoto || 0);
      
      geral.agua += (c.agua || 0);
      geral.esgoto += (c.esgoto || 0);
      
      const feitoNesteContrato = c.status.reduce((acc, curr) => acc + curr, 0);
      totalAtingidoAbsoluto += feitoNesteContrato;

      c.status.forEach((valor, i) => {
          geral.status[i] += valor;
      });
  });

  // O total de faltantes é a soma dos dois tipos
  geral.faltantes = geral.faltaAgua + geral.faltaEsgoto;

  const baseTotal = totalAtingidoAbsoluto + geral.faltantes;
  geral.atingida = baseTotal > 0 ? Math.round((totalAtingidoAbsoluto / baseTotal) * 100) : 0;

  return geral;
}


window.atualizarDashboard = function(nome) {
  // Se for Geral chama a função de soma, senão pega o contrato específico
  const d = (nome === "Geral") ? gerarDadosGerais() : contratosIndividuais[nome];
  if (!d) return;

  //calculo dinamico da porcentagem 
  const metaTotal = (d.agua || 0) + (d.esgoto || 0);
  const totalFaltantes = (d.faltaAgua || 0) + (d.faltaEsgoto || 0);
  
  let porcentagemReal = 0;
  if (metaTotal > 0) {
      const realizado = metaTotal - totalFaltantes;
      porcentagemReal = Math.round((realizado / metaTotal) * 100);
  }

  // garante que a porcentagem não seja negativa (caso os faltantes sejam maiores que a meta por erro de digitação)
  porcentagemReal = Math.max(0, porcentagemReal);

  // atualiza o Título de Faltantes (H3)
  document.querySelector('.goal-alert h3').innerText = totalFaltantes;

  // atualiza Detalhes de Água/Esgoto Faltantes
  document.getElementById('faltanteAgua').innerText = d.faltaAgua || 0;
  document.getElementById('faltanteEsgoto').innerText = d.faltaEsgoto || 0;

  // atualiza o Número Central do Gráfico
  document.querySelector('.chart-center-text h2').innerText = porcentagemReal + '%';

  // atualiza os cards de Metas (Água e Esgoto totais)
  const metas = document.querySelectorAll('.dividir-meta .number');
  if (metas.length >= 2) {
      metas[0].innerText = d.agua || 0;
      metas[1].innerText = d.esgoto || 0;
  }

  // atualiza a Esteira de Status e Soma Total
  const statusCounts = document.querySelectorAll('.status-card .count');
  d.status.forEach((valor, i) => {
      if (statusCounts[i]) statusCounts[i].innerText = valor || 0;
  });

  const somaStatus = d.status.reduce((acc, curr) => acc + curr, 0);
  const spanSoma = document.querySelector('.workflow-section h3 span');
  if (spanSoma) spanSoma.innerText = `Total: ${somaStatus}`;

  // atualiza o Gráfico com a nova porcentagem calculada
  if (meuGrafico) {
      meuGrafico.data.datasets[0].data = [porcentagemReal, 100 - porcentagemReal];
      meuGrafico.update();
  }

// calculo das barras de progresso

// Progresso de agua
const metaAgua = d.agua || 0;
const faltaAgua = d.faltaAgua || 0;
let percAgua = 0;
if (metaAgua > 0) {
    percAgua = Math.round(((metaAgua - faltaAgua) / metaAgua) * 100);
}
percAgua = Math.max(0, Math.min(100, percAgua)); // Trava entre 0 e 100

// Progresso de esgoto
const metaEsgoto = d.esgoto || 0;
const faltaEsgoto = d.faltaEsgoto || 0;
let percEsgoto = 0;
if (metaEsgoto > 0) {
    percEsgoto = Math.round(((metaEsgoto - faltaEsgoto) / metaEsgoto) * 100);
}
percEsgoto = Math.max(0, Math.min(100, percEsgoto));

// atualização visual das barras 
document.getElementById('percAgua').innerText = percAgua + '%';
document.getElementById('barAgua').style.width = percAgua + '%';

document.getElementById('percEsgoto').innerText = percEsgoto + '%';
document.getElementById('barEsgoto').style.width = percEsgoto + '%';
}

const seletor = document.getElementById('contractSelect');
if (seletor) {
  seletor.addEventListener('change', (e) => atualizarDashboard(e.target.value));
}

//dark mode
const btnDark = document.getElementById('darkModeToggle');

btnDark.addEventListener('click', () => {
  // Adiciona ou remove a classe .dark-mode do body
  document.body.classList.toggle('dark-mode');

  // Salva a preferência do usuário no navegador (LocalStorage)
  if (document.body.classList.contains('dark-mode')) {
    btnDark.innerText = '☀️ Modo Claro';
    localStorage.setItem('tema', 'dark');
  } else {
    btnDark.innerText = '🌕 Modo Escuro';
    localStorage.setItem('tema', 'light');
  }
});

// Verifica se o usuário já tinha escolhido o tema dark antes
if (localStorage.getItem('tema') === 'dark') {
  document.body.classList.add('dark-mode');
  btnDark.innerText = '☀️ Modo Claro';
}

// Inicia a escuta para as cidades padrão
document.addEventListener('DOMContentLoaded', () => {
    ouvirDadosDoBanco("São Vicente");
    ouvirDadosDoBanco("Santos");
});
