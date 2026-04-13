import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PALETTES = {
  clear: {
    background:
      "radial-gradient(circle at 20% 20%, rgba(250,204,21,0.2), transparent 30%), linear-gradient(135deg, #041b33 0%, #0f5e9c 50%, #f59e0b 100%)",
    orbOne: "rgba(56, 189, 248, 0.35)",
    orbTwo: "rgba(250, 204, 21, 0.22)",
  },
  rain: {
    background:
      "radial-gradient(circle at 25% 20%, rgba(56,189,248,0.16), transparent 30%), linear-gradient(140deg, #05101f 0%, #10233b 50%, #1b3b59 100%)",
    orbOne: "rgba(56, 189, 248, 0.18)",
    orbTwo: "rgba(59, 130, 246, 0.12)",
  },
  snow: {
    background:
      "radial-gradient(circle at 20% 15%, rgba(191,219,254,0.18), transparent 28%), linear-gradient(140deg, #08111e 0%, #1e293b 45%, #475569 100%)",
    orbOne: "rgba(191, 219, 254, 0.2)",
    orbTwo: "rgba(125, 211, 252, 0.15)",
  },
  storm: {
    background:
      "radial-gradient(circle at 55% 0%, rgba(148,163,184,0.12), transparent 26%), linear-gradient(140deg, #020617 0%, #111827 40%, #1e293b 100%)",
    orbOne: "rgba(125, 211, 252, 0.14)",
    orbTwo: "rgba(226, 232, 240, 0.08)",
  },
  clouds: {
    background:
      "radial-gradient(circle at 20% 18%, rgba(125,211,252,0.12), transparent 26%), linear-gradient(145deg, #06101d 0%, #172554 42%, #334155 100%)",
    orbOne: "rgba(148, 163, 184, 0.18)",
    orbTwo: "rgba(125, 211, 252, 0.12)",
  },
  night: {
    background:
      "radial-gradient(circle at 20% 20%, rgba(125,211,252,0.1), transparent 28%), linear-gradient(135deg, #020617 0%, #071325 45%, #111c36 100%)",
    orbOne: "rgba(56, 189, 248, 0.12)",
    orbTwo: "rgba(147, 197, 253, 0.1)",
  },
};

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createClouds(width, height, count) {
  return Array.from({ length: count }, () => ({
    x: randomBetween(-width * 0.2, width * 0.9),
    y: randomBetween(30, height * 0.45),
    size: randomBetween(90, 220),
    speed: randomBetween(0.08, 0.34),
    opacity: randomBetween(0.05, 0.16),
  }));
}

function createRain(width, height, count) {
  return Array.from({ length: count }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    length: randomBetween(10, 24),
    vx: randomBetween(-1.6, -0.7),
    vy: randomBetween(12, 20),
    opacity: randomBetween(0.15, 0.42),
  }));
}

function createSnow(width, height, count) {
  return Array.from({ length: count }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    radius: randomBetween(1.4, 3.6),
    vy: randomBetween(0.7, 1.8),
    sway: randomBetween(0.005, 0.02),
    drift: randomBetween(-0.6, 0.6),
    alpha: randomBetween(0.25, 0.8),
  }));
}

function createStars(width, height, count) {
  return Array.from({ length: count }, () => ({
    x: randomBetween(0, width),
    y: randomBetween(0, height * 0.72),
    radius: randomBetween(0.7, 2.1),
    alpha: randomBetween(0.2, 0.9),
    twinkle: randomBetween(0.008, 0.03),
  }));
}

function buildBolt(width, height) {
  const startX = randomBetween(width * 0.25, width * 0.75);
  const points = [{ x: startX, y: 0 }];
  let currentX = startX;
  let currentY = 0;

  while (currentY < height * 0.55) {
    currentX += randomBetween(-28, 28);
    currentY += randomBetween(28, 54);
    points.push({ x: currentX, y: currentY });
  }

  return points;
}

