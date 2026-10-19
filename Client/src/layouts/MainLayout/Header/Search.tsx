import { message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import "./Search.css";
import { Link } from "react-router-dom";
import requests from "../../../api/requests";
import { IProductItem } from "../../../model/IProduct";
import { getImageUrl } from "../../../utils/image";
import { formatPrice } from "../../../utils/format";

interface SearchProps {
  isSearchShow: boolean;
  setIsSearchShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const Search: React.FC<SearchProps> = ({ isSearchShow, setIsSearchShow }) => {
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IProductItem[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCloseModal = () => {
    setIsSearchShow(false);
    setSearchResults(null);
    setQuery("");
  };

  useEffect(() => {
    if (!isSearchShow) return;

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchShow]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setSearchResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await requests.Catalog.search(query.trim());
        setSearchResults(data);
      } catch {
        message.error("Ürünler getirilemedi. Lütfen tekrar deneyin.");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const showMessage = !searchResults || searchResults.length === 0;

  return (
    <>
      <div
        className={`modal-search ${isSearchShow ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        aria-hidden={!isSearchShow}
      >
        <div className="modal-wrapper">
          <h3 className="modal-title" id="search-title">
            Ürün Ara
          </h3>
          <p className="modal-text">Aradığın ürünleri görmek için yazmaya başla.</p>

          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ürün adı yaz"
              aria-label="Ürün adı"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            />
            <button type="submit" aria-label="Ara">
              <i className="bi bi-search"></i>
            </button>
          </form>

          <div className="search-results">
            <div className="search-heading">
              <h3>ÜRÜN SONUÇLARI</h3>
            </div>
            <div className="results" style={{ display: showMessage ? "flex" : "grid" }} aria-live="polite">
              {!searchResults && (
                <p className="result-item" style={{ justifyContent: "center", width: "100%", margin: 0 }}>
                  Aramak istediğin ürünün adını yaz.
                </p>
              )}

              {searchResults?.length === 0 && (
                <p className="result-item" style={{ justifyContent: "center", width: "100%", margin: 0 }}>
                  Aradığın ürün bulunamadı.
                </p>
              )}

              {searchResults &&
                searchResults.length > 0 &&
                searchResults.map((resultItem) => (
                  <Link
                    to={`/product/${resultItem.id}`}
                    className="result-item"
                    key={resultItem.id}
                    onClick={handleCloseModal}
                  >
                    <img
                      src={getImageUrl(resultItem.mainImage)}
                      className="search-thumb"
                      alt=""
                    />
                    <div className="search-info">
                      <h4>{resultItem.name}</h4>
                      <span className="search-price">{formatPrice(resultItem.newPrice)}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <i
            className="bi bi-x-circle"
            id="close-search"
            role="button"
            tabIndex={0}
            aria-label="Aramayı kapat"
            onClick={handleCloseModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCloseModal();
              }
            }}
          ></i>
        </div>
        <div className="modal-overlay" onClick={handleCloseModal}></div>
      </div>
    </>
  );
};

export default Search;