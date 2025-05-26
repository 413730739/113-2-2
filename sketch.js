// Face Mesh Detection with ml5.js  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let faceMesh;
let faces = [];

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
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  background(0);
  image(video, 0, 0);

  // Ensure at least one face is detected
  if (faces.length > 0) {
    let face = faces[0];

    // 畫出所有關鍵點（可移除這段如果只想要黑線與多邊形）
    for (let i = 0; i < face.keypoints.length; i++) {
      let keypoint = face.keypoints[i];
      stroke(255, 255, 0);
      strokeWeight(2);
      point(keypoint.x, keypoint.y);
    }

    // ====== 黑色線與黑色多邊形 ======
    stroke(0);
    strokeWeight(2);
    noFill();

    // 1. 336,297,300 連線
    let p1 = face.keypoints[336];
    let p2 = face.keypoints[297];
    let p3 = face.keypoints[300];
    beginShape();
    vertex(p1.x, p1.y);
    vertex(p2.x, p2.y);
    vertex(p3.x, p3.y);
    endShape();

    // 2. 107,67,70 連線
    let p4 = face.keypoints[107];
    let p5 = face.keypoints[67];
    let p6 = face.keypoints[70];
    beginShape();
    vertex(p4.x, p4.y);
    vertex(p5.x, p5.y);
    vertex(p6.x, p6.y);
    endShape();

    // 3. 238,241,125,19,354,461,458,250,462,370,94,141,242,20 連成多邊形並塗黑
    let polyIdx = [238,241,125,19,354,461,458,250,462,370,94,141,242,20];
    fill(0);
    beginShape();
    for (let i = 0; i < polyIdx.length; i++) {
      let pt = face.keypoints[polyIdx[i]];
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);
    noFill();
  }
}
