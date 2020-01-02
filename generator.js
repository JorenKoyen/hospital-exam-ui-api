const faker = require('faker');
faker.seed(2);

function randomFacilitiesHelper (amount) {
  const defFac = ['toilet', 'tv', 'shower', 'childsupport'];
  if (amount === defFac.length) return defFac;

  const rndFac = [];
  // loop until random fac collected
  do {
    const fac = defFac[faker.random.number(defFac.length - 1)];
    if (rndFac.includes(fac)) continue;
    else rndFac.push(fac)
  } while (rndFac.length === amount)

  return rndFac;
}

function genUniqueNumberInRange (state = [], min, max) {
  let number;
  do {
    number = faker.random.number({ min, max });
  } while (state.includes(number));

  return number;
}

module.exports = () => {

  const noPatients = 100;
  const noActions = 1000;
  const noDoctors = 25;
  const noRooms = 100;
  const deps = require('./departments.json');
  const hospitalizationReasons = [
    'Cardiac arrhythmias',
    'Congestive heart failure',
    'Diabetes',
    'Infection',
    'Medication problems',
    'Pneumonia',
    'Stroke'
  ]
  const data = {};

  // create patients
  data.patients = [];
  for (let i = 0; i < noPatients; i++) {
    data.patients.push({
      id: faker.random.uuid(),
      ssn: faker.phone.phoneNumber('##.##.##-###.##'),
      name: faker.name.findName(),
      avatar: faker.internet.avatar(),
      vegetarian: faker.random.boolean(),
      contact: {
        zip: faker.address.zipCode(),
        city: faker.address.city(),
        street: faker.address.streetName(),
        address: faker.address.streetAddress(),
        country: faker.address.country(),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber()
      }
    });
  }

  // create doctors
  data.doctors = [];
  for (let i = 0; i < noDoctors; i++) {
    data.doctors.push({
      id: faker.random.uuid(),
      name: faker.name.findName(),
      avatar: faker.internet.avatar(),
      hiredOn: faker.date.past(45).getTime()
    });
  }

  // create rooms
  data.rooms = [];
  const numberState = [];
  for (let i = 0; i < noRooms; i++) {
    const dep = deps[faker.random.number(deps.length - 1)];
    const minNumber = dep.level * 100;
    const number = genUniqueNumberInRange(numberState, minNumber, minNumber + 99);
    data.rooms.push({
      id: faker.random.uuid(),
      number,
      department: dep.name,
      request: false,
      facilities: randomFacilitiesHelper(faker.random.number({ min: 0, max: 4 }))
    });

    numberState.push(number);
  }

  // create departments
  data.departments = [];
  deps.forEach(dep => {
    data.departments.push({
      name: dep.name,
      numberOfRooms: data.rooms.filter(r => r.department === dep.name).length,
      colorCode: dep.color
    });
  });

  // create hospitalizations
  data.hospitalizations = [];
  for (let i = 0; i < data.rooms.length; i++) {
    const room = data.rooms[i];

    // should room be filled with patient?
    if (Math.random() > 0.75) continue;

    // find random patient
    let freePatients = data.patients.filter(p => !p.hospitalized);
    let patient = freePatients[faker.random.number(freePatients.length - 1)];
    patient.hospitalized = true;

    // create hospitalization record
    data.hospitalizations.push({
      id: faker.random.uuid(),
      department: room.department,
      hospitalizedOn: faker.date.recent(90).getTime(),
      patientId: patient.id,
      roomId: room.id,
      doctorId: data.doctors[faker.random.number(data.doctors.length - 1)].id,
      reason: hospitalizationReasons[faker.random.number(hospitalizationReasons.length - 1)]
    });
  }

  // create types
  const types = require('./action_types.json');
  data.types = types.map(t => ({ id: t.name, icon: t.icon }))

  const meds = require('./medications.json');
  const descriptionNeededTypes = ['medication', 'injection', 'iv']

  // create actions
  data.actions = []
  for (let i = 0; i < noActions; i++) {
    const type = types[faker.random.number(types.length - 1)];
    const hops = data.hospitalizations[faker.random.number(data.hospitalizations.length - 1)];
    const med = meds[faker.random.number(meds.length - 1)];

    data.actions.push({
      id: faker.random.uuid(),
      hospitalizationId: hops.id,
      timestamp: faker.date.recent(-1).getTime(),
      completed: false,
      typeId: type.name,
      description: descriptionNeededTypes.includes(type.name) ? `Administer ${faker.random.number({ min: 1, max: 100 })}mg of ${med}` : undefined
    });

  }

  return data;
}