import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import Button from "../../../components/button/Button";
import Input from "../../../components/Input/Input";
import { useTheme } from "../../../contexts/ThemeContext";
import "./EditNotesModal.css";

import { useTranslation } from "react-i18next";
import { t as tx } from "../../../i18n";

const EditNotesModal = ({ isOpen, onClose, onSave, currentNote = "" }) => {
  const { t: tx } = useTranslation();
  const { isDark } = useTheme();

  const [noteText, setNoteText] = useState(currentNote);

  const handleSave = () => {
    onSave(noteText);
    onClose();
  };

  const handleClose = () => {
    setNoteText(currentNote); // Reset to original note
    onClose();
  };

  // Update local state when currentNote changes
  useEffect(() => {
    setNoteText(currentNote);
  }, [currentNote]);

  if (!isOpen) return null;

  return (
    <div className="edit_notes_modal_overlay">
      <div
        className={`edit_notes_modal ${isDark ? "dark-theme" : "light-theme"}`}
      >
        {/* Header */}
        <div className="edit_notes_modal_header">
          <h3 className="edit_notes_modal_title">{tx("auto.note_2c92")}</h3>
          <button className="edit_notes_modal_close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="edit_notes_modal_content">
          {/* Notes Input */}
          <div className="edit_notes_form_group">
            <Input
              type="textarea"
              placeholder={tx("auto.eGAboutClient_7e4d")}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              variant="rounded"
              rows={6}
            />
          </div>

          {/* Save Button */}
          <div className="edit_notes_modal_actions">
            <Button
              variant="primary"
              size="large"
              icon={<Save size={20} />}
              onClick={handleSave}
              className="edit_notes_save_btn"
            >
              {tx("auto.save_efc0")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNotesModal;
