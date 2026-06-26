/** Procedural pixel-art assets — swap with Leonardo.ai PNGs later via loadExternal() */
const Assets = {
  player: null,
  playerStarving: null,
  tiles: {},
  parallax: [],
  falafel: null,
  door: null,
  enemies: [],
  ingredients: {},
  icons: {},
  ready: false,

  init() {
    this.player = this._buildPlayerSheet(false);
    this.playerStarving = this._buildPlayerSheet(true);
    this.tiles = {
      ground: this._buildTile("ground"),
      platform: this._buildTile("platform"),
      lava: this._buildTile("lava"),
    };
    this.parallax = [0, 1, 2, 3].map((z) => this._buildParallaxZone(z));
    this.falafel = this._buildFalafel();
    this.door = this._buildDoor();
    this.enemies = [0, 1, 2].map((t) => this._buildEnemy(t));
    for (const k of ["Jameed", "Meat", "Rice", "Laban"]) {
      this.ingredients[k] = this._buildIngredient(k);
    }
    this.icons = {
      falafel: this._iconFalafel(),
      heart: this._iconHeart(true),
      heartEmpty: this._iconHeart(false),
    };
    this.ready = true;
    return this;
  },

  _canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  },

  _px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  },

  _buildPlayerSheet(starving) {
    const FW = 32;
    const FH = 44;
    const FRAMES = 4;
    const c = this._canvas(FW * FRAMES, FH);
    const ctx = c.getContext("2d");

    for (let f = 0; f < FRAMES; f++) {
      const ox = f * FW;
      const jacket = starving ? "#cc7a00" : "#1e6fbf";
      const legOff = f % 2 === 0 ? 0 : 2;

      this._px(ctx, ox + 4, 0, 24, 14, "#deb887");
      this._px(ctx, ox + 2, -2, 28, 8, "#fff");
      this._px(ctx, ox + 4, -2, 8, 8, "#e94560");
      this._px(ctx, ox + 12, -2, 8, 8, "#fff");
      this._px(ctx, ox + 20, -2, 8, 8, "#e94560");
      this._px(ctx, ox + 8, 4, starving ? 4 : 3, starving ? 4 : 3, "#111");
      this._px(ctx, ox + FW - 8 - (starving ? 4 : 3), 4, starving ? 4 : 3, starving ? 4 : 3, "#111");
      if (starving) this._px(ctx, ox + 10, 10, 2, 3, "#4af");

      this._px(ctx, ox + 2, 14, 28, 18, jacket);
      this._px(ctx, ox + 4, 32, 11, 12, "#2a4a7f");
      this._px(ctx, ox + 17 + legOff, 32, 11, 12, "#2a4a7f");
      this._px(ctx, ox + 6, 42, 8, 2, "#1a3050");
      this._px(ctx, ox + 18 + legOff, 42, 8, 2, "#1a3050");

      if (f > 0) {
        const swing = f === 1 || f === 3 ? -1 : 1;
        this._px(ctx, ox + 2 + swing, 16, 4, 10, jacket);
        this._px(ctx, ox + FW - 6 - swing, 16, 4, 10, jacket);
      }
    }
    return c;
  },

  _buildTile(type) {
    const S = 16;
    const c = this._canvas(S, S);
    const ctx = c.getContext("2d");
    if (type === "ground") {
      this._px(ctx, 0, 0, S, 4, "#6b8e4e");
      this._px(ctx, 0, 4, S, 4, "#5a7340");
      this._px(ctx, 0, 8, S, 8, "#8a7a6a");
      this._px(ctx, 2, 10, 3, 3, "#7a6a5a");
      this._px(ctx, 9, 12, 4, 2, "#6a5a4a");
    } else if (type === "platform") {
      this._px(ctx, 0, 0, S, 3, "#9a8272");
      this._px(ctx, 0, 3, S, 10, "#7a6252");
      this._px(ctx, 0, 13, S, 3, "#5a4a3a");
      this._px(ctx, 3, 5, 2, 6, "#6a5242");
      this._px(ctx, 11, 6, 2, 5, "#6a5242");
    } else {
      this._px(ctx, 0, 0, S, 6, "#ff6600");
      this._px(ctx, 0, 6, S, 10, "#cc3300");
      this._px(ctx, 3, 2, 4, 4, "#ffaa00");
      this._px(ctx, 10, 8, 3, 3, "#ff8800");
    }
    return c;
  },

  _buildParallaxZone(zone) {
    const W = 1200;
    const H = 600;
    const skies = [
      ["#0f3460", "#16213e"],
      ["#4a2c17", "#2c1810"],
      ["#b7472a", "#4a1a0a"],
      ["#1a1a2e", "#0a0a15"],
    ];
    const [top, bot] = skies[zone] || skies[0];

    const sky = this._canvas(W, H);
    const sctx = sky.getContext("2d");
    const grad = sctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bot);
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, W, H);

    const hills = this._canvas(W, H);
    const hctx = hills.getContext("2d");
    hctx.fillStyle = zone < 2 ? "#2a4a2a" : "#3a2a1a";
    for (let i = 0; i < 8; i++) {
      const bx = i * 160;
      const bh = 60 + (i % 3) * 40;
      hctx.fillRect(bx, H - bh - 40, 100, bh);
      hctx.fillRect(bx + 20, H - bh - 60, 60, 25);
    }

    const buildings = this._canvas(W, H);
    const bctx = buildings.getContext("2d");
    bctx.fillStyle = "rgba(255,255,255,0.09)";
    for (let i = 0; i < 12; i++) {
      const bx = i * 110;
      const bh = 80 + Math.sin(i * 2.1) * 50;
      bctx.fillRect(bx, H - bh - 30, 50, bh);
      bctx.fillRect(bx + 8, H - bh - 48, 34, 18);
      for (let w = 0; w < 3; w++) {
        bctx.fillStyle = "rgba(255,220,100,0.25)";
        bctx.fillRect(bx + 10 + w * 12, H - bh + 15, 6, 8);
        bctx.fillStyle = "rgba(255,255,255,0.09)";
      }
    }

    return { sky, hills, buildings, factors: [0, 0.15, 0.35] };
  },

  _buildFalafel() {
    const c = this._canvas(16, 16);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#d4a017";
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b8860b";
    ctx.fillRect(4, 4, 3, 3);
    ctx.fillRect(10, 9, 3, 3);
    return c;
  },

  _buildDoor() {
    const c = this._canvas(50, 70);
    const ctx = c.getContext("2d");
    this._px(ctx, 4, 0, 42, 66, "#8b4513");
    this._px(ctx, 8, 4, 34, 58, "#6b3410");
    this._px(ctx, 38, 34, 6, 6, "#ffd700");
    this._px(ctx, 10, 8, 30, 8, "#a0522d");
    return c;
  },

  _buildEnemy(type) {
    const c = this._canvas(30, 30);
    const ctx = c.getContext("2d");
    const cols = ["#444", "#8b0000", "#666"];
    this._px(ctx, 4, 8, 22, 18, cols[type]);
    this._px(ctx, 8, 2, 14, 10, cols[type]);
    this._px(ctx, 10, 6, 4, 4, "#ff0");
    this._px(ctx, 18, 6, 4, 4, "#ff0");
    if (type === 0) {
      this._px(ctx, 10, 18, 10, 8, "#222");
    } else if (type === 1) {
      this._px(ctx, 8, 20, 14, 6, "#fff");
    } else {
      ctx.fillStyle = "#aaf";
      ctx.fillRect(22, 12, 6, 3);
    }
    return c;
  },

  _buildIngredient(type) {
    const colors = { Jameed: "#c8b560", Meat: "#d4513a", Rice: "#f5f5dc", Laban: "#e8e8e8" };
    const c = this._canvas(32, 32);
    const ctx = c.getContext("2d");
    ctx.fillStyle = colors[type];
    ctx.fillRect(2, 2, 28, 28);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 28, 28);
    return c;
  },

  _iconFalafel() {
    return this._buildFalafel();
  },

  _iconHeart(filled) {
    const c = this._canvas(16, 16);
    const ctx = c.getContext("2d");
    ctx.fillStyle = filled ? "#e94560" : "#333";
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.bezierCurveTo(2, 9, 2, 4, 8, 4);
    ctx.bezierCurveTo(14, 4, 14, 9, 8, 14);
    ctx.fill();
    return c;
  },

  drawTile(ctx, tile, x, y, w, h) {
    const pat = ctx.createPattern(tile, "repeat");
    ctx.save();
    ctx.fillStyle = pat;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  },

  drawParallax(ctx, zone, camX, vw, vh) {
    const layers = this.parallax[zone] || this.parallax[0];
    const imgs = [layers.sky, layers.hills, layers.buildings];
    imgs.forEach((img, i) => {
      const scroll = camX * layers.factors[i];
      const iw = img.width;
      let sx = -(scroll % iw);
      while (sx < vw) {
        ctx.drawImage(img, sx, 0);
        sx += iw;
      }
    });
  },

  drawPlayer(ctx, x, y, frame, starving, facing) {
    const sheet = starving ? this.playerStarving : this.player;
    const fw = 32;
    ctx.save();
    if (facing === -1) {
      ctx.translate(x + fw, y);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, frame * fw, 0, fw, 44, 0, 0, fw, 44);
    } else {
      ctx.drawImage(sheet, frame * fw, 0, fw, 44, x, y, fw, 44);
    }
    ctx.restore();
  },
};

Assets.init();
