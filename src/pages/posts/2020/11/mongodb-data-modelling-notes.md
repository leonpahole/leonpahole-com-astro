---
layout: "../../../../layouts/BlogPostLayout.astro"
title: "MongoDB: data modelling principles"
excerpt: "Having completed the MongoDB University data modelling course, I decided to write down some important principles of data modelling in MongoDB that I learned."
categories:
  - "MongoDB"
date: "2020-11-01"
slug: mongodb-data-modelling-notes
cover_image:
  src: "/src/assets/blog/covers/data-cover.jpg"
  alt: "Data"
  credit_text: "Mika Baumeister on Unsplash"
  credit_link: "https://unsplash.com/@mbaumi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

If you had asked me one week ago what the advantage of using the MongoDB database was, I would have told you: _because it is flexible and schemaless_. But is this really the answer? What does _flexible_ mean? What advantage would it bring to our product?

Recently I started working on a new application and decided to use MongoDB as the database. I designed my data model identically to the one I would design if working with a relational database, such as PostgreSQL. However, after watching some data modelling videos and taking a course at the [MongoDB university](https://university.mongodb.com/), I realized that I have been missing on a lot of things that MongoDB really has to offer.

In order to design a good data model in MongoDB, I had to make a _context switch_ from the relational world to the world of NoSQL.

## What flexibility really means

Schemalessness and flexibility of MongoDB offer two advantages:

- "No rules" data model: design your data model any way you see fit for the speed of your application.
- Migrations are less painful.

With MongoDB, your data model can be designed in any way you see fit for your application.

In the relational world, data modelling is done at the beginning of the development and rarely changes throughout the development. Additionally, when designing a data model for a relational database, we mainly just look at the data we have - we come up with a list of entities (tables), relationships between them and then normalize the model to avoid duplication.

In MongoDB, data modelling is done with _application in mind_. We go through a series of phases to determine our data model, but the benefit is, that we can do this multiple times as our application grows and we get a better understanding of where the bottlenecks are and which operations are the most critical. We are also not bounded by any sort of normalization. Yes, we can even duplicate data, if this allows us to be faster. There is always a tradeoff between _simplicity and performance_ - simplicity might allows us to quickly launch our project, while performance will make things more complex for the sake of optimization. The good thing about MongoDB is that we can always start out simple and then migrate our data model painlessly to a more performant version down the road.

## Hardware limitations

In MongoDB data is stored as BSON, which is limited to 16MB per document. Additionally, WiredTiger, the storage engine behind MongoDB, needs to load the entire document into RAM when performing read operations. This means that even if we would need to fetch just one attribute of the entity, the entire document with all embedded data would be loaded. If a large entity is frequently queried, this will cause MongoDB to write data to swap, to make room for new entities. Entities that represent frequently accessed objects are called _workload_ and we would like to minimize the size of the workload as much as possible.

## Methodology of data modelling

We repeat these steps many time throughout the development of the application. Throughout the steps we make some assumptions, which can turn out to be false. If this happens, it might be time to perform these steps again, design a new data model and apply migrations.

### 1. Describing the Workload

We consider any resource we have to get an idea about how the application will look like, such as looking at prototypes, designs, talking to a domain expert and watching logs. We thus get an idea of the workload that the application will have. We ask ourselves questions, such as:

- Which operations will be present and what will be their frequency? (eg. user login: once per minute, fetching all posts: twice per second, etc.)
- Which entities are present in our database and what is the central entity (eg. the most important one - in social media app this might be a list of posts)
  <p></p>

### 2. Relationships

After coming up with a list of entities, we determine the relationships between them. For example, a user has many posts, each post has many comments, and each comment has one author. Seems reasonable enough and in the relational world we would know exactly how to model this. But in MongoDB we have to ask ourselves: _embedding or referencing_?

Referencing is similar to foreign keys in relational world. For example, we can create a post entity and put the _author_id_ in it, which references the user entity.

Embedding allows us to avoid joins by putting a sub-document in the entity. For example, we could embed the post array into the user and call it _posts_. However, we have to be mindful of:

- 16 MB limit of BSON
- Size of the workload (WiredTiger: all embedded elements will be loaded into RAM)

<p></p>

#### 1:N relationship

We can tackle 1:N relationship by:

a) Embedding on the "one" side of the relationship (array of objects, eg. user has list of posts) - we do this if the amount of objects in the array will be only a few and if it makes sense to present this data together (ie. it is usually presented together on front-end).

b) Embedding on the "many" side (we embed author on the side of the post) - this introduces duplication but might be preferable if the "many" side is queried more often than the "one" side.

c) Referencing on the "one" side (array of references, eg. user has list of references to posts) - this allows the documents to be much smaller and is useful if entities needn't be presented together. It does however require to manually perform cascade deletes.

d) Referencing on the "many" side (we reference author id on the side of the post) - useful if we have many documents and it allows us to cascade delete easily.

#### N:M relationship

We can tackle N:M relationship by:

