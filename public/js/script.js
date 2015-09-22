/**
 * Created by awaseem on 15-09-16.
 */

$(document).ready(function () {
    var fileData = "";
    $("form#data").submit(function (event) {
        event.preventDefault();
        var formData = new FormData($(this)[0]);
        $(':input','#data')
            .not(':button, :submit, :reset, :hidden')
            .val('')
            .removeAttr('checked')
            .removeAttr('selected');
        $.ajax({
            url: "/api/image",
            type: "POST",
            data: {
                imageData: fileData,
                name: "test",
                description: "this is a test"
            },
            dataType: "json",
            success: function (returndata) {
                console.log(returndata);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest.responseJSON);
            }
        });
        return false;
    });

    $("input[type=file]").change(function(event) {
        $.each(event.target.files, function(index, file) {
            var reader = new FileReader();
            reader.onload = function(event) {
                fileData = event.target.result.match(/,(.*)$/)[1];
            };
            reader.readAsDataURL(file);
        });
    });

});
