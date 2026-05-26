import { useState, useEffect, useRef, useCallback } from "react";

// ─── Particle Canvas ───────────────────────────────────────────────────────────
function ParticleCanvas({ trigger }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animFrame = useRef(null);

  const spawnBurst = useCallback((x, y, count = 60) => {
    const emojis = ["💖", "✨", "🌸", "💫", "🎀", "🌹", "⭐", "💝"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 3 + Math.random() * 8;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        decay: 0.012 + Math.random() * 0.015,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 14 + Math.random() * 18,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
      });
    }
  }, []);

  // Trigger burst from outside (candle scene)
  useEffect(() => {
    if (trigger > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // multiple bursts for fireworks effect
      for (let b = 0; b < 5; b++) {
        setTimeout(() => {
          spawnBurst(
            canvas.width * (0.2 + Math.random() * 0.6),
            canvas.height * (0.2 + Math.random() * 0.5),
            60
          );
        }, b * 180);
      }
    }
  }, [trigger, spawnBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.life > 0);
      for (const p of particles.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.99;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
      }
      animFrame.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrame.current);
    };
  }, [spawnBurst]);

  // CRITICAL FIX: pointerEvents: "none" so canvas never blocks buttons
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
}

// ─── Floating Orbs Background ──────────────────────────────────────────────────
function FloatingOrbs() {
  const orbs = [
    { size: 600, x: -5,  y: -10, color: "rgba(255,105,180,0.18)", dur: 18 },
    { size: 500, x: 65,  y: 10,  color: "rgba(255,182,193,0.15)", dur: 22 },
    { size: 400, x: 20,  y: 65,  color: "rgba(255,20,147,0.12)",  dur: 16 },
    { size: 450, x: 75,  y: 75,  color: "rgba(255,160,122,0.14)", dur: 20 },
    { size: 300, x: 45,  y: 35,  color: "rgba(219,112,147,0.16)", dur: 14 },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.size, height: o.size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
          left: `${o.x}%`, top: `${o.y}%`,
          transform: "translate(-50%, -50%)",
          animation: `orbFloat${i % 3} ${o.dur}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes orbFloat0{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-45%,-55%) scale(1.1)}}
        @keyframes orbFloat1{from{transform:translate(-50%,-50%) scale(1.05)}to{transform:translate(-55%,-45%) scale(0.95)}}
        @keyframes orbFloat2{from{transform:translate(-50%,-50%) scale(0.9)}to{transform:translate(-48%,-52%) scale(1.05)}}
      `}</style>
    </div>
  );
}

// ─── Shared button style helper ────────────────────────────────────────────────
const btnBase = {
  fontFamily: "'Playfair Display', serif",
  fontSize: 18, fontStyle: "italic",
  padding: "16px 44px", borderRadius: 60,
  border: "1.5px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  color: "#fff", cursor: "pointer",
  transition: "all 0.3s ease",
  letterSpacing: 1,
  boxShadow: "0 8px 32px rgba(255,100,150,0.2)",
  position: "relative", zIndex: 20,
};