a) Embed on the "main" side - whichever side of the relationship is more queried ("main"), receives the embedded document (eg. cart and items). Duplicate entities on "non-main" side are still kept, which might be neccessary (eg. actor exists before they act in any moves).

b) Reference on the "main" side

c) Reference on the "secondary" side

#### 1:1 relationship

We can simply embed any 1:1 data, however, for the sake of keeping the workload small, we might also introduce a separate entity to store less queried data in it and use a reference to the original entity.

#### 1:Zillions relationship

In the world of big data 1:Zillions relationships are dominant, each sensor sending a lot of data at the same time. The only solution in this case is referencing on the "many" side.

### 3. Data modelling patterns

Data modelling patterns allow us to optimize our data model. This is where the "freedom" of NoSQL comes into play - we can do anything we want to, to potentially improve the performance. Data modelling is all about **assumptions** and **tradeoffs**. We _assume_ that certain queries will be execute much more often than other ones. We should try to optimize these queries and potentially even slow down other rare queries. That is the _tradeoff_. Remember, we want to:

- For frequent queries, avoid joins as much as possible
- Keep frequent entities small to prevent offloading the workload to disk
- Optimize frequent queries

Some concerns of using patterns:

- **Duplication** allows us to potentially query data faster by avoiding joins, however, it introduces complexity as multiple documents must be synced. Duplication is sometimes the solution (eg. address of order vs user's address), sometimes it never changes (eg. actors in the movie) and sometimes must be handled by the application.

- **Staleness** occurs when some data is precomputed and certain data, that this computation depends on, changes. For example, the availability of the hotel or number of views on certain video. We have to define the threshold for how long the data can be stale (eg. views on video are not so important, but the availability of the hotel just might be). We might solve this using change streams and batch jobs, which update the data periodically in the background.

- **Referential integrity** eg. deleting, but not deleting the reference.

Let's look at some data modelling patterns (all of them are explained in great detail [here](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)):

#### Attribute pattern

We have documents that share similar characteristics, but some of the fields are only present in a small amount of documents (eg. products on the e-commerce site). We want to be able to sort or query on those rare fields. We do this by taking advantage of indices - we create an array of objects that have 2 attributes: key and value.

#### Extended reference pattern

We want to avoid joins that are repetitive. For example, if we have a social network site and the center of attention (workload) are posts, we don't want to be joining posts with users each time we display the post with it's author. We might instead embed some author data in the post itself, thus duplicating data to avoid joins. But this just might work, if we for example embed user's name and profile picture - how often do users change their name and profile picture compared to how many times they browse posts?

When using extended reference pattern, we therefore must ask ourselves:

- how often does data that we are duplicating change?
- is embedding going to allow us to display the entity on frontend without the join? (eg. is user's name and profile picture enough data to display the post?) - **looking at front-end and designs plays a big role in how we decide to store data on backend**

We can update the duplication while we perform the update query or later in a batch.

#### Subset pattern

We want to reduce the working set size. One thing we could do is store rarely accessed attributes in a separate entity and link to it from the main entity. In case of social network we could also store just the most recent user's posts in the user entity, and store the rest in another entity. This again highly depends on how data is shown on frontend.

#### Computed pattern

If we query more often than we write, we might want to compute some attributes ahead of time to avoid computing the same result over and over. Let's say we have a social network where users can give posts a grade between 1 and 10 and total post score is a sum of all grades. Grade should be displayed every time we see a post. We could pre-compute the score and store it in the post instead of computing it on the fly each time we fetch the post. This works if we fetch posts more often than we grade them (which we normally do). When updating the grade, we can do it each time the scoring happens or we can do in it a batch job if **staleness** is acceptable.

#### Bucket pattern

If the documents get too large because of a lot of array-like data (eg. sensor readings), we might split the data by a certain value, eg. a day. We therefore create buckets of data. In the sensor reading example, we might create one document per 100 reading or one document per day, in which we store all data. Smart bucketing strategy might allow us to paginate data better or delete stale data easily.

#### Schema versioning pattern

Remember how I said that migrations are easier with MongoDB. Schema versioning pattern is the reason why. In this pattern we add _schema_version_ attribute in the document, which reflects the schema that the document is conforming too. Let's say that we have old schema (_v1_) and new, optimized schema (_v2_). We assign _schema_version_ to _v1_ to all old documents. Then we implement handling of both _v1_ and _v2_ on our frontend (maybe we insert some sample _v2_ documents). Finally, we start adding new documents as _v2_ into our database. Later we can also migrate all _v1_ documents to _v2_ and delete code that supports _v1_.

What enables this pattern is _schemalessness_ and _flexibility_ of MongoDB.

#### Polymorphic pattern

Because MongoDB is schemaless and flexible, not all documents in a collection need to share the same schema. If we have documents that are similar in nature, yet have some different attributes, we can store them in same collection, and add _type_ attribute to distinguish between them in our application. This lets us implement single view solution - different data being used for same purpose or being displayed on the same screen.

#### Approximation pattern

We approximate certain values instead of computing them each time - eg. page views.

#### Outlier pattern

Some documents in our dataset might stand out from the crowd (eg. people with a lot of followers on social media) - we don't want to adjust the whole system and potentially slow it down just for the sake of few outliers. Therefore we might simply adjust the outliers. For example, we might add the attribute _has_extra_followers_ to our social media users and then apply the bucket pattern.

## Example: social networking site

Here is the use-case - we have a social networking site where we have users, who can create two types of posts: a regular post with text and _special post_, which contains location and extra descriptors. Users can comment on these posts.

How would we optimize list of posts of the user? List of posts would look like so:

- posts are displayed 10 per load (pagination)
- post shows it's data, as well as user's name, profile picture and link to their profile
- special and regular posts are mixed and sorted by date
- each post has 2 latest comments visible, we can load more by pressing a button

In the relational world, I would probably store this as 3 separate entities, or maybe even 4 of them (if we separate posts and special posts). This would cause each of these posts to cause 2 joins:

- joining post and user
- joining comments and post

Here are the optimizations we can apply using MongoDB:

- apply _extended reference pattern_ and embed user's name, profile picture and \_id in each post. Since posts are fetched way more often than users change their name, profile picture and \_id (which never changes), this allows us to get rid of user - post join at almost no cost. Of course, when user updates their name, we have to update all posts (immediately or in a background job).
- apply _subset pattern_ and embed last 10 comments of the post in the post itself, while storing all other comments in a separate document. Since comments are really never seen by themselves (on a separate page), we can just embed them. This will allow us to load the first 10 comments of the post without joining the data at all.
- apply _bucket pattern_ on comments - store 100 comments of the post in a separate document, and then next 100 comments in another separate document. This allows us to avoid 16MB limit on the document size and it can help improve pagination (eg. if we need comments 210 - 220, we know in which document we need to look - of course we should store _post_id_, _start_comment_number_ and _end_comment_number_ in the document).

Interesting note: bucket pattern can be applied easily using the upsert operation [reference](https://www.mongodb.com/blog/post/paging-with-the-bucket-pattern--part-2):

```js
db.history.updateOne(
  { _id: "some_id", count: { $lt: 1000 } }, // make sure that count is less than 1000, if it is more, this query will fail and produce a new entity. Thus the bucket never exceeds 1000 documents.
  {
    $push: {
      history: {
        type: "buy",
        ticker: "MDB",
        qty: 25,
        date: ISODate("2018-11-02T11:43:10"),
      },
    },
    $inc: { count: 1 },
    $setOnInsert: { _id: "7000000_1541184190" },
  },
  { upsert: true },
);
```

## MongoDB vs PostgreSQL

MongoDB is usually faster when it comes to writes, due to the fact that no data constraints need to be checked. If our data model is well designed reads can be faster, due to lack of joins. Sorting is faster in PostgreSQL as are joining and selecting without key. Aggregations are faster with MongoDB and counting may also be faster if we use the computed pattern.

## Choosing the right database

There is no set recipe, but we can look at some options:

1. Integration - if we have an existing piece of technology that we want to use, it may be a good idea to choose a database that can directly integrate with that technology.
2. Scaling - research which systems support distributed databases.
3. Support - how much (paid) support does the company behind the database provide?
4. [CAP principle](https://blog.nahurst.com/visual-guide-to-nosql-systems) - consistency (read/write from any node and get the same data), availability (ability to access the cluster even if one node goes down) and partition tolerance (cluster functions even if a communication break between two nodes happens).
5. Simplicity! Don't complicate it if you don't need to.
   <p></p>

## Conclusion

Hopefully this gives you an idea of how MongoDB can speed up your application. Data modelling is a very complex process that requires the developer to know a lot about the application (especially it's frontend), make assumptions, incrementally optimize the schema and not be fearful of making tradeoffs (eg. duplication of data to make queries faster).

## Resources

- Mongo university: [https://university.mongodb.com/](https://university.mongodb.com/)
- Great talk by Joe Karlsson regarding data modelling: [https://www.joekarlsson.com/2020/04/mongodb-schema-design-best-practices/](https://www.joekarlsson.com/2020/04/mongodb-schema-design-best-practices/)
- Data modelling patterns: [https://www.mongodb.com/blog/post/building-with-patterns-a-summary](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)
- Great talk about advanced schema design patterns [https://www.youtube.com/watch?v=bxw1AkH2aM4](https://www.youtube.com/watch?v=bxw1AkH2aM4)
- Comparison of PostgreSQL and MongoDB [https://www.youtube.com/watch?v=eM7hzKwvTq8](https://www.youtube.com/watch?v=eM7hzKwvTq8)
- How to Choose the Right Database? [https://www.youtube.com/watch?v=v5e_PasMdXc](https://www.youtube.com/watch?v=v5e_PasMdXc)
- Visual Guide to NoSQL Systems [https://blog.nahurst.com/visual-guide-to-nosql-systems](https://blog.nahurst.com/visual-guide-to-nosql-systems)
