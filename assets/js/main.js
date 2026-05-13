
      // ── Carrossel de services ──────────────────────────────
      (function () {
        const carousel = document.getElementById("servicesCarousel");
        if (!carousel) return;

        const track = document.getElementById("servicesTrack");
        const viewport = carousel.querySelector(".services__viewport");
        const prevBtn = document.getElementById("servicesPrev");
        const nextBtn = document.getElementById("servicesNext");
        const dotsBox = document.getElementById("servicesDots");

        let cards = Array.from(track.children);
        let cardsPerView = 3;
        let currentIndex = 0; // índice da PÁGINA atual (não do card)
        let totalPages = 1;

        // Quantos cards cabem por "página" baseado na largura
        function getCardsPerView() {
          const w = window.innerWidth;
          if (w < 768) return 1;
          if (w < 1024) return 2;
          return 3;
        }

        // Calcula o tamanho de cada card pra preencher a viewport
        function updateCardSizes() {
          const gap = parseInt(getComputedStyle(track).gap) || 0;
          const vw = viewport.clientWidth;
          const size = (vw - gap * (cardsPerView - 1)) / cardsPerView;
          cards.forEach((c) => (c.style.width = size + "px"));
        }

        // Move a track pra página atual
        function goTo(pageIndex, animate = true) {
          currentIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));

          const gap = parseInt(getComputedStyle(track).gap) || 0;
          const cardW = cards[0]?.offsetWidth || 0;
          const offset = currentIndex * (cardW + gap) * cardsPerView;

          track.style.transition = animate
            ? "transform .55s cubic-bezier(.22,.61,.36,1)"
            : "none";
          track.style.transform = `translateX(${-offset}px)`;

          updateUI();
        }

        // Atualiza estado dos botões e dos dots
        function updateUI() {
          if (prevBtn) prevBtn.disabled = currentIndex === 0;
          if (nextBtn) nextBtn.disabled = currentIndex >= totalPages - 1;

          dotsBox.querySelectorAll(".services__dot").forEach((d, i) => {
            d.classList.toggle("services__dot--active", i === currentIndex);
          });
        }

        // (Re)cria os dots — uma para cada página
        function buildDots() {
          dotsBox.innerHTML = "";
          for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement("button");
            dot.className =
              "services__dot" + (i === 0 ? " services__dot--active" : "");
            dot.setAttribute("aria-label", `Go to page ${i + 1}`);
            dot.addEventListener("click", () => goTo(i));
            dotsBox.appendChild(dot);
          }
          // Esconde dots se só tem 1 página
          dotsBox.style.display = totalPages > 1 ? "flex" : "none";
        }

        // Recalcula tudo (no resize ou ao adicionar/remover cards)
        function rebuild() {
          cards = Array.from(track.children);
          cardsPerView = getCardsPerView();
          totalPages = Math.max(1, Math.ceil(cards.length / cardsPerView));

          // Se a página atual ficou fora do range (ex.: depois de redimensionar)
          currentIndex = Math.min(currentIndex, totalPages - 1);

          updateCardSizes();
          buildDots();
          goTo(currentIndex, false);
        }

        // ── Botões ──
        prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));
        nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));

        // ── Swipe / drag ──
        let dragStartX = 0;
        let dragDelta = 0;
        let isDragging = false;

        function onDragStart(x) {
          isDragging = true;
          dragStartX = x;
          dragDelta = 0;
          track.classList.add("is-dragging");
        }
        function onDragMove(x) {
          if (!isDragging) return;
          dragDelta = x - dragStartX;
          const gap = parseInt(getComputedStyle(track).gap) || 0;
          const cardW = cards[0]?.offsetWidth || 0;
          const offset =
            currentIndex * (cardW + gap) * cardsPerView - dragDelta;
          track.style.transform = `translateX(${-offset}px)`;
        }
        function onDragEnd() {
          if (!isDragging) return;
          isDragging = false;
          track.classList.remove("is-dragging");

          // Se arrastou mais de 60px, troca de página
          const threshold = 60;
          if (dragDelta < -threshold && currentIndex < totalPages - 1) {
            goTo(currentIndex + 1);
          } else if (dragDelta > threshold && currentIndex > 0) {
            goTo(currentIndex - 1);
          } else {
            goTo(currentIndex); // volta pra posição
          }
          dragDelta = 0;
        }

        // Touch (mobile)
        track.addEventListener(
          "touchstart",
          (e) => onDragStart(e.touches[0].clientX),
          { passive: true },
        );
        track.addEventListener(
          "touchmove",
          (e) => onDragMove(e.touches[0].clientX),
          { passive: true },
        );
        track.addEventListener("touchend", onDragEnd);

        // Mouse (desktop) — opcional, deixa arrastar com o mouse também
        track.addEventListener("mousedown", (e) => {
          onDragStart(e.clientX);
          e.preventDefault();
        });
        window.addEventListener("mousemove", (e) => {
          if (isDragging) onDragMove(e.clientX);
        });
        window.addEventListener("mouseup", () => {
          if (isDragging) onDragEnd();
        });

        // Impede que o clique no link dispare quando o usuário arrastou
        cards.forEach((card) => {
          card.addEventListener("click", (e) => {
            if (Math.abs(dragDelta) > 5) e.preventDefault();
          });
        });

        // Teclado (← →)
        carousel.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") goTo(currentIndex - 1);
          if (e.key === "ArrowRight") goTo(currentIndex + 1);
        });

        // Resize
        let resizeTimer;
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(rebuild, 120);
        });

        // Init
        rebuild();
      })();


      // ── Entrance animations ──────────────────────────────
      document
        .querySelectorAll(
          ".hero__headline, .hero__testimonial, .hero__experience, .hero__photo-wrap",
        )
        .forEach((el, i) => {
          el.style.cssText += `opacity:0;transform:translateY(22px);
        transition:opacity .65s ease ${(i * 0.11 + 0.1).toFixed(2)}s,
                   transform .65s ease ${(i * 0.11 + 0.1).toFixed(2)}s`;
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }),
          );
        });

      // ── Hamburger / drawer ───────────────────────────────
      const btn = document.getElementById("hamburger");
      const drawer = document.getElementById("drawer");
      btn.addEventListener("click", () => {
        const open = drawer.classList.toggle("is-open");
        btn.classList.toggle("is-active", open);
        drawer.setAttribute("aria-hidden", String(!open));
      });
      drawer.querySelectorAll("a, button").forEach((el) =>
        el.addEventListener("click", () => {
          drawer.classList.remove("is-open");
          btn.classList.remove("is-active");
          drawer.setAttribute("aria-hidden", "true");
        }),
      );
