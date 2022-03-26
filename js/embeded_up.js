let server_url = "";
let user_name = "";
let domain = "ISWKE";
let global_password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
let transaction_ref = new Date().getTime();
let order_id = transaction_ref;


let public_key = "-----BEGIN\x20PUBLIC\x20KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA491SNGuyTEm2dGltU1hobiMLPetjJSw+2Y5e9Cu4xKdOviIrfIAnMav5RH0fozA3aHffYATtgJaDsFE7VZd8pmYhSMRzf+5xk0aIDyMXh+fvmLma+Ig8P9wo16k2w3/a+/Gy4djFEhunYhUtPNvdO0QCHQ8/iDKGghisgCDipWWWJsTg3aiNVdP9Syln/uqvE8Nld4lXLqeTI9v6E2aHbZ/jqim7601NvH+bTrzCDVuWOv0+lCYQJVCa1PxdLwguZklxRqhQE67/e+CnvYgJl466j4sEdfh0qfH3HjPNB6kekCULmEGvSP8Gqmpt6UM18i2IN+DDoniNjc+L43U6xwIDAQAB-----END\x20PUBLIC\x20KEY-----";



function encrypt(msg, pass) {

    //Create random salt to strengthen key
    const salt = CryptoJS.lib.WordArray.random(128 / 8);

    //Generate stronger 256 bit key based on given password and random salt
    const key = CryptoJS.PBKDF2(pass, salt, {
        keySize: 256 / 32,
        iterations: 1024
    });

    //Create random 128 bit iv for 16 byte aes block
    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(msg, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    // Return encrypted result together with key and iv for use in decryption
    return {
        key: key.toString(), // 256 bit key in hex (64 chars)
        iv: iv.toString(), // 128 bit IV in hex (32 chars)
        encrypted: encrypted.toString() // Base64 encoded string of the encrypted data
    };
}

function buildPayload() {
    return {
        amount: $('#amount').val() * 100, //To get value in minor denomination
        currency: $('#currency').val(),
        customer: {
            customerId: $('#customer_id').val(),
            firstName: $('#first_name').val(),
            secondName: $('#second_name').val(),
            email: $('#email').val(),
            mobile: $('#mobile').val(),
            city: $('#city').val(),
            country: $('#country').val(),
            postalCode: "",
            street: "",
            state: ""
        },
        cvv2: $('#cvv').val(),
        domain: domain,
        expiryDate: $('#expiry_date').val(),
        merchantId: merchant_id,
        narration: $('#narration').val(),
        orderId: order_id,
        pan: $('#pan').val(),
        transactionRef: transaction_ref
    }
}

function validateForm() {
    var fields = ["pan", "cvv", "expiry_date"]

    var i = fields.length;
    var fieldname;
    for (i = 0; i < i; i++) {
        fieldname = fields[i];
        if (document.forms["payment_form"][fieldname].value === "") {
            alert(fieldname + " can not be empty.");
            return false;
        }
    }
    var regex = /^\d*[.]?\d*$/;
    if (document.forms["payment_form"]["pan"].value.length !== 16 || !(regex.test($("#pan").val()))) {

        alert("Invalid Card! Please Use Valid Card.");
        return false;
    }
    console.log($("#expiry_date").val().replace(/\//g, ""));
    var regex1 = /^(0?[1-9]|1[012])[\/\-]\d{2}$/;
    if (document.forms["payment_form"]["expiry_date"].value.length !== 5 || !(regex1.test($("#expiry_date").val()))) {
        console.log($("#expiry_date").val().replace(/\//g, ""));
        alert("Invalid Card Expiry Date! Please Enter Valid Date.i.e MM/YY");
        return false;
    }
    if (document.forms["payment_form"]["cvv"].value.length !== 3 || !(regex.test($("#cvv").val()))) {
        alert("Invalid Card CVV! Please Enter Correct Value.");
        return false;
    }


    var country = $('#country').val();
    if (country === "US") {
        if (document.forms["payment_form"]["state"].value === "") {
            alert("State cannot be empty. Please Select State!");
            return false;
        }
        if (document.forms["payment_form"]["zip"].value === "") {
            alert("Zip Code cannot be empty. Please Enter Zip Code!");
            return false;
        }
    }
    if (country === "CA") {
        if (document.forms["payment_form"]["state"].value === "") {
            alert("State cannot be empty. Please Select State!");
            return false;
        }
        if (document.forms["payment_form"]["zip"].value === "") {
            alert("Zip Code cannot be empty. Please Enter Zip Code!");
            return false;
        }
    }
    return true;
}

async function pay() {
    //validate

    if (validateForm()) {

        $('.card-body').loadingView({ 'state': true });
        var reference = $('#requestID').val();
        if (reference === "") {
            reference = new Date().getTime();
        }
        const payload = await buildPayloadVP(reference, 'NONE', reference);
        //pay_button
        $('#pay_button').attr("disabled", "disabled");


        getToken(payload, onSuccess, onFailure, reference);
    }
}

let onSuccess = function(result, payload, reference) {
    var jwt = result;

    var url = 'https://evirtualpay.com:5443/api/authenticate';
    sendToVirtualPay(payload, onSuccess, onFailure, jwt, url, reference);
};

let onFailure = function(error) {
    console.log(error);
    alert("Error:" + error);
};

async function encodeKey(keyAsString) {
    const encoder = new window.TextEncoder();
    return await window.crypto.subtle.importKey('raw', encoder.encode(keyAsString), 'AES-CBC', false, ['encrypt', 'decrypt']);
}

async function encodeIv(ivAsString) {
    const encoder = new window.TextEncoder();

    return encoder.encode(ivAsString);
}

async function encryptBody(encodedKey, encodedIv, bodyAsString) {
    const encoder = new window.TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt({
        name: 'AES-CBC',
        iv: encodedIv
    }, encodedKey, encoder.encode(bodyAsString));
    const encryptedEncoded = new window.Uint8Array(encrypted);
    const encryptedParsed = String.fromCharCode.apply(null, encryptedEncoded);
    return btoa(encryptedParsed);
}

async function decryptBodyKey(encodedKey, encodedIv, encryptedBody) {
    const decoder = new window.TextDecoder("utf-8");
    const rawString = Uint8Array.from(window.atob(encryptedBody), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt({
        name: 'AES-CBC',
        iv: encodedIv
    }, encodedKey, rawString.buffer);
    return decoder.decode(decrypted);
}

async function buildPayloadVP(reference, payloadStr, transactionID) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(public_key);
    var key = CryptoJS.lib.WordArray.random(16);
    var iv = CryptoJS.lib.WordArray.random(8);

    var encryptedKey = encrypt.encrypt(key.toString());
    var encryptedIv = encrypt.encrypt(iv.toString());

    var doc = document.implementation.createDocument("", "", null);
    var messageElem = doc.createElement("message");

    var merchantID = doc.createElement("merchantID");
    merchantID.innerHTML = $('#merchant_id').val();
    messageElem.appendChild(merchantID);
    var requestID = doc.createElement("requestID");
    requestID.innerHTML = reference;
    messageElem.appendChild(requestID);
    var transactionIDX = doc.createElement("TransactionId");
    transactionIDX.innerHTML = transactionID;
    messageElem.appendChild(transactionIDX);
    var date = doc.createElement("date");
    date.innerHTML = new Date().toLocaleDateString();
    messageElem.appendChild(date);
    var requestTime = doc.createElement("requestTime");
    requestTime.innerHTML = new Date().toTimeString();
    messageElem.appendChild(requestTime);
    var customerName = doc.createElement("customerName");
    customerName.innerHTML = $('#first_name').val().concat(" ").concat($('#last_name').val());
    messageElem.appendChild(customerName);
    var Payload = doc.createElement("Payload");
    Payload.innerHTML = payloadStr;
    messageElem.appendChild(Payload);
    var customerPhoneNumber = doc.createElement("customerPhoneNumber");
    customerPhoneNumber.innerHTML = $('#mobile').val();
    messageElem.appendChild(customerPhoneNumber);
    var cardNumber = doc.createElement("cardNumber");
    cardNumber.innerHTML = $('#pan').val();
    messageElem.appendChild(cardNumber);
    var expiry = doc.createElement("expiry");
    console.log($("#expiry_date").val().replace(/\//g, ""));
    expiry.innerHTML = $('#expiry_date').val().replace(/\//, "");
    messageElem.appendChild(expiry);
    var email = doc.createElement("email");
    email.innerHTML = $('#email').val();
    messageElem.appendChild(email);
    var currency = doc.createElement("currency");
    currency.innerHTML = $('#currency').val();
    messageElem.appendChild(currency);
    var amount = doc.createElement("amount");
    amount.innerHTML = $('#amount').val() * 100;
    messageElem.appendChild(amount);
    var description = doc.createElement("description");
    description.innerHTML = $('#narration').val();
    messageElem.appendChild(description);
    var country = doc.createElement("country");
    country.innerHTML = $('#country').val();
    messageElem.appendChild(country);
    var cityval = doc.createElement("city");
    cityval.innerHTML = $('#city').val();
    messageElem.appendChild(cityval);
    var stateCode = doc.createElement("stateCode");
    stateCode.innerHTML = $('#state').val();
    messageElem.appendChild(stateCode);
    var postalCode = doc.createElement("postalCode");
    postalCode.innerHTML = $('#zip').val();
    messageElem.appendChild(postalCode);
    var cvv = doc.createElement("cvv");
    cvv.innerHTML = $('#cvv').val();
    messageElem.appendChild(cvv);
    var redirectUrl = doc.createElement("redirectUrl");
    redirectUrl.innerHTML = encodeURIComponent($('#redirectUrl').val());
    messageElem.appendChild(redirectUrl);
    var redirectUrl = doc.createElement("timeoutUrl");
    redirectUrl.innerHTML = encodeURIComponent($('#timeoutUrl').val());
    messageElem.appendChild(redirectUrl);
    doc.appendChild(messageElem);
    var encodedKey = await encodeKey(key.toString());
    var encodedIv = await encodeIv(iv.toString());
    var encryptedRequest = await encryptBody(encodedKey, encodedIv, new XMLSerializer().serializeToString(doc.documentElement));


    //await decryptBody(encodedKey, encodedIv, encryptedRequest);

    var docEncrypted = document.implementation.createDocument("", "", null);
    var messageElemEnc = docEncrypted.createElement("message");
    var request = docEncrypted.createElement("request");
    request.innerHTML = encryptedRequest;
    messageElemEnc.appendChild(request);
    var cryptoInformation = docEncrypted.createElement("cryptoInformation");
    var encryptedKeyVal = docEncrypted.createElement("encryptedKey");
    encryptedKeyVal.innerHTML = encryptedKey;
    cryptoInformation.appendChild(encryptedKeyVal);
    var encryptedIvVal = docEncrypted.createElement("encryptedIv");
    encryptedIvVal.innerHTML = encryptedIv;
    cryptoInformation.appendChild(encryptedIvVal);
    var messageSignatureVal = docEncrypted.createElement("messageSignature");
    cryptoInformation.appendChild(messageSignatureVal);

    messageElemEnc.appendChild(cryptoInformation);
    docEncrypted.appendChild(messageElemEnc);
    return new XMLSerializer().serializeToString(docEncrypted.documentElement);
}

async function buildJsonPayload(reference, payloadStr, transactionID) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(public_key);
    var key = CryptoJS.lib.WordArray.random(16);
    var iv = CryptoJS.lib.WordArray.random(8);

    var encryptedKey = encrypt.encrypt(key.toString());
    var encryptedIv = encrypt.encrypt(iv.toString());

    var bareDetails = {
        "merchantID": $('#merchant_id').val(),
        "transactionID": transactionID,
        "requestID": reference,
        "date": new Date().toLocaleDateString(),
        "requestTime": new Date().toLocaleTimeString(),
        "customerName": $('#first_name').val().concat(" ").concat($('#last_name').val()),
        "customerPhoneNumber": $('#mobile').val(),
        "cardNumber": $('#pan').val(),
        "expiry": $('#expiry_date').val().replace(/\//, ""),
        "email": $('#email').val(),
        "currency": $('#currency').val(),
        "amount": $('#amount').val() * 100,
        "narration": $('#narration').val(),
        "country": $('#country').val(),
        "city": $('#city').val(),
        "cvv": $('#cvv').val(),
        "payload": payloadStr,
        "redirectUrl": encodeURIComponent($('#redirectUrl').val()),
    };

    var encodedKey = await encodeKey(key.toString());
    var encodedIv = await encodeIv(iv.toString());
    var encryptedRequest = await encryptBody(encodedKey, encodedIv, JSON.stringify(bareDetails));

    var jsonObj = {
        "MID": $('#merchant_id').val(),
        "encodedKey": key.toString(),
        "encodedIv": iv.toString(),
        "encryptedRequest": btoa(encryptedRequest),
        "redirectUrl": encodeURIComponent($('#redirectUrl').val()),
        "encryptedKey": encryptedKey,
        "encryptedIv": encryptedIv,
        "APIKEY": $('#api_key').val(),
        "PRIVATE_KEY": $('#private_key').val(),
    };
    return JSON.stringify(jsonObj);
}

async function buildXMLPayload(originalJSON, key, iv) {
    var orig = JSON.parse(originalJSON);

    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(public_key);

    var encryptedKey = encrypt.encrypt(key.toString());
    var encryptedIv = encrypt.encrypt(iv.toString());

    var doc = document.implementation.createDocument("", "", null);
    var messageElem = doc.createElement("message");

    var merchantID = doc.createElement("merchantID");
    merchantID.innerHTML = orig.merchantID;
    messageElem.appendChild(merchantID);
    var requestID = doc.createElement("requestID");
    requestID.innerHTML = orig.requestID;
    messageElem.appendChild(requestID);
    var transactionIDX = doc.createElement("TransactionId");
    transactionIDX.innerHTML = orig.transactionID;
    messageElem.appendChild(transactionIDX);
    var date = doc.createElement("date");
    date.innerHTML = orig.date;
    messageElem.appendChild(date);
    var requestTime = doc.createElement("requestTime");
    requestTime.innerHTML = orig.requestTime;
    messageElem.appendChild(requestTime);
    var customerName = doc.createElement("customerName");
    customerName.innerHTML = orig.customerName;
    messageElem.appendChild(customerName);
    var Payload = doc.createElement("Payload");
    Payload.innerHTML = orig.payload;
    messageElem.appendChild(Payload);
    var customerPhoneNumber = doc.createElement("customerPhoneNumber");
    customerPhoneNumber.innerHTML = orig.customerPhoneNumber;
    messageElem.appendChild(customerPhoneNumber);
    var cardNumber = doc.createElement("cardNumber");
    cardNumber.innerHTML = orig.cardNumber;
    messageElem.appendChild(cardNumber);
    var expiry = doc.createElement("expiry");
    expiry.innerHTML = orig.expiry;
    messageElem.appendChild(expiry);
    var email = doc.createElement("email");
    email.innerHTML = orig.email;
    messageElem.appendChild(email);
    var currency = doc.createElement("currency");
    currency.innerHTML = orig.currency;
    messageElem.appendChild(currency);
    var amount = doc.createElement("amount");
    amount.innerHTML = orig.amount;
    messageElem.appendChild(amount);
    var description = doc.createElement("description");
    description.innerHTML = orig.narration;
    messageElem.appendChild(description);
    var country = doc.createElement("country");
    country.innerHTML = orig.country;
    messageElem.appendChild(country);
    var cityval = doc.createElement("city");
    cityval.innerHTML = orig.city;
    messageElem.appendChild(cityval);
    var cvv = doc.createElement("cvv");
    cvv.innerHTML = orig.cvv;
    messageElem.appendChild(cvv);
    var redirectUrl = doc.createElement("redirectUrl");
    redirectUrl.innerHTML = orig.redirectUrl;
    messageElem.appendChild(redirectUrl);
    doc.appendChild(messageElem);
    var encodedKey = await encodeKey(key.toString());
    var encodedIv = await encodeIv(iv.toString());
    var encryptedRequest = await encryptBody(encodedKey, encodedIv, new XMLSerializer().serializeToString(doc.documentElement));


    //await decryptBody(encodedKey, encodedIv, encryptedRequest);

    var docEncrypted = document.implementation.createDocument("", "", null);
    var messageElemEnc = docEncrypted.createElement("message");
    var request = docEncrypted.createElement("request");
    request.innerHTML = encryptedRequest;
    messageElemEnc.appendChild(request);
    var cryptoInformation = docEncrypted.createElement("cryptoInformation");
    var encryptedKeyVal = docEncrypted.createElement("encryptedKey");
    encryptedKeyVal.innerHTML = encryptedKey;
    cryptoInformation.appendChild(encryptedKeyVal);
    var encryptedIvVal = docEncrypted.createElement("encryptedIv");
    encryptedIvVal.innerHTML = encryptedIv;
    cryptoInformation.appendChild(encryptedIvVal);
    var messageSignatureVal = docEncrypted.createElement("messageSignature");
    cryptoInformation.appendChild(messageSignatureVal);

    messageElemEnc.appendChild(cryptoInformation);
    docEncrypted.appendChild(messageElemEnc);
    return new XMLSerializer().serializeToString(docEncrypted.documentElement);

}

$(() => {
    $('#transaction_ref').val(transaction_ref);
    $('#order_id').val(transaction_ref);
    $('#password').val(global_password);

});

$('.required').blur(function() {
    var empty_flds = 0;
    $(".required").each(function() {
        if (!$.trim($(this).val())) {
            empty_flds++;
        }
    });

    if (empty_flds) {
        $('.pay_button').fadeOut(0);
    } else {
        $('.pay_button').fadeIn(0);
    }
});

let onSuccessVP = async function(result, jwt, request, reference) {
    var decrypt = new JSEncrypt();
    let private_key = $('#private_key').val();
    decrypt.setPrivateKey(private_key);
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(result, "text/xml");

    var encResp = xmlDoc.getElementsByTagName("response")[0].innerHTML;
    var encKey = xmlDoc.getElementsByTagName("encryptedKey")[0].innerHTML;
    var enciv = xmlDoc.getElementsByTagName("encryptedIv")[0].innerHTML;
    // decrypt the full response
    var decryptedKey = decrypt.decrypt(encKey.toString());
    var decryptedIv = decrypt.decrypt(enciv.toString());

    var encodedKey = await encodeKey(decryptedKey.toString());
    var encodedIv = await encodeIv(decryptedIv.toString());

    var decrypted = await decryptBodyKey(encodedKey, encodedIv, encResp);

    // parse xml and redirect user to url
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(decrypted, "text/xml");


    var url = xmlDoc.getElementsByTagName("ACSUrl")[0].innerHTML;
    var txnid = xmlDoc.getElementsByTagName("requestID")[0].innerHTML;
    var enrolled = xmlDoc.getElementsByTagName("Enrolled")[0].innerHTML;
    //var payloadReq = await buildPayloadVP(txnid,xmlDoc.getElementsByTagName("Payload")[0].innerHTML,reference);
    var payloadReq = await buildJsonPayload(txnid, xmlDoc.getElementsByTagName("Payload")[0].innerHTML, reference);
    var termurl = xmlDoc.getElementsByTagName("ValidateUrl")[0].innerHTML;
    let payload = {
        PaReq: xmlDoc.getElementsByTagName("Payload")[0].innerHTML,
        MD: txnid,
        //TermUrl: "https://www.evirtualpay.com/pg/checkout/3d_secure_step2.php?payload=".concat(btoa(payloadReq)),
        TermUrl: termurl,
    };
    if (enrolled == 'Y') {
        post(url, payload);
    } else {
        $('.card-body').loadingView({ 'state': false });
        alert('Card Not Supported! Please use another card.');
        $('#pay_button').removeAttr("disabled");
    }
};

function post(path, params, method = 'post') {

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    const form = document.createElement('form');
    form.method = method;
    form.action = path;

    // $('#resModal').modal('show');


    // form.target = "paFrame";

    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = params[key];

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();

    $('.card-body').loadingView({ 'state': false });
    $('#resModal').modal('hide');
}



let onFailureVP = function(error) {
    console.log(error);
    $('.card-body').loadingView({ 'state': false });
    $('#pay_button').removeAttr("disabled");
    alert("Error:" + error);
};



function injectScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = src;
        script.addEventListener('load', resolve);
        script.addEventListener('error', () => reject('Error loading script.'));
        script.addEventListener('abort', () => reject('Script loading aborted.'));
        document.head.appendChild(script);
    });
}

function validatemobileForm() {
    var fields = ["mobile_wallet", "mno_wallet"]

    var i = fields.length;
    var fieldname;
    for (i = 0; i < i; i++) {
        fieldname = fields[i];
        if (document.forms["mobile_payment_form"][fieldname].value === "") {
            alert(fieldname + " can not be empty.");
            return false;
        }
    }
    var regex = /^\d*[.]?\d*$/;
    if (document.forms["mobile_payment_form"]["mobile_wallet"].value.length !== 9 || !(regex.test($("#mobile_wallet").val()))) {

        alert("Invalid Mobile Number! Please Use Valid Mobile Number. eg 7********");
        return false;
    }
    if (document.forms["mobile_payment_form"]["mno_wallet"].value === "--Network Operators--") {
        alert("Invalid MNO! Please Select A mobile network operator");
        return false;
    }



    return true;
}
async function payWallet() {
    //validate

    if (validatemobileForm()) {
        //$('#iframe-group').show();

        $('.card-body').loadingView({ 'state': true });



        var reference = $('#requestID').val();
        if (reference === "") {
            reference = new Date().getTime();
        }
        const payload = await buildMobileJsonPayload(reference, 'NONE', reference);

        //pay_button
        $('#pay_button_wallet').attr("disabled", "disabled");
        sendMobileRequest(payload, onSuccess, onFailure)

    }
}
async function buildMobileJsonPayload(reference, payloadStr, transactionID) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(public_key);
    var key = CryptoJS.lib.WordArray.random(16);
    var iv = CryptoJS.lib.WordArray.random(8);

    var encryptedKey = encrypt.encrypt(key.toString());
    var encryptedIv = encrypt.encrypt(iv.toString());
    var b = $('#currency').val();
    if ($('#mno_wallet').val() === "MTN_UG") {
        b = "UGX-MTNMM";
    }
    if ($('#mno_wallet').val() === "AIRTEL_UG") {
        b = "UGX-WTLMM";
    }
    var c = $('#country').val();
    var mobileNumber = $('#mobile_wallet').val();
    if (c === "KE") {
        mobileNumber = "254".concat($('#mobile_wallet').val());

    }
    if (c === 'UG') {
        mobileNumber = "256".concat($('#mobile_wallet').val());
    }
    if (c === 'TZ') {
        mobileNumber = "255".concat($('#mobile_wallet').val());
    }
    if (c === 'GH') {
        mobileNumber = "+233".concat($('#mobile_wallet').val());
    }

    var bareDetails = {
        "merchantID": $('#merchant_id').val(),

        "requestID": reference,
        "date": new Date().toLocaleDateString(),
        "requestTime": new Date().toLocaleTimeString(),
        "customerName": $('#first_name').val().concat(" ").concat($('#last_name').val()),
        "customerPhoneNumber": mobileNumber,

        "currency": b,

        "amount": $('#amount').val() * 100,
        "description": $('#narration').val(),
        "country": $('#country').val(),

        "network": $('#mno_wallet').val(),

        "redirectUrl": encodeURIComponent($('#redirectUrl').val()),
        "timeoutUrl" : encodeURIComponent($('#timeoutUrl').val()),
    };



    var encodedKey = await encodeKey(key.toString());
    var encodedIv = await encodeIv(iv.toString());
    var encryptedRequest = await encryptBody(encodedKey, encodedIv, JSON.stringify(bareDetails));


    var docEncrypted = document.implementation.createDocument("", "", null);
    var messageElemEnc = docEncrypted.createElement("message");
    var request = docEncrypted.createElement("request");
    request.innerHTML = encryptedRequest;
    messageElemEnc.appendChild(request);
    var cryptoInformation = docEncrypted.createElement("cryptoInformation");
    var encryptedKeyVal = docEncrypted.createElement("encryptedKey");
    encryptedKeyVal.innerHTML = encryptedKey;
    cryptoInformation.appendChild(encryptedKeyVal);
    var encryptedIvVal = docEncrypted.createElement("encryptedIv");
    encryptedIvVal.innerHTML = encryptedIv;
    cryptoInformation.appendChild(encryptedIvVal);
    var messageSignatureVal = docEncrypted.createElement("messageSignature");
    cryptoInformation.appendChild(messageSignatureVal);

    messageElemEnc.appendChild(cryptoInformation);
    docEncrypted.appendChild(messageElemEnc);

    return new XMLSerializer().serializeToString(docEncrypted.documentElement);
}
async function buildmobilePayloadVP(reference, payloadStr, transactionID) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(public_key);
    var key = CryptoJS.lib.WordArray.random(16);
    var iv = CryptoJS.lib.WordArray.random(8);

    var encryptedKey = encrypt.encrypt(key.toString());
    var encryptedIv = encrypt.encrypt(iv.toString());

    var doc = document.implementation.createDocument("", "", null);
    var messageElem = doc.createElement("message");

    var merchantID = doc.createElement("merchantID");
    merchantID.innerHTML = $('#merchant_id').val();
    messageElem.appendChild(merchantID);
    var requestID = doc.createElement("requestID");
    requestID.innerHTML = reference;
    messageElem.appendChild(requestID);

    var date = doc.createElement("date");
    date.innerHTML = new Date().toLocaleDateString();
    messageElem.appendChild(date);
    var requestTime = doc.createElement("requestTime");
    requestTime.innerHTML = new Date().toTimeString();
    messageElem.appendChild(requestTime);
    var customerName = doc.createElement("customerName");
    customerName.innerHTML = $('#first_name').val().concat(" ").concat($('#last_name').val());
    messageElem.appendChild(customerName);

    var customerPhoneNumber = doc.createElement("customerPhoneNumber");
    customerPhoneNumber.innerHTML = $('#mobile').val();
    messageElem.appendChild(customerPhoneNumber);


    var currency = doc.createElement("currency");
    currency.innerHTML = $('#currency_wallet').val();
    messageElem.appendChild(currency);
    var amount = doc.createElement("amount");
    amount.innerHTML = $('#amount_wallet').val() * 100;
    messageElem.appendChild(amount);
    var description = doc.createElement("description");
    description.innerHTML = $('#narration_wallet').val();
    messageElem.appendChild(description);
    var country = doc.createElement("country");
    country.innerHTML = $('#country').val();
    messageElem.appendChild(country);
    var network = doc.createElement("network");
    network.innerHTML = $('#mno_wallet').val();
    messageElem.appendChild(network);


    var redirectUrl = doc.createElement("redirectUrl");
    redirectUrl.innerHTML = encodeURIComponent($('#redirectUrl').val());
    messageElem.appendChild(redirectUrl);

    doc.appendChild(messageElem);
    var encodedKey = await encodeKey(key.toString());
    var encodedIv = await encodeIv(iv.toString());
    console.log(new XMLSerializer().serializeToString(doc.documentElement));
    var encryptedRequest = await encryptBody(encodedKey, encodedIv, new XMLSerializer().serializeToString(doc.documentElement));


    //await decryptBody(encodedKey, encodedIv, encryptedRequest);

    var docEncrypted = document.implementation.createDocument("", "", null);
    var messageElemEnc = docEncrypted.createElement("message");
    var request = docEncrypted.createElement("request");
    request.innerHTML = encryptedRequest;
    messageElemEnc.appendChild(request);
    var cryptoInformation = docEncrypted.createElement("cryptoInformation");
    var encryptedKeyVal = docEncrypted.createElement("encryptedKey");
    encryptedKeyVal.innerHTML = encryptedKey;
    cryptoInformation.appendChild(encryptedKeyVal);
    var encryptedIvVal = docEncrypted.createElement("encryptedIv");
    encryptedIvVal.innerHTML = encryptedIv;
    cryptoInformation.appendChild(encryptedIvVal);
    var messageSignatureVal = docEncrypted.createElement("messageSignature");
    cryptoInformation.appendChild(messageSignatureVal);

    messageElemEnc.appendChild(cryptoInformation);
    docEncrypted.appendChild(messageElemEnc);
    return new XMLSerializer().serializeToString(docEncrypted.documentElement);
}



var onSuccessMobile = function(a, b) {

        var c = JSON.parse(a);

        alert(c.CustomerMessage);
        // $('#mobile_resModal').modal('show');
        // $("#mobile_resModal .modal-body").html('<p name="paFramey" id="paFramey"  style="display: block;margin:0 auto;border:none">"c.CustomerMessage" </p>');

        $(".card-body").loadingView({ state: !1 });
        $("#pay_button_wallet").removeAttr("disabled")
    },
    onFailureMobile = function(a) {

        alert("Error:" + a);
        $(".card-body").loadingView({ state: !1 });
        $("#pay_button_wallet").removeAttr("disabled")
    };
