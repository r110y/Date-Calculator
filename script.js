const dateInput = document.getElementById("date-input");

const currentDateEl = document.getElementById("current-date");
const readerMinEl = document.getElementById("reader-min");
const reserveUntilEl = document.getElementById("reserve-until");
const oneReservationBeforeEl = document.getElementById(
  "one-reservation-before"
);

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const getBankHolidays = async (region = "england-and-wales") => {
  const res = await fetch("https://www.gov.uk/bank-holidays.json");
  const data = await res.json();
  const holidays = [];
  Object.values(data[region].events).map((holiday, i) => {
    holidays[i] = holiday.date;
  });
  return holidays;
};

addDays = (date, days, weekends = false) => {
  let output = new Date(date);

  if (weekends) {
    let day = output.getDay();
    return output.setDate(
      output.getDate() +
        days +
        (day === 6 ? 2 : +!day) +
        (Math.floor(days - 1 + (day % 6 | 1)) / 5) * 2
    );
  } else {
    return new Date(output.setDate(output.getDate() + days));
  }
};

getDatesBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const datesArray = [];
  let currentDate = start;

  while (currentDate <= end) {
    datesArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return datesArray;
};

const addBankHolidays = async function (date, daysToAdd, weekends = false) {
  try {
    let count = 0;

    const bankHolidays = await getBankHolidays();

    const startDate = new Date(date);
    const endDate = new Date(addDays(date, daysToAdd, weekends));
    const dateRange = getDatesBetween(startDate, endDate);

    dateRange.forEach((date) => {
      if (bankHolidays.includes(date.toISOString().split("T")[0])) {
        count++;
      }
    });

    let totalDaysToAdd = dateRange.length + count;

    return addDays(startDate, totalDaysToAdd);
  } catch (error) {
    console.error("Exception: ", error);
  }
};

const today = new Date();

window.addEventListener("load", () => {
  currentDateEl.innerHTML = `
  <p>${today.toLocaleDateString("en-GB", dateOptions)}<p>
  `;

  readerMinEl.innerHTML = `
  <p>${addDays(today, 21).toLocaleDateString("en-GB", dateOptions)}</p>
  `;
});

dateInput.addEventListener("change", async () => {
  const reserveUntil = await addBankHolidays(dateInput.value, 7, true);
  reserveUntilEl.innerHTML = `
  <p>${reserveUntil.toLocaleDateString("en-GB", dateOptions)}</p>
  `;

  const oneReservationBefore = await addBankHolidays(dateInput.value, 27);
  oneReservationBeforeEl.innerHTML = `
  <p>${oneReservationBefore.toLocaleDateString("en-GB", dateOptions)}</p>
  `;
});
