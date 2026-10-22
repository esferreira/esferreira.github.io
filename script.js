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

// Envio assíncrono do formulário de contato via FormSubmit (sem recarregar a página)
(function () {
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  if (!contactForm || !formStatus || !submitBtn) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Enviando...</span>`;

    formStatus.className = "form-status form-status--loading";
    formStatus.textContent = "Transmitindo sua solicitação...";

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formsubmit.co/ajax/eciosf@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        formStatus.className = "form-status form-status--success";
        formStatus.innerHTML = `<strong>Mensagem enviada com sucesso!</strong> Entraremos em contato em breve no seu e-mail.`;
        contactForm.reset();
        submitBtn.innerHTML = `<span>Enviado com sucesso!</span>`;
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }, 5000);
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (err) {
      // Se a chamada AJAX for bloqueada por algum adblocker agressivo, submete pelo form normal
      formStatus.className = "form-status form-status--error";
      formStatus.innerHTML = `Houve uma instabilidade no envio automático. Redirecionando...`;
      setTimeout(() => {
        contactForm.submit();
      }, 1200);
    }
  });
})();

