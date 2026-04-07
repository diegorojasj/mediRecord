FROM python:3.12-alpine
ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.default /app/requirements.txt
RUN python -m pip install --no-cache-dir -r /app/requirements.txt

ARG SERVICE_DIR
COPY ${SERVICE_DIR}/ /app/

CMD ["sh", "-c", "gunicorn src.main:app -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:${PORT:-8000} --access-logfile - --error-logfile - --log-level info"]
