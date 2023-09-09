---
title: "How simplicity became my guiding light"
excerpt: "This is a story of how over the years my life naturally gravitated towards simplicity, starting with my career, and then propagating into my everyday life."
categories:
  - "Personal"
date: "2022-08-06"
slug: simplicity
cover_image:
  src: "../../assets/covers/simplicity-cover.jpg"
  alt: "Keep things simple"
  credit_text: "Brett Jordan on Unsplash"
  credit_link: "https://unsplash.com/@brett_jordan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

The first time I heard the phrase _Keep it simple, stupid_ (abbreviated as KISS) was in a university class. After realizing the professor wasn't talking about the rock band, I tried to wrap my head around the logic behind the statement.

# My first KISS

The KISS principle is quite simple (no pun intended) to understand - in the context of computer science, it simply (I swear, I'm not doing this on purpose) states that when designing systems and writing code, things should be as simple as they can be.

The whole principle sounded a bit abstract, but what I really couldn't grasp is how can a computer system - be it a simple web app or a complex banking back-end - ever be simple. Most apps seem to be complex and entangled with important business logic code by default! The notion of simplicity in programming just didn't register with me as I was used to writing challenging, complex programs, and I was amidst my studies, which heavily focused on complex concepts, such as operating systems and processors. I mean, if it would be simple, everyone would be doing it, right? What am I studying to be if not the competent programmer who designs complex systems and processes that not many people understand?

So, I wiped the thought of the uncomprehensible KISS principle away and went on with my life.

# Building a complex system

Sometime later at work, I was tasked with designing and implementing a sub-system within an existing system that was already in production. With barely any experience under my belt, I jumped onto the challenge to prove myself.

The thought of how complex this new sub-system was going to be has been dwelling in my mind from the very beginning of this project until its bitter end. It definitely shaped my mindset when designing the system. And I felt really good about it - at the end of the day, I was a competent and professional engineer working on a complex task that not many people understood. If I'd be writing something simple, I'd feel like I was not making any progress in my career.

Fast-forward six months, the system was done and shipped. I never felt better in my life (except when I heard Master Of Puppets by Metallica for the first time). The system was so complex and wired with difficult algorithms that even I, the author, had trouble understanding it, let alone other people. I also made sure that the program ran as fast as I could make it - I optimized the living lights out of that code. I even had to write additional documentation for how to test the thing for the regular user. And finally, I made up my own terminology for different parts of the project. The amount of code written was enormous. So complex, so large, so fast, so hard to understand ... so amazing!

# Client's perspective: what actually matters

Let's fast-forward again, to the time I [briefly worked as a project manager](/blog/the-return/). One of the most important lessons I learned while communicating with clients as a PM was that what customers want the most is value for the money that they are investing into the product. And that value is in the product, including all the functionality it entails. The client does not either know or care about how complex the code is behind the scenes nor are they - in most cases - concerned about the speed it runs at. Of course, if the app is so slow that it is barely usable or it computes mission-critical data, it must be fast - but in that case, the speed can be thought of as functionality, which brings us back to the point of value.

Through conversations, I also realized that clients change their minds all the time - not because they like to annoy us, but because they realize that the value of the product could be efficiently extracted in another way.

There are usually just a couple of concerns related to the code that customers bring up, which are again related to value. These are the questions I heard often:

- _How easy will it be to change this down the line?_
- _How hard would it be to onboard a new member onto the project in the future?_

This experience opened my eyes and made me rethink that complex system I wrote some time ago.

# Simplicity takes the driving wheel

After I stepped down as a PM and returned to programming, I felt a lot different about the code I was about to write. Over time, I naturally started writing code that was simple and also encouraged others to follow the same principles.

The whole process happened so organically that I wasn't even cognisant of the fact I was actually following the KISS principle I've been taught in university. And the primary driver of all of this was that when I looked at the big picture of the client's wishes and business, the value of the product is the most important. And writing complex code to feed my ego and make myself feel better for doing something hard to understand is not adding anything to that value - it is most likely reducing it.

What follows are some principles based on simplicity that I started applying when writing code or designing features.

### Stop feeling good about the complexity

In fact, draw the line between complexity and overcomplicating (overengineering) - it turns out that many times systems are not complex, they are just complicated. In my early programming days, I felt that complexity (or rather - complicating) was good because I proved to myself as well as others that I am "smart" enough. I justified complicated design with the fact that programming is meant to be hard and complex and people are not supposed to understand it immediately. Once you change this mindset, you'll find yourself writing much simpler code. This will actually be a lot more challenging and satisfying than complicating things. It is not that hard to write complicated code. It's hard to write simple code. But it pays off in the long run.

### Naming everything according to how the customer calls it or how it's called in the actual app

If the function creates a blog post, I'll name it `createBlogPost` and the resulting variable `createdBlogPost`, as in natural language.

This also prevents me from coming up with my own terminology, which makes things confusing when someone else reads the code or when communicating with the client. If the `blog post` is called a `note` in the code, I'll inevitably use the word "note" in a meeting, making everyone confused.

Similarly, when someone is onboarded on the project, they usually first look at the app in the eyes of the regular user, where they'll see `blog posts`. And if they'll later look at the code and see `notes`, they will not tie it to blog posts without further explanation. Made-up, out-of-sync terminology creates friction.

Naming things is hard - but the good news is that the client can be involved in the naming process! At the meeting, simply ask: _How should this functionality be called?_

### Don't violate the principle of single responsibility

If I have a class named `NumberAdder`, I expect it to add numbers. I don't expect it to divide numbers or solve the traveling salesman problem. This can quickly make things complicated.

When using an external library or even when designing proprietary systems, I often observe that people make their code do more than it is intended to do. For example, many front-end routing packages can also do more than just routing, for example fetching data. While some people like that their software packages are conveniently doing more than advertised, I think it is confusing. I always code explicitly - I use the router only for routing and I fetch data in another separate block of logic. This way things stay clear and there is no magic going on behind the scenes.

### Changing the mindset from complex to simplistic thinking

In the past, whenever I received a feature to implement, I would often immediately get intimidated by how complex the task sounded before I began to frantically map out the complex technical plan based on the thoughts that popped into my head. Minutes later I would already be punching complicated code into the code editor.

What I like to do now instead, is clear my head and start from the ground up. _What would be the simplest way to achieve this?_ I like to think about features in terms of a plain algorithm, packaged as a console app. _What data is needed as input and what data is produced as output?_ Often I will write tests for the feature with the same principle in mind.

Every feature is treated with a simplistic approach but still respected for its complexity. The key is to not let complexity get into your head, causing you to think complex from the get-go. Often you will realize that a big feature can be simple by reusing the existing code. Other times more work will need to be done, but it can still be simple.

### Abstract complexity away from your attention span and test it

Every app has complex algorithms. While some algorithms can be imported as a library, others will need to be implemented manually. The code in these algorithms might become quite messy and complicated.

Sometimes it's not the code that needs to be simplified, but the environment around it. A complex algorithm can be thought of as a black box that accepts inputs and returns outputs. This means that all the complexity can be extracted into a function(s) in a separate file. And while the code in there might be messy and complicated, to the outside world the function will be named properly, accept developer-friendly inputs and return expected outputs in the right data structure. This also means the function is easily testable!

When I design complex algorithms, I start by writing tests. While writing tests I think about the simplest and clearest interface (name, structure of inputs, and outputs) that the public-facing algorithm function will have. At this point the function is not even declared yet - I get a bunch of syntax errors in my test code. Once I am comfortable with the interface after writing multiple tests, I declare the function and begin the implementation.

The result is an easy-to-use function that is reliably tested, even if the code inside it is complicated. Based on my experience these kinds of algorithms are rarely modified, so the complicated code stays complicated forever - and that's fine. But if with time the algorithm's logic changes more often, we can easily simplify it - the tests will make sure everything still runs properly.

### Pick technologies based on other factors than technicalities

As developers we often feel like we are on the "code island", and all that matters is the code we write on that island. But we need to take into account other participants in the development process, especially other developers.

My preferred framework to build web apps is React. However, if my team consists of people who have zero experience in React, but have worked with Angular before, I'll choose Angular. People argue all the time about what's better - Angular or React, Node.JS or .NET, etc. The reality is that the decision is often driven by other factors than technicalities - in this case, the simplicity of working on an Angular project with a team of Angular experts.

The bottom line is that we should not let our individual preferences get the best of us when planning projects.

### Think twice before changing what's already known

Regardless of the environment, language or the company the developer works at, certain terminology and practices are standard across the entire community. Changing this can often lead to confusion, making things more complex than they should be.

For example, every JavaScript developer knows what a `Promise` is. Let's say I don't like this naming, so in the code, I rename it to `FutureValue`. While I might be happier with the name now, everyone joining the project will need to make the switch in their head to use `FutureValue` instead of `Promise` anywhere when writing or reading the code. This creates unnecessary friction.

As developers we often let our personal biases and frustrations with the technologies get the best of us, leading us to change well-defined practices and terminology or pick technologies that we like. Keeping things simple means ignoring these biases and working for the greater good - making sure the code is understandable and everyone feels good about it.

### Evaluate whether adding that library is worth it

Libraries are there to help us not reinvent the wheel and reuse as much code as possible. They provide a framework for us to build apps on, but each library you add to your stack will require some additional learning curve to adopt into your team.

Ideas for adding extra libraries to the project might pop up during later stages of the development process for various reasons - making things more convenient or changing the way something works. However, what people speak about rarely is the learning and adaptability friction of adding the library. I'm not saying you should not install libraries - but I like to bring the thinking of the cost-benefit ratio when adding libraries into the spotlight.

### When in doubt the simplest solution might sway the decision for you

This will be a very controversial opinion, but I always tend to get more attracted by libraries that provide a simple, clean interface, even if they are slower; as opposed to high-performance libraries that have a very convoluted and complex API.

Complex APIs can be learned, but it takes time. And sometimes there is no way around it. But in many cases, the simpler APIs are sufficient for the features we are building. In any case, it's always easier to migrate from a simpler to a complex solution than the other way around.

More controversial opinions incoming (at least for React developers): I prefer MobX over Redux. Yes, MobX might be slower and less adopted, but it is so simple to use - anyone with basic knowledge of OOP can use it. On the other hand, Redux requires a lot of upfront learning and is overall just a lot more complex. To be clear, I don't disregard Redux and I think it's a fantastic library, but I feel like with MobX I can achieve the same things, albeit with a lot simpler and more intuitive approach.

# Don't get too obsessed with simplicity, though

Paradoxically, if you spend too much time trying to simplify things, you'll end up complicating it in your mind, which can result in frustrations, (code) writer's block, and missed deadlines. When I develop features, I often write the worst code possible first (except the public-facing APIs and tests for it), spending more time thinking about the architecture than the structure of the code, and then, before checking everything into version control, I refactor the implementation into the simpler design by applying principles I wrote about above.

The refactoring process is incremental and it can be done periodically until we get satisfied with the result. Refactoring can be postponed if we are pressured by deadlines. The important takeaway is that it's okay for the code to not be 100% simple. Often I've actually discovered that leaving the code as is for a couple of days will spark more ideas on how to make it simpler. Simplicity is imbued into the development lifecycle, not a one-time fix.

# Reflecting back

Looking back at the sub-system I built, my feelings towards it have definitely changed. First of all, the system was not complex, it was overly complicated. The only thing that I achieved with it is being proud of how complicated of a system I can write. And even though the system ended up working just fine in production, it was pestered with a big maintainability issue, since no one really knew what was going on inside the code. This is mainly due to the made-up terminology and overengineered algorithms.

If I were to rewrite that system, I would start from scratch and map out black boxes for each of the processes in the system. This would allow me to think about the system in a simpler way. When implementing each of the black boxes, I would start with designing the API and writing tests for it. Finally, I would schedule a few calls with the client or my team so we could agree on the naming scheme.

# Simplifying daily life

One thing I love about computer science is how many of its lessons can be applied to real life. I've been using the KISS principle in my day-to-day life a lot.

**Productivity management** I used to have 5 apps installed on my phone to keep track of my productivity. This was hard to maintain due to the sheer complexity of the system. I have now swapped everything for one app, which is a very minimalistic to-do list. And it works great because it is easy to keep up to date - it's simple.

**Habits** Adopting good habits is hard, and it's even harder if you make it complex. While it might be good to do a long workout routine, doing a simpler and shorter one is much more motivating and I actually keep it up for a long time instead of giving up after a few days. Complexity might be better if you keep it up, but it's really hard to do that. Simplicity allows for longevity and small, but stable steps towards your goals.

**Communication** When thinking with the simplicity-first mindset, you can communicate much better. I like to explain things by starting with explaining why something even exists and a bird-eye view of the topic. The simplest explanations often stick the best.

**Stress management** Having a simpler, clear-cut life is much less stressful than having to keep up with complex routines and processes! I often optimize processes by making them simpler and thus making my life easier and more productive.

# Conclusion

In the spirit of the contents of this blog post, I'll keep the conclusion simple - simplicity is my primary driver when I write code, as well as in daily life. It's often a deciding factor for resolving dilemmas and makes my life more lightweight.
