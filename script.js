// Borda da navegação ao rolar e revelação suave das seções.
(function () {
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll(".stack, .fit li, .srcs, .integr, .statement, .cols, .quote, .example, .product, .flow li, .cases li, .band__grid div");
  targets.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  targets.forEach((el) => io.observe(el));
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
        <div><strong>Tudo pronto!</strong> Escolha como deseja despachar sua mensagem para <b>eciosf@gmail.com</b>:</div>
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

