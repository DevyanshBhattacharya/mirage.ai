import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { UploadCloud } from "lucide-react";

const ArtCloak = () => {
  const [preview, setPreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [intensity, setIntensity] = useState(0.01);
  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState({ original: [], cloaked: [] });

  const onDrop = useCallback(async (acceptedFiles) => {
    // Only preview the selected file and store it. Cloaking will be triggered
    // by the explicit "Cloak Image" button.
    const selected = acceptedFiles[0];
    setResponse(null);
    setPreview(URL.createObjectURL(selected));
    setFile(selected);
    // don't call the API here — wait for user to click cloak
    setLoading(false);
  }, []);

  const handleCloak = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setResponse(null);
    setPredictions({ original: [], cloaked: [] });

    const formData = new FormData();
    formData.append("image", file);
    formData.append("intensity", intensity);

    try {
      console.log("Sending image file for cloaking:", file);
      const res = await axios.post(
        "http://127.0.0.1:8080/art-cloak",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Response from server:", res);
      setResponse(`data:image/png;base64,${res.data.cloaked_image}`);
      // Support either nested predictions under `response` or top-level fields
      const payload = res?.data || {};
      const predData = payload.response || payload;
      const cloakedPreds = Array.isArray(predData?.cloaked_top_predictions)
        ? predData.cloaked_top_predictions
        : [];
      const originalPreds = Array.isArray(predData?.original_top_predictions)
        ? predData.original_top_predictions
        : [];
      setPredictions({ original: originalPreds, cloaked: cloakedPreds });
      console.log("Original preds:", originalPreds);
      console.log("Cloaked preds:", cloakedPreds);
    } catch (err) {
      console.error("Cloak request failed:", err);
    } finally {
      setLoading(false);
    }
  }, [file, intensity]);

  useEffect(() => {
    return () => {
      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col justify-center items-center min-h-screen dark:bg-background dark:text-foreground bg-background text-foreground gap-4 w-full p-6">
      <div className="w-[90%] max-w-5xl bg-background/50 dark:bg-background/50 text-foreground rounded-2xl flex flex-col gap-6 items-center justify-center">
        {/* Header */}
        <div className="flex flex-col gap-2 justify-center w-full">
          <h1 className="text-4xl font-[Instrument_Serif]">Protect Your Art</h1>
          <p className="text-foreground/65 text-lg">Cloak your art media to minimize exposure to model training.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
          <div
            {...getRootProps({
              className: `w-full lg:w-1/2 transition-transform duration-300 ease-in-out transform rounded-xl border-2 border-dashed p-6 cursor-pointer hover:scale-[1.02] ${
                isDragActive
                  ? "border-foreground/60 bg-foreground/10"
                  : "border-foreground/20 bg-foreground/5"
              }`,
            })}
          >
            <input
              {...getInputProps({ accept: "image/*" })}
              className="sr-only"
            />

            <div className="flex flex-col items-center justify-center gap-4">
              <UploadCloud className="w-20 h-20 text-foreground/60 animate-bounce" />
              <div className="text-center">
                <p className="text-foreground/90 font-medium">
                  Click to select an image or drag & drop
                </p>
                <p className="text-sm text-foreground/50 mt-1">
                  (image only • max 10 MB)
                </p>
              </div>

              <div className="mt-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-foreground/10 rounded-full border border-foreground/20 text-sm text-foreground/80">
                  <svg
                    className="w-4 h-4 text-foreground/70"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m9 6H7"
                    />
                  </svg>
                  <span>Upload an image</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
              <label className="block text-foreground/80 mb-2">
                Cloak Intensity
              </label>
              <input
                type="range"
                min="0"
                max="0.2"
                step="0.001"
                className="w-full h-2 bg-gradient-to-r from-foreground/40 to-foreground/60 rounded-full appearance-none cursor-pointer"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
              />
              <p className="text-xs text-foreground/50 mt-2">
                Adjust how strongly the cloak alters the image.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleCloak}
                  disabled={!file || loading}
                  className={`inline-block px-4 py-2 text-sm font-medium rounded-md transition duration-300 ${
                    file && !loading
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-foreground/20 text-foreground/50 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Processing…" : "Cloak Image"}
                </button>

                <button
                  onClick={() => {
                    setResponse(null);
                    setPreview(null);
                    setFile(null);
                  }}
                  className="inline-block px-4 py-2 bg-transparent border border-foreground/20 text-foreground rounded-md hover:bg-foreground/5 text-sm transition duration-300"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
              <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl p-4 flex flex-col items-center">
                <p className="text-sm text-foreground/70 mb-3 font-medium">
                  Original
                </p>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-md shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-md border border-dashed border-foreground/20 flex items-center justify-center text-foreground/40">
                    No image selected
                  </div>
                )}
              </div>

              <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl p-4 flex flex-col items-center">
                <p className="text-sm text-foreground/70 mb-3 font-medium">
                  Cloaked
                </p>

                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-t-foreground border-foreground/20 animate-spin"></div>
                    <p className="text-sm text-foreground/50">Processing…</p>
                  </div>
                ) : response ? (
                  <>
                    <img
                      src={response}
                      alt="Cloaked"
                      className="w-48 h-48 object-cover rounded-md shadow-xl"
                    />
                    <div className="mt-4 flex gap-3">
                      <a
                        href={response}
                        download="cloaked.png"
                        className="inline-block px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-md transition duration-300 font-medium"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => {
                          setResponse(null);
                          setPreview(null);
                          setFile(null);
                          setPredictions({ original: [], cloaked: [] });
                        }}
                        className="inline-block px-4 py-2 bg-transparent border border-foreground/20 text-foreground rounded-md hover:bg-foreground/5 transition duration-300"
                      >
                        Reset
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-48 h-48 rounded-md border border-dashed border-foreground/20 flex items-center justify-center text-foreground/40">
                    No cloaked image yet
                  </div>
                )}
              </div>
            </div>

            {(predictions.original.length > 0 ||
              predictions.cloaked.length > 0) && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
                <h3 className="text-foreground/80 font-medium mb-4">
                  Model top predictions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-foreground/70 mb-2">Original</p>
                    {predictions.original.map((p, idx) => {
                      const pct = Math.max(
                        2,
                        Math.min(100, (p.prob || 0) * 100)
                      );
                      return (
                        <div key={`orig-${idx}`} className="mb-3">
                          <div className="flex items-center justify-between text-xs text-foreground/60 mb-1">
                            <span className="truncate pr-2">{p.class}</span>
                            <span>{((p.prob || 0) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-foreground/10 rounded">
                            <div
                              className="h-2 bg-foreground/40 rounded"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    {predictions.original.length === 0 && (
                      <p className="text-xs text-foreground/40">No predictions</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-foreground/70 mb-2">Cloaked</p>
                    {predictions.cloaked.map((p, idx) => {
                      const pct = Math.max(
                        2,
                        Math.min(100, (p.prob || 0) * 100)
                      );
                      return (
                        <div key={`cloak-${idx}`} className="mb-3">
                          <div className="flex items-center justify-between text-xs text-foreground/60 mb-1">
                            <span className="truncate pr-2">{p.class}</span>
                            <span>{((p.prob || 0) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-foreground/10 rounded">
                            <div
                              className="h-2 bg-foreground/50 rounded"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    {predictions.cloaked.length === 0 && (
                      <p className="text-xs text-foreground/40">No predictions</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-foreground/50 mt-1">
              Tip: Right-click the cloaked image or use the Download button to save it locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtCloak;
