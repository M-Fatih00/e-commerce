import { message } from "antd";
import React, { useState, useEffect } from "react";
import "./Search.css";
import { Link } from "react-router-dom";
import requests from "../../../api/requests";
import { IProductItem } from "../../../model/IProduct";

interface SearchProps {
  isSearchShow: boolean;
  setIsSearchShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const Search: React.FC<SearchProps> = ({ isSearchShow, setIsSearchShow }) => {
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IProductItem[] | null>(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleCloseModal = () => {
    setIsSearchShow(false);
    setSearchResults(null);
    setQuery("");
  };

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
        message.error("Ürün getirme hatası!");
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <div className={`modal-search ${isSearchShow ? "show" : ""}`}>
        <div className="modal-wrapper">
          <h3 className="modal-title">Search for products</h3>
          <p className="modal-text">
            Start typing to see products you are looking for.
          </p>

          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Search a product"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="button">
              <i className="bi bi-search"></i>
            </button>
          </form>

          <div className="search-results">
            <div className="search-heading">
              <h3>RESULTS FROM PRODUCT</h3>
            </div>
            <div
              className="results"
              style={{
                display: `${searchResults?.length === 0 || !searchResults ? "flex" : "grid"}`,
              }}
            >
              {!searchResults && (
                <b
                  className="result-item"
                  style={{ justifyContent: "center", width: "100%" }}
                >
                  Ürün Ara...
                </b>
              )}

              {searchResults?.length === 0 && (
                <a
                  href="#"
                  className="result-item"
                  style={{ justifyContent: "center", width: "100%" }}
                >
                  😔 Aradığınız Ürün Bulunamadı 😔
                </a>
              )}

              {searchResults && searchResults.length > 0 &&
                searchResults.map((resultItem) => (
                  <Link
                    to={`/product/${resultItem.id}`}
                    className="result-item"
                    key={resultItem.id}
                    onClick={handleCloseModal}
                  >
                    <img
                      src={`${baseUrl}/img/${resultItem.mainImage}`}
                      className="search-thumb"
                      alt={resultItem.name}
                    />
                    <div className="search-info">
                      <h4>{resultItem.name}</h4>
                      <span className="search-sku">SKU: PD0016</span>
                      <span className="search-price">
                        {resultItem.newPrice.toFixed(2)} ₺
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          <i
            className="bi bi-x-circle"
            id="close-search"
            onClick={handleCloseModal}
          ></i>
        </div>
        <div className="modal-overlay" onClick={handleCloseModal}></div>
      </div>
    </>
  );
};

export default Search;