---
title: "MongoDB: aggregation framework"
excerpt: "This blog posts includes some notes I took while studying the aggregation framework at the MongoDB university."
categories:
  - "MongoDB"
date: "2020-11-01"
slug: mongodb-aggregation-framework-notes
cover_image:
  src: "../../assets/covers/data-cover.jpg"
  alt: "Data"
  credit_text: "Mika Baumeister on Unsplash"
  credit_link: "https://unsplash.com/@mbaumi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
---

The [aggregation framework](https://docs.mongodb.com/manual/aggregation/) of MongoDB allows us to process the data using various filters, data shaping operations, group operations and more. We can imagine it as a conveyor belt that takes the data from one stop to the next, and doing some operations on the data until it spits out the result.

I wrote a few notes for reference while taking the course at the MongoDB university. I also linked up everything with the documentation page.

## Operators

- [**\$match**](https://docs.mongodb.com/manual/reference/operator/aggregation/match/): equivalent to filter in javascript. Only allows documents that meet the criteria to pass.
- [**\$project**](https://docs.mongodb.com/manual/reference/operator/aggregation/project/): equivalent to map in javascript. You can derive new attributes, exclude or include certain attributes and in general reshape the data.
- [**\$addFields**](https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/): similar to **\$project**, but it allows us to add new fields and keep the old ones.
- [**\$limit**](https://docs.mongodb.com/manual/reference/operator/aggregation/limit/): allows us to limit the amount of results to a certain number.
- [**\$skip**](https://docs.mongodb.com/manual/reference/operator/aggregation/skip/): allows us to skip documents in results. Usually used after sort.
- [**\$count**](https://docs.mongodb.com/manual/reference/operator/aggregation/count/): allows us to count the amount of results and store that in a variable.
- [**\$sort**](https://docs.mongodb.com/manual/reference/operator/aggregation/sort/): allows us to sort the data

- [**\$group**](https://docs.mongodb.com/manual/reference/operator/aggregation/group/): allows us to group the results based on some variable.

```js
db.sales.aggregate([
  {
    $group: {
      _id: null,
      count: { $sum: 1 },
    },
  },
]);
```

- [**\$sortByCount**](https://docs.mongodb.com/manual/reference/operator/aggregation/sortByCount/): equivalent to grouping, counting and then sorting that count.
- [**\$sample**](https://docs.mongodb.com/manual/reference/operator/aggregation/sample/): randomly select a certain amount of documents.
- [**\$unwind**](https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/): takes as argument an array and for each array element, it creates a new document with all the same fields, except the array field, which is now one of the elements in the array (array destructuring).
- [**\$lookup**](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/): left outer join.

```js
{
   $lookup:
     {
       from: "<collection to join>",
       localField: "<field from the input documents>",
       foreignField: "<field from the documents of the "from" collection>",
       as: "<output array field>"
     }
}
```

- [**\$graphLookup**](https://docs.mongodb.com/manual/reference/operator/aggregation/graphLookup/): recursive search on a collection.
- [**\$geoNear**](https://docs.mongodb.com/manual/reference/operator/aggregation/geoNear/): allows us to do queries on GeoJson data, but it can only be the first stage of the pipeline.
- [**\$facet**](https://docs.mongodb.com/manual/reference/operator/aggregation/facet/): allows us to introduce sub-pipelines in our pipeline and storing of results of these sub-pipelines in the final result. We can apply buckets to store data in categories, or just perform simple counts. Useful for creating filters with numbers on frontend.
- [**\$out**](https://docs.mongodb.com/manual/reference/operator/aggregation/out/): allows write result of the pipeline to a collection.
- [**\$merge**](https://docs.mongodb.com/manual/reference/operator/aggregation/merge/): merge result of the pipeline with a collection.
- [**\$redact**](https://docs.mongodb.com/manual/reference/operator/aggregation/redact/): apply access policy by restricting access to attributes in the document.
  <p></p>

## Views

Views are a "collection", which was created out of the pipeline. We can write a pipeline, create a view out of it (and a collection that pipeline operates on) and then simply query the view as if it was the collection. Behind the scenes the pipeline is called every time. Views are read only.

## Optimizations

By default, each stage of pipeline is limited to 100MB of RAM. We can use a property **allowDiskUse: true** to allow the pipeline to use the disk, however, this will cause the pipeline to be slower. In order to avoid a lot of RAM use, we might instead use **\$project** early in the pipeline to get rid of unnecessary attributes.

Certain stages can take advantages of indices and certain cannot. We can take advantage of the indices along the pipeline as long as all stages support indices, but as soon as we reach one stage, that doesn't support them, we cannot use them anymore. We can utilize indices by placing **\$match**, **\$sort** and **\$limit** early in the pipeline. **\$project** does not support indices.

We can avoid useless **\$project** stages by using inline **\$group**. Each stage takes time so optimizing the amount of stages can improve performance.

## Some more cool operations

- [**\$expr**](https://docs.mongodb.com/manual/reference/operator/query/expr/): reference the document variables in the condition expression, use conditional expressions and aggregation expressions.

When using multiple replicas, we can specify write concerns to tell the server, to how many replicas the data has to be written before returning successful response.

## Resources

- Mongo university: [https://university.mongodb.com/](https://university.mongodb.com/)
- Aggregation framework: [https://docs.mongodb.com/manual/aggregation/](https://docs.mongodb.com/manual/aggregation/)
