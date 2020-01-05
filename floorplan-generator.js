const faker = require('faker');
const gen = require('./generator');

module.exports = function (data = []) {
  // create custom department
  const dep = {
    name: "cardiology",
    colorCode: "hsl(28,80%,52%)",
    numberOfRooms: 10,
    hasFloorPlan: true
  };

  // create 10 rooms for this department
  const rooms = [];
  for (let i = 0; i < 10; i++) {
    rooms.push({
      id: faker.random.uuid(),
      number: 101 + i,
      department: dep.name,
      request: false,
      facilities: gen.facilities(faker.random.number({ min: 0, max: 4 }))
    })
  }

  // add 7 patients to this department
  const hospitalizations = [];
  for (let i = 0; i < 7; i++) {

    // find random patient
    let freePatients = data.patients.filter(p => !p.hospitalized);
    let patient = freePatients[faker.random.number(freePatients.length - 1)];
    patient.hospitalized = true;

    // create hospitalization record
    hospitalizations.push({
      id: faker.random.uuid(),
      department: dep.name,
      hospitalizedOn: faker.date.recent(90).getTime(),
      patientId: patient.id,
      roomId: rooms[i].id,
      doctorId: data.doctors[faker.random.number(data.doctors.length - 1)].id,
      reason: gen.reasons[faker.random.number(gen.reasons.length - 1)]
    });

  }

  // update room so we have a correct floorplan
  const leftOffset = 27;
  const wallWidth = 15.5;
  const cardWidth = 231;
  for (let i = 0; i < 10; i++) {
    const room = rooms[i];

    // set coords
    room.x = leftOffset + ((i % 5) * (cardWidth + wallWidth));
    room.y = i < 5 ? 28 : 447.5;

  }

  // update all changes to data object
  data.departments.push(dep);
  data.rooms.push(...rooms);
  data.hospitalizations.push(...hospitalizations);

}