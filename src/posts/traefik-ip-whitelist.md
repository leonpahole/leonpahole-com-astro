---
layout: "../layouts/BlogPostLayout.astro"
title: "Traefik v2: IP whitelist for Docker containers (allowing only specified IP addresses)"
excerpt: "In this blog post I provide an example on how to set up IP whitelist for Docker containers, such as database interfaces and private monitoring dashboards using Traefik v2."
categories:
  - "Traefik"
date: "2020-11-07"
slug: traefik-ip-whitelist
cover_image:
  src: "/src/assets/blog/covers/traefik-cover.png"
  alt: "Traefik"
  credit_text: "https://doc.traefik.io/traefik/"
  credit_link: "https://doc.traefik.io/traefik/"
---

Security is an important consideration when building web based systems. A big part of this is giving access to critical resources to as few people as possible. For example, a lot of brute force attacks can be prevented if we limit SSH access to our server to only a handful of IP addresses (for instance, our VPN server and our office IP addresses). Same applies to dashboards and admin interfaces, such as database admin panels (pgAdmin, phpMyAdmin, Mongo express and others). If you use Traefik as your gateway to these dashboards, you can specify IP whitelists to give access to specific IP addresses or ranges. Let's look at how to do this.

If you haven't set up Traefik yet, check my previous blog post about the [base setup of Traefik v2](/blog/post/traefik-basic-setup). I will not cover `traefik.toml` setup from scratch in this blog post.

## Adding dynamic configuration to Traefik

[Dynamic configuration](https://doc.traefik.io/traefik/getting-started/configuration-overview/#the-dynamic-configuration) allows us to define, among other things, [middleware](https://docs.traefik.io/middlewares/overview/) of Traefik. Middleware works by examining the request (or response) sent to the service (Docker container) and performing an operation on it. This could mean changing the contents of the request or deciding to drop the request based on some decision. We will use middleware to drop any requests which are not coming from specified IP addresses.

I prefer to create all middleware in a file, as it can usually be shared among many containers and easily copy-pasted into other configurations.

In the same directory where you have your `traefik.toml`, create a directory `dynamic`. This directory will contain our Traefik dynamic configuration, which is separated from the static configuration (`traefik.toml`). The dynamic configuration can contain middlewares, routes and other dynamic things and can be hot-reloaded, while changing the static configuration requires a restart of Traefik.

In our `traefik.toml`, we need to import dynamic configuration:

```toml
# ...

[providers.file]
  directory = "/etc/traefik/dynamic"
```

Next, modify `docker-compose.yml` of Traefik to mount this `dynamic` directory into `/etc/traefik/dynamic`. You will be able to add files to this directory, and they will be hot-reloaded thanks to Traefik and Docker bind mounts.

```yaml
version: "3.3"

services:
  traefik:
    image: "traefik:v2.2"
    # ...
    volumes:
      - "./dynamic:/etc/traefik/dynamic" # we add this line
      # ...
```

Now, restart the system to apply the bind mount. This will also reload static configuration.

```bash
docker-compose up -d
```

Check out my [base setup of Traefik v2](/blog/post/traefik-basic-setup) for full `docker-compose.yml` and `traefik.toml` if you don't have them yet.

<p></p>

## Adding IP whitelisting middleware

Create a file for the middleware. I name it `dynamic/middlewares.toml`, but the name is irrelevant. I use this file to write any middlewares which are general enough that they can be used by multiple containers.

Here are the contents of `dynamic/middlewares.toml`:

```toml
[http]

  [http.middlewares]
    [http.middlewares.my-whitelist.ipWhiteList]
      sourceRange = ["11.22.33.44/32", "22.33.44.55/24"]

    # .. more middleware if needed
```

We define the [ipWhiteList](https://doc.traefik.io/traefik/middlewares/ipwhitelist/) middleware named `my-whitelist` (name must be unique and I usually give it a more descriptive name, such as `allow-vpn-ipwhitelist`). The important part is this line:

```toml
sourceRange = ["11.22.33.44/32", "22.33.44.0/24"]
```

This allows us to specify all IP addresses or ranges in CIDR notation that we want to allow. If we only want to allow one IP address, we write `/32` mask. We can comma-separate as many as needed IP addresses.

After you save the file, it will be automatically reloaded due to the hot-reload mechanism of Traefik (this only applies to dynamic configuration). IP whitelist middleware will be added, but we need to specify the Docker containers where we will use it.

## Applying IP whitelisting middleware to Docker containers

Let's secure our phpMyAdmin container with IP whitelist `allow-vpn-ipwhitelist`, declared above. Keep in mind that the same process works for any Docker container.

Here is how the `docker-compose.yml` looks for our container:

```yaml
version: "3.7"

services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    restart: always
    networks:
      - traefik-global-proxy # external Traefik network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.my-pma.rule=Host(`${PMA_DOMAIN}`)"
      - "traefik.http.routers.my-pma.entrypoints=websecure"
      - "traefik.http.routers.my-pma.tls.certresolver=letsencrypt"
      - "traefik.http.services.my-pma.loadbalancer.server.port=80"
      - "traefik.http.routers.my-pma.middlewares=office-vpn-whitelist@file" # we apply our middleware

networks:
  traefik-global-proxy:
    external: true
```

The important line is this one:

```yaml
- "traefik.http.routers.my-pma.middlewares=my-whitelist@file" # we apply our middleware
```

This tells Traefik: for the router `my-pma` (which has been declared, if you look at other labels above in `docker-compose.yml`), use middleware `my-whitelist`, which is declared in a `file` (dynamic configuration). We have to specify the source of the middleware, because it can also come directly from `docker-compose.yml`, for example:

```yaml
- "traefik.http.middlewares.my-whitelist-in-docker.ipwhitelist.sourcerange=11.22.33.44/32, 22.33.44.0/24" # we declare our middleware
# ...
- "traefik.http.routers.my-pma.middlewares=my-whitelist-in-docker@docker" # we apply our middleware
```

This declares IP whitelist middleware `my-whitelist-in-docker` and applies it to the container. I prefer the file way, but both approaches are functionally equal. Note the `@docker` at the end instead of `@file`.

## More examples

Check out my other examples of Traefik usage, if you are interested:

- [Nginx proxy example](/blog/post/traefik-nginx-proxy) - connect a basic Nginx proxy to Traefik.
- [Full-stack Angular + Node.js + Postgres application example](/blog/post/traefik-nodejs-api-and-db) - connect a typical full-stack application to Traefik.
- [Proxy to S3 bucket example](/blog/post/traefik-s3-proxy) - use Traefik as a reverse proxy to an S3 bucket (to serve a static site).

<p></p>

## Resources

- Traefik docs: [https://docs.traefik.io/](https://docs.traefik.io/)
