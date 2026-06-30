import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";

const modelPath =`https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite`;

export async function createObjectDetector() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  const detector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: modelPath,
    },
    runningMode: "IMAGE",
    scoreThreshold: 0.5,
    maxResults: 10,
  });

  return detector;
}