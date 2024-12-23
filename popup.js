document.getElementById('apply-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('subtitle-file');
    if (fileInput.files.length === 0) {
      alert("Please select an .srt file!");
      return;
    }
  
    const file = fileInput.files[0];
    const reader = new FileReader();
  
    reader.onload = () => {
      const subtitles = reader.result;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "injectSubtitles", subtitles });
        console.log("Message sent to content script.");
      });
    };
  
    reader.readAsText(file);
  });
  