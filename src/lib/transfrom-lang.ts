
function transformLang(lang: string) {
    if (["console", "powershell"].includes(lang)) {
      return "terminal";
    }
    if (lang.toLocaleLowerCase() === "jsx") {
      return "JSX";
    }
  
    return lang;
  }

  export default transformLang