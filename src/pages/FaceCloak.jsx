import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { UploadCloud } from "lucide-react";

const FaceCloak = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [intensity, setIntensity] = useState(0.01);
  const [isTargeted, setIsTargeted] = useState(false);
  const [targetImage, setTargetImage] = useState(null);
  const [targetPreview, setTargetPreview] = useState(null);
  const [predictions, setPredictions] = useState({ original: [], cloaked: [] });
  const [rawData, setRawData] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setOriginalFile(file);
    setResponse(null);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleStartCloaking = async () => {
    if (!originalFile) {
      alert("Please upload an image first.");
      return;
    }

    if (isTargeted && !targetImage) {
      alert("Please upload a target image for targeted cloaking.");
      return;
    }

    setLoading(true);
    setPredictions({ original: [], cloaked: [] });
    setRawData(null);
    setMetrics(null);

    const formData = new FormData();
    formData.append("file", originalFile);
    if (isTargeted && targetImage) {
      formData.append("target_image", targetImage);
    }
    formData.append("targeted", isTargeted ? "true" : "false");
    formData.append("intensity", intensity);

    try {
      console.log("Sending images to server...");
      console.log("Original file:", originalFile);
      if (isTargeted) console.log("Target file:", targetImage);

      const res = await axios.post(
        "http://127.0.0.1:8080/face-cloak",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );
      console.log("Response from server:", res);

      setResponse(`data:image/png;base64,${res.data.cloaked_image}`);
      // Extract prediction arrays and metrics from response
      const payload = res?.data || {};
      const dataRoot = payload.response || payload; // support nested structure
      setRawData(payload);
      const originalPreds = Array.isArray(dataRoot.original_top_predictions)
        ? dataRoot.original_top_predictions
        : [];
      const cloakedPreds = Array.isArray(dataRoot.cloaked_top_predictions)
        ? dataRoot.cloaked_top_predictions
        : [];
      setPredictions({ original: originalPreds, cloaked: cloakedPreds });

      // Build metrics object excluding large/non-numeric fields & prediction arrays
      const METRIC_KEYS_WHITELIST = [
        "adv_vs_orig_norm_ratio",
        "attack_success",
        "cosine_similarity_after",
        "cosine_similarity_before",
        "effective_cloaking_score",
        "embedding_distance_original_vs_adv",
        "embedding_moved_norm",
        "embedding_movement_per_pixel",
        "normalized_distance",
        "percent_change_in_distance",
        "similarity_drop",
        // targeted only keys
        "push_toward_target",
        "target_push_strength",
        "target_similarity_after",
        "target_similarity_before",
      ];
      const extracted = {};
      METRIC_KEYS_WHITELIST.forEach((k) => {
        if (dataRoot[k] !== undefined) extracted[k] = dataRoot[k];
      });
      setMetrics(Object.keys(extracted).length ? extracted : null);
      console.log("Metrics:", extracted);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(
        `Failed to process image: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch (e) {
          // ignore
        }
      }
      if (targetPreview) {
        try {
          URL.revokeObjectURL(targetPreview);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [preview, targetPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col justify-center items-center min-h-screen dark:bg-background dark:text-foreground bg-background text-foreground gap-4 w-full p-6">
      <div className="w-[90%] max-w-5xl bg-background/50 dark:bg-background/50 text-foreground rounded-2xl flex flex-col gap-6 items-center justify-center">
        {/* Header */}
        <div className="flex flex-col gap-2 justify-center w-full">
          <h1 className="text-4xl font-[Instrument_Serif]">Protect Your Art</h1>
          <p className="text-foreground/65 text-lg">Cloak your personal media to protect it from AI models training.</p>
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
            {/* Intensity Slider */}
            <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
              <label className="block text-foreground/80 mb-2">
                Cloak Intensity
              </label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.001"
                className="w-full h-2 bg-gradient-to-r from-foreground/40 to-foreground/60 rounded-full appearance-none cursor-pointer"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
              />
              <p className="text-xs text-foreground/50 mt-2">
                Adjust how strongly the cloak alters the image.
              </p>
            </div>

            {/* Targeted Cloaking Toggle */}
            <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
              <label className="block text-foreground/80 mb-2">
                Targeted Cloaking
              </label>
              <input
                type="checkbox"
                className="h-5 w-5 accent-foreground"
                checked={isTargeted}
                onChange={(e) => setIsTargeted(e.target.checked)}
              />
              <p className="text-xs text-foreground/50 mt-2">
                Enable targeted cloaking to specify a target class for more effective protection.
              </p>
              {isTargeted && (
                <div className="mt-4 p-4 bg-foreground/10 border border-foreground/20 rounded-lg">
                  <label className="block text-foreground/80 mb-2">
                    Upload Target Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-foreground/70"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setTargetImage(file);
                      if (file) {
                        setTargetPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-6 items-start justify-between">
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
              {isTargeted ? (
                <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl p-4 flex flex-col items-center">
                  <p className="text-sm text-foreground/70 mb-3 font-medium">
                    Target
                  </p>
                  {targetPreview ? (
                    <img
                      src={targetPreview}
                      alt="Target"
                      className="w-48 h-48 object-cover rounded-md shadow-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-md border border-dashed border-foreground/20 flex items-center justify-center text-foreground/40">
                      No image selected
                    </div>
                  )}
                </div>
              ) : null}

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
                          setOriginalFile(null);
                          setTargetImage(null);
                          setTargetPreview(null);
                          setPredictions({ original: [], cloaked: [] });
                          setRawData(null);
                          setMetrics(null);
                        }}
                        className="inline-block px-4 py-2 bg-transparent border border-foreground/20 text-foreground rounded-md hover:bg-foreground/5 transition-all font-medium"
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

            <p className="text-xs text-foreground/50 mt-1">
              Tip: Right-click the cloaked image or use the Download button to save it locally.
            </p>

            {/* Metrics Dashboard */}
            {metrics && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6 mt-8">
                <h3 className="text-foreground/80 font-medium mb-4 flex items-center gap-2">
                  <span>⚙️ Cloaking Metrics</span>
                  {metrics.attack_success !== undefined && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        metrics.attack_success
                          ? "bg-foreground/20 border-foreground/40 text-foreground/80"
                          : "bg-foreground/10 border-foreground/20 text-foreground/50"
                      }`}
                    >
                      {metrics.attack_success
                        ? "Attack Success"
                        : "Attack Not Successful"}
                    </span>
                  )}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(metrics).map(([key, val]) => {
                    if (key === "attack_success") return null;
                    const label = key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    const isPercent = ["percent_change_in_distance"].includes(
                      key
                    );
                    const isSimilarity =
                      key.includes("similarity") || key.includes("drop");
                    const displayVal = isPercent
                      ? `${parseFloat(val).toFixed(2)}%`
                      : typeof val === "number"
                      ? parseFloat(val).toPrecision(4)
                      : String(val);
                    const barPct =
                      isSimilarity || key === "effective_cloaking_score"
                        ? Math.min(
                            100,
                            Math.max(
                              0,
                              (parseFloat(val) || 0) *
                                (key === "similarity_drop" ? 800 : 100)
                            )
                          )
                        : null;
                    return (
                      <div
                        key={key}
                        className="rounded-lg bg-foreground/10 border border-foreground/20 p-3 flex flex-col gap-1"
                      >
                        <div className="text-xs text-foreground/50 uppercase tracking-wide">
                          {label}
                        </div>
                        <div className="text-sm font-medium text-foreground/80">
                          {displayVal}
                        </div>
                        {barPct !== null && (
                          <div className="h-2 bg-foreground/10 rounded">
                            <div
                              className={`h-2 rounded ${
                                key === "similarity_drop"
                                  ? "bg-foreground/60"
                                  : "bg-foreground/50"
                              }`}
                              style={{ width: `${barPct}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {metrics.target_similarity_before !== undefined && (
                  <p className="text-xs text-foreground/50 mt-3">
                    Target similarity change:{" "}
                    {(
                      metrics.target_similarity_after -
                      metrics.target_similarity_before
                    ).toPrecision(3)}{" "}
                    Δ
                  </p>
                )}
              </div>
            )}

            {/* Predictions Section */}
            {(predictions.original.length > 0 ||
              predictions.cloaked.length > 0) && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6 mt-8">
                <h3 className="text-foreground/80 font-medium mb-4">
                  Model Top Predictions
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

            {/* Raw Data Viewer */}
            {rawData && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-6 mt-8">
                <h3 className="text-foreground/80 font-medium mb-3">
                  Raw Backend Data
                </h3>
                <p className="text-xs text-foreground/50 mb-4">
                  Complete cloak response (image omitted above).
                </p>
                <div className="max-h-72 overflow-auto text-xs font-mono whitespace-pre leading-relaxed bg-foreground/10 p-4 rounded-lg border border-foreground/20 text-foreground/70">
                  {(() => {
                    const { cloaked_image, ...rest } = rawData || {};
                    return JSON.stringify(rest, null, 2);
                  })()}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-10 w-full">
              <button
                onClick={handleStartCloaking}
                disabled={!originalFile || loading}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  !originalFile || loading
                    ? "bg-foreground/20 text-foreground/50 cursor-not-allowed"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {loading ? "Processing..." : "Start Cloaking"}
              </button>
              {(preview || targetPreview) && !response && (
                <button
                  onClick={() => {
                    setPreview(null);
                    setOriginalFile(null);
                    setTargetImage(null);
                    setTargetPreview(null);
                    setResponse(null);
                    setPredictions({ original: [], cloaked: [] });
                    setRawData(null);
                    setMetrics(null);
                  }}
                  className="px-6 py-3 bg-transparent border border-foreground/20 text-foreground rounded-lg hover:bg-foreground/5 transition-all font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceCloak;
