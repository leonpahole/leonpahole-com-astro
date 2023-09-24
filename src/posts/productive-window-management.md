---
layout: "../layouts/BlogPostLayout.astro"
title: "Alt-tab is not good enough: managing windows productively"
excerpt: "In this blog post I'll be detailing my journey through finding a good window management solution, while also describing an important concept underlying all productivity-boosting techniques."
categories:
  - "Personal Workspace"
  - "Productivity"
date: "2022-10-29"
slug: productive-window-management
cover_image:
  src: "/src/assets/blog/covers/productive-window-management-cover.jpg"
  alt: ""
  credit_text: "R Mo on Unsplash"
  credit_link: "https://unsplash.com/ja/@mooo3721?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

I've been using the computer for over 15 years and one thing that has always frustrated me was using the alt-tab key combination to switch between open windows.

Usually, we actively work with multiple windows when working with the computer. For example, when I write code, I switch between multiple IDE windows, the terminal, multiple browsers, Slack, issue tracker and Spotify.

In my opinion, proper window management is essential for maximizing productivity, because we typically switch between windows often. If the development process is constantly interrupted because we are having trouble finding that elusive browser window where the designs are, we will waste a lot of time and frequently lose focus due to sheer frustration.

## How do we effectively manage our windows?

I believe that when it comes to productivity, **personal preferences** and **self-reflection** are crucial factors.

I've used a few different techniques for window management in the past. Unfortunately, none have properly suited my **personal preferences**. This of course doesn't mean that they don't suit the personal preferences of someone else.

### Alt-tabbing

Alt-tabbing is the technique that I've used for the majority of the time I've been working with computers. But I don't like it.

It causes windows to become stacked on top of one another, causing the navigation to become messy.

Often it is impossible to determine the order of windows when alt-tabbing (unless we have a really good awareness of our open windows), so all we can do is alt-tab and wait for the right window to be selected. If we miss it, we have to start over. This also means that it requires a lot of keystrokes to find the desired window.

Sometimes it is impossible to find the right window if multiple windows of the same program are open and appear as one window.

### Secondary screen

I have tried my best to properly use two screens for my work, but I always ended up placing the majority of my windows on one screen, and then using the second screen for rarely used windows, like Spotify.

Screens also take up a lot of physical space on the desk and cannot be easily transported. I like my workspace to be portable by fitting it all in my backpack, so I can be at maximum productivity regardless of whether I am home, at the airport or in the library.

In any case, secondary screens don't seem to fully solve the window management issue problem. We still need to alt-tab between windows, we just have one more slot where we can place them.

### Tiling

The idea of [tiling](https://en.wikipedia.org/wiki/Tiling_window_manager) is to split the window into multiple smaller subwindows (frames), which don't overlap and are all visible on a single screen. This allows us to look at multiple windows on one screen, reducing the need to switch windows or look at the secondary screen.

While tiling looks very cool, it doesn't work for me in practice. The tiles end up being too small to be usable - especially because I sit quite far away from the screen to reduce eye strain.

It's also really hard to keep track of tiles and to properly add new ones so that the layout doesn't break. All in all, it's an attractive solution, but a very complex one to get right.

--

You might be thinking that I'm being too critical about all these techniques. It is important to note that all of these criticisms stem from my own **personal preferences**.

I've tried all of these techniques and then **self-reflected** on them, writing down the good and the bad, regardless of how popular or recommended they are by other people.

If I hadn't done that, I would have settled for a solution that might be widely used but would be suboptimal for me.

## Workspaces to the rescue

I've been using [Pop!\_OS](https://pop.system76.com/) as my operating system of choice for a while now.

Pop!\_OS is an OS with many powerful features to improve workspace productivity. To quote their website:

> _Pop!\_OS is designed for fast navigation, easy workspace organization, and fluid, convenient workflow. Your operating system should encourage discovery, not obstruct it._

PopOS supports [tiling](https://www.youtube.com/watch?v=-fltwBKsMY0) as I've described above - it works well, but it has all the same issues as I've outlined.

The feature that solved my window management struggles is [workspaces](https://www.youtube.com/watch?v=USQjxLP1Z5k). Workspaces are not unique to Pop!\_OS, but a large emphasis is placed on them in the official guide, so it was easy for me to discover them and try them out.

Workspaces allow us to create virtual desktops that we can switch between. Each workspace is like a completely new screen that we can place our windows into. Workspaces are placed vertically one after another.

Switching between workspaces is done with convenient (customizable) [hotkeys](https://support.system76.com/articles/pop-keyboard-shortcuts/), involving the up or down arrow keys to switch to the workspace above or below, respectively. If you are a fan of Vim, you'll be pleased to know that you can also use the K and J as the direction keys, which can reduce hand movement on the keyboard.

Similarly, placing windows in their respective workspaces is done using the arrow keys too. This allows us to place the current window one workspace up or down from where it currently is.

The key to using workspaces effectively is finding your own preferred placement of workspaces alongside the stack. I usually place my workspaces like this:

- Browser (for research and designs)
- Browser (what I'm working on)
- IDEs (one workspace for each)
- Communications (Slack)
- Spotify / background noise that I am listening to

When using workspaces, I imagine the workspaces alongside this stack, so I can easily switch between them and stay in the flow.

Pop!\_OS also includes some hotkeys to switch to workspaces by referring to them by their number. This allows us to jump from one workspace to another without having to press the up or down key multiple times. I find myself very rarely using this, because I tend to imagine my workspaces relative to one another, rather than as a number on the stack. For example, when I am on my Slack tab, I know that Spotify is below me and the IDE is above me, and then above the IDE is the browser. This allows me to switch to the browser by pressing the up key a few times quickly, which is faster than trying to remember the number of the workspace.

In my experience, workspaces have a few advantages over the aforementioned techniques:

- As opposed to alt-tabbing, I know exactly how many times I need to press the up / down key to land on the right window. The windows are not stacked on top of one another, so the screen is kept tidy.
- As opposed to using the secondary screen, each workspace acts as its own screen, but instead of shifting eye focus from one screen to another, we switch the workspace using the keyboard. The number of screens is limited, while the amount of workspaces is not. Workspaces take up no extra space in my backpack and therefore allow me to stay productive in any environment.
- As opposed to tiling, workspaces allow me to view the entire window in full screen.

It should be noted that workspaces can be used in combination with all of the listed alternatives - we can still alt-tab, use tiling or use a secondary screen together with workspaces. But I find that most of the time that workspaces alone are the simplest, and yet the most effective solution for me.

## Conclusion

In this post, I've described my thought pattern when it comes to improving my productivity. The key ideas are to always keep **personal preferences** in mind and then **self-reflect** on potential solutions.

In my case, I figured out that alt-tabbing, secondary screen and tiling, while effective solutions to the window management problem, did not match my personal preferences. On the other hand, workspaces did.

Does this mean that I am telling everyone to install Pop!\_OS and use workspaces? Absolutely not.

I believe that productivity manifests itself in different forms for everyone. For someone, the most productive way to manage windows might be using workspaces in Pop!\_OS, while for someone else it might be using tiling on Windows.

The key is to try out different solutions and see which ones fit the best. This is an incremental process.

I am quite productive and satisfied with my current development workspace, but this doesn't mean that I will no longer search for better ways to further improve it. And who knows, a year from now, my workspace might look completely different.
