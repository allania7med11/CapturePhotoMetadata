// Ensure you load config.js in your HTML file before this script

const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const uploadButton = document.getElementById('uploadButton');
const status = document.getElementById('status');
const metadataList = document.getElementById('metadataList');
let imageFile, metadata = {};

// EXIF fields we want to display and upload
const importantFields = [
  'ImageWidth', 'ImageHeight', 'Make', 'Model', 'Orientation',
  'XResolution', 'YResolution', 'DateTime', 'ExposureTime', 'FNumber',
  'ISOSpeedRatings', 'ShutterSpeedValue', 'ApertureValue', 'BrightnessValue',
  'MeteringMode', 'FocalLength', 'WhiteBalance', 'FocalLengthIn35mmFilm',
  'Flash', 'GPSLatitudeRef', 'GPSLatitude', 'GPSLongitudeRef', 'GPSLongitude',
  'GPSAltitude', 'GPSDateStamp'
];

fileInput.addEventListener('change', (event) => {
  imageFile = event.target.files[0];
  
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(imageFile);

  EXIF.getData(imageFile, function() {
    const allMetadata = EXIF.getAllTags(this);
    metadata = filterImportantMetadata(allMetadata); // Filter only important metadata
    displayMetadata(metadata);
  });

  uploadButton.style.display = 'inline-block';
});

function filterImportantMetadata(allMetadata) {
  const filteredMetadata = {};
  importantFields.forEach((field) => {
    if (allMetadata[field] !== undefined) {
      filteredMetadata[field] = allMetadata[field];
    }
  });
  return filteredMetadata;
}

function displayMetadata(metadata) {
  metadataList.innerHTML = '';

  for (const [key, value] of Object.entries(metadata)) {
    const li = document.createElement('li');
    li.textContent = `${key}: ${value}`;
    metadataList.appendChild(li);
  }
}

uploadButton.addEventListener('click', () => {
  if (!imageFile) return;

  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('context', `metadata=${JSON.stringify(metadata)}`);

  status.textContent = 'Uploading...';

  fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    status.textContent = `Upload Successful! Image URL: ${data.secure_url}`;
    preview.src = data.secure_url;
  })
  .catch((e) => {
    status.textContent = `Upload Failed! ${e}`;
  });
});
