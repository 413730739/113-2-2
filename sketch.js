// Face Mesh Detection with ml5.js  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let holistic;
let results = null;
let bgImg; // 用來存漸層背景
let heartImg; // 愛心圖片
let hearts = []; // 愛心粒子陣列
let texts = [];

function preload() {
  heartImg = loadImage("2.png"); // 請確保2.png在專案資料夾
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  holistic = new Holistic({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  }});
  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  holistic.onResults(gotResults);

  // 啟動 MediaPipe 處理
  const camera = new Camera(video.elt, {
    onFrame: async () => {
      await holistic.send({image: video.elt});
    },
    width: 640,
    height: 480
  });
  camera.start();

  // 產生漸層背景
  bgImg = createGraphics(width, height);
  setGradientBackground(bgImg);

  // 產生5個隨機顏色、位置、速度的文字（顏色不重複，速度更快）
  let palette = shuffle([
    color(255, 183, 197), // 粉
    color(255, 223, 186), // 淡橘
    color(186, 225, 255), // 淡藍
    color(202, 255, 191), // 淡綠
    color(255, 198, 255), // 淡紫
    color(255, 255, 186), // 淡黃
    color(255, 214, 165)  // 淡橙
  ]);
  texts = [];
  for (let i = 0; i < 5; i++) {
    texts.push({
      x: random(100, width-300),
      y: random(100, height-100),
      vx: random([-4, 4]), // 更快
      vy: random([-4, 4]), // 更快
      color: palette[i]
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bgImg = createGraphics(width, height);
  setGradientBackground(bgImg);
}

function gotResults(r) {
  results = r;
}

function draw() {
  image(bgImg, 0, 0, width, height);

  // --- 馬卡龍色漂浮文字 ---
  textSize(50);
  textStyle(BOLD);
  for (let t of texts) {
    // 灰色陰影
    push();
    fill(100, 100, 100, 120);
    noStroke();
    text("淡江教育科技學系", t.x + 4, t.y + 4);
    pop();

    // 主色
    fill(t.color);
    noStroke();
    text("淡江教育科技學系", t.x, t.y);

    t.x += t.vx;
    t.y += t.vy;

    // 邊界反彈
    let tw = textWidth("淡江教育科技學系");
    if (t.x < 0 || t.x > width - tw) t.vx *= -1;
    if (t.y < 50 || t.y > height) t.vy *= -1;
  }

  // 將影像畫在視窗正中間，大小為600x600
  let cx = width / 2;
  let cy = height / 2;
  let vw = 600;
  let vh = 600;
  imageMode(CENTER);
  image(video, cx, cy, vw, vh);
  imageMode(CORNER);

  if (results) {
    // 臉部線條（以輪廓為例）
    if (results.faceLandmarks) {
      stroke(0);
      strokeWeight(2);
      noFill();
      // 1. 336,297,300 連線
      beginShape();
      [336,297,300].forEach(idx => {
        let pt = results.faceLandmarks[idx];
        vertex(pt.x * vw + cx - vw/2, pt.y * vh + cy - vh/2);
      });
      endShape();
      // 2. 107,67,70 連線
      beginShape();
      [107,67,70].forEach(idx => {
        let pt = results.faceLandmarks[idx];
        vertex(pt.x * vw + cx - vw/2, pt.y * vh + cy - vh/2);
      });
      endShape();
      // 3. 多邊形
      fill(0);
      beginShape();
      [79,237,457,309,250,462,370,94,141,242,20].forEach(idx => {
        let pt = results.faceLandmarks[idx];
        vertex(pt.x * vw + cx - vw/2, pt.y * vh + cy - vh/2);
      });
      endShape(CLOSE);
      noFill();
    }

    // 手部偵測與 ET 字樣
    if (results.rightHandLandmarks) {
      drawHandAndET(results.rightHandLandmarks, cx, cy, vw, vh);
    }
    if (results.leftHandLandmarks) {
      drawHandAndET(results.leftHandLandmarks, cx, cy, vw, vh);
    }

    // 判斷雙手比愛心
    if (results && results.leftHandLandmarks && results.rightHandLandmarks) {
      let lHand = results.leftHandLandmarks;
      let rHand = results.rightHandLandmarks;
      let lTip = lHand[8]; // 左手食指指尖
      let rTip = rHand[8]; // 右手食指指尖
      let lThumb = lHand[4]; // 左手拇指指尖
      let rThumb = rHand[4]; // 右手拇指指尖

      // 轉換到畫面座標
      let lx = lTip.x * 600 + width/2 - 300;
      let ly = lTip.y * 600 + height/2 - 300;
      let rx = rTip.x * 600 + width/2 - 300;
      let ry = rTip.y * 600 + height/2 - 300;
      let ltx = lThumb.x * 600 + width/2 - 300;
      let lty = lThumb.y * 600 + height/2 - 300;
      let rtx = rThumb.x * 600 + width/2 - 300;
      let rty = rThumb.y * 600 + height/2 - 300;

      // 判斷兩手食指指尖距離與拇指指尖距離都很近
      if (dist(lx, ly, rx, ry) < 60 && dist(ltx, lty, rtx, rty) < 60) {
        // 愛心中心
        let cx = (lx + rx + ltx + rtx) / 4;
        let cy = (ly + ry + lty + rty) / 4;
        // 每幾幀產生一個愛心
        if (frameCount % 3 === 0) {
          let angle = random(TWO_PI);
          let speed = random(4, 8);
          hearts.push({
            x: cx,
            y: cy,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed,
            alpha: 255,
            size: random(40, 70)
          });
        }
      }
    }

    // 畫出所有愛心
    for (let i = hearts.length - 1; i >= 0; i--) {
      let h = hearts[i];
      tint(255, h.alpha);
      image(heartImg, h.x, h.y, h.size, h.size);
      h.x += h.vx;
      h.y += h.vy;
      h.alpha -= 4;
      if (h.alpha <= 0) hearts.splice(i, 1);
    }
    noTint();
  }
}

function drawHandAndET(landmarks, cx, cy, vw, vh) {
  // 五指指尖座標
  let tipsIdx = [4, 8, 12, 16, 20];
  let tips = tipsIdx.map(idx => landmarks[idx]);
  let xs = tips.map(pt => pt.x * vw + cx - vw/2);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);

  // 判斷五指張開（只要橫向展開夠寬即可，不要求完全平放）
  if ((maxX - minX) > 150) {
    // 手掌中心（用 0 號點）
    let palm = landmarks[0];
    let px = palm.x * vw + cx - vw/2;
    let py = palm.y * vh + cy - vh/2 - 100; // 上方 100px
    fill(0, 32, 128);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(100);
    textStyle(BOLD);
    text("ET", px, py);
  }
}

// 產生左下淡藍→中間淡粉→右上淡紫的漸層背景
function setGradientBackground(g) {
  let c1 = color(179, 224, 255); // 左下淡藍
  let c2 = color(255, 209, 224); // 中間淡粉
  let c3 = color(224, 209, 255); // 右上淡紫

  g.loadPixels();
  for (let y = 0; y < g.height; y++) {
    for (let x = 0; x < g.width; x++) {
      // 兩段漸層：左下到中間，中間到右上
      let tX = x / g.width;
      let tY = y / g.height;
      // 混合三色
      let c = lerpColor(
        lerpColor(c1, c2, (tX + tY) / 2),
        c3,
        (tX + (1 - tY)) / 2
      );
      g.set(x, y, c);
    }
  }
  g.updatePixels();
}
