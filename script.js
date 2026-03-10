//Lista de Contratos Individuais
const contratosIndividuais = {
  'São Vicente': {
    faltaAgua: 210,
    faltaEsgoto: 20,
    agua: 200,
    esgoto: 100,
    status: [50, 100, 200, 10],
  },
  Santos: {
    faltaAgua: 20,
    faltaEsgoto: 20,
    agua: 300,
    esgoto: 200,
    status: [50, 150, 200, 40],
  },
};

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
        plugins: { legend: { display: false } },
      },
    });
  }
  // Inici carregando a soma de todos
  atualizarDashboard('Geral');
});

// Função que gera os dados do "Geral" somando os outros contratos
function gerarDadosGerais() {
  const chaves = Object.keys(contratosIndividuais);
  let geral = {
      faltaAgua: 0,
      faltaEsgoto: 0,
      faltantes: 0, // Será calculado abaixo
      agua: 0,
      esgoto: 0,
      status: [0, 0, 0, 0]
  };

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


function atualizarDashboard(nome) {
  // Se for Geral chama a função de soma, senão pega o contrato específico
  const d = (nome === "Geral") ? gerarDadosGerais() : contratosIndividuais[nome];
  if (!d) return;

  // --- calculo dinamico da porcentagem ---
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
  if (spanSoma) spanSoma.innerText = `Soma Total: ${somaStatus}`;

  // atualiza o Gráfico com a nova porcentagem calculada
  if (meuGrafico) {
      meuGrafico.data.datasets[0].data = [porcentagemReal, 100 - porcentagemReal];
      meuGrafico.update();
  }
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
