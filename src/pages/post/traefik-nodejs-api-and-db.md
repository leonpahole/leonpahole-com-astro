---
layout: "../../../../layouts/BlogPostLayout.astro"
title: "Traefik v2: connect a full-stack dockerized Node.js + Angular + PostgreSQL + Adminer application to Traefik"
excerpt: "Following up from my previous blog post about the base setup of Traefik v2, I will now show how easy it is to connect a full stack dockerized application to it."
categories:
  - "Traefik"
date: "2020-05-02"
slug: traefik-nodejs-api-and-db
cover_image:
  src: "/src/assets/blog/covers/traefik-cover.png"
  alt: "Traefik"
  credit_text: "https://doc.traefik.io/traefik/"
  credit_link: "https://doc.traefik.io/traefik/"
---

If you haven't set up Traefik yet, check my previous blog post about the [base setup of Traefik v2](/blog/traefik-basic-setup). This blog post assumes you have this setup ready:

- HTTP to HTTPS redirect,
- automated Let's encrypt certificates,
- Docker provider enabled.

<p></p>

## Our application

For demo purposes, I will use my simple app repositories (although simple, they should mimic most typical SPA applications):

- [Simple frontend](https://github.com/leonpahole/simple-frontend-angular) - Angular 9 app that exchanges data (read and write) with backend.
- [Simple backend](https://github.com/leonpahole/simple-backend-nodejs) - Node.js 12 app that communicates with Postgres database and serves a REST API.

Here is how the architecture looks like:

![Architecture we'll build](/src/assets/blog/images/traefik-nodejs/app-architecture.png)

We will use the following domains (`mydomain.com` is a placeholder for your actual domain):

- `simple.mydomain.com` for frontend,
- `api.simple.mydomain.com` for API,
- `db.simple.mydomain.com` for database admin.

Before continuing make sure that all these subdomains point to your server in your DNS provider settings.

## Database admin security

Another thing we will do is additionally securing the database admin interface with a password or with an IP whitelist or (preferably both, but only if your IP is static).

_If you will secure your database admin with a password_, run this command with your own username and password:

```bash
sudo apt-get install apache2-utils # install package with htpasswd
htpasswd -nb dbadmin strongpassword
```

Result: `dbadmin:$apr1$kx5wMS4q$TGmFmP9Io1Srr9FR9PQY7/`

**Important**: when using the htpasswd string in `docker-compose.yml` make sure, that any dollar signs in it are escaped by appending another dollar sign in front. E. g. $ becomes $\$.

## Docker compose file

Create a `docker-compose.yml` file containing your app ecosystem. Note that I will not be focusing on the security here and I will put secrets directly into `docker-compose.yml`, but in a real app, you should put these into the Vault (secure but hard to set up), environment file (not recommended) or use Docker swarm with Docker secrets (recommended).

Here is the `docker-compose.yml`:

```yaml
version: "3.3"

services:
  frontend:
    container_name: simple_prod_frontend
    image: leonpahole/simple-frontend-angular:latest # for demo purposes
    depends_on:
      - api
    networks:
      - traefik-global-proxy

    # Traefik stuff
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.simple-fe.rule=Host(`simple.mydomain.com`)" # domain to expose on
      - "traefik.http.routers.simple-fe.entrypoints=websecure" # if you named your 443 entrypoint differently than webscure, substitute it here!
      - "traefik.http.routers.simple-fe.tls.certresolver=letsencrypt" # if you named your cert resolver differently than letsencrypt, substitute it here!

  api:
    container_name: simple_prod_api
    image: leonpahole/simple-backend-nodejs:latest # for demo purposes
    depends_on:
      - db
    environment:
      - NODE_ENV=production
      - DB_NAME=simple
      - DB_USERNAME=admin
      - DB_PASSWORD=admin
      - DB_HOST=db
    networks:
      - traefik-global-proxy
      - backend

    # Traefik stuff
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.simple-be.rule=Host(`api.simple.mydomain.com`)" # domain to expose on
      - "traefik.http.routers.simple-be.entrypoints=websecure" # if you named your 443 entrypoint differently than webscure, substitute it here!
      - "traefik.http.routers.simple-be.tls.certresolver=letsencrypt" # if you named your cert resolver differently than letsencrypt, substitute it here!

  db:
    container_name: simple_prod_db
    image: postgres:12
    volumes:
      - dbdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=simple
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=admin
    networks:
      # database does not need to be in the proxy network, as it won't be exposed.
      - backend

  dbadm:
    container_name: simple_prod_db_admin
    image: adminer
    depends_on:
      - db
    networks:
      - traefik-global-proxy
      - backend

    # Traefik stuff
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.simple-dba.rule=Host(`db.simple.mydomain.com`)" # domain to expose on
      - "traefik.http.routers.simple-dba.entrypoints=websecure" # if you named your 443 entrypoint differently than webscure, substitute it here!
      - "traefik.http.routers.simple-dba.tls.certresolver=letsencrypt" # if you named your cert resolver differently than letsencrypt, substitute it here!
      # - "traefik.http.middlewares.db-ipwhitelist.ipwhitelist.sourcerange=12.34.56.78" # uncomment if you will secure db admin with an IP whitelist and add your comma-separated IP addresses
      # - "traefik.http.routers.simple-dba.middlewares=dbauth,db-ipwhitelist" # uncomment if you will use both auth and ip whitelist and comment below line
      - "traefik.http.routers.simple-dba.middlewares=dbauth"
      - "traefik.http.middlewares.dbauth.basicauth.users=dbadmin:$$apr1$$kx5wMS4q$$TGmFmP9Io1Srr9FR9PQY7/" # uncomment if you will secure db admin with password # substitute with your htpasswd string and escape dollar signs!

volumes:
  dbdata:

networks:
  traefik-global-proxy:
    external: true
  backend:
```

Note that we connect frontend, API and db admin to the external network, created by Traefik (we did that in the [previous blog post](/blog/traefik-basic-setup)). We also connect all backend containers into a network `backend`, to ensure the communication between them. Finally, we add either an IP whitelist, password protection, both or none to the database admin container to prevent unauthorized access.

As a side node, you need to name each of your routers differently. Here I named the routers, associated with these containers, "simple-fe", "simple-be" and "simple-dba" respectively. If you have more containers you want to connect (you probably do), you should name them something else to prevent conflicts with these containers.

Also, no ports are exposed to the outside world, all the communication runs through Docker network to Traefik, which is the only entrypoint from the internet.

### Important: about networks

We use two networks here, `backend` and `traefik-global-proxy`. Traefik does not know, which network is the public network of Traefik and which one is the internal one, so we need to tell it this information. We can configure that globally in `traefik.toml` (we did that in the [previous blog post](/blog/traefik-basic-setup)):

```toml
[providers.docker]
  # ...
  network = "traefik-global-proxy"
```

Or we can also configure it on a container level, by adding the following label:

```yaml
labels:
  # ...
  - "traefik.docker.network=traefik-global-proxy"
```

<p></p>

### About ports

We didn't have to tell Traefik to which ports to proxy to, even though our API, for example, uses port 3000. This is because traefik inspect **exposed ports** of the container (NOT exposed in the service, but exposed using `EXPOSE` keyword in `Dockerfile`). If our container didn't have a port exposed or had multiple ports exposed, we would use a label like this to specify the port:

```yaml
labels:
  # ...
  - "traefik.http.services.<service_name>.loadbalancer.server.port=8080" # 8080 is the port we proxy to
```

<p></p>

## Running and testing

To start the system, run:

```bash
docker-compose up -d
```

In a few moments, `simple.mydomain.com`, `api.simple.mydomain.com` and `db.simple.mydomain.com` will be available. You can check logs of Traefik to see how Traefik detected the containers automatically and generated certificates for them. **So, no restarts are needed!**

If you are using my simple app to test this, you should run migrations:

```bash
docker-compose exec api yarn migrate
```

Then you can go to `https://simple.mydomain.com/?apiUrl=api.simple.mydomain.com` (apiUrl is a query param in my simple frontend to make the app flexible and invariable to API URL changes, this is just for demo purposes) and see the working example.

Also check if `https://db.simple.mydomain.com` security works correctly. If using my simple app, make sure to switch the database type from MySQL to PostgreSQL in the dropdown.

## More examples

Check out my other examples of Traefik usage, if you are interested:

- [Nginx proxy example](/blog/traefik-nginx-proxy) - connect a basic Nginx proxy to Traefik.
- [Proxy to S3 bucket example](/blog/traefik-s3-proxy) - use Traefik as a reverse proxy to an S3 bucket (to serve a static site).
- [IP whitelist example](/blog/traefik-ip-whitelist) - allow only certain IP addresses to access selected Docker containers.

<p></p>

## Resources

- Traefik docs: [https://docs.traefik.io/](https://docs.traefik.io/)
- Docker provider for Traefik: [https://docs.traefik.io/providers/docker/](https://docs.traefik.io/providers/docker/)
