---
layout: "../layouts/BlogPostLayout.astro"
title: "My take on comments in code"
excerpt: "There's a lot of conflicting information about code comments in programming communities. Some people believe in writing comments as much as possible, while others advocate for code that is self-documenting and thus renders comments almost useless. In this blog post I lay out my past experiences with comments and how these experiences shaped my current approach to writing clear and understandable code."
categories:
  - "Programming"
  - "Clean code"
date: "2022-11-20"
slug: good-comments
cover_image:
  src: "/src/assets/blog/covers/good-comments-cover.jpg"
  alt: ""
  credit_text: "Luca Bravo on Unsplash"
  credit_link: "https://unsplash.com/es/@lucabravo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

My take on comments has changed quite significantly throughout my programming career.

# The what-type comments

In university, the professors often told us that we need to write a lot of comments so that they'll be able to understand the code when they review it. Because of this, I got into a habit of writing a lot of **what-type** comments.

A **what-type** is a label that I give to comments that answer the question "What is this code doing?". What-type comments can be useful, useless or dangerous.

Let's look at an example:

```ts
// computes the average of an array
function compute(arr: number[]): number {
  // sum of all elements
  let x = 0;

  // iterate through elements
  for (let i = 0; i < arr.length; i++) {
    x += arr[i];
  }

  // average = sum / length
  return x / arr.length;
}
```

The first comment is useful since it tells us what the function does. As for the comments in the body of the function, it can be argued that some are useful (the one explaining what `x` is), while others are useless (the iteration and average formula comments).

In this example, both comments are useless:

```ts
// add two numbers
function addTwoNumbers(num1: number, num2: number): number {
  // add
  return num1 + num2;
}
```

What about dangerous comments? Well, have you ever read a comment that has confused you more than it helped you?

```ts
// add two numbers
function subtractTwoNumbers(num1: number, num2: number): number {
  // subtract
  return num1 - num2;
}
```

The name of the function doesn't match the comment above it. This frequently happens if the code is copy-pasted and the comment is not modified. Other times it could be because the code has changed, but the author forgot to also change the comment. This happens especially if the code and the comments are not in the same place in the code.

# The self-documenting approach

