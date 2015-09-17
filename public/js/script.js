/**
 * Created by awaseem on 15-09-16.
 */

$(document).ready(function () {
    $("form#data").submit(function (event) {
        event.preventDefault();
        var formData = new FormData($(this)[0]);
        $(':input','#data')
            .not(':button, :submit, :reset, :hidden')
            .val('')
            .removeAttr('checked')
            .removeAttr('selected');
        $.ajax({
            url: "api/image/test",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (returndata) {
                console.log(returndata);
            }
        });
        return false;
    });
});
