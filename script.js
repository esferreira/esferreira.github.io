// Borda da navegação ao rolar e revelação suave das seções.
(function () {
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll(
    ".hero__metrics li, .stack, .fit li, .conn-card, .sec-box, .integr, .statement, .cols, .quote, .compare-card, .sim-cockpit, .product, .flow li, .cases li, .band__grid div"
  );
  targets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
  targets.forEach((el) => io.observe(el));
})();

// Simulador Interativo ao Vivo (Cockpit de 4 cenários + Human-in-the-Loop)
(function () {
  const cockpit = document.getElementById("simCockpit");
  if (!cockpit) return;

  const tabs = cockpit.querySelectorAll(".sim-tab");
  const metaEl = document.getElementById("simMeta");
  const sevEl = document.getElementById("simSeverity");
  const timeEl = document.getElementById("simTime");
  const titleEl = document.getElementById("simTitle");
  const lineageEl = document.getElementById("simLineage");
  const tableBodyEl = document.getElementById("simTableBody");
  const hilBarEl = document.getElementById("simHilBar");
  const hilSummaryEl = document.getElementById("simHilSummary");
  const timelineEl = document.getElementById("simTimeline");
  const approveBtn = document.getElementById("simApproveBtn");

  const SCENARIOS = {
    sla: {
      meta: "INC0042137 · Prioridade Alta · 07:48",
      severity: "Verde Falso Detectado",
      sevClass: "sim__sev--hot",
      time: "Diagnóstico em 84s",
      title: "“O Painel de Vendas Diárias mostra status verde no job, mas está com o dado de ontem. A reunião da diretoria é às 9h.”",
      lineage: [
        { label: "pl_ingestao_erp (timeout 05:12)", state: "is-hot" },
        { label: "dbx_pedidos_diario (0 linhas novas)", state: "is-warn" },
        { label: "gold.fato_pedidos", state: "" },
        { label: "PBI Vendas Diárias (D-1)", state: "is-warn" }
      ],
      steps: [
        {
          q: "1. Linhagem até a medida DAX",
          srcLabel: "Rebellion · linhagem",
          srcClass: "src--reb",
          ev: "<code>[Vol. Faturado]</code> ← <code>gold.fato_pedidos</code> ← job <code>dbx_pedidos_diario</code> ← pipeline <code>pl_ingestao_erp</code>."
        },
        {
          q: "2. Detecção de “Verde Falso”",
          srcLabel: "Rebellion · auditoria SLA",
          srcClass: "src--reb",
          ev: "<code>pl_ingestao_erp</code> falhou por timeout às 05:12; o job Databricks rodou <code>MERGE</code> vazio (<code>SUCCEEDED</code> com <code>0 rows</code> inseridas) e o Power BI atualizou com dado D-1."
        },
        {
          q: "3. Runbook e regra de contingência",
          srcLabel: "Babadoc · faceta #28",
          srcClass: "src--bab",
          ev: "“Conflito com janela de backup do ERP (05:00–05:25): reprocessar <code>pl_ingestao_erp</code> com <code>dt_ref = D0</code>, validar <code>COUNT(*)</code> na Gold e disparar refresh do dataset.”"
        }
      ],
      hilSummary: "Causa raiz provada e plano idempotente pronto. Deseja autorizar o reprocessamento controlado da cadeia?",
      timeline: [
        "Reprocessar pl_ingestao_erp (D0)",
        "Executar dbx_pedidos_diario",
        "Refresh dataset Power BI",
        "Registrar incidente no Babadoc"
      ],
      approvedSummary: "Decisão aprovada pelo engenheiro: cadeia reprocessada, partição D0 validada na Gold e resposta enviada ao ServiceNow com link do runbook no Babadoc."
    },
    kpi: {
      meta: "INC0048912 · Divergência de Indicador · 09:15",
      severity: "Auditoria SQL + DAX",
      sevClass: "sim__sev--warn",
      time: "Diagnóstico em 62s",
      title: "“O Volume Faturado no Power BI está 14,2% menor do que o relatório oficial do ERP para a filial SP.”",
      lineage: [
        { label: "ERP Origem (148.200 hl)", state: "is-ok" },
        { label: "silver.pedidos_limpos (148.200 hl)", state: "is-ok" },
        { label: "gold.fato_pedidos (148.200 hl)", state: "is-ok" },
        { label: "DAX [Vol. Líquido] (127.150 hl)", state: "is-hot" }
      ],
      steps: [
        {
          q: "1. Reprodução da medida DAX",
          srcLabel: "Rebellion · inventário PBI",
          srcClass: "src--reb",
          ev: "Medida extraída: <code>CALCULATE(SUM(fato_pedidos[vol_hl]), fato_pedidos[status_doc] = \"FATURADO\", dim_tipo[ignora_kpi] = 0)</code>."
        },
        {
          q: "2. Auditoria Origem vs. Destino",
          srcLabel: "Rebellion · Delta Time Travel",
          srcClass: "src--reb",
          ev: "Consulta read-only via <code>TIMESTAMP AS OF</code> provou que os <code>148.200 hl</code> chegaram à Gold; <code>21.050 hl</code> entraram como <code>status_doc = \"FATURADO_PARCIAL\"</code> após mudança no ERP."
        },
        {
          q: "3. Regra de negócio & Semantic View",
          srcLabel: "Babadoc · faceta #07",
          srcClass: "src--bab",
          ev: "Regra documentada pelo PO exige inclusão de faturamento parcial aprovado. O filtro fixo no DAX e no modelo <code>.yaml</code> ficou defasado."
        }
      ],
      hilSummary: "Não há erro de carga — a divergência está no filtro DAX. Aprovar Pull Request ajustando o filtro para incluir FATURADO_PARCIAL e responder ao chamado?",
      timeline: [
        "Anexar prova SQL (148.200 vs 127.150 hl)",
        "Gerar PR no modelo DAX e .yaml",
        "Atualizar faceta #07 no Babadoc",
        "Enviar diagnóstico ao solicitante"
      ],
      approvedSummary: "Decisão aprovada: evidência numérica entregue ao negócio, PR aberto para ajuste do filtro semântico e documentação atualizada no Babadoc."
    },
    impact: {
      meta: "CHG0019304 · Gestão de Mudança · 14:10",
      severity: "Risco de Quebra Crítico",
      sevClass: "sim__sev--hot",
      time: "Diagnóstico em 45s",
      title: "“Podemos descomissionar hoje a tabela legada consumezone/log_entregas_v1? A janela de migração fecha às 18h.”",
      lineage: [
        { label: "consumezone/log_entregas_v1", state: "is-hot" },
        { label: "adf_sync_entregas_legado", state: "is-warn" },
        { label: "Cubo AAS Logística", state: "is-warn" },
        { label: "2 Painéis Tier-1 Power BI", state: "is-hot" }
      ],
      steps: [
        {
          q: "1. Raio de impacto downstream",
          srcLabel: "Rebellion · grafo & ADO",
          srcClass: "src--reb",
          ev: "Encontrados 2 dependentes ativos em produção: dataset <code>Entregas &amp; OTIF</code> (Tier-1, 340 acessos/dia) e notebook <code>nb_kpi_frete_mensal</code>."
        },
        {
          q: "2. Equivalência no Lakehouse",
          srcLabel: "Rebellion · migração UC",
          srcClass: "src--reb",
          ev: "A substituta <code>prod_log.gold.fato_entregas</code> já está ativa no Unity Catalog com schema compatível, mas o cubo AAS ainda lê o path legado."
        },
        {
          q: "3. Donos e política de corte",
          srcLabel: "Babadoc · facetas #03 e #23",
          srcClass: "src--bab",
          ev: "Responsável: Coordenação de Transporte (SLA 07:00). Governança exige janela paralela D+3 antes do descomissionamento definitivo."
        }
      ],
      hilSummary: "Bloqueio preventivo recomendado: o corte hoje derrubaria 2 painéis críticos. Aprovar veto da mudança e criar plano de repontamento para o Unity Catalog?",
      timeline: [
        "Bloquear drop de log_entregas_v1",
        "Abrir tarefa de repontamento AAS/PBI",
        "Notificar donos listados no Babadoc",
        "Agendar janela segura D+3"
      ],
      approvedSummary: "Decisão aprovada: descomissionamento adiado com segurança, plano de repontamento criado e donos dos painéis notificados com linhagem completa."
    },
    semantic: {
      meta: "GOV0008421 · Novo Produto de Dados · 16:05",
      severity: "100% Documentado",
      sevClass: "sim__sev--ok",
      time: "Gerado em 38s",
      title: "“Publicamos o dashboard Eficiência de Frota no Power BI. Precisamos documentá-lo no catálogo e habilitá-lo para consultas da IA.”",
      lineage: [
        { label: "Modelo BI Eficiência de Frota", state: "is-ok" },
        { label: "Parser DAX / M / AAS", state: "is-ok" },
        { label: "Babadoc (43/43 Facetas)", state: "is-ok" },
        { label: "eficiencia_frota.yaml", state: "is-ok" }
      ],
      steps: [
        {
          q: "1. Engenharia reversa do modelo BI",
          srcLabel: "Babadoc · extrator semântico",
          srcClass: "src--bab",
          ev: "Extraídas 14 tabelas, 28 medidas DAX, conexão Live Connection e 6 páginas direto dos metadados do relatório, sem expor dados de negócio."
        },
        {
          q: "2. Roteiro oficial completo",
          srcLabel: "Babadoc · 43 facetas",
          srcClass: "src--bab",
          ev: "Preenchidas 16 respostas de Negócio, 22 de Engenharia/Contingência e 5 de Entrega Power BI com <code>documentationScore = 100%</code>."
        },
        {
          q: "3. Semantic View + validação viva",
          srcLabel: "Rebellion + Babadoc",
          srcClass: "src--reb",
          ev: "Gerado modelo <code>eficiencia_frota.yaml</code> (métricas SQL e joins) e cruzado pelo Rebellion com o Unity Catalog e índice vetorial <code>pgvector</code>."
        }
      ],
      hilSummary: "Documentação 43/43 e Semantic View .yaml validadas contra o catálogo físico. Publicar produto no Babadoc e liberar para agentes Text-to-SQL?",
      timeline: [
        "Validar métricas SQL vs DAX",
        "Publicar 43 facetas no Babadoc",
        "Indexar .yaml no SQL-RAG",
        "Habilitar produto para a IA"
      ],
      approvedSummary: "Decisão aprovada: produto publicado com score 100% no Babadoc e Semantic View indexada no Rebellion para consultas em linguagem natural."
    }
  };

  let currentKey = "sla";

  function renderScenario(key) {
    const sc = SCENARIOS[key];
    if (!sc) return;
    currentKey = key;

    tabs.forEach((btn) => {
      const active = btn.dataset.scenario === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    metaEl.textContent = sc.meta;
    sevEl.textContent = sc.severity;
    sevEl.className = "sim__sev " + sc.sevClass;
    timeEl.textContent = sc.time;
    titleEl.textContent = sc.title;

    lineageEl.innerHTML = sc.lineage
      .map((node, idx) => {
        const cls = node.state ? "sim__node " + node.state : "sim__node";
        const arrow = idx < sc.lineage.length - 1 ? '<span class="sim__arrow" aria-hidden="true">→</span>' : "";
        return `<span class="${cls}">${node.label}</span>${arrow}`;
      })
      .join("");

    tableBodyEl.innerHTML = sc.steps
      .map(
        (step) => `
          <div class="table__row" role="row">
            <span role="cell"><b>${step.q}</b></span>
            <span role="cell"><span class="src ${step.srcClass}">${step.srcLabel}</span></span>
            <span role="cell">${step.ev}</span>
          </div>
        `
      )
      .join("");

    hilBarEl.classList.remove("is-approved");
    hilSummaryEl.textContent = sc.hilSummary;
    timelineEl.innerHTML = sc.timeline.map((item) => `<span class="tl"><i></i>${item}</span>`).join("");

    approveBtn.classList.remove("is-done");
    approveBtn.disabled = false;
    approveBtn.textContent = "⚡ Aprovar & Executar Ação";
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => renderScenario(btn.dataset.scenario));
  });

  if (approveBtn) {
    approveBtn.addEventListener("click", () => {
      const sc = SCENARIOS[currentKey];
      if (!sc) return;
      hilBarEl.classList.add("is-approved");
      hilSummaryEl.textContent = sc.approvedSummary;
      timelineEl.innerHTML = sc.timeline
        .map((item) => `<span class="tl tl--done"><i></i>${item}</span>`)
        .join("");
      approveBtn.classList.add("is-done");
      approveBtn.disabled = true;
      approveBtn.textContent = "✓ Decisão Aprovada & Executada";
    });
  }
})();

