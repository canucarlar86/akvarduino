(() => {
  const head = document.getElementsByTagName("head")[0];
  const weights = ["regular", "thin", "light", "bold", "fill", "duotone"];

  weights.forEach((weight) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `lib/phosphor/${weight}.css`;
    head.appendChild(link);
  });
})();
