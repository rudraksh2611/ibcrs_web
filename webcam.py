import cv2
from ultralytics import YOLO

# -------------------- PATHS --------------------
model_path = r"D:\IBCRS\best (4).pt"
image_path = r"D:\IBCRS\biopic1.jpeg"
output_path = r"D:\IBCRS\biopic1_detected.jpg"

# -------------------- LOAD MODEL --------------------
model = YOLO(model_path)

# -------------------- READ IMAGE --------------------
image = cv2.imread(image_path)

if image is None:
    print("❌ Error: Could not open image.")
    exit()

print("✅ Running IBCRS Detection on biopic.jpeg...")

# -------------------- RUN DETECTION --------------------
results = model(image)
annotated_image = results[0].plot()

# -------------------- SAVE FULL-QUALITY IMAGE --------------------
cv2.imwrite(output_path, annotated_image)

# -------------------- DISPLAY (NO STRETCHING) --------------------
cv2.namedWindow("IBCRS Detection", cv2.WINDOW_NORMAL)
cv2.imshow("IBCRS Detection", annotated_image)

cv2.waitKey(0)
cv2.destroyAllWindows()

print(f"🎯 Detection finished. Output saved at: {output_path}")
