function api_call(input) {
    $.ajax({
        
	url: "http://0.0.0.0:5000/notify?lab=HAAS257&number=+10123456789",
        method: 'GET'
    });
}

$( document ).ready(function() {
    // request when clicking on the button
    $('#btn').click(function() {
        var input = $("#input").val();
        api_call(input);
        input = "";
    });
});

