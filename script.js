const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const countdownElement = document.getElementById('countdown');
const galleryElement = document.getElementById('gallery');
const startButton = document.getElementById('start');
const colorPicker = document.getElementById('color-picker');
const frameColorInput = document.getElementById('frameColor');
const applyFrameButton = document.getElementById('apply-frame');
const downloadButton = document.getElementById('download');
const flashElement = document.getElementById('flash');
const context = canvas.getContext('2d');

let photos = [];
let countdown;

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((err) => {
    console.error("Error accessing the camera: ", err);
  });

// Start photobooth
startButton.addEventListener('click', () => {
  photos = [];
  galleryElement.innerHTML = '';
  colorPicker.style.display = 'none';
  downloadButton.style.display = 'none';
  capturePhotos();
});

function capturePhotos() {
  let photoCount = 0;
  const totalPhotos = 4;

  function capture() {
    if (photoCount >= totalPhotos) {
      colorPicker.style.display = 'block';
      return;
    }

    countdownElement.textContent = 3;
    let count = 3;

    countdown = setInterval(() => {
      count--;
      countdownElement.textContent = count;

      if (count === 0) {
        clearInterval(countdown);
        countdownElement.textContent = '';
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        photos.push(canvas.toDataURL('image/png'));
        photoCount++;
        flashElement.style.animation = 'none';
        setTimeout(() => {
          flashElement.style.animation = 'flash 0.5s ease-in-out';
        }, 10);
        capture();
      }
    }, 1000);
  }

  capture();
}

applyFrameButton.addEventListener('click', () => {
  const frameColor = frameColorInput.value;
  galleryElement.innerHTML = photos
    .map(
      (photo) => `
        <img src="${photo}" style="border-color: ${frameColor};">
      `
    )
    .join('');
  downloadButton.style.display = 'block';
});

// Download final photo
downloadButton.addEventListener('click', () => {
  const finalCanvas = document.createElement('canvas');
  const finalContext = finalCanvas.getContext('2d');
  finalCanvas.width = canvas.width * 4 + 30;
  finalCanvas.height = canvas.height + 20;

  photos.forEach((photo, index) => {
    const img = new Image();
    img.src = photo;
    img.onload = () => {
      finalContext.drawImage(img, index * (canvas.width + 10), 10, canvas.width, canvas.height);
      if (index === photos.length - 1) {
        const link = document.createElement('a');
        link.download = 'photoshoji-photo.png';
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
      }
    };
  });
});