// Explorador Interativo do Grafo Rebellion
(function () {
  const explorer = document.querySelector(".reb-explorer");
  if (!explorer) return;

  const nodes = explorer.querySelectorAll(".node[data-node]");
  const titleEl = document.getElementById("rebDetailTitle");
  const statusEl = document.getElementById("rebDetailStatus");
  const descEl = document.getElementById("rebDetailDesc");
  const meta1El = document.getElementById("rebDetailMeta1");
  const meta2El = document.getElementById("rebDetailMeta2");

  const REB_NODES = {
    adf: {
      title: "pl_ingestao_erp (Azure Data Factory)",
      status: "Falha · Timeout 05:12",
      statusClass: "reb-status--hot",
      desc: "Pipeline de ingestão incremental do ERP. Caiu por contenção na janela de backup da origem às 05:12 BRT.",
      meta1: "Conector: ADF Read-Only",
      meta2: "Runbook: Babadoc Faceta #28"
    },
    airflow: {
      title: "dag_pedidos_sap (Apache Airflow)",
      status: "Saudável · 04:40 BRT",
      statusClass: "reb-status--ok",
      desc: "DAG orquestradora de cargas complementares SAP. Todas as 12 tasks concluídas dentro da janela esperada.",
      meta1: "SLA: 05:30 BRT · No prazo",
      meta2: "Histórico: 99,4% (30d)"
    },
    silver: {
      title: "prod_com.silver.pedidos_limpos",
      status: "Parcial · Lote D0 pendente",
      statusClass: "reb-status--warn",
      desc: "Camada Delta de saneamento e deduplicação. Recebeu registros do SAP, mas aguarda reprocessamento da carga do ERP.",
      meta1: "Unity Catalog · Delta Lake",
      meta2: "SQL-RAG: Indexado (HNSW)"
    },
    gold: {
      title: "gold.fato_pedidos",
      status: "Alerta · Verde Falso",
      statusClass: "reb-status--warn",
      desc: "Tabela Delta no Unity Catalog. Último job marcou sucesso, porém a partição D0 chegou com 0 registros novos devido ao timeout upstream.",
      meta1: "SLA: 06:30 BRT · Tier 1",
      meta2: "Babadoc: 100% aderente"
    },
    aas: {
      title: "Cubo Vendas Corporativas (AAS)",
      status: "Atenção · Dado D-1",
      statusClass: "reb-status--warn",
      desc: "Modelo tabular Azure Analysis Services processado às 06:15 sem erros de motor, porém refletindo partição do dia anterior.",
      meta1: "Último Process: 06:15 BRT",
      meta2: "Partições: 36 meses"
    },
    pbi: {
      title: "DAX [Vol. Faturado Líquido] (Power BI)",
      status: "Auditoria · Drift 0%",
      statusClass: "reb-status--ok",
      desc: "Medida DAX extraída do workspace corporativo e cruzada com a Semantic View do Babadoc. Nenhuma divergência de fórmula detectada.",
      meta1: "Dataset: Vendas Diárias",
      meta2: "Conformidade: Validada"
    }
  };

  function selectNode(key) {
    const info = REB_NODES[key];
    if (!info) return;

    nodes.forEach((n) => n.classList.toggle("is-active", n.dataset.node === key));
    titleEl.textContent = info.title;
    statusEl.textContent = info.status;
    statusEl.className = "reb-status " + info.statusClass;
    descEl.textContent = info.desc;
    meta1El.textContent = info.meta1;
    meta2El.textContent = info.meta2;
  }

  nodes.forEach((node) => {
    node.addEventListener("click", () => selectNode(node.dataset.node));
    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectNode(node.dataset.node);
      }
    });
  });
})();

