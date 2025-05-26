// Face Mesh Detection - Triangulated Face Mapping  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let faceMesh;
let faces = [];
let triangles;

function preload() {
  // Load FaceMesh model 
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
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

  // Get predefined triangle connections
  triangles = faceMesh.getTriangles();
}

function draw() {
  background(0);
  video.loadPixels();

  if (faces.length > 0) {
    let face = faces[0];

    randomSeed(5);
    beginShape(TRIANGLES);
    
    // Loop through each triangle and fill it with sampled pixel color
    for (let i = 0; i < triangles.length; i++) {
      let tri = triangles[i];
      let [a, b, c] = tri;
      let pointA = face.keypoints[a];
      let pointB = face.keypoints[b];
      let pointC = face.keypoints[c];

      // Calculate the centroid of the triangle
      let cx = (pointA.x + pointB.x + pointC.x) / 3;
      let cy = (pointA.y + pointB.y + pointC.y) / 3;

      // Get color from video pixels at centroid location
      let index = (floor(cx) + floor(cy) * video.width) * 4;
      let rr = video.pixels[index];
      let gg = video.pixels[index + 1];
      let bb = video.pixels[index + 2];

      stroke(255, 255, 0);
      fill(rr, gg, bb);
      vertex(pointA.x, pointA.y);
      vertex(pointB.x, pointB.y);
      vertex(pointC.x, pointC.y);
    }
    
    endShape();

    // ====== 你要的黑線與黑色多邊形 ======
    stroke(0);
    strokeWeight(2);
    noFill();

    // 1. 136,297,300 連線
    let p1 = face.keypoints[136];
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

    // 3. 238,241,125,19,354,461,456,250,462,370,94,141,242,20 連成多邊形並塗黑
    let polyIdx = [238,241,125,19,354,461,456,250,462,370,94,141,242,20];
    fill(0);
    beginShape();
    for (let i = 0; i < polyIdx.length; i++) {
      let pt = face.keypoints[polyIdx[i]];
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);
  }
}