I was first introduced to the self-documenting approach to writing comments during [an excellent presentation on Clean code](https://www.youtube.com/watch?v=7EmboKQH8lM&list=PLmmYSbUCWJ4x1GO839azG_BBw8rkh-zOj).

The idea is simple: we should treat most comments as a failure to properly express ourselves in code. In other words, the code should do its best to communicate what it does (through proper names and structure), so the comments aren't needed.

The "more the better" mentality to comments doesn't apply here. The comments should be written if they will be useful, and any other comments should be avoided so they don't turn into dangerous ones later.

Let's look at the function `compute` from earlier again:

```ts
// computes the average of an array
function compute(arr: number[]): number {
  // sum of all elements
  let x = 0;

  // iterate through elements
  for (let i = 0; i < arr.length; i++) {
    x += arr[i];
  }

  // average = sum / length
  return x / arr.length;
}
```

Instead, we could write this:

```ts
function computeAverage(arr: number[]): number {
  let sum = 0;

  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }

  return sum / arr.length;
}
```

The following changes were made:

- The function was renamed from a generic `compute` to exactly what the function does: compute average. This means we can get rid of the comment above the function.
- The variable `x` was renamed to `sum`, so we can get rid of the comment about this variable holding the sum.
- The iteration and formula comments were removed because the code is quite clear on what it does.

Let's look at another example. This function calculates BMI (body mass index):

```ts
// calculate BMI
// weight is in kg, height is in cm
function calculate(weight: number, height: number): number {
  // convert from cm to meters
  const hm = height / 100;

  // bmi: weight / height^2
  return weight / hm ** 2;
}
```

And here's the comment-free version:

```ts
function calculateBMI(weightKg: number, heightCm: number): number {
  const heightMeters = covertFromCmToMeters(heightCm);
  return weightKg / heightMeters ** 2;
}
```

When writing self-documenting code, I typically do it iteratively. The first version of the code is ugly, with bad variable and function names. The goal is just to make sure that what I'm doing will work in the end. Then, once I know that my code properly works, I start reviewing and refactoring it.

This iterative approach works well because it balances speed and quality. Typically, once we have the whole code written, coming up with good variable names is much easier than if we try to write good code from the beginning. Apart from this, in some cases, we'll realize that the code we are writing is not going to work and we have to backtrack. If we write good code from the beginning, this will mean a lot of wasted effort.

# Why?

I've been practicing the self-documenting approach for quite some time. It felt great, apart from a few frustrating moments when it was hard to come up with a good name for a function or a variable. I rarely left comments on my code, as I felt that the code itself did a good job of explaining itself.

However, what I've started noticing is that the self-documenting approach runs into issues once the codebase gets larger.

When the project is at its beginning, the codebase is small and it all makes sense. But the longer that the project goes on, the more we start forgetting about **why** we implemented something the way we did. And in these cases, the self-documenting code usually falls short.

For example, let's say that we are building a front-end app for real-time video communication. We want to measure the dimensions of the video that is streamed to us from the server.

We write the function to measure the stream by measuring its video track:

```ts
function getVideoStreamDimensions(videoStream: MediaStream): Size | null {
  const videoTrack = getVideoTrackOfMediaStream(videoStream);
  return getTrackDimensions(videoTrack);
}
```

After some testing, we realize that on Safari our function isn't returning the right dimensions. Some digging around the internet reveals that this is a bug in Safari and we must find a workaround.

One alternative is to insert the stream into a video element and then measure that video element. We implement this approach next.

```ts
function getVideoStreamDimensions(videoStream: MediaStream): Size | null {
  const videoElement = createVideoElementWithStreamAsSrc(videoStream);
  return getVideoElementDimensions(videoElement);
}
```

Looks good - the code self-documents itself perfectly so we know exactly what it is doing. It also seems to work on all browsers.

Let's fast-forward 3 months now. A new developer has since joined the team and has been tasked with figuring out why the app becomes slow after it has been used for a while. They find out that it's because the app keeps inserting video elements into the site. It turns out that when we implemented our `getVideoStreamDimensions` workaround with the video element, we forgot to remove the video element after making the measurement!

With this in mind, it seems pretty obvious that the fix is to simply remove the video element after we are done measuring it with `getVideoElementDimensions`.

However, for our new developer, this might not be so obvious. Here's how their internal monologue might go when they read the code for `getVideoStreamDimensions`:

> _Ok, so I see the problem - they are using the video element to measure the stream, but ..._

> _... but, **why**?_

> _Why? ..._

> _... why not just measure the media track? It seems like a much more straightforward way to measure a media stream._

> _I'll refactor this to measure the media track, which will not only fix the video element bug, but also make the code better!_

We can see where this is going. Our new developer will proudly refactor the code back to what we had initially:

```ts
function getVideoStreamDimensions(videoStream: MediaStream): Size | null {
  const videoTrack = getVideoTrackOfMediaStream(videoStream);
  return getTrackDimensions(videoTrack);
}
```

And then they'll realize that the solution doesn't work on Safari. And that's how time is wasted.

This is the main issue I've had with the self-documenting approach. Yes, the approach perfectly communicates **what** the code is doing - our new developer immediately realized what the code did - but it doesn't always communicate **why** the code is doing **what** it is doing the way it is and not some other way. This can cause confusion and waste time, as we saw in the example.

It's also important to stress that the new developer might not necessarily be a different person - given the fact that a lot of things can happen in 3 months, the new developer might as well be the same developer that initially wrote the code. In that case, the inner monologue might go something along these lines:

> _Wait, **why** did I write this like that? **Why** not just measure the media track?_

# The why-type comments

Because I've been observing that the longer the projects go, the more I'm asking myself **why** (which wastes time and creates unnecessary frustration), I've decided to address the issue by using the why-type comments.

The purpose of these comments is to communicate the **why**, which complements the **what** that the self-documenting approach already communicates. This way we get the best of both worlds.

I must stress that not every piece of code requires the why-type comment - it depends on the context.

For example, I would not add a why-type comment on the `computeAverage` function, because it is a simple computational function. However, I might add a why-type comment to a function that uses the `computeAverage` method if it is not apparent why that function was used. Let's look at two examples.

```ts
function computeAverageStudentGrade(student: Student): number {
  const subjects = getSubjectsForStudent(student);
  const grades = subjects.map((subject) => subject.grade);
  return computeAverage(grades);
}
```

In this first example, there is no need for any comments. The function computes the average student grade and utilizes the `computeAverage` function to do so. Everything makes sense and there are no **why** questions here - the **why** is obvious.

```ts
function canStudentGetScholarship(student: Student): boolean {
  // according to the university law, the average grade is considered for scolarship elligibility
  // <link to the law>
  const averageGrade = computeAverageStudentGrade(student);
  const MinimumAverageGradeForScolarship = 9;
  return averageGrade >= MinimumAverageGradeForScolarship;
}
```

In this example, we again use the average, but this time it is less obvious **why** exactly we are using it. It turns out that the average grade is what is considered when students apply for scholarships. If we leave that part of the information out, we risk someone asking the **why** question (_Why average?_) when reading the code.

Sometimes we can communicate the **why** using the self-documenting approach, as I did here:

```ts
function canStudentGetScholarship(student: Student): boolean {
  const averageGrade = computeAverageStudentGrade(student);
  const MinimumAverageGradeForScolarshipAccordingToUniversityLaw = 9;
  return (
    averageGrade >= MinimumAverageGradeForScolarshipAccordingToUniversityLaw
  );
}
```

As you can see, I've renamed the `MinimumAverageGradeForScolarship` to `MinimumAverageGradeForScolarshipAccordingToUniversityLaw` as an attempt to communicate the **why** without comments. This works but as you can see, it results in a very long variable name. I think that in this case, the comment is better - as long as we make sure to change it when we change the implementation.

Let's now return to the media stream dimensions problem from the previous chapter and add some why-type comments to it, to prevent future developers from getting confused:

```ts
function getVideoStreamDimensions(videoStream: MediaStream): Size | null {
  // we use the video element to measure the stream because it is currently the only reliable way to measure the stream in all browsers
  // we previously tried to measure the stream by measuring the video track, but that returned invalid results on Safari
  // Safari bug report: <link to Safari bug report>
  // Blog post going into details of Safari media stream measurement behavior: <link to the blog>
  const videoElement = createVideoElementWithStreamAsSrc(videoStream);
  return getVideoElementDimensions(videoElement);
}
```

The self-documenting code still communicates the **what**, but now we have also added the why-type comment to explain the **why**.

When writing why-type comments, I try to put myself in the shoes of someone who will be reading the code in the future and ask myself if there are any **why** questions that the person might have. I then:

- Write the comment in free-form.
- I make sure that the comment asks and then answers the **why** question (for example: _Why are we using the video element to measure the stream? Because ..._) or at the very least contains the word _because_.
- I add relevant links that might make understanding the approach easier. I've never been a big fan of pasting links in the code because the links can inevitably go dead. However, I believe that as long as the comment itself communicates the idea, and the links are there just as additional reading material and not crucial for understanding, the links are fine. Whenever I paste links into the code, I also make sure to describe what's behind that link so that if the link goes dead, the person reading the comment knows what exactly was behind that link.
- If the current implementation is the result of a few failed attempts, I write these attempts (_We've previously tried X, but it didn't work because of Y._). This prevents wasting time on something that you've already discovered doesn't work.
- I make sure that the comments are as close to the code they refer to as possible. This ensures that if the code changes, I won't forget to change the comment too.

There's one mistake we should avoid when it comes to writing why-type comments. Here's what it might look like:

```ts
function getVideoStreamDimensions(videoStream: MediaStream): Size | null {
  // we use the video element to measure the stream!
  const videoElement = createVideoElementWithStreamAsSrc(videoStream);
  return getVideoElementDimensions(videoElement);
}
```

I've been guilty of such comments in the past. I felt that reiterating in the comment what the code did and then adding the exclamation mark at the end, would somehow communicate the idea behind the code. But of course, this comment is essentially useless and tells us nothing of substance.

# Conclusion

I've had a rocky relationship with code comments ever since I started coding. But throughout the mostly useless (and dangerous) why-type comments, to no comments with the self-documenting approach, to the **why** problematic, I've learned a lot about what I need to properly communicate my intentions in code to my future self and other people.

The combination of the self-documenting approach and the why-type comments seems, at least for the time being, the right way for me to communicate the **what** and the **why** while minimizing the risk of dangerous comments.