// Explorador Interativo de Facetas e Semantic View (.yaml) do Babadoc
(function () {
  const explorer = document.querySelector(".bab-explorer");
  if (!explorer) return;

  const tabs = explorer.querySelectorAll(".bab-tab[data-tab]");
  const contentEl = document.getElementById("babTabContent");

  const BAB_TABS = {
    business: `
      <div class="doc__q">
        <span class="doc__k">Faceta #07 · Regras de Negócio</span>
        <p>Como o Volume Faturado Líquido é calculado?</p>
        <span>Considera pedidos com status <code>FATURADO</code>, deduz devoluções D-0 e aplica o filtro de expurgo <code>motivo_cancel IS NULL</code>.</span>
      </div>
      <div class="doc__q">
        <span class="doc__k">Faceta #08 · Filtros &amp; Exceções</span>
        <p>Quais registros são excluídos automaticamente?</p>
        <span>Bonificações internas (CFOP 5910) e transferências entre CDs são removidas na camada Silver antes da agregação.</span>
      </div>
    `,
    technical: `
      <div class="doc__q">
        <span class="doc__k">Faceta #901 · Janela Dinâmica &amp; Anti-OOM</span>
        <p>Como o notebook evita estouro de memória em reprocessamentos?</p>
        <span>Processamento particionado por <code>dt_faturamento</code> em blocos de 7 dias com broadcast join nas dimensões menores.</span>
      </div>
      <div class="doc__q">
        <span class="doc__k">Faceta #903 · Idempotência &amp; Contingência</span>
        <p>Como reprocessar sem duplicar registros na Gold?</p>
        <span><code>MERGE INTO gold.fato_pedidos</code> chaveado por <code>(id_pedido, id_item)</code> ou <code>replaceWhere</code> na partição afetada.</span>
      </div>
    `,
    delivery: `
      <div class="doc__q">
        <span class="doc__k">Faceta #35 · Medidas DAX Extraídas (Power BI)</span>
        <p>Quais medidas analíticas vivem no relatório?</p>
        <span><code>[Vol. Faturado Líquido]</code>, <code>[% Atingimento Meta]</code> e <code>[OTIF D-1]</code> — todas convertidas em SQL na camada semântica.</span>
      </div>
      <div class="doc__q">
        <span class="doc__k">Facetas #36 e #37 · Conexão &amp; Segurança (RLS)</span>
        <p>Qual o modo de conexão e regra de acesso?</p>
        <span>Live Connection em cubo AAS corporativo com RLS por <code>cod_regional</code> vinculada ao Microsoft Entra ID.</span>
      </div>
    `,
    yaml: `<pre class="bab-code">name: vendas_corporativas_semantic_model
tables:
  - name: gold_fato_pedidos
    base_table: prod_com.gold.fato_pedidos
    dimensions:
      - name: regional
        expr: cod_regional
    metrics:
      - name: volume_faturado_liquido
        expr: SUM(CASE WHEN status_doc IN ('FATURADO','FATURADO_PARCIAL')
                  THEN vol_hl ELSE 0 END)</pre>`
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.tab;
      if (!BAB_TABS[key]) return;
      tabs.forEach((t) => {
        const active = t.dataset.tab === key;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      contentEl.innerHTML = BAB_TABS[key];
    });
  });
})();

