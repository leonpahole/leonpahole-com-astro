---
layout: "../../../../layouts/BlogPostLayout.astro"
title: "Dockerizing Wordpress for local development and production deployment using docker-compose (boilerplate code included)"
excerpt: Just like any other web-based project, I decided to dockerize the Wordpress website I've been working on. This proved to be a more difficult task than I imagined due to user permission problems. At the end, I came up with an acceptable solution which I will describe in this post. The solution supports local Wordpress development and production deployment using docker-compose. I also provide boilerplate code for dockerized Wordpress.
categories:
  - "Docker"
  - "Wordpress"
date: "2020-04-05"
slug: dockerizing-wordpress
cover_image:
  src: "/src/assets/blog/covers/dockerizing-wordpress-cover.png"
  alt: "Docker + Wordpress"
  credit_text: "James Harrison on Unsplash"
  credit_link: "https://unsplash.com/@jstrippa?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

Note: this blog post assumes knowledge of Docker and docker-compose.

Github repository with boilerplate code is available [here](https://github.com/leonpahole/wordpress-docker-boilerplate).

Github repository with example project code is available [here](https://github.com/leonpahole/caturday).

I love Docker. If possible, I try to use it in every project I work on. And so it was with a Wordpress site I've been working on. This did prove to be quite a challenge. At the end, with some minor inconveniences, I managed to come up with a solution.

The end result of the sample dockerized website can be found [here](https://github.com/leonpahole/wordpress-docker-boilerplate). In the [first part](#dockerizing-wordpress) of this blog post I will explain how I came up with this code. In the [second part](#using-this-boilerplate), I will summarize on how to use this code.

## Dockerizing Wordpress

My dockerization process for personal projects is similar regardless of the technology used. Here are the general steps:

1. (only if necessary) Use dummy docker container to generate code.
2. Write the `Dockerfile` and copy **all application code** into it (so that no code mounting is required except environments). Also write `.dockerignore`. This Dockerfile will build production container.
3. Write `docker-compose.yml` for easy local development.

Additionally, if I want to deploy the image to an actual server:

4. Determine your image name and create it in image registry (such as Docker Hub).
5. Write `docker-compose.prod.yml` for production deployment, using image name for registry.

I usually write some helper bash scripts to help me with building and deployment:

6. Come up with a versioning system.
7. Write a script that will bump version, build the image and push it to image registry.
8. Write a script that will deploy the image on the server.

_Note that this procedure is used for my personal projects, which don't require complex CI/CD pipelines or multi-server deployments (due to the fact that I work on them alone and they aren't complex)._

# Local development

First, we will create an environment that will allow us to efficiently develop Wordpress sites locally using Docker. This will not require any installations, all you need is Docker.

We will begin our dockerization with an empty directory. To not be boring, I will pretend I am making a website about cats called _Caturday_. So we will create a directory _Caturday_ and cd into it. We will also initialize git in it, but this is optional.

```bash
mkdir caturday
cd caturday
git init
```

We will use the [official Wordpress image from Docker Hub](https://hub.docker.com/_/wordpress/). Current latest version is `5.3-apache`.

### Step 1: Generating code using a dummy container

We have our empty directory, but for Wordpress we need the actual Wordpress code. We could go to Wordpress website and download it, but we can instead use a "trick": we will create a dummy container from `wordpress:5.3-apache` image. This container contains Wordpress code in `/var/www/html`. We can bind mount our empty directory into `/var/www/html`, which will cause the Wordpress code from the container to be copied outside into our directory. This has added advantage that the Wordpress version will be exactly 5.3.

We could perform this using `docker cp` command as well.

We could use `docker run` command to create a dummy container, but since we will use docker-compose later anyway, we will create minimalist `docker-compose.yml` and run it.

Create `docker-compose.yml` and paste the following code into it:

```docker
version: "3.7"

services:
  wordpress:
    container_name: caturday_site # i like to give names to containers, as the default ones from docker can be ugly
    image: wordpress:5.3-apache # always use specific versions, try to avoid latest tag
    volumes:
      - .:/var/www/html # bind mounting current directory!
```

Let's run the container.

```bash
docker-compose up -d
```

This will populate your directory with wordpress code. You should see classic `wp-admin`, `wp-content`, `wp-includes` and a couple of php files in the root of the directory.

Before we stop the container, we need to do something that is specific to Wordpress. As I have already mentioned earlier, we will have some issues with user permissions in Wordpress. Therefore, it is important for us to get the **user id of www-data user in the container**. All you have to do is run the following command:

```bash
docker-compose exec -u www-data wordpress id -u
```

You _should_ get back 33. But the number might be different. Remember this number for the next step.

You can now stop the container:

```bash
docker-compose down
```

### Step 1.1: Writing local permissions script

If you inspect permissions of the generated files in your directory, you will notice they belong to user www-data. Therefore, it will be impossible to modify or delete them. We have to change the permissions - however, we have to do it in a way that will enable us to change files, but at the same time won't cause permission problems inside the container for user www-data. I have written a script `fix_permissions_for_local_development.sh` that does this task:

```bash
# try getting uid from docker, if it fails, try 33 (should work)
WWW_DATA_UID=33 # plug in your number from previous step
RESULT=$(docker-compose exec -u www-data wordpress id -u)
COMMAND_SUCCESS=$?
if [ $COMMAND_SUCCESS -eq 0 ]; then
  WWW_DATA_UID=$(echo $RESULT | tr -d '\r')
fi

sudo chown -R $WWW_DATA_UID:$USER ./wp-content
sudo find ./wp-content -type d -exec chmod 775 {} \;
sudo find ./wp-content -type f -exec chmod 664 {} \;
```

Plug in the user id from previous step instead of 33 in code above. The script first tries to get the user id by calling docker container. However, if the container is stopped, the command will not succeed. Therefore, we have a "fallback" option by using hardcoded user id.

Note that the script only changes permissions for `wp-content`. This is because `wp-content` will be the only directory we will be making changes in, since other files belong to Wordpress core. In fact, we will delete all other files and directories.

You can run the script now:

```bash
bash fix_permissions_for_local_development.sh
```

You should see changed permissions on `wp-content`.

### Step 1.2: Removing Wordpress core files

When developing Wordpress applications, I don't touch Wordpress core files. Since this code is in docker container, we don't need it in our directory or on git. Therefore, we will delete all Wordpress files and directories except `wp-content`. Note that you will need to remove them with sudo, as you are not the owner of the files.

```bash
sudo rm -rf wp-admin/ wp-includes/
sudo rm -f *.php .htaccess readme.html license.txt
```

You _can_ also delete initial Wordpress themes and/or plugins, but they will reappear after you restart the container, due to how Wordpress image works. Therefore, you should put them into `.gitignore`, if you won't use them.

_**IMPORTANT NOTE:** you *NEED* to put twenty themes into `.gitignore` and you should *NOT* modify them. This is because the Wordpress image will *overwrite* them each time you rerun the container. Therefore, if you want to modify the appearance of twenty\* theme, create a child theme, which is a good practice for Wordpress anyway. Putting these files into `.gitignore` will serve as a reminder not to change these files._

This should leave us with only `wp-content` directory as well as our `docker-compose.yml` and permissions script `fix_permissions_for_local_development.sh`.

We should also add all these files into `.gitignore`, if you are using git:

```bash
wp-admin
wp-content/uploads

# default plugins, if we don't need them
wp-content/plugins/hello.php
wp-content/plugins/akismet

# themes - this is important, you should not modify them, so put them here as a reminder
wp-content/themes/twenty*

wp-includes

/.htaccess

/index.php

/license.txt
/readme.html

/wp-activate.php
/wp-blog-header.php
/wp-comments-post.php
/wp-config.php
/wp-config-sample.php
/wp-cron.php
/wp-links-opml.php
/wp-load.php
/wp-login.php
/wp-mail.php
/wp-settings.php
/wp-signup.php
/wp-trackback.php
/xmlrpc.php
```

Note that I included twenty themes and default plugins in the file. If you want to keep these default files, delete those entries from `.gitignore`.

Technically, we don't actually need this `.gitingore`, since we will delete the files, and they won't ever be a part of our workspace. Still, I add them just to be safe.

### Step 2: Writing Dockerfile and .dockerignore

We will now write the `Dockerfile`, which will be used in production. We will copy all of our code from `wp-content` into the container. The rest of the directories will be created automatically by the Wordpress image. Our `.dockerignore` can mirror the `.gitignore`, but we should also add compose files and permissions script. We should also remove twentytwenty theme from ignore, so that we can use it before any theme is written.

Here is `.dockerignore`:

```bash
wp-admin
wp-content/uploads

wp-content/plugins/hello.php
wp-content/plugins/akismet

# keep twentytwenty
wp-content/themes/twenty*
!wp-content/themes/twentytwenty

wp-includes

/.htaccess

/index.php

/license.txt
/readme.html

/wp-activate.php
/wp-blog-header.php
/wp-comments-post.php
/wp-config.php
/wp-config-sample.php
/wp-cron.php
/wp-links-opml.php
/wp-load.php
/wp-login.php
/wp-mail.php
/wp-settings.php
/wp-signup.php
/wp-trackback.php
/xmlrpc.php

docker-compose*.yml
fix_permissions_for_local_development.sh
```

The `Dockerfile` looks like this:

```docker
FROM wordpress:5.3-apache

RUN apt-get update
RUN apt-get install -y libcap2-bin

# this is necessary so that we can run container as www-data, not as root
RUN setcap 'cap_net_bind_service=+ep' /usr/sbin/apache2
RUN getcap /usr/sbin/apache2

# copy all of our development code
COPY ./wp-content /var/www/html/wp-content

# switch to www-data
USER www-data
```

The docker image will be built from contents of our `wp-content` directory.

### Step 3: docker-compose.yml for easy local development

We now change our `docker-compose.yml` to use our image instead of the Wordpress one. Because we don't want to rebuild the image each time we make a change to the code, we mount our local `wp-content` into the directory, which overrides `wp-content` that is currently in the container. Note that if your permissions for your local `wp-content` are not set to `www-data:youruser`, you will run into issues here. This is where `fix_permissions_for_local_development.sh` is your friend. Use it when you run into permission issues either in Wordpress or in your local IDE. This should generally only happen when you add a new file (either through Wordpress as a plugin/theme or using your IDE).

We also add MySQL container to the compose file, as Worpdress uses it as a database. We also need to pass some environment variables, which specify database accesses into both containers. Wordpress image will take these variables and generate `wp-config.php` automatically, so we don't have to provide it. Neat!

```docker
version: "3.7"

services:
  wordpress:
    container_name: caturday_site
    build:
      context: . # build from Dockerfile
    ports:
      - 8080:80 # change this to expose different port
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: username
      WORDPRESS_DB_PASSWORD: password
      WORDPRESS_DB_NAME: dbname
    volumes:
      - ./wp-content:/var/www/html/wp-content # mounting our code
    depends_on:
        - db

  db:
    container_name: caturday_mysql
    image: mysql:5.7
    environment:
      MYSQL_DATABASE: dbname
      MYSQL_USER: username
      MYSQL_PASSWORD: password
      MYSQL_RANDOM_ROOT_PASSWORD: "1"
    volumes:
      - db:/var/lib/mysql

volumes:
  db:
```

_Note: you may wonder why usernames and passwords are hardcoded into the `docker-compose.yml` file instead of being read from an environment file. This is because `docker-compose.yml` is meant only for **local development**. For production, we will use a separate file. In local development, passwords don't really matter, and we want the developer to jump into programming as soon as they clone the directory, without the need to fill out configuration files. We could add the possibility to provide the .env file and use defaults if it isn't, but I wanted to keep this example simple._

We can now run our container:

```bash
docker-compose build
docker-compose up -d
```

_Note: first time Wordpress setup may take about 20 seconds._

You can now visit `localhost:8080` and begin your Wordpress setup. After finishing the setup, you can begin testing the local development by changing the code, saving it, and seeing how site updates without rebuilding the container. Remember, if you run into permissions issues (like Wordpress asking you for FTP access or your IDE throwing permission errors), run `fix_permissions_for_local_development.sh`.

Also, do not forget to create child themes if you wish to modify twenty\* themes.Do not modify them directly, as they will be _overwritten_ when you restart the container.

# Deployment

Next step is to deploy the site. I usually deploy early and deploy often. We will use docker-compose for production deployment, although Docker swarm is a more suitable choice. **I will discuss Docker Swarm in a later blog post**.

### Step 4: Determine your image (repository) name and create it in image registry (such as Docker Hub)

We don't want to build or images on production servers. We want to build them locally or on our CI/CD server, push them to an _image registry_, and download them from the registry to our production server.

Docker Hub is the most famous registry. It is free and provides unlimited amount of public registries and one private registry. For my personal projects, which don't contain any closed code, I use public registry.

An alternative to Docker Hub can be hosting your own registry or using Gitlab image registry. But for simplicity, we will use Docker hub.

Create an account [here](https://hub.docker.com/). After logging in, you should see a page, where you can create a repository. Press "Create Repository" button and you should be redirected to the page for creating the repository. The most important part is repository name. The repository will start with your name, followed by a slash, followed by repository name. I named my repository `caturday`, so the full name is `leonpahole/caturday`.

We now have a registry and we can begin pushing our images onto it.

### Step 5: Come up with a versioning system

It is important to properly version our code. This is even more important when using Docker images. We want to tag each new image with new features with the next version. This way, we can easily deploy new Docker image by changing the version name in our production compose file (step 7). We can also easily roll back to previous versions by changing the version name back to previous version.

I used to be a fan of automated versioning, where a script would be ran, which would accept a parameter "minor", "major" or "patch" and would appropriately bump the version using some `awk` bash magic. I found this approach to be _too automated_, as I wanted to have more control over my versions. So I have decided to change the versioning script so that the user manually enters the version.

The version itself can be stored in a file (such as `package.json` in npm projects or a plain text file). In my case, I will use git tagging system to store my versions.

So, my versioning system will be manual, and I will store tags in git.

### Step 6: Write a script that will bump the version, build the image and push it to image registry

Our script will be named `build_image.sh` and will do the following:

- read credentials from configuration file
- build the image
- ask user if they want to push it to registry
- ask user for login credentials to registry
- ask user for new version
- create a git tag for new version
- push latest image and tagged image to registry

The script needs a configuration file, in this case called `build.env`. This file should not be included in git, but for reference, you should add `build.env.example`, which contains placeholders.

Here is how my `build.env` looks like:

```bash
IMAGE_NAME=leonpahole/caturday
DOCKER_USERNAME=leonpahole
REGISTRY_URL=docker.io # docker hub
DRY_RUN=0 # if this is set to non-zero, script will not push or git tag anything
```

You should add `build.env` to `.gitignore` and add both `build.env` and `build.env.example` to `.dockerignore`.

Here is the script `build.sh`, which performs steps above.

```bash
set -u

CONFIG_FILE=build.env

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Configuration file $CONFIG_FILE does not exist. Please create it."
    exit 1
fi

# read configuration from configuration file
source $CONFIG_FILE

#### BUILD ####

# try to build image first to detect any early errors
docker build -t $IMAGE_NAME:latest .

# ask about docker deployment, if user says yes, login to docker
read -p "Push image to docker hub (y/n)? [n]" PUSH_TO_DOCKER_REGISTRY_RESPONSE

if [[ $PUSH_TO_DOCKER_REGISTRY_RESPONSE == "y" || $PUSH_TO_DOCKER_REGISTRY_RESPONSE == "Y" ]]; then

    #### LOGIN ####

    # keep repeating loop until login is successful
    while :
    do
        echo "Logging in as $DOCKER_USERNAME"
        docker login --username $DOCKER_USERNAME
        LOGIN_SUCCESS=$?

        if [ $LOGIN_SUCCESS -ne 0 ]; then
            echo "Login failed. Try again. (hold ctrl+c for exit)"
        else
            break
        fi
    done

    #### VERSION ####

    # attempt to get previous tag from git
    PREVIOUS_VERSION=$(git describe --tags --abbrev=0 2>/dev/null)
    PREVIOUS_VERSION_COMMAND_SUCCESS=$?

    # no version yet
    if [[ $PREVIOUS_VERSION_COMMAND_SUCCESS -ne 0 ]]; then
        PREVIOUS_VERSION="None"
    fi

    echo "Previous version: ${PREVIOUS_VERSION}"
    read -p "Enter new version (leave blank for no version increment and no tag): " NEXT_VERSION

    # check if version was set and decide if we will tag the image or not
    TAG_IMAGE=0
    if [ ! -z $NEXT_VERSION ]; then
        TAG_IMAGE=1
        echo "Docker image will be tagged with ${IMAGE_NAME}:${NEXT_VERSION}."
    else
        NEXT_VERSION="None"
        echo "Docker image will not be tagged with any version."
    fi

    # ask user to confirm
    echo "Docker image will be tagged with ${IMAGE_NAME}:latest."
    read -p "Confirm update (y/n) [n]: " CONFIRM_UPDATE

    if [[ $CONFIRM_UPDATE != "y" && $CONFIRM_UPDATE != "Y" ]]; then
        echo "Update canceled."
        exit 2
    fi

    #### PUSH TO REGISTRY ####

    # push and tag if configured
    if [ $TAG_IMAGE -eq 1 ]; then

        # create git tag
        echo "Tagging git with ${NEXT_VERSION}"
        if [ $DRY_RUN -eq 0]; then
            git tag $NEXT_VERSION
            git push --tags
        fi

        # tag image
        echo "Tagging image with version ${NEXT_VERSION}."
        if [ $DRY_RUN -eq 0]; then
            docker tag $IMAGE_NAME:latest $IMAGE_NAME:$NEXT_VERSION
        fi
    fi

    echo "Pushing ${IMAGE_NAME}:latest to registry."

    if [ $DRY_RUN -eq 0]; then
        docker push $IMAGE_NAME:latest
    fi

    if [ $TAG_IMAGE -eq 1 ]; then
        echo "Pushing ${IMAGE_NAME}:${NEXT_VERSION} to registry."

        if [ $DRY_RUN -eq 0]; then
            docker push $IMAGE_NAME:$NEXT_VERSION
        fi
    fi

    echo "Image ${IMAGE_NAME}:latest was pushed to registry."

    if [ $TAG_IMAGE -eq 1 ]; then
        echo "Image was tagged with ${IMAGE_NAME}:${NEXT_VERSION} and pushed to the registry."
    else
        echo "No version was tagged or pushed."
    fi
else
    echo "Built image was tagged ${IMAGE_NAME}:latest, no pushes or version changes were made."
fi
```

I recommend trying out this script first with `DRY_RUN=1`. This will allow you to test how script works without actually pushing anything.

Please note that in order for versioning to work, you need to have git initialized and you need at least one commit, as the system uses git tags to perform versioning. The command `git push --tags` will fail if you have no remote added yet. The script will continue normally, but make sure that you run this command again after you add the remote.

```bash
git init
git status # make sure nothing sensitive is to be commited
git add -A
git commit -m "Initial commit"

# add remote and push if needed...
```

When you are ready to build your first version, set `DRY_RUN=0` and run `build.sh`. I recommend first version to be 0.1. After pushing to registry, you should be able to see pushed images in your Docker hub registry.

_Note: if you tag your image twice per commit, one commit will have two tags. This is okay and will work normally, however displayed Current version might be wrong, due to the behavior of the command, which gets the latest commit. Anyway, there should never be two versions per one commit._

I recommend changing the source code after pushing, creating another commit and pushing next version 0.2, just to try the system out.

Now you should have two commits, and version of your image should be 0.2. In my case, my latest version `leonpahole/caturday:latest` is `leonpahole/caturday:0.2`.

### Step 7: Write `docker-compose.prod.yml` for production deployment, using versioned image name for registry.

It is time to write production docker-compose file. Note that docker-compose is not meant for production, at least not for serious projects. I find it suitable for personal projects, although I am slowly migrating to production suitable tool Docker swarm, which I will discuss in a future blog post.

Our `docker-compose.prod.yml` will not contain any local development tricks; we will use our pushed image. The file will be standalone and won't depend on any other compose file.

Here is `docker-compose.prod.yml`:

```yaml
version: "3.7"

services:
  wordpress:
    container_name: caturday_site_prod
    image: leonpahole/caturday:0.2
    restart: always
    ports:
      # this is only for demo purposes!
      # In reality, this should not be exposed,
      # there should be a proxy in front of this container,
      # which would also hold certificates.
      - 8080:80
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: ${DB_NAME}
      WORDPRESS_DB_USER: ${DB_USER}
      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - uploads_prod:/var/www/html/wp-content/uploads

  db:
    container_name: caturday_db_prod
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_RANDOM_ROOT_PASSWORD: "1"
    volumes:
      - db_prod:/var/lib/mysql

volumes:
  uploads_prod:
  db_prod:
```

This setup also requires us to plug-in some secrets, namely database accesses. For this, we will use an environment file called `.env`. This file should not be committed, so we will also create an example file `.env.example`.

My `.env` looks like this:

```bash
DB_NAME=caturday
DB_USER=caturday_admin
DB_PASSWORD=cdsd789KD#_DK
```

Don't forget to add `.env` to `.gitignore` and add `.env` and `.env.example` to `.dockerignore`.

Some differences, compared to our development file, are:

- names of containers are postfixed with `_prod`
- we don't hardcode credentials anymore, since no one can know about them
- we don't mount code into the container, so that the built code is used
- we use image from registry for our Wordpress
- uploads are delegated their own volume
- `restart:always` is added, so that container restarts upon system restart or on failure

**Important note** _Notice that the port exposed in Wordpress is 8080. This is not a good practice and is only done for demonstration purposes. In reality, you should have an nginx container running in front of this Wordpress container, which would proxy requests from your domain into the container on port 80. This nginx proxy would also hold SSL certificates. Because infrastructures vary a lot and for simplicity, I omitted this step from this blog post, but I will write about it in the future._

We can actually test this setup locally. Simply stop your running dev containers, and run your production ones.

```bash
docker-compose down
docker-compose -f docker-compose.prod.yml up -d
```

Visit localhost:8080 and check if the site works. Note that first time it might take Wordpress about 20 seconds to initialize configuration.

### Step 8: Write a script that will deploy the image on the server

There are many ways to deploy our configuration. Note that we only need to provide `.env` file and `docker-compose.prod.yml`, so we don't need to git clone anything on our server.

We could deploy this with tools like `Ansible`, but to keep it simple, we will use `scp` and a good old bash script.

We will copy `.env` and `docker-compose.prod.yml` to the server and run `docker-compose -f docker-compose.prod.yml up -d`. Note that when new version is released, you should update `docker-compose.prod.yml` with new version and rerun the deployment script (and also commit new version to git).

The script needs a configuration file, in this case called `deploy.env`. This file should not be included in git, but for reference, you should add `deploy.env.example`, which contains placeholders. The file contains accesses to server that we are deploying onto.

Here is how my `deploy.env` looks like:

```
SERVER_IP=(MY IP - HIDDEN)
SERVER_USERNAME=(MY USERNAME - HIDDEN)

PROJECT_DIRECTORY=/home/(MY USERNAME - HIDDEN)/caturday
```

There is another problem with this setup - file permissions. When we deploy the container, permissions for `wp-content` will be set to root user. Therefore, after we create containers, we need to run another command to change ownership of `/var/www/html` to `www-data`. Here is the script `fix_permissions_for_production.sh`:

```bash
docker-compose -f docker-compose.prod.yml exec -T -u root wordpress chown -R www-data:www-data /var/www/html
```

Here is the script `deploy.sh`, which will also copy and call `fix_permissions_for_production.sh`:

```bash
set -u

CONFIG_FILE=deploy.env

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Configuration file $CONFIG_FILE does not exist. Please create it."
    exit 1
fi

# read configuration from configuration file
source $CONFIG_FILE

echo
echo "### CREATING DIRECTORY ####"


ssh $SERVER_USERNAME@$SERVER_IP "mkdir -p $PROJECT_DIRECTORY"


echo
echo "### COPY COMPOSE FILE ####"

read -p 'Copy docker-compose.prod.yml? (y/n) [n]:' COPY_COMPOSE

if [[ $COPY_COMPOSE == "y" || $COPY_COMPOSE == "Y" ]]; then
    scp docker-compose.prod.yml $SERVER_USERNAME@$SERVER_IP:$PROJECT_DIRECTORY
fi

echo
echo "### COPY ENV FILE ####"

read -p 'Copy docker .env? (y/n) [n]:' COPY_ENV

if [[ $COPY_ENV == "y" || $COPY_ENV == "Y" ]]; then
    scp .env $SERVER_USERNAME@$SERVER_IP:$PROJECT_DIRECTORY
fi

echo
echo "### COPY PERMISSION SCRIPT ####"

scp fix_permissions_for_production.sh $SERVER_USERNAME@$SERVER_IP:$PROJECT_DIRECTORY

echo
echo "### RUNNING DEPLOYMENT ###"

ssh $SERVER_USERNAME@$SERVER_IP << EOF
    cd ${PROJECT_DIRECTORY}
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    bash fix_permissions_for_production.sh
EOF

echo "### DONE ###"
```

After we have `.env` correctly filled out, let's run the script!

```bash
bash deploy.sh
```

The script will copy the files onto the server and launch the server. You can test how updates and rollbacks work by changing the version of the image in `docker-compose.prod.yml` and rerunning the script.

## Using this boilerplate

So, in a nutshell, to use this boilerplate, you begin developing locally by running:

```bash
docker-compose up -d
```

Code in your IDE is synced into the container and the updates display immediately. Do not forget to not modify twenty themes, as they will be overwritten.

After you are ready for next production update, commit all your changes, and run build script, which will build the image, tag it with your version and push it to registry:

```bash
bash build.sh
```

Don't forget to fill out `build.env` before.

Before deployment, you can locally test the image:

```bash
docker-compose down
docker-compose -f docker-compose.prod.yml up -d
```

Don't forget to fill out `.env` before.

When you are ready to deploy, change the version of the image in `docker-compose.prod.yml` to reflect your desired deploy version and commit it. Then, run the deploy script:

```bash
bash deploy.sh
```

Don't forget to fill out `deploy.env` and `.env` before.

Note that you should put a proxy in front of Wordpress container and disable open port 8080 in `docker-compose.prod.yml`.

Your site is now deployed!

Boilerplate is available [here](https://github.com/leonpahole/wordpress-docker-boilerplate).
Sample site repo can be found [here](https://github.com/leonpahole/caturday).
