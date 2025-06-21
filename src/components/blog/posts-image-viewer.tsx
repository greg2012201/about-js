"use client";

import { useEffect, useState } from "react";
import Modal from "../modal";

function PostsImageViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    const imageContainers = document.querySelectorAll("img");
    const handleImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLImageElement;
      if (target.tagName.toLowerCase() === "img") {
        setCurrentImage(target.src);
        setIsOpen(true);
      }
    };
    imageContainers.forEach((container) => {
      container.addEventListener("click", handleImageClick);
    });
    return () => {
      imageContainers.forEach((container) => {
        container.removeEventListener("click", handleImageClick);
      });
    };
  }, []);
  return (
    <Modal
      className="max-h-screen w-[1200px] max-w-full"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    >
      {currentImage && (
        <img
          src={currentImage}
          alt="Enlarged view"
          className="max-h-screen max-w-full object-contain"
        />
      )}
    </Modal>
  );
}

export default PostsImageViewer;
