(() => {
  const imageSources = [
    "assets/aigc-detail/01.png",
    "assets/aigc-detail/02.png",
    "assets/aigc-detail/03.png",
    "assets/aigc-detail/04.png",
    "assets/aigc-detail/05.png"
  ];

  const overlay = document.createElement("div");
  overlay.className = "aigc-detail-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "AIGC 工作项目详情");
  overlay.innerHTML = `
    <button class="aigc-detail-close" type="button" aria-label="关闭详情页">×</button>
    <div class="aigc-detail-images">
      ${imageSources.map((src, index) =>
        `<img src="${src}" alt="AIGC 工作项目详情图 ${index + 1}" loading="${index === 0 ? "eager" : "lazy"}">`
      ).join("")}
    </div>
  `;
  document.body.appendChild(overlay);

  const closeButton = overlay.querySelector(".aigc-detail-close");

  function openDetail() {
    overlay.classList.add("is-open");
    document.body.classList.add("aigc-detail-open");
    overlay.scrollTop = 0;
    closeButton.focus();
  }

  function closeDetail() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("aigc-detail-open");
  }

  function findAigcCard(target) {
    const card = target.closest("#archive article");
    return card && card.textContent.includes("AIGC工作项目") ? card : null;
  }

  document.addEventListener("click", (event) => {
    const card = findAigcCard(event.target);
    if (!card) return;

    const isThumbnail = Boolean(event.target.closest("a, img"));
    const isMore = event.target.textContent.trim().includes("查看更多");
    if (!isThumbnail && !isMore) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openDetail();
  }, true);

  closeButton.addEventListener("click", closeDetail);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeDetail();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) closeDetail();
  });
})();
