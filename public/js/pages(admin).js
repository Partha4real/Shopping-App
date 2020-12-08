
$(function() {

    // sorting pages
    $('tbody').sortable({
        items: "tr:not('.home')",
        placeholder: "ui-state-highlight",
        update: function () {
            var ids = $('tbody').sortable("serialize");
            var url = "/admin/pages/reorder-page";
    
            $.post(url,ids);
        }
    });

    // text editor
    if($('textarea#editor').length) {
        CKEDITOR.replace('editor'); 
    }

    // confirm Deletion
    $('a.confirmDelete').on('click', function() {
        if(!confirm('Confirm deletion'))
            return false;
    });

    // dropzone
    Dropzone.options.dropzoneForm = {
        acceptedFiles: "image/*",
        init: function () {
            this.on("queuecomplete", function (file) {
                setTimeout(function() {
                    location.reload()
                }, 1000);
            });
        }
    }
});
