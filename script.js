//Lista de Contratos Individuais
const contratosIndividuais = {
  'São Vicente': {
    atingida: 72,
    faltantes: 100,
    faltaAgua: 210,
    faltaEsgoto: 20,
    agua: 200,
    esgoto: 100,
    status: [50, 100, 200, 10],
  },
  Santos: {
    atingida: 50,
    faltantes: 100,
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

  document.getElementById('faltanteAgua').innerText = d.faltaAgua;
  document.getElementById('faltanteEsgoto').innerText = d.faltaEsgoto;
  

  if (!d) return;
  // soma dinamica para Garante que o H3 seja sempre Água + Esgoto
    const totalFaltantesCalculado = (d.faltaAgua || 0) + (d.faltaEsgoto || 0);
    
    const h3Faltantes = document.querySelector('.goal-alert h3');
    if (h3Faltantes) h3Faltantes.innerText = totalFaltantesCalculado;

    // Atualiza os detalhes (os números menores)
    const elFaltaAgua = document.getElementById('faltanteAgua');
    const elFaltaEsgoto = document.getElementById('faltanteEsgoto');
    
    if (elFaltaAgua) elFaltaAgua.innerText = d.faltaAgua || 0;
    if (elFaltaEsgoto) elFaltaEsgoto.innerText = d.faltaEsgoto || 0;

  // Cálculo da Soma Total dos Status (Esteira)
  const totalCalculado = d.status.reduce((acc, curr) => acc + curr, 0);

  // Atualização da Interface
  const spanSoma = document.querySelector('.workflow-section h3 span');
  if (spanSoma) spanSoma.innerText = `Soma Total: ${totalCalculado}`;

  const statusCounts = document.querySelectorAll('.status-card .count');
  d.status.forEach((valor, i) => {
    if (statusCounts[i]) statusCounts[i].innerText = valor;
  });

  const metas = document.querySelectorAll('.dividir-meta .number');
  if (metas.length >= 2) {
    metas[0].innerText = d.agua;
    metas[1].innerText = d.esgoto;
  }

  document.querySelector('.goal-alert h3').innerText = d.faltantes;
  document.querySelector('.chart-center-text h2').innerText = d.atingida + '%';

  if (meuGrafico) {
    meuGrafico.data.datasets[0].data = [d.atingida, 100 - d.atingida];
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
