const recentStrip = document.querySelector(".recent-strip");
const lightbox = document.querySelector(".image-lightbox");
const lightboxImage = document.querySelector(".image-lightbox img");
const lightboxClose = document.querySelector(".lightbox-close");
const heroVideo = document.querySelector("#heroVideo");
const gdcScreen = document.querySelector(".gdc-screen");
const gdcImages = [...document.querySelectorAll(".gdc-img")];
const posterScreen = document.querySelector(".poster-screen");
const posterFan = document.querySelector(".poster-fan");
const posterCopy = document.querySelector(".poster-copy");
const posterImages = [...document.querySelectorAll(".poster-fan img")];
const ipCarouselScreen = document.querySelector(".ip-carousel-screen");
const carStoryScreen = document.querySelector(".car-story-screen");
const seasonScreen = document.querySelector(".season-screen");
window.__heroVideoFound = Boolean(heroVideo);

if (seasonScreen) {
  const seasonSlides = Array.from(seasonScreen.querySelectorAll(".season-slide"));
  let activeSeasonIndex = 0;
  let seasonTimer = 0;

  const showSeason = (index) => {
    if (!seasonSlides.length) return;
    activeSeasonIndex = (index + seasonSlides.length) % seasonSlides.length;
    seasonSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSeasonIndex;
      slide.classList.toggle("is-active", isActive);
    });
  };

  const startSeasonCarousel = () => {
    window.clearInterval(seasonTimer);
    seasonTimer = window.setInterval(() => showSeason(activeSeasonIndex + 1), 2400);
  };

  showSeason(0);
  startSeasonCarousel();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.clearInterval(seasonTimer);
    else startSeasonCarousel();
  });
}

if (ipCarouselScreen) {
  const ipCarouselSlides = Array.from(ipCarouselScreen.querySelectorAll(".ip-carousel-slide"));
  const ipCarouselButtons = Array.from(ipCarouselScreen.querySelectorAll(".ip-carousel-controls button"));
  let activeIpCarouselIndex = 0;
  let ipCarouselTimer = 0;

  const showIpCarouselSlide = (index) => {
    if (!ipCarouselSlides.length) return;
    activeIpCarouselIndex = (index + ipCarouselSlides.length) % ipCarouselSlides.length;
    ipCarouselSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIpCarouselIndex);
    });
    ipCarouselButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeIpCarouselIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const restartIpCarousel = () => {
    window.clearInterval(ipCarouselTimer);
    ipCarouselTimer = window.setInterval(() => {
      showIpCarouselSlide(activeIpCarouselIndex + 1);
    }, 3200);
  };

  ipCarouselButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      showIpCarouselSlide(index);
      restartIpCarousel();
    });
  });

  showIpCarouselSlide(0);
  restartIpCarousel();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) window.clearInterval(ipCarouselTimer);
    else restartIpCarousel();
  });
}

if (carStoryScreen) {
  const detailPanel = carStoryScreen.querySelector(".car-story-detail");
  const clampStory = (value, min, max) => Math.min(max, Math.max(min, value));
  let storyTicking = false;

  const renderCarStory = () => {
    storyTicking = false;
    if (!detailPanel) return;

    if (window.matchMedia("(max-width: 900px)").matches) {
      detailPanel.style.transform = "none";
      return;
    }

    const rect = carStoryScreen.getBoundingClientRect();
    const travel = Math.max(1, carStoryScreen.offsetHeight - window.innerHeight);
    const progress = clampStory(-rect.top / travel, 0, 1);
    const startOffset = window.innerHeight * 0.321;
    const endOffset = -detailPanel.offsetHeight;
    const currentOffset = startOffset + (endOffset - startOffset) * progress;
    detailPanel.style.transform = `translate3d(0, ${currentOffset.toFixed(2)}px, 0)`;
  };

  const requestCarStory = () => {
    if (storyTicking) return;
    storyTicking = true;
    requestAnimationFrame(renderCarStory);
  };

  window.addEventListener("scroll", requestCarStory, { passive: true });
  window.addEventListener("resize", requestCarStory);
  renderCarStory();
}

