// Basic interaction script

document.addEventListener("DOMContentLoaded", () => {
  console.log("Report Card Loaded");

  // Add 3D tilt effect to the main container for premium feel (Desktop only)
  const card = document.querySelector(".max-w-\\[210mm\\]");

  if (
    window.matchMedia("(min-width: 1024px)").matches &&
    card &&
    !window.matchMedia("print").matches
  ) {
    // Simple tilt effect on mouse move over the "page"
    // Disabled for now to keep text crisp, but prepared for future animation

    // Example: Add subtle fade-in on load
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 100);
  }
});
