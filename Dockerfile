FROM node:22-slim

# CJK 폰트 + poppler-utils (pdftoppm) + canvas 빌드 의존성
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-cjk \
    poppler-utils \
    build-essential \
    python3 \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install -g corepack@latest && corepack pnpm install && corepack pnpm run build

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
