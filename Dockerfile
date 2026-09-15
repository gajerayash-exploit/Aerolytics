FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV/Pillow
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements & install (using CPU-optimized PyTorch wheel)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r ./backend/requirements.txt

# Copy backend app and models
COPY backend/ ./backend/
COPY models/ ./models/

# Set working directory to backend
WORKDIR /app/backend

ENV PORT=8000
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