// ─── Scene 1: Landing — animated name reveals ─────────────────────────────────
function SceneLanding({ onNext }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = nothing, 1 = subtitle, 2 = "Happy Birthday Haju",
  // 3 = "Happy Birthday Hajumma", 4 = "Happy Birthday Junior", 5 = subtext + btn

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3800),
      setTimeout(() => setPhase(5), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

const isMobile = window.innerWidth <= 768;

const names = [
  {
    label: isMobile ? (
      <>
        Happy Birthday
        <br />
        Haju
      </>
    ) : (
      "Happy Birthday Haju"
    ),
    color:
      "linear-gradient(135deg,#fff 0%,#ffd6e7 50%,#ff85a1 100%)",
  },
  {
    label: isMobile ? (
      <>
        Happy Birthday
        <br />
        Hajumma
      </>
    ) : (
      "Happy Birthday Hajumma"
    ),
    color:
      "linear-gradient(135deg,#ffd6e7 0%,#ffb3c6 50%,#ff5f8f 100%)",
  },
  {
    label: isMobile ? (
      <>
        Happy Birthday
        <br />
        Junior
      </>
    ) : (
      "Happy Birthday Junior"
    ),
    color:
      "linear-gradient(135deg,#ffb3c6 0%,#ff85a1 50%,#e0336b 100%)",
  },
];

  const currentName = phase >= 4 ? 2 : phase >= 3 ? 1 : phase >= 2 ? 0 : -1;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "40px 20px", position: "relative", zIndex: 5,
    }}>
      {/* Top label */}
      <p style={{
        fontFamily: "'Dancing Script', cursive",
        fontSize: "clamp(16px,3.5vw,24px)",
        color: "rgba(255,255,255,0.65)",
        marginBottom: 20, letterSpacing: 4,
        textTransform: "uppercase",
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "translateY(0)" : "translateY(16px)",
        transition: "all 1s ease",
      }}>
        A little something made for you
      </p>

      {/* Animated name block */}
      <div style={{ minHeight: "clamp(80px,18vw,160px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {names.map((n, i) => (
         <h1
  key={i}
  style={{
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(36px,8vw,86px)",
    margin: 0,
    lineHeight: 1.15,
    textAlign: "center",
    whiteSpace: "normal",
    background: n.color,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    position: i === 0 ? "relative" : "absolute",
    opacity: currentName === i ? 1 : 0,
    transform:
      currentName === i
        ? "translateY(0) scale(1)"
        : currentName > i
        ? "translateY(-24px) scale(0.95)"
        : "translateY(24px) scale(0.95)",
    transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
  }}
>
  {n.label} 💖
</h1>
        ))}
      </div>

      {/* Subtext */}
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "clamp(16px,3vw,22px)",
        color: "rgba(255,255,255,0.72)",
        maxWidth: 560, lineHeight: 1.85, margin: "28px auto 0",
        padding: "0 16px",
        opacity: phase >= 5 ? 1 : 0,
        transform: phase >= 5 ? "translateY(0)" : "translateY(16px)",
        transition: "all 1s ease",
      }}>
        Today the universe celebrates the day the most wonderful person came into existence — and into my life. ✨
      </p>

      {/* CTA Button */}
      <div style={{
        marginTop: 48,
        opacity: phase >= 5 ? 1 : 0,
        transform: phase >= 5 ? "translateY(0)" : "translateY(16px)",
        transition: "all 1s ease 0.2s",
      }}>
        <button
          onClick={onNext}
          style={{
            ...btnBase,
            padding: "18px 52px",
            fontSize: 20,
            boxShadow: "0 8px 40px rgba(255,100,150,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.transform = "scale(1.06) translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1) translateY(0)"; }}
        >
          Open My Heart 💌
        </button>
      </div>

      {/* Bounce arrow */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%",
        transform: "translateX(-50%)",
        opacity: phase >= 5 ? 0.45 : 0,
        transition: "opacity 1s ease",
        animation: "bounce 2s ease-in-out infinite",
        color: "white", fontSize: 22, pointerEvents: "none",
      }}>↓</div>

      <style>{`@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(9px)}}`}</style>
    </div>
  );
}

