"use client";

import { useState, useEffect } from "react";

// Hooks
import useDebounceFunction from "@/lib/hooks/useDebounceForFunction";

// Components
import RenderStepOne from "../step-one";
import RenderStepTwo from "../step-two";
import RenderStepThree from "../step-three";

// Useable Components
import CustomDialog from "@/lib/ui/useable-components/custom-dialog";

// Constants
import { riderRatingAspects } from "@/lib/utils/constants";

// Interfaces
import { IRiderRatingModalProps } from "@/lib/utils/interfaces/ratings.interface";

import { useTranslations } from "next-intl";

/**
 * RiderRatingModal - Collects feedback about the rider who delivered an order.
 *
 * Shown right after the store rating so the customer rates the restaurant and
 * the delivery separately. It reuses the same three steps (stars → aspects →
 * comment) and the same visual language as the store rating modal; only the
 * subject and the aspect chips differ.
 */
export default function RiderRatingModal({
  visible,
  onHide,
  order,
  onSubmitRating,
}: IRiderRatingModalProps) {
  // State management for the multi-step rating process
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);

  const t = useTranslations();

  // Debounced submit to prevent multiple rapid submissions
  const handleSubmitDebounced = useDebounceFunction(() => {
    if (order && rating !== null) {
      onSubmitRating(order._id, rating, comment, selectedAspects);
      onHide();
    }
  }, 500);

  // Reset all form states when modal visibility changes
  useEffect(() => {
    if (visible) {
      setStep(1);
      setRating(null);
      setComment("");
      setSelectedAspects([]);
    }
  }, [visible]);

  const handleRatingSelect = (value: number) => {
    setRating(value);
  };

  const handleAspectToggle = (aspect: string) => {
    setSelectedAspects((prev) =>
      prev.includes(aspect)
        ? prev.filter((a) => a !== aspect)
        : [...prev, aspect]
    );
  };

  const handleNext = () => {
    if (step === 1 && rating !== null) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const riderName = order?.rider?.name ?? t("rider_label");
  // Riders have no avatar on the order, so fall back to their initials.
  const riderInitials = riderName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <CustomDialog
      visible={visible}
      onHide={onHide}
      className="m-0"
      width="594px"
    >
      <div className="flex flex-col items-center md:p-6 p-0 pt-16 rounded-xl gap-4">
        {/* Rider avatar placeholder — initials in the same circle the store
            image occupies in the order rating modal. */}
        <div className="w-[162px] h-[162px] rounded-full overflow-hidden mb-4 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
          <span className="text-5xl font-semibold text-gray-500 dark:text-gray-300">
            {riderInitials || "🛵"}
          </span>
        </div>

        {/* Rider name */}
        <p className="text-gray-600 dark:text-gray-400">{riderName}</p>

        {/* Modal Title */}
        <h2 className="md:text-2xl text-xl font-bold text-black dark:text-white">
          {t("how_was_your_rider_title")}
        </h2>

        {/* Modal Description */}
        <p className="text-gray-600 dark:text-gray-400 text-center md:text-lg text-base">
          {t("rider_rating_modal_description")}
        </p>

        {/* Step 1: Rating stars selection */}
        {step === 1 && (
          <RenderStepOne
            rating={rating}
            handleRatingSelect={handleRatingSelect}
            handleNext={handleNext}
          />
        )}
        {/* Step 2: Select delivery-specific aspects */}
        {step === 2 && (
          <RenderStepTwo
            selectedAspects={selectedAspects}
            handleAspectToggle={handleAspectToggle}
            handleNext={handleNext}
            handleSubmitDebounced={handleSubmitDebounced}
            aspects={riderRatingAspects}
          />
        )}
        {/* Step 3: Add optional comment */}
        {step === 3 && (
          <RenderStepThree
            selectedAspects={selectedAspects}
            handleAspectToggle={handleAspectToggle}
            handleSubmitDebounced={handleSubmitDebounced}
            comment={comment}
            setComment={setComment}
            aspects={riderRatingAspects}
          />
        )}
      </div>
    </CustomDialog>
  );
}
