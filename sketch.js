// Face Mesh Detection with ml5.js  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let faceMesh;
let faces = [];
let bgImg; // 用來存漸層背景

function preload() {
  // Initialize FaceMesh model with a maximum of one face and flipped video input
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
  // Log detected face data tothe console
  console.log(faces);
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight); // 畫布大小為整個視窗
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);

  // 只產生一次漸層背景
  bgImg = createGraphics(width, height);
  setGradientBackground(bgImg);
}

function draw() {
  // 直接顯示背景圖
  image(bgImg, 0, 0, width, height);

  // 將影像畫在視窗正中間，大小為600x600
  let cx = width / 2;
  let cy = height / 2;
  let vw = 800;
  let vh = 800;
  imageMode(CENTER);
  image(video, cx, cy, vw, vh);
  imageMode(CORNER);

  // 確認有偵測到臉
  if (faces.length > 0) {
    let face = faces[0];

    // 計算影像縮放與平移
    let videoW = video.width;
    let videoH = video.height;
    let vw = 800;
    let vh = 800;
    let cx = width / 2;
    let cy = height / 2;
    let scaleX = vw / videoW;
    let scaleY = vh / videoH;
    let offsetX = cx - vw / 2;
    let offsetY = cy - vh / 2;

    // ====== 黑色線與黑色多邊形 ======
    stroke(0);
    strokeWeight(2);
    noFill();

    // 1. 336,297,300 連線
    let p1 = face.keypoints[336];
    let p2 = face.keypoints[297];
    let p3 = face.keypoints[300];
    beginShape();
    vertex(p1.x * scaleX + offsetX, p1.y * scaleY + offsetY);
    vertex(p2.x * scaleX + offsetX, p2.y * scaleY + offsetY);
    vertex(p3.x * scaleX + offsetX, p3.y * scaleY + offsetY);
    endShape();

    // 2. 107,67,70 連線
    let p4 = face.keypoints[107];
    let p5 = face.keypoints[67];
    let p6 = face.keypoints[70];
    beginShape();
    vertex(p4.x * scaleX + offsetX, p4.y * scaleY + offsetY);
    vertex(p5.x * scaleX + offsetX, p5.y * scaleY + offsetY);
    vertex(p6.x * scaleX + offsetX, p6.y * scaleY + offsetY);
    endShape();

    // 3. 79,237,457,309,250,462,370,94,141,242,20 連成多邊形並塗黑
    let polyIdx = [79,237,457,309,250,462,370,94,141,242,20];
    fill(0);
    beginShape();
    for (let i = 0; i < polyIdx.length; i++) {
      let pt = face.keypoints[polyIdx[i]];
      vertex(pt.x * scaleX + offsetX, pt.y * scaleY + offsetY);
    }
    endShape(CLOSE);
    noFill();
  }
}

// 修改 setGradientBackground，讓它畫到 graphics 上
function setGradientBackground(g) {
  // 左下淡藍色 #b3e0ff
  let c1 = color(179, 224, 255);
  // 中間淡粉色 #ffd1e0
  let c2 = color(255, 209, 224);
  // 右上淡紫色 #e0d1ff
  let c3 = color(224, 209, 255);

  // 先做左下到右上雙向漸層
  for (let y = 0; y < g.height; y++) {
    let tY = y / g.height;
    let left = lerpColor(c1, c2, tY);
    let right = lerpColor(c2, c3, tY);
    for (let x = 0; x < g.width; x++) {
      let tX = x / g.width;
      let c = lerpColor(left, right, tX);
      g.set(x, y, c);
    }
  }
  g.updatePixels();
}

// 畫布隨視窗大小自動調整
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新產生漸層背景
  bgImg = createGraphics(width, height);
  setGradientBackground(bgImg);
}
