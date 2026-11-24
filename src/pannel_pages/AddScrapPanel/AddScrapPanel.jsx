import { useRef, useState } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
import Input from "../../components/Input/Input";
import Button from "../../components/button/Button";
import { CITIES, FABRICS } from "../../pages/Scraps/scrapsDemo";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import { createListing, updateListing } from "../../backend/services/refabService";
import { tl } from "../../i18n";
import "./AddScrapPanel.css";

/**
 * Post / edit a Fashion Refab listing. New photos are uploaded to Cloudinary, then the listing is
 * saved through the backend (/api/refab). `onSubmit` gets the saved listing back.
 */
const MAX_PHOTOS = 8;
const MAX_PHOTO_MB = 10;

const emptyForm = (phone = "") => ({
  title: "",
  fabric: "Ankara",
  quantity: "",
  colours: [],
  price: "",
  isFree: false,
  city: "Lagos",
  area: "",
  phone,
  pickupOnly: false,
  description: "",
  photos: [],
});

/** Form values for a new listing, or the listing being edited */
const formFrom = (initialData, defaultPhone) =>
  initialData
    ? {
        ...emptyForm(defaultPhone),
        ...initialData,
        price: initialData.price ? String(initialData.price) : "",
        isFree: initialData.price === 0,
        // already-uploaded photos are URLs; new ones are files waiting to upload
        photos: (initialData.images || []).map((url) => ({ id: url, url })),
      }
    : emptyForm(defaultPhone);

