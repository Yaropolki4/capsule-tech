import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.yandexcloud.net",
        pathname: "/**",
      },
      // Раздача статики товаров WB: домен сменился с basket-XX.wbbasket.ru
      // на {регион}-basket-cdn-XX.geobasket.ru (см. wildberries.service.ts),
      // а пресеты каталога (clothes.json) содержат ссылки на десятки разных
      // номеров бакетов старого домена — оба покрываем wildcard'ом целиком,
      // а не перечислением конкретных номеров.
      {
        protocol: "https",
        hostname: "*.wbbasket.ru",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.geobasket.ru",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
