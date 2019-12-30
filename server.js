const jsonServer = require('json-server');
const generator = require('./generator');
const faker = require('faker');

// generate fake data 
const data = generator();

// setup json server
const server = jsonServer.create();
const router = jsonServer.router(data);
const middleware = jsonServer.defaults({
  static: './images'
});

// set default middlewares
server.use(middleware);

// add custom route for metrics
const prevMetrics = {};
const maxRate = 200;
const maxUpperPressure = 165;
const maxLowerPressure = 110;
server.get('/metrics/:id', (req, res) => {

  // check if patient exists in db
  const p = data.patients.find(p => p.id === req.params.id);
  if (!p) {
    return res.sendStatus(404);
  }

  // get previous cached metrics for patient
  const prev = prevMetrics[p.id];

  // generate new metrics if no previous found
  if (!prev) {
    prevMetrics[p.id] = {
      heartrate: faker.random.number({ min: 30, max: maxRate - 30 }),
      upperPressure: faker.random.number({ min: 100, max: maxUpperPressure - 30 }),
      lowerPressure: faker.random.number({ min: 60, max: maxLowerPressure - 30 })
    }
  } else {
    prevMetrics[p.id] = {
      heartrate: faker.random.number({ min: Math.max(prev.heartrate - 5, 30), max: Math.min(prev.heartrate + 5, maxRate) }),
      upperPressure: faker.random.number({ min: Math.max(prev.upperPressure - 5, 100), max: Math.min(prev.upperPressure + 5, maxUpperPressure) }),
      lowerPressure: faker.random.number({ min: Math.max(prev.lowerPressure - 5, 60), max: Math.min(prev.lowerPressure + 5, maxLowerPressure) })
    }
  }

  // update fetched time
  prevMetrics[p.id] = { ...prevMetrics[p.id], fetchedOn: new Date().getTime() }

  res.status(200).json(prevMetrics[p.id])

});

// add custom routes
server.use(jsonServer.rewriter(require('./routes.json')))
server.use(router);


server.listen(3000, () => console.log('JSON Server is running on port 3000'))
