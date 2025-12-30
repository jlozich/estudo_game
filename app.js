(function(){
  const $app = document.getElementById('app');

  const state = {
    fase: 'menu', // menu | jogo | resultado-final
    modoJogo: '',
    pontuacao: 0,
    questaoAtual: 0,
    respostaSelecionada: null,
    mostrarResultado: false,
    acertos: 0,
    erros: 0
  };

  function reset(){
    state.fase='menu';
    state.modoJogo='';
    state.pontuacao=0;
    state.questaoAtual=0;
    state.respostaSelecionada=null;
    state.mostrarResultado=false;
    state.acertos=0;
    state.erros=0;
    render();
  }

  function iniciar(modo){
    state.modoJogo = modo;
    state.fase = 'jogo';
    state.questaoAtual = 0;
    state.respostaSelecionada = null;
    state.mostrarResultado = false;
    state.pontuacao = 0;
    state.acertos = 0;
    state.erros = 0;
    render();
  }

  function selecionar(idx){
    if(state.mostrarResultado) return;
    state.respostaSelecionada = idx;
    render();
  }

  function confirmar(){
    const q = window.QUESTOES[state.modoJogo][state.questaoAtual];
    if(state.respostaSelecionada === q.correta){
      state.pontuacao += 100;
      state.acertos += 1;
    } else {
      state.erros += 1;
    }
    state.mostrarResultado = true;
    render();
  }

  function proxima(){
    const list = window.QUESTOES[state.modoJogo];
    if(state.questaoAtual < list.length - 1){
      state.questaoAtual += 1;
      state.respostaSelecionada = null;
      state.mostrarResultado = false;
      render();
    } else {
      state.fase = 'resultado-final';
      render();
    }
  }

  function el(tag, attrs={}, children=[]){
    const n = document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k === 'class') n.className = v;
      else if(k.startsWith('on') && typeof v === 'function') n.addEventListener(k.substring(2).toLowerCase(), v);
      else if(k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v);
    }
    for(const c of children){
      if(typeof c === 'string') n.appendChild(document.createTextNode(c));
      else if(c) n.appendChild(c);
    }
    return n;
  }

  function renderMenu(){
    const wrap = el('div', {class:'container'});
    wrap.appendChild(el('div', {class:'center'}, [
      el('div', {class:'pill'}, ['🏆 ', el('span', {}, ['Princípios Tributários — 300 questões'])]),
      el('div', {class:'h1'}, ['🎮 Princípios Tributários']),
      el('div', {class:'p'}, ['Treino baseado no PDF (100 fáceis, 100 médias, 100 difíceis)'])
    ]));

    const grid = el('div', {class:'grid3'});
    grid.appendChild(el('button', {class:'cardBtn btnGreen', onclick:()=>iniciar('facil')}, [
      el('div', {html:'📗 <b>Nível Fácil</b>'}),
      el('div', {class:'tag'}, ['Conceitos básicos • 100 questões'])
    ]));
    grid.appendChild(el('button', {class:'cardBtn btnYellow', onclick:()=>iniciar('medio')}, [
      el('div', {html:'🎯 <b>Nível Médio</b>'}),
      el('div', {class:'tag'}, ['Exceções e aplicações • 100 questões'])
    ]));
    grid.appendChild(el('button', {class:'cardBtn btnRed', onclick:()=>iniciar('dificil')}, [
      el('div', {html:'🧠 <b>Nível Difícil</b>'}),
      el('div', {class:'tag'}, ['Jurisprudência e pegadinhas • 100 questões'])
    ]));
    wrap.appendChild(grid);

    const how = el('div', {class:'glass', style:'margin-top:16px'}, [
      el('div', {html:'⚡ <b>Como jogar</b>', style:'font-size:18px; margin-bottom:8px'}),
      el('ul', {style:'margin:0; padding-left:18px; color: rgba(255,255,255,.9)'}, [
        el('li', {}, ['Escolha um nível']),
        el('li', {}, ['Marque a alternativa correta']),
        el('li', {}, ['Ganhe 100 pontos por acerto']),
        el('li', {}, ['Leia a explicação']),
        el('li', {}, ['Meta: 80%+'])
      ])
    ]);
    wrap.appendChild(how);
    return wrap;
  }

  function renderJogo(){
    const list = window.QUESTOES[state.modoJogo];
    const q = list[state.questaoAtual];
    const progresso = Math.round(((state.questaoAtual + 1) / list.length) * 100);

    const wrap = el('div', {class:'container'});

    const header = el('div', {class:'glass'}, [
      el('div', {class:'row'}, [
        el('div', {}, [
          el('div', {style:'font-size:12px; opacity:.8'}, ['Questão']),
          el('div', {style:'font-size:24px; font-weight:900'}, [`${state.questaoAtual+1}/${list.length}`])
        ]),
        el('div', {style:'text-align:right'}, [
          el('div', {style:'font-size:12px; opacity:.8'}, ['Pontuação']),
          el('div', {style:'font-size:24px; font-weight:900; color:#fbbf24'}, [String(state.pontuacao)])
        ])
      ]),
      el('div', {class:'progressWrap'}, [
        el('div', {class:'progressBar', style:`width:${progresso}%`})
      ])
    ]);
    wrap.appendChild(header);

    const card = el('div', {class:'whiteCard', style:'margin-top:16px'}, [
      el('div', {class:'qTitle'}, [q.pergunta])
    ]);

    const opts = el('div', {style:'display:flex; flex-direction:column; gap:10px'});
    q.opcoes.forEach((op, idx) => {
      let cls = 'optBtn';
      if(state.mostrarResultado){
        if(idx === q.correta) cls += ' optOk';
        else if(idx === state.respostaSelecionada && idx !== q.correta) cls += ' optBad';
      } else if(state.respostaSelecionada === idx){
        cls += ' optSel';
      }
      opts.appendChild(el('button', {
        class: cls,
        onclick: ()=>selecionar(idx),
        disabled: state.mostrarResultado ? 'true' : null
      }, [
        el('span', {class:'optLetter'}, [String.fromCharCode(65+idx)+'.']),
        el('span', {class:'optText'}, [op])
      ]));
    });

    card.appendChild(opts);
    wrap.appendChild(card);

    if(state.mostrarResultado){
      const ok = state.respostaSelecionada === q.correta;
      wrap.appendChild(el('div', {class:`resultBox ${ok?'resultOk':'resultBad'}`}, [
        el('div', {style:'font-weight:900; margin-bottom:6px'}, [ok ? '✅ Correto!' : '❌ Incorreto!']),
        el('div', {}, [q.explicacao])
      ]));
    }

    const btn = el('button', {
      class: `mainBtn ${state.mostrarResultado ? 'mainBtnGreen' : ''}`,
      onclick: state.mostrarResultado ? proxima : confirmar,
      disabled: (!state.mostrarResultado && state.respostaSelecionada === null) ? 'true' : null
    }, [state.mostrarResultado ? (state.questaoAtual < list.length-1 ? 'Próxima Questão →' : 'Ver Resultado Final 🏆') : 'Confirmar Resposta']);
    wrap.appendChild(el('div', {style:'margin-top:14px'}, [btn]));

    return wrap;
  }

  function renderResultado(){
    const total = state.acertos + state.erros;
    const percentual = total ? Math.round((state.acertos / total) * 100) : 0;
    const aprovado = percentual >= 80;

    const wrap = el('div', {class:'container'});
    const card = el('div', {class:'whiteCard', style:'text-align:center'}, [
      el('div', {style:'font-size:58px; margin-bottom:8px'}, [aprovado ? '🏆' : '📚']),
      el('div', {style:'font-size:34px; font-weight:900'}, [aprovado ? 'Parabéns!' : 'Continue estudando!']),
      el('div', {style:`font-size:64px; font-weight:900; margin:10px 0; color:${aprovado ? '#16a34a' : '#f59e0b'}`}, [`${percentual}%`])
    ]);

    const stats = el('div', {class:'statsGrid'}, [
      el('div', {class:'stat'}, [el('div', {class:'statLabel'}, ['Pontuação']), el('div', {class:'statVal'}, [String(state.pontuacao)])]),
      el('div', {class:'stat'}, [el('div', {class:'statLabel'}, ['Acertos']), el('div', {class:'statVal'}, [String(state.acertos)])]),
      el('div', {class:'stat'}, [el('div', {class:'statLabel'}, ['Erros']), el('div', {class:'statVal'}, [String(state.erros)])]),
    ]);
    card.appendChild(stats);

    card.appendChild(el('div', {style:'margin-top:14px'}, [
      el('button', {class:'mainBtn', onclick: reset}, ['🎮 Jogar novamente'])
    ]));

    wrap.appendChild(card);
    return wrap;
  }

  function render(){
    $app.innerHTML = '';
    if(state.fase === 'menu') $app.appendChild(renderMenu());
    else if(state.fase === 'jogo') $app.appendChild(renderJogo());
    else $app.appendChild(renderResultado());
  }

  render();
})();
