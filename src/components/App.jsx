import React, { Component } from "react";

import Searchbar from "./Searchbar/SearchBar.jsx";
import ImageGallery from "./ImageGallery/ImageGallery.jsx";
import Button from "./Button/Button.jsx";
import Modal from "./Modal/Modal.jsx";
import Loader from "./Loader/Loader.jsx";

import { getImgs } from "./Api/Api.js";

import "./App.module.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      query: "",
      page: 1,
      loading: false,
      largeImageURL: "",
      showModal: false,
      hasMoreImages: true,
    };
  }

  handleSearch = (newQuery) => {
    this.setState({
      query: newQuery,
      page: 1,
      images: [],
      lastSearch: newQuery,
    });
  };

  handleInitialLoad = () => {
    this.getImgs();
  };

  handleLoadMore = () => {
    const { hasMoreImages, lastSearch } = this.state;

    if (!hasMoreImages) {
      return;
    }

    this.setState(
      (prevState) => ({
        page: prevState.page + 1,
        loading: true,
      }),
      () => {
        if (lastSearch) {
          this.getImgs(lastSearch, this.state.page);
        } else {
          this.handleInitialLoad();
        }
      }
    );
  };

  handleImageClick = (url) => {
    this.setState({
      largeImageURL: url,
      showModal: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      largeImageURL: "",
      showModal: false,
    });
  };

  componentDidMount() {
    if (this.state.page === 1 && this.state.query) {
      this.getImgs();
    }
    this.handleInitialLoad();
  }

  componentDidUpdate(_, prevState) {
    const { query, page, loading } = this.state;

    if (prevState.query === query && prevState.page === page) {
      return;
    }

    if (!loading) {
      this.getImgs();
    }
  }

  getImgs = async (query = this.state.query, page = this.state.page) => {
    try {
      const newImages = await getImgs(query, page);

      this.setState((prevState) => ({
        images: [
          ...prevState.images,
          ...newImages.map((image) => ({
            ...image,
            alt: image.tags || "Image",
          })),
        ],
        hasMoreImages: newImages.length === 12,
      }));
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { images, loading, hasMoreImages, largeImageURL, showModal } =
      this.state;

    return (
      <div>
        <Searchbar onSubmit={this.handleSearch} />

        <ImageGallery images={images} onImageClick={this.handleImageClick} />

        {loading && <Loader />}

        {hasMoreImages && (
          <Button onClick={this.handleLoadMore} show={hasMoreImages}>
            Load more
          </Button>
        )}

        {showModal && (
          <Modal
            onClose={this.handleCloseModal}
            largeImageURL={largeImageURL}
          />
        )}
      </div>
    );
  }
}

export default App;
