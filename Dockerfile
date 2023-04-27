FROM python:alpine
WORKDIR /app
COPY requirements.txt .
RUN python -m pip install -r requirements.txt
COPY . .
ENV FLASK_RUN_HOST=0.0.0.0
EXPOSE 5000
CMD ["/usr/bin/env", "python", "app.py"]
