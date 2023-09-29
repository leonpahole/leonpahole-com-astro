---
layout: "../../../layouts/BlogPostLayout.astro"
title: "Traefik v2: proxy requests to AWS S3 to serve a static site, non-www to www redirect"
excerpt: "Following up from my previous blog post about the base setup of Traefik v2, I will now show how easy it is to set up Traefik as a reverse proxy to an AWS S3 bucket and redirect www to non-www."
categories:
  - "Traefik"
date: "2020-05-02"
slug: traefik-s3-proxy
cover_image:
  src: "/src/assets/blog/covers/traefik-cover.png"
  alt: "Traefik"
  credit_text: "https://doc.traefik.io/traefik/"
  credit_link: "https://doc.traefik.io/traefik/"
---

If you haven't set up Traefik yet, check my previous blog post about the [base setup of Traefik v2](/blog/post/traefik-basic-setup). This blog post assumes you have this setup ready:

- HTTP to HTTPS redirect,
- automated Let's encrypt certificates.

We will enable Traefik to proxy requests from a domain `www.mydomain.com` (`mydomain.com` is a placeholder for your actual domain) to an S3 bucket, hosted on AWS. We will also redirect `mydomain.com` to `www.mydomain.com`. We will not use any Docker containers for this, everything will be done in the configuration file. This kind of setup is great for hosting personal websites.

## Important: AWS bucket setup

You need to have an AWS S3 bucket set up to **host a static website and allow public access**. Also, the **bucket name needs to match your domain name including www**. So, in our example, the bucket needs to be named **www.mydomain.com**.

