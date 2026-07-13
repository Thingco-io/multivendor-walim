"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from '@/lib/ui/useable-components/safe-image';
import { hasValidAuthToken } from "@/lib/utils/methods/auth";

const PlayStoreLink =
  "";
const AppleStoreLink =
  "";
import WalimLogo from "@/lib/utils/assets/svg/WalimLogo";
import { useTranslations } from "next-intl";

const AppLinks = () => {

  const t = useTranslations()
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();
  const handleButtonClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    setIsLogin(hasValidAuthToken());
  }, []);

  const logoClickHandler = () => {
    if (isLogin) {
      router.push("/");
    }
    router.push("/");
  };

  return (
    <div>
      <div className="mb-4 cursor-pointer" onClick={logoClickHandler}>
        <div className="flex items-center gap-2">
          <WalimLogo className="h-12 w-12" />
          <span className="text-2xl font-bold tracking-[0.22em] text-white">
            WALIM
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => handleButtonClick(AppleStoreLink)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={t("apple_app_store_link")}
            width={130}
            height={39}
            src={
              "https://images.ctfassets.net/23u853certza/7xaqvusYmbDlca5umD9bZo/a0fa3e1c7ca41a70c6285d6c7b18c92b/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
            }
            loading="lazy"
          />
        </button>
        <button onClick={() => handleButtonClick(PlayStoreLink)}>
          <Image
            alt={t("google_play_store_link")}
            width={130}
            height={130}
            src={
              "https://images.ctfassets.net/23u853certza/1Djo4jOj0doR5PfWVzj9O6/d52acac7f94db66263f5ad9e01c41c82/google-play-badge.png"
            }
          />
        </button>
      </div>
    </div>
  );
};

export default AppLinks;
