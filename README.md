# Face detection and recognition from a webcam in a browser
This app detects and recognizes individuals listed under `.\labeled_images` from a webcam in a browser using the JavaScript library [face-api.js](https://github.com/justadudewhohacks/face-api.js).

## How to run it locally

1. Clone the repo.
2. Open `index.html` in a web browser.

## How to add more individuals that can be recognized

1. Copy a new person image to `.\labeled_images` directory. Make sure the image has `.jpg` extension.
2. Add the image name (without extension) to `labels` array in `.\js\face-detection.js`.
3. Refresh `index.html` page in a web browser.
