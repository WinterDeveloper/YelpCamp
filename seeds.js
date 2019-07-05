const faker = require('faker');
const Campground = require("./models/campground");


async function seedCampgrounds() {
  await Campground.deleteMany({});
  // for(var i of new Array(40)) {
  //   const campground = {
  //     name: faker.lorem.word(),
  //     description: faker.lorem.text(),
  //     price: 16,
  //     author: {
  //       _id: "5d1ce77041f7c8082882d5bc",
  //       username: "yumeng"
  //     },
  //     location: "shanghai",
  //   };
  //   await Campground.create(campground);
  // }

  // console.log("40 campgrounds have been created");

}

module.exports = seedCampgrounds;