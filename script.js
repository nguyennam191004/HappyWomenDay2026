/**
 * Script chúc mừng 20/10 - Hiệu ứng mở thư, cánh hoa rơi, pháo hoa, bướm 3D & âm nhạc
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const envelopeWrapper = document.getElementById('envelopeWrapper');
    const waxSeal = document.getElementById('waxSeal');
    const letterModal = document.getElementById('letterModal');
    const btnCloseLetter = document.getElementById('btnCloseLetter');
    const btnSendHearts = document.getElementById('btnSendHearts');
    const btnFirework = document.getElementById('btnFirework');
    const clickHint = document.getElementById('clickHint');
    const musicControl = document.getElementById('musicControl');
    const bgMusic = document.getElementById('bgMusic');
    const flowersLayer = document.getElementById('flowersLayer');
    const canvas = document.getElementById('petalCanvas');
    const ctx = canvas.getContext('2d');

    // ==========================================
    // 1. ĐIỀU KHIỂN NHẠC NỀN (BACKGROUND MUSIC)
    // ==========================================
    let isMusicPlaying = false;

    function playBackgroundMusic() {
        if (!bgMusic) return;

        bgMusic.volume = 1.0;
        bgMusic.muted = false;

        // Nếu file chưa được nạp hoặc bị lỗi 404 trước đó
        if (bgMusic.readyState < 2 || bgMusic.error) {
            bgMusic.load();
        }

        const promise = bgMusic.play();
        if (promise !== undefined) {
            promise.then(() => {
                isMusicPlaying = true;
                musicControl.classList.add('playing');
            }).catch(err => {
                console.warn("Trình duyệt yêu cầu reload lại file nhạc:", err);
                bgMusic.load();
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    musicControl.classList.add('playing');
                }).catch(e => {
                    console.error("Lỗi khi phát music.mp3:", e);
                });
            });
        }
    }

    function toggleMusic() {
        if (!bgMusic) return;
        if (bgMusic.paused) {
            playBackgroundMusic();
        } else {
            bgMusic.pause();
            isMusicPlaying = false;
            musicControl.classList.remove('playing');
        }
    }

    musicControl.addEventListener('click', toggleMusic);

    if (bgMusic) {
        bgMusic.addEventListener('play', () => {
            isMusicPlaying = true;
            musicControl.classList.add('playing');
        });
        bgMusic.addEventListener('pause', () => {
            isMusicPlaying = false;
            musicControl.classList.remove('playing');
        });
    }

    // ==========================================
    // 2. HIỆU ỨNG VỠ CON DẤU SÁP
    // ==========================================
    function shatterWaxSeal() {
        const rect = waxSeal.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 18; i++) {
            const shard = document.createElement('div');
            shard.className = 'wax-shard';
            shard.style.left = `${centerX}px`;
            shard.style.top = `${centerY}px`;

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 90 + 40;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            const rot = (Math.random() - 0.5) * 360;

            shard.style.setProperty('--dx', `${dx}px`);
            shard.style.setProperty('--dy', `${dy}px`);
            shard.style.setProperty('--rot', `${rot}deg`);

            document.body.appendChild(shard);
            setTimeout(() => shard.remove(), 800);
        }
    }

    // ==========================================
    // 3. CƠN MƯA HOA RƠI 3D KHI MỞ THIỆP
    // ==========================================
    let fallingFlowers = [];
    const flowerIcons = ['🌸', '🌺', '🌷', '🌹', '🌼', '💐', '🌻'];

    function spawnFlowerShower() {
        clearFlowerShower();
        const count = window.innerWidth < 768 ? 20 : 32;

        for (let i = 0; i < count; i++) {
            const fl = document.createElement('div');
            fl.className = 'falling-flower';
            fl.textContent = flowerIcons[Math.floor(Math.random() * flowerIcons.length)];

            const startX = Math.random() * window.innerWidth;
            const startY = -Math.random() * 300 - 40;
            const size = Math.random() * 18 + 20; // 20px - 38px
            const speedY = Math.random() * 1.8 + 1.2;
            const swingSpeed = Math.random() * 0.03 + 0.015;
            const swingAmp = Math.random() * 2.5 + 1.2;
            const rotSpeed = (Math.random() - 0.5) * 3;

            fl.style.fontSize = `${size}px`;
            flowersLayer.appendChild(fl);

            fallingFlowers.push({
                element: fl,
                x: startX,
                y: startY,
                speedY: speedY,
                swing: Math.random() * Math.PI * 2,
                swingSpeed: swingSpeed,
                swingAmp: swingAmp,
                rotation: Math.random() * 360,
                rotSpeed: rotSpeed
            });
        }
    }

    function updateFallingFlowers() {
        for (let i = 0; i < fallingFlowers.length; i++) {
            const f = fallingFlowers[i];
            f.y += f.speedY;
            f.swing += f.swingSpeed;
            f.x += Math.sin(f.swing) * f.swingAmp;
            f.rotation += f.rotSpeed;

            // Khi hoa rơi qua đáy màn hình thì reset lên lại đỉnh để tạo cơn mưa hoa liên tục
            if (f.y > window.innerHeight + 50) {
                f.y = -Math.random() * 120 - 30;
                f.x = Math.random() * window.innerWidth;
            }

            f.element.style.transform = `translate3d(${f.x}px, ${f.y}px, 0) rotate(${f.rotation}deg)`;
        }
    }

    function clearFlowerShower() {
        fallingFlowers = [];
        if (flowersLayer) {
            flowersLayer.innerHTML = '';
        }
    }

    // ==========================================
    // 4. MỞ & ĐÓNG BỨC THƯ
    // ==========================================
    function openLetter() {
        shatterWaxSeal();
        playBackgroundMusic();

        envelopeWrapper.classList.add('open');
        clickHint.style.opacity = '0';

        setTimeout(() => {
            letterModal.classList.add('active');
            
            // Đợt 1: Bắn pháo giấy confetti từ 2 góc bay phủ lên bức thư
            fireConfettiCannons();

            // Bắn chùm pháo hoa rực rỡ trực tiếp phía trước bức thư
            launchFireworksCluster();

            // Thả cơn mưa hoa rơi 3D
            spawnFlowerShower();

            // Bắn tim bung xõa
            burstHearts(window.innerWidth / 2, window.innerHeight / 2, 25);
        }, 500);

        // Sau khi thiệp mở xong, chuyển transition mượt mà cho hiệu ứng chuột nghiêng 3D
        setTimeout(() => {
            if (letterCard) {
                letterCard.style.transition = 'transform 0.12s ease-out';
            }
        }, 900);

        // Đợt 2: Bắn thêm 1 đợt pháo giấy khi người đọc vừa nhìn thấy trọn vẹn thiệp
        setTimeout(() => {
            if (letterModal.classList.contains('active')) {
                fireConfettiCannons();
            }
        }, 1100);
    }

    function closeLetter() {
        letterModal.classList.remove('active');
        clearFlowerShower();

        // Tạm dừng nhạc khi đóng thư lại
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
            isMusicPlaying = false;
            musicControl.classList.remove('playing');
        }

        if (letterCard) {
            letterCard.style.transition = 'transform 0.5s ease';
            letterCard.style.transform = '';
        }
        setTimeout(() => {
            envelopeWrapper.classList.remove('open');
            clickHint.style.opacity = '1';
        }, 400);
    }

    envelopeWrapper.addEventListener('click', openLetter);
    clickHint.addEventListener('click', openLetter);
    if (waxSeal) {
        waxSeal.addEventListener('click', (e) => {
            e.stopPropagation();
            openLetter();
        });
    }

    btnCloseLetter.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLetter();
    });

    // ==========================================
    // 5. HIỆU ỨNG BẮN TIM & SPARKLES
    // ==========================================
    const heartEmojis = ['💖', '💕', '🌸', '💐', '✨', '🌷', '💝', '🌹', '🌼', '🌺'];

    function createFloatingHeart(x, y) {
        const heart = document.createElement('div');
        heart.className = 'click-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;

        const randomX = (Math.random() - 0.5) * 180;
        const randomRot = (Math.random() - 0.5) * 60;
        heart.style.setProperty('--vx', `${randomX}px`);
        heart.style.setProperty('--rot', `${randomRot}deg`);

        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    }

    function burstHearts(centerX, centerY, count = 18) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * 140;
                const offsetY = (Math.random() - 0.5) * 90;
                createFloatingHeart(centerX + offsetX, centerY + offsetY);
            }, i * 30);
        }
    }

    btnSendHearts.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btnSendHearts.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top;
        burstHearts(x, y, 35);
        fireConfetti(x, y, 60);
    });

    btnFirework.addEventListener('click', (e) => {
        e.stopPropagation();
        launchFireworksCluster();
        fireConfettiCannons();
    });

    document.addEventListener('pointerdown', (e) => {
        if (e.target.closest('#musicControl') || e.target.closest('.btn')) return;
        createFloatingHeart(e.clientX, e.clientY);
    });

    // ==========================================
    // 6. HIỆU ỨNG DI CHUYỂN CHUỘT (MOUSE INTERACTION)
    // ==========================================
    const cursorGlow = document.getElementById('cursorGlow');
    const letterCard = document.querySelector('.letter-card');

    let mouseX = -1000;
    let mouseY = -1000;
    let lastMouseX = -1000;
    let lastMouseY = -1000;
    let isMouseActive = false;

    // Hạt bụi sao & tim phát sáng bay theo chuột (Mouse Sparkles Trail)
    const mouseSparkles = [];
    const sparkleColors = ['#ff69b4', '#ffd700', '#ff85a2', '#ffffff', '#e040fb', '#80d8ff', '#ff80ab'];

    class MouseSparkle {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 8;
            this.y = y + (Math.random() - 0.5) * 8;
            this.vx = (Math.random() - 0.5) * 1.6;
            this.vy = (Math.random() - 0.5) * 1.6 - 0.8;
            this.size = Math.random() * 5 + 3;
            this.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
            this.alpha = 1;
            this.decay = Math.random() * 0.035 + 0.025;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.12;
            this.isStar = Math.random() > 0.35;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.alpha -= this.decay;
            this.size = Math.max(0, this.size - 0.06);
        }

        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = Math.max(0, this.alpha);
            fxCtx.fillStyle = this.color;
            fxCtx.shadowBlur = 10;
            fxCtx.shadowColor = this.color;
            fxCtx.translate(this.x, this.y);
            fxCtx.rotate(this.rotation);

            if (this.isStar) {
                // Ngôi sao 4 cánh lấp lánh (Sparkle Star)
                fxCtx.beginPath();
                fxCtx.moveTo(0, -this.size * 1.6);
                fxCtx.quadraticCurveTo(0, 0, this.size * 1.6, 0);
                fxCtx.quadraticCurveTo(0, 0, 0, this.size * 1.6);
                fxCtx.quadraticCurveTo(0, 0, -this.size * 1.6, 0);
                fxCtx.quadraticCurveTo(0, 0, 0, -this.size * 1.6);
                fxCtx.fill();
            } else {
                // Trái tim mini phát sáng
                const s = this.size * 0.7;
                fxCtx.beginPath();
                fxCtx.moveTo(0, 0);
                fxCtx.bezierCurveTo(-s, -s, -s * 2, s / 2, 0, s * 2);
                fxCtx.bezierCurveTo(s * 2, s / 2, s, -s, 0, 0);
                fxCtx.fill();
            }

            fxCtx.restore();
        }
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseActive = true;

        // Cập nhật vị trí con trỏ phát sáng (Cursor Follower)
        if (cursorGlow) {
            cursorGlow.style.left = `${mouseX}px`;
            cursorGlow.style.top = `${mouseY}px`;
            cursorGlow.style.opacity = '1';
        }

        // Tạo vệt bụi sao lấp lánh khi chuột di chuyển
        const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
        if (dist > 7) {
            mouseSparkles.push(new MouseSparkle(mouseX, mouseY));
            if (dist > 25) {
                mouseSparkles.push(new MouseSparkle(mouseX, mouseY));
            }
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }

        // Nghiêng 3D Parallax chân thực theo góc chuột
        if (letterModal.classList.contains('active') && letterCard) {
            const rect = letterCard.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (mouseX - cx) / (rect.width / 2);
            const dy = (mouseY - cy) / (rect.height / 2);
            const clampX = Math.max(-1.2, Math.min(1.2, dx));
            const clampY = Math.max(-1.2, Math.min(1.2, dy));
            letterCard.style.transform = `perspective(1000px) translateY(0) scale(1) rotateX(${-clampY * 6}deg) rotateY(${clampX * 6}deg)`;
        } else if (!envelopeWrapper.classList.contains('open')) {
            const rect = envelopeWrapper.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (mouseX - cx) / (rect.width / 2);
            const dy = (mouseY - cy) / (rect.height / 2);
            const clampX = Math.max(-1.5, Math.min(1.5, dx));
            const clampY = Math.max(-1.5, Math.min(1.5, dy));
            envelopeWrapper.style.transform = `perspective(800px) rotateX(${-clampY * 10}deg) rotateY(${clampX * 10}deg) scale(1.02)`;
        }
    });

    document.addEventListener('mouseleave', () => {
        isMouseActive = false;
        mouseX = -1000;
        mouseY = -1000;
        if (cursorGlow) cursorGlow.style.opacity = '0';
        if (!envelopeWrapper.classList.contains('open')) {
            envelopeWrapper.style.transform = '';
        }
        if (letterCard && letterModal.classList.contains('active')) {
            letterCard.style.transform = 'translateY(0) scale(1)';
        }
    });

    // ==========================================
    // 7. DUAL CANVAS: HẬU CẢNH (CÁNH HOA) & TIỀN CẢNH (PHÁO GIẤY + PHÁO HOA + VỆT SAO)
    // ==========================================
    const petalCanvas = document.getElementById('petalCanvas');
    const petalCtx = petalCanvas.getContext('2d');
    const fxCanvas = document.getElementById('fxCanvas');
    const fxCtx = fxCanvas.getContext('2d');

    let width = (petalCanvas.width = fxCanvas.width = window.innerWidth);
    let height = (petalCanvas.height = fxCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = petalCanvas.width = fxCanvas.width = window.innerWidth;
        height = petalCanvas.height = fxCanvas.height = window.innerHeight;
    });

    // Cánh hoa rơi ở nền sau (Petal Canvas - z-index: 1)
    class Petal {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : -20;
            this.size = Math.random() * 12 + 10;
            this.speedY = Math.random() * 1.5 + 1.0;
            this.speedX = Math.random() * 1.2 - 0.6;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.03;
            this.swing = Math.random() * 2;
            this.swingSpeed = Math.random() * 0.02 + 0.01;
            this.color = Math.random() > 0.4 ? 'rgba(255, 140, 165, ' : 'rgba(255, 182, 193, ';
            this.opacity = Math.random() * 0.45 + 0.45;
        }

        update() {
            this.y += this.speedY;
            this.x += Math.sin(this.swing) * 0.8 + this.speedX;
            this.swing += this.swingSpeed;
            this.rotation += this.rotationSpeed;

            // Gió đẩy cánh hoa khi chuột lướt qua gần
            if (isMouseActive) {
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const dist = Math.hypot(dx, dy);
                if (dist < 90 && dist > 0) {
                    const force = ((90 - dist) / 90) * 3.5;
                    this.x += (dx / dist) * force;
                    this.y += (dy / dist) * force;
                }
            }

            if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
                this.reset(false);
            }
        }

        draw() {
            petalCtx.save();
            petalCtx.translate(this.x, this.y);
            petalCtx.rotate(this.rotation);
            petalCtx.fillStyle = this.color + this.opacity + ')';

            petalCtx.beginPath();
            petalCtx.moveTo(0, 0);
            petalCtx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, this.size / 2, this.size);
            petalCtx.bezierCurveTo(0, this.size / 2, -this.size / 2, 0, 0, 0);
            petalCtx.fill();

            petalCtx.restore();
        }
    }

    // Pháo giấy Confetti ở tiền cảnh (FX Canvas - z-index: 999, đè lên trước lá thư)
    const confettiColors = ['#ff6b8b', '#ffd166', '#06d6a0', '#118ab2', '#ff9f1c', '#e040fb', '#ffffff', '#ff1744', '#ffea00'];
    const confettis = [];

    class Confetti {
        constructor(x, y, vx, vy) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.size = Math.random() * 10 + 7;
            this.tilt = Math.random() * 10;
            this.tiltSpeed = Math.random() * 0.18 + 0.08;
            this.gravity = 0.25;
            this.drag = 0.98;
            this.opacity = 1;
        }

        update() {
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.tilt += this.tiltSpeed;
        }

        draw() {
            fxCtx.save();
            fxCtx.fillStyle = this.color;
            fxCtx.globalAlpha = Math.max(0, this.opacity);
            fxCtx.translate(this.x, this.y);
            fxCtx.rotate(this.tilt);
            fxCtx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
            fxCtx.restore();
        }
    }

    function fireConfetti(x, y, count = 60) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 14 + 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 5;
            confettis.push(new Confetti(x, y, vx, vy));
        }
    }

    function fireConfettiCannons() {
        for (let i = 0; i < 90; i++) {
            const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.7;
            const speed = Math.random() * 24 + 14;
            confettis.push(new Confetti(0, height, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }
        for (let i = 0; i < 90; i++) {
            const angle = -Math.PI * 0.75 + (Math.random() - 0.5) * 0.7;
            const speed = Math.random() * 24 + 14;
            confettis.push(new Confetti(width, height, Math.cos(angle) * speed, Math.sin(angle) * speed));
        }
    }

    // Hạt pháo hoa nở rực rỡ ở tiền cảnh (FX Canvas - z-index: 999)
    const fireworks = [];
    class FireworkSpark {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 9 + 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.radius = Math.random() * 3.5 + 2.0;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
            this.gravity = 0.12;
        }

        update() {
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = Math.max(0, this.alpha);
            fxCtx.fillStyle = this.color;
            fxCtx.shadowBlur = 12;
            fxCtx.shadowColor = this.color;
            fxCtx.beginPath();
            fxCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            fxCtx.fill();
            fxCtx.restore();
        }
    }

    function launchFireworksCluster() {
        const colors = ['#ff4081', '#ffd700', '#00e5ff', '#76ff03', '#ff9100', '#e040fb', '#ffffff'];
        const bursts = 5;
        for (let b = 0; b < bursts; b++) {
            setTimeout(() => {
                const bx = width / 2 + (Math.random() - 0.5) * (width * 0.6);
                const by = height * 0.3 + (Math.random() - 0.5) * (height * 0.35);
                const chosenColor = colors[Math.floor(Math.random() * colors.length)];

                for (let i = 0; i < 60; i++) {
                    fireworks.push(new FireworkSpark(bx, by, chosenColor));
                }
            }, b * 200);
        }
    }

    // Danh sách cánh hoa mặc định
    const petalCount = window.innerWidth < 768 ? 25 : 45;
    const petals = Array.from({ length: petalCount }, () => new Petal());

    // Loop diễn hoạt 60 FPS
    function animate() {
        // 1. Vẽ cánh hoa trên canvas nền sau (petalCanvas)
        petalCtx.clearRect(0, 0, width, height);
        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });

        // 2. Vẽ trên canvas tiền cảnh (fxCanvas - z-index: 999)
        fxCtx.clearRect(0, 0, width, height);

        // 2.1 Vệt bụi sao theo chuột
        for (let i = mouseSparkles.length - 1; i >= 0; i--) {
            const s = mouseSparkles[i];
            s.update();
            s.draw();
            if (s.alpha <= 0) {
                mouseSparkles.splice(i, 1);
            }
        }

        // 2.2 Pháo giấy Confetti
        for (let i = confettis.length - 1; i >= 0; i--) {
            const c = confettis[i];
            c.update();
            c.draw();
            if (c.y > height + 30) {
                confettis.splice(i, 1);
            }
        }

        // 2.3 Pháo hoa
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const f = fireworks[i];
            f.update();
            f.draw();
            if (f.alpha <= 0) {
                fireworks.splice(i, 1);
            }
        }

        // 3. Cập nhật cơn mưa hoa rơi 3D
        updateFallingFlowers();

        requestAnimationFrame(animate);
    }

    animate();
});
