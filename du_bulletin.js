// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');

// // URL of the course bulletin page (update as needed)
// const url = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';  // Adjust the URL if different

// // Function to scrape the course data
// async function scrapeCourse() {
//   try {
//     // Fetch the HTML page
//     const response = await axios.get(url);

//     // Load HTML into Cheerio
//     const $ = cheerio.load(response.data);

//     // Initialize an array to store course data
//     const courses = [];

//     // Iterate over each course block
//     $('div.courseblock').each((index, element) => {
//       const courseCode = $(element).find('.courseblocktitle strong').text().trim();
      
//       // Extract course code (COMP-XXXX) and course title
//       const courseParts = courseCode.split(' ');
//       const courseNumber = courseParts[0].replace(/\u00A0/g, ' ').trim(); 
//       const courseTitle = courseParts.slice(1).join(' ');
//       courseTitle = courseTitle.replace(/\s?\(.*?\)/, '').trim();

//       const courseDescription = $(element).find('.courseblockdesc').text().trim();

//       // Check if course has prerequisites
//       const prerequisiteText = courseDescription.toLowerCase().includes('prerequisite:') || courseDescription.toLowerCase().includes('prerequisites:');
//       if (prerequisiteText) {
//         return; // Skip courses with prerequisites
//       }

//       // Extract only 3000-level or higher courses
//       // if (courseNumber.includes('COMP') && parseInt(courseNumber.split(' ')[1]) >= 3000) {
//       if (courseNumber.includes('COMP 3')) {
//         const course = {
//           course: courseNumber,
//           title: courseTitle
//         };

//         // Push the extracted course data into the array
//         courses.push(course);
//       }
//     });

//     // Save the extracted courses in a JSON file
//     fs.writeFileSync('results/bulletin.json', JSON.stringify({ courses }, null, 2));
//   } catch (error) {

//   }
// }

// // Run the scrapeCourse function
// scrapeCourse();












const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL of the course bulletin page (update as needed)
const url = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';  // Adjust the URL if different

// Function to scrape the course data
async function scrapeCourse() {
  try {
    // Fetch the HTML page
    const response = await axios.get(url);

    // Load HTML into Cheerio
    const $ = cheerio.load(response.data);

    // Initialize an array to store course data
    const courses = [];

    // Iterate over each course block
    $('div.courseblock').each((index, element) => {
      const courseCode = $(element).find('.courseblocktitle strong').text().trim();
      
      // Extract course code (COMP-XXXX) and course title
      const courseParts = courseCode.split(' ');
      const courseNumber = courseParts[0].replace(/\u00A0/g, ' ').trim(); 
      let courseTitle = courseParts.slice(1).join(' ');  // Use let to allow reassignment
      courseTitle = courseTitle.replace(/\s?\(.*?\)/, '').trim();  // Remove text inside parentheses

      const courseDescription = $(element).find('.courseblockdesc').text().trim();

      // Check if course has prerequisites
      const prerequisiteText = courseDescription.toLowerCase().includes('prerequisite:') || courseDescription.toLowerCase().includes('prerequisites:');
      if (prerequisiteText) {
        return; // Skip courses with prerequisites
      }

      // Extract only 3000-level or higher courses
      if (courseNumber.includes('COMP 3')) {
        const course = {
          course: courseNumber,
          title: courseTitle
        };

        // Push the extracted course data into the array
        courses.push(course);
      }
    });

    // Ensure that the courses array is populated before writing to the file
    if (courses.length > 0) {
      // Save the extracted courses in a JSON file
      fs.writeFileSync('results/bulletin.json', JSON.stringify({ courses }, null, 2));
      console.log('Scraping complete! Saved courses to results/bulletin.json');
    } else {
      console.log('No courses found.');
    }

  } catch (error) {
    console.error('Error scraping courses:', error);  // Log the error for debugging
  }
}

// Run the scrapeCourse function
scrapeCourse();