if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.loop = false;
  heroVideo.playsInline = true;
  heroVideo.pause();

  const scrollVideoSections = [
    document.querySelector("#home"),
    document.querySelector("#cv"),
    document.querySelector("#work"),
  ].filter(Boolean);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let heroVideoTicking = false;
  let heroVideoPrimed = false;

  function syncHeroVideo() {
    heroVideoTicking = false;
    if (!scrollVideoSections.length || !Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const firstSection = scrollVideoSections[0];
    const lastSection = scrollVideoSections[scrollVideoSections.length - 1];
    const start = firstSection.offsetTop;
    const end = Math.max(
      start + 1,
      lastSection.offsetTop + lastSection.offsetHeight - window.innerHeight,
    );
    const progress = clamp((scrollTop - start) / (end - start), 0, 1);
    const safeDuration = Math.max(heroVideo.duration - 0.05, 0);
    const safeTime = clamp(progress * safeDuration, 0, safeDuration);

    window.__heroVideoDebug = {
      safeTime,
      progress,
      scrollTop,
      start,
      end,
      duration: heroVideo.duration,
      readyState: heroVideo.readyState,
    };
    heroVideo.dataset.scrollTime = safeTime.toFixed(2);
    if (Math.abs(heroVideo.currentTime - safeTime) > 0.035) {
      heroVideo.currentTime = safeTime;
    }
    if (!heroVideo.paused) heroVideo.pause();
    heroVideo.dataset.actualTime = heroVideo.currentTime.toFixed(2);
  }

  const requestSyncHeroVideo = () => {
    if (heroVideoTicking) return;
    heroVideoTicking = true;
    requestAnimationFrame(syncHeroVideo);
  };
  const primeHeroVideo = () => {
    if (heroVideoPrimed) {
      syncHeroVideo();
      return;
    }
    heroVideoPrimed = true;
    const afterPrime = () => {
      heroVideo.pause();
      syncHeroVideo();
    };
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(afterPrime).catch(afterPrime);
    } else {
      afterPrime();
    }
  };
  heroVideo.addEventListener("loadedmetadata", syncHeroVideo, { once: true });
  heroVideo.addEventListener("loadeddata", syncHeroVideo, { once: true });
  heroVideo.addEventListener("canplay", primeHeroVideo, { once: true });
  window.addEventListener("scroll", requestSyncHeroVideo, { passive: true });
  window.addEventListener("resize", requestSyncHeroVideo);
  window.addEventListener("pointerdown", requestSyncHeroVideo, { once: true });
  if (heroVideo.readyState >= 1) syncHeroVideo();
  else heroVideo.load();
  window.setTimeout(syncHeroVideo, 250);
  window.setTimeout(requestSyncHeroVideo, 900);
}

