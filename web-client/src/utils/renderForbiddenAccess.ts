export default function renderForbiddenAccess() {
  const modalRoot = document.getElementById("modal-root");
  const el = document.createElement("div");
  el.classList.add("modal-container");
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
  el.style.backdropFilter = "blur(5px)";
  el.style.display = "flex";
  el.style.justifyContent = "center";
  el.style.alignItems = "center";
  el.style.zIndex = "1000";

  modalRoot?.appendChild(el);
  const dialog = document.createElement("div");
  dialog.classList.add("modal-dialog");
  dialog.style.backgroundColor = "white";
  dialog.style.padding = "20px";
  dialog.style.borderRadius = "10px";
  dialog.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
  dialog.style.display = "flex";
  dialog.style.flexDirection = "column";
  dialog.style.alignItems = "center";
  dialog.style.justifyContent = "center";
  dialog.style.width = "80%";
  dialog.style.height = "90%";

  const h1 = document.createElement("h1");
  h1.textContent = "Forbidden Access";
  dialog.appendChild(h1);

  const p1 = document.createElement("p");
  p1.textContent = "You don't have permission to this application.";
  dialog.appendChild(p1);

  const p2 = document.createElement("p");
  p2.textContent = "You will be redirected to the main page in 5 seconds.";
  dialog.appendChild(p2);

  el.appendChild(dialog);

  const timer = setTimeout(() => {
    window.location.href = "/";
  }, 50000);

  return () => {
    modalRoot?.removeChild(el);
    clearTimeout(timer);
  };
}
