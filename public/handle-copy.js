function handleCopy(codeBlockId, buttonId) {
  const parentElement = document.getElementById(codeBlockId);
  const copyButton = document.getElementById(buttonId);
  const codeBlock = parentElement.querySelector("pre code");
  const doneIcon = document.querySelector("#done");
  const copyIcon = document.querySelector("#copy");

  doneIcon.classList.remove("hidden");
  copyIcon.classList.add("hidden");

  console.log("copyButton", copyButton);
  let codeText = "";
  [...(codeBlock?.children || [])].forEach((line) => {
    codeText += `\n${line.textContent}`;
  });
  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      setTimeout(() => {
        doneIcon.classList.add("hidden");
        copyIcon.classList.remove("hidden");
      }, 2000);
    })
    .catch((err) => console.error("Failed to copy:", err));
}
