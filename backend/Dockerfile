FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scripts ./scripts

ENV REGNVIKING_DATA_DIR=/app/data \
    REGNVIKING_BACKUP_DIR=/app/backups \
    REGNVIKING_PRODUCTS_DIR=/app/products

VOLUME ["/app/data", "/app/backups", "/app/products"]

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
