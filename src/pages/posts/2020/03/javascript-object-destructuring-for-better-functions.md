---
title: "Javascript object destructuring for readable functions"
excerpt: "In my opinion, a function (or a method) in any programming language should be clearly understandable just by its header - name and parameters. In Javascript, we sometimes create functions that accept objects, which can be more convenient, but this sacrifices readability of the function header. In this blog post I present ES6 object destructuring as a solution to this problem."
categories:
  - JavaScript
date: "2020-03-16"
slug: javascript-object-destructuring-for-better-functions
cover_image:
  src: "../../assets/covers/javascript-destructuring-cover.jpg"
  alt: "JavaScript code"
  credit_text: "James Harrison on Unsplash"
  credit_link: "https://unsplash.com/@jstrippa?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

## Function header

In my opinion, a function in any programming language should be clearly understandable just by its header. What is clearly understandable? Well, imagine that you are writing a software library or functions that your coworkers will use. People, who will use your libraries, although programmers, are in this case treated as _users_. For them, the function is nothing else than a **black box that accepts some parameters and returns the result**.

Let's take a very simple example: a function that calculates body mass index (BMI) of a person. Here it is:

```js
function calculateBMI(weight, height) {
  return weight / (height * height);
}
```

Let's examine the function header:

```js
function calculateBMI(weight, height);
```

Let's say someone wants to use this function. Would they be able to do it just by looking at the header, without consulting the documentation? Well, apart from the missing information about the _units_ of the height and weight parameters, the user could most likely use the function without the documentation.

Here is the possible header of the function that is completely self documenting:

```javascript
function calculateBMI(weightInKg, heightInM);
```

The function's header tells us the corresponding function's **purpose** (to calculate BMI), **what it needs** to perform its purpose and what are the units or **scales** of the inputs.

## Problem - objects as arguments

What if, for example, our function for BMI would accept an _object_ instead of two parameters? For instance:

```javascript
function calculateBMI(person) {
  return person.weight / (person.height * person.height);
}
```

Now, let's examine the header:

```javascript
function calculateBMI(person);
```

This function cannot be properly understood without either **guessing the parameter names**, **reading the function body** or **consulting the documentation**. Unfortunately, the documentation is not always available and we have to resort to reading the function body. In case of our BMI function, this is simple enough. But in a really long function with many complex parameters, searching for all usages of the parameter object might be time consuming and frustrating.

In order to solve this problem, we could **refactor** our function to accept two parameters, like we did in the previous section. While this solves the problem of readability, it introduces new problems.

First of all, it might **break legacy code**. We have to search for all usages of the function and replace the object argument with separate arguments. This might be simple enough for a personal project, but in a large project, such refactoring can lead to bugs. Also, if the function is a part of the public library that many people use, such a refactor will lead to breaking changes, which we would like to avoid. Our goal is to make the function **readable without changing the way how the users call the function**.

Additionally, sometimes it is simply not possible to refactor due to the **limitations of the framework**. Take React.js for instance. In React, a component (which is a building block of a website) may accept some inputs from parent components. These inputs are cumulated into an object called props. For example:

```js
function Person(props) {
  return (
    <h1>
      Hello, {props.name} {props.lastname}, age: {props.age}
    </h1>
  );
}
```

In this case, we simply cannot refactor props into argument list due to the limitation of the framework.

## Object destructuring

Object destructuring is a feature of ES6 Javascript. It is a shorthand for _picking out_ certain attributes from the object and saving them in separate variables. For example:

```javascript
const person = { age: 23, weight: 75, height: 1.73 };
const { weight, height } = person;
// weight = 75, height = 1.73
```

In this case, we declare an object with attributes age, weight and height, and in second line, we _pick out_ weight and height and save them into variables with same names. This code is a shorthand and could be rewritten as such:

```javascript
const person = { age: 23, weight: 75, height: 1.73 };
const weight = person.weight;
const height = person.height;
// weight = 75, height = 1.73
```

There are a lot of fun things we can do with destructuring. For example, we can set default values in case the object does not have the given attribute:

```javascript
const person = { age: 23, weight: 75 };
const { weight = 60, height = 1.7 } = person;
// weight = 75 (default value overriden), height = 1.7 (no value in object, default value used)
```

Note that if the object has no attribute that we are destructuring, and the variable has no default value, the variable will receive the value of _undefined_.

