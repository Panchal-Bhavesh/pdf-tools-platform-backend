FROM node:20-bullseye-slim

# Install system deps: ghostscript, libreoffice, python (if used)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ghostscript \
    libreoffice \
    python3 \
    python3-pip \
    poppler-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Node deps
COPY package*.json ./
RUN npm ci --production

# If you have Python requirements:
# COPY requirements.txt ./
# RUN pip3 install -r requirements.txt

COPY . .

ENV PORT=3000
EXPOSE 3000

# Replace with your actual start command (e.g., `node server.js` or `npm start`)
CMD ["npm", "start"]
