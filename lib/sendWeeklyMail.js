const nodemailer = require('nodemailer');
const BookedCars = require('../Model/bookedCars');
const logger = require('../config/winston');

module.exports = async () => {
  try {
    let mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'antonyjudeshaman.24cs@licet.ac.in',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let totalAmount = 0;
    let carRows = '';
    const soldCars = await BookedCars.find();

    if (soldCars.length === 0 || !soldCars) {
      logger.info('No cars sold this week.');
      carRows = `
      <tr style="border: 1px solid white">
        <td colspan = "2" style="text-align: center;font-weight: bold; border: 1px solid white" >
          <h3>No cars sold this week.</h3>
        </td>
      </tr >
      `;
    } else {
      soldCars.forEach((car) => {
        totalAmount += car.carPrice;
        carRows += `
        <tr style="border: 1px solid white">
          <td style="font-weight: bold; padding: 15px; border: 1px solid white">
            ${car.carName}
          </td>
          <td style="font-weight: bold; padding: 15px; text-align: start; border: 1px solid white">
            ${car.carPrice}
          </td>
        </tr>`;
      });
    }

    logger.info('Preparing to send weekly report.');

    let mailDetails = {
      from: 'AJS Car Showroom ',
      to: 'antonyjudeshaman@gmail.com',
      subject: 'AJS Cars Weekly Report',
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body
            style="
              font-family: Arial, sans-serif;
              background-color: #fff;
              color: #ffffff;
              margin: 0;
              padding: 0;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 20px auto;
                background-color: #1a1a1a;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
              "
            >
              <div
                style="
                  text-align: center;
                  padding: 10px 0;
                  background-color: #fff;
                  color: #000;
                  border-radius: 8px 8px;
                "
              >
                <h1 style="margin: 0">AJS Car Showroom - Weekly Report</h1>
              </div>
              <div style="margin: 20px 0">
                <h2 style="color: #fff">Total Cars Sold: ${soldCars.length}</h2>
                <h3 style="color: #fff">Total Revenue: ${totalAmount}</h3>
                <div style="border-radius: 8px; overflow: hidden; border: 1px solid white">
                  <table
                    style="width: 100%; text-align: left; border-collapse: separate; border-spacing: 0"
                  >
                    <thead>
                      <tr>
                        <th
                          style="
                            padding: 10px;
                            border: 1px solid black;
                            text-align: left;
                            background-color: #fff;
                            color: #000;
                          font-size: large;
                          "
                        >Car Name
                        </th>
                        <th
                          style="
                            padding: 10px;
                            border: 1px solid black;
                            text-align: left;
                            background-color: #fff;
                            color: #000;
                          font-size: large;
                          "
                        >
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${carRows}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </body>
        </html>
  
      `,
    };

    const res = await mailTransporter.sendMail(mailDetails);

    logger.info(
      `Weekly Report Email sent successfully: ${new Date().toLocaleString()} - Message ID: ${
        res.messageId
      }`,
    );

    for (const car of soldCars) {
      await BookedCars.findByIdAndDelete(car._id);
    }

    logger.info('Deleted all sold cars to refresh the weekly report');
  } catch (error) {
    logger.error('Error while sending weekly report:', error);
  }
};
