FROM python:3.12

WORKDIR /app

COPY requirements.txt .

RUN pip install requirements.txt

COPY . .

CMD ["python", "app.py"]