// Envio inteligente e infalível do formulário de contato para eciosf@gmail.com
(function () {
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  if (!contactForm || !formStatus || !submitBtn) return;

  // Se você tiver uma chave do Web3Forms, insira aqui. Caso contrário, usa o despachador inteligente direto para eciosf@gmail.com
  const WEB3FORMS_ACCESS_KEY = "";

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = (document.getElementById("form-name")?.value || "").trim();
    const email = (document.getElementById("form-email")?.value || "").trim();
    const company = (document.getElementById("form-company")?.value || "").trim();
    const interest = (document.getElementById("form-interest")?.value || "Demonstração").trim();
    const message = (document.getElementById("form-message")?.value || "").trim();

    if (!name || !email || !message) {
      formStatus.className = "form-status form-status--error";
      formStatus.textContent = "Por favor, preencha todos os campos obrigatórios marcados com *.";
      return;
    }

    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Processando solicitação...</span>`;

    // Monta o assunto e o corpo formatado da mensagem
    const subject = `Demonstração Rebellion + Babadoc — ${name} ${company ? `(${company})` : ""}`;
    const emailBody = `Olá, Ecio!\n\nGostaria de agendar uma demonstração do Rebellion + Babadoc.\n\n--- DADOS DA SOLICITAÇÃO ---\nNome: ${name}\nE-mail para resposta: ${email}\nEmpresa / Time: ${company || "Não informado"}\nInteresse Principal: ${interest}\n\n--- MENSAGEM / CONTEXTO ---\n${message}\n\n---\nEnviado através do site https://esferreira.github.io/`;

    // URLs de envio direto
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=eciosf@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    const mailtoUrl = `mailto:eciosf@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    // Se houver uma chave Web3Forms configurada, tenta envio silencioso primeiro com timeout de 4s
    if (WEB3FORMS_ACCESS_KEY) {
      formStatus.className = "form-status form-status--loading";
      formStatus.textContent = "Transmitindo sua solicitação...";

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      try {
        const resp = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            name, email, company, interest, message,
            subject: subject
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          formStatus.className = "form-status form-status--success";
          formStatus.innerHTML = `<strong>✅ Solicitação enviada com sucesso!</strong> Recebemos seus dados e responderemos em breve no e-mail <u>${email}</u>.`;
          contactForm.reset();
          submitBtn.innerHTML = `<span>Enviado com sucesso!</span>`;
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }, 6000);
          return;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // Cai para o despachador direto abaixo
      }
    }

    // Despachador direto e garantido para eciosf@gmail.com
    formStatus.className = "form-status form-status--success";
    formStatus.innerHTML = `
      <div style="display:grid;gap:10px;">
        <div><strong>Falta um passo:</strong> a mensagem já está escrita. Escolha por onde enviá-la para <b>eciosf@gmail.com</b>:</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;">
          <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--dark btn--sm" style="font-size:.85rem;height:36px;padding:0 14px;">
            ✉️ Abrir no Gmail Web
          </a>
          <a href="${mailtoUrl}" class="btn btn--line btn--sm" style="font-size:.85rem;height:36px;padding:0 14px;">
            📬 Abrir no Outlook / E-mail padrão
          </a>
          <button type="button" id="copyMsgBtn" class="btn btn--line btn--sm" style="font-size:.85rem;height:36px;padding:0 14px;cursor:pointer;">
            📋 Copiar dados
          </button>
        </div>
      </div>
    `;

    // Handler do botão de copiar
    const copyBtn = document.getElementById("copyMsgBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(emailBody).then(() => {
          copyBtn.textContent = "✓ Copiado!";
          setTimeout(() => { copyBtn.textContent = "📋 Copiar dados"; }, 2500);
        });
      });
    }

    // Tenta abrir o cliente de email automaticamente
    try {
      window.location.href = mailtoUrl;
    } catch (e) {
      // Ignora caso o navegador bloqueie popup
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  });
})();

// Vitrine interativa de livros: clicar ou focar uma capa na estante destaca a descrição abaixo
(function () {
  const shelfBtns = document.querySelectorAll(".shelf-book[data-book-target]");
  const descCards = document.querySelectorAll(".book-desc-card");
  if (!shelfBtns.length || !descCards.length) return;

  function highlightBook(targetId, scrollToCard) {
    shelfBtns.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.bookTarget === targetId));
    descCards.forEach((card) => card.classList.toggle("is-highlighted", card.id === targetId));
    if (scrollToCard) {
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  shelfBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", () => highlightBook(btn.dataset.bookTarget, false));
    btn.addEventListener("click", () => highlightBook(btn.dataset.bookTarget, true));
  });
})();

// Pré-seleciona o livro no formulário de contato ao clicar em "Quero ser avisado no lançamento"
(function () {
  const links = document.querySelectorAll("[data-book-title]");
  const interestEl = document.getElementById("form-interest");
  const messageEl = document.getElementById("form-message");
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const title = link.dataset.bookTitle;
      if (interestEl) {
        interestEl.value = "Livros & Publicações (Pré-lançamento)";
      }
      if (messageEl && title) {
        messageEl.value = `Olá, Ecio! Gostaria de ser avisado no lançamento do livro "${title}".`;
      }
    });
  });
})();


