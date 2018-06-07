var express = require('express');
var cors = require('cors');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Item {
    id: ID,
    value: Boolean
  }
  type FlatItem {
    value: Boolean
  }
  type FlatList {
    id: ID,
    list: [FlatItem]
  }
  type Query {
    list: [Item],
    flatList: FlatList
  }
  
  input ItemInput {
    id: ID,
    value: Boolean
  }
  input FlatItemInput {
    value: Boolean
  }
  input FlatListInput {
    id: ID
    list: [FlatItemInput]
  }
  type Mutation {
    updateItem(id: ID, value: Boolean): Item
    updateFlatList(flatList: FlatListInput): FlatList
  }
`);

class Item {
  constructor(id, { value }) {
    this.id = id;
    this.value = value;
  }
}
let list = [
  new Item('a', { value: true }),
  new Item('b', { value: false }),
  new Item('c', { value: false }),
  new Item('d', { value: false }),
]
class FlatItem {
  constructor({ value }) {
    this.value = value;
  }
}
class FlatList {
  constructor(id, { list }) {
    this.id = id;
    this.list = list;
  }
}
let flatList = new FlatList('a',
  {
    list: [
      new FlatItem({ value: true }),
      new FlatItem({ value: true }),
      new FlatItem({ value: false }),
      new FlatItem({ value: false }),
    ]
  }
);

// The root provides a resolver function for each API endpoint
var root = {
  list: () => {
    console.log('list query');
    return list;
  },
  flatList: () => {
    console.log('flatList query');
    return flatList;
    // return list;
  },
  updateItem: ({ id, value }) => {
    console.log('updateItem: ', id, value);
    let updatedItem;
    if(id === 'c') {
      throw new Error(`Can't update C`)
    }
    list = list.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, value };
        console.log(`updating: ${id}`, updatedItem);
        return updatedItem;
      } else {
        return item;
      }
    });
    console.log(`updated item: `, updatedItem);
    return updatedItem;
  },
  updateFlatList: ( {flatList: updatedList }) => {
    console.log('updateFlatList: ', updatedList);
    flatList = updatedList;
    console.log(`updated flatList: `, flatList);
    return flatList;
  },
};

var app = express();
app.use(cors())
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');

// Examples:
// query {
//   list {
//     id
//     value
//   }
// }
// # mutation{
// #   updateItem(
// #     id: "a",
// #     value: true
// #   ) {
// #     id,
// #     value
// #   }
// # }
// # type Item {
// #   id: ID,
// #   value: Boolean
// # }
// # mutation {
// #   updateList(list: [
// #     {id: "a", value: true},
// #     {id: "b", value: false},
// #     {id: "c", value: true},
// #     {id: "d", value: false}
// #   ]) {
// #     id
// #     value
// #   }
// # }
