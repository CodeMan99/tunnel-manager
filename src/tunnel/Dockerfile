# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:8.0

USER root

ARG TUNNEL_UID=1655
ARG TUNNEL_GID=1655

RUN groupadd --gid ${TUNNEL_GID} tunnel \
	&& useradd --create-home --shell /bin/bash --gid ${TUNNEL_GID} --uid ${TUNNEL_UID} tunnel

RUN apt-get update \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends netcat-openbsd openssh-client \
	&& rm -rf /var/lib/apt/lists/*

# add `sudo` to the package list above and uncomment:
#RUN echo "tunnel ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/tunnel \
# && chmod 0440 /etc/sudoers.d/tunnel

USER tunnel
WORKDIR /home/tunnel/manager
ENV PATH="/home/tunnel/.dotnet/tools:$PATH"
ARG SEQ_INGESTION_URL
ARG SEQ_API_KEY
RUN DOTNET_CLI_TELEMETRY_OPTOUT=true dotnet tool install --no-cache --global seqcli \
	&& seqcli config -k connection.serverUrl -v "$SEQ_INGESTION_URL" \
	&& seqcli config -k connection.apiKey -v "$SEQ_API_KEY"

ENV SOCKET_PATH=/home/tunnel/connections/server.sock
ENV TUNNELS_PATH=/home/tunnul/connections/tunnels
COPY src/tunnel/server.sh .
CMD ["/home/tunnel/manager/server.sh"]
