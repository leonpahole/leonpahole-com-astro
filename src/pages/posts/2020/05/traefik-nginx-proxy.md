---
title: "Traefik v2: connect Nginx Docker container to Traefik"
excerpt: "Following up from my previous blog post about the base setup of Traefik v2, I will now show how easy it is to connect a Nginx Docker container to Traefik."
categories:
  - "Traefik"
date: "2020-05-02"
slug: traefik-nginx-proxy
cover_image:
  src: "../../assets/covers/traefik-cover.png"
  alt: "Traefik"
  credit_text: "https://doc.traefik.io/traefik/"
  credit_link: "https://doc.traefik.io/traefik/"
---

If you haven't set up Traefik yet, check my previous blog post about the [base setup of Traefik v2](/blog/traefik-basic-setup). This blog post assumes you have this setup ready:

- HTTP to HTTPS redirect,
- automated Let's encrypt certificates,
- Docker provider enabled.

We will create a simple Nginx container, connect it to Traefik and expose it on a domain `proxy.mydomain.com` (`mydomain.com` is a placeholder for your actual domain).

Create a `docker-compose.yml` file for your proxy. Here is an example of a very basic proxy, that doesn't do anything, except serve a default page (in reality you would of course mount a configuration file into the container):

```yaml
version: "3.3"

services:
  nginx:
    image: nginx
    container_name: test_proxy
    labels:
      - "traefik.enable=true" # enables the service
      - "traefik.http.routers.nginx.rule=Host(`proxy.mydomain.com`)" # domain to expose on
      - "traefik.http.routers.nginx.entrypoints=websecure" # if you named your 443 entrypoint differently than webscure, substitute it here!
      - "traefik.http.routers.nginx.tls.certresolver=letsencrypt" # if you named your cert resolver differently than letsencrypt, substitute it here!
    networks:
      - traefik-global-proxy # Traefik network! If you named it differently, substitute it here and below.

networks:
  traefik-global-proxy:
    external: true
```

Note that we connect the proxy to external network, created by Traefik (we did that in the [previous blog post](/blog/traefik-basic-setup)). If you have multiple services in your docker compose file, you should only put containers, that need to be exposed through the proxy, in this network, and define another internal network for internal container communication.

As a side node, you need to name each of your routers differently. Here I named the router, associated with this container, "nginx" (denoted by `traefik.http.routers.nginx`). If you have another container you wanted to connect (you probably do), you should name it something else to prevent conflicts with this container.

Make sure that `proxy.mydomain.com` points to your server and run:

```bash
docker-compose up -d
```

In a few moments, `proxy.mydomain.com` will be available. You can check logs of Traefik to see how Traefik detected the container automatically and generated a certificate for it. **So, no restarts are needed!**

## More examples

Check out my other examples of Traefik usage, if you are interested:

- [Full-stack Angular + Node.js + Postgres application example](blog/traefik-nodejs-api-and-db/) - connect a typical full-stack application to Traefik.
- [Proxy to S3 bucket example](/blog/traefik-s3-proxy) - use Traefik as a reverse proxy to an S3 bucket (to serve a static site).
- [IP whitelist example](/blog/traefik-ip-whitelist) - allow only certain IP addresses to access selected Docker containers.

<p></p>

## Resources

- Traefik docs: [https://docs.traefik.io/](https://docs.traefik.io/)
- Docker provider for Traefik: [https://docs.traefik.io/providers/docker/](https://docs.traefik.io/providers/docker/)
