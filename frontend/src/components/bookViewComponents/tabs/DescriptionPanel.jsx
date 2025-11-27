import React from "react";
import { useTranslation } from "react-i18next";
import ReadMore from "./ReadMore";

export default function DescriptionPanel({ description }) {
  const { t } = useTranslation('bookView');
  return (
    <div
      id="panel-description"
      role="tabpanel"
      aria-labelledby="tab-description"
      className="prose max-w-none"
    >
      <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
        <ReadMore text={description || t('bookView.description.noDescription')} />
      </p>
    </div>
  );
}
