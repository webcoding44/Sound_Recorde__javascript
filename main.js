const recordButton = document.querySelector(".record");
const soundsContainer = document.querySelector(".soundsContainer");
const recordIcon = document.querySelector(".record-icon");

let audioContext;

const initializeMedia = () => {
  if (!navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia not supported!");
    return;
  }

  const constraints = { audio: true };
  let audioChunks = [];

  const handleSuccess = (stream) => {
    const mediaRecorder = new MediaRecorder(stream);
    visualizeAudio(stream);

    recordButton.addEventListener("click", () =>
      toggleRecording(mediaRecorder)
    );

    mediaRecorder.addEventListener("stop", () => {
      const audioClip = createAudioClip(audioChunks);
      soundsContainer.appendChild(audioClip);
      audioChunks = [];
    });

    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });
  };

  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess);
};

const toggleRecording = (mediaRecorder) => {
  if (recordButton.classList.contains("record")) {
    mediaRecorder.start();
    updateUIForRecording(true);
  } else {
    mediaRecorder.stop();
    updateUIForRecording(false);
  }
};

const updateUIForRecording = (isRecording) => {
  recordButton.classList.toggle("recording", isRecording);
  recordButton.classList.toggle("record", !isRecording);
  recordIcon.src = isRecording
    ? "./assets/end-symbol.svg"
    : "./assets/recording-symbol.svg";
};

const createAudioClip = (audioChunks) => {
  const clipContainer = document.createElement("article");
  const audioElement = document.createElement("audio");

  clipContainer.classList.add("clip");
  audioElement.setAttribute("controls", "");
  clipContainer.appendChild(audioElement);

  const audioBlob = new Blob(audioChunks, { type: "audio/ogg; codecs=opus" });
  const audioURL = URL.createObjectURL(audioBlob);
  audioElement.src = audioURL;

  return clipContainer;
};

const visualizeAudio = (stream) => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const audioSource = audioContext.createMediaStreamSource(stream);
  const audioAnalyser = audioContext.createAnalyser();

  audioAnalyser.fftSize = 2048;
  audioSource.connect(audioAnalyser);
};

initializeMedia();
