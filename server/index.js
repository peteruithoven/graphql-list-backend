var express = require('express');
var cors = require('cors');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Option {
    id: ID,
    value: Boolean
  }
  type Query {
    list: [Option]
  }
  input OptionInput {
    id: ID,
    value: Boolean
  }
  type Mutation {
    updateItem(id: ID, value: Boolean): Option
    updateList(list: [OptionInput]): [Option]
  }
`);

// If Message had any complex fields, we'd put them on this object.
class Option {
  constructor(id, { value }) {
    this.id = id;
    this.value = value;
  }
}

let list = [
  new Option('a', { value: false }),
  new Option('b', { value: false }),
  new Option('c', { value: false }),
  new Option('d', { value: false }),
]

// The root provides a resolver function for each API endpoint
var root = {
  list: () => {
    return list;
  },
  updateItem: ({ id, value }) => {
    console.log('updateItem: ', id, value);
    let updatedItem;
    list = list.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, value };
        console.log(`updating: ${id}: ${updatedItem}`);
        return updatedItem;
      } else {
        return item;
      }
    });
    console.log(`updated item: `. updatedItem);
    return updatedItem;
  },
  updateList: ( {list: updatedList }) => {
    console.log('updateList: ', updatedList);
    list = updatedList;
    console.log(`updated list: `, list);
    return list;
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
// # type Option {
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
