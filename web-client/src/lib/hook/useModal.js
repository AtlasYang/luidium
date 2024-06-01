import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 15);
};

export default function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContainer, setModalContainer] = useState(null);

  useEffect(() => {
    const modalRoot = document.getElementById("modal-root");
    setModalContainer(modalRoot);
    // const el = document.createElement("div");
    // el.id = `modal-${generateRandomString()}`;
    // el.classList.add("modal-container");
    // el.style.position = "fixed";
    // el.style.top = "0";
    // el.style.left = "0";
    // el.style.width = "100%";
    // el.style.height = "100%";
    // el.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    // el.style.backdropFilter = "blur(5px)";
    // el.style.display = "flex";
    // el.style.justifyContent = "center";
    // el.style.alignItems = "center";
    // el.style.transition = "all 0.3s";
    // el.style.zIndex = "1000";

    // modalRoot?.appendChild(el);
    // setModalContainer(el);

    // return () => {
    //   modalRoot?.removeChild(el);
    // };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderModal = (children) => {
    if (!modalContainer) return null;
    return ReactDOM.createPortal(
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key={modalContainer.id}
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(5px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "all 0.3s",
              zIndex: "1000",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>,
      modalContainer
    );
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    renderModal,
  };
}
