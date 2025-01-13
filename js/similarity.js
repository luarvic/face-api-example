const modelPath = 'models';
let labeledFaceDescriptors;

async function compareImages() {
  const img1 = document.getElementById('img1');
  const detection0 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
  const img2 = document.getElementById('img2');
  const detection1 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();
  const distance = faceapi.euclideanDistance(detection0.descriptor, detection1.descriptor);
  const distanceParagraph = document.getElementById('distance');
  distanceParagraph.innerText = `Distance: ${distance.toFixed(2)}`
}

(async () => {
  await faceapi.nets.ssdMobilenetv1.load(modelPath);
  await faceapi.nets.faceRecognitionNet.load(modelPath);
  await faceapi.nets.faceLandmark68Net.load(modelPath);
  await faceapi.nets.tinyFaceDetector.load(modelPath);
  await faceapi.nets.faceLandmark68TinyNet.load(modelPath);
  await faceapi.nets.faceExpressionNet.load(modelPath);
  await faceapi.nets.ageGenderNet.load(modelPath);
  await compareImages();
})();
