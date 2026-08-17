(() => {
  const switchImageExtension = (image) => {
    const source = image.currentSrc || image.src;
    if (image.dataset.assetFormatFallbackUsed === "true") return;

    const replacement = /\.png(?=([?#]|$))/i.test(source)
      ? ".jpg"
      : /\.jpg(?=([?#]|$))/i.test(source)
        ? ".png"
        : null;
    if (!replacement) return;

    image.dataset.assetFormatFallbackUsed = "true";
    image.src = source.replace(/\.(png|jpg)(?=([?#]|$))/i, replacement);
  };

  document.addEventListener("error", (event) => {
    if (event.target instanceof HTMLImageElement) switchImageExtension(event.target);
  }, true);

  const retryFailedImages = () => {
    document.querySelectorAll("img").forEach((image) => {
      if (image.complete && image.naturalWidth === 0) switchImageExtension(image);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", retryFailedImages, { once: true });
  } else {
    retryFailedImages();
  }
})();