function drawCloud(ctx, cloud, tint = "255,255,255") {
  ctx.save();
  ctx.fillStyle = `rgba(${tint}, ${cloud.opacity})`;
  ctx.beginPath();
  ctx.ellipse(cloud.x, cloud.y, cloud.size * 0.4, cloud.size * 0.2, 0, 0, Math.PI * 2);
  ctx.ellipse(
    cloud.x - cloud.size * 0.18,
    cloud.y - cloud.size * 0.06,
    cloud.size * 0.24,
    cloud.size * 0.18,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    cloud.x + cloud.size * 0.18,
    cloud.y - cloud.size * 0.03,
    cloud.size * 0.26,
    cloud.size * 0.18,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

function drawStars(ctx, stars, width, height) {
  const gradient = ctx.createRadialGradient(width * 0.72, height * 0.12, 0, width * 0.72, height * 0.12, 160);
  gradient.addColorStop(0, "rgba(147, 197, 253, 0.18)");
  gradient.addColorStop(1, "rgba(147, 197, 253, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  stars.forEach((star) => {
    star.alpha += star.twinkle;
    if (star.alpha >= 1 || star.alpha <= 0.15) {
      star.twinkle *= -1;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSunOrMoon(ctx, width, height, theme) {
  const centerX = width * 0.78;
  const centerY = height * 0.18;

  if (theme === "night") {
    ctx.save();
    ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(centerX + 16, centerY - 10, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 140);
  glow.addColorStop(0, "rgba(250, 204, 21, 0.85)");
  glow.addColorStop(0.4, "rgba(251, 191, 36, 0.28)");
  glow.addColorStop(1, "rgba(250, 204, 21, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(centerX - 140, centerY - 140, 280, 280);
}

function drawRain(ctx, drops, width, height) {
  ctx.save();
  ctx.lineCap = "round";

  drops.forEach((drop) => {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(125, 211, 252, ${drop.opacity})`;
    ctx.lineWidth = 1.3;
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x + drop.vx * 2.4, drop.y + drop.length);
    ctx.stroke();

    drop.x += drop.vx;
    drop.y += drop.vy;

    if (drop.y > height || drop.x < -40) {
      drop.x = randomBetween(0, width);
      drop.y = randomBetween(-height * 0.2, -20);
    }
  });

  ctx.restore();
}

function drawSnow(ctx, flakes, width, height) {
  flakes.forEach((flake) => {
    flake.y += flake.vy;
    flake.x += Math.sin(flake.y * flake.sway) + flake.drift;

    if (flake.y > height + 10) {
      flake.y = -8;
      flake.x = randomBetween(0, width);
    }

    if (flake.x > width + 20) flake.x = -20;
    if (flake.x < -20) flake.x = width + 20;

    ctx.beginPath();
    ctx.fillStyle = `rgba(241,245,249,${flake.alpha})`;
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLightning(ctx, bolt, flashOpacity) {
  if (!bolt?.length || flashOpacity <= 0.02) return;

  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${0.35 + flashOpacity * 0.4})`;
  ctx.lineWidth = 3.2;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.moveTo(bolt[0].x, bolt[0].y);
  for (let index = 1; index < bolt.length; index += 1) {
    ctx.lineTo(bolt[index].x, bolt[index].y);
  }
  ctx.stroke();
  ctx.restore();
}

function buildScene(theme, width, height) {
  return {
    clouds: createClouds(
      width,
      height,
      theme === "clouds" ? 8 : theme === "clear" ? 5 : theme === "night" ? 3 : 6
    ),
    rain:
      theme === "rain" || theme === "storm"
        ? createRain(width, height, theme === "storm" ? 180 : 140)
        : [],
    snow: theme === "snow" ? createSnow(width, height, 120) : [],
    stars: theme === "night" ? createStars(width, height, 90) : [],
  };
}

export default function BackgroundManager({ theme }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef({ clouds: [], rain: [], snow: [], stars: [] });
  const flashRef = useRef(0);
  const boltRef = useRef(null);
  const safeTheme = PALETTES[theme] ? theme : "night";

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    let frameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      sceneRef.current = buildScene(safeTheme, width, height);
      boltRef.current = null;
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      if (safeTheme === "night") {
        drawStars(ctx, sceneRef.current.stars, width, height);
      }

      drawSunOrMoon(ctx, width, height, safeTheme);

      sceneRef.current.clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.size > width + 80) {
          cloud.x = -cloud.size * 0.6;
          cloud.y = randomBetween(30, height * 0.45);
        }

        const tint =
          safeTheme === "storm"
            ? "203, 213, 225"
            : safeTheme === "night"
              ? "148, 163, 184"
              : "255, 255, 255";

        drawCloud(ctx, cloud, tint);
      });

      if (safeTheme === "rain" || safeTheme === "storm") {
        drawRain(ctx, sceneRef.current.rain, width, height);
      }

      if (safeTheme === "snow") {
        drawSnow(ctx, sceneRef.current.snow, width, height);
      }

      if (safeTheme === "storm") {
        if (flashRef.current < 0.08 && Math.random() < 0.008) {
          flashRef.current = 1;
          boltRef.current = buildBolt(width, height);
        }

        if (flashRef.current > 0.02) {
          ctx.fillStyle = `rgba(255,255,255,${flashRef.current * 0.16})`;
          ctx.fillRect(0, 0, width, height);
          drawLightning(ctx, boltRef.current, flashRef.current);
          flashRef.current *= 0.88;
        }
      }

      frameId = window.requestAnimationFrame(animate);
    }

    resize();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
    };
  }, [safeTheme]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={safeTheme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: PALETTES[safeTheme].background }}
        />
      </AnimatePresence>

      <motion.div
        key={`${safeTheme}-orb-a`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="absolute left-[-8%] top-[6%] h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{ background: PALETTES[safeTheme].orbOne }}
      />
      <motion.div
        key={`${safeTheme}-orb-b`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1 }}
        className="absolute bottom-[-10%] right-[-8%] h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: PALETTES[safeTheme].orbTwo }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.72))]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-95" />
    </div>
  );
}
