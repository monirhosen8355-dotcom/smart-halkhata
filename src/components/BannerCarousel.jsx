import { useEffect, useState } from "react";

const banners = [
  {
    id: 1,
    emoji: "📒",
    title: "Smart Halkhata",
    text: "সহজে রাখুন আপনার দোকানের সম্পূর্ণ হিসাব",
    button: "Explore",
    className: "banner-one",
  },
  {
    id: 2,
    emoji: "💰",
    title: "হিসাব রাখুন আরও সহজে",
    text: "Customer, Due ও Payment — সবকিছু এক জায়গায়",
    button: "Manage Customers",
    className: "banner-two",
  },
  {
    id: 3,
    emoji: "🚀",
    title: "Smart Business",
    text: "আপনার ব্যবসার হিসাব হোক আরও দ্রুত ও স্মার্ট",
    button: "Get Started",
    className: "banner-three",
  },
];

function BannerCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const banner = banners[active];

  return (
    <div className="banner-carousel">
      <div
        className={`banner-slide ${banner.className}`}
        key={banner.id}
      >
        <div className="banner-content">

          {/* ICON */}
          <div className="banner-emoji">
            {banner.emoji}
          </div>

          {/* TEXT */}
          <div className="banner-text">
            <div className="banner-title">
              {banner.title}
            </div>

            <div className="banner-description">
              {banner.text}
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="button"
            className="banner-button"
          >
            {banner.button}
            <span>→</span>
          </button>

        </div>
      </div>

      {/* DOTS */}
      <div className="banner-dots">
        {banners.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={`banner-dot ${
              active === index ? "active" : ""
            }`}
            onClick={() => setActive(index)}
            aria-label={`Banner ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
        .banner-carousel {
          width: 100%;
          margin: 4px auto 22px;
          position: relative;
        }

        .banner-slide {
          width: 100%;
          min-height: 118px;
          border-radius: 22px;
          overflow: hidden;
          position: relative;
          color: #fff;
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.20);
          animation: bannerFade 0.45s ease;
        }

        .banner-slide::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          right: -55px;
          top: -90px;
        }

        .banner-slide::after {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          left: 35%;
          bottom: -100px;
        }

        .banner-one {
          background: linear-gradient(
            135deg,
            #2563eb,
            #4f46e5,
            #7c3aed
          );
        }

        .banner-two {
          background: linear-gradient(
            135deg,
            #059669,
            #10b981,
            #14b8a6
          );
        }

        .banner-three {
          background: linear-gradient(
            135deg,
            #ea580c,
            #f97316,
            #eab308
          );
        }

        .banner-content {
          min-height: 118px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 2;
        }

        .banner-emoji {
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
          line-height: 1;
          backdrop-filter: blur(8px);
        }

        .banner-text {
          flex: 1;
          min-width: 0;
        }

        .banner-title {
          font-size: 18px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 5px;
        }

        .banner-description {
          font-size: 12px;
          line-height: 1.45;
          color: rgba(255, 255, 255, 0.88);
        }

        .banner-button {
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
          padding: 10px 13px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: 0.2s ease;
        }

        .banner-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .banner-button:active {
          transform: scale(0.96);
        }

        .banner-dots {
          position: absolute;
          left: 50%;
          bottom: 8px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 5;
        }

        .banner-dot {
          width: 6px;
          height: 6px;
          padding: 0;
          margin: 0;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.45);
          cursor: pointer;
          transition: 0.25s ease;
        }

        .banner-dot.active {
          width: 18px;
          border-radius: 999px;
          background: #fff;
        }

        @keyframes bannerFade {
          from {
            opacity: 0.45;
            transform: translateX(8px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 520px) {
          .banner-slide {
            min-height: 105px;
            border-radius: 19px;
          }

          .banner-content {
            min-height: 105px;
            padding: 15px 14px;
            gap: 10px;
          }

          .banner-emoji {
            width: 45px;
            height: 45px;
            border-radius: 14px;
            font-size: 23px;
          }

          .banner-title {
            font-size: 15px;
          }

          .banner-description {
            font-size: 10.5px;
          }

          .banner-button {
            padding: 8px 9px;
            font-size: 9px;
          }
        }

        @media (max-width: 380px) {
          .banner-button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default BannerCarousel;