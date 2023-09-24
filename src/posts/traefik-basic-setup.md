---
layout: "../layouts/BlogPostLayout.astro"
title: "Traefik v2 base setup: HTTP to HTTPS, automatic SSL certificates and securing the dashboard"
excerpt: "I will present a traefik.toml file and docker-compose configuration to set up Traefik v2 with most important features: auto SSL, global HTTP to HTTPS redirection and secure dashboard."
categories:
  - "Traefik"
date: "2020-05-02"
slug: traefik-basic-setup
cover_image:
  src: "/src/assets/blog/covers/traefik-cover.png"
  alt: "Traefik"
  credit_text: "https://doc.traefik.io/traefik/"
  credit_link: "https://doc.traefik.io/traefik/"
---

When I started deploying my apps on actual servers, I always had a problem with the global architecture of the server: I had a lot of Docker containers, which needed to be connected to the internet. But, because only one port 80 and 443 can be exposed on a single server (I don't recommend exposing any other ports, rather connect services to a domain and create a virtual host - e. g. your API running on port 3000 should be proxied to with a domain `api.example.com`), I had to create a separate Nginx container to proxy all requests from the internet to my containers. This was annoying as I had to constantly modify my Nginx configuration files and generate Let's encrypt certificates manually or use additional containers to do the automation (like [`docker-letsencrypt-nginx-proxy-companion`](https://github.com/nginx-proxy/docker-letsencrypt-nginx-proxy-companion)).

[Traefik](https://docs.traefik.io/) is a technology that I have fallen in love with ever since I discovered it because it solves this very problem, but in a much simpler way, without modifying any configuration files for the most part. I am now using Traefik to:

- connect all my Docker containers and expose them to the internet through a single Traefik proxy,
- automate all SSL certificates,
- proxy to external URLs (like S3 buckets),
- secure secret dashboards (like database admins).

In this blog post I want to share my base Traefik configuration. This includes:

- setting up Traefik v2 with docker-compose,
- HTTP to HTTPS global redirection,
- automated SSL certificates,
- putting Traefik dashboard under its own domain and securing it with a password.

After these steps, you will have the ecosystem, but no actual sites yet. Check the follow-ups to this blog post with common practical uses:

- [Nginx proxy example](/blog/post/traefik-nginx-proxy) - connect a basic Nginx proxy to Traefik.
- [Full-stack Angular + Node.js + Postgres application example](blog/post/traefik-nodejs-api-and-db/) - connect a typical full-stack application to Traefik.
- [Proxy to S3 bucket example](/blog/post/traefik-s3-proxy) - use Traefik as a reverse proxy to an S3 bucket (to serve a static site).

<p></p>

## Setting up Traefik v2 with docker-compose

Here is the basic `docker-compose.yml` for Traefik. We will work with this file to eventually reach the base setup.

```yaml
version: "3.6" # important, so that we can name our network

services:
  traefik:
    image: "traefik:v2.2"
    container_name: "traefik"
    networks:
      - traefik-global-proxy
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - "./traefik.toml:/etc/traefik/traefik.toml"
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

# this is the network that every container should connect to, in order to communicate with Traefik. We give it a nice name to type it easier.
networks:
  traefik-global-proxy:
    name: "traefik-global-proxy"
```

Let's explain some important lines:

```yaml
version: "3.6"
```

Version line is important, as it allows us to name our network.

```yaml
networks:
    - traefik-global-proxy

# ...

networks:
  traefik-global-proxy:
    name: "traefik-global-proxy"
```

We put Traefik into a network named `traefik-global-proxy`, which will be the network that other containers need to attach to in order to talk to Traefik. We specify a name for this network so that it doesn't get the default compose name.

```yaml
ports:
  - "443:443"
  - "80:80"
```

We expose both ports, so that we can redirect non HTTP to HTTPS.

```yaml
volumes:
  - "./traefik.toml:/etc/traefik/traefik.toml"
  - "./letsencrypt:/letsencrypt"
  - "/var/run/docker.sock:/var/run/docker.sock:ro"
```

We will create a file `traefik.toml`, which will hold our configuration for Traefik. We could also specify all settings using the `command` in `docker-compose.yml` directly, but I am not a fan of that approach, as it looks more cluttered.

We also mount a directory for Let's encrypt certificates. This directory will be created automatically.

Finally, we enable Traefik to listen to the Docker daemon by mounting `/var/run/docker.sock` - this is a prerequisite so that we can later connect Docker containers to the proxy.

Create a file `traefik.toml` in same directory as `docker-compose.yml` and put this in it:

```toml
[log]
  level = "DEBUG"
```

This will allow us to debug any potential failures during development. Later you can remove this line.

## HTTP to HTTPS global redirection

Add this to your `traefik.toml`:

```toml
[entryPoints]
  [entryPoints.web]
    address = ":80"

  [entryPoints.web.http.redirections.entryPoint]
    to = "websecure"
    scheme = "https"

  [entryPoints.websecure]
    address = ":443"
```

We define two entrypoints, which are basically doors to the outside world. The first entrypoint listens on port 80 and redirects to the second entrypoint, which listens on port 443.

That's it! HTTP will be redirected to HTTPS.

## Automated SSL certificates

We will use Let's encrypt to generate certificates.

Add this to your `traefik.toml`:

```toml
[certificatesResolvers.letsencrypt.acme]
  email = "yourmail@domain.com"
  storage = "/letsencrypt/acme.json"
  [certificatesResolvers.letsencrypt.acme.tlsChallenge]
```

We specify an e-mail for Let's encrypt. Be sure to change this line to your e-mail address. We then also specify, where certificates will be stored. Because we mounted this directory in Docker, the file will persist over restarts and stops and certificates won't be requested all over again. Finally, we use the TLS challenge to obtain our certificates.

Now all new domains will automatically receive a certificate. We don't have any domains yet, though.

## Putting Traefik dashboard under its own domain and securing it with a password

Our goal is to put Traefik dashboard under a domain, such as `monitor.mydomain.com` (`mydomain.com` is a placeholder for your actual domain) and password-protect access to the site. First, let's enable dashboard in `traefik.toml` and enable Docker provider as well:

```toml
[api]
  dashboard = true

[providers.docker]
  exposedByDefault = false
  network = "traefik-global-proxy" # this is really important when you have multiple networks on a single container. This will tell Traefik to always look for network traefik-global-proxy and not any other internal networks.
```

Let's generate username and password string with `htpasswd` (substitute username and password with something stronger):

```bash
sudo apt-get install apache2-utils # install package with htpasswd
htpasswd -nb admin strongpassword
```

Result: `admin:$apr1$Dqo7TC2B$23bAWltXXzx01XUbq2BU50`

Traefik adds Docker containers in its network to the configuration based on their `labels`. We can also add Traefik container itself to the configuration.

In `docker-compose.yml`, associate Traefik Docker container with the domain `monitor.mydomain.com` and give it the generated password:

```yaml
labels:
  - "traefik.enable=true" # enable the dashboard
  - "traefik.http.routers.traefik.rule=Host(`monitor.mydomain.com`)" # domain for dashboard
  - "traefik.http.routers.traefik.entrypoints=websecure"
  - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
  - "traefik.http.routers.traefik.service=api@internal" # points to dashboard
  - "traefik.http.routers.traefik.middlewares=auth" # enable password auth
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$Dqo7TC2B$$23bAWltXXzx01XUbq2BU50" # substitute with your htpasswd string and escape dollar signs!
```

**Important**: when using the htpasswd string in `docker-compose.yml`, make sure that any dollar signs in it are escaped by appending another dollar sign in front. E. g. $ becomes $\$.

Make sure that domain `monitor.mydomain.com` points to your server, otherwise certificate creation will fail.

## Configuration summary and starting Traefik

At this point, we can start Traefik and check if the dashboard works. Here are the files again:

Here is `docker-compose.yml`:

```yaml
version: "3.6" # important, so that we can name our network

services:
  traefik:
    image: "traefik:v2.2"
    container_name: "traefik"
    networks:
      - traefik-global-proxy
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - "./traefik.toml:/etc/traefik/traefik.toml"
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    labels:
      - "traefik.enable=true" # enable the dashboard
      - "traefik.http.routers.traefik.rule=Host(`monitor.mydomain.com`)" # domain for dashboard
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal" # points to dashboard
      - "traefik.http.routers.traefik.middlewares=auth" # enable password auth
      - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$Dqo7TC2B$$23bAWltXXzx01XUbq2BU50" # substitute with your htpasswd string and escape dollar signs!

# this is the network that every container should connect to, in order to communicate with Traefik. We give it a nice name to type it easier.
networks:
  traefik-global-proxy:
    name: "traefik-global-proxy"
```

And here is Traefik configuration file `traefik.toml`:

```toml
[log]
  level = "DEBUG"

[entryPoints]
  [entryPoints.web]
    address = ":80"

  [entryPoints.web.http.redirections.entryPoint]
    to = "websecure"
    scheme = "https"

  [entryPoints.websecure]
    address = ":443"

[certificatesResolvers.letsencrypt.acme]
  email = "yourmail@domain.com"
  storage = "/letsencrypt/acme.json"
  [certificatesResolvers.letsencrypt.acme.tlsChallenge]


[api]
  dashboard = true

[providers.docker]
  exposedByDefault = false
  network = "traefik-global-proxy" # this is really important when you have multiple networks on a single container. This will tell Traefik to always look for network traefik-global-proxy and not any other internal networks.
```

Make sure that `monitor.mydomain.com` points to your server and run Traefik:

```bash
docker-compose up -d
```

Wait for Traefik to boot up and generate certificates. You can check the logs to make sure everything is working:

```bash
docker-compose logs -f
```

Visit `monitor.mydomain.com`, enter your username and password and you should be presented with the Traefik dashboard.

## Next steps: connecting your apps to Traefik

Further examples are presented in separate blog posts. Here are the links to some common uses of Traefik:

- [Nginx proxy example](/blog/post/traefik-nginx-proxy) - connect a basic Nginx proxy to Traefik.
- [Full-stack Angular + Node.js + Postgres application example](/blog/post/traefik-nodejs-api-and-db) - connect a typical full-stack application to Traefik.
- [Proxy to S3 bucket example](/blog/post/traefik-s3-proxy) - use Traefik as a reverse proxy to an S3 bucket (to serve a static site).
- [IP whitelist example](/blog/post/traefik-ip-whitelist) - allow only certain IP addresses to access selected Docker containers.

<p></p>

## Resources

- Traefik docs: [https://docs.traefik.io/](https://docs.traefik.io/)
- Docker provider for Traefik: [https://docs.traefik.io/providers/docker/](https://docs.traefik.io/providers/docker/)
- Middlewares for Traefik: [https://docs.traefik.io/middlewares/overview/](https://docs.traefik.io/middlewares/overview/)
- Traefik dashboard settings: [https://docs.traefik.io/operations/dashboard/](https://docs.traefik.io/operations/dashboard/)
- Let's encrypt for Traefik: [https://docs.traefik.io/https/acme/](https://docs.traefik.io/https/acme/)
