import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 디렉터리의 lockfile 오인식 방지 — 이 프로젝트를 루트로 고정.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
