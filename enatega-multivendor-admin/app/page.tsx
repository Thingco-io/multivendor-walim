'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getAccessToken, getStoredUser } from '@/lib/utils/methods/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const hasSession = !!getAccessToken() || !!getStoredUser()?.token;

    router.replace(hasSession ? '/home' : '/authentication/login');
  }, [router]);

  return (
    <main className="walim-splash">
      <div className="walim-splash__glow walim-splash__glow--one" />
      <div className="walim-splash__glow walim-splash__glow--two" />

      <section className="walim-splash__card" aria-live="polite" aria-busy="true">
        <div className="walim-splash__mark" aria-hidden="true">
          <span className="walim-splash__ring walim-splash__ring--outer" />
          <span className="walim-splash__ring walim-splash__ring--inner" />
          <span className="walim-splash__dot" />
        </div>

        <p className="walim-splash__eyebrow">WALIM</p>
        <h1 className="walim-splash__title">Preparing your admin space</h1>
        <p className="walim-splash__subtitle">
          We are checking your session and opening the right area for you.
        </p>

        <div className="walim-splash__loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <style jsx>{`
        .walim-splash {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          padding: 24px;
          background:
            radial-gradient(circle at top, rgba(254, 127, 45, 0.22), transparent 34%),
            linear-gradient(180deg, #fff7f1 0%, #ffffff 42%, #f6f4f1 100%);
        }

        .walim-splash__glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(18px);
          opacity: 0.7;
          animation: walimFloat 10s ease-in-out infinite;
        }

        .walim-splash__glow--one {
          top: -80px;
          left: -60px;
          width: 220px;
          height: 220px;
          background: rgba(254, 127, 45, 0.26);
        }

        .walim-splash__glow--two {
          right: -70px;
          bottom: -90px;
          width: 260px;
          height: 260px;
          background: rgba(255, 226, 208, 0.88);
          animation-delay: -4s;
        }

        .walim-splash__card {
          position: relative;
          z-index: 1;
          width: min(100%, 420px);
          border-radius: 28px;
          padding: 40px 32px 34px;
          text-align: center;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(254, 127, 45, 0.14);
          box-shadow:
            0 24px 80px rgba(15, 23, 42, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
        }

        .walim-splash__mark {
          position: relative;
          width: 112px;
          height: 112px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
        }

        .walim-splash__ring {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          border: 2px solid rgba(254, 127, 45, 0.18);
          animation: walimSpin 3.5s linear infinite;
        }

        .walim-splash__ring--inner {
          inset: 16px;
          border-color: rgba(254, 127, 45, 0.34);
          animation-direction: reverse;
          animation-duration: 2.2s;
        }

        .walim-splash__dot {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: linear-gradient(135deg, #fe7f2d, #ffb277);
          box-shadow: 0 0 0 10px rgba(254, 127, 45, 0.12);
          animation: walimPulse 1.6s ease-in-out infinite;
        }

        .walim-splash__eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #fe7f2d;
        }

        .walim-splash__title {
          margin: 0;
          font-size: clamp(28px, 5vw, 36px);
          line-height: 1.1;
          font-weight: 800;
          color: #111827;
        }

        .walim-splash__subtitle {
          margin: 14px 0 0;
          font-size: 15px;
          line-height: 1.7;
          color: #4b5563;
        }

        .walim-splash__loader {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
        }

        .walim-splash__loader span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #fe7f2d;
          animation: walimBounce 1s infinite ease-in-out;
        }

        .walim-splash__loader span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .walim-splash__loader span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes walimSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes walimPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(254, 127, 45, 0.12);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 0 14px rgba(254, 127, 45, 0.08);
          }
        }

        @keyframes walimBounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @keyframes walimFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(12px, -18px, 0) scale(1.05);
          }
        }

        @media (max-width: 640px) {
          .walim-splash__card {
            padding: 34px 22px 28px;
            border-radius: 24px;
          }

          .walim-splash__mark {
            width: 96px;
            height: 96px;
          }
        }
      `}</style>
    </main>
  );
}
