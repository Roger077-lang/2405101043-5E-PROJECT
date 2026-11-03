/* Jam */
function updateClock() {
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 30000);