```javascript
const person = { age: 23, weight: 75 };
const { weight, height } = person;
// weight = 75, height = undefined (no value in object, no default value)
```

Of course, the names of variables that we pick out do not neccessarily have to match the attribute names in the object. For instance, here we save weight and height attributes to variables weightInKg and heightInM respectively:

```javascript
const person = { age: 23, weight: 75, height: 1.73 };
const { weight: weightInKg, height: heightInM = 1.7 } = person;
// weightInKg = 75, heightInM = 1.73 (overrides default 1.7)
```

Another cool thing is nested destructuring. If an object itself contains another object, we can destructure inner object as well:

```javascript
const person = {
  name: "Leon",
  age: 23,
  weight: 75,
  height: 1.73,
  pet: { type: "cat", name: "Simba" },
};
const {
  weight,
  height,
  pet: { type: petType, name: petName },
} = person;
// weight = 75, height = 1.73, petType = 'cat', petName = 'Simba'. Note that pet is undefined.
```

Note that I renamed type of pet to _petType_ and name of pet to _petName_. This is to avoid potential confusion with pet name and person name.

What I presented here is only a handful of features of object destructuring. You can read more [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring).

## Solution

How can we use object destructuring to simplify the following function and make it more readable without changing its interface?

```javascript
function calculateBMI(person) {
  return person.weight / (person.height * person.height);
}

// calling the function
const person = { weight: 75, height: 1.73 };
calculateBMI(person);
```

We simply use object destructuring to pick out attributes from the passed object _person_. These are then available to us in the function (note that person does not exist anymore, so we replace _person.attribute_ with just _attribute_).

```javascript
function calculateBMI({ weight, height }) {
  return weight / (height * height);
}

// calling the function
const person = { weight: 75, height: 1.73 };
calculateBMI(person);
```

This way, we still call the function by passing in the object, therefore **keeping the interface of the function the same**, but the _header_ of the function is much more readable thanks to object destructuring. We can make it even more readable by renaming picked out variables to include units. Note that this also does not change the calling code at all, which is our goal.

```javascript
function calculateBMI({ weight: weightInKg, height: heightInM }) {
  return weightInKg / (heightInM * heightInM);
}

// calling the function - still the same
const person = { weight: 75, height: 1.73 };
calculateBMI(person);
```

We can also, just like with normal parameters, add default values for attributes with undefined value:

```javascript
function calculateBMI({ weight: weightInKg = 75, height: heightInM }) {
  return weightInKg / (heightInM * heightInM);
}

// calling the function - weight will be 75
const person = { height: 1.73 };
calculateBMI(person);
```

A good thing about destructuring is the fact that we can add a default anywhere in the argument list, because the order does not matter.

Let's examine function headers:

```javascript
// no destructuring
function calculateBMI(person);

// normal destructuring
function calculateBMI({ weight, height });

// normal destructuring with default values
function calculateBMI({ weight = 75, height });

// destructuring with renamed attributes
function calculateBMI({ weight: weightInKg, height: heightInM });

// destructuring with renamed attributes and default values
function calculateBMI({ weight: weightInKg = 75, height: heightInM });
```

In my opinion, normal destructuring with or without defaults looks the best. Renamed attributes _might_ work well, but the syntax can be a bit awkward to read.

Here is an example with React component:

```js
function Person({ name, lastname, age }) {
  /* ... */
}
```

Reading just the header of this component gives us enough information to know what we need to pass into it without having to read the body of the component.

I also use this technique in Socket programming, where the received data is an object:

```javascript
// without destructuring - what are we receiving as data?
socket.on("personData", function (data) {
  /* ... */
});

// with destructuring - we receive name and age
socket.on("personData", function ({ name, age }) {
  /* ... */
});
```

There is one shortcoming to using object destructuring; the functions are prone to a type error _TypeError: (destructured parameter) is null_, which occurs when we pass _null_ into the function. As far as I know, this can only be prevented on callers side.

## Wrap up

Hopefully object destructuring can help you refactor functions that accept objects into nice, readable functions without having to change the interface of the function itself. I personally always use object destructuring in React and Socket.io programming, but in normal Javascript code, I typically try to use argument list for functions with small amount of parameters and switch to objects (and destructuring) when number of parameters exceeds 5-10.

## References and useful links

All about object destructuring: [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Object_destructuring)
