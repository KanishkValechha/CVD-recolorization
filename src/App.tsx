import { useState, useRef, useEffect } from "react";

export default function App() {
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [deficiency, setDeficiency] = useState("deuteranopia");
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activateCamera = () => {
    setCameraActive(true);
  };

  const captureImage = () => {
    const videoElement = document.getElementById("camera") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          setCapturedImage(file);
          setPreviewURL(URL.createObjectURL(blob));
          setCameraActive(false);
        }
      }, "image/jpeg");
    }
  };

  const handleProcess = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", capturedImage);

      const res = await fetch(
        `http://${window.location.hostname}:5000/correct/${deficiency}?strength=1.0`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process image");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageURL(url);
    } catch (error) {
      console.error("Error processing image:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to process image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setPreviewURL(null);
    setImageURL(null);
    setErrorMessage(null);
  };

  // Camera component that activates when needed
  const CameraComponent = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (cameraActive && videoRef.current) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.error("Error accessing camera:", err);
            setCameraActive(false);
            setErrorMessage(
              "Unable to access camera. Please check permissions."
            );
          });
      }

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    }, [cameraActive]);

    return (
      <div
        style={{
          display: cameraActive ? "block" : "none",
          position: "relative",
        }}
      >
        <video
          id="camera"
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", maxHeight: "70vh", borderRadius: "8px" }}
        />
        <button
          onClick={captureImage}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#f44336",
            border: "4px solid white",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "white",
              margin: "4px auto",
            }}
          />
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        backgroundColor: "#f5f8fa",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#1a73e8",
          fontSize: "28px",
        }}
      >
        Color Vision Deficiency Correction
      </h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: "10px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Select Your Color Vision Deficiency Type:
        </label>
        <select
          value={deficiency}
          onChange={(e) => setDeficiency(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #ddd",
            fontSize: "16px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <option value="protanopia">Protanopia (Red-Blind)</option>
          <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
          <option value="tritanopia">Tritanopia (Blue-Blind)</option>
        </select>
      </div>

      {!cameraActive && !capturedImage && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={activateCamera}
            style={{
              width: "100%",
              padding: "15px",
              background: "linear-gradient(to right, #4CAF50, #45a049)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "10px" }}
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            Open Camera
          </button>
        </div>
      )}

      {cameraActive && <CameraComponent />}

      {errorMessage && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#ffe6e6",
            color: "#d32f2f",
            borderRadius: "6px",
            marginBottom: "20px",
            borderLeft: "4px solid #d32f2f",
          }}
        >
          <strong>Error: </strong>
          {errorMessage}
        </div>
      )}

      {previewURL && !imageURL && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: "#333", marginBottom: "15px" }}>Preview Image</h3>
          <img
            src={previewURL}
            alt="preview"
            style={{
              maxWidth: "100%",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              maxHeight: "50vh",
              objectFit: "contain",
            }}
          />
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <button
              onClick={resetCapture}
              style={{
                flex: "1",
                padding: "12px 15px",
                background: "#f5f5f5",
                color: "#333",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
            >
              Retake
            </button>
            <button
              onClick={handleProcess}
              disabled={isLoading}
              style={{
                flex: "2",
                padding: "12px 20px",
                background: "linear-gradient(to right, #1a73e8, #1e88e5)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              {isLoading ? "Processing..." : "Process Image"}
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #1a73e8",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1.5s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p style={{ color: "#555", fontSize: "16px" }}>
            Processing your image...
          </p>
          <p style={{ color: "#888", fontSize: "14px", marginTop: "10px" }}>
            This may take a few moments
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {imageURL && (
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              marginBottom: "20px",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
            }}
          >
            <div style={{ flex: 1, padding: "10px" }}>
              <h4 style={{ color: "#555", margin: "0 0 10px 0" }}>
                Original Image
              </h4>
              <img
                src={previewURL || ""}
                alt="original"
                style={{
                  maxWidth: "100%",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </div>
            <div style={{ flex: 1, padding: "10px" }}>
              <h4 style={{ color: "#1a73e8", margin: "0 0 10px 0" }}>
                Corrected Image
              </h4>
              <img
                src={imageURL}
                alt="corrected"
                style={{
                  maxWidth: "100%",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </div>

          <p style={{ color: "#555", margin: "10px 0 20px 0" }}>
            This image has been corrected for{" "}
            {deficiency.charAt(0).toUpperCase() + deficiency.slice(1)}
          </p>

          <div style={{ marginTop: "15px", display: "flex", gap: "15px" }}>
            <a
              href={imageURL}
              download={`cvd-corrected-${deficiency}.png`}
              style={{
                textDecoration: "none",
                background: "linear-gradient(to right, #1a73e8, #1e88e5)",
                color: "white",
                padding: "12px 20px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                fontWeight: "bold",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Image
            </a>
            <button
              onClick={resetCapture}
              style={{
                padding: "12px 20px",
                background: "#f5f5f5",
                color: "#333",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "8px" }}
              >
                <path d="M3 2v6h6"></path>
                <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                <path d="M21 22v-6h-6"></path>
                <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
              </svg>
              Take New Photo
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          textAlign: "center",
          padding: "20px",
          color: "#666",
          fontSize: "14px",
        }}
      >
        <p>
          CVD Recolorization Tool - Using computer vision to help people with
          color vision deficiency
        </p>
      </div>
    </div>
  );
}
