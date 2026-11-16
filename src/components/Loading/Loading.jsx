import "./Loading.css";

import { tl } from "../../i18n";
import { useTranslation } from "react-i18next";
const Loading = ({ message = "Loading..." }) => {
  useTranslation(); // re-render when the language changes
  return (
    <div className="loading_container">
      <div className="loading_content">
        <div className="loading_spinner_wrapper">
          <div className="loading_spinner_inner"></div>
        </div>
        <p className="loading_message">{tl(message)}</p>
      </div>
    </div>
  );
};

export default Loading;
