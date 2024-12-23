console.log("Content script loaded.");

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "injectSubtitles" && message.subtitles) {
    console.log("Received subtitles. Injecting...");
    injectSubtitles(message.subtitles);
  }
});

const injectSubtitles = (srt) => {
  const videoPlayer = document.querySelector('video');
  if (!videoPlayer) {
    console.error("Video player not found!");
    return;
  }

  const parseSRTtoVTT = (srt) => {
    let vtt = "WEBVTT\n\n";
    const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n([\s\S]*?)(?=\n\n|\n$)/g;
    let match;
    while ((match = regex.exec(srt)) !== null) {
      const start = match[2].replace(',', '.');
      const end = match[3].replace(',', '.');
      const text = match[4].replace(/\n/g, '\n');
      vtt += `${start} --> ${end}\n${text}\n\n`;
    }
    return vtt;
  };

  const addSubtitleTrack = (vttContent) => {
    const existingTrack = document.querySelector('track[label="Custom Subtitles"]');
    if (existingTrack) existingTrack.remove();

    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = 'Custom Subtitles';
    track.src = URL.createObjectURL(new Blob([vttContent], { type: 'text/vtt' }));
    track.default = true;

    videoPlayer.appendChild(track);

    console.log("Subtitles track added!");

    // Ensure the track is displayed
    const tracks = videoPlayer.textTracks;
    if (tracks.length > 0) {
      console.log("Forcing subtitles to display...");
      tracks[0].mode = 'showing';
    }
  };

  const vtt = parseSRTtoVTT(srt);
  addSubtitleTrack(vtt);
};