// ─── Scene 2: Love Letter ──────────────────────────────────────────────────────
function SceneLetter({ onNext }) {
  const lines = [
    "You are the poem I never knew how to write,",
    "the song that plays when words run out.",
    "In every small moment — morning light, quiet laughter,",
    "the way you smile before you even speak —",
    "I find reasons to be grateful you exist.",
    "",
    "This birthday isn't just another day.",
    "It's the anniversary of you.",
    "And that, my love, is worth every star in the sky. 🌟",
  ];

  const [visibleLines, setVisibleLines] = useState(0);
  const [showSign, setShowSign]   = useState(false);
  const [showBtn, setShowBtn]     = useState(false);

  useEffect(() => {
    lines.forEach((_, i) => {
      setTimeout(() => {
        setVisibleLines(v => v + 1);
        if (i === lines.length - 1) {
          setTimeout(() => setShowSign(true), 600);
          setTimeout(() => setShowBtn(true), 1400);
        }
      }, 500 + i * 480);
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "60px 20px", position: "relative", zIndex: 5,
    }}>
      <div style={{
        maxWidth: 680, width: "100%",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 28,
        padding: "clamp(28px,6vw,60px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}>
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "clamp(13px,2.5vw,17px)",
          color: "rgba(255,210,230,0.65)",
          letterSpacing: 4, textTransform: "uppercase",
          marginBottom: 28, marginTop: 0,
        }}>A letter from my heart</p>

        {lines.map((line, i) => (
          <p key={i} style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(17px,3vw,22px)",
            lineHeight: 1.9,
            color: line === "" ? "transparent" : "rgba(255,240,248,0.9)",
            margin: line === "" ? "6px 0" : "0 0 2px",
            opacity: visibleLines > i ? 1 : 0,
            transform: visibleLines > i ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.7s ease",
            fontStyle: i < 5 ? "italic" : "normal",
          }}>
            {line || "\u00a0"}
          </p>
        ))}

        <div style={{
          marginTop: 36, textAlign: "right",
          fontFamily: "'Dancing Script', cursive",
          fontSize: "clamp(20px,4vw,30px)",
          color: "rgba(255,182,200,0.88)",
          opacity: showSign ? 1 : 0,
          transform: showSign ? "translateY(0)" : "translateY(10px)",
          transition: "all 1s ease",
        }}>
          With all my love 💕
        </div>
      </div>

      {showBtn && (
        <button
          onClick={onNext}
          style={{ ...btnBase, marginTop: 40, animation: "fadeInUp 0.8s ease both" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          There's more ✨
        </button>
      )}
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── Scene 3: Reasons I Love You ──────────────────────────────────────────────
function SceneReasons({ onNext }) {
  const reasons = [
    { emoji: "🌟", text: "The way your laugh fills a whole room" },
    { emoji: "🌸", text: "How you make everything feel warm and safe" },
    { emoji: "💫", text: "Your eyes that hold a thousand untold stories" },
    { emoji: "🎵", text: "Your voice — the best sound I know" },
    { emoji: "🌹", text: "The way you care, deeply and completely" },
    { emoji: "✨", text: "Simply being you, every single day" },
  ];

  const [visibleCards, setVisibleCards] = useState(0);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    reasons.forEach((_, i) => {
      setTimeout(() => {
        setVisibleCards(v => v + 1);
        if (i === reasons.length - 1) setTimeout(() => setShowBtn(true), 700);
      }, 200 + i * 220);
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "60px 20px", position: "relative", zIndex: 5,
    }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(30px,7vw,56px)",
        marginBottom: 10, textAlign: "center",
        background: "linear-gradient(135deg,#fff,#ffd6e7)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>Why I love you</h2>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        color: "rgba(255,255,255,0.55)", fontSize: 18,
        marginBottom: 44, textAlign: "center", fontStyle: "italic",
      }}>
        (just a few of a million reasons)
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(255px,1fr))",
        gap: 18, maxWidth: 860, width: "100%",
      }}>
        {reasons.map((r, i) => (
          <div key={i}
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.11)",
              borderRadius: 20, padding: "26px 22px",
              opacity: visibleCards > i ? 1 : 0,
              transform: visibleCards > i ? "translateY(0) scale(1)" : "translateY(24px) scale(0.94)",
              transition: `all 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s`,
              boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
              cursor: "default",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px) scale(1.025)"; e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(255,80,140,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.14)"; }}
          >
            <div style={{ fontSize: 34, marginBottom: 10 }}>{r.emoji}</div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(16px,2.5vw,20px)",
              color: "rgba(255,240,248,0.87)",
              lineHeight: 1.65, margin: 0, fontStyle: "italic",
            }}>
              {r.text}
            </p>
          </div>
        ))}
      </div>

      {showBtn && (
        <button
          onClick={onNext}
          style={{ ...btnBase, marginTop: 48, animation: "fadeInUp 0.8s ease both" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          One last thing 🎂
        </button>
      )}
    </div>
  );
}

