$(document).ready(function() {
    $("#pan").focusout(function() {
        check_cardnumber();
    });
    //autocompleting mm/yy
    $('#expiry_date').bind('keyup','keydown', function(event) {
        var inputLength = event.target.value.length;
      if (event.keyCode != 5){
        if(inputLength === 2 ){
          var thisVal = event.target.value;
          thisVal += '/';
          $(event.target).val(thisVal);
          }
      }
    });

    function check_cardnumber() {
        var cardnumber = $("#pan").val().length;
        var regex = /^\d*[.]?\d*$/;
        if (cardnumber < 16 || !(regex.test($("#pan").val()))) {
            $("#card_error_message").css("display", "inline");
        } else {
            $("#card_error_message").css("display", "none");
        }
    };
    $("#cvv").focusout(function() {

        check_cvv();
    });

    function check_cvv() {
        var cvv = $("#cvv").val().length;
        var regex = /^\d*[.]?\d*$/;
        if (cvv < 3 || !(regex.test($("#cvv").val()))) {
            $("#cvv_error_message").css("display", "inline");
        } else {
            $("#cvv_error_message").css("display", "none");
        }
    };
    $("#expiry_date").focusout(function() {
        check_expiry();
    });



    function check_expiry() {
        var expiry = $("#expiry_date").val().length;

        var regex = /^(0?[1-9]|1[012])[\/\-]\d{2}$/;
        if (expiry < 5 || !(regex.test($("#expiry_date").val()))) {
            $("#expiry_error_message").css("display", "inline");
        } else {
            $("#expiry_error_message").css("display", "none");
        }
    };
    $("#mobile_wallet").focusout(function() {
        check_mobile();
    });

    function check_mobile() {
        var regex = /^\d*[.]?\d*$/;
        var expiry = $("#mobile_wallet").val().length;
        if (expiry < 9 || !(regex.test($("#mobile_wallet").val()))) {
            $("#mobile_error_message").css("display", "inline");
        } else {
            $("#mobile_error_message").css("display", "none");
        }
    };
    $("#mno_wallet").focusout(function() {
        check_mno();
    });

    function check_mno() {
        var mno = $("#mno_wallet").val();
        if (mno === "--Network Operators--") {
            $("#mno_error_message").css("display", "inline");
        } else {
            $("#mno_error_message").css("display", "none");
        }
    };

    $('#card-navigation').click(function() {
        $("#main-navigation").css("display", "none");

        $("#mobile-pay").css("display", "none");
        $("#card-pay").css("display", "block");
        var c = $("#currency").val();
        "KES" === c || "USD" === c || "GBP" === c || "EUR" === c ? (document.getElementById("card-pay").style.display = "inline") : (document.getElementById("card-pay").style.display = "none", $("#main-navigation").css("display", "block"),
            alert("Method Not Supported!"))
        var country = $('#country').val();

        if (country === "US") {
            document.getElementById("state_div").style.display = 'inline';
            document.getElementById("postal_div").style.display = 'inline';

        } else if (country === "CA") {
            document.getElementById("state_div").style.display = 'inline';
            document.getElementById("postal_div").style.display = 'inline';
        } else {
            document.getElementById("state_div").style.display = 'none';
            document.getElementById("postal_div").style.display = 'none';
        }
    });

    $('#main-card-navigation-icon').click(function() {
        $("#mobile-pay").css("display", "none");
        $("#card-pay").css("display", "none");

        $("#main-navigation").css("display", "inline");



    });
    $('#main-mobile-navigation-icon').click(function() {
        $("#mobile-pay").css("display", "none");
        $("#card-pay").css("display", "none");

        $("#main-navigation").css("display", "inline");



    });

    $('#card-navigation-icon').click(function() {
        $("#main-navigation").css("display", "none");

        $("#mobile-pay").css("display", "none");
        $("#card-pay").css("display", "inline");
        var c = $("#currency").val();
        "KES" === c || "USD" === c || "GBP" === c || "EUR" === c ? (document.getElementById("card-pay").style.display = "inline") : (document.getElementById("card-pay").style.display = "none", $("#main-navigation").css("display", "block"),
            alert("Method Not Supported!"))
        var country = $('#country').val();
        console.log(country);
        if (country === "US") {
            document.getElementById("state_div").style.display = 'inline';
            document.getElementById("postal_div").style.display = 'inline';

        } else if (country === "CA") {
            document.getElementById("state_div").style.display = 'inline';
            document.getElementById("postal_div").style.display = 'inline';
        } else {
            document.getElementById("state_div").style.display = 'none';
            document.getElementById("postal_div").style.display = 'none';
        }
    });
    $('#mobile-navigation').click(function() {
        $("#main-navigation").css("display", "none");
        $("#card-pay").css("display", "none");
        $("#mobile-pay").css("display", "inline");
        var country = $('#country').val();
        var b = $("#currency").val();
        "KES" === b || "TZS" === b || "UGX" === b || "GHS" === b ? (document.getElementById("mobile-pay").style.display = "inline") : (document.getElementById("mobile-pay").style.display = "none", $("#main-navigation").css("display", "block"),
            alert("Method Not Supported!"))

        if (country === "KE") {
            document.getElementById("country_wallet").value = 'Kenya (+254)';


        } else if (country === "TZ") {
            document.getElementById("country_wallet").value = 'Tanzania (+255)';

        } else if (country === "UG") {
            document.getElementById("country_wallet").value = 'Uganda (+256)';

        } else if (country === "GH") {
            document.getElementById("country_wallet").value = 'Ghana (+233)';

        }else {
            $("#mobile-pay").css("display", "none");
            $("#main-navigation").css("display", "block");
            alert("Method Not Supported!");

            // $("#mobile-pay").css("display", "none");


        }
        var KENYA = [{
                display: "Mpesa",
                value: "MPESA_KE"
            },
            { display: "Airtel", value: "AIRTEL_KE" },
            { display: "EazzyPay", value: "EAZZYPAY_KE" }
        ];


        var UGANDA = [{
                display: "MTN",
                value: "MTN_UG"
            },
            { display: "Airtel", value: "AIRTEL_UG" }
        ];

        var TANZANIA = [{
                display: "Vodacom",
                value: "MPESA_TZ"
            },
            { display: "Tigo", value: "TIGO_TZ" },
            { display: "Airtel", value: "AIRTEL_TZ" },
            { display: "Zantel", value: "ZANTEL_ZM" },
            { display: "Halopesa", value: "HALOPESA_TZ" }
        ];

        var GHANA = [{
                display: "MTN Ghana",
                value: "MTN_GHANA"
            },
            
        ];

        switch (country) {
            case "KE":
                if (b === 'KES') {
                    network(KENYA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }

                break;
            case "UG":
                if (b === 'UGX') {
                    network(UGANDA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }
                break;
            case "TZ":
                if (b === 'TZS') {
                    network(TANZANIA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }
                break;
           case "GH":
                if (b === 'GHS') {
                    network(GHANA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }
                break;
            default:
                $("#mno_wallet").empty();
                $("#mno_wallet").append("<option>--Network Operator--</option>");
                break;
        }

        function network(arr) {
            $("#mno_wallet").empty(); //To reset cities
            $("#mno_wallet").append("<option>--Network Operators--</option>");
            $(arr).each(function(i) { //to list cities
                $("#mno_wallet").append("<option value=" + arr[i].value + ">" + arr[i].display + "</option>");
            });
        };




    });
    $('#mobile-navigation-icon').click(function() {
        $("#main-navigation").css("display", "none");
        $("#card-pay").css("display", "none");
        $("#mobile-pay").css("display", "inline");
        var country = $('#country').val();
        var b = $("#currency").val();
        "KES" === b || "TZS" === b || "UGX" === b || "GHS" === b ? (document.getElementById("mobile-pay").style.display = "inline") : (document.getElementById("mobile-pay").style.display = "none", $("#main-navigation").css("display", "block"),
            alert("Method Not Supported!"))

        if (country === "KE") {
            document.getElementById("country_wallet").value = 'Kenya (+254)';


        } else if (country === "TZ") {
            document.getElementById("country_wallet").value = 'Tanzania (+255)';

        } else if (country === "UG") {
            document.getElementById("country_wallet").value = 'Uganda (+256)';

        } else if (country === "GH") {
            document.getElementById("country_wallet").value = 'Ghana (+233)';

        }else {
            $("#mobile-pay").css("display", "none");
            $("#main-navigation").css("display", "block");
            alert("Method Not Supported!");

            // $("#mobile-pay").css("display", "none");


        }
        var KENYA = [{
                display: "Mpesa",
                value: "MPESA_KE"
            },
            { display: "Airtel", value: "AIRTEL_KE" },
            { display: "EazzyPay", value: "EAZZYPAY_KE" }
        ];


        var UGANDA = [{
                display: "MTN",
                value: "MTN_UG"
            },
            { display: "Airtel", value: "AIRTEL_UG" }
        ];

        var TANZANIA = [{
                display: "Vodacom",
                value: "MPESA_TZ"
            },
            { display: "Tigo", value: "TIGO_TZ" },
            { display: "Airtel", value: "AIRTEL_TZ" },
            { display: "Zantel", value: "ZANTEL_ZM" },
            { display: "Halopesa", value: "HALOPESA_TZ" }
        ];

        var GHANA = [{
                display: "MTN Ghana",
                value: "MTN_GHANA"
            },

        ];
        switch (country) {
            case "KE":
                if (b === 'KES') {
                    network(KENYA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }

                break;
            case "UG":
                if (b === 'UGX') {
                    network(UGANDA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }
                break;
            case "TZ":
                if (b === 'TZS') {
                    network(TANZANIA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }
                break;
            case "GH":
                if (b === 'GHS') {
                    network(GHANA);
                } else {


                    $('#pay_button_wallet').attr("disabled", "disabled");
                    alert("Invalid Currency!")


                }
                break;
            default:
                $("#mno_wallet").empty();
                $("#mno_wallet").append("<option>--Network Operator--</option>");
                break;
        }

        function network(arr) {
            $("#mno_wallet").empty(); //To reset cities
            $("#mno_wallet").append("<option>--Network Operators--</option>");
            $(arr).each(function(i) { //to list cities
                $("#mno_wallet").append("<option value=" + arr[i].value + ">" + arr[i].display + "</option>");
            });
        };






    });





});
