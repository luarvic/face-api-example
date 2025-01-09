const webcamElement = document.getElementById('webcam');
const webcam = new Webcam(webcamElement, 'user');
const modelPath = 'models';
let currentStream;
let displaySize;
let convas;
let faceDetection;
let labeledFaceDescriptors;

// Load labeled images for face recognition
async function loadLabeledImages() {
  const labels = [
    'Amy Adams',
    'Austin Butler',
    'Bryce Dallas Howard',
    'Carey Mulligan',
    'Chord Overstreet',
    'Christina Hendricks',
    'Coco Jones',
    'Daniel Radcliffe',
    'Dax Shepard',
    'Elijah Wood',
    'Elizabeth Banks',
    'Emma Watson',
    'Eva Longoria',
    'Eva Mendes',
    'Henry Cavill',
    'Isla Fisher',
    'Jaime Pressly',
    'Javier Bardem',
    'Jeffrey Dean Morgan',
    'Jennifer Hudson',
    'Jessica Chastain',
    'John Krasinski',
    'Jordin Sparks',
    'Joshua Jackson',
    'Julie Bowen',
    'Kiernan Shipka',
    'Logan Marshall-Green',
    'Margot Robbie',
    'Matt Bomer',
    'Meg Ryan',
    'Michelle Williams',
    'Mila Kunis',
    'Rosario Dawson',
    'Sarah Hyland',
    'Steve Carell',
    'Tom Hardy',
    'Zach Braff'
  ]; // Replace with actual labels
  return Promise.all(
    labels.map(async (label) => {
      const img = await faceapi.fetchImage(`/labeled_images/${label}.jpg`);
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      if (!detections) throw new Error(`No face detected for ${label}`);
      return new faceapi.LabeledFaceDescriptors(label, [detections.descriptor]);
    })
  );
}

$("#webcam-switch").change(function () {
  if (this.checked) {
    webcam.start()
      .then(result => {
        cameraStarted();
        webcamElement.style.transform = "";
        console.log("webcam started");
      })
      .catch(err => {
        displayError();
      });
  }
  else {
    cameraStopped();
    webcam.stop();
    console.log("webcam stopped");
  }
});

$('#cameraFlip').click(function () {
  webcam.flip();
  webcam.start()
    .then(result => {
      webcamElement.style.transform = "";
    });
});

$("#webcam").bind("loadedmetadata", function () {
  displaySize = { width: this.scrollWidth, height: this.scrollHeight }
});

$("#detection-switch").change(async function () {
  if (this.checked) {
    toggleContrl("recognition-switch", true);
    toggleContrl("landmarks-switch", true);
    toggleContrl("expression-switch", true);
    toggleContrl("age-gender-switch", true);
    $(".loading").removeClass('d-none');

    await faceapi.nets.ssdMobilenetv1.load(modelPath);
    await faceapi.nets.faceRecognitionNet.load(modelPath);
    await faceapi.nets.faceLandmark68Net.load(modelPath);
    await faceapi.nets.tinyFaceDetector.load(modelPath);
    await faceapi.nets.faceLandmark68TinyNet.load(modelPath);
    await faceapi.nets.faceExpressionNet.load(modelPath);
    await faceapi.nets.ageGenderNet.load(modelPath);
    labeledFaceDescriptors = await loadLabeledImages();

    createCanvas();
    startDetection();
  }
  else {
    clearInterval(faceDetection);
    toggleContrl("recognition-switch", false);
    toggleContrl("landmarks-switch", false);
    toggleContrl("expression-switch", false);
    toggleContrl("age-gender-switch", false);
    if (typeof canvas !== "undefined") {
      setTimeout(function () {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      }, 1000);
    }
  }
});

function createCanvas() {
  if (document.getElementsByTagName("canvas").length == 0) {
    canvas = faceapi.createCanvasFromMedia(webcamElement)
    document.getElementById('webcam-container').append(canvas)
    faceapi.matchDimensions(canvas, displaySize)
  }
}

function toggleContrl(id, show) {
  if (show) {
    $("#" + id).prop('disabled', false);
    $("#" + id).parent().removeClass('disabled');
  } else {
    $("#" + id).prop('checked', false).change();
    $("#" + id).prop('disabled', true);
    $("#" + id).parent().addClass('disabled');
  }
}

function startDetection() {
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  faceDetection = setInterval(async () => {
    const detections = await faceapi.detectAllFaces(webcamElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    if ($("#recognition-switch").is(":checked")) {
      resizedDetections.forEach(result => {
        const { descriptor } = result
        const bestMatch = faceMatcher.findBestMatch(descriptor);
        new faceapi.draw.DrawTextField(
          [
            bestMatch.label,
            faceapi.round(bestMatch.distance)
          ],
          result.detection.box.topRight
        ).draw(canvas)
      })
    }
    if ($("#landmarks-switch").is(":checked")) {
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    }
    if ($("#expression-switch").is(":checked")) {
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }
    if ($("#age-gender-switch").is(":checked")) {
      resizedDetections.forEach(result => {
        const { age, gender, genderProbability } = result
        new faceapi.draw.DrawTextField(
          [
            `${faceapi.round(age, 0)} years`,
            `${gender} (${faceapi.round(genderProbability)})`
          ],
          result.detection.box.bottomRight
        ).draw(canvas)
      })
    }

    if (!$(".loading").hasClass('d-none')) {
      $(".loading").addClass('d-none')
    }
  }, 300)
}

function cameraStarted() {
  toggleContrl("detection-switch", true);
  $("#errorMsg").addClass("d-none");
  if (webcam.webcamList.length > 1) {
    $("#cameraFlip").removeClass('d-none');
  }
}

function cameraStopped() {
  toggleContrl("detection-switch", false);
  $("#errorMsg").addClass("d-none");
  $("#cameraFlip").addClass('d-none');
}

function displayError(err = '') {
  if (err != '') {
    $("#errorMsg").html(err);
  }
  $("#errorMsg").removeClass("d-none");
}