// ─── Scene 4: Candles / Celebrate ────────────────────────────────────────────
function SceneFinal({ onCelebrate }) {
  const [visible, setVisible] = useState(false);
  const [candlesLit, setCandlesLit] = useState([false, false, false, false, false, false]);
  const [allLit, setAllLit] = useState(false);
  const [celebMsg, setCelebMsg] = useState(false);
  const [wishText, setWishText] = useState("");
  const [showWishInput, setShowWishInput] = useState(false);
  const [blowing, setBlowing] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);

  const lightCandle = (i) => {
    if (blowing) return;
    setCandlesLit(prev => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      if (next.every(Boolean)) {
        setTimeout(() => {
          setAllLit(true);
          setShowWishInput(true);
        }, 500);
      }
      return next;
    });
  };

  const makeWish = () => {
    if (wishText.trim() && !blowing) {
      setBlowing(true);
      setCelebMsg(true);
      setTimeout(() => {
        onCelebrate();
      }, 800);
    }
  };

  const litCount = candlesLit.filter(Boolean).length;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "60px 20px", position: "relative", zIndex: 5, textAlign: "center",
    }}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 1.2s ease",
      }}>
        <p style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: "clamp(16px,3vw,22px)",
          color: "rgba(255,210,230,0.72)",
          letterSpacing: 4, marginBottom: 10, textTransform: "uppercase",
        }}>🎈 Make a wish come true 🎈</p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(34px,8vw,68px)",
          margin: "0 0 14px",
          background: "linear-gradient(135deg,#fff,#ffd6e7,#ffb3c6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Light all the candles 🕯️
        </h2>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "rgba(255,255,255,0.55)", fontSize: 18, marginBottom: 44,
        }}>
          Click each candle to light it ✨
        </p>

        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 28, padding: "38px 52px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          animation: allLit && !blowing ? "cakePulse 1s ease infinite" : "none",
        }}>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
            {candlesLit.map((lit, i) => (
              <button
                key={i}
                onClick={() => lightCandle(i)}
                disabled={blowing}
                style={{
                  background: "none", border: "none",
                  cursor: (!lit && !blowing) ? "pointer" : "default",
                  fontSize: 42, padding: 6,
                  filter: lit
                    ? "drop-shadow(0 0 15px rgba(255,210,60,1)) drop-shadow(0 0 25px rgba(255,160,30,0.8))"
                    : "grayscale(0.7) opacity(0.4)",
                  transform: lit ? "scale(1.3)" : "scale(1)",
                  transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                  animation: lit ? "candleFlicker 1.2s ease-in-out infinite alternate" : "none",
                  position: "relative", zIndex: 30,
                }}
              >
                🕯️
              </button>
            ))}
          </div>

          <div style={{ 
            fontSize: "clamp(72px,15vw,108px)", 
            lineHeight: 1, marginBottom: 10,
            transition: "transform 0.3s ease",
            transform: blowing ? "scale(1.1)" : "scale(1)",
          }}>🎂</div>

          <div style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: "clamp(22px,5vw,36px)",
            color: "rgba(255,220,238,0.95)",
            minHeight: 48,
          }}>
            {allLit && !blowing
              ? "Now make a wish and blow! 💨✨"
              : `${litCount} / ${candlesLit.length} lit ${litCount > 0 ? "🔥".repeat(Math.min(litCount, 5)) : ""}`}
          </div>
        </div>

        {/* {showWishInput && !blowing && (
          <div style={{
            marginTop: 40,
            animation: "fadeInUp 0.8s ease both",
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <input
              type="text"
              placeholder="Type your wish here..."
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && makeWish()}
              style={{
                padding: "14px 24px",
                fontSize: "18px",
                fontFamily: "'Cormorant Garamond', serif",
                borderRadius: 60,
                border: "1.5px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                color: "#fff",
                minWidth: "260px",
                outline: "none",
              }}
            />
            <button
              onClick={makeWish}
              style={btnBase}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Make Wish! 🎈
            </button>
          </div>
        )} */}

        {showWishInput && !blowing && (
          <div style={{
            marginTop: 40,
            animation: "fadeInUp 1s ease both, wishGlow 2s ease-in-out infinite",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(20px,4vw,28px)",
            color: "rgba(255,220,240,0.95)",
            lineHeight: 1.7,
            maxWidth: 540,
          }}>
            <p style={{ margin: 0 }}>
              ✨ Your wish is on its way to the stars! ✨<br />
              <span style={{ fontSize: "clamp(16px,3vw,20px)" }}>
                Whatever you wished for, I hope it comes true — because you deserve every beautiful thing life has to give. 🌹
              </span>
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes candleFlicker {
          from {
            filter: drop-shadow(0 0 10px rgba(255,210,60,0.9)) drop-shadow(0 0 20px rgba(255,140,20,0.6));
          }
          to {
            filter: drop-shadow(0 0 20px rgba(255,230,80,1)) drop-shadow(0 0 35px rgba(255,160,30,0.9));
          }
        }
        @keyframes cakePulse {
          0%,100% { transform: scale(1); box-shadow: 0 24px 64px rgba(0,0,0,0.2); }
          50% { transform: scale(1.02); box-shadow: 0 28px 72px rgba(255,105,180,0.3); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wishGlow {
          0%,100% { text-shadow: 0 0 10px rgba(255,105,180,0.3); }
          50% { text-shadow: 0 0 30px rgba(255,105,180,0.6); }
        }
      `}</style>
    </div>
  );
}

// ─── Progress Dots ─────────────────────────────────────────────────────────────
function ProgressDots({ current, total }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: "translateX(-50%)",
      display: "flex", gap: 10, zIndex: 60,
      pointerEvents: "none",
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 26 : 8, height: 8,
          borderRadius: 4,
          background: i === current ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.22)",
          transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)",
        }} />
      ))}
    </div>
  );
}

// ─── Scene Transition Wrapper ─────────────────────────────────────────────────
function SceneWrapper({ children, sceneKey }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 30); return () => clearTimeout(t); }, [sceneKey]);
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.75s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {children}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [scene, setScene]               = useState(0);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const containerRef = useRef(null);

  const goNext = () => {
    setScene(s => s + 1);
    setTimeout(() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 60);
  };

  const celebrate = () => setParticleTrigger(t => t + 1);

  const sceneComponents = [
    <SceneLanding  key="landing"  onNext={goNext} />,
    <SceneLetter   key="letter"   onNext={goNext} />,
    <SceneReasons  key="reasons"  onNext={goNext} />,
    <SceneFinal    key="final"    onCelebrate={celebrate} />,
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Dancing+Script:wght@500;700&display=swap"
        rel="stylesheet"
      />

      <div ref={containerRef} style={{
        position: "fixed", inset: 0, overflow: "auto",
        background: "linear-gradient(135deg,#120008 0%,#240018 25%,#1a001e 50%,#220010 75%,#120006 100%)",
      }}>
        <FloatingOrbs />

        {/* Grain overlay — pointer-events off */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 1, opacity: 0.025,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          pointerEvents: "none",
        }} />

        {/* Scene content — zIndex 5, buttons inside go to zIndex 20 via btnBase */}
        <div style={{ position: "relative", zIndex: 5 }}>
          <SceneWrapper sceneKey={scene}>
            {sceneComponents[Math.min(scene, sceneComponents.length - 1)]}
          </SceneWrapper>
        </div>

        <ProgressDots current={scene} total={sceneComponents.length} />

        {/* Particle canvas on top but pointer-events:none */}
        <ParticleCanvas trigger={particleTrigger} />
      </div>

      <style>{`
        *{box-sizing:border-box}
        body{margin:0}
        button:focus-visible{outline:2px solid rgba(255,180,210,0.7);outline-offset:3px}
      `}</style>
    </>
  );
}