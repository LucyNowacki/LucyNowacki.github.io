document.addEventListener("DOMContentLoaded", () => {
    const heroOverlay = document.querySelector(".hero-overlay");
  
    function checkOverflow() {
      return (
        heroOverlay.scrollWidth > heroOverlay.clientWidth ||
        heroOverlay.scrollHeight > heroOverlay.clientHeight
      );
    }
  
    function adjustOverlay() {
      if (checkOverflow()) {
        heroOverlay.style.left = "50%";
      } else {
        heroOverlay.style.left = "70%";
      }
    }
  
    adjustOverlay();
    window.addEventListener("resize", adjustOverlay);
  });
  