// The slide-in menu unmounts this panel when it closes, so each opening starts from fresh state.
const AddScrapPanel = ({ onClose, onSubmit, initialData = null, defaultPhone = "" }) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(() => formFrom(initialData, defaultPhone));
  const [colourDraft, setColourDraft] = useState("");
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState("");
  const [saveError, setSaveError] = useState("");
  const editMode = Boolean(initialData);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };
  const onField = (field) => (e) => set(field, e.target.value);

  const addPhotos = (fileList) => {
    const all = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    const files = all.filter((f) => f.size <= MAX_PHOTO_MB * 1024 * 1024);
    if (files.length < all.length) setErrors((prev) => ({ ...prev, photos: tl(`Photos must be under ${MAX_PHOTO_MB} MB`) }));
    if (!files.length) return;
    setForm((prev) => {
      const room = MAX_PHOTOS - prev.photos.length;
      const added = files.slice(0, room).map((file) => ({ id: `${file.name}-${file.lastModified}-${Math.random()}`, url: URL.createObjectURL(file), file }));
      return { ...prev, photos: [...prev.photos, ...added] };
    });
    if (files.length === all.length && errors.photos) setErrors((prev) => ({ ...prev, photos: "" }));
  };

  const removePhoto = (id) => setForm((prev) => ({ ...prev, photos: prev.photos.filter((p) => p.id !== id) }));
  // The first photo is the cover buyers see first
  const makeCover = (id) =>
    setForm((prev) => {
      const photo = prev.photos.find((p) => p.id === id);
      return photo ? { ...prev, photos: [photo, ...prev.photos.filter((p) => p.id !== id)] } : prev;
    });

  const addColour = () => {
    const value = colourDraft.trim().replace(/,$/, "");
    if (!value) return;
    if (!form.colours.some((c) => c.toLowerCase() === value.toLowerCase())) set("colours", [...form.colours, value]);
    setColourDraft("");
  };

  const validate = () => {
    const next = {};
    if (!form.photos.length) next.photos = tl("Add at least one photo");
    if (!form.title.trim()) next.title = tl("Give your listing a title");
    if (!form.quantity.trim()) next.quantity = tl("Say how much you have");
    if (!form.isFree && !(Number(form.price) > 0)) next.price = tl("Enter a price or mark it as free");
    if (!form.area.trim()) next.area = tl("Add your area so buyers know where to pick up");
    if (!form.phone.trim()) next.phone = tl("Add a phone number buyers can reach");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !validate()) return;
    setSaveError("");
    try {
      // 1. Upload the new photos (in order, so the cover stays first)
      const toUpload = form.photos.filter((p) => p.file);
      const images = [];
      let done = 0;
      for (const photo of form.photos) {
        if (photo.file) {
          done += 1;
          setSaving(tl(`Uploading photo ${done} of ${toUpload.length}…`));
          images.push(await uploadToCloudinary(photo.file));
        } else {
          images.push(photo.url);
        }
      }
      // 2. Save the listing
      setSaving(tl("Saving…"));
      const payload = {
        title: form.title.trim(),
        fabric: form.fabric,
        quantity: form.quantity.trim(),
        colours: form.colours,
        price: form.isFree ? 0 : Number(form.price),
        city: form.city,
        area: form.area.trim(),
        phone: form.phone.trim(),
        pickupOnly: form.pickupOnly,
        description: form.description.trim(),
        images,
      };
      const saved = editMode ? await updateListing(initialData.id, payload) : await createListing(payload);
      onSubmit?.(saved, editMode);
    } catch (error) {
      if (error.fields) setErrors((prev) => ({ ...prev, ...error.fields }));
      setSaveError(error.message || tl("Could not save the listing. Please try again."));
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="asp_panel">
      <div className="asp_header">
        <button className="asp_close_btn" onClick={onClose} type="button" aria-label={tl("Close")}>
          <X size={20} />
        </button>
        <h2 className="asp_title">{tl(editMode ? "Edit listing" : "New Fashion Refab listing")}</h2>
      </div>

      <form onSubmit={handleSubmit} className="asp_form" noValidate>
        {/* Photos */}
        <div className="asp_section">
          <p className="asp_label">
            {tl("Photos")} <span>({form.photos.length}/{MAX_PHOTOS})</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="asp_file_input"
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          {errors.photos && <p className="asp_error">{errors.photos}</p>}
          {form.photos.length === 0 ? (
            <div
              className={`asp_drop ${dragOver ? "is-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addPhotos(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="asp_drop_icon">
                <Upload size={24} />
              </div>
              <p>{tl("Add photos of your fabric")}</p>
              <span>{tl("Up to 8 photos. Show the whole pile and a few close-ups; clear, daylight photos sell faster.")}</span>
            </div>
          ) : (
            <div className="asp_photos">
              {form.photos.map((photo, i) => (
                <div key={photo.id} className="asp_photo">
                  <img src={photo.url} alt="" />
                  {i === 0 ? (
                    <span className="asp_cover">{tl("Cover")}</span>
                  ) : (
                    <button type="button" className="asp_cover asp_make_cover" onClick={() => makeCover(photo.id)}>
                      {tl("Make cover")}
                    </button>
                  )}
                  <button type="button" className="asp_photo_remove" onClick={() => removePhoto(photo.id)} aria-label={tl("Remove photo")}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              {form.photos.length < MAX_PHOTOS && (
                <button type="button" className="asp_photo_add" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={20} />
                  <span>{tl("Add")}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="asp_section">
          <Input
            type="text"
            label={tl("Title")}
            placeholder={tl("e.g. Mixed Ankara offcuts, bright prints")}
            value={form.title}
            onChange={onField("title")}
            error={errors.title}
            variant="rounded"
            maxLength={70}
          />
        </div>

        <div className="asp_row">
          <Input
            type="select"
            label={tl("Fabric type")}
            value={form.fabric}
            onChange={onField("fabric")}
            variant="rounded"
            options={FABRICS.map((f) => ({ value: f, label: tl(f) }))}
          />
          <Input
            type="text"
            label={tl("Quantity")}
            placeholder={tl("e.g. 2 bags, 40 pieces")}
            value={form.quantity}
            onChange={onField("quantity")}
            error={errors.quantity}
            variant="rounded"
          />
        </div>

        {/* Colours */}
        <div className="asp_section">
          <p className="asp_label">{tl("Colours")}</p>
          <div className="asp_chips_input">
            {form.colours.map((c) => (
              <span key={c} className="asp_chip">
                {c}
                <button type="button" onClick={() => set("colours", form.colours.filter((x) => x !== c))} aria-label={`${tl("Remove")} ${c}`}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              value={colourDraft}
              placeholder={form.colours.length ? "" : tl("Type a colour and press Enter")}
              onChange={(e) => {
                if (e.target.value.endsWith(",")) {
                  setColourDraft(e.target.value);
                  setTimeout(addColour, 0);
                } else setColourDraft(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addColour();
                } else if (e.key === "Backspace" && !colourDraft && form.colours.length) {
                  set("colours", form.colours.slice(0, -1));
                }
              }}
              onBlur={addColour}
            />
          </div>
        </div>

        {/* Price */}
        <div className="asp_section">
          <div className="asp_price_head">
            <p className="asp_label">{tl("Price (₦)")}</p>
            <label className="asp_switch">
              <input type="checkbox" checked={form.isFree} onChange={(e) => set("isFree", e.target.checked)} />
              <span className="asp_switch_track" />
              <span>{tl("Give away for free")}</span>
            </label>
          </div>
          {!form.isFree ? (
            <Input
              type="number"
              placeholder={tl("e.g. 8000")}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              error={errors.price}
              variant="rounded"
              min="0"
            />
          ) : (
            <p className="asp_free_note">{tl("Listed as Free. Great for schools, students and craft clubs.")}</p>
          )}
        </div>

        <div className="asp_row">
          <Input
            type="select"
            label={tl("City")}
            value={form.city}
            onChange={onField("city")}
            variant="rounded"
            options={CITIES.map((c) => ({ value: c, label: c }))}
          />
          <Input
            type="text"
            label={tl("Area")}
            placeholder={tl("e.g. Yaba")}
            value={form.area}
            onChange={onField("area")}
            error={errors.area}
            variant="rounded"
          />
        </div>

        <div className="asp_section">
          <Input
            type="tel"
            label={tl("Contact phone (WhatsApp)")}
            placeholder="+234 801 234 5678"
            value={form.phone}
            onChange={onField("phone")}
            error={errors.phone}
            variant="rounded"
          />
          <label className="asp_switch">
            <input type="checkbox" checked={form.pickupOnly} onChange={(e) => set("pickupOnly", e.target.checked)} />
            <span className="asp_switch_track" />
            <span>{tl("Pick-up only (no delivery)")}</span>
          </label>
        </div>

        <div className="asp_section">
          <Input
            type="textarea"
            label={tl("Description")}
            placeholder={tl("Size of the pieces, condition, what they're good for...")}
            value={form.description}
            onChange={onField("description")}
            variant="rounded"
            rows={4}
          />
        </div>

        <p className="asp_hint">{tl("Your listing shows on the public Fashion Refab page. Buyers contact you directly.")}</p>

        {saveError && <p className="asp_error" role="alert">{saveError}</p>}

        <Button type="submit" variant="primary" fullWidth className="asp_submit" disabled={Boolean(saving)}>
          {saving || tl(editMode ? "Save changes" : "Post listing")}
        </Button>
      </form>
    </div>
  );
};

export default AddScrapPanel;
