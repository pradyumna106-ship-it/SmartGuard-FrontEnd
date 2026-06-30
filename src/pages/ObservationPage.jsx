import { useEffect, useRef } from "react";
import { GlassCard, SectionTitle } from "../components/GlassCard";
import { createObjectDetector } from "../service/objectDetector.js";
import { cameraApi } from "../api/cameraApi.js";

export function ObservationPage() {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);

  useEffect(() => {
    let animationId;

    async function init() {
      const detector = await createObjectDetector();
      detectorRef.current = detector;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const res = await cameraApi.getCameraStream();
      const streamUrl = res.data?.url || res.url;

      // ✅ using document.getElementById (as requested)
      const img = document.getElementById("video");

      if (img) {
        img.crossOrigin = "anonymous"; // important
        img.src = streamUrl;
      }

      const renderLoop = () => {
            const img = imgRef.current;
            const canvas = canvasRef.current;
            const det = detectorRef.current;

            if (!img || !canvas || !det) {
                requestAnimationFrame(renderLoop);
                return;
            }

            const ctx = canvas.getContext("2d");

            if (img.complete && img.naturalWidth > 0) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                // clear previous frame
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0);

                const result = det.detect(canvas);

                const detections = result.detections || [];

                detections.forEach((d) => {
                const box = d.boundingBox || d.locationData?.boundingBox;

                if (!box) return;

                const x = box.originX;
                const y = box.originY;
                const w = box.width;
                const h = box.height;

                ctx.strokeStyle = "red";
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, w, h);

                ctx.fillStyle = "red";
                ctx.font = "35px Arial";
                ctx.fillText(
                    d.categories?.[0]?.categoryName || "object",
                    x,
                    y - 5
                );
                });
            }

            requestAnimationFrame(renderLoop);
            };

      renderLoop();
    }

    init();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Live Observation"
        subtitle="Real-time CCTV/IP Webcam Monitoring"
      />

      <div className="relative w-full">
        <img
            id="video"
            ref={imgRef}
            className="w-full rounded-lg"
            alt="camera-stream"
        />

        {/* overlay canvas */}
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        </div>
    </div>
  );
}