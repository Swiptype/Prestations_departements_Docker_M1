import { MongoClient } from 'mongodb';

// Connection URI
// version container
const uri = 'mongodb://root:example@mongodb:27017'
// version runtime
//const uri = 'mongodb://root:example@localhost:27017';

// Database Name
const dbName = 'bda';

// Collection Name
const collectionName = 'sales';

// Create a new MongoClient
const client = new MongoClient(uri);

await client.connect();
console.log('Connected successfully to the server');
const db = client.db(dbName);
const collection = db.collection(collectionName);

const aggregatePrestation = [
  {
    $group: {
      _id: {
        prestation_code: '$prestation.code',
        prestation_description: '$prestation.description'
      },
      sum: {
        $sum: '$price'
      },
      avg: {
        $avg: '$price'
      },
      count: {
        $sum: 1
      }
    }
  },
  {
    $project: {
      id: '$_id.prestation_code',
      description: '$_id.prestation_description',
      sum: 1,
      avg: 1,
      count: 1,
      _id: 0
    }
  }
];

const aggregateDepartments = [
  {
    $group: {
      _id: {
        prestation_department: '$adresse.department.id'
      },
      sum: {
        $sum: '$price'
      },
      avg: {
        $avg: '$price'
      },
      count: {
        $sum: 1
      }
    }
  },
  {
    $project: {
      department: '$_id.prestation_department',
      sum: 1,
      avg: 1,
      count: 1,
      _id: 0
    }
  }
];

// Quelques données d'exemple
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin'
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster'
  }
];

// On définit une fonction qui effectue l'aggrégation voulue
async function aggregate(aggregation) {
  const result = await collection.aggregate(aggregation).toArray();
  return result;
}

async function aggregateWithValue(aggregation, key, value) {
  console.log('Aggregation key:', key);
  console.log('Aggregation value:', value);
  
  let newAggregation = [{ $match: { [key]: value } }, ...aggregation];
  console.log('Constructed Aggregation:', JSON.stringify(newAggregation, null, 2));
  
  const result = await collection.aggregate(newAggregation).toArray();
  return result;
}

// Un résolveur simple pour la requête 'books' de type Query
// qui renvoie la variable 'books'
const resolvers = {
  Query: {
    books: () => books,
    prestations(root, args, context) {
      return aggregate(aggregatePrestation);
    },
    departments(root, args, context) {
      return aggregate(aggregateDepartments);
    },
    prestationsByDpt(root, args) {
     const departmentId = args.departement; // Assurez-vous que l'argument GraphQL est correct
     const pipeline = [
         { $match: { "adresse.department.id": departmentId } },
         ...aggregatePrestation
     ];
     console.log('Pipeline executed for prestationsByDpt:', JSON.stringify(pipeline, null, 2));
     return aggregate(pipeline);
}


  }
};

// On exporte la définition de 'resolvers'
export default resolvers;