if (recentStrip) {
  recentStrip.innerHTML += recentStrip.innerHTML;

  let startX = 0;
  let lastX = 0;
  let dragDistance = 0;
  let carouselOffset = 0;
  let carouselWidth = 0;
  let lastFrameTime = performance.now();
  let dragging = false;
  const carouselSpeed = 58;

  function measureCarousel() {
    carouselWidth = recentStrip.scrollWidth / 2;
  }

  function normalizeCarouselOffset() {
    if (!carouselWidth) return;
    while (carouselOffset <= -carouselWidth) carouselOffset += carouselWidth;
    while (carouselOffset > 0) carouselOffset -= carouselWidth;
  }

  function renderCarousel() {
    normalizeCarouselOffset();
    recentStrip.style.transform = `translate3d(${carouselOffset}px, 0, 0)`;
  }

  function animateCarousel(now) {
    const delta = Math.min((now - lastFrameTime) / 1000, 0.08);
    lastFrameTime = now;
    if (!dragging) {
      carouselOffset -= carouselSpeed * delta;
      renderCarousel();
    }
    requestAnimationFrame(animateCarousel);
  }

  measureCarousel();
  window.addEventListener("load", measureCarousel);
  window.addEventListener("resize", () => {
    measureCarousel();
    renderCarousel();
  });
  requestAnimationFrame(animateCarousel);

  recentStrip.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragDistance = 0;
    startX = event.clientX;
    lastX = event.clientX;
    recentStrip.classList.add("is-dragging");
    recentStrip.setPointerCapture(event.pointerId);
  });

  recentStrip.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const deltaX = event.clientX - lastX;
    dragDistance = event.clientX - startX;
    lastX = event.clientX;
    carouselOffset += deltaX;
    renderCarousel();
  });

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    recentStrip.classList.remove("is-dragging");
    try {
      recentStrip.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }

  recentStrip.addEventListener("pointerup", endDrag);
  recentStrip.addEventListener("pointercancel", endDrag);

  recentStrip.addEventListener("click", (event) => {
    const image = event.target.closest("img");
    if (!image || Math.abs(dragDistance) > 6 || !lightbox || !lightboxImage) return;
    lightboxImage.src = image.src;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
}

if (gdcScreen && gdcImages.length && gdcScreen.classList.contains("gdc-static")) {
  gdcImages.forEach((image) => {
    image.addEventListener("click", () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = image.src;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });
}

if (gdcScreen && gdcImages.length && !gdcScreen.classList.contains("gdc-static")) {
  const gdcCollage = gdcScreen.querySelector(".gdc-collage");
  const orbitAnchors = [
    { x: 31.2, y: 62.8, w: 17.2, b: 0.74, z: 78, blur: 0.34 },
    { x: 39.5, y: 69.2, w: 21.8, b: 0.84, z: 98, blur: 0.22 },
    { x: 50.5, y: 73.3, w: 27.5, b: 0.96, z: 118, blur: 0.08 },
    { x: 61.6, y: 72.6, w: 31.2, b: 1.04, z: 132, blur: 0 },
    { x: 71.7, y: 65.2, w: 25.4, b: 0.9, z: 108, blur: 0.16 },
    { x: 78.4, y: 54.6, w: 18.7, b: 0.74, z: 82, blur: 0.34 },
    { x: 80.5, y: 43.6, w: 14.2, b: 0.58, z: 58, blur: 0.58 },
    { x: 76.8, y: 33.8, w: 10.8, b: 0.48, z: 42, blur: 0.78 },
    { x: 68.8, y: 26.4, w: 9.2, b: 0.42, z: 30, blur: 0.96 },
    { x: 59.4, y: 22.8, w: 8.1, b: 0.38, z: 22, blur: 1.08 },
    { x: 50.6, y: 23.4, w: 8.4, b: 0.38, z: 20, blur: 1.08 },
    { x: 42.8, y: 27.2, w: 9.8, b: 0.43, z: 28, blur: 0.94 },
    { x: 36.3, y: 34.6, w: 11.8, b: 0.5, z: 40, blur: 0.74 },
    { x: 31.7, y: 44.2, w: 14.1, b: 0.6, z: 58, blur: 0.54 },
    { x: 29.8, y: 54.4, w: 16.2, b: 0.69, z: 70, blur: 0.42 },
  ];
  const orbitCount = orbitAnchors.length;
  const orbitSpacing = orbitCount / gdcImages.length;
  const orbitSpeed = 0.13;

  let orbitOffset = 0;
  let lastOrbitTime = performance.now();
  let orbitDragging = false;
  let orbitStartX = 0;
  let orbitStartY = 0;
  let orbitLastX = 0;
  let orbitLastY = 0;
  let orbitDragDistance = 0;

  function clampOrbit(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function mixOrbit(from, to, progress) {
    return from + (to - from) * progress;
  }

  function easeOrbit(progress) {
    return progress * progress * (3 - 2 * progress);
  }

  function slotAt(position) {
    const wrapped = ((position % orbitCount) + orbitCount) % orbitCount;
    const start = Math.floor(wrapped);
    const end = (start + 1) % orbitCount;
    const progress = easeOrbit(wrapped - start);
    const current = orbitAnchors[start];
    const next = orbitAnchors[end];

    return {
      x: mixOrbit(current.x, next.x, progress),
      y: mixOrbit(current.y, next.y, progress),
      w: mixOrbit(current.w, next.w, progress),
      b: mixOrbit(current.b, next.b, progress),
      z: mixOrbit(current.z, next.z, progress),
      blur: mixOrbit(current.blur, next.blur, progress),
    };
  }

  function renderGdcOrbit() {
    gdcImages.forEach((image, index) => {
      const slot = slotAt(index * orbitSpacing + orbitOffset);
      const brightness = clampOrbit(slot.b, 0.34, 1.08);

      image.style.left = `${slot.x.toFixed(3)}%`;
      image.style.top = `${slot.y.toFixed(3)}%`;
      image.style.zIndex = String(Math.round(slot.z));
      image.style.opacity = "1";
      image.style.setProperty("--path-w", `${slot.w.toFixed(3)}%`);
      image.style.setProperty("--path-s", "1");
      image.style.setProperty("--path-r", "0deg");
      image.style.setProperty("--path-bright", brightness.toFixed(3));
      image.style.setProperty("--path-saturate", "1");
      image.style.setProperty("--path-blur", `${slot.blur.toFixed(2)}px`);
    });
  }

  function animateGdcOrbit(now) {
    const delta = Math.min((now - lastOrbitTime) / 1000, 0.08);
    lastOrbitTime = now;
    if (!orbitDragging) {
      orbitOffset -= orbitSpeed * delta;
      renderGdcOrbit();
    }
    requestAnimationFrame(animateGdcOrbit);
  }

  if (gdcCollage) {
    gdcCollage.addEventListener("pointerdown", (event) => {
      orbitDragging = true;
      orbitDragDistance = 0;
      orbitStartX = event.clientX;
      orbitStartY = event.clientY;
      orbitLastX = event.clientX;
      orbitLastY = event.clientY;
      gdcCollage.classList.add("is-dragging");
      gdcCollage.setPointerCapture(event.pointerId);
    });

    gdcCollage.addEventListener("pointermove", (event) => {
      if (!orbitDragging) return;
      const deltaX = event.clientX - orbitLastX;
      orbitDragDistance = Math.hypot(event.clientX - orbitStartX, event.clientY - orbitStartY);
      orbitLastX = event.clientX;
      orbitLastY = event.clientY;
      orbitOffset += deltaX * 0.018;
      renderGdcOrbit();
    });

    function endGdcDrag(event) {
      if (!orbitDragging) return;
      orbitDragging = false;
      gdcCollage.classList.remove("is-dragging");
      try {
        gdcCollage.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released by the browser.
      }
    }

    gdcCollage.addEventListener("pointerup", endGdcDrag);
    gdcCollage.addEventListener("pointercancel", endGdcDrag);

    gdcCollage.addEventListener("click", (event) => {
      const image = event.target.closest(".gdc-img");
      if (!image || orbitDragDistance > 7 || !lightbox || !lightboxImage) return;
      lightboxImage.src = image.src;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  }

  renderGdcOrbit();
  requestAnimationFrame(animateGdcOrbit);
}

if (false && posterScreen && posterFan && posterCopy && posterImages.length) {
  const clampPoster = (value, min, max) => Math.min(max, Math.max(min, value));
  const posterStates = [
    { x: 0, y: 0, r: -11, s: 1, openX: 0, openY: 0, openR: -14, outX: -18, outY: -8, outR: -17 },
    { x: 0, y: 8, r: -5, s: 0.98, openX: 92, openY: 12, openR: -4, outX: 118, outY: -3, outR: -6 },
    { x: 0, y: 16, r: 4, s: 0.96, openX: 172, openY: 34, openR: 13, outX: 218, outY: 26, outR: 17 },
    { x: 0, y: 24, r: 12, s: 0.94, openX: 256, openY: 70, openR: 25, outX: 318, outY: 68, outR: 31 },
  ];
  let posterFrame = 0;

  function easePoster(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function easePosterInOut(value) {
    return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function posterMix(from, to, progress) {
    return from + (to - from) * progress;
  }

  function updatePosterScene() {
    const rect = posterScreen.getBoundingClientRect();
    const viewHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = clampPoster((viewHeight - rect.top) / Math.max(rect.height, 1), 0, 1);
    const open = easePoster(clampPoster(progress / 0.42, 0, 1));
    const settle = easePosterInOut(clampPoster((progress - 0.44) / 0.34, 0, 1));
    const leave = easePosterInOut(clampPoster((progress - 0.72) / 0.28, 0, 1));

    posterFan.style.setProperty("--poster-fan-x", `${posterMix(84, 0, open) + leave * 24}px`);
    posterFan.style.setProperty("--poster-fan-y", `${posterMix(42, 0, open) - leave * 22}px`);
    posterFan.style.setProperty("--poster-fan-scale", (posterMix(0.74, 1, open) + settle * 0.03 + leave * 0.08).toFixed(3));
    posterCopy.style.setProperty("--poster-copy-x", `${posterMix(-18, 0, open) - leave * 26}px`);
    posterCopy.style.setProperty("--poster-copy-y", `${posterMix(28, 0, open) - leave * 10}px`);

    posterImages.forEach((image, index) => {
      const state = posterStates[index] || posterStates[posterStates.length - 1];
      const x = posterMix(state.x, state.openX, open) + (state.outX - state.openX) * leave;
      const y = posterMix(state.y, state.openY, open) + (state.outY - state.openY) * leave;
      const r = posterMix(state.r, state.openR, open) + (state.outR - state.openR) * leave;
      const s = posterMix(state.s * 0.92, state.s, open) + leave * 0.035;
      image.style.setProperty("--poster-x", `${x.toFixed(2)}px`);
      image.style.setProperty("--poster-y", `${y.toFixed(2)}px`);
      image.style.setProperty("--poster-r", `${r.toFixed(2)}deg`);
      image.style.setProperty("--poster-s", s.toFixed(3));
    });
  }

  function requestPosterUpdate() {
    cancelAnimationFrame(posterFrame);
    posterFrame = requestAnimationFrame(updatePosterScene);
  }

  window.addEventListener("scroll", requestPosterUpdate, { passive: true });
  window.addEventListener("resize", requestPosterUpdate);
  requestPosterUpdate();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.removeAttribute("src");
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

const petDetailTriggers = Array.from(document.querySelectorAll(".project-detail-trigger"));
const petDetailTrigger = document.querySelector(".pet-detail-trigger");
const petDetailOverlay = document.querySelector(".pet-detail-overlay");
const petDetailClose = document.querySelector(".pet-detail-close");
const petDetailFrame = document.querySelector(".pet-detail-frame");

function openPetDetail(event) {
  if (!petDetailOverlay) return;
  event?.preventDefault();
  const trigger = event?.currentTarget;
  const detailUrl = trigger?.getAttribute("href");
  const isDragGalleryDetail = detailUrl?.includes("project=yinhe-city");
  petDetailOverlay.classList.toggle("is-drag-detail", Boolean(isDragGalleryDetail));
  if (detailUrl && petDetailFrame) {
    const url = new URL(detailUrl, window.location.href);
    url.searchParams.set("embed", "1");
    url.searchParams.set("fresh", "0721-yinhe-city-smooth-wheel");
    petDetailFrame.src = url.pathname + url.search + url.hash;
    petDetailFrame.title = `${trigger.closest("article")?.querySelector("h3")?.textContent || "项目"}详情`;
  }
  petDetailOverlay.classList.add("is-open");
  petDetailOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("pet-detail-open");
  petDetailClose?.focus();
}

function closePetDetail() {
  if (!petDetailOverlay) return;
  petDetailOverlay.classList.remove("is-open");
  petDetailOverlay.classList.remove("is-drag-detail");
  petDetailOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("pet-detail-open");
  petDetailTrigger?.focus();
}

petDetailTriggers.forEach((trigger) => trigger.addEventListener("click", openPetDetail));
petDetailClose?.addEventListener("click", closePetDetail);
petDetailOverlay?.addEventListener("click", (event) => {
  if (event.target === petDetailOverlay) closePetDetail();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && petDetailOverlay?.classList.contains("is-open")) {
    closePetDetail();
  }
});

(() => {
  const petCards = Array.from(document.querySelectorAll(".pet-replica .pet-orbit .pet-card"));
  if (petCards.length !== 7) return;

  const petSlots = [
    "pet-slot-0",
    "pet-slot-1",
    "pet-slot-2",
    "pet-slot-3",
    "pet-slot-4",
    "pet-slot-5",
    "pet-slot-6",
  ];
  const petLayer = [1, 2, 3, 4, 3, 2, 1];
  const petImages = petCards.map((_, index) => `./assets/screen7/pet-${index + 1}.jpg`);
  const petFlipSlots = new Set([2, 3, 4]);
  const petFlipDuration = 1200;
  const petStepInterval = 2300;
  let petStep = 0;

  petCards.forEach((card, index) => {
    card.dataset.petImageIndex = String(index);
    card.style.setProperty("--pet-card-img", `url('${petImages[index]}')`);
    card.style.setProperty("--pet-card-next-img", `url('${petImages[(index + 3) % petImages.length]}')`);
  });

  function placePetCard(card, index, wrapIndex = -1) {
    const slot = (index + petStep) % petCards.length;
    card.classList.remove(...petSlots);
    card.classList.toggle("pet-wrap", index === wrapIndex);
    card.classList.add(petSlots[slot]);
    card.style.zIndex = String(petLayer[slot]);
    return slot;
  }

  function preparePetFlip(card, index) {
    const currentImageIndex = Number(card.dataset.petImageIndex || index);
    const nextImageIndex = (currentImageIndex + 3) % petImages.length;
    card.style.setProperty("--pet-card-next-img", `url('${petImages[nextImageIndex]}')`);
    card.classList.add("pet-flipping");
    window.setTimeout(() => {
      card.dataset.petImageIndex = String(nextImageIndex);
      card.style.setProperty("--pet-card-img", `url('${petImages[nextImageIndex]}')`);
    }, petFlipDuration / 2);
    window.setTimeout(() => {
      card.classList.remove("pet-flipping");
    }, petFlipDuration + 40);
  }

  function renderPetOrbit(wrapIndex = -1, clearFlip = true) {
    petCards.forEach((card, index) => {
      if (clearFlip) card.classList.remove("pet-flipping");
      placePetCard(card, index, wrapIndex);
    });
    if (wrapIndex >= 0) {
      window.setTimeout(() => {
        petCards[wrapIndex]?.classList.remove("pet-wrap");
      }, 80);
    }
  }

  function advancePetOrbit() {
    const nextStep = (petStep + 1) % petCards.length;
    const wrappingCardIndex = (6 - petStep + petCards.length) % petCards.length;

    petCards.forEach((card, index) => {
      card.classList.remove("pet-flipping");
      const nextSlot = (index + nextStep) % petCards.length;
      const shouldFlip = index !== wrappingCardIndex && petFlipSlots.has(nextSlot);
      if (shouldFlip) preparePetFlip(card, index);
    });

    petStep = nextStep;
    renderPetOrbit(wrappingCardIndex, false);
  }

  renderPetOrbit();
  window.setInterval(advancePetOrbit, petStepInterval);
})();
