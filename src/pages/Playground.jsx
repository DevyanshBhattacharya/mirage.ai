import { useState } from "react";
import axios from "axios";
import { ArrowUp, X } from "lucide-react";

export default function Playground() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  const tags = [
    { id: "face-cloak", label: "Face Cloak", title: "face cloak" },
    { id: "art-cloak", label: "Art Cloak", title: "art cloak" },
    { id: "face-cloak-test", label: "Face Cloak Testing", title: "face cloak testing" },
    { id: "art-cloak-test", label: "Art Cloak Testing", title: "art cloak testing" }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!selectedTag) {
      alert("Please select a tag (Face Cloak, Art Cloak, etc.)");
      return;
    }

    // Get the tag title
    const selectedTagObj = tags.find(tag => tag.id === selectedTag);
    const tagMessage = selectedTagObj ? `I want to ${selectedTagObj.title} this image.` : "";

    // 1. Add user message immediately
    setMessages(prev => [
      ...prev,
      { 
        role: "user", 
        content: input,
        image: imagePreview,
        tag: selectedTag
      }
    ]);

    setLoading(true);

    try {
      // Add loading animation placeholder
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "loading", isLoading: true }
      ]);

      // Create payload with base64 image and tag
      const payload = {
        message: input,
        tag: selectedTag,
        tag_message: tagMessage
      };

      if (imagePreview) {
        payload.image = imagePreview;
      }

      const response = await axios.post(
        `http://localhost:8000/chat`,
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Simulate processing delay (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Replace loading message with actual response
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: "assistant", 
          content: response.data.response, 
          image: response.data.image,
          isLoading: false 
        }
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Error: Could not get response from server.", isLoading: false }
      ]);
    } finally {
      setLoading(false);
      setInput("");
      removeImage();
    }
  };

  return (
    <div className="flex justify-center items-center h-dvh bg-background text-foreground p-4">
  <div className="w-full max-w-5xl h-full flex flex-col gap-4">

    {/* Header */}
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-[Instrument_Serif]">Playground</h1>
      <p className="text-sm text-foreground/60">
        Interact with Mirage.ai through image cloaking and analysis.
      </p>
    </div>

    {/* Tags */}
    <div className="flex gap-2 flex-wrap">
      {tags.map(tag => (
        <button
          key={tag.id}
          onClick={() => setSelectedTag(tag.id)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-full text-sm transition ${
            selectedTag === tag.id
              ? "bg-foreground text-background"
              : "bg-foreground/10 text-foreground hover:bg-foreground/20 border border-foreground/20"
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>

    {/* Chat Container */}
    <div className="flex-1 flex flex-col bg-foreground/5 rounded-2xl border border-foreground/10 overflow-hidden">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-foreground/40 text-sm">
            Upload an image or ask a question to begin.
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-foreground/20 rounded-br-md"
                  : "bg-foreground/10 rounded-bl-md"
              }`}
            >
              {msg.isLoading ? (
                <div className="flex gap-2 items-center">
                  <span className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200" />
                </div>
              ) : (
                <>
                  {msg.image && (
                    <img
                      src={msg.image}
                      className="rounded-lg mb-3 max-h-48"
                      alt="uploaded"
                    />
                  )}
                  {msg.content}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-3 border-t border-foreground/10 bg-foreground/5 flex items-center gap-3">
          <img src={imagePreview} className="h-14 rounded-md" alt="preview" />
          <button
            onClick={removeImage}
            className="text-red-400 hover:text-red-300 transition"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-foreground/10 p-3">
        <div className="flex items-center gap-3 bg-foreground/10 rounded-full px-4 py-2">
          <input
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-foreground/40"
            placeholder="Ask Mirage.ai…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <label className="cursor-pointer text-sm">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            📷
          </label>

          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-foreground text-background rounded-full p-2 hover:bg-foreground/90 transition"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

    </div>
  </div>
</div>

  );
}