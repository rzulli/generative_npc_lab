FROM python:3.13.1-slim-bookworm AS app

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl libpq-dev \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && groupadd -g "${GID}" python \
  && useradd --create-home --no-log-init -u "${UID}" -g "${GID}" python \
  && chown python:python -R /app

USER python

COPY --chown=python:python requirements*.txt ./
COPY --chown=python:python bin/ ./bin

RUN chmod 0755 bin/* && bin/pip3-install

ARG FLASK_DEBUG="true"
ENV FLASK_DEBUG="${FLASK_DEBUG}" \
    FLASK_APP="app.create_app()" \
    FLASK_SKIP_DOTENV="true" \
    PYTHONUNBUFFERED="true" \
    PYTHONPATH="." \
    PATH="${PATH}:/home/python/.local/bin" \
    USER="python" \
    TIMEOUT=120


COPY --chown=python:python . .

# RUN if [ "${FLASK_DEBUG}" != "true" ]; then \
#   ln -s /public /app/public && flask digest compile && rm -rf /app/public; fi

#ENTRYPOINT ["/app/bin/docker-entrypoint-web"]

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000","-w","1", "--worker-class","eventlet", "app:create_app()"]