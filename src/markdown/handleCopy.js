function handleCopy(codeBlockId) {
  const parentElement = document.getElementById(codeBlockId);

  if (!parentElement) {
    return;
  }

  const nestedChild = parentElement.querySelector("pre code");
  let codeText = "";
  [...(nestedChild?.children || [])].forEach((line) => {
    codeText += `\n${line.textContent}`;
  });
  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      setTimeout(() => console.log("success"), 2000);
    })
    .catch((err) => console.error("Failed to copy:", err));
}

export default handleCopy;
