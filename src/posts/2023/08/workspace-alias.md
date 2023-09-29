---
layout: "../../../layouts/BlogPostLayout.astro"
title: "Productivity bit: workspace alias"
excerpt: "Over the years I've realized that small - perhaps even trivial - productivity improvements can really add up to produce an efficient work environment. I call these improvements productivity bits. In today's blog post, I am sharing the productivity bit that helps me kickstart my work on a certain workspace."
categories:
  - "Productivity"
date: "2023-08-05"
slug: productivity-bit-workspace-alias
cover_image:
  src: "/src/assets/blog/covers/productivity-workspace-alias-cover.jpg"
  alt: ""
  credit_text: "Chiara F on Unsplash"
  credit_link: "https://unsplash.com/@quasichiara?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

Ever since I started using Neovim, my work on a certain project always begins with changing my terminal working directory into the folder that contains the codebase. It's pretty easy - I just have to write `cd <path-to-directory>`.

## Unexpected cognitive load

However, despite this process being easy, it produced a small cognitive load on a daily basis, because I had to remember the actual path to the project directory. I've noticed that this cognitive load sometimes **interrupted my process of getting into the flow state, effectively delaying it**.

So, I decided to `alias` ([shortcut](https://linuxize.com/post/how-to-create-bash-aliases/)) all of the `cd` commands that I use. Now, I can just type `ws<abbr>` to immediately `cd` into the directory of the project that is behind the chosen `abbr`. For example, I write `wsftf` to `cd` into the frontend directory of a Fit tracker that I am building right now, and `wsftb` for the backend of the app.

## The script

To make the process of creating new aliases easier, I and my fellow AI companion (side note: ChatGPT is great for writing bash scripts!) wrote a script that creates the alias of the current directory by running the command `save_ws_alias <abbr>` (I named the script `save_ws_alias.sh` and added it to my `PATH`). Note that I am using the Fish shell, so the last 2 lines are specific to it.

```bash
#!/bin/bash

# Check if the alias name is provided as a command-line argument
if [ -z "$1" ]; then
    echo "Alias name is missing."
    echo "Usage: $0 <alias_name>"
    exit 1
fi

# Trim leading and trailing whitespace from the alias name
alias_name=$(echo "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

# Check if the alias name is empty
if [ -z "$alias_name" ]; then
    echo "Alias name cannot be empty."
    exit 1
fi

# Get the current directory
current_directory=$(pwd)

fish_command="alias -s ws$alias_name 'cd $current_directory'"

# Run the Fish shell and execute the command
fish -c "$fish_command"
```

For example, I can run `save_ws_alias ftf` to save the alias `wsftf`.

## Conclusion

It seems trivial, but I've noticed that these aliases have greatly improved how quickly I can get into the flow state and do quality work. This made me realize that productivity doesn't need to be a series of complicated and long processes - sometimes we can just add a little _productivity bit_ into the mix and make great improvements.
