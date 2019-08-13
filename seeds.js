const faker = require('faker');
const Campground = require("./models/campground");
const cities = require('./cities.js');


async function seedCampgrounds() {
  await Campground.deleteMany({});
  for(const i of new Array(600)) {
    const random1000 = Math.floor(Math.random() * 1000);
    const random5 = Math.floor(Math.random() * 6);
    const name = faker.lorem.word();
    const description = faker.lorem.text();
    const campgroundData = {
      name,
      description,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: 'Point',
        coordinates: [cities[random1000].longitude, cities[random1000].latitude],
      },
      author: {
        '_id' : '5bb27cd1f986d278582aa58c',
        'username' : 'ian'
      },
      price: random1000,
      rating: random5,
    }
    let campground = new Campground(campgroundData);
    campground.properties.description = `<strong><a href="/campgrounds/${campground._id}">${name}</a></strong><p>${campground.location}</p><p>${description.substring(0, 20)}...</p>`;
    campground.save();
  }
  console.log('600 new posts created');
}


module.exports = seedCampgrounds;