# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Windows kurulumu (edit + render kasası)

Bu projeyi yeni bir Windows makinesinde ayağa kaldırmak için.

### Gereksinimler
- **Node 22 LTS** — <https://nodejs.org> (20/22 LTS önerilir; 24 de çalışır). `.nvmrc` → 22.
- **Git** — <https://git-scm.com>

### Hızlı başlangıç
```bat
git clone <repo-url>
cd idepo-reels
scripts\win\setup.cmd       :: npm install + tip kontrolü (çift tıkla da çalışır)
```

Sonra:
- **Edit / canlı önizleme:** `scripts\win\studio.cmd` (veya `npm run dev`) → tarayıcıda <http://localhost:3000>. Önizleme senin **GPU'nu** kullanır.
- **Render:** `scripts\win\render.cmd` → `IpazaryeriReel` render eder, **tüm CPU çekirdeklerini** kullanır (`--concurrency=%NUMBER_OF_PROCESSORS%`). Başka kompozisyon: `scripts\win\render.cmd SkypeakReel-Light`.

### Performans notu — render hızını ne belirler?
Bu reel'ler DOM/CSS tabanlı; Remotion kareleri **headless Chromium** ile basar.
- **Render hızı = CPU çekirdeği + RAM + SSD.** Ekran kartı bu render'ı hızlandırmaz.
- **GPU** asıl Studio canlı önizlemesinde ve ileride yapılacak WebGL/3D sahnelerde işe yarar.
- RAM yetmezse `render.cmd` içindeki concurrency'i (çekirdek sayısı) elle düşür — her sekme birkaç yüz MB RAM yer.

### ⚠️ Git'te olmayan medya (elle taşı)
`.gitignore` şunları hariç tutar: `public/assets/images/`, `public/assets/videos/`, `public/assets/sfx/`.
- **IpazaryeriReel** tamamen git'te (ürün görselleri `public/assets/stores/` + `src/refStores.json`) → clone sonrası direkt çalışır.
- **SkypeakReel** ve **AtasehirAd** yukarıdaki klasörlerdeki medyaya ihtiyaç duyar; bu dosyaları USB/bulut ile Windows'a **elle kopyala**, yoksa placeholder basarlar.

### Referans mağaza görsellerini yeniden çekmek (opsiyonel)
`scripts/build-stores.sh` mağaza ürün fotoğraflarını çekip `src/refStores.json` üretir. Bu bash scripti; Windows'ta **Git Bash** veya **WSL** ile çalışır ve `~/Desktop/Siteler/` altındaki katalogları bekler. Görseller zaten commit'li olduğu için normalde yeniden çalıştırmana gerek yok.

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
