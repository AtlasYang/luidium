import toast from "react-hot-toast";

export const toasterOptions = {
  className: "",
  style: {
    fontSize: "1.0rem",
  },
};

export const successToast = (message: string) => {
  toast.success(message);
};

export const errorToast = (message: string) => {
  toast.error(message);
};

export const loadingToast = (message: string) => {
  toast.loading(message);
};
