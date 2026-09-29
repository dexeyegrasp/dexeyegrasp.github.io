"use strict";

document.querySelectorAll("[data-play-group]").forEach((button) => {
  const gallery = document.getElementById(button.dataset.playGroup);
  const videos = [...gallery.querySelectorAll("video")];
  const status = document.getElementById(gallery.id + "-status");
  button.hidden = false;
  const updateLabel = () => {
    const playing = videos.some((video) => !video.paused && !video.ended);
    button.textContent = playing ? "Pause all" : videos.some((video) => video.currentTime > 0) ? "Replay all six" : "Play all six";
  };
  button.addEventListener("click", async () => {
    if (videos.some((video) => !video.paused && !video.ended)) {
      videos.forEach((video) => video.pause());
      status.textContent = "All six clips paused. You can also use each video's controls.";
      updateLabel();
      return;
    }
    button.disabled = true;
    status.textContent = "Starting all six clips…";
    const results = await Promise.allSettled(videos.map((video) => {
      video.muted = true;
      video.currentTime = 0;
      return video.play();
    }));
    button.disabled = false;
    status.textContent = results.some((result) => result.status === "rejected")
      ? "Some clips could not start. Use the individual video controls to play them."
      : "All six clips started. Each plays once at normal speed and holds its final frame.";
    updateLabel();
  });
  videos.forEach((video) => {
    ["play", "pause", "ended"].forEach((event) => video.addEventListener(event, updateLabel));
    video.addEventListener("error", () => {
      status.textContent = "A clip could not load. Please reload or use its download link.";
    });
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) document.querySelectorAll("video").forEach((video) => video.pause());
});

const copyButton = document.getElementById("copy-bibtex");
const citation = document.getElementById("bibtex-content");
const copyStatus = document.getElementById("copy-status");
let copyTimer;
copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  clearTimeout(copyTimer);
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(citation.textContent);
    copyButton.querySelector("span").textContent = "Copied!";
    copyStatus.textContent = "BibTeX copied to clipboard.";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(citation);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = "Citation selected. Press Ctrl+C (or ⌘C) to copy.";
  }
  copyTimer = setTimeout(() => {
    copyButton.querySelector("span").textContent = "Copy";
    copyStatus.textContent = "";
  }, 5000);
});

const dialog = document.getElementById("image-dialog");
const dialogImage = document.getElementById("dialog-image");
if (typeof dialog.showModal === "function") {
  document.querySelectorAll("[data-zoom]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const original = link.querySelector("img");
      dialogImage.src = link.href;
      dialogImage.alt = original.alt;
      document.getElementById("dialog-caption").textContent = original.alt;
      dialog.showModal();
      document.body.classList.add("modal-open");
    });
  });
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
}
