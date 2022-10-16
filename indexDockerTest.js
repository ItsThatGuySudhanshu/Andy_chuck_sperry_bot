const puppeteer = require('puppeteer');
const fs = require('fs')
require('dotenv').config({ path: __dirname + '/.env' });

const minimal_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

function makeid(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() *
    charactersLength));
  }
  return result;
}

function fillEmail (element) {
  element.value = process.env.PERSONAL_USERNAME;
}

function resolveAfterSeconds(time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, time);
  });
}

let findMatch = async (entryDiv, preference) => {

  let index = 1;


  let listOfParagraphs = await entryDiv.$$("p");
  //console.log(listOfParagraphs);

  for (let i = 0; i < listOfParagraphs.length; i++) {
    let paragraph = listOfParagraphs[i];

    let textUnparsed = await paragraph.getProperty("innerText")
    let text = await textUnparsed.jsonValue();

    console.log(text)
    if (text.toLowerCase().includes(preference.toLowerCase())) {
      console.log(index.toString() + ": in the loop")
      return index;
    }

    if (text.toLowerCase().includes("sold out") == true || text.toLowerCase().includes("sold out") == true) {
      console.log("not available");
      return -1;
    }

    index++
  }
  console.log("outside loop")
  return -1;

}

let choosePreference = async (filename = null, entryDiv, preference = "Regular") => {


  if (filename != null) {
    console.log("here")
  } else {

    index = await findMatch(entryDiv, preference);
    console.log("index: " + index.toString())
    return index;

  }
}

async function puppetteerCall(page, ignoreIfRegularExists = true) {

  console.log("after puppeteer opened a new page")


  await page.goto(`https://chucksperry.net/blog/`);

  const entryDivs = await page.$$(".entry-content");
  const entryDiv = await entryDivs[1];


  try {

    let paragraphs = entryDiv.$$("p");

    for (let i = 0; i < paragraphs.length; i++) {
      let paragraph = paragraphs[i];

      let textUnparsed = await paragraph.getProperty("innerText")
      let text = await textUnparsed.jsonValue();

      let formInside = await paragraph.$("form");
      if (formInside != null) {
        try {
          let triedForm = await enterPaypalDetails(formInside, entryDiv, page);
          if (triedForm == true) {
            return true;
          }
        } catch (error) {
          // Continue
          console.log("no form inside paragraph");

        }
      }

    }


    const forms = await entryDiv.$$("form");

    let indexOfDescription = await choosePreference(null, entryDiv, "Regular");

    if (indexOfDescription == -1) {
      return false;
    }
    //console.log(indexOfDescription);

    // let posterDescription = await entryDiv.$("p:nth-of-type(2)");

    // let availability = await entryDiv.$("p:nth-of-type(3)");

    let posterDescriptionHandle = await entryDiv.$(`p:nth-of-type(${indexOfDescription})`);

    let availabilityHandle = await entryDiv.$(`p:nth-of-type(${indexOfDescription + 1})`);

    //console.log("here");

    let posterDescriptionTextUnparsed = await posterDescriptionHandle.getProperty("innerText")
    let posterDescriptionText = await posterDescriptionTextUnparsed.jsonValue();

    console.log("in main: " + posterDescriptionText)

    let availabilityUnparsed = await availabilityHandle.getProperty("innerText");
    let availabilityText = await availabilityUnparsed.jsonValue();


    if (availabilityText.includes("________________") ||
    (!availabilityText.toLowerCase().includes("Not Available".toLowerCase()) && !availabilityText.toLowerCase().includes("Sold out".toLowerCase()))) {
      try {
        return await enterPaypalDetails(forms, entryDiv, page);
      } catch {
        console.log("error while parsing paypal");

        return false;
      }
    } else {

      console.log("not found")
      return false;
    }

  } catch (e) {
    console.log(e);
    return false;

  }
}

let main = async () => {

  let index = 1;

  const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome', headless: true, args: minimal_args});
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if( req.resourceType() == 'font' || req.resourceType() == 'stylesheet' || req.resourceType() == 'image'){

      req.abort();
    }
    else {
      req.continue();
    }
  });

  while (true) {


    const start = Date.now();

    // Set default to true for checking if a regular poster exists vs buying any poster
    let status = await puppetteerCall(page, true);

    const duration = Date.now() - start;
    console.log(duration);
    //let status = await asynccall();

    await resolveAfterSeconds(1000);
    console.log("Run number: " + index);

    if (status == true) {
      break;
    }

    await page.reload();

  }

  await browser.close();


  console.log("Finished job");

}

main();

async function enterPaypalDetails(forms, entryDiv, page) {
  let form = await forms[0];

  // Form is inside a p element
  if (form == null) {
    form = await entryDiv.$("p:nth-of-type(3)");
    form = await form.$("form");
  }
  await form.evaluate(form => form.submit());


  try {
    await page.waitForNavigation();

  } catch (e) {
    console.log(e);

  }

  let val = process.env.PERSONAL_USERNAME;
  //console.log(val);
  const addEmail = await page.$eval("#email", (element, val) => {
    element.value = val;
    return element.value;
  }, val

  );


  //console.log(addEmail);
  let paypalUsernameForm = await page.$("form");
  await paypalUsernameForm.evaluate(form => form.submit());

  try {
    await page.waitForNavigation();

  } catch (e) {
    console.log(e);

  }
  const password = process.env.PERSONAL_PASSWORD;
  await page.$eval("#password", (element, password) => {
    element.value = password;
    return element.value;
  }, password);

  //console.log(password);
  let formAfterSubmit = await page.$("form");
  await formAfterSubmit.evaluate(form => form.submit());


  try {
    await page.waitForNavigation();

  } catch (e) {
    console.log(e);

  }

  //await page.screenshot({ path: "screenshots/mock-website/afterPasword_" + makeid(8) + ".png"})
  await page.$eval("input[type=radio]", el => el.click());

  await resolveAfterSeconds(2000);

  await page.$eval("#payment-submit-btn", btn => btn.click());

  await resolveAfterSeconds(3000);
  //await page.screenshot({ path: "screenshots/mock-website/afterSubmitPayment_" + makeid(8) + ".png"})
  return true;
}

