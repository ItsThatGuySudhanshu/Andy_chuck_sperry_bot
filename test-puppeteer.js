const puppeteer = require('puppeteer');
require('dotenv').config({ path: __dirname + '/.env' });

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
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





/**
 *
 * viable approaches:
 * 1) always choose the 3rd element and check whether
 * the element is a form or a p. if its a p, then continue
 *
 * 2) choose all form elements from the website. if there is a match,
 * check whether the preceding element is a gold, silver etc
 * @returns None
 */
async function puppetteerCall(token) {

  let browser = undefined;

  try {

    console.log(process.env);

    console.log("in the call");

    browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://itsthatguysudhanshu.github.io/chuck-sperry-test-site/');
    await page.screenshot({ path: 'screenshots/before_authentication' + makeid(8) + '.png' });

    const body = await page.$("body");



    let first = await body.$("p:nth-of-type(2)");

    let availability = await body.$("p:nth-of-type(3)");

    console.log("here");

    let text = await first.getProperty("innerText")
    let textjson = await text.jsonValue();

    console.log(typeof textjson)
    console.log(textjson);

    let nextSibling = await availability.getProperty("innerText")
    let nextSiblingText = await nextSibling.jsonValue();

    console.log(nextSiblingText);

    console.log(typeof nextSiblingText);


    const forms = await body.$$("form");
    // Regular is available, call the purchase script
    if (nextSiblingText.includes("________________")) {
      let form = await forms[0];
      await form.evaluate(form => form.submit());


      await page.waitForNavigation();
      //await page.screenshot({ path: "example" + makeid(8) + ".png"})

      let val = process.env.PERSONAL_USERNAME;
      console.log(val);
      const addEmail = await page.$eval("#email", (element, val) => {
        element.value = val;
        return element.value;
      }, val

      );


      console.log(addEmail);

      let paypalUsernameForm = await page.$("form");
      await paypalUsernameForm.evaluate(form => form.submit());

      await page.waitForNavigation();

      let password = process.env.PERSONAL_PASSWORD;
      const addPassword = await page.$eval("#password", (element, password) => {
        element.value = password;
        return element.value;
      }, password

      );

      console.log(password);

      let paypalFormSubmittedAfterPassword = await page.$("form");
      await paypalFormSubmittedAfterPassword.evaluate(form => form.submit());

      await page.waitForNavigation();
      //await page.screenshot({ path: "screenshots/exampleAfterPassword_" + "paypalsubmit_" + makeid(8) + ".png"})


      await page.$eval("input[type=radio]", el => el.click());

      await resolveAfterSeconds(10000);

      await page.screenshot({ path: "screenshots/afterRadioClick" + makeid(8) + ".png"})

      await page.$eval("#payment-submit-btn", btn => btn.click());


      await resolveAfterSeconds(10000);
      await page.screenshot({ path: "screenshots/beforePaymentSubmit_" + makeid(8) + ".png"})


      await page.waitForNavigation();


      await page.screenshot({ path: "screenshots/exampleAfterSubmit_" + "paypalsubmit_" + makeid(8) + ".png"})

    }


    await browser.close();
    return true;

  } catch (e) {
    console.log(e);
    await browser.close();
    return false;

  }
}



let main = async () => {

  let index = 1;

  while (index < 2) {

    const start = Date.now();

    // let data = {username: process.env.PERSONAL_USERNAME, password: process.env.PERSONAL_PASSWORD};
    // let encrypted = jwt.sign(data, 'my random token');
    let status = await puppetteerCall();

    const duration = Date.now() - start;
    console.log(duration);
    //let status = await asynccall();

    const result = resolveAfterSeconds(1000);
    console.log("Run number: " + index);
    index++;

    if (status == true) {
      break;
    }

  }


  console.log("Finished job");



}






main();