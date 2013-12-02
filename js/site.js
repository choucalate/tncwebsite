    $(document).ready(function() {
        $.ajax({
            url:'http://demo-project.choucalate.c9.io',
            dataType: "jsonp",
            jsonpCallback: "_testcb",
            cache: false,
            timeout: 5000,
            success: function(data) {
            $(".tagline").append(data);
            console.log("poopoo");
            },
            error: function(jqXHR, textStatus, errorThrown) {
            alert('error ' + textStatus + " " + errorThrown);
            }
         });
         $.postMessage("hi");
    });