Here is a complete tutorial for creating a bucket with exact settings that we need: [https://docs.aws.amazon.com/AmazonS3/latest/user-guide/static-website-hosting.html](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/static-website-hosting.html).

You should also retrieve the URL, associated with your bucket, in the S3 console (Properties -> Static website hosting -> Endpoint). It looks something like this (exact URL depends on bucket name and region): _http://www.mydomain.com.s3-website.eu-central-1.amazonaws.com/_.

Finally, you should upload your site data to the bucket.

## Adding dynamic configuration to Traefik

In the same directory where you have your `traefik.toml`, create a directory `dynamic`. This directory will contain our Traefik **dynamic configuration**, which is separated from the static configuration (`traefik.toml`). The dynamic configuration contains your routes and can be hot-reloaded, while changing the static configuration requires a restart of Traefik.

In our `traefik.toml`, we need to import dynamic configuration:

```toml
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

<p></p>

## Adding S3 proxy to Traefik

Create a file for our configuration, named `dynamic/my-site.toml`. We will write everything we need for our proxy in this file.

Here are the contents of `dynamic/my-site.toml`:

```toml
[http]

  [http.routers]
    [http.routers.mysite]
      entryPoints = ["websecure"]
      middlewares = ["mysite-nonwww"]
      service = "extmysite"
      rule = "Host(`mydomain.com`, `www.mydomain.com`)"
      [http.routers.mysite.tls]
        certResolver = "letsencrypt"
        [[http.routers.mysite.tls.domains]]
          main = "www.mydomain.com"
          sans = ["mydomain.com"]

  [http.services]
    [http.services.extmysite.loadBalancer]
      [[http.services.extmysite.loadBalancer.servers]]
        url = <path to bucket> # your path to bucket
        # Example:
        # url = "http://www.mydomain.com.s3-website.eu-central-1.amazonaws.com/"

  [http.middlewares]
    [http.middlewares.mysite-nonwww.redirectRegex]
      regex = "^https://mydomain.com/(.*)"
      replacement = "https://www.mydomain.com/${1}"
      permanent = true
```

Explanation:

```toml
  [http.routers]
    [http.routers.mysite]
      entryPoints = ["websecure"]
      middlewares = ["mysite-nonwww"]
      service = "extmysite"
      rule = "Host(`mydomain.com`, `www.mydomain.com`)"
      [http.routers.mysite.tls]
        certResolver = "letsencrypt"
        [[http.routers.mysite.tls.domains]]
          main = "www.mydomain.com"
          sans = ["mydomain.com"]
```

A [router](https://docs.traefik.io/routing/routers/) will accept a request from an entrypoint, apply middleware, and then forward the request to the service (the actual backend).

Here is what we tell Traefik for this router in above code:

- We name our router `mysite`. The names of routers are unique so make sure that you only have one router named `mysite`. I also recommend changing this name to something more explanatory, I use `mysite` only for demo purposes.
- We tell the router to accept requests coming from the entrypoint `websecure`. We defined this entrypoint in the [previous blog post](/blog/post/traefik-basic-setup) and it defines port 443.
- We tell the router to use middleware `mysite-www` (described below). In short, this middleware will redirect non-www to www.
- We tell the router to forward request to service `extmysite`, which will call our bucket. One again, the service name should be unique.
- We tell the router to match and handle requests with URL `mydomain.com` or `www.mydomain.com`.
- We tell the router to generate certificates for `www.mydomain.com` and `mydomain.com` using cert resolver `letsencrypt` (defined in the [previous blog post](/blog/post/traefik-basic-setup)).

<p></p>

```toml
[http.services]
  [http.services.extmysite.loadBalancer]
    [[http.services.extmysite.loadBalancer.servers]]
      url = <path to bucket> # your path to bucket
      # Example:
      # url = "http://www.mydomain.com.s3-website.eu-central-1.amazonaws.com/"
```

We define a [service](https://docs.traefik.io/routing/services/) `extmysite` that simply proxies to our bucket.

```toml
[http.middlewares]
  [http.middlewares.mysite-nonwww.redirectRegex]
    regex = "^https://mydomain.com/(.*)"
    replacement = "https://www.mydomain.com/${1}"
    permanent = true
```

We define a [middleware](https://docs.traefik.io/middlewares/overview/) `mysite-www`, which redirects non-www requests to www using a simple regex. Be sure to substitute `mydomain.com` with your actual domain in the regex.

Keep in mind that the configuration is based on the [base setup](/blog/post/traefik-basic-setup), and thus contains names of entrypoints (`websecure`) and cert providers (`letsencrypt`), as defined in that setup. Be sure to substitute those, if using a different setup.

Make sure that DNS records for `www.mydomain.com` and `mydomain.com` point to your server, and then save the file. In a few moments, `www.mydomain.com` and `mydomain.com` will be available. You can check logs of Traefik to see how Traefik detected the configuration automatically and generated a certificate for it. **So, no restarts are needed!**

If you see an error "bucket not found", it probably means that the bucket does not have the correct name (`www.mydomain.com`).

## Securing the bucket with a bucket policy

Now that we proxy requests from our server to the bucket, there is no real need to keep the bucket public, and we can lock the access only to the IP address of our server.

Here is the policy that you can attach to your bucket (in S3 console, click your bucket, then go to Permissions and Bucket Policy) to prevent access to the bucket for anyone except your server:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www.mydomain.com/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": ["12.34.56.78"] // substitute this IP with your server IP
        }
      }
    }
  ]
}
```

You should now get a response "forbidden" if you visit your bucket directly through the S3 URL, but your website should properly work.

## More examples

Check out my other examples of Traefik usage, if you are interested:

- [Nginx proxy example](/blog/post/traefik-nginx-proxy) - connect a basic Nginx proxy to Traefik.
- [Full-stack Angular + Node.js + Postgres application example](/blog/post/traefik-nodejs-api-and-db) - connect a typical full-stack application to Traefik.
- [IP whitelist example](/blog/post/traefik-ip-whitelist) - allow only certain IP addresses to access selected Docker containers.

<p></p>

## Resources

- Traefik docs: [https://docs.traefik.io/](https://docs.traefik.io/)
- Create a static website bucket on AWS S3: [https://docs.aws.amazon.com/AmazonS3/latest/user-guide/static-website-hosting.html](https://docs.aws.amazon.com/AmazonS3/latest/user-guide/static-website-hosting.html)
