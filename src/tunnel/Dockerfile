# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/sdk:7.0

USER root

RUN groupadd tunnel \
	&& useradd --create-home --shell /bin/bash --gid tunnel tunnel

RUN apt-get update \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends netcat-openbsd openssh-client \
	&& rm -rf /var/lib/apt/lists/*

# add `sudo` to the package list above and uncomment:
#RUN echo "tunnel ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/tunnel \
# && chmod 0440 /etc/sudoers.d/tunnel

USER tunnel
WORKDIR /home/tunnel/manager
ENV PATH="/home/tunnel/.dotnet/tools:$PATH"
ARG SEQ_URL
ARG SEQ_API_KEY
RUN DOTNET_CLI_TELEMETRY_OPTOUT=true dotnet tool install --no-cache --global seqcli \
	&& seqcli config -k connection.serverUrl -v "$SEQ_URL" \
	&& seqcli config -k connection.apiKey -v "$SEQ_API_KEY"

ENV SOCKET_PATH=/home/tunnel/connections/server.sock
ENV TUNNELS_PATH=/home/tunnul/connections/tunnels
COPY src/tunnel/server.sh .
CMD ["server.sh"]
