# Tunnel Manager

A docker compose application to manage ssh tunnels.

## Work in Progress

This is not yet complete. Very happy to accept pull requests or feedback!

## Application Design

There are three parts to this application. All sub-applications are in a container.

### Browser UI

**Location**: `src/web`

User interface to create, stop, and get the status of ssh tunnels.

This is not finished. The intention is to use nginx for serving static content.

The nginx container will also serve as the proxy server to other parts of the application.

### HTTP API

**Location**: `src/app`

An Express implemention. Simple HTTP routes only.

* `GET /tunnels` - a list of currently open tunnels.
* `PUT /tunnels/:remoteName` - start a ssh tunnel connection.
* `GET /tunnels/:remoteName` - check status of ssh session.
* `DELETE /tunnels/:remoteName` - request exit of ssh session.

### Tunnel Server

**Location**: `src/tunnel`

A bash script that uses `nc` as an interface to call `ssh` commands.

This is the ssh tunnel _persistence_ layer. In this container you will need to configure your ssh client with a volume mounted at `/home/tunnel/.ssh`. Currently, the user is static, with `uid=1000; gid=1000`.

### Logging

**Location**: `docker-compose.yml`

A [datalust/seq](https://datalust.co) container is configured for logging. All other containers can send structured logs here. The `src/web` container will also proxy the admin UI.
