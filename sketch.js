// Face Mesh Detection with ml5.js  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let holistic;
let results = null;
let bgImg; // 用來存背景圖片
let heartImg; // 愛心圖片
let hearts = []; // 愛心粒子陣列
let texts = [];
let isProcessing = false;
let gameBtn;
let gameDiv;

function preload() {
  heartImg = loadImage("2.png"); // 請確保2.png在專案資料夾
  bgImg = loadImage("1.png");    // 請確保1.png在專案資料夾
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
      vx: random([-4, 4]),
      vy: random([-4, 4]),
      color: palette[i]
    });
  }

  // 新增左上角「遊戲」按鈕
  gameBtn = createButton("遊戲");
  gameBtn.position(20, 20);// 按鈕位置
  gameBtn.style('font-size', '22px');// 按鈕字體大小
  gameBtn.style('padding', '20px 24px');// 按鈕內邊距
  gameBtn.style('background', '#ffd6e0');
  gameBtn.style('border-radius', '10px');// 按鈕圓角
  gameBtn.style('border', '2px solid #ff8fa3');
  gameBtn.style('color', '#333');
  gameBtn.style('z-index', '10');
  gameBtn.mousePressed(showGameBox);
}

function showGameBox() {
  // 若已經有框就不重複產生
  if (gameDiv) return;
  gameDiv = createDiv();
  gameDiv.position((windowWidth-800)/2, (windowHeight-700)/2);
  gameDiv.size(800, 700);
  gameDiv.style('background', '#fff');
  gameDiv.style('border', '4px solid #ff8fa3');
  gameDiv.style('border-radius', '18px');
  gameDiv.style('box-shadow', '0 0 24px #8888');
  gameDiv.style('z-index', '20');
  gameDiv.style('overflow', 'hidden');
  gameDiv.style('position', 'fixed');

  // 右上角叉叉關閉按鈕
  let closeBtn = createButton("✕");
  closeBtn.parent(gameDiv);
  closeBtn.position(800-42, 10);
  closeBtn.style('position', 'absolute');
  closeBtn.style('font-size', '24px');
  closeBtn.style('padding', '2px 10px');
  closeBtn.style('background', '#ff8fa3');
  closeBtn.style('border', 'none');
  closeBtn.style('border-radius', '50%');
  closeBtn.style('color', '#fff');
  closeBtn.style('cursor', 'pointer');
  closeBtn.mousePressed(()=>{
    gameDiv.remove();
    gameDiv = null;
  });

  // 網頁 iframe
  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://413730739.github.io/113-2-2-01/');
  iframe.attribute('width', '800');
  iframe.attribute('height', '650');
  iframe.attribute('frameborder', '0');
  iframe.style('border', 'none');
  iframe.style('display', 'block');
  iframe.position(0, 50);
  iframe.parent(gameDiv);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotResults(r) {
  results = r;
}

function draw() {
  // 只在上一幀處理完再送新影像
  if (!isProcessing && video.loadedmetadata) {
    isProcessing = true;
    holistic.send({image: video.elt}).then(() => {
      isProcessing = false;
    });
  }

  // 用 1.png 當背景，鋪滿整個畫布
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
    // 臉部線條
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

  // 判斷五指張開（只要橫向展開夠寬即可，完全平放也會顯示）
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

  // 只宣告一次
  let palm = landmarks[0];
  let tip1 = landmarks[8];   // 食指
  let tip2 = landmarks[12];  // 中指
  let tip3 = landmarks[16];  // 無名指
  let tip4 = landmarks[20];  // 小指
  let tip0 = landmarks[4];   // 拇指

  // ----------- 判斷比1手勢並顯示框框與文字 -----------
  let isOne = true;
  for (let pt of [tip0, tip2, tip3, tip4]) {
    let d = dist(pt.x, pt.y, palm.x, palm.y);
    if (d > 0.22) isOne = false;
  }
  if (dist(tip1.x, tip1.y, palm.x, palm.y) < 0.32) isOne = false;

  if (isOne) {
    let fx = tip1.x * vw + cx - vw/2;
    let fy = tip1.y * vh + cy - vh/2;
    let boxW = 420, boxH = 260;
    let boxX = fx + 30;
    let boxY = fy - boxH/2;
    if (boxX + boxW > width) boxX = fx - boxW - 30;
    if (boxY < 0) boxY = 10;

    push();
    stroke(255, 120, 120);
    strokeWeight(4);
    fill(255, 255, 255, 230);
    rect(boxX, boxY, boxW, boxH, 20);

    fill(60, 60, 60);
    noStroke();
    textSize(18);
    textAlign(LEFT, TOP);
    let txt = "發展方向\n" +
      "一、多媒體教材開發之專案管理人員。\n" +
      "二、多媒體教材開發之設計與製作人員。\n" +
      "三、數位學習導入推廣之規劃執行人員。\n" +
      "四、人力資源發展之規劃管理人員。\n" +
      "五、數位教育訓練之規劃與執行人員。\n" +
      "六、教學資源中心之管理與研究人員。\n" +
      "七、高級教育與中小學學校之資訊行政主管人員。";
    text(txt, boxX + 18, boxY + 16, boxW - 36, boxH - 32);
    pop();
  }

  // ----------- 判斷比2手勢並顯示框框與文字 -----------
  let isTwo = true;
  // 其他三指要靠近手掌
  for (let pt of [tip0, tip3, tip4]) {
    let d = dist(pt.x, pt.y, palm.x, palm.y);
    if (d > 0.22) isTwo = false;
  }
  // 食指與中指要夠遠
  if (dist(tip1.x, tip1.y, palm.x, palm.y) < 0.32) isTwo = false;
  if (dist(tip2.x, tip2.y, palm.x, palm.y) < 0.32) isTwo = false;
  // 食指與中指要分開
  if (dist(tip1.x, tip1.y, tip2.x, tip2.y) < 0.08) isTwo = false;

  if (isTwo) {
    let fx = tip1.x * vw + cx - vw/2;// 食指 x 座標
    let fy = tip1.y * vh + cy - vh/2;
    let boxW = 650, boxH = 200;// 框框寬高
    let boxX = fx + 30;
    let boxY = fy - boxH/2;
    if (boxX + boxW > width) boxX = fx - boxW - 30;
    if (boxY < 0) boxY = 10;

    push();
    stroke(120, 120, 255);
    strokeWeight(4);
    fill(255, 255, 255, 240);
    rect(boxX, boxY, boxW, boxH, 20);

    fill(30, 30, 80);
    noStroke();
    textSize(18);
    textAlign(LEFT, TOP);
    let txt = "獨有特色\n" +
    "「數位學習、行動學習、虛擬學習、AI學習」\n" +
    "之創新教學為本系研究與發展之重點，\n" +
    "本系課程規劃「數位媒體製作、教育理論、人力資源發展、統整課程」四面向，\n" +
    "教學上運用最新科技教學方法並結合科技學習環境，\n" +
    "以培養學生具備「教學設計、教材製作、專案管理、環境設計」四項核心能力，\n" +
    "並以畢業專題與企業實習課程，以「產學合作」與企業公司接軌，\n" +
    "協助同學提早與企業實務接軌，培養未來就業能力。";
    text(txt, boxX + 18, boxY + 16, boxW - 36, boxH - 32);
    pop();
  }

  // ----------- 判斷比3手勢並顯示框框與文字 -----------
  let isThree = true;
  // 只有食指(8)、中指(12)、無名指(16)要伸直，其餘兩指(4,20)要靠近手掌
  for (let pt of [tip0, tip4]) {
    let d = dist(pt.x, pt.y, palm.x, palm.y);
    if (d > 0.22) isThree = false;
  }
  // 三指要夠遠
  if (dist(tip1.x, tip1.y, palm.x, palm.y) < 0.32) isThree = false;
  if (dist(tip2.x, tip2.y, palm.x, palm.y) < 0.32) isThree = false;
  if (dist(tip3.x, tip3.y, palm.x, palm.y) < 0.32) isThree = false;
  // 三指要分開
  if (dist(tip1.x, tip1.y, tip2.x, tip2.y) < 0.08) isThree = false;
  if (dist(tip2.x, tip2.y, tip3.x, tip3.y) < 0.08) isThree = false;

  if (isThree) {
    let fx = tip1.x * vw + cx - vw/2; // 以食指為主
    let fy = tip1.y * vh + cy - vh/2;
    let boxW = 720, boxH = 200;
    let boxX = fx + 30;
    let boxY = fy - boxH/2;
    if (boxX + boxW > width) boxX = fx - boxW - 30;
    if (boxY < 0) boxY = 10;

    push();
    stroke(80, 180, 80);
    strokeWeight(4);
    fill(255, 255, 255, 240);// 框框透明度
    rect(boxX, boxY, boxW, boxH, 20);

    fill(20, 80, 20);
    noStroke();
    textSize(18);
    textAlign(LEFT, TOP);
    let txt = "沿革與現況\n" +
      "教育科技學系成立於1997年，是台灣第1所專科培育教育科技專業人才的系所。\n" +
      "本系在理論上融合教育、管理及傳播的理論概念，\n" +
      "在實務方面則結合數位科技與傳播媒體的應用，提供創新科技學習、媒體製作、\n" +
      "教學設計、專案管理等課程。本系完整的學士班與碩士班課程規劃，\n" +
      "已培育超過2000位「數位學習教材製作、人力資源發展與數位專案開發」的優秀人才，\n" +
      "成為系所充沛之企業界資源。";
    text(txt, boxX + 18, boxY + 16, boxW - 36, boxH - 32);
    pop();
  }

  // ----------- 判斷OK手勢並顯示框框與文字 -----------
  let isOK = true;
  // 拇指(4)與食指(8)指尖距離要很近
  if (dist(tip0.x, tip0.y, tip1.x, tip1.y) > 0.08) isOK = false;
  // 其他三指要伸直
  if (dist(tip2.x, tip2.y, palm.x, palm.y) < 0.32) isOK = false;
  if (dist(tip3.x, tip3.y, palm.x, palm.y) < 0.32) isOK = false;
  if (dist(tip4.x, tip4.y, palm.x, palm.y) < 0.32) isOK = false;

  if (isOK) {
    // 框框位置以中指指尖為主
    let fx = tip2.x * vw + cx - vw/2;
    let fy = tip2.y * vh + cy - vh/2;
    let boxW = 720, boxH = 200;
    let boxX = fx + 30;
    let boxY = fy - boxH/2;
    if (boxX + boxW > width) boxX = fx - boxW - 30;
    if (boxY < 0) boxY = 10;

    push();
    stroke(80, 180, 80);
    strokeWeight(4);
    fill(255, 255, 255, 240);
    rect(boxX, boxY, boxW, boxH, 20);

    fill(20, 80, 20);
    noStroke();
    textSize(18);
    textAlign(LEFT, TOP);
    let txt = "沿革與現況\n" +
      "教育科技學系成立於1997年，是台灣第1所專科培育教育科技專業人才的系所。\n" +
      "本系在理論上融合教育、管理及傳播的理論概念，\n" +
      "在實務方面則結合數位科技與傳播媒體的應用，提供創新科技學習、媒體製作、\n" +
      "教學設計、專案管理等課程。本系完整的學士班與碩士班課程規劃，\n" +
      "已培育超過2000位「數位學習教材製作、人力資源發展與數位專案開發」的優秀人才，\n" +
      "成為系所充沛之企業界資源。";
      text(txt, boxX + 18, boxY + 16, boxW - 36, boxH - 32);
    pop();
  }
}
