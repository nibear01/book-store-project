import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "./constants";
import KV from "./KV";

export default function DetailsPanel({
  title,
  author,
  isbn,
  publisher,
  published_date,
  pages,
  language,
  genre,
  stock = 0,
  file_url,
}) {
  const { t } = useTranslation('bookView');
  const genreText = useMemo(() => {
    if (Array.isArray(genre)) return genre.join(", ");
    if (typeof genre === "string") return genre || "N/A";
    return "N/A";
  }, [genre]);

  return (
    <div
      id="panel-details"
      role="tabpanel"
      aria-labelledby="tab-details"
      className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6"
    >
      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-base sm:text-lg">{t('bookView.details.bookDetails')}</h3>
        <div className="divide-y divide-gray-100 rounded-md border border-gray-100">
          <KV label={t('bookView.details.title')} value={title} />
          <KV label={t('bookView.details.author')} value={author} />
          <KV label={t('bookView.details.isbnLabel')} value={isbn || t('bookView.details.notAvailable')} />
          <KV label={t('bookView.details.publisher')} value={publisher || t('bookView.details.unknown')} />
          <KV label={t('bookView.details.publicationDate')} value={formatDate(published_date)} />
          <KV label={t('bookView.details.pages')} value={pages || t('bookView.details.unknown')} />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-base sm:text-lg">{t('bookView.details.additionalInfo')}</h3>
        <div className="divide-y divide-gray-100 rounded-md border border-gray-100">
          <KV label={t('bookView.details.languageLabel')} value={language || t('bookView.details.notAvailable')} />
          <KV label={t('bookView.details.genres')} value={genreText} />
          <KV label={t('bookView.details.format')} value={file_url ? t('bookView.details.digital') : t('bookView.details.physical')} />
          <KV
            label={t('bookView.details.availability')}
            value={
              <span className={stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {stock > 0 ? t('bookView.details.inStock') : t('bookView.details.outOfStock')}
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}
