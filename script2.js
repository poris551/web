document.addEventListener("DOMContentLoaded", () => {
  const shell = document.querySelector(".crt-shell");
  const screen = document.querySelector(".crt-screen");
  const screenContent = document.querySelector(".screen-content");
  const stage = document.querySelector(".crt-stage");
  const cards = [...document.querySelectorAll(".tape-card")];

  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  let ticking = false;

  function updateScrollEffects() {
    ticking = false;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const stageHeight = Math.max(stage.offsetHeight - vh, 1);
    const progress = clamp(scrollY / stageHeight);
    const movePhase = clamp(progress / 0.62);
    const scale = lerp(1, 0.78, movePhase);
    const rotateX = lerp(0, 8.5, movePhase);
    const translateY = lerp(0, 56, movePhase);
    const shellOpacity = lerp(1, 0.90, movePhase);

    shell.style.transform =
      `translate3d(0, ${translateY}px, 0) rotateX(${rotateX}deg) scale(${scale})`;
    shell.style.opacity = shellOpacity.toFixed(3);


    const collapse = clamp((progress - 0.58) / 0.30);
    const screenScaleY = lerp(1, 0.035, collapse);
    const screenScaleX = lerp(1, 0.985, collapse);

    screen.style.transform = `scale(${screenScaleX}, ${screenScaleY})`;
    screenContent.style.opacity = String(1 - clamp(collapse * 1.55));
    screenContent.style.filter = `blur(${lerp(0, 2.8, collapse)}px)`;

    const offPhase = clamp((progress - 0.91) / 0.09);
    screen.style.opacity = String(1 - offPhase * 0.96);
    screen.style.filter = `brightness(${lerp(1, 0.25, offPhase)})`;

    const center = vh / 2;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const distance = clamp((cardCenter - center) / vh, -1, 1);
      const side = i % 2 === 0 ? 1 : -1;

      const x = distance * 8 * side;
      const r = distance * 0.35 * side;

      if (card.classList.contains("active")) {
        card.style.transform = `translate3d(${x}px, 0, 0) rotate(${r}deg)`;
      }
    });
  }

  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateScrollEffects();

  const revealItems = document.querySelectorAll(".section-reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -7% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  requestAnimationFrame(() => {
    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.9) {
        item.classList.add("active");
      }
    });
  });

  const copyBtn = document.getElementById("copyBtn");
  const copyText = document.getElementById("copyText");
  const copyToast = document.getElementById("copyToast");

  let toastTimer;

  copyBtn?.addEventListener("click", async () => {
    const text = copyText?.textContent?.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    if (copyToast) {
      clearTimeout(toastTimer);
      copyToast.classList.add("show");
      toastTimer = setTimeout(() => {
        copyToast.classList.remove("show");
      }, 1800);
    }
  });
});
