import React, { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";
import { TABS } from "./tabs/constants";
import TabHeader from "./tabs/TabHeader";
import DescriptionPanel from "./tabs/DescriptionPanel";
import DetailsPanel from "./tabs/DetailsPanel";
import ReviewsPanel from "./tabs/ReviewsPanel";
import AuthorPanel from "./tabs/AuthorPanel";

const BookTabs = ({ book = {}, activeTab, setActiveTab, isAuthenticated }) => {
  const { isAuthenticated: isAuthenticatedFromContext } = useAuth();
  const [internalTab, setInternalTab] = useState("description");
  const currentTab = activeTab ?? internalTab;
  const setTab = setActiveTab ?? setInternalTab;

  const {
    title = "Untitled",
    author = "Unknown",
    description = "",
    isbn,
    publisher,
    published_date,
    pages,
    language,
    genre,
    stock = 0,
    file_url,
    author_bio,
    author_image_url,
    author_id,
    author_slug,
    _id: bookId,
  } = book || {};

  const effectiveAuth = isAuthenticated ?? isAuthenticatedFromContext;

  return (
    <section className="mt-6 sm:mt-8  bg-white border-t border-gray-200">
      <div className="px-4 sm:px-6 pt-2 sm:pt-4">
        <TabHeader tabs={TABS} currentTab={currentTab} setTab={setTab} />
      </div>
      <div className="px-4 sm:px-6 py-5 sm:py-6">
        {currentTab === "description" && (
          <DescriptionPanel description={description} />
        )}
        {currentTab === "details" && (
          <DetailsPanel
            title={title}
            author={author}
            isbn={isbn}
            publisher={publisher}
            published_date={published_date}
            pages={pages}
            language={language}
            genre={genre}
            stock={stock}
            file_url={file_url}
          />
        )}
        {currentTab === "reviews" && (
          <ReviewsPanel bookId={bookId} isAuthenticated={effectiveAuth} />
        )}
        {currentTab === "author" && (
          <AuthorPanel
            author={author}
            author_id={author_id}
            author_slug={author_slug}
            author_bio={author_bio}
            author_image_url={author_image_url}
          />
        )}
      </div>
    </section>
  );
};

BookTabs.propTypes = {
  book: PropTypes.object,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
  isAuthenticated: PropTypes.bool,
};

export default BookTabs;
